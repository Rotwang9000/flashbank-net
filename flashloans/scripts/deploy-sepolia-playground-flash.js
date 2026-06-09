const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// One-shot (re)deploy of the SEPOLIA flash-loan playground on FlashBankRouterV3.
//
// Why this is separate from deploy-router-v3.js: the mainnet routers bootstrap a single WETH
// config and lean on the dual-sig + 2-day timelock for any later token. That timelock is exactly
// what makes it impractical to *add* a freely-mintable play token to a live router quickly — so on
// the disposable testnet we configure both WETH and fpETH at construction instead. fpETH is our own
// PlaygroundToken (faucet()), which lets visitors commit and borrow huge numbers for free.
//
// This script: deploys the router (admin = deployer, so the single playground operator can iterate
// without a second signer), mints + seeds an fpETH pool and re-seeds the small WETH pool, redeploys
// the WETH demo borrower against the new router, then writes the deployment record + verify args.
//
//   npx hardhat run scripts/deploy-sepolia-playground-flash.js --network sepolia

const CHAIN_ID = "11155111";

// Known Sepolia playground addresses (public testnet — not secrets).
const WETH = "0xdd13E55209Fd76AfE204dBda4007C227904f0a81";
const FPETH = "0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5";
// Shared demo helpers reused across redeploys so their addresses stay stable.
const PROOF_SINK = process.env.PROOF_SINK_ADDRESS || "0x0cE5514Cf655ce859B1FdDb412FaFcb3Fb921169";
const DEMO_COUNTER = process.env.DEMO_COUNTER_ADDRESS || "0x1E202CD9a97392f6E74F70dc29b5404A00eD8561";

// Pool sizing — deliberately large so the UI shows "big numbers" on a free token.
const FPETH_MINT_TARGET = ethers.parseEther("10000000"); // top the deployer up to ~10M fpETH
const FPETH_COMMIT = ethers.parseEther("5000000");       // commit 5M fpETH (=> 2.5M borrowable at 50%)
const FPETH_MAX_LOAN = ethers.parseEther("10000000");
const WETH_MAX_LOAN = ethers.parseEther("1000");

const FEE_BPS = 2;          // 0.02% flash-loan fee
const MAX_BORROW_BPS = 5000; // 50% of the committed pool per loan
const OWNER_FEE_BPS = 200;   // 2% of the fee to the protocol (well under the 20% cap)

// fpETH (PlaygroundToken) lives in the `loans` project, so we talk to both tokens through a minimal
// inline ABI rather than depending on a cross-project artifact. mint() exists only on PlaygroundToken.
const TOKEN_ABI = [
	"function mint(address to, uint256 amount) external",
	"function approve(address spender, uint256 amount) external returns (bool)",
	"function balanceOf(address) external view returns (uint256)",
];

function cfg(overrides) {
	return {
		enabled: true,
		supportsPermit: false,
		feeBps: FEE_BPS,
		maxFlashLoan: 0n,
		wrapper: WETH,
		maxBorrowBps: MAX_BORROW_BPS,
		ownerFeeBps: OWNER_FEE_BPS,
		...overrides,
	};
}

function serialiseConfig(c) {
	return {
		enabled: c.enabled,
		supportsPermit: c.supportsPermit,
		feeBps: c.feeBps,
		maxFlashLoan: c.maxFlashLoan.toString(),
		wrapper: c.wrapper,
		maxBorrowBps: c.maxBorrowBps,
		ownerFeeBps: c.ownerFeeBps,
	};
}

async function main() {
	const [deployer] = await ethers.getSigners();
	const network = await ethers.provider.getNetwork();
	if (String(network.chainId) !== CHAIN_ID) {
		throw new Error(`This script is Sepolia-only (got chainId ${network.chainId}).`);
	}
	const balance = await ethers.provider.getBalance(deployer.address);
	console.log("=".repeat(64));
	console.log("Sepolia flash-loan playground (WETH + fpETH) on FlashBankRouterV3");
	console.log("  Deployer/admin:", deployer.address);
	console.log("  Balance:", ethers.formatEther(balance), "ETH");
	console.log("=".repeat(64));

	// WETH supports the canonical permit; fpETH (PlaygroundToken) does not.
	const tokens = [WETH, FPETH];
	const configs = [
		cfg({ supportsPermit: true, maxFlashLoan: WETH_MAX_LOAN }),
		cfg({ supportsPermit: false, maxFlashLoan: FPETH_MAX_LOAN }),
	];

	console.log("\nDeploying FlashBankRouterV3 (admin = deployer for single-operator playground)...");
	const Router = await ethers.getContractFactory("FlashBankRouterV3");
	const router = await Router.deploy(deployer.address, tokens, configs);
	await router.waitForDeployment();
	const routerAddress = await router.getAddress();
	console.log("  Router ->", routerAddress);
	console.log("  VERSION:", await router.VERSION());
	console.log("  admin():", await router.admin());

	// --- Seed the fpETH pool (mint up to target, approve exactly the commit, set commitment) ---
	console.log("\nSeeding fpETH pool...");
	const fpeth = new ethers.Contract(FPETH, TOKEN_ABI, deployer);
	const haveFp = await fpeth.balanceOf(deployer.address);
	if (haveFp < FPETH_MINT_TARGET) {
		const mintAmt = FPETH_MINT_TARGET - haveFp;
		console.log(`  Minting ${ethers.formatEther(mintAmt)} fpETH (-> ~${ethers.formatEther(FPETH_MINT_TARGET)} total)...`);
		await (await fpeth.mint(deployer.address, mintAmt)).wait();
	}
	await (await fpeth.approve(routerAddress, FPETH_COMMIT)).wait();
	await (await router.setCommitment(FPETH, FPETH_COMMIT, 0, false)).wait();
	console.log(`  Committed ${ethers.formatEther(FPETH_COMMIT)} fpETH (borrowable up to ${ethers.formatEther(FPETH_COMMIT / 2n)} at 50%).`);

	// --- Re-seed the small WETH pool from whatever WETH the deployer already holds ---
	console.log("\nSeeding WETH pool...");
	const weth = new ethers.Contract(WETH, TOKEN_ABI, deployer); // only approve/balanceOf are used here
	const haveWeth = await weth.balanceOf(deployer.address);
	if (haveWeth > 0n) {
		await (await weth.approve(routerAddress, haveWeth)).wait();
		await (await router.setCommitment(WETH, haveWeth, 0, false)).wait();
		console.log(`  Committed ${ethers.formatEther(haveWeth)} WETH.`);
	} else {
		console.log("  Deployer holds no WETH — skipping WETH seed (wrap some and setCommitment to enable the WETH demo).");
	}

	// --- Redeploy the WETH demo borrower against the new router (native-ETH demo) ---
	console.log("\nDeploying WETH DemoFlashBorrower against the new router...");
	const Demo = await ethers.getContractFactory("DemoFlashBorrower");
	const demo = await Demo.deploy(routerAddress, WETH, PROOF_SINK, DEMO_COUNTER);
	await demo.waitForDeployment();
	const demoAddress = await demo.getAddress();
	console.log("  WETH demo borrower ->", demoAddress);

	// --- Persist the deployment record + verify args ---
	const record = {
		contract: "FlashBankRouterV3",
		network: "sepolia",
		chainId: CHAIN_ID,
		address: routerAddress,
		admin: deployer.address,
		owner: deployer.address,
		weth: WETH,
		fpeth: FPETH,
		demoBorrower: demoAddress,
		proofSink: PROOF_SINK,
		demoCounter: DEMO_COUNTER,
		tokens: {
			WETH: { address: WETH, committed: haveWeth.toString(), maxFlashLoan: WETH_MAX_LOAN.toString(), supportsPermit: true },
			fpETH: { address: FPETH, committed: FPETH_COMMIT.toString(), maxFlashLoan: FPETH_MAX_LOAN.toString(), supportsPermit: false },
		},
		feeBps: FEE_BPS,
		maxBorrowBps: MAX_BORROW_BPS,
		ownerFeeBps: OWNER_FEE_BPS,
		uiDefault: true,
		note: "Sepolia playground router with both WETH and fpETH enabled at construction. admin = deployer (single operator). fpETH is a freely-mintable PlaygroundToken so visitors can faucet + commit big numbers. The native-ETH demo borrower runs on WETH; fpETH is for the faucet + provider-commit flow.",
		deployedAt: new Date().toISOString(),
	};
	const recordPath = path.join(__dirname, "..", "deployments", "sepolia-v3.json");
	fs.mkdirSync(path.dirname(recordPath), { recursive: true });
	fs.writeFileSync(recordPath, JSON.stringify(record, null, "\t") + "\n");
	console.log("\nSaved", recordPath);

	const argsPath = path.join(__dirname, `verify-args-v3-${CHAIN_ID}.js`);
	const argsModule = `// Auto-generated by deploy-sepolia-playground-flash.js for chainId ${CHAIN_ID}.\n` +
		`module.exports = ${JSON.stringify([deployer.address, tokens, configs.map(serialiseConfig)], null, 2)};\n`;
	fs.writeFileSync(argsPath, argsModule);

	console.log("\n" + "=".repeat(64));
	console.log("Website env (website/.env.local):");
	console.log(`  NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=${routerAddress}`);
	console.log(`  NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS=${demoAddress}`);
	console.log("\nVerify:");
	console.log(`  npx hardhat verify --network sepolia --constructor-args ${path.relative(process.cwd(), argsPath)} ${routerAddress}`);
	console.log("=".repeat(64));
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
