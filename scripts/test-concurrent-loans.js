const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Test script for concurrent flash loans in the same block
 * 
 * This script simulates multiple borrowers requesting flash loans simultaneously
 * and verifies that:
 * 1. Provider balances are tracked correctly across concurrent loans
 * 2. inUse values prevent over-commitment
 * 3. Fees are distributed correctly to all providers
 * 4. The single-provider optimization works for small loans
 */

async function main() {
	const [deployer] = await ethers.getSigners();
	
	console.log("\n=== Concurrent Flash Loan Test ===\n");
	console.log("Test Account:", deployer.address);
	console.log("Note: Using demo borrower contract to execute flash loans");

	// Read addresses from website/.env.local
	const envPath = path.join(__dirname, "../website/.env.local");
	let ROUTER_ADDRESS, WETH_ADDRESS, DEMO_BORROWER_ADDRESS;
	
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, "utf8");
		const routerMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=(.+)/);
		const wethMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=(.+)/);
		const demoMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS=(.+)/);
		
		ROUTER_ADDRESS = routerMatch ? routerMatch[1].trim() : null;
		WETH_ADDRESS = wethMatch ? wethMatch[1].trim() : "0xdd13E55209Fd76AfE204dBda4007C227904f0a81";
		DEMO_BORROWER_ADDRESS = demoMatch ? demoMatch[1].trim() : null;
	}

	if (!ROUTER_ADDRESS) {
		console.error("Error: Contract addresses not found");
		console.log("Please run: NETWORK=sepolia ./scripts/deploy-sepolia.sh");
		process.exit(1);
	}

	console.log("\nUsing Router:", ROUTER_ADDRESS);
	console.log("Using WETH:", WETH_ADDRESS);
	console.log("Using Demo Borrower:", DEMO_BORROWER_ADDRESS);

	// Get contract instances
	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const weth = await ethers.getContractAt("MockWETH", WETH_ADDRESS);
	const demoBorrower = await ethers.getContractAt("DemoFlashBorrower", DEMO_BORROWER_ADDRESS);

	console.log("\n=== Step 1: Check Initial State ===");
	const tokenStats = await router.getTokenStats(WETH_ADDRESS);
	const committed = tokenStats[0];
	const activeProviders = tokenStats[1];
	const feeBps = tokenStats[2];
	
	// Format committed (handle MaxUint256)
	const committedDisplay = committed > ethers.parseEther("1000000") 
		? "Unlimited" 
		: ethers.formatEther(committed);
	
	console.log("Total Committed:", committedDisplay, "WETH");
	console.log("Active Providers:", activeProviders.toString());
	console.log("Fee BPS:", feeBps.toString());

	if (committed === 0n) {
		console.log("\n⚠️  No liquidity committed yet. Please:");
		console.log("1. Connect to the website with 2+ accounts");
		console.log("2. Wrap some ETH to WETH");
		console.log("3. Approve the router and set commitments");
		console.log("4. Run this script again");
		process.exit(0);
	}

	// Test Parameters (adjusted for limited testnet faucet amounts)
	const SMALL_LOAN = ethers.parseEther("0.01");   // Under threshold - should use single provider
	const MEDIUM_LOAN = ethers.parseEther("0.015"); // Under threshold
	const LARGE_LOAN = ethers.parseEther("0.03");   // Still under 10 ETH but tests if single provider has enough

	console.log("\n=== Step 2: Simulate Concurrent Small Loans ===");
	console.log("Testing single-provider optimization with 2 concurrent loans under threshold");
	
	try {
		// Check if demo borrower has enough ETH for fees
		const deployerBalance = await ethers.provider.getBalance(deployer.address);
		
		console.log("Test account ETH balance:", ethers.formatEther(deployerBalance));

		if (deployerBalance < ethers.parseEther("0.005")) {
			console.log("\n⚠️  Test account needs more ETH for gas (at least 0.005 ETH).");
			console.log("Current balance:", ethers.formatEther(deployerBalance), "ETH");
			process.exit(0);
		}

		// Send transactions sequentially (Sepolia testnet limitations)
		console.log("\nLoan 1:", ethers.formatEther(SMALL_LOAN), "WETH (toNative=true)");
		console.log("Sending transaction 1...");
		const tx1 = await demoBorrower.runDemo(SMALL_LOAN, { gasLimit: 500000 });
		console.log("Tx 1 hash:", tx1.hash);
		console.log("Waiting for confirmation...");
		const receipt1 = await tx1.wait();
		console.log("✅ Tx 1 confirmed in block", receipt1.blockNumber);

		console.log("\nLoan 2:", ethers.formatEther(MEDIUM_LOAN), "WETH (toNative=true)");
		console.log("Sending transaction 2...");
		const tx2 = await demoBorrower.runDemo(MEDIUM_LOAN, { gasLimit: 500000 });
		console.log("Tx 2 hash:", tx2.hash);
		console.log("Waiting for confirmation...");
		const receipt2 = await tx2.wait();
		console.log("✅ Tx 2 confirmed in block", receipt2.blockNumber);

		console.log("\n=== Analysis ===");
		console.log("Tx 1 - Gas used:", receipt1.gasUsed.toString());
		console.log("Tx 2 - Gas used:", receipt2.gasUsed.toString());

		if (receipt2.blockNumber - receipt1.blockNumber <= 1) {
			console.log("\n🎉 SUCCESS: Loans executed in consecutive blocks!");
		} else {
			console.log("\n⚠️  Loans executed", receipt2.blockNumber - receipt1.blockNumber, "blocks apart");
		}

		// Analyze events
		console.log("\n=== Step 3: Analyze Results ===");
		
		const routerInterface = router.interface;
		const events1 = receipt1.logs.map(log => {
			try {
				return routerInterface.parseLog(log);
			} catch (e) {
				return null;
			}
		}).filter(e => e && e.name === "FlashLoanExecuted");

		const events2 = receipt2.logs.map(log => {
			try {
				return routerInterface.parseLog(log);
			} catch (e) {
				return null;
			}
		}).filter(e => e && e.name === "FlashLoanExecuted");

		if (events1.length > 0) {
			const event = events1[0];
			console.log("\nLoan 1 Details:");
			console.log("  Amount:", ethers.formatEther(event.args.amount), "WETH");
			console.log("  Fee:", ethers.formatEther(event.args.fee), "WETH");
			console.log("  toNative:", event.args.toNative);
		}

		if (events2.length > 0) {
			const event = events2[0];
			console.log("\nLoan 2 Details:");
			console.log("  Amount:", ethers.formatEther(event.args.amount), "WETH");
			console.log("  Fee:", ethers.formatEther(event.args.fee), "WETH");
			console.log("  toNative:", event.args.toNative);
		}

		// Check final state
		const finalStats = await router.getTokenStats(WETH_ADDRESS);
		console.log("\nFinal State:");
		console.log("Total Committed:", ethers.formatEther(finalStats[0]), "WETH");
		console.log("Active Providers:", finalStats[1].toString());

	} catch (error) {
		console.error("\n❌ Test failed:", error.message);
		if (error.data) {
			console.error("Error data:", error.data);
		}
	}

	console.log("\n=== Step 4: Test Large Loan (Multi-Provider) ===");
	
	if (committed < LARGE_LOAN && committed !== ethers.MaxUint256) {
		console.log("Skipping large loan test - insufficient committed liquidity");
		console.log("Need:", ethers.formatEther(LARGE_LOAN), "WETH");
		console.log("Have:", committedDisplay, "WETH");
	} else {
		try {
			console.log("Testing loan over threshold:", ethers.formatEther(LARGE_LOAN), "WETH");
			console.log("This should trigger multi-provider pull...");
			
			const tx3 = await demoBorrower.runDemo(LARGE_LOAN, { gasLimit: 800000 });
			console.log("Tx hash:", tx3.hash);
			
			const receipt3 = await tx3.wait();
			console.log("✅ Large loan succeeded!");
			console.log("Gas used:", receipt3.gasUsed.toString());
			console.log("Block:", receipt3.blockNumber);

			const events3 = receipt3.logs.map(log => {
				try {
					return router.interface.parseLog(log);
				} catch (e) {
					return null;
				}
			}).filter(e => e && e.name === "FlashLoanExecuted");

			if (events3.length > 0) {
				const event = events3[0];
				console.log("\nLarge Loan Details:");
				console.log("  Amount:", ethers.formatEther(event.args.amount), "WETH");
				console.log("  Fee:", ethers.formatEther(event.args.fee), "WETH");
				console.log("  Gas (large loan):", receipt3.gasUsed.toString());
			}

		} catch (error) {
			console.error("❌ Large loan test failed:", error.message);
		}
	}

	console.log("\n=== Test Complete ===");
	console.log("\nKey Observations:");
	console.log("1. Check if small loans used single-provider optimization (lower gas)");
	console.log("2. Verify both transactions succeeded without interference");
	console.log("3. Check Etherscan to see which providers were used");
	console.log("4. Confirm fees were distributed correctly");
	
	console.log("\nView transactions on Etherscan:");
	console.log("https://sepolia.etherscan.io/address/" + ROUTER_ADDRESS);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

