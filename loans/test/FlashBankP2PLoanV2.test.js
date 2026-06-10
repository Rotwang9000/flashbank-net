const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Status enum mirror (see FlashBankP2PLoanV2.sol)
const Status = { None: 0n, Open: 1n, Active: 2n, Repaid: 3n, Defaulted: 4n, Cancelled: 5n };

// V2 only adds two things over v1: token validation at create, and a graduated cooling-off rebate
// on the repayment fee. These tests focus on that new behaviour (plus a couple of smoke tests that
// the copied core flow still works). The exhaustive core-flow coverage lives in the v1 suite.
describe("FlashBankP2PLoanV2", () => {
	let owner, lender, borrower, stranger;
	let principal, collateral, p2p;
	let principalAddr, collateralAddr, p2pAddr;

	const PRINCIPAL = ethers.parseEther("100");
	const COLLATERAL = ethers.parseEther("1");
	const REPAY_FEE = ethers.parseEther("5");
	const DURATION = 7 * 24 * 60 * 60; // 7 days
	const GRACE = 24 * 60 * 60; // 1 day
	const MINT = ethers.parseEther("1000");

	// Cooling-off constants mirrored from the contract.
	const COOLING_MIN_BPS = 1000n;
	const COOLING_MIN_FLOOR = 10n * 60n; // 10 minutes
	const COOLING_MIN_CAP = 24n * 60n * 60n; // 1 day
	// Minimum (and default) cooling window for the 7-day term used here: 10% of 604800s = 60480s.
	const COOLING_DEFAULT_7D = (BigInt(DURATION) * COOLING_MIN_BPS) / 10_000n; // 60480
	// Anti-griefing floor: 10% of the agreed fee vests immediately (first non-activation block).
	const MIN_VESTED_FEE_BPS = 1000n;
	const FEE_FLOOR = (REPAY_FEE * MIN_VESTED_FEE_BPS) / 10_000n;
	// Vested fee at `elapsed` seconds into the default 7-day cooling window.
	const vestedFee = (elapsed) => FEE_FLOOR + ((REPAY_FEE - FEE_FLOOR) * BigInt(elapsed)) / COOLING_DEFAULT_7D;

	function buildParams(overrides = {}) {
		return {
			creatorIsLender: true,
			allowedTaker: ethers.ZeroAddress,
			principalToken: principalAddr,
			collateralToken: collateralAddr,
			principal: PRINCIPAL,
			collateral: COLLATERAL,
			repaymentFee: REPAY_FEE,
			duration: DURATION,
			gracePeriod: GRACE,
			offerExpiry: 0,
			coolingOff: 0, // 0 => use the protocol minimum for the term
			listed: false,
			serviceFeeRecipient: ethers.ZeroAddress,
			serviceFee: 0n,
			boost: 0n,
			settlementValue: 0n,
			...overrides,
		};
	}

	function buildUpdate(overrides = {}) {
		return {
			repaymentFee: REPAY_FEE,
			duration: DURATION,
			gracePeriod: GRACE,
			offerExpiry: 0,
			coolingOff: 0,
			settlementValue: 0n,
			allowedTaker: ethers.ZeroAddress,
			serviceFeeRecipient: ethers.ZeroAddress,
			serviceFee: 0n,
			...overrides,
		};
	}

	beforeEach(async () => {
		[owner, lender, borrower, stranger] = await ethers.getSigners();

		const Token = await ethers.getContractFactory("PlaygroundToken");
		principal = await Token.deploy("Test Principal", "tPRIN", 18);
		await principal.waitForDeployment();
		collateral = await Token.deploy("Test Collateral", "tCOLL", 18);
		await collateral.waitForDeployment();
		principalAddr = await principal.getAddress();
		collateralAddr = await collateral.getAddress();

		const P2P = await ethers.getContractFactory("FlashBankP2PLoanV2");
		p2p = await P2P.deploy(owner.address, 0n);
		await p2p.waitForDeployment();
		p2pAddr = await p2p.getAddress();

		for (const who of [lender, borrower, stranger]) {
			await principal.mint(who.address, MINT);
			await collateral.mint(who.address, MINT);
			await principal.connect(who).approve(p2pAddr, ethers.MaxUint256);
			await collateral.connect(who).approve(p2pAddr, ethers.MaxUint256);
		}
	});

	describe("Core flow still works", () => {
		it("creates, takes and repays the full fee after the cooling window", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);

			const loan = await p2p.getLoan(0);
			// Repay well past the cooling window: the full agreed fee is owed.
			await time.setNextBlockTimestamp(Number(loan.startTime) + Number(COOLING_DEFAULT_7D) + 100);

			const owed = PRINCIPAL + REPAY_FEE;
			await expect(p2p.connect(borrower).repay(0))
				.to.emit(p2p, "LoanRepaid")
				.withArgs(0, borrower.address, lender.address, owed, REPAY_FEE);

			expect(await principal.balanceOf(lender.address)).to.equal(MINT + REPAY_FEE);
			expect(await collateral.balanceOf(borrower.address)).to.equal(MINT);
		});
	});

	describe("Cooling-off rebate", () => {
		it("defaults the cooling window to the protocol minimum for the term", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			const loan = await p2p.getLoan(0);
			expect(loan.coolingOff).to.equal(COOLING_DEFAULT_7D);
			expect(await p2p.minCoolingOff(DURATION)).to.equal(COOLING_DEFAULT_7D);
		});

		it("charges only the 10% floor (plus a sliver) for a near-immediate exit", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);
			const loan = await p2p.getLoan(0);

			// Exit 1 second in: fee = floor + (fee - floor) * 1 / coolingOff — essentially the floor.
			await time.setNextBlockTimestamp(Number(loan.startTime) + 1);
			const expectedFee = vestedFee(1);
			expect(expectedFee).to.be.gte(FEE_FLOOR);
			expect(expectedFee).to.be.lt(FEE_FLOOR + REPAY_FEE / 1000n); // floor + <0.1% of the fee

			await expect(p2p.connect(borrower).repay(0))
				.to.emit(p2p, "LoanRepaid")
				.withArgs(0, borrower.address, lender.address, PRINCIPAL + expectedFee, expectedFee);
		});

		it("charges floor + half the remainder (55%) at the half-way point of the window", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);
			const loan = await p2p.getLoan(0);

			const half = Number(COOLING_DEFAULT_7D) / 2; // 30240s
			await time.setNextBlockTimestamp(Number(loan.startTime) + half);
			const expectedFee = FEE_FLOOR + (REPAY_FEE - FEE_FLOOR) / 2n; // 10% + 45% = 55%
			expect(expectedFee).to.equal((REPAY_FEE * 5500n) / 10_000n);

			await expect(p2p.connect(borrower).repay(0))
				.to.emit(p2p, "LoanRepaid")
				.withArgs(0, borrower.address, lender.address, PRINCIPAL + expectedFee, expectedFee);

			// Lender earned exactly the vested fee.
			expect(await principal.balanceOf(lender.address)).to.equal(MINT + expectedFee);
		});

		it("never charges less than the floor (anti-griefing: consuming a listing costs 10% of the fee)", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);
			// Next block, minimal elapsed time: a griefer who takes-and-repays to kill the listing
			// still pays the lender at least the floor.
			expect(await p2p.effectiveFee(0)).to.be.gte(FEE_FLOOR);
		});

		it("charges the FULL fee on a same-block take+repay (free-flash-loan guard)", async () => {
			await p2p.connect(lender).createLoan(buildParams());

			// Put take + repay in one block: this is the signature of an atomic free flash loan, not a
			// cooling-off exit, so the full fee must apply despite elapsed time being ~0.
			await network.provider.send("evm_setAutomine", [false]);
			const txTake = await p2p.connect(borrower).take(0, { gasLimit: 600_000 });
			const txRepay = await p2p.connect(borrower).repay(0, { gasLimit: 600_000 });
			await network.provider.send("evm_mine");
			await network.provider.send("evm_setAutomine", [true]);
			await txTake.wait();
			await txRepay.wait();

			const loan = await p2p.getLoan(0);
			expect(loan.status).to.equal(Status.Repaid);
			expect(loan.startBlock).to.be.gt(0n);
			// Full fee charged: lender net +REPAY_FEE, borrower's collateral fully returned.
			expect(await principal.balanceOf(lender.address)).to.equal(MINT + REPAY_FEE);
			expect(await collateral.balanceOf(borrower.address)).to.equal(MINT);
		});

		it("a zero repaymentFee stays zero throughout the window", async () => {
			await p2p.connect(lender).createLoan(buildParams({ repaymentFee: 0n }));
			await p2p.connect(borrower).take(0);
			const loan = await p2p.getLoan(0);
			await time.setNextBlockTimestamp(Number(loan.startTime) + Number(COOLING_DEFAULT_7D) / 4);
			await expect(p2p.connect(borrower).repay(0))
				.to.emit(p2p, "LoanRepaid")
				.withArgs(0, borrower.address, lender.address, PRINCIPAL, 0n);
		});
	});

	describe("Cooling-off bounds", () => {
		it("accepts a creator-set window between the minimum and the term", async () => {
			const twoDays = 2 * 24 * 60 * 60;
			await p2p.connect(lender).createLoan(buildParams({ coolingOff: twoDays }));
			const loan = await p2p.getLoan(0);
			expect(loan.coolingOff).to.equal(BigInt(twoDays));
		});

		it("rejects a window below the protocol minimum", async () => {
			await expect(
				p2p.connect(lender).createLoan(buildParams({ coolingOff: 600 })) // 10 min < 60480 min for 7d
			).to.be.revertedWithCustomError(p2p, "InvalidCoolingOff");
		});

		it("rejects a window longer than the loan term", async () => {
			await expect(
				p2p.connect(lender).createLoan(buildParams({ coolingOff: DURATION + 1 }))
			).to.be.revertedWithCustomError(p2p, "InvalidCoolingOff");
		});

		it("re-normalises the window when updateOffer changes the term", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			const oneDay = 24 * 60 * 60;
			await p2p.connect(lender).updateOffer(0, buildUpdate({ duration: oneDay, coolingOff: 0 }));
			const loan = await p2p.getLoan(0);
			// 10% of 1 day = 8640s, within [floor, cap].
			expect(loan.coolingOff).to.equal((BigInt(oneDay) * COOLING_MIN_BPS) / 10_000n);
		});

		it("uses the floor for very short terms and never exceeds the term", async () => {
			// 1-hour term: 10% = 360s < 600s floor, so the floor (600s) applies.
			expect(await p2p.minCoolingOff(60 * 60)).to.equal(COOLING_MIN_FLOOR);
			// 5-minute term (< floor): the whole term is the window.
			expect(await p2p.minCoolingOff(5 * 60)).to.equal(BigInt(5 * 60));
			// 30-day term: proportional share is capped at 1 day.
			expect(await p2p.minCoolingOff(30 * 24 * 60 * 60)).to.equal(COOLING_MIN_CAP);
		});
	});

	describe("Token validation", () => {
		it("rejects the zero address", async () => {
			await expect(
				p2p.connect(lender).createLoan(buildParams({ principalToken: ethers.ZeroAddress }))
			).to.be.revertedWithCustomError(p2p, "InvalidToken");
		});

		it("rejects an EOA (no contract code)", async () => {
			await expect(
				p2p.connect(lender).createLoan(buildParams({ collateralToken: stranger.address }))
			).to.be.revertedWithCustomError(p2p, "InvalidToken");
		});

		it("rejects a contract that is not ERC-20 (no totalSupply)", async () => {
			// The escrow contract itself has code but no ERC-20 surface.
			await expect(
				p2p.connect(lender).createLoan(buildParams({ principalToken: p2pAddr }))
			).to.be.revertedWithCustomError(p2p, "InvalidToken");
		});

		it("rejects a token with absurd decimals (> 36)", async () => {
			const Token = await ethers.getContractFactory("PlaygroundToken");
			const weird = await Token.deploy("Weird", "WRD", 40);
			await weird.waitForDeployment();
			await expect(
				p2p.connect(lender).createLoan(buildParams({ principalToken: await weird.getAddress() }))
			).to.be.revertedWithCustomError(p2p, "InvalidToken");
		});

		it("accepts standard ERC-20s on both sides", async () => {
			await expect(p2p.connect(lender).createLoan(buildParams())).to.not.be.reverted;
		});
	});

	describe("Default still uses the full agreed fee", () => {
		it("a defaulting borrower forfeits collateral against principal + full fee", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);
			const loan = await p2p.getLoan(0);

			// Move past maturity + grace without repaying.
			await time.setNextBlockTimestamp(Number(loan.startTime) + DURATION + GRACE + 1);
			await expect(p2p.connect(lender).claimDefault(0))
				.to.emit(p2p, "LoanDefaulted")
				.withArgs(0, lender.address, COLLATERAL, 0n);
		});
	});

	describe("Pull-payout fallback (a blocked recipient cannot brick settlement)", () => {
		let blockToken, blockAddr;

		beforeEach(async () => {
			const Block = await ethers.getContractFactory("BlocklistToken");
			blockToken = await Block.deploy();
			await blockToken.waitForDeployment();
			blockAddr = await blockToken.getAddress();
			for (const who of [lender, borrower]) {
				await blockToken.mint(who.address, MINT);
				await blockToken.connect(who).approve(p2pAddr, ethers.MaxUint256);
			}
		});

		it("repay succeeds when the lender is blocked; payout queues and is withdrawable after unblock", async () => {
			// Principal is the blocklisting token: lender lends BLOCK, borrower pledges tCOLL.
			await p2p.connect(lender).createLoan(buildParams({ principalToken: blockAddr }));
			await p2p.connect(borrower).take(0);
			const loan = await p2p.getLoan(0);

			await blockToken.setBlocked(lender.address, true);

			// Past the cooling window => the full fee is owed.
			await time.setNextBlockTimestamp(Number(loan.startTime) + Number(COOLING_DEFAULT_7D) + 10);
			const owed = PRINCIPAL + REPAY_FEE;
			await expect(p2p.connect(borrower).repay(0))
				.to.emit(p2p, "PayoutQueued").withArgs(blockAddr, lender.address, owed);

			// Borrower got their collateral back; the lender's funds are held as unclaimed.
			expect(await collateral.balanceOf(borrower.address)).to.equal(MINT);
			expect(await p2p.unclaimed(blockAddr, lender.address)).to.equal(owed);

			// Still blocked => withdraw reverts and the queued balance is preserved.
			await expect(p2p.connect(lender).withdrawUnclaimed(blockAddr)).to.be.reverted;
			expect(await p2p.unclaimed(blockAddr, lender.address)).to.equal(owed);

			// Unblock and withdraw: lender net = -PRINCIPAL escrowed +owed back = +REPAY_FEE.
			await blockToken.setBlocked(lender.address, false);
			await expect(p2p.connect(lender).withdrawUnclaimed(blockAddr))
				.to.emit(p2p, "UnclaimedWithdrawn").withArgs(blockAddr, lender.address, owed);
			expect(await blockToken.balanceOf(lender.address)).to.equal(MINT + REPAY_FEE);
			expect(await p2p.unclaimed(blockAddr, lender.address)).to.equal(0n);
		});

		it("claimDefault succeeds when the borrower blocks the surplus leg; surplus queues for them", async () => {
			// Collateral is the blocklisting token; the agreed rate values the collateral at 2x the
			// debt, so half must return to the borrower as surplus on default.
			const debt = PRINCIPAL + REPAY_FEE;
			await p2p.connect(lender).createLoan(buildParams({
				collateralToken: blockAddr,
				settlementValue: debt * 2n,
			}));
			await p2p.connect(borrower).take(0);
			const loan = await p2p.getLoan(0);

			await blockToken.setBlocked(borrower.address, true);
			await time.setNextBlockTimestamp(Number(loan.startTime) + DURATION + GRACE + 1);

			const toLender = COLLATERAL / 2n;
			const surplus = COLLATERAL - toLender;
			await expect(p2p.connect(lender).claimDefault(0))
				.to.emit(p2p, "LoanDefaulted").withArgs(0, lender.address, toLender, surplus);

			expect(await p2p.unclaimed(blockAddr, borrower.address)).to.equal(surplus);

			await blockToken.setBlocked(borrower.address, false);
			await p2p.connect(borrower).withdrawUnclaimed(blockAddr);
			expect(await blockToken.balanceOf(borrower.address)).to.equal(MINT - COLLATERAL + surplus);
		});

		it("repay queues the collateral return if the borrower is blocked on the collateral token", async () => {
			await p2p.connect(lender).createLoan(buildParams({ collateralToken: blockAddr }));
			await p2p.connect(borrower).take(0);
			const loan = await p2p.getLoan(0);

			await blockToken.setBlocked(borrower.address, true);
			await time.setNextBlockTimestamp(Number(loan.startTime) + Number(COOLING_DEFAULT_7D) + 10);
			await p2p.connect(borrower).repay(0);

			expect(await p2p.unclaimed(blockAddr, borrower.address)).to.equal(COLLATERAL);
			await blockToken.setBlocked(borrower.address, false);
			await p2p.connect(borrower).withdrawUnclaimed(blockAddr);
			expect(await blockToken.balanceOf(borrower.address)).to.equal(MINT);
		});

		it("withdrawUnclaimed reverts when nothing is queued", async () => {
			await expect(p2p.connect(stranger).withdrawUnclaimed(principalAddr))
				.to.be.revertedWithCustomError(p2p, "NothingUnclaimed");
		});
	});
});
