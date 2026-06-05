const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FlashBankRouter", () => {
	let deployer;
	let admin;
	let provider;
	let user;
	let stranger;
	let router;
	let mockWETH;
	let proofSink;
	let demoCounter;
	let demoBorrower;
	let tokenAddress;
	let routerAddress;

	const feeBps = 2;
	const commitment = ethers.parseEther("5");
	const loanAmount = ethers.parseEther("1");

	// Mirrors the on-chain TokenConfig struct (incl. the dual-control fields).
	function tokenConfig(overrides = {}) {
		return {
			enabled: true,
			supportsPermit: false,
			feeBps,
			maxFlashLoan: ethers.parseEther("100"),
			wrapper: tokenAddress,
			maxBorrowBps: 10_000, // allow borrowing up to 100% of the pool
			ownerFeeBps: 0, // providers receive the whole fee unless a test overrides
			...overrides,
		};
	}

	beforeEach(async () => {
		[deployer, admin, provider, user, stranger] = await ethers.getSigners();

		const wethFactory = await ethers.getContractFactory("MockWETH");
		mockWETH = await wethFactory.deploy();
		await mockWETH.waitForDeployment();
		tokenAddress = await mockWETH.getAddress();

		await mockWETH.connect(provider).deposit({ value: ethers.parseEther("10") });

		const routerFactory = await ethers.getContractFactory("FlashBankRouter");
		router = await routerFactory.deploy(admin.address);
		await router.waitForDeployment();
		routerAddress = await router.getAddress();

		await router.setTokenConfig(tokenAddress, tokenConfig());

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
	});

	it("executes a flash loan and repays providers with fees", async () => {
		const providerBalanceBefore = await mockWETH.balanceOf(provider.address);
		const fee = await router.quoteFee(tokenAddress, loanAmount);

		await expect(demoBorrower.connect(user).runDemo(loanAmount, { value: fee }))
			.to.emit(router, "FlashLoanExecuted")
			.withArgs(await demoBorrower.getAddress(), tokenAddress, loanAmount, fee, true);

		const providerBalanceAfter = await mockWETH.balanceOf(provider.address);
		expect(providerBalanceAfter).to.equal(providerBalanceBefore + fee);
	});

	it("reverts when borrower refuses to repay", async () => {
		const fee = await router.quoteFee(tokenAddress, loanAmount);
		await expect(demoBorrower.connect(user).runDemoFail(loanAmount, { value: fee }))
			.to.be.revertedWithCustomError(router, "FlashLoanFailed");
	});

	it("accrues the owner's cut of the fee when configured", async () => {
		// 10% of the fee goes to the protocol; the provider receives the rest.
		await router.setTokenConfig(tokenAddress, tokenConfig({ ownerFeeBps: 1000 }));
		const fee = await router.quoteFee(tokenAddress, loanAmount);
		const ownerCut = fee / 10n;
		const providerBefore = await mockWETH.balanceOf(provider.address);

		await demoBorrower.connect(user).runDemo(loanAmount, { value: fee });

		expect(await router.ownerProfits(tokenAddress)).to.equal(ownerCut);
		expect(await mockWETH.balanceOf(provider.address)).to.equal(providerBefore + (fee - ownerCut));
	});

	describe("dual control", () => {
		it("requires a non-zero admin at deployment", async () => {
			const routerFactory = await ethers.getContractFactory("FlashBankRouter");
			await expect(routerFactory.deploy(ethers.ZeroAddress)).to.be.revertedWith("Invalid admin");
		});

		it("needs owner to propose and admin to execute a config change", async () => {
			const cfg = tokenConfig({ feeBps: 5 });
			await router.connect(deployer).proposeTokenConfig(tokenAddress, cfg);

			// A non-admin cannot execute, even a correctly-proposed change.
			await expect(router.connect(stranger).executeTokenConfig(tokenAddress, cfg))
				.to.be.revertedWithCustomError(router, "NotAdmin");

			await expect(router.connect(admin).executeTokenConfig(tokenAddress, cfg))
				.to.emit(router, "TokenConfigUpdated");
			expect((await router.tokenConfigs(tokenAddress)).feeBps).to.equal(5);
		});

		it("rejects an admin execute that was never proposed", async () => {
			await expect(
				router.connect(admin).executeTokenConfig(tokenAddress, tokenConfig({ feeBps: 7 }))
			).to.be.revertedWithCustomError(router, "ChangeNotProposed");
		});

		it("blocks direct ownership transfer/renounce; only the propose+execute path works", async () => {
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

	describe("validation", () => {
		it("rejects a fee outside the allowed band and a too-small borrow cap", async () => {
			await expect(router.setTokenConfig(tokenAddress, tokenConfig({ feeBps: 0 }))).to.be.revertedWithCustomError(router, "InvalidFee");
			await expect(router.setTokenConfig(tokenAddress, tokenConfig({ feeBps: 101 }))).to.be.revertedWithCustomError(router, "InvalidFee");
			await expect(router.setTokenConfig(tokenAddress, tokenConfig({ maxBorrowBps: 99 }))).to.be.revertedWithCustomError(router, "InvalidAmount");
		});

		it("enforces the per-tx max-borrow share of the pool", async () => {
			// Cap borrowing at 10% of the 5 ETH pool (0.5 ETH); a 1 ETH loan must revert.
			await router.setTokenConfig(tokenAddress, tokenConfig({ maxBorrowBps: 1000 }));
			const fee = await router.quoteFee(tokenAddress, loanAmount);
			await expect(demoBorrower.connect(user).runDemo(loanAmount, { value: fee }))
				.to.be.revertedWithCustomError(router, "ExceedsMaxBorrowLimit");
		});
	});
});
