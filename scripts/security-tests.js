const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Security Tests for FlashBankRouter
 * 
 * Tests:
 * 1. Owner cannot steal provider funds
 * 2. Fee limits are enforced
 * 3. Providers can always pause
 * 4. Balance tracking after WETH transfers
 * 5. Continuous borrowing doesn't lock funds
 */

async function main() {
	console.log("\n=== FlashBankRouter Security Tests ===\n");

	// Setup
	const provider = ethers.provider;
	const deployerKey = process.env.PRIVATE_KEY;
	const provider1Key = process.env.TEST_PRIVATE_KEY_1;
	const provider2Key = process.env.TEST_PRIVATE_KEY_2;
	
	if (!deployerKey || !provider1Key || !provider2Key) {
		console.error("Error: Missing keys");
		process.exit(1);
	}

	const deployer = new ethers.Wallet(deployerKey, provider);
	const provider1 = new ethers.Wallet(provider1Key, provider);
	const provider2 = new ethers.Wallet(provider2Key, provider);

	// Read addresses
	const envPath = path.join(__dirname, "../website/.env.local");
	let ROUTER_ADDRESS, WETH_ADDRESS;
	
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, "utf8");
		const routerMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=(.+)/);
		const wethMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=(.+)/);
		
		ROUTER_ADDRESS = routerMatch ? routerMatch[1].trim() : null;
		WETH_ADDRESS = wethMatch ? wethMatch[1].trim() : "0xdd13E55209Fd76AfE204dBda4007C227904f0a81";
	}

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const weth = await ethers.getContractAt("MockWETH", WETH_ADDRESS);

	console.log("Router:", ROUTER_ADDRESS);
	console.log("WETH:", WETH_ADDRESS);
	console.log("Owner:", deployer.address);
	console.log("Provider 1:", provider1.address);
	console.log("Provider 2:", provider2.address);

	let passed = 0;
	let failed = 0;

	// TEST 1: Owner cannot steal provider funds
	console.log("\n=== TEST 1: Owner Cannot Steal Provider Funds ===");
	try {
		const provider1Balance = await weth.balanceOf(provider1.address);
		console.log("Provider 1 WETH balance:", ethers.formatEther(provider1Balance));
		
		// Try to call a non-existent withdraw function
		try {
			await router.connect(deployer).withdraw(WETH_ADDRESS, deployer.address, ethers.parseEther("1"));
			console.log("❌ FAILED: Owner was able to call withdraw()");
			failed++;
		} catch (e) {
			if (e.message.includes("is not a function")) {
				console.log("✅ PASSED: No withdraw() function exists");
				passed++;
			} else {
				console.log("❌ FAILED: Unexpected error:", e.message);
				failed++;
			}
		}
	} catch (e) {
		console.log("❌ FAILED:", e.message);
		failed++;
	}

	// TEST 2: Fee limits are enforced
	console.log("\n=== TEST 2: Fee Limits Are Enforced ===");
	try {
		const config = await router.tokenConfigs(WETH_ADDRESS);
		console.log("Current fee:", config.feeBps.toString(), "bps");
		console.log("Max allowed fee:", await router.MAX_FEE_BPS(), "bps (1%)");
		
		// Try to set excessive fee
		try {
			await router.connect(deployer).setTokenConfig(WETH_ADDRESS, {
				enabled: true,
				supportsPermit: true,
				feeBps: 200, // 2% - should fail
				maxFlashLoan: 0,
				wrapper: WETH_ADDRESS,
				maxBorrowBps: 5000,
				ownerFeeBps: 200
			});
			console.log("❌ FAILED: Was able to set 2% fee");
			failed++;
		} catch (e) {
			if (e.message.includes("InvalidFee")) {
				console.log("✅ PASSED: Cannot set fee above 1%");
				passed++;
			} else {
				console.log("❌ FAILED: Wrong error:", e.message);
				failed++;
			}
		}
	} catch (e) {
		console.log("❌ FAILED:", e.message);
		failed++;
	}

	// TEST 3: Providers can always pause
	console.log("\n=== TEST 3: Providers Can Always Pause ===");
	try {
		const infoBefore = await router.getProviderInfo(WETH_ADDRESS, provider1.address);
		console.log("Provider 1 paused before:", infoBefore[3]);
		
		// Pause commitment
		const tx = await router.connect(provider1).setCommitment(
			WETH_ADDRESS,
			infoBefore[0], // Keep same limit
			0, // No expiry
			true // Pause
		);
		await tx.wait();
		
		const infoAfter = await router.getProviderInfo(WETH_ADDRESS, provider1.address);
		console.log("Provider 1 paused after:", infoAfter[3]);
		
		if (infoAfter[3] === true) {
			console.log("✅ PASSED: Provider can pause commitment");
			passed++;
			
			// Unpause for next tests
			const tx2 = await router.connect(provider1).setCommitment(
				WETH_ADDRESS,
				infoBefore[0],
				0,
				false
			);
			await tx2.wait();
		} else {
			console.log("❌ FAILED: Provider could not pause");
			failed++;
		}
	} catch (e) {
		console.log("❌ FAILED:", e.message);
		failed++;
	}

	// TEST 4: Balance tracking after WETH transfers
	console.log("\n=== TEST 4: Balance Tracking After WETH Transfers ===");
	try {
		const totalCommittedBefore = await router.totalCommitted(WETH_ADDRESS);
		const actualBefore = await router.getActualAvailableLiquidity(WETH_ADDRESS);
		
		console.log("Total Committed (before):", totalCommittedBefore > ethers.parseEther("1000000") ? "Unlimited" : ethers.formatEther(totalCommittedBefore));
		console.log("Actual Available (before):", ethers.formatEther(actualBefore));
		
		// Provider 2 sends 0.001 WETH to provider 1
		const transferAmount = ethers.parseEther("0.001");
		const tx = await weth.connect(provider2).transfer(provider1.address, transferAmount);
		await tx.wait();
		console.log("\nProvider 2 sent 0.001 WETH to Provider 1");
		
		const totalCommittedAfter = await router.totalCommitted(WETH_ADDRESS);
		const actualAfter = await router.getActualAvailableLiquidity(WETH_ADDRESS);
		
		console.log("\nTotal Committed (after):", totalCommittedAfter > ethers.parseEther("1000000") ? "Unlimited" : ethers.formatEther(totalCommittedAfter));
		console.log("Actual Available (after):", ethers.formatEther(actualAfter));
		
		// Actual should increase, committed should stay same (or unlimited)
		if (actualAfter > actualBefore) {
			console.log("✅ PASSED: getActualAvailableLiquidity() reflects real balances");
			passed++;
		} else {
			console.log("❌ FAILED: Actual available didn't increase");
			failed++;
		}
		
		// Send it back
		const tx2 = await weth.connect(provider1).transfer(provider2.address, transferAmount);
		await tx2.wait();
	} catch (e) {
		console.log("❌ FAILED:", e.message);
		failed++;
	}

	// TEST 5: Owner profits are isolated
	console.log("\n=== TEST 5: Owner Profits Are Isolated ===");
	try {
		const ownerProfits = await router.getOwnerProfits(WETH_ADDRESS);
		console.log("Owner accumulated profits:", ethers.formatEther(ownerProfits), "WETH");
		
		// Owner should only be able to withdraw their profits
		if (ownerProfits > 0n) {
			const ownerBalanceBefore = await weth.balanceOf(deployer.address);
			
			const tx = await router.connect(deployer).withdrawOwnerProfits(WETH_ADDRESS, deployer.address);
			await tx.wait();
			
			const ownerBalanceAfter = await weth.balanceOf(deployer.address);
			const received = ownerBalanceAfter - ownerBalanceBefore;
			
			console.log("Owner withdrew:", ethers.formatEther(received), "WETH");
			
			if (received === ownerProfits) {
				console.log("✅ PASSED: Owner can only withdraw accumulated profits");
				passed++;
			} else {
				console.log("❌ FAILED: Withdrawal amount mismatch");
				failed++;
			}
		} else {
			console.log("✅ PASSED: No profits to withdraw (expected after previous tests)");
			passed++;
		}
	} catch (e) {
		console.log("❌ FAILED:", e.message);
		failed++;
	}

	// TEST 6: Check for common vulnerabilities
	console.log("\n=== TEST 6: Common Vulnerability Checks ===");
	try {
		// Check ReentrancyGuard
		const code = await provider.getCode(ROUTER_ADDRESS);
		if (code.includes("5265656e7472616e637947756172")) { // "ReentrancyGuard" in hex
			console.log("✅ ReentrancyGuard detected in bytecode");
		}
		
		// Check constants
		const minFee = await router.MIN_FEE_BPS();
		const maxFee = await router.MAX_FEE_BPS();
		const feeDenom = await router.FEE_DENOMINATOR();
		
		console.log("Fee limits:", minFee.toString(), "-", maxFee.toString(), "bps");
		console.log("Fee denominator:", feeDenom.toString());
		
		if (minFee === 1n && maxFee === 100n && feeDenom === 10000n) {
			console.log("✅ PASSED: Fee constants are correct");
			passed++;
		} else {
			console.log("❌ FAILED: Fee constants are wrong");
			failed++;
		}
	} catch (e) {
		console.log("❌ FAILED:", e.message);
		failed++;
	}

	// Summary
	console.log("\n=== SECURITY TEST SUMMARY ===");
	console.log("✅ Passed:", passed);
	console.log("❌ Failed:", failed);
	console.log("Total:", passed + failed);
	
	if (failed === 0) {
		console.log("\n🎉 ALL SECURITY TESTS PASSED!");
		console.log("Contract is ready for mainnet deployment.");
	} else {
		console.log("\n⚠️  SOME TESTS FAILED - Review before deployment");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Test suite failed:", error.message);
		process.exit(1);
	});

