const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Transfer ownership of FlashBankRouter to a multisig/vault
 * 
 * This separates the deployer key (used in code) from the admin key (secured in vault).
 * 
 * Usage:
 *   NEW_OWNER=0x... npx hardhat run scripts/transfer-ownership.js --network sepolia
 */

async function main() {
	console.log("\n=== Transfer FlashBankRouter Ownership ===\n");

	const NEW_OWNER = process.env.NEW_OWNER;
	
	if (!NEW_OWNER || !ethers.isAddress(NEW_OWNER)) {
		console.error("Error: Please provide NEW_OWNER environment variable with a valid address");
		console.log("\nUsage:");
		console.log("  NEW_OWNER=0x... npx hardhat run scripts/transfer-ownership.js --network sepolia");
		process.exit(1);
	}

	const [deployer] = await ethers.getSigners();
	console.log("Current owner (deployer):", deployer.address);
	console.log("New owner (multisig/vault):", NEW_OWNER);

	// Read router address
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
		console.error("Error: Router address not found in .env.local");
		console.log("Please specify manually:");
		console.log("  ROUTER_ADDRESS=0x... NEW_OWNER=0x... npx hardhat run scripts/transfer-ownership.js --network sepolia");
		process.exit(1);
	}

	console.log("\nRouter:", ROUTER_ADDRESS);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);

	// Verify current owner
	const currentOwner = await router.owner();
	console.log("\nCurrent owner on-chain:", currentOwner);

	if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
		console.error("\n❌ Error: You are not the current owner!");
		console.log("Current owner:", currentOwner);
		console.log("Your address:", deployer.address);
		process.exit(1);
	}

	if (currentOwner.toLowerCase() === NEW_OWNER.toLowerCase()) {
		console.log("\n✅ Already owned by the specified address. No action needed.");
		process.exit(0);
	}

	// Confirm transfer
	console.log("\n⚠️  WARNING: This will transfer ownership of the FlashBankRouter!");
	console.log("After this transaction:");
	console.log("  • The deployer key will NO LONGER be able to:");
	console.log("    - Set token configurations");
	console.log("    - Withdraw owner profits");
	console.log("    - Change any settings");
	console.log("  • The new owner will have full control");
	console.log("\nThis is irreversible! Make sure the new owner address is correct.");
	console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...");

	await new Promise(resolve => setTimeout(resolve, 10000));

	console.log("\nTransferring ownership...");
	const tx = await router.transferOwnership(NEW_OWNER);
	console.log("Transaction hash:", tx.hash);
	
	const receipt = await tx.wait();
	console.log("✅ Ownership transferred! Block:", receipt.blockNumber);

	// Verify new owner
	const newOwner = await router.owner();
	console.log("\nNew owner on-chain:", newOwner);

	if (newOwner.toLowerCase() === NEW_OWNER.toLowerCase()) {
		console.log("\n🎉 SUCCESS! Ownership successfully transferred.");
		console.log("\n📝 Important Notes:");
		console.log("  • The deployer key can no longer modify the contract");
		console.log("  • The new owner (multisig/vault) now controls:");
		console.log("    - Token configuration (fees, limits)");
		console.log("    - Owner profit withdrawals");
		console.log("    - Future ownership transfers");
		console.log("  • Provider funds remain safe in their wallets");
	} else {
		console.log("\n❌ Something went wrong! Owner not updated correctly.");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Transfer failed:", error.message);
		process.exit(1);
	});

