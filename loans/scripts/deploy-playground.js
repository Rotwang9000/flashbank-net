const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deploys the FlashBankP2PLoan escrow and seeds a spread of open offers (including a couple of
// paid "boosted" ones) so the marketplace shows ranking out of the box. The freely-mintable
// PlaygroundTokens (fpUSD/fpETH) are REUSED from deployments/sepolia-playground.json when present
// so their addresses — and the faucet links people already have — stay stable across redeploys.
//
// Intended for TEST NETWORKS (Sepolia) only. Everything here is play-money.
//
// Usage: npx hardhat run scripts/deploy-playground.js --network sepolia
//   Force fresh tokens with REDEPLOY_TOKENS=1.

const ZERO = "0x0000000000000000000000000000000000000000";
const DEPLOY_FILE = path.join(__dirname, "..", "deployments", "sepolia-playground.json");

const TOKENS = [
	{ key: "fpUSD", name: "Flashbank Playground USD", symbol: "fpUSD", decimals: 6 },
	{ key: "fpETH", name: "Flashbank Playground ETH", symbol: "fpETH", decimals: 18 }
];

// Seed offers: a plain one, two paid boosts (different sizes => different ranking), and a borrow
// request. Amounts are in human units; `boost` is in the principal token (fpUSD here).
// `settlementValue` is the agreed worth of the WHOLE collateral in fpUSD, frozen at origination
// (no oracle). "0" keeps the full-forfeit pledge; a value above the debt returns the surplus to a
// defaulting borrower. We seed a mix so both behaviours are visible in the marketplace.
const SEED_OFFERS = [
	{ creatorIsLender: true,  principal: "500", collateral: "3", repaymentFee: "18", boost: "50", termDays: 30, graceDays: 2, settlementValue: "1500", note: "featured · top boost · surplus returned" },
	{ creatorIsLender: true,  principal: "250", collateral: "2", repaymentFee: "9",  boost: "15", termDays: 14, graceDays: 1, settlementValue: "0",    note: "featured · smaller boost · full pledge" },
	{ creatorIsLender: true,  principal: "100", collateral: "1", repaymentFee: "5",  boost: "0",  termDays: 7,  graceDays: 1, settlementValue: "500",  note: "plain lend offer · surplus returned" },
	{ creatorIsLender: false, principal: "300", collateral: "2", repaymentFee: "12", boost: "0",  termDays: 21, graceDays: 2, settlementValue: "0",    note: "plain borrow request · full pledge" }
];

function readExisting() {
	try {
		return JSON.parse(fs.readFileSync(DEPLOY_FILE, "utf8"));
	} catch {
		return null;
	}
}

async function deployToken(t) {
	const Factory = await ethers.getContractFactory("PlaygroundToken");
	const token = await Factory.deploy(t.name, t.symbol, t.decimals);
	await token.waitForDeployment();
	const address = await token.getAddress();
	console.log(`  ${t.symbol.padEnd(6)} (${t.decimals}d) -> ${address} (new)`);
	return { ...t, address, contract: token };
}

async function attachToken(t, address) {
	const token = await ethers.getContractAt("PlaygroundToken", address);
	console.log(`  ${t.symbol.padEnd(6)} (${t.decimals}d) -> ${address} (reused)`);
	return { ...t, address, contract: token };
}

async function resolveTokens(existing) {
	const reuse = existing?.tokens && !process.env.REDEPLOY_TOKENS;
	const out = [];
	for (const t of TOKENS) {
		const known = reuse ? existing.tokens[t.key]?.address : null;
		out.push(known ? await attachToken(t, known) : await deployToken(t));
	}
	return out;
}

async function main() {
	const [deployer] = await ethers.getSigners();
	const network = await ethers.provider.getNetwork();
	const chainId = Number(network.chainId);
	const balance = await ethers.provider.getBalance(deployer.address);

	console.log("=".repeat(64));
	console.log("Flashbank P2P playground deploy");
	console.log("  Network chainId:", chainId);
	console.log("  Deployer:", deployer.address);
	console.log("  Balance:", ethers.formatEther(balance), "ETH");
	console.log("=".repeat(64));

	const existing = readExisting();

	console.log("\nResolving playground tokens...");
	const [usd, eth] = await resolveTokens(existing);

	console.log("\nDeploying FlashBankP2PLoan (fee recipient = deployer, 0 bps introductory)...");
	const P2P = await ethers.getContractFactory("FlashBankP2PLoan");
	const p2p = await P2P.deploy(deployer.address, 0);
	await p2p.waitForDeployment();
	const p2pAddress = await p2p.getAddress();
	console.log("  FlashBankP2PLoan ->", p2pAddress);

	// Seed offers so the marketplace is populated and ranking is visible. All play-money.
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
				duration: o.termDays * 24 * 60 * 60,
				gracePeriod: o.graceDays * 24 * 60 * 60,
				offerExpiry: 0,
				listed: true, // posted "through flashbank" — interface fee applies (0 bps for now)
				serviceFeeRecipient: ZERO,
				serviceFee: 0,
				boost: ethers.parseUnits(o.boost, usd.decimals),
				// Agreed worth of the whole collateral in fpUSD (0 = full forfeit on default).
				settlementValue: ethers.parseUnits(o.settlementValue, usd.decimals)
			};
			const id = Number(await p2p.loanCount());
			await (await p2p.createLoan(params)).wait();
			seeded.push({ id, ...o });
			console.log(`  #${id}: ${o.note} (${o.creatorIsLender ? "lend" : "borrow"} ${o.principal} fpUSD / ${o.collateral} fpETH, boost ${o.boost})`);
		}
	} catch (err) {
		console.log("  Skipped seeding:", err.shortMessage || err.message);
	}

	const out = {
		network: "sepolia",
		chainId,
		deployer: deployer.address,
		flashBankP2PLoan: p2pAddress,
		protocolFeeBps: 0,
		tokens: {
			[usd.symbol]: { address: usd.address, decimals: usd.decimals },
			[eth.symbol]: { address: eth.address, decimals: eth.decimals }
		},
		seededOffers: seeded.map((s) => ({ id: s.id, kind: s.creatorIsLender ? "lend" : "borrow", boost: s.boost, settlementValue: s.settlementValue, note: s.note })),
		deployedAt: new Date().toISOString()
	};

	fs.mkdirSync(path.dirname(DEPLOY_FILE), { recursive: true });
	fs.writeFileSync(DEPLOY_FILE, JSON.stringify(out, null, "\t") + "\n");
	console.log("\nSaved", DEPLOY_FILE);

	console.log("\n" + "=".repeat(64));
	console.log("Website env (website/.env.local) — only the P2P address changed:");
	console.log(`  NEXT_PUBLIC_SEPOLIA_P2P_LOAN_ADDRESS=${p2pAddress}`);
	console.log(`  NEXT_PUBLIC_SEPOLIA_FPUSD_ADDRESS=${usd.address}`);
	console.log(`  NEXT_PUBLIC_SEPOLIA_FPETH_ADDRESS=${eth.address}`);
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
