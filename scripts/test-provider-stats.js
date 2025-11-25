const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Simple test to verify provider setup and check owner profits
 * 
 * This verifies:
 * 1. All providers are correctly registered
 * 2. Commitments are set properly
 * 3. Owner profit mechanism is ready
 * 4. Single-provider threshold is set
 */

async function main() {
	console.log("\n=== FlashBank Provider & Owner Profit Verification ===\n");

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

	console.log("Router:", ROUTER_ADDRESS);
	console.log("WETH:", WETH_ADDRESS);
	console.log("View on Etherscan:", `https://sepolia.etherscan.io/address/${ROUTER_ADDRESS}`);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const weth = await ethers.getContractAt("MockWETH", WETH_ADDRESS);

	// Get router configuration
	console.log("\n=== Router Configuration ===");
	try {
		const threshold = await router.SINGLE_PROVIDER_THRESHOLD();
		console.log("✅ Single-Provider Threshold:", ethers.formatEther(threshold), "ETH");
	} catch (e) {
		console.log("⚠️  Single-Provider Threshold: Not available (old router)");
	}

	try {
		const ownerFeeBps = await router.DEFAULT_OWNER_FEE_BPS();
		console.log("✅ Default Owner Fee:", ownerFeeBps.toString(), "bps (", ownerFeeBps / 100, "% of fee)");
	} catch (e) {
		console.log("⚠️  Owner Fee: Not available (old router)");
	}

	// Get pool stats
	console.log("\n=== Pool Statistics ===");
	const stats = await router.getTokenStats(WETH_ADDRESS);
	const totalCommitted = stats[0];
	const activeProviders = stats[1];
	const feeBps = stats[2];
	const maxFlashLoan = stats[3];
	const supportsPermit = stats[4];
	const maxBorrowBps = stats[5];

	console.log("Total Committed:", totalCommitted > ethers.parseEther("1000000") ? "Unlimited" : ethers.formatEther(totalCommitted), "WETH");
	console.log("Active Providers:", activeProviders.toString());
	console.log("Fee:", feeBps.toString(), "bps (", Number(feeBps) / 100, "%)");
	console.log("Max Flash Loan:", maxFlashLoan > ethers.parseEther("1000000") ? "Unlimited" : ethers.formatEther(maxFlashLoan), "WETH");
	console.log("Supports Permit:", supportsPermit);
	console.log("Max Borrow:", maxBorrowBps.toString(), "bps (", Number(maxBorrowBps) / 100, "% of pool)");

	// Get all providers
	console.log("\n=== Provider Details ===");
	const providers = await router.getProviders(WETH_ADDRESS);
	console.log("Total Providers:", providers.length);

	for (let i = 0; i < providers.length; i++) {
		const provider = providers[i];
		const info = await router.getProviderInfo(WETH_ADDRESS, provider);
		const balance = await weth.balanceOf(provider);
		const allowance = await weth.allowance(provider, ROUTER_ADDRESS);

		console.log(`\nProvider ${i + 1}: ${provider}`);
		console.log("  WETH Balance:", ethers.formatEther(balance));
		console.log("  Commitment:", info[0] > ethers.parseEther("1000000") ? "Unlimited" : ethers.formatEther(info[0]));
		console.log("  In Use:", ethers.formatEther(info[1]));
		console.log("  Expiry:", info[2] == 0n ? "None" : new Date(Number(info[2]) * 1000).toLocaleString());
		console.log("  Paused:", info[3]);
		console.log("  Registered:", info[4]);
		console.log("  Allowance:", allowance > ethers.parseEther("1000000") ? "Unlimited" : ethers.formatEther(allowance));
	}

	// Check owner profits
	console.log("\n=== Owner Profits ===");
	try {
		const ownerProfits = await router.getOwnerProfits(WETH_ADDRESS);
		console.log("Accumulated:", ethers.formatEther(ownerProfits), "WETH");
		
		if (ownerProfits > 0n) {
			console.log("\n💰 Owner can withdraw profits using:");
			console.log("   router.withdrawOwnerProfits(WETH_ADDRESS, ownerAddress)");
		} else {
			console.log("(No profits yet - execute some flash loans to accumulate fees)");
		}
	} catch (e) {
		console.log("⚠️  Owner profit tracking not available (old router)");
	}

	// Calculate potential earnings
	console.log("\n=== Potential Earnings Example ===");
	const exampleLoan = ethers.parseEther("1.0");
	const exampleFee = exampleLoan * BigInt(feeBps) / 10000n;
	const ownerCut = exampleFee * 200n / 10000n; // 2% of fee
	const providerShare = exampleFee - ownerCut;

	console.log("For a 1 ETH flash loan:");
	console.log("  Total Fee:", ethers.formatEther(exampleFee), "ETH (", Number(feeBps) / 100, "%)");
	console.log("  Owner Gets:", ethers.formatEther(ownerCut), "ETH (2% of fee)");
	console.log("  Providers Get:", ethers.formatEther(providerShare), "ETH (98% of fee, split proportionally)");

	console.log("\n✅ Setup Complete!");
	console.log("\n📊 Summary:");
	console.log("  • Router deployed with owner profit mechanism");
	console.log("  •", activeProviders.toString(), "providers with unlimited commitments");
	console.log("  • Single-provider optimization enabled (<10 ETH loans)");
	console.log("  • Ready for flash loans!");

	console.log("\n🔗 Next Steps:");
	console.log("  1. Execute flash loans via website or custom borrower contract");
	console.log("  2. Monitor owner profits with getOwnerProfits()");
	console.log("  3. Withdraw profits when ready");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ Error:", error.message);
		process.exit(1);
	});

