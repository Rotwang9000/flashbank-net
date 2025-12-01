const { ethers } = require("hardhat");

const WETH_ADDRESSES = {
	"1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
	"8453": "0x4200000000000000000000000000000000000006",
	"42161": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
	"11155111": "0xdd13E55209Fd76AfE204dBda4007C227904f0a81"
};

async function main() {
	const network = await ethers.provider.getNetwork();
	const routerAddress = process.env.ROUTER_ADDRESS;

	if (!routerAddress || !ethers.isAddress(routerAddress)) {
		console.error("Error: Set ROUTER_ADDRESS environment variable");
		process.exit(1);
	}

	console.log("Verifying router configuration...");
	console.log("Network:", network.chainId);
	console.log("Router:", routerAddress);

	const Router = await ethers.getContractFactory("FlashBankRouter");
	const router = Router.attach(routerAddress);

	const admin = await router.admin();
	const owner = await router.owner();
	console.log("\nRoles:");
	console.log("  Owner:", owner);
	console.log("  Admin:", admin);

	const weth = WETH_ADDRESSES[String(network.chainId)];
	console.log("\nWETH:", weth);

	const config = await router.tokenConfigs(weth);
	console.log("\nToken Configuration:");
	console.log("  Enabled:", config.enabled);
	console.log("  Supports Permit:", config.supportsPermit);
	console.log("  Fee:", config.feeBps.toString(), "bps");
	console.log("  Max loan:", ethers.formatEther(config.maxFlashLoan), "tokens");
	console.log("  Wrapper:", config.wrapper);
	console.log("  Max borrow:", config.maxBorrowBps.toString(), "bps");
	console.log("  Owner fee:", config.ownerFeeBps.toString(), "bps");

	if (config.enabled) {
		console.log("\n✅ Router is configured and ready!");
	} else {
		console.log("\n⚠️  Router deployed but token not enabled");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

