const { ethers } = require("hardhat");

async function main() {
  console.log("🔒 Deploying IMMUTABLE L2 Flash Network (NON-UPGRADEABLE)...");
  
  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Deploying with account:", await deployer.getAddress());
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // ============ DEPLOY IMMUTABLE CONTRACT ============
  
  console.log("\n🔒 Deploying L2FlashPoolImmutable (NON-UPGRADEABLE)...");
  const L2FlashPoolImmutable = await ethers.getContractFactory("L2FlashPoolImmutable");
  
  const flashLoanFeeRate = 2; // 0.02% fee (2 basis points) - Ultra-competitive!
  
  // Deploy WITHOUT proxy - truly immutable!
  const l2FlashPool = await L2FlashPoolImmutable.deploy(
    await deployer.getAddress(), // owner
    flashLoanFeeRate   // 0.02% fee
  );
  
  await l2FlashPool.waitForDeployment();
  const poolAddress = await l2FlashPool.getAddress();
  
  console.log("✅ L2FlashPoolImmutable deployed to:", poolAddress);
  
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
  
  // ============ VERIFY IMMUTABLE DEPLOYMENT ============
  
  console.log("\n🔍 Verifying IMMUTABLE deployment...");
  
  // Check security info
  const securityInfo = await l2FlashPool.getSecurityInfo();
  console.log("🔒 Security verification:");
  console.log("  - Is Upgradeable:", securityInfo.isUpgradeable); // Should be FALSE
  console.log("  - Max Fee Rate:", securityInfo.maxFeeRate.toString(), "basis points (", Number(securityInfo.maxFeeRate)/100, "%)");
  console.log("  - Absolute Max Flash Loan:", ethers.formatEther(securityInfo.absoluteMaxFlashLoan), "ETH");
  console.log("  - Deployed At:", new Date(Number(securityInfo.deployedAt) * 1000).toISOString());
  console.log("  - Creation Block:", securityInfo.creationBlock.toString());
  
  // Check pool stats
  const poolStats = await l2FlashPool.getPoolStats();
  console.log("\n📊 Pool stats:");
  console.log("  - Total deposits:", ethers.formatEther(poolStats.totalDeposits_), "ETH");
  console.log("  - Total profits:", ethers.formatEther(poolStats.totalProfits), "ETH");
  console.log("  - Number of depositors:", poolStats.numDepositors.toString());
  console.log("  - Contract age:", poolStats.contractAge.toString(), "seconds");
  console.log("  - Flash loan fee rate:", flashLoanFeeRate, "basis points");
  
  // Test calculate fee function
  const testAmount = ethers.parseEther("10"); // 10 ETH
  const calculatedFee = await l2FlashPool.calculateFlashLoanFee(testAmount);
  console.log("📋 Flash loan fee for 10 ETH:", ethers.formatEther(calculatedFee), "ETH");
  
  // ============ DEPLOYMENT SUMMARY ============
  
  console.log("\n🎉 IMMUTABLE Deployment complete!");
  console.log("=" * 50);
  console.log("📋 DEPLOYMENT SUMMARY:");
  console.log("=" * 50);
  console.log("🔒 L2FlashPoolImmutable:", poolAddress);
  console.log("🤖 MEVFlashLoanReceiver:", receiverAddress);
  console.log("👤 Owner:", await deployer.getAddress());
  console.log("💸 Flash loan fee:", flashLoanFeeRate / 100, "%");
  console.log("🔒 IMMUTABLE: NO UPGRADES POSSIBLE");
  console.log("🛡️ MAXIMUM TRUST & TRANSPARENCY");
  console.log("🎯 Network:", (await deployer.provider.getNetwork()).name);
  
  // ============ TRUST GUARANTEES ============
  
  console.log("\n🛡️ TRUST GUARANTEES:");
  console.log("✅ Contract is NON-UPGRADEABLE");
  console.log("✅ No proxy patterns");
  console.log("✅ No admin functions to steal funds");
  console.log("✅ Maximum fee rate hardcoded to 10%");
  console.log("✅ Flash loan limits have absolute maximums");
  console.log("✅ All admin functions are transparent");
  console.log("✅ Code is immutable after deployment");
  
  console.log("\n📄 Save these addresses:");
  console.log(`L2_FLASH_POOL_IMMUTABLE="${poolAddress}"`);
  console.log(`MEV_RECEIVER_IMMUTABLE="${receiverAddress}"`);
  
  return {
    l2FlashPool: poolAddress,
    mevReceiver: receiverAddress
  };
}

main()
  .then((addresses) => {
    console.log("✅ IMMUTABLE Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
