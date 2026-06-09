const { expect } = require("chai");
const { ethers } = require("hardhat");

// FlashBankRouterV3 hardens the live v2.1 router: a capped owner fee, no single-signature
// emergency paths, a timelock on adverse changes, an on-chain maxFee pin for borrowers, and a
// permissionless reconcile(). These tests cover the new behaviour alongside the unchanged core.
describe("FlashBankRouterV3", () => {
	let deployer, admin, provider, provider2, user, stranger;
	let router, mockWETH, proofSink, demoCounter, demoBorrower, v3Borrower;
	let tokenAddress, routerAddress, v3BorrowerAddress;

	const feeBps = 2;
	const commitment = ethers.parseEther("5");
	const loanAmount = ethers.parseEther("1");
	const CONFIG_TIMELOCK = 2 * 24 * 60 * 60; // 2 days, mirrors the contract constant

	// Mirrors the on-chain TokenConfig struct.
	function tokenConfig(overrides = {}) {
		return {
			enabled: true,
			supportsPermit: false,
			feeBps,
			maxFlashLoan: ethers.parseEther("100"),
			wrapper: tokenAddress,
			maxBorrowBps: 10_000,
			ownerFeeBps: 0,
			...overrides,
		};
	}

	async function increaseTime(seconds) {
		await ethers.provider.send("evm_increaseTime", [seconds]);
		await ethers.provider.send("evm_mine", []);
	}

	// Dual-control + timelock helper: owner proposes, time advances, admin executes.
	async function timelockedConfig(cfg) {
		await router.connect(deployer).proposeTokenConfig(tokenAddress, cfg);
		await increaseTime(CONFIG_TIMELOCK + 1);
		await router.connect(admin).executeTokenConfig(tokenAddress, cfg);
	}

	beforeEach(async () => {
		[deployer, admin, provider, provider2, user, stranger] = await ethers.getSigners();

		const wethFactory = await ethers.getContractFactory("MockWETH");
		mockWETH = await wethFactory.deploy();
		await mockWETH.waitForDeployment();
		tokenAddress = await mockWETH.getAddress();

		await mockWETH.connect(provider).deposit({ value: ethers.parseEther("10") });
		await mockWETH.connect(provider2).deposit({ value: ethers.parseEther("10") });

		const routerFactory = await ethers.getContractFactory("FlashBankRouterV3");
		// v3 bootstraps initial tokens in the constructor (no providers yet ⇒ no timelock needed).
		router = await routerFactory.deploy(admin.address, [tokenAddress], [tokenConfig()]);
		await router.waitForDeployment();
		routerAddress = await router.getAddress();

		await mockWETH.connect(provider).approve(routerAddress, ethers.MaxUint256);
		await router.connect(provider).setCommitment(tokenAddress, commitment, 0, false);

		const proofFactory = await ethers.getContractFactory("ProofOfFunds");
		proofSink = await proofFactory.deploy();
		await proofSink.waitForDeployment();

		const counterFactory = await ethers.getContractFactory("DemoCounter");
		demoCounter = await counterFactory.deploy();
		await demoCounter.waitForDeployment();

		const demoFactory = await ethers.getContractFactory("DemoFlashBorrower");
		demoBorrower = await demoFactory.deploy(
			routerAddress,
			tokenAddress,
			await proofSink.getAddress(),
			await demoCounter.getAddress()
		);
		await demoBorrower.waitForDeployment();

		const v3Factory = await ethers.getContractFactory("MockV3Borrower");
		v3Borrower = await v3Factory.deploy(routerAddress, tokenAddress);
		await v3Borrower.waitForDeployment();
		v3BorrowerAddress = await v3Borrower.getAddress();

		// Fund the ERC20-path borrower with enough WETH to cover fees on repayment.
		await mockWETH.connect(deployer).deposit({ value: ethers.parseEther("0.05") });
		await mockWETH.connect(deployer).transfer(v3BorrowerAddress, ethers.parseEther("0.05"));
	});

	describe("deployment", () => {
		it("reports version 3.0.0 and bootstraps the constructor config", async () => {
			expect(await router.VERSION()).to.equal("3.0.0");
			expect((await router.tokenConfigs(tokenAddress)).feeBps).to.equal(feeBps);
			expect(await router.admin()).to.equal(admin.address);
		});

		it("requires a non-zero admin", async () => {
			const routerFactory = await ethers.getContractFactory("FlashBankRouterV3");
			await expect(routerFactory.deploy(ethers.ZeroAddress, [], [])).to.be.revertedWith("Invalid admin");
		});

		it("rejects mismatched constructor arrays", async () => {
			const routerFactory = await ethers.getContractFactory("FlashBankRouterV3");
			await expect(routerFactory.deploy(admin.address, [tokenAddress], []))
				.to.be.revertedWithCustomError(routerFactory, "LengthMismatch");
		});

		it("rejects an owner fee above the cap at construction", async () => {
			const routerFactory = await ethers.getContractFactory("FlashBankRouterV3");
			await expect(
				routerFactory.deploy(admin.address, [tokenAddress], [tokenConfig({ ownerFeeBps: 2001 })])
			).to.be.revertedWithCustomError(routerFactory, "InvalidFee");
		});
	});

	describe("flash loans (core, unchanged)", () => {
		it("executes a native flash loan and repays providers with fees", async () => {
			const providerBefore = await mockWETH.balanceOf(provider.address);
			const fee = await router.quoteFee(tokenAddress, loanAmount);

			await expect(demoBorrower.connect(user).runDemo(loanAmount, { value: fee }))
				.to.emit(router, "FlashLoanExecuted")
				.withArgs(await demoBorrower.getAddress(), tokenAddress, loanAmount, fee, true);

			expect(await mockWETH.balanceOf(provider.address)).to.equal(providerBefore + fee);
		});

		it("reverts when the borrower refuses to repay", async () => {
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			await expect(demoBorrower.connect(user).runDemoFail(loanAmount, { value: fee }))
				.to.be.revertedWithCustomError(router, "FlashLoanFailed");
		});

		it("supports the legacy ERC20 (toNative=false) path", async () => {
			const providerBefore = await mockWETH.balanceOf(provider.address);
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			await v3Borrower.borrow(loanAmount);
			expect(await mockWETH.balanceOf(provider.address)).to.equal(providerBefore + fee);
		});
	});

	describe("owner fee cap (MAX_OWNER_FEE_BPS)", () => {
		it("accrues a capped owner cut", async () => {
			await timelockedConfig(tokenConfig({ ownerFeeBps: 1000 })); // 10% of fee
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			const ownerCut = fee / 10n;
			const providerBefore = await mockWETH.balanceOf(provider.address);

			await demoBorrower.connect(user).runDemo(loanAmount, { value: fee });

			expect(await router.ownerProfits(tokenAddress)).to.equal(ownerCut);
			expect(await mockWETH.balanceOf(provider.address)).to.equal(providerBefore + (fee - ownerCut));
		});

		it("allows exactly the cap (2000 bps) but rejects above it", async () => {
			await expect(router.connect(deployer).proposeTokenConfig(tokenAddress, tokenConfig({ ownerFeeBps: 2000 })))
				.to.emit(router, "ChangeProposed");
			await expect(router.connect(deployer).proposeTokenConfig(tokenAddress, tokenConfig({ ownerFeeBps: 2001 })))
				.to.be.revertedWithCustomError(router, "InvalidFee");
		});
	});

	describe("config validation", () => {
		it("rejects a fee outside the band and a too-small borrow cap", async () => {
			await expect(router.connect(deployer).proposeTokenConfig(tokenAddress, tokenConfig({ feeBps: 0 })))
				.to.be.revertedWithCustomError(router, "InvalidFee");
			await expect(router.connect(deployer).proposeTokenConfig(tokenAddress, tokenConfig({ feeBps: 101 })))
				.to.be.revertedWithCustomError(router, "InvalidFee");
			await expect(router.connect(deployer).proposeTokenConfig(tokenAddress, tokenConfig({ maxBorrowBps: 99 })))
				.to.be.revertedWithCustomError(router, "InvalidAmount");
		});

		it("enforces the per-tx max-borrow share of the pool", async () => {
			await timelockedConfig(tokenConfig({ maxBorrowBps: 1000 })); // 10% of 5 ETH = 0.5 ETH
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			await expect(demoBorrower.connect(user).runDemo(loanAmount, { value: fee }))
				.to.be.revertedWithCustomError(router, "ExceedsMaxBorrowLimit");
		});
	});

	describe("timelock + dual control", () => {
		it("sets an eta on propose and blocks execution until it elapses", async () => {
			const cfg = tokenConfig({ feeBps: 5 });
			const hash = ethers.keccak256(
				ethers.AbiCoder.defaultAbiCoder().encode(
					["string", "address", "tuple(bool,bool,uint16,uint256,address,uint16,uint16)"],
					["config", tokenAddress, [cfg.enabled, cfg.supportsPermit, cfg.feeBps, cfg.maxFlashLoan, cfg.wrapper, cfg.maxBorrowBps, cfg.ownerFeeBps]]
				)
			);

			await router.connect(deployer).proposeTokenConfig(tokenAddress, cfg);
			expect(await router.pendingChangeEta(hash)).to.be.greaterThan(0);
			expect(await router.isChangeReady(hash)).to.equal(false);

			await expect(router.connect(admin).executeTokenConfig(tokenAddress, cfg))
				.to.be.revertedWithCustomError(router, "ChangeNotReady");

			await increaseTime(CONFIG_TIMELOCK + 1);
			expect(await router.isChangeReady(hash)).to.equal(true);
			await expect(router.connect(admin).executeTokenConfig(tokenAddress, cfg))
				.to.emit(router, "TokenConfigUpdated");
			expect((await router.tokenConfigs(tokenAddress)).feeBps).to.equal(5);
		});

		it("rejects an execute that was never proposed", async () => {
			await expect(router.connect(admin).executeTokenConfig(tokenAddress, tokenConfig({ feeBps: 7 })))
				.to.be.revertedWithCustomError(router, "ChangeNotProposed");
		});

		it("rejects a non-admin executor", async () => {
			const cfg = tokenConfig({ feeBps: 5 });
			await router.connect(deployer).proposeTokenConfig(tokenAddress, cfg);
			await increaseTime(CONFIG_TIMELOCK + 1);
			await expect(router.connect(stranger).executeTokenConfig(tokenAddress, cfg))
				.to.be.revertedWithCustomError(router, "NotAdmin");
		});

		it("lets the owner cancel a pending change", async () => {
			const cfg = tokenConfig({ feeBps: 9 });
			await router.connect(deployer).proposeTokenConfig(tokenAddress, cfg);
			const hash = ethers.keccak256(
				ethers.AbiCoder.defaultAbiCoder().encode(
					["string", "address", "tuple(bool,bool,uint16,uint256,address,uint16,uint16)"],
					["config", tokenAddress, [cfg.enabled, cfg.supportsPermit, cfg.feeBps, cfg.maxFlashLoan, cfg.wrapper, cfg.maxBorrowBps, cfg.ownerFeeBps]]
				)
			);
			await expect(router.connect(deployer).cancelChange(hash)).to.emit(router, "ChangeCancelled");
			await increaseTime(CONFIG_TIMELOCK + 1);
			await expect(router.connect(admin).executeTokenConfig(tokenAddress, cfg))
				.to.be.revertedWithCustomError(router, "ChangeNotProposed");
		});

		it("only the owner can cancel; cancelling a non-existent change reverts", async () => {
			await expect(router.connect(stranger).cancelChange(ethers.ZeroHash)).to.be.revertedWith("Ownable: caller is not the owner");
			await expect(router.connect(deployer).cancelChange(ethers.ZeroHash)).to.be.revertedWithCustomError(router, "ChangeNotProposed");
		});
	});

	describe("no single-signature emergency paths", () => {
		it("does not expose setTokenConfig or withdrawOwnerProfits", async () => {
			expect(router.setTokenConfig).to.equal(undefined);
			expect(router.withdrawOwnerProfits).to.equal(undefined);
		});
	});

	describe("ownership transfer (dual control, no delay)", () => {
		it("blocks direct transfer/renounce and uses propose+execute", async () => {
			await expect(router.connect(deployer).transferOwnership(stranger.address)).to.be.revertedWith("Use proposeOwnershipTransfer");
			await expect(router.connect(deployer).renounceOwnership()).to.be.revertedWith("Ownership cannot be renounced");

			await router.connect(deployer).proposeOwnershipTransfer(stranger.address);
			await router.connect(admin).executeOwnershipTransfer(stranger.address);
			expect(await router.owner()).to.equal(stranger.address);
		});

		it("lets only the owner rotate the admin", async () => {
			await expect(router.connect(stranger).setAdmin(stranger.address)).to.be.revertedWith("Ownable: caller is not the owner");
			await expect(router.connect(deployer).setAdmin(stranger.address)).to.emit(router, "AdminUpdated");
			expect(await router.admin()).to.equal(stranger.address);
		});
	});

	describe("owner profit withdrawal (dual control, no delay)", () => {
		it("accrues then withdraws via propose+execute", async () => {
			await timelockedConfig(tokenConfig({ ownerFeeBps: 1000 }));
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			await demoBorrower.connect(user).runDemo(loanAmount, { value: fee });
			const profit = await router.ownerProfits(tokenAddress);
			expect(profit).to.be.greaterThan(0);

			const before = await mockWETH.balanceOf(stranger.address);
			await router.connect(deployer).proposeProfitWithdrawal(tokenAddress, stranger.address, profit);
			await expect(router.connect(admin).executeProfitWithdrawal(tokenAddress, stranger.address, profit))
				.to.emit(router, "ChangeExecuted");

			expect(await mockWETH.balanceOf(stranger.address)).to.equal(before + profit);
			expect(await router.ownerProfits(tokenAddress)).to.equal(0);
		});

		it("rejects a non-admin executor and an over-withdrawal", async () => {
			await timelockedConfig(tokenConfig({ ownerFeeBps: 1000 }));
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			await demoBorrower.connect(user).runDemo(loanAmount, { value: fee });
			const profit = await router.ownerProfits(tokenAddress);

			await router.connect(deployer).proposeProfitWithdrawal(tokenAddress, stranger.address, profit);
			await expect(router.connect(stranger).executeProfitWithdrawal(tokenAddress, stranger.address, profit))
				.to.be.revertedWithCustomError(router, "NotAdmin");
			await expect(router.connect(deployer).proposeProfitWithdrawal(tokenAddress, stranger.address, profit + 1n))
				.to.be.revertedWith("invalid amount");
		});
	});

	describe("on-chain maxFee pin", () => {
		it("succeeds when the fee is within the borrower's ceiling", async () => {
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			const providerBefore = await mockWETH.balanceOf(provider.address);
			await v3Borrower.borrowWithMaxFee(loanAmount, fee);
			expect(await mockWETH.balanceOf(provider.address)).to.equal(providerBefore + fee);
		});

		it("reverts when the fee would exceed the ceiling", async () => {
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			await expect(v3Borrower.borrowWithMaxFee(loanAmount, fee - 1n))
				.to.be.revertedWithCustomError(router, "FeeExceedsMax");
		});
	});

	describe("reentrancy", () => {
		it("blocks a nested flashLoan from inside the callback", async () => {
			await v3Borrower.setReenter(true);
			await expect(v3Borrower.borrow(loanAmount)).to.be.revertedWithCustomError(router, "FlashLoanFailed");
		});
	});

	describe("reconcile", () => {
		it("sweeps expired commitments so totalCommitted cannot overstate liquidity", async () => {
			const block = await ethers.provider.getBlock("latest");
			const expiry = block.timestamp + 1000;
			await mockWETH.connect(provider2).approve(routerAddress, ethers.MaxUint256);
			await router.connect(provider2).setCommitment(tokenAddress, ethers.parseEther("3"), expiry, false);

			expect(await router.totalCommitted(tokenAddress)).to.equal(commitment + ethers.parseEther("3"));

			await increaseTime(2000); // provider2 commitment is now expired but not yet swept
			expect(await router.totalCommitted(tokenAddress)).to.equal(commitment + ethers.parseEther("3"));

			await router.reconcile(tokenAddress);
			expect(await router.totalCommitted(tokenAddress)).to.equal(commitment);

			const info = await router.getProviderInfo(tokenAddress, provider2.address);
			expect(info.paused).to.equal(true);
		});

		it("excludes an expired provider from new loans even before reconcile", async () => {
			const blk = await ethers.provider.getBlock("latest");
			await mockWETH.connect(provider2).approve(routerAddress, ethers.MaxUint256);
			await router.connect(provider2).setCommitment(tokenAddress, ethers.parseEther("3"), blk.timestamp + 1000, false);
			await increaseTime(2000);

			// provider (5) + now-expired provider2 (3): a 6 ETH loan needs both, but the expired
			// commitment must be skipped, so the loan cannot be funded.
			const fee = await router.quoteFee(tokenAddress, ethers.parseEther("6"));
			await expect(demoBorrower.connect(user).runDemo(ethers.parseEther("6"), { value: fee }))
				.to.be.revertedWithCustomError(router, "InsufficientCommittedLiquidity");
		});

		it("reverts reconcile for an unconfigured token", async () => {
			await expect(router.reconcile(stranger.address)).to.be.revertedWithCustomError(router, "TokenNotConfigured");
		});
	});
});
