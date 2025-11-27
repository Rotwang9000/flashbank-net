const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Negative tests for dual-control workflow
 * 
 * Tests that security restrictions work:
 * 1. Admin cannot execute without proposal
 * 2. Non-owner cannot propose
 * 3. Non-admin cannot execute
 * 4. Direct transferOwnership/renounceOwnership blocked
 * 5. Cannot withdraw more profits than available
 * 6. Generate profits via demo and test withdrawal restrictions
 */

async function main() {
	console.log("\n=== Dual-Control Negative Tests ===\n");

	// Load environment
	const envPath = path.join(__dirname, "../website/.env.local");
	if (!fs.existsSync(envPath)) {
		console.error("Error: website/.env.local not found");
		process.exit(1);
	}

	const envContent = fs.readFileSync(envPath, "utf8");
	const routerMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=(.+)/);
	const wethMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=(.+)/);
	const demoBorrowerMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS=(.+)/);

	if (!routerMatch || !wethMatch) {
		console.error("Error: Router or WETH address not found in .env.local");
		process.exit(1);
	}

	const ROUTER_ADDRESS = routerMatch[1].trim();
	const WETH_ADDRESS = wethMatch[1].trim();
	const DEMO_BORROWER_ADDRESS = demoBorrowerMatch ? demoBorrowerMatch[1].trim() : null;

	console.log("Router:", ROUTER_ADDRESS);
	console.log("WETH:", WETH_ADDRESS);
	if (DEMO_BORROWER_ADDRESS) {
		console.log("Demo Borrower:", DEMO_BORROWER_ADDRESS);
	}

	// Get signers
	const [deployer] = await ethers.getSigners();
	
	if (!process.env.TESTNET_ADMIN_PRIVATE_KEY) {
		console.error("\n❌ Error: TESTNET_ADMIN_PRIVATE_KEY not set");
		process.exit(1);
	}

	const adminWallet = new ethers.Wallet(process.env.TESTNET_ADMIN_PRIVATE_KEY, ethers.provider);

	// Get test wallets (non-privileged)
	const testWallet1 = process.env.TEST_PRIVATE_KEY_1 
		? new ethers.Wallet(process.env.TEST_PRIVATE_KEY_1, ethers.provider)
		: null;
	const testWallet2 = process.env.TEST_PRIVATE_KEY_2
		? new ethers.Wallet(process.env.TEST_PRIVATE_KEY_2, ethers.provider)
		: null;

	console.log("\nDeployer (Owner):", deployer.address);
	console.log("Admin:", adminWallet.address);
	if (testWallet1) console.log("Test Wallet 1:", testWallet1.address);
	if (testWallet2) console.log("Test Wallet 2:", testWallet2.address);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const weth = await ethers.getContractAt("IERC20", WETH_ADDRESS);

	let testsPassed = 0;
	let testsFailed = 0;

	// Helper to expect revert
	async function expectRevert(promise, testName) {
		try {
			await promise;
			console.log(`❌ ${testName}: FAILED (should have reverted)`);
			testsFailed++;
			return false;
		} catch (error) {
			console.log(`✅ ${testName}: PASSED (reverted as expected)`);
			console.log(`   Reason: ${error.message.split('\n')[0]}`);
			testsPassed++;
			return true;
		}
	}

	// Test 1: Generate some profits via demo flash loans
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("SETUP: Generate Profits via Demo");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	if (DEMO_BORROWER_ADDRESS && testWallet1 && testWallet2) {
		console.log("Setting up providers with WETH...");

		// Check if test wallets have WETH
		const balance1 = await weth.balanceOf(testWallet1.address);
		const balance2 = await weth.balanceOf(testWallet2.address);

		console.log("Test Wallet 1 WETH:", ethers.formatEther(balance1));
		console.log("Test Wallet 2 WETH:", ethers.formatEther(balance2));

		if (balance1 > ethers.parseEther("0.01") && balance2 > ethers.parseEther("0.01")) {
			// Approve router
			console.log("\nApproving router...");
			const approveTx1 = await weth.connect(testWallet1).approve(ROUTER_ADDRESS, ethers.MaxUint256);
			await approveTx1.wait();
			const approveTx2 = await weth.connect(testWallet2).approve(ROUTER_ADDRESS, ethers.MaxUint256);
			await approveTx2.wait();
			console.log("✅ Approved");

			// Set unlimited commitments
			console.log("\nSetting unlimited commitments...");
			const commitTx1 = await router.connect(testWallet1).setCommitment(WETH_ADDRESS, ethers.MaxUint256, 0, false);
			await commitTx1.wait();
			const commitTx2 = await router.connect(testWallet2).setCommitment(WETH_ADDRESS, ethers.MaxUint256, 0, false);
			await commitTx2.wait();
			console.log("✅ Commitments set");

			// Run demo flash loan
			console.log("\nRunning demo flash loan to generate profits...");
			const demoBorrower = await ethers.getContractAt("DemoFlashBorrower", DEMO_BORROWER_ADDRESS);
			const loanAmount = ethers.parseEther("0.01");
			const fee = await router.quoteFee(WETH_ADDRESS, loanAmount);
			console.log("Loan amount:", ethers.formatEther(loanAmount), "WETH");
			console.log("Fee required:", ethers.formatEther(fee), "ETH");
			const demoTx = await demoBorrower.runDemo(loanAmount, { value: fee });
			await demoTx.wait();
			console.log("✅ Demo completed! Tx:", demoTx.hash);

			// Check profits
			const ownerProfits = await router.getOwnerProfits(WETH_ADDRESS);
			console.log("\n💰 Owner profits generated:", ethers.formatEther(ownerProfits), "WETH");

			if (ownerProfits === 0n) {
				console.log("⚠️  Warning: No profits generated. Owner fee might be 0.");
			}
		} else {
			console.log("⏭️  Skipping profit generation (test wallets need WETH)");
		}
	} else {
		console.log("⏭️  Skipping profit generation (demo not configured or test keys missing)");
	}

	// Test 2: Admin tries to execute without proposal
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 1: Admin Execute Without Proposal");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	const currentConfig = await router.tokenConfigs(WETH_ADDRESS);
	const testConfig = {
		enabled: currentConfig.enabled,
		supportsPermit: currentConfig.supportsPermit,
		feeBps: 5, // Different from current
		maxFlashLoan: currentConfig.maxFlashLoan,
		wrapper: currentConfig.wrapper,
		maxBorrowBps: currentConfig.maxBorrowBps,
		ownerFeeBps: currentConfig.ownerFeeBps
	};

	await expectRevert(
		router.connect(adminWallet).executeTokenConfig(WETH_ADDRESS, testConfig),
		"Admin executes config without proposal"
	);

	// Test 3: Non-owner tries to propose
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 2: Non-Owner Tries to Propose");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	if (testWallet1) {
		await expectRevert(
			router.connect(testWallet1).proposeTokenConfig(WETH_ADDRESS, testConfig),
			"Non-owner proposes config change"
		);
	} else {
		console.log("⏭️  Skipping (no test wallet available)");
	}

	// Test 4: Non-admin tries to execute (after valid proposal)
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 3: Non-Admin Tries to Execute");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	// First, owner proposes
	console.log("Owner proposing config change...");
	const proposeTx = await router.connect(deployer).proposeTokenConfig(WETH_ADDRESS, testConfig);
	await proposeTx.wait();
	console.log("✅ Proposed");

	// Now non-admin tries to execute
	if (testWallet1) {
		await expectRevert(
			router.connect(testWallet1).executeTokenConfig(WETH_ADDRESS, testConfig),
			"Non-admin executes config change"
		);
	} else {
		console.log("⏭️  Skipping (no test wallet available)");
	}

	// Clean up - admin executes the proposal
	console.log("\nCleaning up - admin executing proposal...");
	const cleanupTx = await router.connect(adminWallet).executeTokenConfig(WETH_ADDRESS, testConfig);
	await cleanupTx.wait();
	console.log("✅ Cleaned up");

	// Test 5: Direct transferOwnership blocked
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 4: Direct transferOwnership Blocked");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	await expectRevert(
		router.connect(deployer).transferOwnership(testWallet1 ? testWallet1.address : adminWallet.address),
		"Owner calls transferOwnership directly"
	);

	// Test 6: Direct renounceOwnership blocked
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 5: Direct renounceOwnership Blocked");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	await expectRevert(
		router.connect(deployer).renounceOwnership(),
		"Owner calls renounceOwnership directly"
	);

	// Test 7: Profit withdrawal restrictions
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 6: Profit Withdrawal Restrictions");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	const ownerProfits = await router.getOwnerProfits(WETH_ADDRESS);
	console.log("Current owner profits:", ethers.formatEther(ownerProfits), "WETH");

	if (ownerProfits > 0n) {
		// Try to withdraw more than available
		const excessAmount = ownerProfits + ethers.parseEther("1");
		await expectRevert(
			router.connect(deployer).proposeProfitWithdrawal(WETH_ADDRESS, deployer.address, excessAmount),
			"Owner proposes withdrawal exceeding profits"
		);

		// Non-owner tries to propose withdrawal
		if (testWallet1) {
			await expectRevert(
				router.connect(testWallet1).proposeProfitWithdrawal(WETH_ADDRESS, testWallet1.address, ownerProfits / 2n),
				"Non-owner proposes profit withdrawal"
			);
		}

		// Owner proposes valid withdrawal
		console.log("\nOwner proposing valid withdrawal...");
		const withdrawAmount = ownerProfits / 2n;
		const proposeTx2 = await router.connect(deployer).proposeProfitWithdrawal(WETH_ADDRESS, deployer.address, withdrawAmount);
		await proposeTx2.wait();
		console.log("✅ Proposed");

		// Non-admin tries to execute
		if (testWallet1) {
			await expectRevert(
				router.connect(testWallet1).executeProfitWithdrawal(WETH_ADDRESS, deployer.address, withdrawAmount),
				"Non-admin executes profit withdrawal"
			);
		}

		// Clean up - admin executes
		console.log("\nCleaning up - admin executing withdrawal...");
		const cleanupTx2 = await router.connect(adminWallet).executeProfitWithdrawal(WETH_ADDRESS, deployer.address, withdrawAmount);
		await cleanupTx2.wait();
		console.log("✅ Cleaned up");
	} else {
		console.log("⏭️  Skipping profit withdrawal tests (no profits available)");
	}

	// Test 8: Admin change restrictions
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 7: Admin Change Restrictions");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	// Non-owner tries to change admin
	if (testWallet1) {
		await expectRevert(
			router.connect(testWallet1).setAdmin(testWallet1.address),
			"Non-owner changes admin"
		);
	}

	// Admin tries to change admin (should fail - only owner can)
	await expectRevert(
		router.connect(adminWallet).setAdmin(testWallet1 ? testWallet1.address : deployer.address),
		"Admin changes admin"
	);

	// Test 9: Rescue function restrictions
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("TEST 8: Rescue Function Restrictions");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	// Non-owner tries to propose rescue
	if (testWallet1) {
		await expectRevert(
			router.connect(testWallet1).proposeRescueToken(WETH_ADDRESS, testWallet1.address, ethers.parseEther("0.001")),
			"Non-owner proposes token rescue"
		);
	}

	// Admin tries to execute rescue without proposal
	await expectRevert(
		router.connect(adminWallet).executeRescueToken(WETH_ADDRESS, deployer.address, ethers.parseEther("0.001")),
		"Admin executes rescue without proposal"
	);

	// Final Summary
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("🎉 NEGATIVE TESTS COMPLETE!");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	console.log(`✅ Tests Passed: ${testsPassed}`);
	console.log(`❌ Tests Failed: ${testsFailed}`);

	if (testsFailed > 0) {
		console.log("\n⚠️  Some security restrictions are NOT working correctly!");
		process.exit(1);
	}

	console.log("\n📋 Security Verified:");
	console.log("  • Admin cannot execute without proposal");
	console.log("  • Non-owner cannot propose changes");
	console.log("  • Non-admin cannot execute changes");
	console.log("  • Direct transferOwnership/renounceOwnership blocked");
	console.log("  • Profit withdrawal restrictions enforced");
	console.log("  • Admin change restricted to owner");
	console.log("  • Rescue functions require dual-control");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Test failed:", error.message);
		console.error(error);
		process.exit(1);
	});

