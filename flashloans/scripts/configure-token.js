const { ethers } = require("hardhat");

const DEFAULT_FEE_BPS = Number(process.env.FLASHBANK_FEE_BPS || "2");
const DEFAULT_MAX_LOAN = process.env.FLASHBANK_MAX_LOAN || "1000";
const DEFAULT_MAX_BORROW_BPS = Number(process.env.FLASHBANK_MAX_BORROW_BPS || "5000"); // 50% of pool by default
const DEFAULT_OWNER_FEE_BPS = Number(process.env.FLASHBANK_OWNER_FEE_BPS || "200"); // 2% of the fee (0.0004% of loan)

const WETH_ADDRESSES = {
	"1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
	"8453": "0x4200000000000000000000000000000000000006",
	"42161": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
	"11155111": "0xdd13E55209Fd76AfE204dBda4007C227904f0a81"
};

async function main() {
	const [deployer] = await ethers.getSigners();
	const network = await ethers.provider.getNetwork();

	console.log("Configuring token for existing router...");
	console.log("Network:", network.chainId);
	console.log("Deployer:", deployer.address);

	const routerAddress = process.env.ROUTER_ADDRESS;
	if (!routerAddress || !ethers.isAddress(routerAddress)) {
		console.error("Error: Set ROUTER_ADDRESS environment variable");
		console.error("Usage: ROUTER_ADDRESS=0x... npx hardhat run scripts/configure-token.js --network <network>");
		process.exit(1);
	}

	console.log("Router:", routerAddress);

	const Router = await ethers.getContractFactory("FlashBankRouter");
	const router = Router.attach(routerAddress);

	// Verify it's the right contract
	try {
		const admin = await router.admin();
		console.log("Admin:", admin);
	} catch (error) {
		console.error("Error: Not a valid FlashBankRouter contract");
		process.exit(1);
	}

	const weth = process.env.FLASHBANK_LIQUIDITY_TOKEN || WETH_ADDRESSES[String(network.chainId)];
	if (!weth) {
		console.error("No default WETH for this chain. Set FLASHBANK_LIQUIDITY_TOKEN in .env");
		process.exit(1);
	}

	console.log("\nConfiguring WETH:", weth);

	const feeBps = DEFAULT_FEE_BPS;
	const maxLoan = ethers.parseEther(DEFAULT_MAX_LOAN);
	const maxBorrowBps = DEFAULT_MAX_BORROW_BPS;
	const ownerFeeBps = DEFAULT_OWNER_FEE_BPS;
	const supportsPermit = (process.env.FLASHBANK_SUPPORTS_PERMIT || "true") === "true";

	console.log("\nConfiguration:");
	console.log(`  Fee: ${feeBps} bps (${feeBps/100}%)`);
	console.log(`  Max loan: ${DEFAULT_MAX_LOAN} tokens`);
	console.log(`  Max borrow: ${maxBorrowBps} bps (${maxBorrowBps/100}% of pool)`);
	console.log(`  Owner fee: ${ownerFeeBps} bps of fee (${(feeBps * ownerFeeBps / 10000)/100}% of loan)`);
	console.log(`  Supports permit: ${supportsPermit}`);

	console.log("\nSending transaction...");
	const tx = await router.setTokenConfig(weth, {
		enabled: true,
		supportsPermit,
		feeBps,
		maxFlashLoan: maxLoan,
		wrapper: weth,
		maxBorrowBps,
		ownerFeeBps
	});

	console.log("Transaction hash:", tx.hash);
	console.log("Waiting for confirmation...");

	const receipt = await tx.wait();
	console.log("✅ Token configured! Gas used:", receipt.gasUsed.toString());

	// Verify configuration
	const config = await router.tokenConfigs(weth);
	console.log("\nVerified configuration:");
	console.log("  Enabled:", config.enabled);
	console.log("  Fee:", config.feeBps, "bps");
	console.log("  Max loan:", ethers.formatEther(config.maxFlashLoan), "tokens");
	console.log("  Max borrow:", config.maxBorrowBps, "bps");
	console.log("  Owner fee:", config.ownerFeeBps, "bps");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

