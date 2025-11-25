const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FlashBankRouter", () => {
	let deployer;
	let provider;
	let user;
	let router;
	let mockWETH;
	let proofSink;
	let demoBorrower;
	let tokenAddress;
	let routerAddress;

	const feeBps = 2;
	const commitment = ethers.parseEther("5");
	const loanAmount = ethers.parseEther("1");

	beforeEach(async () => {
		[deployer, provider, user] = await ethers.getSigners();

		const wethFactory = await ethers.getContractFactory("MockWETH");
		mockWETH = await wethFactory.deploy();
		await mockWETH.waitForDeployment();
		tokenAddress = await mockWETH.getAddress();

		await mockWETH.connect(provider).deposit({ value: ethers.parseEther("10") });
		await mockWETH.connect(provider).approve(deployer.address, commitment);

		const routerFactory = await ethers.getContractFactory("FlashBankRouter");
		router = await routerFactory.deploy();
		await router.waitForDeployment();

		routerAddress = await router.getAddress();

		await router.setTokenConfig(tokenAddress, {
			enabled: true,
			supportsPermit: false,
			feeBps,
			maxFlashLoan: ethers.parseEther("100"),
			wrapper: tokenAddress
		});

		await mockWETH.connect(provider).approve(routerAddress, ethers.MaxUint256);
		await router.connect(provider).setCommitment(tokenAddress, commitment, 0, false);

		const proofFactory = await ethers.getContractFactory("ProofOfFunds");
		proofSink = await proofFactory.deploy();
		await proofSink.waitForDeployment();

		const demoFactory = await ethers.getContractFactory("DemoFlashBorrower");
		demoBorrower = await demoFactory.deploy(routerAddress, tokenAddress, await proofSink.getAddress());
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
});

