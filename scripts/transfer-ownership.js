const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const TESTNET_CHAIN_IDS = new Set([11155111n, 421614n, 84532n, 84531n]);

/**
 * Dual-control ownership transfer helper.
 *
 * Usage:
 *   ACTION=propose NEW_OWNER=0x... npx hardhat run scripts/transfer-ownership.js --network sepolia
 *   ACTION=execute NEW_OWNER=0x... PRIVATE_KEY=$ADMIN_KEY npx hardhat run scripts/transfer-ownership.js --network sepolia
 */
async function main() {
	console.log("\n=== Dual-Control Ownership Transfer ===\n");

	const action = process.env.ACTION;
	const NEW_OWNER = process.env.NEW_OWNER;

	if (!action || (action !== "propose" && action !== "execute")) {
		console.error("Error: ACTION must be 'propose' or 'execute'");
		process.exit(1);
	}

	if (!NEW_OWNER || !ethers.isAddress(NEW_OWNER)) {
		console.error("Error: Please provide NEW_OWNER environment variable with a valid address");
		console.log("\nUsage:");
		console.log("  ACTION=propose NEW_OWNER=0x... npx hardhat run scripts/transfer-ownership.js --network sepolia");
		process.exit(1);
	}

	const network = await ethers.provider.getNetwork();
	const signer = await resolveSigner(action, network.chainId);
	console.log("Signer:", signer.address);
	console.log("Action:", action);
	console.log("Target owner:", NEW_OWNER);

	// Read router address
	const envPath = path.join(__dirname, "../website/.env.local");
	let ROUTER_ADDRESS;
	
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, "utf8");
		
		let envKey;
		if (network.chainId === 1n) envKey = "NEXT_PUBLIC_MAINNET_ROUTER_ADDRESS";
		else if (network.chainId === 8453n) envKey = "NEXT_PUBLIC_BASE_ROUTER_ADDRESS";
		else if (network.chainId === 42161n) envKey = "NEXT_PUBLIC_ARBITRUM_ROUTER_ADDRESS";
		else if (network.chainId === 11155111n) envKey = "NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS";
		
		if (envKey) {
			const match = envContent.match(new RegExp(`${envKey}=(.+)`));
			ROUTER_ADDRESS = match ? match[1].trim() : null;
		}
	}

	if (!ROUTER_ADDRESS) {
		console.error("Error: Router address not found in .env.local");
		console.log("Please specify manually:");
		console.log("  ROUTER_ADDRESS=0x... ACTION=propose NEW_OWNER=0x... npx hardhat run scripts/transfer-ownership.js --network sepolia");
		process.exit(1);
	}

	console.log("\nRouter:", ROUTER_ADDRESS);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);

	if (action === "propose") {
		const owner = await router.owner();
		if (signer.address.toLowerCase() !== owner.toLowerCase()) {
			console.error("\n❌ Error: You are not the owner!");
			console.log("Owner:", owner);
			console.log("You:", signer.address);
			process.exit(1);
		}

		if (owner.toLowerCase() === NEW_OWNER.toLowerCase()) {
			console.log("\n✅ Already owned by the specified address. No action needed.");
			return;
		}

		console.log("\n📝 Proposing ownership transfer...");
		const tx = await router.proposeOwnershipTransfer(NEW_OWNER);
		console.log("Transaction hash:", tx.hash);
		const receipt = await tx.wait();
		console.log("✅ Proposal submitted in block:", receipt.blockNumber);
		console.log("\n📋 Next step: Admin must execute with");
		console.log(`  ACTION=execute NEW_OWNER=${NEW_OWNER} PRIVATE_KEY=$ADMIN_KEY npx hardhat run scripts/transfer-ownership.js --network sepolia`);
	} else {
		const admin = await router.admin();
		if (signer.address.toLowerCase() !== admin.toLowerCase()) {
			console.error("\n❌ Error: You are not the admin!");
			console.log("Admin:", admin);
			console.log("You:", signer.address);
			process.exit(1);
		}

		const changeHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
			["string", "address"],
			["ownership", NEW_OWNER]
		));
		const pending = await router.pendingChanges(changeHash);
		if (!pending) {
			console.error("\n❌ Error: Ownership change not proposed or already executed.");
			process.exit(1);
		}

		console.log("\n⚡ Executing ownership transfer...");
		const tx = await router.executeOwnershipTransfer(NEW_OWNER);
		console.log("Transaction hash:", tx.hash);
		const receipt = await tx.wait();
		console.log("✅ Ownership transferred in block:", receipt.blockNumber);

		const newOwner = await router.owner();
		console.log("\nNew owner on-chain:", newOwner);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Transfer failed:", error.message);
		process.exit(1);
	});

async function resolveSigner(action, chainId) {
	const useTestnetAdmin = action === "execute" && TESTNET_CHAIN_IDS.has(chainId) && process.env.TESTNET_ADMIN_PRIVATE_KEY;
	if (useTestnetAdmin) {
		console.log("Using TESTNET_ADMIN_PRIVATE_KEY for admin execution");
		return new ethers.Wallet(process.env.TESTNET_ADMIN_PRIVATE_KEY, ethers.provider);
	}
	const [signer] = await ethers.getSigners();
	return signer;
}
