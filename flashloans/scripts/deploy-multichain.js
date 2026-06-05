const { ethers } = require("hardhat");

async function main() {
	const networkName = (await ethers.provider.getNetwork()).name;
	const chainId = (await ethers.provider.getNetwork()).chainId;
	
	console.log("🚀 Deploying FlashBankRevolutionary to", networkName, "(Chain ID:", chainId.toString(), ")");

	const [deployer] = await ethers.getSigners();

	console.log("📝 Deploying with account:", await deployer.getAddress());
	const balance = await ethers.provider.getBalance(deployer.address);
	console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

	if (balance === 0n) {
		console.error("❌ Account has no balance! Cannot deploy.");
		process.exit(1);
	}

	// ============ GAS ESTIMATION & OPTIMISATION ============

	const FlashBankRevolutionary = await ethers.getContractFactory("FlashBankRevolutionary");
	
	// Estimate gas needed
	console.log("\n⛽ Estimating gas requirements...");
	const deployTransaction = await FlashBankRevolutionary.getDeployTransaction(await deployer.getAddress());
	const estimatedGas = await ethers.provider.estimateGas({
		...deployTransaction,
		from: await deployer.getAddress()
	});
	console.log("  - Estimated gas units:", estimatedGas.toString());
	
	// Get current network gas price
	const feeData = await ethers.provider.getFeeData();
	const networkGasPrice = feeData.gasPrice;
	console.log("  - Network gas price:", ethers.formatUnits(networkGasPrice, "gwei"), "gwei");
	
	// Calculate max gas price we can afford (leaving 1% buffer)
	const gasBuffer = estimatedGas + (estimatedGas * 10n / 100n); // +10% buffer
	const maxAffordableGasPrice = (balance * 99n / 100n) / gasBuffer; // Use 99% of balance
	console.log("  - Max affordable gas price:", ethers.formatUnits(maxAffordableGasPrice, "gwei"), "gwei");
	
	// Use the lower of network or affordable
	const useGasPrice = networkGasPrice < maxAffordableGasPrice ? networkGasPrice : maxAffordableGasPrice;
	const estimatedCost = gasBuffer * useGasPrice;
	
	console.log("\n💰 Deployment cost estimate:");
	console.log("  - Using gas price:", ethers.formatUnits(useGasPrice, "gwei"), "gwei");
	console.log("  - Estimated cost:", ethers.formatEther(estimatedCost), "ETH");
	console.log("  - Remaining balance:", ethers.formatEther(balance - estimatedCost), "ETH");
	
	if (estimatedCost > balance) {
		console.error("\n❌ Insufficient funds for deployment!");
		console.error("  - Need:", ethers.formatEther(estimatedCost), "ETH");
		console.error("  - Have:", ethers.formatEther(balance), "ETH");
		console.error("  - Short:", ethers.formatEther(estimatedCost - balance), "ETH");
		console.error("\n💡 Deploy when gas price drops to:", ethers.formatUnits(maxAffordableGasPrice, "gwei"), "gwei or lower");
		process.exit(1);
	}
	
	if (useGasPrice < networkGasPrice) {
		console.log("\n⚠️  Using lower gas price than network average.");
		console.log("    Transaction may take longer to confirm.");
		console.log("    Consider deploying when gas drops to:", ethers.formatUnits(networkGasPrice, "gwei"), "gwei");
	}

	// ============ DEPLOY REVOLUTIONARY CONTRACT ============

	console.log("\n🔥 Deploying FlashBankRevolutionary...");
	
	// Deploy WITHOUT proxy - truly immutable!
	const flashBank = await FlashBankRevolutionary.deploy(
		await deployer.getAddress(), // owner
		{ gasPrice: useGasPrice }
	);

	await flashBank.waitForDeployment();
	const contractAddress = await flashBank.getAddress();

	console.log("✅ FlashBankRevolutionary deployed to:", contractAddress);

	// ============ VERIFY DEPLOYMENT ============

	console.log("\n🔍 Verifying deployment...");

	// Check security info
	const securityInfo = await flashBank.getSecurityInfo();
	console.log("🔒 Security verification:");
	console.log("  - Is Upgradeable:", securityInfo.isUpgradeable); // Should be FALSE
	console.log("  - Max Fee Rate:", securityInfo.maxFeeRate.toString(), "basis points (", Number(securityInfo.maxFeeRate)/100, "%)");
	console.log("  - Absolute Max Flash Loan:", ethers.formatEther(securityInfo.absoluteMaxFlashLoan), "ETH");
	console.log("  - Deployed At:", new Date(Number(securityInfo.deployedAt) * 1000).toISOString());
	console.log("  - Creation Block:", securityInfo.creationBlock.toString());

	// Check pool stats
	const poolStats = await flashBank.getPoolStats();
	console.log("\n📊 Pool stats:");
	console.log("  - Total committed liquidity:", ethers.formatEther(poolStats.totalCommitted), "ETH");
	console.log("  - Total profits:", ethers.formatEther(poolStats.totalProfits), "ETH");
	console.log("  - Number of providers:", poolStats.numProviders.toString());
	console.log("  - Contract age:", poolStats.contractAge.toString(), "seconds");

	// Test fee calculation
	const FLASH_LOAN_FEE_RATE = 2; // 0.02%
	const testAmount = ethers.parseEther("100"); // 100 ETH
	const fee = (testAmount * BigInt(FLASH_LOAN_FEE_RATE)) / BigInt(10000);
	console.log("📋 Flash loan fee for 100 ETH:", ethers.formatEther(fee), "ETH (0.02%)");

	// ============ DEPLOYMENT SUMMARY ============

	console.log("\n🎉 Deployment complete!");
	console.log("=".repeat(50));
	console.log("📋 DEPLOYMENT SUMMARY:");
	console.log("=".repeat(50));
	console.log("🌐 Network:", networkName, "(Chain ID:", chainId.toString() + ")");
	console.log("🔥 FlashBankRevolutionary:", contractAddress);
	console.log("👤 Owner:", await deployer.getAddress());
	console.log("💸 Flash loan fee: 0.02%");
	console.log("🔒 IMMUTABLE: NO UPGRADES POSSIBLE");
	console.log("🚀 REVOLUTIONARY: Just-in-Time Liquidity System");

	// ============ VERIFICATION COMMAND ============

	console.log("\n📄 Contract Verification Command:");
	console.log(`npx hardhat verify --network ${networkName.toLowerCase()} ${contractAddress} "${await deployer.getAddress()}"`);

	// ============ SAVE TO ENV FILE ============

	console.log("\n💾 Add to your .env file:");
	const networkUpper = networkName.toUpperCase().replace('-', '_');
	console.log(`${networkUpper}_FLASHBANK_ADDRESS="${contractAddress}"`);
	console.log(`NEXT_PUBLIC_${networkUpper}_FLASHBANK_ADDRESS="${contractAddress}"`);

	return {
		network: networkName,
		chainId: chainId.toString(),
		flashBank: contractAddress,
		owner: await deployer.getAddress()
	};
}

main()
	.then((addresses) => {
		console.log("\n✅ Deployment successful!");
		console.log(JSON.stringify(addresses, null, 2));
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n❌ Deployment failed:", error);
		process.exit(1);
	});

