const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const TESTNET_CHAIN_IDS = new Set([11155111n, 421614n, 84532n, 84531n]);

/**
 * Dual-Control Configuration Change
 * 
 * Step 1: Owner proposes change
 * Step 2: Admin executes change
 * 
 * Usage:
 *   # Propose (from deployer/owner)
 *   ACTION=propose FEE_BPS=3 npx hardhat run scripts/dual-control-config.js --network sepolia
 *   
 *   # Execute (from admin)
 *   ACTION=execute FEE_BPS=3 PRIVATE_KEY=$ADMIN_KEY npx hardhat run scripts/dual-control-config.js --network sepolia
 */

async function main() {
	console.log("\n=== Dual-Control Configuration Change ===\n");

	const action = process.env.ACTION; // "propose" or "execute"
	const feeBps = process.env.FEE_BPS ? Number(process.env.FEE_BPS) : null;
	const maxBorrowBps = process.env.MAX_BORROW_BPS ? Number(process.env.MAX_BORROW_BPS) : null;
	const ownerFeeBps = process.env.OWNER_FEE_BPS ? Number(process.env.OWNER_FEE_BPS) : null;
	const enabled = process.env.ENABLED !== undefined ? process.env.ENABLED === "true" : null;

	if (!action || (action !== "propose" && action !== "execute")) {
		console.error("Error: ACTION must be 'propose' or 'execute'");
		process.exit(1);
	}

	const network = await ethers.provider.getNetwork();
	const signer = await resolveSigner(action, network.chainId);
	console.log("Signer:", signer.address);
	console.log("Action:", action);

	// Read router address
	const envPath = path.join(__dirname, "../website/.env.local");
	let ROUTER_ADDRESS, WETH_ADDRESS;
	
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, "utf8");
		
		let routerKey, wethKey;
		if (network.chainId === 1n) {
			routerKey = "NEXT_PUBLIC_MAINNET_ROUTER_ADDRESS";
			wethKey = "NEXT_PUBLIC_MAINNET_WETH_ADDRESS";
		} else if (network.chainId === 11155111n) {
			routerKey = "NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS";
			wethKey = "NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS";
		}
		
		if (routerKey) {
			const routerMatch = envContent.match(new RegExp(`${routerKey}=(.+)`));
			const wethMatch = envContent.match(new RegExp(`${wethKey}=(.+)`));
			ROUTER_ADDRESS = routerMatch ? routerMatch[1].trim() : null;
			WETH_ADDRESS = wethMatch ? wethMatch[1].trim() : null;
		}
	}

	if (!ROUTER_ADDRESS) {
		console.error("Error: Router address not found");
		process.exit(1);
	}

	console.log("Router:", ROUTER_ADDRESS);
	console.log("Token:", WETH_ADDRESS || "(specify with TOKEN_ADDRESS env var)");

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const token = process.env.TOKEN_ADDRESS || WETH_ADDRESS;

	if (!token) {
		console.error("Error: TOKEN_ADDRESS not specified");
		process.exit(1);
	}

	// Get current config
	const currentConfig = await router.tokenConfigs(token);
	console.log("\nCurrent Config:");
	console.log("  Enabled:", currentConfig.enabled);
	console.log("  Fee:", currentConfig.feeBps.toString(), "bps");
	console.log("  Max Borrow:", currentConfig.maxBorrowBps.toString(), "bps");
	console.log("  Owner Fee:", currentConfig.ownerFeeBps.toString(), "bps");

	// Build new config
	const newConfig = {
		enabled: enabled !== null ? enabled : currentConfig.enabled,
		supportsPermit: currentConfig.supportsPermit,
		feeBps: feeBps !== null ? feeBps : Number(currentConfig.feeBps),
		maxFlashLoan: currentConfig.maxFlashLoan,
		wrapper: currentConfig.wrapper,
		maxBorrowBps: maxBorrowBps !== null ? maxBorrowBps : Number(currentConfig.maxBorrowBps),
		ownerFeeBps: ownerFeeBps !== null ? ownerFeeBps : Number(currentConfig.ownerFeeBps)
	};

	console.log("\nProposed Config:");
	console.log("  Enabled:", newConfig.enabled);
	console.log("  Fee:", newConfig.feeBps, "bps");
	console.log("  Max Borrow:", newConfig.maxBorrowBps, "bps");
	console.log("  Owner Fee:", newConfig.ownerFeeBps, "bps");

	// Calculate change hash
	const changeHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
		["address", "tuple(bool,bool,uint16,uint256,address,uint16,uint16)"],
		[token, [
			newConfig.enabled,
			newConfig.supportsPermit,
			newConfig.feeBps,
			newConfig.maxFlashLoan,
			newConfig.wrapper,
			newConfig.maxBorrowBps,
			newConfig.ownerFeeBps
		]]
	));

	console.log("\nChange Hash:", changeHash);

	if (action === "propose") {
		// Step 1: Owner proposes
		const owner = await router.owner();
		if (signer.address.toLowerCase() !== owner.toLowerCase()) {
			console.error("\n❌ Error: You are not the owner!");
			console.log("Owner:", owner);
			console.log("You:", signer.address);
			process.exit(1);
		}

		console.log("\n📝 Proposing change...");
		const tx = await router.proposeTokenConfig(token, newConfig);
		console.log("Transaction:", tx.hash);
		
		const receipt = await tx.wait();
		console.log("✅ Change proposed! Block:", receipt.blockNumber);
		
		console.log("\n📋 Next Step:");
		console.log("Admin must execute with:");
		console.log(`  ACTION=execute FEE_BPS=${newConfig.feeBps} MAX_BORROW_BPS=${newConfig.maxBorrowBps} OWNER_FEE_BPS=${newConfig.ownerFeeBps} ENABLED=${newConfig.enabled} PRIVATE_KEY=$ADMIN_KEY npx hardhat run scripts/dual-control-config.js --network sepolia`);
	} else {
		// Step 2: Admin executes
		const admin = await router.admin();
		if (signer.address.toLowerCase() !== admin.toLowerCase()) {
			console.error("\n❌ Error: You are not the admin!");
			console.log("Admin:", admin);
			console.log("You:", signer.address);
			process.exit(1);
		}

		// Check if proposed
		const isPending = await router.pendingChanges(changeHash);
		if (!isPending) {
			console.error("\n❌ Error: This change has not been proposed by the owner!");
			console.log("Owner must propose first with ACTION=propose");
			process.exit(1);
		}

		console.log("\n✅ Change found in pending proposals");
		console.log("⚡ Executing change...");
		
		const tx = await router.executeTokenConfig(token, newConfig);
		console.log("Transaction:", tx.hash);
		
		const receipt = await tx.wait();
		console.log("✅ Change executed! Block:", receipt.blockNumber);
		
		// Verify
		const updatedConfig = await router.tokenConfigs(token);
		console.log("\n✅ Verified New Config:");
		console.log("  Enabled:", updatedConfig.enabled);
		console.log("  Fee:", updatedConfig.feeBps.toString(), "bps");
		console.log("  Max Borrow:", updatedConfig.maxBorrowBps.toString(), "bps");
		console.log("  Owner Fee:", updatedConfig.ownerFeeBps.toString(), "bps");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Failed:", error.message);
		process.exit(1);
	});

async function resolveSigner(action, chainId) {
	const isTestnetExecute = action === "execute" && TESTNET_CHAIN_IDS.has(chainId) && process.env.TESTNET_ADMIN_PRIVATE_KEY;
	if (isTestnetExecute) {
		console.log("Using TESTNET_ADMIN_PRIVATE_KEY for admin execution");
		return new ethers.Wallet(process.env.TESTNET_ADMIN_PRIVATE_KEY, ethers.provider);
	}
	const [signer] = await ethers.getSigners();
	return signer;
}
