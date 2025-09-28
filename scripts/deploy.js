const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying L2 Flash Network...");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Deploying contracts with account:", await deployer.getAddress());
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // ============ DEPLOY IMPLEMENTATION ============
  
  console.log("\n📦 Deploying L2FlashPool implementation...");
  const L2FlashPool = await ethers.getContractFactory("L2FlashPool");
  
  const flashLoanFeeRate = 5; // 0.05% fee (5 basis points)
  
  // Deploy using OpenZeppelin upgrades plugin
  const l2FlashPool = await upgrades.deployProxy(
    L2FlashPool,
    [
      await deployer.getAddress(), // owner
      flashLoanFeeRate   // 0.05% fee
    ],
    {
      initializer: "initialize",
      kind: "transparent"
    }
  );
  
  await l2FlashPool.waitForDeployment();
  const poolAddress = await l2FlashPool.getAddress();
  
  console.log("✅ L2FlashPool deployed to:", poolAddress);
  
  // ============ DEPLOY MEV RECEIVER ============
  
  console.log("\n📦 Deploying MEVFlashLoanReceiver...");
  const MEVFlashLoanReceiver = await ethers.getContractFactory("MEVFlashLoanReceiver");
  
  const mevReceiver = await MEVFlashLoanReceiver.deploy(
    poolAddress,                           // l2FlashPool
    "0x0000000000000000000000000000000000000000", // mevBotExecutor (to be set later)
    ethers.parseEther("0.01")              // 0.01 ETH minimum profit
  );
  
  await mevReceiver.waitForDeployment();
  const receiverAddress = await mevReceiver.getAddress();
  
  console.log("✅ MEVFlashLoanReceiver deployed to:", receiverAddress);
  
  // ============ VERIFY DEPLOYMENT ============
  
  console.log("\n🔍 Verifying deployment...");
  
  // Check pool stats
  const poolStats = await l2FlashPool.getPoolStats();
  console.log("📊 Pool stats:");
  console.log("  - Total deposits:", ethers.formatEther(poolStats.totalDeposits_), "ETH");
  console.log("  - Total profits:", ethers.formatEther(poolStats.totalProfits), "ETH");
  console.log("  - Number of depositors:", poolStats.numDepositors.toString());
  console.log("  - Flash loan fee rate:", flashLoanFeeRate, "basis points");
  
  // Test calculate fee function
  const testAmount = ethers.parseEther("10"); // 10 ETH
  const calculatedFee = await l2FlashPool.calculateFlashLoanFee(testAmount);
  console.log("📋 Flash loan fee for 10 ETH:", ethers.formatEther(calculatedFee), "ETH");
  
  // ============ DEPLOYMENT SUMMARY ============
  
  console.log("\n🎉 Deployment complete!");
  console.log("=" * 50);
  console.log("📋 DEPLOYMENT SUMMARY:");
  console.log("=" * 50);
  console.log("🏦 L2FlashPool (Proxy):", poolAddress);
  console.log("🤖 MEVFlashLoanReceiver:", receiverAddress);
  console.log("👤 Owner:", await deployer.getAddress());
  console.log("💸 Flash loan fee:", flashLoanFeeRate / 100, "%");
  console.log("🎯 Network:", (await deployer.provider.getNetwork()).name);
  console.log("⛽ Gas used: ~2.5M gas");
  
  // ============ NEXT STEPS ============
  
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Set MEVBotExecutor address in MEVFlashLoanReceiver");
  console.log("2. Fund the pool with initial ETH deposits");
  console.log("3. Test flash loan execution with small amounts");
  console.log("4. Connect to existing MEV bot for zero-fee flash loans");
  
  console.log("\n📄 Save these addresses for integration:");
  console.log(`L2_FLASH_POOL_ADDRESS="${poolAddress}"`);
  console.log(`MEV_RECEIVER_ADDRESS="${receiverAddress}"`);
  
  return {
    l2FlashPool: poolAddress,
    mevReceiver: receiverAddress
  };
}

// Handle deployment errors
main()
  .then((addresses) => {
    console.log("✅ Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
