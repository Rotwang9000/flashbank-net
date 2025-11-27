const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const TESTNET_CHAIN_IDS = new Set([11155111n, 421614n, 84532n, 84531n]);

/**
 * Dual-Control Profit Withdrawal
 * 
 * Step 1: Owner proposes withdrawal
 * Step 2: Admin executes withdrawal
 * 
 * Usage:
 *   # Propose (from deployer/owner)
 *   ACTION=propose AMOUNT=0.001 RECIPIENT=0x... npx hardhat run scripts/dual-control-withdraw.js --network sepolia
 *   
 *   # Execute (from admin)
 *   ACTION=execute AMOUNT=0.001 RECIPIENT=0x... PRIVATE_KEY=$ADMIN_KEY npx hardhat run scripts/dual-control-withdraw.js --network sepolia
 */

async function main() {
	console.log("\n=== Dual-Control Profit Withdrawal ===\n");

	const action = process.env.ACTION; // "propose" or "execute"
	const amountEth = process.env.AMOUNT;
	const recipient = process.env.RECIPIENT;

	if (!action || (action !== "propose" && action !== "execute")) {
		console.error("Error: ACTION must be 'propose' or 'execute'");
		process.exit(1);
	}

	if (!amountEth) {
		console.error("Error: AMOUNT not specified (in ETH, e.g. 0.001)");
		process.exit(1);
	}

	if (!recipient || !ethers.isAddress(recipient)) {
		console.error("Error: RECIPIENT not specified or invalid");
		process.exit(1);
	}

	const amount = ethers.parseEther(amountEth);

	const network = await ethers.provider.getNetwork();
	const signer = await resolveSigner(action, network.chainId);
	console.log("Signer:", signer.address);
	console.log("Action:", action);
	console.log("Amount:", amountEth, "ETH");
	console.log("Recipient:", recipient);

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

	console.log("\nRouter:", ROUTER_ADDRESS);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const token = process.env.TOKEN_ADDRESS || WETH_ADDRESS;

	if (!token) {
		console.error("Error: TOKEN_ADDRESS not specified");
		process.exit(1);
	}

	console.log("Token:", token);

	// Check available profits
	const ownerProfits = await router.getOwnerProfits(token);
	console.log("\nAvailable Profits:", ethers.formatEther(ownerProfits), "ETH");

	if (amount > ownerProfits) {
		console.error("\n❌ Error: Requested amount exceeds available profits");
		process.exit(1);
	}

	// Calculate change hash
	const changeHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
		["string", "address", "address", "uint256"],
		["withdraw", token, recipient, amount]
	));

	console.log("Change Hash:", changeHash);

	if (action === "propose") {
		// Step 1: Owner proposes
		const owner = await router.owner();
		if (signer.address.toLowerCase() !== owner.toLowerCase()) {
			console.error("\n❌ Error: You are not the owner!");
			console.log("Owner:", owner);
			console.log("You:", signer.address);
			process.exit(1);
		}

		console.log("\n📝 Proposing withdrawal...");
		const tx = await router.proposeProfitWithdrawal(token, recipient, amount);
		console.log("Transaction:", tx.hash);
		
		const receipt = await tx.wait();
		console.log("✅ Withdrawal proposed! Block:", receipt.blockNumber);
		
		console.log("\n📋 Next Step:");
		console.log("Admin must execute with:");
		console.log(`  ACTION=execute AMOUNT=${amountEth} RECIPIENT=${recipient} PRIVATE_KEY=$ADMIN_KEY npx hardhat run scripts/dual-control-withdraw.js --network sepolia`);
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
			console.error("\n❌ Error: This withdrawal has not been proposed by the owner!");
			console.log("Owner must propose first with ACTION=propose");
			process.exit(1);
		}

		console.log("\n✅ Withdrawal found in pending proposals");
		console.log("⚡ Executing withdrawal...");
		
		const tx = await router.executeProfitWithdrawal(token, recipient, amount);
		console.log("Transaction:", tx.hash);
		
		const receipt = await tx.wait();
		console.log("✅ Withdrawal executed! Block:", receipt.blockNumber);
		
		// Verify
		const remainingProfits = await router.getOwnerProfits(token);
		console.log("\n✅ Remaining Profits:", ethers.formatEther(remainingProfits), "ETH");
		console.log("Sent", amountEth, "ETH to", recipient);
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
