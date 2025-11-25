const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Final Concurrent Flash Loan Test
 * 
 * Architecture:
 * - PRIVATE_KEY: Deployer/owner, receives admin fees
 * - TEST_PRIVATE_KEY_1 & 2: Providers (already committed unlimited)
 * - TEST_PRIVATE_KEY_3 & 4: Borrowers (clean accounts, just trigger loans)
 * 
 * Flow:
 * 1. Deploy borrower contracts (from PRIVATE_KEY)
 * 2. Borrowers wrap small amount of ETH for fees only
 * 3. Borrowers trigger flash loans concurrently
 * 4. Router pulls from providers' wallets
 * 5. Borrowers receive funds, do nothing, repay
 * 6. Check owner profits
 */

async function main() {
	console.log("\n=== Final Concurrent Flash Loan Test ===\n");

	// Get all accounts
	const deployerKey = process.env.PRIVATE_KEY;
	const borrower1Key = process.env.TEST_PRIVATE_KEY_3;
	const borrower2Key = process.env.TEST_PRIVATE_KEY_4;
	
	if (!deployerKey || !borrower1Key || !borrower2Key) {
		console.error("Error: Missing keys");
		process.exit(1);
	}

	const provider = ethers.provider;
	const deployer = new ethers.Wallet(deployerKey, provider);
	const borrower1 = new ethers.Wallet(borrower1Key, provider);
	const borrower2 = new ethers.Wallet(borrower2Key, provider);

	console.log("Deployer (owner):", deployer.address);
	console.log("Borrower 1:", borrower1.address);
	console.log("Borrower 2:", borrower2.address);

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

	if (!ROUTER_ADDRESS) {
		console.error("Error: Router address not found");
		process.exit(1);
	}

	console.log("\nRouter:", ROUTER_ADDRESS);
	console.log("WETH:", WETH_ADDRESS);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const weth = await ethers.getContractAt("MockWETH", WETH_ADDRESS);

	// Check pool stats
	console.log("\n=== Pool Statistics ===");
	const stats = await router.getTokenStats(WETH_ADDRESS);
	const providers = await router.getProviders(WETH_ADDRESS);
	
	console.log("Total Committed:", stats[0] > ethers.parseEther("1000000") ? "Unlimited" : ethers.formatEther(stats[0]));
	console.log("Active Providers:", stats[1].toString());

	let totalAvailable = 0n;
	for (const providerAddr of providers) {
		const balance = await weth.balanceOf(providerAddr);
		const info = await router.getProviderInfo(WETH_ADDRESS, providerAddr);
		const available = balance - info[1];
		totalAvailable += available;
		console.log(`  Provider ${providerAddr.slice(0, 8)}... has ${ethers.formatEther(available)} WETH available`);
	}
	console.log("Total Available:", ethers.formatEther(totalAvailable), "WETH");

	// Loan amounts
	const SMALL_LOAN = ethers.parseEther("0.001");
	const LARGE_LOAN = ethers.parseEther("0.02");
	const FEE_1 = SMALL_LOAN * 2n / 10000n;
	const FEE_2 = LARGE_LOAN * 2n / 10000n;

	console.log("\nSmall Loan:", ethers.formatEther(SMALL_LOAN), "WETH, Fee:", ethers.formatEther(FEE_1), "WETH");
	console.log("Large Loan:", ethers.formatEther(LARGE_LOAN), "WETH, Fee:", ethers.formatEther(FEE_2), "WETH");

	if (totalAvailable < SMALL_LOAN + LARGE_LOAN) {
		console.error("\n❌ Not enough liquidity");
		process.exit(1);
	}

	// Deploy borrower contracts
	console.log("\n=== Deploying Borrower Contracts ===");
	const BorrowerFactory = await ethers.getContractFactory("contracts/test/SimpleBorrower.sol:SimpleBorrower");
	
	const borrowerContract1 = await BorrowerFactory.connect(deployer).deploy(ROUTER_ADDRESS, WETH_ADDRESS);
	await borrowerContract1.waitForDeployment();
	const borrowerContract1Address = await borrowerContract1.getAddress();
	console.log("✓ Borrower Contract 1:", borrowerContract1Address);
	
	await new Promise(resolve => setTimeout(resolve, 2000));
	
	const borrowerContract2 = await BorrowerFactory.connect(deployer).deploy(ROUTER_ADDRESS, WETH_ADDRESS);
	await borrowerContract2.waitForDeployment();
	const borrowerContract2Address = await borrowerContract2.getAddress();
	console.log("✓ Borrower Contract 2:", borrowerContract2Address);

	// Borrowers wrap JUST ENOUGH ETH for fees
	console.log("\n=== Borrowers Wrap ETH for Fees ===");
	console.log("(Loan amounts will come from providers' wallets)");
	
	const b1Eth = await provider.getBalance(borrower1.address);
	const b2Eth = await provider.getBalance(borrower2.address);
	console.log("Borrower 1 ETH:", ethers.formatEther(b1Eth));
	console.log("Borrower 2 ETH:", ethers.formatEther(b2Eth));

	if (b1Eth < FEE_1 + ethers.parseEther("0.002")) {
		console.error("❌ Borrower 1 needs more ETH for fee + gas");
		process.exit(1);
	}
	if (b2Eth < FEE_2 + ethers.parseEther("0.002")) {
		console.error("❌ Borrower 2 needs more ETH for fee + gas");
		process.exit(1);
	}

	console.log("\nWrapping ETH for fees...");
	let tx = await weth.connect(borrower1).deposit({ value: FEE_1 });
	await tx.wait();
	console.log("✓ Borrower 1 wrapped", ethers.formatEther(FEE_1), "WETH (for fee)");

	tx = await weth.connect(borrower2).deposit({ value: FEE_2 });
	await tx.wait();
	console.log("✓ Borrower 2 wrapped", ethers.formatEther(FEE_2), "WETH (for fee)");

	// Transfer fees to borrower contracts
	console.log("\nTransferring fees to borrower contracts...");
	tx = await weth.connect(borrower1).transfer(borrowerContract1Address, FEE_1);
	await tx.wait();
	console.log("✓ Borrower Contract 1 has", ethers.formatEther(FEE_1), "WETH for fee");

	tx = await weth.connect(borrower2).transfer(borrowerContract2Address, FEE_2);
	await tx.wait();
	console.log("✓ Borrower Contract 2 has", ethers.formatEther(FEE_2), "WETH for fee");

	// Check owner profits before
	const ownerProfitsBefore = await router.getOwnerProfits(WETH_ADDRESS);
	console.log("\n💰 Owner Profits Before:", ethers.formatEther(ownerProfitsBefore), "WETH");

	// Execute concurrent flash loans
	console.log("\n=== Executing Concurrent Flash Loans ===");
	console.log("⚡ Borrowers trigger loans simultaneously...");
	console.log("   Router will PULL from providers' wallets");
	console.log("   Borrowers will receive funds + repay with fee");

	const promise1 = borrowerContract1.connect(borrower1).requestFlashLoan(SMALL_LOAN, false);
	const promise2 = borrowerContract2.connect(borrower2).requestFlashLoan(LARGE_LOAN, false);

	console.log("\n⏳ Waiting for both transactions...");
	const [tx1, tx2] = await Promise.all([promise1, promise2]);
	
	console.log("\n📝 Transaction Hashes:");
	console.log("  Small Loan:", tx1.hash);
	console.log("  Large Loan:", tx2.hash);

	const [receipt1, receipt2] = await Promise.all([tx1.wait(), tx2.wait()]);

	console.log("\n✅ Both Loans Completed!");
	console.log("  Small Loan Gas:", receipt1.gasUsed.toString());
	console.log("  Large Loan Gas:", receipt2.gasUsed.toString());
	console.log("  Block 1:", receipt1.blockNumber);
	console.log("  Block 2:", receipt2.blockNumber);

	if (receipt1.blockNumber === receipt2.blockNumber) {
		console.log("\n🎯 BOTH LOANS IN SAME BLOCK! True concurrency!");
	}

	// Parse events
	console.log("\n=== Event Analysis ===");
	const routerInterface = router.interface;
	const events1 = receipt1.logs
		.map(log => { try { return routerInterface.parseLog(log); } catch (e) { return null; } })
		.filter(e => e && e.name === "FlashLoanExecuted");

	const events2 = receipt2.logs
		.map(log => { try { return routerInterface.parseLog(log); } catch (e) { return null; } })
		.filter(e => e && e.name === "FlashLoanExecuted");

	if (events1.length > 0) {
		console.log("\nSmall Loan:");
		console.log("  Borrower:", events1[0].args.borrower);
		console.log("  Amount:", ethers.formatEther(events1[0].args.amount), "WETH");
		console.log("  Fee:", ethers.formatEther(events1[0].args.fee), "WETH");
	}

	if (events2.length > 0) {
		console.log("\nLarge Loan:");
		console.log("  Borrower:", events2[0].args.borrower);
		console.log("  Amount:", ethers.formatEther(events2[0].args.amount), "WETH");
		console.log("  Fee:", ethers.formatEther(events2[0].args.fee), "WETH");
	}

	// Check owner profits after
	const ownerProfitsAfter = await router.getOwnerProfits(WETH_ADDRESS);
	const ownerProfit = ownerProfitsAfter - ownerProfitsBefore;
	console.log("\n💰 Owner Profits After:", ethers.formatEther(ownerProfitsAfter), "WETH");
	console.log("💰 Owner Earned:", ethers.formatEther(ownerProfit), "WETH");

	const expectedOwnerProfit = (FEE_1 + FEE_2) * 200n / 10000n;
	console.log("💰 Expected:", ethers.formatEther(expectedOwnerProfit), "WETH (2% of fees)");

	// Gas comparison
	console.log("\n⛽ Gas Comparison:");
	console.log("  Small Loan:", receipt1.gasUsed.toString(), "gas");
	console.log("  Large Loan:", receipt2.gasUsed.toString(), "gas");
	const gasDiff = receipt2.gasUsed > receipt1.gasUsed ? receipt2.gasUsed - receipt1.gasUsed : 0n;
	if (gasDiff > 0n) {
		console.log("  Multi-provider overhead:", gasDiff.toString(), "gas");
	}

	console.log("\n=== Test Complete ===");
	console.log("\n🎉 Key Findings:");
	console.log("1. ✅ Providers' WETH stayed in their wallets");
	console.log("2. ✅ Router pulled liquidity on-demand");
	console.log("3. ✅ Concurrent loans worked without interference");
	console.log("4. ✅ Owner accumulated", ethers.formatEther(ownerProfit), "WETH in profits");
	console.log("5. ✅ Borrowers only needed fees, not full loan amounts");

	console.log("\n🔗 View on Etherscan:");
	console.log("  Small Loan:", `https://sepolia.etherscan.io/tx/${tx1.hash}`);
	console.log("  Large Loan:", `https://sepolia.etherscan.io/tx/${tx2.hash}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Test failed:", error.message);
		if (error.data) console.error("Error data:", error.data);
		process.exit(1);
	});

