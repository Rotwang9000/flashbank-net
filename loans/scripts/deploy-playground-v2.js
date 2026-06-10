const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deploys FlashBankP2PLoanV2 (token validation + cooling-off rebate + pull-payouts) as the NEW
// Sepolia playground and seeds a spread of open offers. The freely-mintable PlaygroundTokens
// (fpUSD/fpETH) are REUSED from deployments/sepolia-playground.json so the faucet addresses people
// already have stay stable. The old v1 playground keeps running on-chain; the site/MCP simply
// point at this one.
//
// Intended for TEST NETWORKS (Sepolia) only. Everything here is play-money.
//
// Usage: npx hardhat run scripts/deploy-playground-v2.js --network sepolia

const ZERO = "0x0000000000000000000000000000000000000000";
const V1_DEPLOY_FILE = path.join(__dirname, "..", "deployments", "sepolia-playground.json");
const DEPLOY_FILE = path.join(__dirname, "..", "deployments", "sepolia-playground-v2.json");

const DAY = 24 * 60 * 60;

// Seed offers (human units; principal/fee/boost/settlementValue in fpUSD, collateral in fpETH).
// coolingOffDays 0 = "use the protocol minimum for the term"; one offer sets a LONGER window to
// show the creator-friendly override in the wild.
const SEED_OFFERS = [
	{ creatorIsLender: true,  principal: "500", collateral: "3", repaymentFee: "18", boost: "50", termDays: 30, graceDays: 2, coolingOffDays: 0, settlementValue: "1500", note: "featured · top boost · surplus returned · min cooling (1 day)" },
	{ creatorIsLender: true,  principal: "250", collateral: "2", repaymentFee: "9",  boost: "15", termDays: 14, graceDays: 1, coolingOffDays: 2, settlementValue: "0",    note: "featured · smaller boost · creator-set 2-day cooling" },
	{ creatorIsLender: true,  principal: "100", collateral: "1", repaymentFee: "5",  boost: "0",  termDays: 7,  graceDays: 1, coolingOffDays: 0, settlementValue: "500",  note: "plain lend offer · surplus returned" },
	{ creatorIsLender: false, principal: "300", collateral: "2", repaymentFee: "12", boost: "0",  termDays: 21, graceDays: 2, coolingOffDays: 0, settlementValue: "0",    note: "plain borrow request · full pledge" }
];

function readJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

async function attachTokens() {
	const v1 = readJson(V1_DEPLOY_FILE);
	if (!v1?.tokens?.fpUSD?.address || !v1?.tokens?.fpETH?.address) {
		throw new Error(`Expected existing playground tokens in ${V1_DEPLOY_FILE} — deploy-playground.js first.`);
	}
	const out = [];
	for (const [symbol, meta] of [["fpUSD", v1.tokens.fpUSD], ["fpETH", v1.tokens.fpETH]]) {
		const contract = await ethers.getContractAt("PlaygroundToken", meta.address);
		console.log(`  ${symbol.padEnd(6)} (${meta.decimals}d) -> ${meta.address} (reused)`);
		out.push({ symbol, decimals: meta.decimals, address: meta.address, contract });
	}
	return out;
}

async function main() {
	const [deployer] = await ethers.getSigners();
	const network = await ethers.provider.getNetwork();
	const chainId = Number(network.chainId);
	const balance = await ethers.provider.getBalance(deployer.address);

	console.log("=".repeat(64));
	console.log("Flashbank P2P playground V2 deploy");
	console.log("  Network chainId:", chainId);
	console.log("  Deployer:", deployer.address);
	console.log("  Balance:", ethers.formatEther(balance), "ETH");
	console.log("=".repeat(64));

	console.log("\nReusing playground tokens...");
	const [usd, eth] = await attachTokens();

	console.log("\nDeploying FlashBankP2PLoanV2 (fee recipient = deployer, 0 bps introductory)...");
	const P2P = await ethers.getContractFactory("FlashBankP2PLoanV2");
	const p2p = await P2P.deploy(deployer.address, 0);
	await p2p.waitForDeployment();
	const p2pAddress = await p2p.getAddress();
	console.log("  FlashBankP2PLoanV2 ->", p2pAddress);
	console.log("  VERSION:", await p2p.VERSION());

	const seeded = [];
	try {
		console.log("\nFunding the deployer from the faucets...");
		await (await usd.contract.faucet()).wait();
		await (await eth.contract.faucet()).wait();
		await (await usd.contract.approve(p2pAddress, ethers.MaxUint256)).wait();
		await (await eth.contract.approve(p2pAddress, ethers.MaxUint256)).wait();

		console.log("\nSeeding offers...");
		for (const o of SEED_OFFERS) {
			const params = {
				creatorIsLender: o.creatorIsLender,
				allowedTaker: ZERO,
				principalToken: usd.address,
				collateralToken: eth.address,
				principal: ethers.parseUnits(o.principal, usd.decimals),
				collateral: ethers.parseUnits(o.collateral, eth.decimals),
				repaymentFee: ethers.parseUnits(o.repaymentFee, usd.decimals),
				duration: o.termDays * DAY,
				gracePeriod: o.graceDays * DAY,
				offerExpiry: 0,
				coolingOff: o.coolingOffDays * DAY, // 0 = protocol minimum for the term
				listed: true,
				serviceFeeRecipient: ZERO,
				serviceFee: 0,
				boost: ethers.parseUnits(o.boost, usd.decimals),
				settlementValue: ethers.parseUnits(o.settlementValue, usd.decimals)
			};
			const id = Number(await p2p.loanCount());
			await (await p2p.createLoan(params)).wait();
			const stored = await p2p.getLoan(id);
			seeded.push({ id, ...o, coolingOffStored: Number(stored.coolingOff) });
			console.log(`  #${id}: ${o.note} (cooling-off normalised to ${Number(stored.coolingOff) / 3600}h)`);
		}
	} catch (err) {
		console.log("  Skipped seeding:", err.shortMessage || err.message);
	}

	const out = {
		network: "sepolia",
		chainId,
		deployer: deployer.address,
		flashBankP2PLoanV2: p2pAddress,
		contractVersion: "2.0.0",
		protocolFeeBps: 0,
		tokens: {
			[usd.symbol]: { address: usd.address, decimals: usd.decimals },
			[eth.symbol]: { address: eth.address, decimals: eth.decimals }
		},
		seededOffers: seeded.map((s) => ({ id: s.id, kind: s.creatorIsLender ? "lend" : "borrow", boost: s.boost, coolingOffStored: s.coolingOffStored, settlementValue: s.settlementValue, note: s.note })),
		deployedAt: new Date().toISOString()
	};

	fs.mkdirSync(path.dirname(DEPLOY_FILE), { recursive: true });
	fs.writeFileSync(DEPLOY_FILE, JSON.stringify(out, null, "\t") + "\n");
	console.log("\nSaved", DEPLOY_FILE);

	console.log("\n" + "=".repeat(64));
	console.log("Website env (website/.env.local) — only the P2P address changes:");
	console.log(`  NEXT_PUBLIC_SEPOLIA_P2P_LOAN_ADDRESS=${p2pAddress}`);
	console.log("\nVerify on Etherscan:");
	console.log(`  npx hardhat verify --network sepolia ${p2pAddress} ${deployer.address} 0`);
	console.log("=".repeat(64));
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
