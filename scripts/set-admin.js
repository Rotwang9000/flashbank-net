const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
	console.log("\n=== Update FlashBankRouter Admin ===\n");

	const NEW_ADMIN = process.env.NEW_ADMIN;
	if (!NEW_ADMIN || !ethers.isAddress(NEW_ADMIN)) {
		console.error("Error: Provide NEW_ADMIN env variable with a valid address");
		console.error("Usage: NEW_ADMIN=0x... npx hardhat run scripts/set-admin.js --network sepolia");
		process.exit(1);
	}

	const [signer] = await ethers.getSigners();
	console.log("Signer:", signer.address);
	console.log("New admin:", NEW_ADMIN);

	const envPath = path.join(__dirname, "../website/.env.local");
	let ROUTER_ADDRESS;

	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, "utf8");
		const network = (await ethers.provider.getNetwork()).chainId;

		let envKey;
		if (network === 1n) envKey = "NEXT_PUBLIC_MAINNET_ROUTER_ADDRESS";
		else if (network === 8453n) envKey = "NEXT_PUBLIC_BASE_ROUTER_ADDRESS";
		else if (network === 42161n) envKey = "NEXT_PUBLIC_ARBITRUM_ROUTER_ADDRESS";
		else if (network === 11155111n) envKey = "NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS";

		if (envKey) {
			const match = envContent.match(new RegExp(`${envKey}=(.+)`));
			ROUTER_ADDRESS = match ? match[1].trim() : null;
		}
	}

	if (!ROUTER_ADDRESS) {
		console.error("Error: Router address not found. Set ROUTER_ADDRESS env or update website/.env.local.");
		process.exit(1);
	}

	console.log("Router:", ROUTER_ADDRESS);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const currentOwner = await router.owner();
	if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
		console.error("\n❌ Error: Only owner can set admin");
		console.log("Owner:", currentOwner);
		process.exit(1);
	}

	console.log("\nUpdating admin...");
	const tx = await router.setAdmin(NEW_ADMIN);
	console.log("Transaction:", tx.hash);
	const receipt = await tx.wait();
	console.log("✅ Admin updated in block:", receipt.blockNumber);

	const admin = await router.admin();
	console.log("On-chain admin:", admin);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Failed:", error.message);
		process.exit(1);
	});

