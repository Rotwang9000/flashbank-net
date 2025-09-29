const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🔥 FlashBankRevolutionary - Revolutionary Flash Loan System", function () {
  let flashBank;
  let owner;
  let alice;
  let bob;
  let carol;
  let meoBot;
  let addrs;

  const FLASH_LOAN_FEE_RATE = 2; // 0.02%

  beforeEach(async function () {
    [owner, alice, bob, carol, meoBot, ...addrs] = await ethers.getSigners();

    // Deploy the revolutionary contract
    const FlashBankRevolutionary = await ethers.getContractFactory("FlashBankRevolutionary");
    flashBank = await FlashBankRevolutionary.deploy(await owner.getAddress());
    await flashBank.waitForDeployment();
  });

  describe("🏦 Commitment System Tests", function () {
    it("Should allow users to commit liquidity", async function () {
      const commitmentAmount = ethers.parseEther("10");

      // Alice commits 10 ETH
      await expect(flashBank.connect(alice).commitLiquidity(commitmentAmount))
        .to.emit(flashBank, "LiquidityCommitted")
        .withArgs(alice.address, commitmentAmount);

      expect(await flashBank.userCommitments(alice.address)).to.equal(commitmentAmount);
      expect(await flashBank.totalCommittedLiquidity()).to.equal(commitmentAmount);
      expect(await flashBank.liquidityProviders(0)).to.equal(alice.address);
    });

    it("Should prevent commitments below minimum", async function () {
      const tooSmallAmount = ethers.parseEther("0.005"); // Below 0.01 ETH

      await expect(
        flashBank.connect(alice).commitLiquidity(tooSmallAmount)
      ).to.be.revertedWithCustomError(flashBank, "CommitmentTooSmall");
    });

    it("Should prevent commitments above maximum per user", async function () {
      const tooLargeAmount = ethers.parseEther("1001"); // Above 1000 ETH

      await expect(
        flashBank.connect(alice).commitLiquidity(tooLargeAmount)
      ).to.be.revertedWithCustomError(flashBank, "CommitmentTooLarge");
    });

    it("Should allow multiple users to commit liquidity", async function () {
      const aliceAmount = ethers.parseEther("10");
      const bobAmount = ethers.parseEther("20");
      const carolAmount = ethers.parseEther("15");

      await flashBank.connect(alice).commitLiquidity(aliceAmount);
      await flashBank.connect(bob).commitLiquidity(bobAmount);
      await flashBank.connect(carol).commitLiquidity(carolAmount);

      expect(await flashBank.totalCommittedLiquidity()).to.equal(
        aliceAmount + bobAmount + carolAmount
      );
      expect(await flashBank.liquidityProviders(0)).to.equal(alice.address);
      expect(await flashBank.liquidityProviders(1)).to.equal(bob.address);
      expect(await flashBank.liquidityProviders(2)).to.equal(carol.address);
    });
  });

  describe("💰 Commitment Withdrawal Tests", function () {
    beforeEach(async function () {
      await flashBank.connect(alice).commitLiquidity(ethers.parseEther("10"));
      await flashBank.connect(bob).commitLiquidity(ethers.parseEther("20"));
    });

    it("Should allow users to withdraw their commitment", async function () {
      const withdrawAmount = ethers.parseEther("5");

      await expect(flashBank.connect(alice).withdrawCommitment(withdrawAmount))
        .to.emit(flashBank, "LiquidityWithdrawn")
        .withArgs(alice.address, withdrawAmount);

      expect(await flashBank.userCommitments(alice.address)).to.equal(ethers.parseEther("5"));
      expect(await flashBank.totalCommittedLiquidity()).to.equal(ethers.parseEther("25"));
    });

    it("Should allow users to withdraw all commitment (amount = 0)", async function () {
      await flashBank.connect(alice).withdrawCommitment(0);

      expect(await flashBank.userCommitments(alice.address)).to.equal(0);
      expect(await flashBank.totalCommittedLiquidity()).to.equal(ethers.parseEther("20"));
    });

    it("Should remove users from provider list when commitment is zero", async function () {
      await flashBank.connect(alice).withdrawCommitment(0);

      expect(await flashBank.isLiquidityProvider(alice.address)).to.be.false;
    });
  });

  describe("⚡ Revolutionary Flash Loan Tests", function () {
    beforeEach(async function () {
      // Set up commitments: Alice 40%, Bob 30%, Carol 30%
      await flashBank.connect(alice).commitLiquidity(ethers.parseEther("40"));
      await flashBank.connect(bob).commitLiquidity(ethers.parseEther("30"));
      await flashBank.connect(carol).commitLiquidity(ethers.parseEther("30"));

      // Fund users with ETH for flash loans
      await owner.sendTransaction({
        to: alice.address,
        value: ethers.parseEther("50")
      });
      await owner.sendTransaction({
        to: bob.address,
        value: ethers.parseEther("50")
      });
      await owner.sendTransaction({
        to: carol.address,
        value: ethers.parseEther("50")
      });
    });

    it("Should execute flash loan with proportional pulls", async function () {
      const flashLoanAmount = ethers.parseEther("30");

      // Deploy a mock flash loan receiver that succeeds
      const MockFlashLoanReceiver = await ethers.getContractFactory("MockFlashLoanReceiver");
      const mockReceiver = await MockFlashLoanReceiver.deploy(true, true);
      await mockReceiver.waitForDeployment();

      const initialContractBalance = await ethers.provider.getBalance(await flashBank.getAddress());
      const initialAliceBalance = await ethers.provider.getBalance(alice.address);
      const initialBobBalance = await ethers.provider.getBalance(bob.address);
      const initialCarolBalance = await ethers.provider.getBalance(carol.address);

      // Execute flash loan
      await expect(flashBank.connect(mockReceiver.target).flashLoan(flashLoanAmount, "0x"))
        .to.emit(flashBank, "FlashLoanExecuted");

      const finalContractBalance = await ethers.provider.getBalance(await flashBank.getAddress());
      const finalAliceBalance = await ethers.provider.getBalance(alice.address);
      const finalBobBalance = await ethers.provider.getBalance(bob.address);
      const finalCarolBalance = await ethers.provider.getBalance(carol.address);

      // Contract should have fee (0.02% of 30 ETH = 0.006 ETH)
      expect(finalContractBalance - initialContractBalance).to.equal(ethers.parseEther("0.006"));

      // Users should have received proportional profits
      // Alice: 0.006 × 40% = 0.0024 ETH profit
      // Bob: 0.006 × 30% = 0.0018 ETH profit
      // Carol: 0.006 × 30% = 0.0018 ETH profit

      expect(await flashBank.userProfitShares(alice.address)).to.equal(ethers.parseEther("0.0024"));
      expect(await flashBank.userProfitShares(bob.address)).to.equal(ethers.parseEther("0.0018"));
      expect(await flashBank.userProfitShares(carol.address)).to.equal(ethers.parseEther("0.0018"));
    });

    it("Should fail flash loan if insufficient total liquidity", async function () {
      // Try to borrow more than committed liquidity
      const tooLargeAmount = ethers.parseEther("101"); // More than 100 ETH committed

      await expect(
        flashBank.connect(meoBot).flashLoan(tooLargeAmount, "0x")
      ).to.be.revertedWithCustomError(flashBank, "InsufficientLiquidity");
    });

    it("Should fail flash loan if any user has insufficient balance", async function () {
      // Fund users but make Alice have insufficient balance for her share
      await owner.sendTransaction({
        to: alice.address,
        value: ethers.parseEther("1") // Only 1 ETH, but needs 40% of 30 ETH = 12 ETH
      });
      await owner.sendTransaction({
        to: bob.address,
        value: ethers.parseEther("50")
      });
      await owner.sendTransaction({
        to: carol.address,
        value: ethers.parseEther("50")
      });

      const flashLoanAmount = ethers.parseEther("30");

      await expect(
        flashBank.connect(meoBot).flashLoan(flashLoanAmount, "0x")
      ).to.be.revertedWith("Pull failed");
    });

    it("Should return ETH to users on failed flash loan", async function () {
      // Deploy a mock receiver that fails
      const MockFlashLoanReceiver = await ethers.getContractFactory("MockFlashLoanReceiver");
      const mockReceiver = await MockFlashLoanReceiver.deploy(false, false); // succeeds=false, repay=false
      await mockReceiver.waitForDeployment();

      const initialAliceBalance = await ethers.provider.getBalance(alice.address);
      const initialBobBalance = await ethers.provider.getBalance(bob.address);
      const initialCarolBalance = await ethers.provider.getBalance(carol.address);

      // Flash loan should fail
      await expect(
        flashBank.connect(mockReceiver.target).flashLoan(ethers.parseEther("10"), "0x")
      ).to.be.revertedWithCustomError(flashBank, "FlashLoanFailed");

      const finalAliceBalance = await ethers.provider.getBalance(alice.address);
      const finalBobBalance = await ethers.provider.getBalance(bob.address);
      const finalCarolBalance = await ethers.provider.getBalance(carol.address);

      // ETH should be returned to users (no change in balances)
      expect(finalAliceBalance).to.equal(initialAliceBalance);
      expect(finalBobBalance).to.equal(initialBobBalance);
      expect(finalCarolBalance).to.equal(initialCarolBalance);
    });
  });

  describe("💸 Profit Withdrawal Tests", function () {
    beforeEach(async function () {
      // Set up commitments
      await flashBank.connect(alice).commitLiquidity(ethers.parseEther("10"));

      // Fund users
      await owner.sendTransaction({
        to: alice.address,
        value: ethers.parseEther("50")
      });
    });

    it("Should allow users to withdraw their profits", async function () {
      // Execute a successful flash loan first
      const MockFlashLoanReceiver = await ethers.getContractFactory("MockFlashLoanReceiver");
      const mockReceiver = await MockFlashLoanReceiver.deploy(true, true);
      await mockReceiver.waitForDeployment();

      await flashBank.connect(mockReceiver.target).flashLoan(ethers.parseEther("5"), "0x");

      const profitAmount = await flashBank.userProfitShares(alice.address);
      expect(profitAmount).to.be.gt(0);

      const initialBalance = await ethers.provider.getBalance(alice.address);

      await expect(flashBank.connect(alice).withdrawProfits())
        .to.emit(flashBank, "ProfitWithdrawn")
        .withArgs(alice.address, profitAmount);

      const finalBalance = await ethers.provider.getBalance(alice.address);
      expect(finalBalance - initialBalance).to.equal(profitAmount);
      expect(await flashBank.userProfitShares(alice.address)).to.equal(0);
    });

    it("Should prevent withdrawing profits when none available", async function () {
      await expect(
        flashBank.connect(alice).withdrawProfits()
      ).to.be.revertedWithCustomError(flashBank, "NoProfitsToWithdraw");
    });
  });

  describe("🔒 Security Tests", function () {
    beforeEach(async function () {
      await flashBank.connect(alice).commitLiquidity(ethers.parseEther("10"));
      await flashBank.connect(bob).commitLiquidity(ethers.parseEther("20"));
    });

    it("Should be non-upgradeable", async function () {
      const securityInfo = await flashBank.getSecurityInfo();
      expect(securityInfo.isUpgradeable).to.be.false;
    });

    it("Should enforce fee rate limits", async function () {
      // Fee rate is hardcoded in contract, cannot be changed
      expect(await flashBank.FLASH_LOAN_FEE_RATE()).to.equal(FLASH_LOAN_FEE_RATE);
    });

    it("Should have immutable constants", async function () {
      expect(await flashBank.VERSION()).to.equal("2.0.0-REVOLUTIONARY");
      expect(await flashBank.IS_UPGRADEABLE()).to.be.false;

      const deployedAt = await flashBank.DEPLOYED_AT();
      const creationBlock = await flashBank.CREATION_BLOCK();

      expect(deployedAt).to.be.gt(0);
      expect(creationBlock).to.be.gt(0);
    });

    it("Should handle edge cases gracefully", async function () {
      // Test with zero commitment
      await flashBank.connect(alice).withdrawCommitment(0);
      expect(await flashBank.userCommitments(alice.address)).to.equal(0);

      // Test profit withdrawal with no profits
      await expect(
        flashBank.connect(alice).withdrawProfits()
      ).to.be.revertedWithCustomError(flashBank, "NoProfitsToWithdraw");
    });
  });

  describe("📊 Pool Statistics Tests", function () {
    beforeEach(async function () {
      await flashBank.connect(alice).commitLiquidity(ethers.parseEther("10"));
      await flashBank.connect(bob).commitLiquidity(ethers.parseEther("20"));
    });

    it("Should provide accurate pool statistics", async function () {
      const stats = await flashBank.getPoolStats();

      expect(stats.totalCommitted).to.equal(ethers.parseEther("30"));
      expect(stats.totalProfits).to.equal(0);
      expect(stats.numProviders).to.equal(2);
      expect(stats.contractAge).to.be.gt(0);
    });

    it("Should provide accurate user balances", async function () {
      const [commitment, profits] = await flashBank.getUserBalance(alice.address);
      expect(commitment).to.equal(ethers.parseEther("10"));
      expect(profits).to.equal(0);
    });
  });

  describe("🔄 Complex Multi-User Scenarios", function () {
    beforeEach(async function () {
      // Set up uneven commitments: Alice 50%, Bob 30%, Carol 20%
      await flashBank.connect(alice).commitLiquidity(ethers.parseEther("50"));
      await flashBank.connect(bob).commitLiquidity(ethers.parseEther("30"));
      await flashBank.connect(carol).commitLiquidity(ethers.parseEther("20"));

      // Fund all users with sufficient ETH
      await owner.sendTransaction({
        to: alice.address,
        value: ethers.parseEther("60")
      });
      await owner.sendTransaction({
        to: bob.address,
        value: ethers.parseEther("60")
      });
      await owner.sendTransaction({
        to: carol.address,
        value: ethers.parseEther("60")
      });
    });

    it("Should handle flash loan with uneven commitments correctly", async function () {
      const flashLoanAmount = ethers.parseEther("20");

      const MockFlashLoanReceiver = await ethers.getContractFactory("MockFlashLoanReceiver");
      const mockReceiver = await MockFlashLoanReceiver.deploy(true, true);
      await mockReceiver.waitForDeployment();

      // Calculate expected pulls:
      // Alice: 20 × 50% = 10 ETH
      // Bob: 20 × 30% = 6 ETH
      // Carol: 20 × 20% = 4 ETH

      const initialAliceBalance = await ethers.provider.getBalance(alice.address);
      const initialBobBalance = await ethers.provider.getBalance(bob.address);
      const initialCarolBalance = await ethers.provider.getBalance(carol.address);

      await flashBank.connect(mockReceiver.target).flashLoan(flashLoanAmount, "0x");

      const finalAliceBalance = await ethers.provider.getBalance(alice.address);
      const finalBobBalance = await ethers.provider.getBalance(bob.address);
      const finalCarolBalance = await ethers.provider.getBalance(carol.address);

      // Check that ETH was pulled and returned
      expect(initialAliceBalance - finalAliceBalance).to.equal(ethers.parseEther("10"));
      expect(initialBobBalance - finalBobBalance).to.equal(ethers.parseEther("6"));
      expect(initialCarolBalance - finalCarolBalance).to.equal(ethers.parseEther("4"));

      // Check profit distribution
      // Fee: 20 × 0.02% = 0.004 ETH
      // Alice: 0.004 × 50% = 0.002 ETH
      // Bob: 0.004 × 30% = 0.0012 ETH
      // Carol: 0.004 × 20% = 0.0008 ETH

      expect(await flashBank.userProfitShares(alice.address)).to.equal(ethers.parseEther("0.002"));
      expect(await flashBank.userProfitShares(bob.address)).to.equal(ethers.parseEther("0.0012"));
      expect(await flashBank.userProfitShares(carol.address)).to.equal(ethers.parseEther("0.0008"));
    });

    it("Should handle partial flash loan when some users have insufficient balance", async function () {
      // Give Alice insufficient balance for her share
      await owner.sendTransaction({
        to: alice.address,
        value: ethers.parseEther("1") // Only 1 ETH, needs 10 ETH for 50% of 20 ETH loan
      });

      const flashLoanAmount = ethers.parseEther("20");

      await expect(
        flashBank.connect(meoBot).flashLoan(flashLoanAmount, "0x")
      ).to.be.revertedWith("Pull failed");
    });
  });
});
