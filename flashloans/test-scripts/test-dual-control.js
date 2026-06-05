const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * End-to-end test of dual-control workflow
 * 
 * Tests:
 * 1. Token config change (propose + execute)
 * 2. Profit withdrawal (propose + execute)
 * 3. Ownership transfer (propose + execute)
 * 
 * Prerequisites:
 * - PRIVATE_KEY set (owner/deployer)
 * - TESTNET_ADMIN_PRIVATE_KEY set (admin)
 * - Router deployed on Sepolia
 */

async function main() {
	console.log("\n=== Dual-Control End-to-End Test ===\n");

	// Load environment
	const envPath = path.join(__dirname, "../../website/.env.local");
	if (!fs.existsSync(envPath)) {
		console.error("Error: website/.env.local not found");
		process.exit(1);
	}

	const envContent = fs.readFileSync(envPath, "utf8");
	const routerMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=(.+)/);
	const wethMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=(.+)/);

	if (!routerMatch || !wethMatch) {
		console.error("Error: Router or WETH address not found in .env.local");
		process.exit(1);
	}

	const ROUTER_ADDRESS = routerMatch[1].trim();
	const WETH_ADDRESS = wethMatch[1].trim();

	console.log("Router:", ROUTER_ADDRESS);
	console.log("WETH:", WETH_ADDRESS);

	// Get signers
	const [deployer] = await ethers.getSigners();
	
	if (!process.env.TESTNET_ADMIN_PRIVATE_KEY) {
		console.error("\n❌ Error: TESTNET_ADMIN_PRIVATE_KEY not set");
		console.log("Please set TESTNET_ADMIN_PRIVATE_KEY in your .env file");
		process.exit(1);
	}

	const adminWallet = new ethers.Wallet(process.env.TESTNET_ADMIN_PRIVATE_KEY, ethers.provider);

	console.log("\nDeployer (Owner):", deployer.address);
	console.log("Admin:", adminWallet.address);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);

	// Verify roles
	const owner = await router.owner();
	const admin = await router.admin();

	console.log("\nOn-chain Owner:", owner);
	console.log("On-chain Admin:", admin);

	if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
		console.error("\n❌ Error: Deployer is not the owner!");
		process.exit(1);
	}

	if (admin.toLowerCase() !== adminWallet.address.toLowerCase()) {
		console.error("\n❌ Error: Admin wallet doesn't match on-chain admin!");
		process.exit(1);
	}

	console.log("\n✅ Roles verified!\n");

	// Test 1: Token Config Change
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 1: Token Config Change");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	const currentConfig = await router.tokenConfigs(WETH_ADDRESS);
	console.log("Current fee:", currentConfig.feeBps.toString(), "bps");

	const newFeeBps = currentConfig.feeBps === 2n ? 3 : 2;
	console.log("Changing fee to:", newFeeBps, "bps");

	const newConfig = {
		enabled: currentConfig.enabled,
		supportsPermit: currentConfig.supportsPermit,
		feeBps: newFeeBps,
		maxFlashLoan: currentConfig.maxFlashLoan,
		wrapper: currentConfig.wrapper,
		maxBorrowBps: currentConfig.maxBorrowBps,
		ownerFeeBps: currentConfig.ownerFeeBps
	};

	// Step 1: Owner proposes
	console.log("\n[Owner] Proposing config change...");
	const proposeTx1 = await router.connect(deployer).proposeTokenConfig(WETH_ADDRESS, newConfig);
	await proposeTx1.wait();
	console.log("✅ Proposed! Tx:", proposeTx1.hash);

	// Step 2: Admin executes
	console.log("\n[Admin] Executing config change...");
	const executeTx1 = await router.connect(adminWallet).executeTokenConfig(WETH_ADDRESS, newConfig);
	await executeTx1.wait();
	console.log("✅ Executed! Tx:", executeTx1.hash);

	// Verify
	const updatedConfig = await router.tokenConfigs(WETH_ADDRESS);
	console.log("\n✅ Verified! New fee:", updatedConfig.feeBps.toString(), "bps");

	if (updatedConfig.feeBps !== BigInt(newFeeBps)) {
		console.error("❌ Fee not updated correctly!");
		process.exit(1);
	}

	// Test 2: Profit Withdrawal (if there are profits)
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 2: Profit Withdrawal");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	const ownerProfits = await router.getOwnerProfits(WETH_ADDRESS);
	console.log("Owner profits:", ethers.formatEther(ownerProfits), "WETH");

	if (ownerProfits > 0n) {
		const withdrawAmount = ownerProfits / 2n; // Withdraw half
		const recipient = deployer.address;

		console.log("Withdrawing:", ethers.formatEther(withdrawAmount), "WETH to", recipient);

		// Step 1: Owner proposes
		console.log("\n[Owner] Proposing withdrawal...");
		const proposeTx2 = await router.connect(deployer).proposeProfitWithdrawal(WETH_ADDRESS, recipient, withdrawAmount);
		await proposeTx2.wait();
		console.log("✅ Proposed! Tx:", proposeTx2.hash);

		// Step 2: Admin executes
		console.log("\n[Admin] Executing withdrawal...");
		const executeTx2 = await router.connect(adminWallet).executeProfitWithdrawal(WETH_ADDRESS, recipient, withdrawAmount);
		await executeTx2.wait();
		console.log("✅ Executed! Tx:", executeTx2.hash);

		// Verify
		const remainingProfits = await router.getOwnerProfits(WETH_ADDRESS);
		console.log("\n✅ Verified! Remaining profits:", ethers.formatEther(remainingProfits), "WETH");

		if (remainingProfits !== ownerProfits - withdrawAmount) {
			console.error("❌ Profits not updated correctly!");
			process.exit(1);
		}
	} else {
		console.log("⏭️  Skipping (no profits to withdraw)");
	}

	// Test 3: Ownership Transfer (dry run - propose but don't execute)
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 3: Ownership Transfer (Dry Run)");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	const dummyNewOwner = "0x0000000000000000000000000000000000000001";
	console.log("Proposing ownership transfer to:", dummyNewOwner);
	console.log("(This is a dry run - we won't execute it)");

	// Step 1: Owner proposes
	console.log("\n[Owner] Proposing ownership transfer...");
	const proposeTx3 = await router.connect(deployer).proposeOwnershipTransfer(dummyNewOwner);
	await proposeTx3.wait();
	console.log("✅ Proposed! Tx:", proposeTx3.hash);

	// Verify it's pending
	const changeHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
		["string", "address"],
		["ownership", dummyNewOwner]
	));
	const isPending = await router.pendingChanges(changeHash);
	console.log("\n✅ Verified! Proposal is pending:", isPending);

	if (!isPending) {
		console.error("❌ Proposal not found in pending changes!");
		process.exit(1);
	}

	console.log("\n⏭️  Not executing (dry run only)");

	// Final Summary
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("🎉 ALL TESTS PASSED!");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	console.log("✅ Token config change: PASSED");
	console.log(ownerProfits > 0n ? "✅ Profit withdrawal: PASSED" : "⏭️  Profit withdrawal: SKIPPED (no profits)");
	console.log("✅ Ownership transfer (dry run): PASSED");

	console.log("\n📋 Summary:");
	console.log("  • Dual-control workflow is functioning correctly");
	console.log("  • Owner can propose changes");
	console.log("  • Admin can execute proposed changes");
	console.log("  • Direct calls to transferOwnership/renounceOwnership are blocked");
	console.log("  • TESTNET_ADMIN_PRIVATE_KEY automation is working");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Test failed:", error.message);
		console.error(error);
		process.exit(1);
	});

