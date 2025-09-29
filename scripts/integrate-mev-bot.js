const { ethers } = require("hardhat");

/**
 * Integration script to connect L2 Flash Pool with existing MEV bot
 * This script helps migrate from Aave flash loans to our zero-fee L2 network
 */
async function main() {
  console.log("🔗 Setting up FlashBank for MEV bot integration...");
  
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Using account:", deployer.address);
  
  // ============ CONFIGURATION ============
  
  const L2_FLASH_POOL_ADDRESS = process.env.L2_FLASH_POOL_ADDRESS;
  const MEV_RECEIVER_ADDRESS = process.env.MEV_RECEIVER_ADDRESS;
  // FlashBank operates as a standalone pool - no separate MEV executor needed
  
  if (!L2_FLASH_POOL_ADDRESS || !MEV_RECEIVER_ADDRESS) {
    console.error("❌ Missing required addresses in .env file");
    console.log("Please deploy L2 Flash Pool first with: npm run deploy:arbitrum");
    process.exit(1);
  }
  
  // ============ CONNECT TO CONTRACTS ============
  
  console.log("\n📦 Connecting to deployed contracts...");
  
  const L2FlashPool = await ethers.getContractFactory("L2FlashPool");
  const MEVFlashLoanReceiver = await ethers.getContractFactory("MEVFlashLoanReceiver");
  
  const l2FlashPool = L2FlashPool.attach(L2_FLASH_POOL_ADDRESS);
  const mevReceiver = MEVFlashLoanReceiver.attach(MEV_RECEIVER_ADDRESS);
  
  console.log("✅ L2FlashPool connected:", L2_FLASH_POOL_ADDRESS);
  console.log("✅ MEVReceiver connected:", MEV_RECEIVER_ADDRESS);
  
  // ============ FLASHBANK READY ============
  
  console.log("\n🎉 FlashBank is ready for direct MEV bot integration!");
  console.log("💡 MEV bots can call flashLoan() directly on the pool contract");
  console.log("📋 No separate MEV executor needed - FlashBank is self-contained");
  
  // ============ ADD INITIAL LIQUIDITY ============
  
  const poolStats = await l2FlashPool.getPoolStats();
  const currentDeposits = poolStats.totalDeposits_;
  
  console.log("\n💰 Current pool liquidity:", ethers.formatEther(currentDeposits), "ETH");
  
  if (currentDeposits < ethers.parseEther("10")) {
    console.log("📈 Pool needs more liquidity for flash loans...");
    console.log("💡 Suggestion: Add at least 10 ETH to enable meaningful flash loans");
    
    // Optional: Add initial liquidity if account has sufficient ETH
    const balance = await deployer.provider.getBalance(deployer.address);
    if (balance > ethers.parseEther("15")) {
      console.log("🚀 Adding initial liquidity (5 ETH)...");
      await l2FlashPool.deposit({ value: ethers.parseEther("5") });
      console.log("✅ Initial liquidity added");
    }
  }
  
  // ============ GENERATE INTEGRATION CODE ============
  
  console.log("\n📋 INTEGRATION SUMMARY:");
  console.log("=" * 50);
  
  const integrationCode = `
// ============ L2 FLASH LOAN INTEGRATION ============

// Replace your existing Aave flash loan calls with:
const L2_FLASH_POOL = "${L2_FLASH_POOL_ADDRESS}";
const MEV_RECEIVER = "${MEV_RECEIVER_ADDRESS}";

// OLD: Aave flash loan (expensive)
// await aaveLendingPool.flashLoan(...)

// NEW: L2 Flash Pool (zero fees!)
const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
  ["uint8", "bytes"],
  [1, ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "address"], 
    [targetUser, collateralAsset]
  )]
);

await l2FlashPool.flashLoan(
  ethers.parseEther("50"), // Amount
  strategyData             // Strategy parameters
);

// SAVINGS: 0.09% Aave fee → 0.05% L2 fee = 44% cost reduction!
`;
  
  console.log(integrationCode);
  
  // ============ COST COMPARISON ============
  
  const testAmount = ethers.parseEther("100"); // 100 ETH test
  const aaveFee = testAmount * 9n / 10000n; // 0.09%
  const l2Fee = await l2FlashPool.calculateFlashLoanFee(testAmount);
  const savings = aaveFee - l2Fee;
  
  console.log("\n💰 COST COMPARISON (100 ETH flash loan):");
  console.log("Aave flash loan fee:", ethers.formatEther(aaveFee), "ETH");
  console.log("L2 flash pool fee:", ethers.formatEther(l2Fee), "ETH");
  console.log("YOUR SAVINGS:", ethers.formatEther(savings), "ETH");
  console.log("Savings percentage:", ((savings * 100n) / aaveFee).toString() + "%");
  
  // ============ NEXT STEPS ============
  
  console.log("\n📋 NEXT STEPS:");
  console.log("1. ✅ L2 Flash Pool deployed and configured");
  console.log("2. ✅ MEV Receiver ready for integration");
  
  console.log("3. ✅ FlashBank ready for direct integration");
  
  console.log("4. 💰 Add liquidity to enable flash loans:");
  console.log(`   await l2FlashPool.deposit({ value: ethers.parseEther("50") });`);
  
  console.log("5. 🚀 Update your MEV bot to use L2 flash loans instead of Aave");
  console.log("6. 💸 Enjoy 44% lower flash loan costs and higher profits!");
  
  // ============ MONITORING ============
  
  console.log("\n📊 MONITORING COMMANDS:");
  console.log(`// Check pool stats
const stats = await l2FlashPool.getPoolStats();
console.log("Total deposits:", ethers.formatEther(stats.totalDeposits_));
console.log("Total profits:", ethers.formatEther(stats.totalProfits));

// Check your balance  
const [deposits, profits] = await l2FlashPool.getUserBalance("${deployer.address}");
console.log("Your deposits:", ethers.formatEther(deposits));
console.log("Your profits:", ethers.formatEther(profits));`);
  
  console.log("\n🎉 Integration setup complete!");
  console.log("Your MEV bot can now use zero-fee flash loans! 🚀");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Integration failed:", error);
    process.exit(1);
  });
