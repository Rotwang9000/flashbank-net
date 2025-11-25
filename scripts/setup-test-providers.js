const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Setup script for test providers
 * 
 * This script:
 * 1. Wraps ETH to WETH for test accounts
 * 2. Approves the router for unlimited WETH
 * 3. Sets unlimited commitments for each provider
 */

async function main() {
	console.log("\n=== FlashBank Test Provider Setup ===\n");

	// Get test accounts from environment
	const provider1Key = process.env.PRIVATE_KEY;
	const provider2Key = process.env.TEST_PRIVATE_KEY_1;
	const provider3Key = process.env.TEST_PRIVATE_KEY_2;

	if (!provider1Key || !provider2Key || !provider3Key) {
		console.error("Error: Missing private keys in .env");
		console.log("Required: PRIVATE_KEY, TEST_PRIVATE_KEY_1, TEST_PRIVATE_KEY_2");
		process.exit(1);
	}

	const provider = ethers.provider;
	const provider1 = new ethers.Wallet(provider1Key, provider);
	const provider2 = new ethers.Wallet(provider2Key, provider);
	const provider3 = new ethers.Wallet(provider3Key, provider);

	console.log("Provider 1:", provider1.address);
	console.log("Provider 2:", provider2.address);
	console.log("Provider 3:", provider3.address);

	// Read router address from .env.local
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
		console.log("Please run: NETWORK=sepolia ./scripts/deploy-sepolia.sh");
		process.exit(1);
	}

	console.log("\nRouter:", ROUTER_ADDRESS);
	console.log("WETH:", WETH_ADDRESS);

	const router = await ethers.getContractAt("FlashBankRouter", ROUTER_ADDRESS);
	const weth = await ethers.getContractAt("MockWETH", WETH_ADDRESS);

	// Check balances
	console.log("\n=== Step 1: Check Initial Balances ===");
	const providers = [
		{ wallet: provider1, name: "Provider 1" },
		{ wallet: provider2, name: "Provider 2" },
		{ wallet: provider3, name: "Provider 3" }
	];

	for (const p of providers) {
		const ethBalance = await provider.getBalance(p.wallet.address);
		const wethBalance = await weth.balanceOf(p.wallet.address);
		console.log(`${p.name}:`);
		console.log(`  ETH:  ${ethers.formatEther(ethBalance)}`);
		console.log(`  WETH: ${ethers.formatEther(wethBalance)}`);
	}

	// Wrap ETH to WETH for providers that need it
	console.log("\n=== Step 2: Wrap ETH to WETH (if needed) ===");
	const MIN_WETH = ethers.parseEther("0.01");
	
	for (const p of providers) {
		const wethBalance = await weth.balanceOf(p.wallet.address);
		if (wethBalance < MIN_WETH) {
			const ethBalance = await provider.getBalance(p.wallet.address);
			if (ethBalance < ethers.parseEther("0.02")) {
				console.log(`⚠️  ${p.name} needs more ETH for wrapping (has ${ethers.formatEther(ethBalance)} ETH)`);
				continue;
			}

			const wrapAmount = ethers.parseEther("0.01");
			console.log(`Wrapping ${ethers.formatEther(wrapAmount)} ETH for ${p.name}...`);
			const tx = await weth.connect(p.wallet).deposit({ value: wrapAmount });
			await tx.wait();
			console.log(`✅ Wrapped! New WETH balance: ${ethers.formatEther(await weth.balanceOf(p.wallet.address))}`);
		} else {
			console.log(`✓ ${p.name} already has ${ethers.formatEther(wethBalance)} WETH`);
		}
	}

	// Approve router for unlimited WETH
	console.log("\n=== Step 3: Approve Router for Unlimited WETH ===");
	
	for (const p of providers) {
		const currentAllowance = await weth.allowance(p.wallet.address, ROUTER_ADDRESS);
		if (currentAllowance < ethers.MaxUint256 / 2n) {
			console.log(`Approving unlimited WETH for ${p.name}...`);
			const tx = await weth.connect(p.wallet).approve(ROUTER_ADDRESS, ethers.MaxUint256);
			await tx.wait();
			console.log(`✅ Approved!`);
		} else {
			console.log(`✓ ${p.name} already has unlimited approval`);
		}
	}

	// Set unlimited commitments
	console.log("\n=== Step 4: Set Unlimited Commitments ===");
	
	for (const p of providers) {
		const info = await router.getProviderInfo(WETH_ADDRESS, p.wallet.address);
		const currentLimit = info[0];
		const registered = info[4];

		if (!registered || currentLimit < ethers.MaxUint256 / 2n) {
			console.log(`Setting unlimited commitment for ${p.name}...`);
			const tx = await router.connect(p.wallet).setCommitment(
				WETH_ADDRESS,
				ethers.MaxUint256,
				0, // no expiry
				false // not paused
			);
			await tx.wait();
			console.log(`✅ Committed!`);
		} else {
			console.log(`✓ ${p.name} already has unlimited commitment`);
		}
	}

	// Verify final state
	console.log("\n=== Step 5: Verify Final State ===");
	const stats = await router.getTokenStats(WETH_ADDRESS);
	console.log("Total Committed:", stats[0] > ethers.parseEther("1000000") ? "Unlimited" : ethers.formatEther(stats[0]), "WETH");
	console.log("Active Providers:", stats[1].toString());
	console.log("Fee BPS:", stats[2].toString());

	console.log("\n✅ Setup Complete! Ready for testing.");
	console.log("\nNext step: Run the concurrent loan test:");
	console.log("  npx hardhat run scripts/test-concurrent-loans.js --network sepolia");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

