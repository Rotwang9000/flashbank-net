const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Wrap ETH to WETH for provider accounts
 */

async function main() {
	console.log("\n=== Wrapping ETH → WETH for Providers ===\n");

	// Get provider accounts
	const provider1Key = process.env.TEST_PRIVATE_KEY_1;
	const provider2Key = process.env.TEST_PRIVATE_KEY_2;
	
	if (!provider1Key || !provider2Key) {
		console.error("Error: Missing TEST_PRIVATE_KEY_1 or TEST_PRIVATE_KEY_2");
		process.exit(1);
	}

	const provider = ethers.provider;
	const provider1 = new ethers.Wallet(provider1Key, provider);
	const provider2 = new ethers.Wallet(provider2Key, provider);

	console.log("Provider 1:", provider1.address);
	console.log("Provider 2:", provider2.address);

	// Read WETH address
	const envPath = path.join(__dirname, "../website/.env.local");
	let WETH_ADDRESS = "0xdd13E55209Fd76AfE204dBda4007C227904f0a81";
	
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, "utf8");
		const wethMatch = envContent.match(/NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=(.+)/);
		WETH_ADDRESS = wethMatch ? wethMatch[1].trim() : WETH_ADDRESS;
	}

	console.log("WETH:", WETH_ADDRESS);

	const weth = await ethers.getContractAt("MockWETH", WETH_ADDRESS);

	// Check balances
	console.log("\n=== Current Balances ===");
	const p1Eth = await provider.getBalance(provider1.address);
	const p1Weth = await weth.balanceOf(provider1.address);
	const p2Eth = await provider.getBalance(provider2.address);
	const p2Weth = await weth.balanceOf(provider2.address);

	console.log("Provider 1:");
	console.log("  ETH:", ethers.formatEther(p1Eth));
	console.log("  WETH:", ethers.formatEther(p1Weth));

	console.log("\nProvider 2:");
	console.log("  ETH:", ethers.formatEther(p2Eth));
	console.log("  WETH:", ethers.formatEther(p2Weth));

	// Wrap ETH for both providers
	const WRAP_AMOUNT = ethers.parseEther("0.05"); // Wrap 0.05 ETH each

	console.log("\n=== Wrapping ETH ===");
	console.log("Amount to wrap:", ethers.formatEther(WRAP_AMOUNT), "ETH per provider");

	if (p1Eth < WRAP_AMOUNT + ethers.parseEther("0.01")) {
		console.log("⚠️  Provider 1 doesn't have enough ETH (needs", ethers.formatEther(WRAP_AMOUNT + ethers.parseEther("0.01")), "ETH)");
	} else {
		console.log("\nWrapping for Provider 1...");
		let tx = await weth.connect(provider1).deposit({ value: WRAP_AMOUNT });
		await tx.wait();
		console.log("✅ Wrapped", ethers.formatEther(WRAP_AMOUNT), "ETH");
	}

	if (p2Eth < WRAP_AMOUNT + ethers.parseEther("0.01")) {
		console.log("⚠️  Provider 2 doesn't have enough ETH (needs", ethers.formatEther(WRAP_AMOUNT + ethers.parseEther("0.01")), "ETH)");
	} else {
		console.log("\nWrapping for Provider 2...");
		let tx = await weth.connect(provider2).deposit({ value: WRAP_AMOUNT });
		await tx.wait();
		console.log("✅ Wrapped", ethers.formatEther(WRAP_AMOUNT), "ETH");
	}

	// Check final balances
	console.log("\n=== Final Balances ===");
	const p1WethAfter = await weth.balanceOf(provider1.address);
	const p2WethAfter = await weth.balanceOf(provider2.address);

	console.log("Provider 1 WETH:", ethers.formatEther(p1WethAfter));
	console.log("Provider 2 WETH:", ethers.formatEther(p2WethAfter));
	console.log("Total WETH:", ethers.formatEther(p1WethAfter + p2WethAfter));

	console.log("\n✅ Ready for flash loan testing!");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

