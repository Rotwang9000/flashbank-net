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

	console.log("Deploying FlashBankRouter with account:", deployer.address);
	console.log("Network:", network.chainId);

	const isTestnet = ["11155111", "84532", "84531", "421614"].includes(String(network.chainId));
	const fallbackAdmin = process.env.ADMIN_ADDRESS;
	const testnetAdmin = process.env.TESTNET_ADMIN_ADDRESS;
	const adminAddress = isTestnet && ethers.isAddress(testnetAdmin)
		? testnetAdmin
		: fallbackAdmin;

	if (!adminAddress || !ethers.isAddress(adminAddress)) {
		console.error("Error: Missing admin address. Set ADMIN_ADDRESS (and TESTNET_ADMIN_ADDRESS for testnets) in .env");
		process.exit(1);
	}

	console.log("Admin address (dual-control):", adminAddress);
	console.log("Deployer:", deployer.address);
	console.log("Both signatures required for config changes and profit withdrawals");

	const Router = await ethers.getContractFactory("FlashBankRouter");
	const router = await Router.deploy(adminAddress);
	await router.waitForDeployment();

	const routerAddress = await router.getAddress();
	console.log("FlashBankRouter deployed to:", routerAddress);
	
	// Verify admin was set correctly
	const setAdmin = await router.admin();
	console.log("Verified admin:", setAdmin);

	const weth = process.env.FLASHBANK_LIQUIDITY_TOKEN || WETH_ADDRESSES[String(network.chainId)];
	if (!weth) {
		console.log("No default token for this chain. Configure manually via setTokenConfig.");
		return;
	}

	const feeBps = DEFAULT_FEE_BPS;
	const maxLoan = ethers.parseEther(DEFAULT_MAX_LOAN);
	const maxBorrowBps = DEFAULT_MAX_BORROW_BPS;
	const ownerFeeBps = DEFAULT_OWNER_FEE_BPS;
	const supportsPermit = (process.env.FLASHBANK_SUPPORTS_PERMIT || "true") === "true";

	const tx = await router.setTokenConfig(weth, {
		enabled: true,
		supportsPermit,
		feeBps,
		maxFlashLoan: maxLoan,
		wrapper: weth,
		maxBorrowBps,
		ownerFeeBps
	});
	await tx.wait();

	console.log(`Configured WETH token ${weth}:`);
	console.log(`  Fee: ${feeBps} bps (${feeBps/100}%)`);
	console.log(`  Max loan: ${DEFAULT_MAX_LOAN} tokens`);
	console.log(`  Max borrow: ${maxBorrowBps} bps (${maxBorrowBps/100}% of pool)`);
	console.log(`  Owner fee: ${ownerFeeBps} bps of fee (${(feeBps * ownerFeeBps / 10000)/100}% of loan)`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

