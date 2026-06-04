const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Status enum mirror (see FlashBankP2PLoan.sol)
const Status = { None: 0n, Open: 1n, Active: 2n, Repaid: 3n, Defaulted: 4n, Cancelled: 5n };

describe("FlashBankP2PLoan", () => {
	let owner, lender, borrower, feeCollector, insurer, stranger;
	let principal, collateral, p2p;
	let principalAddr, collateralAddr, p2pAddr;

	const PRINCIPAL = ethers.parseEther("100");
	const COLLATERAL = ethers.parseEther("1");
	const REPAY_FEE = ethers.parseEther("5");
	const DURATION = 7 * 24 * 60 * 60; // 7 days
	const GRACE = 24 * 60 * 60; // 1 day
	const PROTOCOL_BPS = 50n; // 0.5%
	const MINT = ethers.parseEther("1000");

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
			listed: false,
			serviceFeeRecipient: ethers.ZeroAddress,
			serviceFee: 0n,
			boost: 0n,
			...overrides,
		};
	}

	beforeEach(async () => {
		[owner, lender, borrower, feeCollector, insurer, stranger] = await ethers.getSigners();

		const Token = await ethers.getContractFactory("MockWETH");
		principal = await Token.deploy();
		await principal.waitForDeployment();
		collateral = await Token.deploy();
		await collateral.waitForDeployment();
		principalAddr = await principal.getAddress();
		collateralAddr = await collateral.getAddress();

		const P2P = await ethers.getContractFactory("FlashBankP2PLoan");
		p2p = await P2P.deploy(feeCollector.address, PROTOCOL_BPS);
		await p2p.waitForDeployment();
		p2pAddr = await p2p.getAddress();

		for (const who of [lender, borrower, stranger]) {
			await principal.mint(who.address, MINT);
			await collateral.mint(who.address, MINT);
			await principal.connect(who).approve(p2pAddr, ethers.MaxUint256);
			await collateral.connect(who).approve(p2pAddr, ethers.MaxUint256);
		}
	});

	describe("Lender-initiated offer", () => {
		it("escrows the principal on create and returns the new id", async () => {
			await expect(p2p.connect(lender).createLoan(buildParams()))
				.to.changeTokenBalances(principal, [lender, p2p], [-PRINCIPAL, PRINCIPAL]);

			const loan = await p2p.getLoan(0);
			expect(loan.status).to.equal(Status.Open);
			expect(loan.creator).to.equal(lender.address);
			expect(loan.creatorIsLender).to.equal(true);
			expect(loan.protocolFee).to.equal(0n); // not listed => no commission
		});

		it("activates on take: borrower posts collateral and receives the principal", async () => {
			await p2p.connect(lender).createLoan(buildParams());

			await expect(p2p.connect(borrower).take(0))
				.to.changeTokenBalances(collateral, [borrower, p2p], [-COLLATERAL, COLLATERAL]);

			const loan = await p2p.getLoan(0);
			expect(loan.status).to.equal(Status.Active);
			expect(loan.taker).to.equal(borrower.address);
			// borrower walked away with the full principal
			expect(await principal.balanceOf(borrower.address)).to.equal(MINT + PRINCIPAL);
		});

		it("repays: lender earns the fixed fee, borrower redeems collateral", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);

			const owed = PRINCIPAL + REPAY_FEE;
			await expect(p2p.connect(borrower).repay(0))
				.to.emit(p2p, "LoanRepaid")
				.withArgs(0, borrower.address, lender.address, owed);

			// Lender net: -PRINCIPAL lent +owed back = +REPAY_FEE
			expect(await principal.balanceOf(lender.address)).to.equal(MINT + REPAY_FEE);
			// Collateral fully returned
			expect(await collateral.balanceOf(borrower.address)).to.equal(MINT);
			expect(await collateral.balanceOf(p2pAddr)).to.equal(0n);
		});
	});

	describe("Borrower-initiated request", () => {
		it("escrows collateral on create; lender funds on take", async () => {
			await expect(p2p.connect(borrower).createLoan(buildParams({ creatorIsLender: false })))
				.to.changeTokenBalances(collateral, [borrower, p2p], [-COLLATERAL, COLLATERAL]);

			await expect(p2p.connect(lender).take(0))
				.to.changeTokenBalances(principal, [lender, borrower], [-PRINCIPAL, PRINCIPAL]);

			const [lenderAddr, borrowerAddr] = await p2p.parties(0);
			expect(lenderAddr).to.equal(lender.address);
			expect(borrowerAddr).to.equal(borrower.address);
		});

		it("repays back to the lender and frees the collateral", async () => {
			await p2p.connect(borrower).createLoan(buildParams({ creatorIsLender: false }));
			await p2p.connect(lender).take(0);

			await p2p.connect(borrower).repay(0);
			expect(await principal.balanceOf(lender.address)).to.equal(MINT + REPAY_FEE);
			expect(await collateral.balanceOf(borrower.address)).to.equal(MINT);
		});
	});

	describe("Time-based default (no oracle)", () => {
		it("lets the lender claim collateral after maturity + grace", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);

			await time.increase(DURATION + GRACE + 1);
			expect(await p2p.isDefaultable(0)).to.equal(true);

			await expect(p2p.connect(lender).claimDefault(0))
				.to.emit(p2p, "LoanDefaulted")
				.withArgs(0, lender.address, COLLATERAL);

			// Lender holds the collateral; borrower kept the principal.
			expect(await collateral.balanceOf(lender.address)).to.equal(MINT + COLLATERAL);
			expect(await principal.balanceOf(borrower.address)).to.equal(MINT + PRINCIPAL);
			expect((await p2p.getLoan(0)).status).to.equal(Status.Defaulted);
		});

		it("blocks default before the deadline and repayment after it", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);

			await expect(p2p.connect(lender).claimDefault(0)).to.be.revertedWithCustomError(p2p, "NotYetDefaultable");

			await time.increase(DURATION + GRACE + 1);
			await expect(p2p.connect(borrower).repay(0)).to.be.revertedWithCustomError(p2p, "RepayWindowClosed");
		});
	});

	describe("Cancellation", () => {
		it("refunds the lender's escrow (principal + listing fee)", async () => {
			await p2p.connect(lender).createLoan(buildParams({ listed: true }));
			const fee = (PRINCIPAL * PROTOCOL_BPS) / 10000n;

			await expect(p2p.connect(lender).cancel(0))
				.to.changeTokenBalances(principal, [lender, p2p], [PRINCIPAL + fee, -(PRINCIPAL + fee)]);
			// Listing fee was never paid out because the loan never activated.
			expect(await principal.balanceOf(feeCollector.address)).to.equal(0n);
		});

		it("refunds the borrower's collateral", async () => {
			await p2p.connect(borrower).createLoan(buildParams({ creatorIsLender: false }));
			await expect(p2p.connect(borrower).cancel(0))
				.to.changeTokenBalances(collateral, [borrower, p2p], [COLLATERAL, -COLLATERAL]);
		});

		it("cannot be cancelled by a stranger or once taken", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await expect(p2p.connect(stranger).cancel(0)).to.be.revertedWithCustomError(p2p, "NotCreator");
			await p2p.connect(borrower).take(0);
			await expect(p2p.connect(lender).cancel(0)).to.be.revertedWithCustomError(p2p, "LoanNotOpen");
		});
	});

	describe("Optional fees", () => {
		it("listing fee: lender pays, paid to the protocol on activation", async () => {
			const fee = (PRINCIPAL * PROTOCOL_BPS) / 10000n;
			await p2p.connect(lender).createLoan(buildParams({ listed: true }));
			expect((await p2p.getLoan(0)).protocolFee).to.equal(fee);

			await expect(p2p.connect(borrower).take(0))
				.to.changeTokenBalances(principal, [feeCollector, borrower], [fee, PRINCIPAL]);
		});

		it("service fee: deducted from the borrower's disbursement, sent to the third party", async () => {
			const serviceFee = ethers.parseEther("2");
			await p2p.connect(lender).createLoan(
				buildParams({ serviceFeeRecipient: insurer.address, serviceFee })
			);

			await expect(p2p.connect(borrower).take(0)).to.changeTokenBalances(
				principal,
				[insurer, borrower],
				[serviceFee, PRINCIPAL - serviceFee]
			);

			// Borrower still repays the full principal + fixed fee.
			await p2p.connect(borrower).repay(0);
			expect(await principal.balanceOf(lender.address)).to.equal(MINT + REPAY_FEE);
		});

		it("direct P2P pays zero commission even when a protocol rate is set", async () => {
			await p2p.connect(lender).createLoan(buildParams({ listed: false }));
			await expect(p2p.connect(borrower).take(0))
				.to.changeTokenBalance(principal, feeCollector, 0n);
		});
	});

	describe("Featured boost (paid placement)", () => {
		const BOOST = ethers.parseEther("12");

		it("is paid in the principal token straight to the protocol on create", async () => {
			// One tx, two un-chained assertions (matchers can't be chained after `emit`).
			const txPromise = p2p.connect(lender).createLoan(buildParams({ boost: BOOST }));
			await expect(txPromise).to.changeTokenBalances(
				principal,
				[lender, feeCollector, p2p],
				[-(PRINCIPAL + BOOST), BOOST, PRINCIPAL] // escrow stays, boost forwarded
			);
			await expect(txPromise).to.emit(p2p, "OfferBoosted").withArgs(0, lender.address, BOOST);
			expect((await p2p.getLoan(0)).boost).to.equal(BOOST);
		});

		it("a borrower-creator pays the boost in the principal token they don't escrow", async () => {
			// Borrower escrows collateral; the boost is a separate principal-token pull.
			await expect(p2p.connect(borrower).createLoan(buildParams({ creatorIsLender: false, boost: BOOST })))
				.to.changeTokenBalances(principal, [borrower, feeCollector], [-BOOST, BOOST]);
			expect((await p2p.getLoan(0)).boost).to.equal(BOOST);
		});

		it("is NOT refunded when the offer is cancelled (advertising, not escrow)", async () => {
			await p2p.connect(lender).createLoan(buildParams({ boost: BOOST }));
			// Cancel returns only the escrowed principal; the boost stays with the protocol.
			await expect(p2p.connect(lender).cancel(0))
				.to.changeTokenBalances(principal, [lender, feeCollector], [PRINCIPAL, 0n]);
			expect(await principal.balanceOf(feeCollector.address)).to.equal(BOOST);
		});

		it("reverts a boost when no protocol recipient is set", async () => {
			await p2p.connect(owner).setProtocolFeeRecipient(ethers.ZeroAddress);
			await expect(
				p2p.connect(lender).createLoan(buildParams({ boost: BOOST }))
			).to.be.revertedWithCustomError(p2p, "InvalidRecipient");
		});

		it("does not touch escrow, repayment or default settlement", async () => {
			await p2p.connect(lender).createLoan(buildParams({ boost: BOOST }));
			await p2p.connect(borrower).take(0);
			await p2p.connect(borrower).repay(0);
			expect((await p2p.getLoan(0)).status).to.equal(Status.Repaid);
			// Nothing left escrowed and the lender still earned exactly the flat fee.
			expect(await principal.balanceOf(p2pAddr)).to.equal(0n);
			expect(await principal.balanceOf(lender.address)).to.equal(MINT + REPAY_FEE - BOOST);
		});
	});

	describe("Access control & validation", () => {
		it("rejects taking your own offer or a restricted offer", async () => {
			await p2p.connect(lender).createLoan(buildParams({ allowedTaker: borrower.address }));
			await expect(p2p.connect(lender).take(0)).to.be.revertedWithCustomError(p2p, "CannotTakeOwnOffer");
			await expect(p2p.connect(stranger).take(0)).to.be.revertedWithCustomError(p2p, "TakerNotAllowed");
			await expect(p2p.connect(borrower).take(0)).to.emit(p2p, "LoanActivated");
		});

		it("rejects taking an expired offer", async () => {
			const now = await time.latest();
			await p2p.connect(lender).createLoan(buildParams({ offerExpiry: now + 100 }));
			await time.increase(200);
			await expect(p2p.connect(borrower).take(0)).to.be.revertedWithCustomError(p2p, "OfferExpired");
		});

		it("only the borrower repays and only the lender claims default", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);
			await expect(p2p.connect(stranger).repay(0)).to.be.revertedWithCustomError(p2p, "NotBorrower");

			await time.increase(DURATION + GRACE + 1);
			await expect(p2p.connect(stranger).claimDefault(0)).to.be.revertedWithCustomError(p2p, "NotLender");
		});

		it("validates loan parameters on create", async () => {
			await expect(
				p2p.connect(lender).createLoan(buildParams({ duration: 0 }))
			).to.be.revertedWithCustomError(p2p, "InvalidDuration");

			await expect(
				p2p.connect(lender).createLoan(buildParams({ serviceFee: PRINCIPAL }))
			).to.be.revertedWithCustomError(p2p, "InvalidServiceFee");

			await expect(
				p2p.connect(lender).createLoan(
					buildParams({ serviceFeeRecipient: insurer.address, serviceFee: 0n })
				)
			).to.not.be.reverted; // zero service fee with a recipient is allowed (no-op)

			await expect(
				p2p.connect(lender).createLoan(buildParams({ principal: 0 }))
			).to.be.revertedWithCustomError(p2p, "InvalidAmount");
		});

		it("guards protocol-fee configuration", async () => {
			await expect(p2p.connect(stranger).setProtocolFeeBps(10)).to.be.revertedWith("Ownable: caller is not the owner");
			await expect(p2p.connect(owner).setProtocolFeeBps(101)).to.be.revertedWithCustomError(p2p, "InvalidProtocolFee");
			await expect(p2p.connect(owner).setProtocolFeeBps(100)).to.emit(p2p, "ProtocolFeeBpsUpdated");
		});
	});

	describe("Views", () => {
		it("quoteTake reflects what each taker must provide", async () => {
			await p2p.connect(lender).createLoan(buildParams({ listed: true }));
			const fee = (PRINCIPAL * PROTOCOL_BPS) / 10000n;

			// Lender-initiated => taker (borrower) provides collateral.
			let [token, amount] = await p2p.quoteTake(0);
			expect(token).to.equal(collateralAddr);
			expect(amount).to.equal(COLLATERAL);

			// Borrower-initiated, listed => taker (lender) provides principal + listing fee.
			await p2p.connect(borrower).createLoan(buildParams({ creatorIsLender: false, listed: true }));
			[token, amount] = await p2p.quoteTake(1);
			expect(token).to.equal(principalAddr);
			expect(amount).to.equal(PRINCIPAL + fee);

			expect(await p2p.quoteRepayment(0)).to.equal(PRINCIPAL + REPAY_FEE);
		});

		it("paginates loans", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(lender).createLoan(buildParams());

			const page = await p2p.getLoansPaged(1, 10);
			expect(page.length).to.equal(2);
			expect(await p2p.getUserLoans(lender.address)).to.deep.equal([0n, 1n, 2n]);
		});
	});

	describe("Hardening", () => {
		it("blocks reentrancy on a fund-moving path (malicious token)", async () => {
			const RE = await ethers.getContractFactory("ReentrantToken");
			const evil = await RE.deploy();
			await evil.waitForDeployment();
			const evilAddr = await evil.getAddress();

			await evil.mint(lender.address, MINT);
			await evil.mint(borrower.address, MINT);
			await evil.connect(lender).approve(p2pAddr, ethers.MaxUint256);
			await evil.connect(borrower).approve(p2pAddr, ethers.MaxUint256);

			await p2p.connect(lender).createLoan(buildParams({ principalToken: evilAddr }));
			await p2p.connect(borrower).take(0);

			// Arm the token to re-enter repay(0) on its next transfer; the guard must catch it.
			await evil.arm(p2pAddr, p2p.interface.encodeFunctionData("repay", [0]));
			await expect(p2p.connect(borrower).repay(0)).to.be.revertedWith("ReentrancyGuard: reentrant call");

			// With the attack disarmed the loan still settles cleanly.
			await evil.disarm();
			await p2p.connect(borrower).repay(0);
			expect((await p2p.getLoan(0)).status).to.equal(Status.Repaid);
			expect(await evil.balanceOf(p2pAddr)).to.equal(0n);
		});

		it("handles loans where principal and collateral are the same token", async () => {
			await p2p.connect(lender).createLoan(buildParams({ collateralToken: principalAddr }));
			await p2p.connect(borrower).take(0);
			await p2p.connect(borrower).repay(0);

			expect((await p2p.getLoan(0)).status).to.equal(Status.Repaid);
			expect(await principal.balanceOf(p2pAddr)).to.equal(0n);
		});

		it("snapshots the listing fee; later rate changes don't touch open offers", async () => {
			await p2p.connect(lender).createLoan(buildParams({ listed: true }));
			const snap = (await p2p.getLoan(0)).protocolFee;
			expect(snap).to.equal((PRINCIPAL * PROTOCOL_BPS) / 10000n);

			await p2p.connect(owner).setProtocolFeeBps(100);
			expect((await p2p.getLoan(0)).protocolFee).to.equal(snap);

			await p2p.connect(lender).createLoan(buildParams({ listed: true }));
			expect((await p2p.getLoan(1)).protocolFee).to.equal((PRINCIPAL * 100n) / 10000n);
		});

		it("allows repayment at the exact deadline", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);
			const deadline = await p2p.defaultDeadline(0);
			await time.setNextBlockTimestamp(deadline);
			await expect(p2p.connect(borrower).repay(0)).to.emit(p2p, "LoanRepaid");
		});

		it("allows default only strictly after the deadline", async () => {
			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);
			const deadline = await p2p.defaultDeadline(0);

			await time.setNextBlockTimestamp(deadline);
			await expect(p2p.connect(lender).claimDefault(0)).to.be.revertedWithCustomError(p2p, "NotYetDefaultable");

			await time.setNextBlockTimestamp(Number(deadline) + 1);
			await expect(p2p.connect(lender).claimDefault(0)).to.emit(p2p, "LoanDefaulted");
		});

		it("rejects an offer only the creator could take, and a second taker", async () => {
			await expect(
				p2p.connect(lender).createLoan(buildParams({ allowedTaker: lender.address }))
			).to.be.revertedWithCustomError(p2p, "InvalidRecipient");

			await p2p.connect(lender).createLoan(buildParams());
			await p2p.connect(borrower).take(0);
			await expect(p2p.connect(stranger).take(0)).to.be.revertedWithCustomError(p2p, "LoanNotOpen");
		});
	});

	describe("Randomised fund conservation", () => {
		it("never creates or destroys tokens across random loans", async () => {
			// Top up so funding never runs dry; conservation is checked from here on.
			for (const who of [lender, borrower]) {
				await principal.mint(who.address, ethers.parseEther("5000"));
				await collateral.mint(who.address, ethers.parseEther("5000"));
			}

			// Deterministic LCG so failures are reproducible.
			let seed = 1234567;
			const rand = () => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};
			const pick = (min, max) => min + Math.floor(rand() * (max - min + 1));

			const holders = [lender.address, borrower.address, feeCollector.address, insurer.address, p2pAddr];
			const sumBalances = async (token) => {
				let total = 0n;
				for (const h of holders) {
					total += await token.balanceOf(h);
				}
				return total;
			};

			const pBefore = await sumBalances(principal);
			const cBefore = await sumBalances(collateral);

			for (let i = 0; i < 30; i++) {
				const principalAmt = ethers.parseEther(String(pick(1, 40)));
				const collateralAmt = ethers.parseEther(String(pick(1, 40)));
				const repayFee = ethers.parseEther(String(pick(0, 8)));
				const creatorIsLender = rand() < 0.5;
				const listed = rand() < 0.5;
				const useService = rand() < 0.5;
				const boost = rand() < 0.5 ? ethers.parseEther(String(pick(0, 6))) : 0n;
				let serviceFee = useService ? ethers.parseEther(String(pick(0, 10))) : 0n;
				if (serviceFee >= principalAmt) {
					serviceFee = 0n; // keep disbursement positive
				}

				const params = buildParams({
					creatorIsLender,
					principal: principalAmt,
					collateral: collateralAmt,
					repaymentFee: repayFee,
					listed,
					serviceFeeRecipient: useService ? insurer.address : ethers.ZeroAddress,
					serviceFee: useService ? serviceFee : 0n,
					boost,
				});

				const creator = creatorIsLender ? lender : borrower;
				const taker = creatorIsLender ? borrower : lender;
				const id = await p2p.loanCount();

				await p2p.connect(creator).createLoan(params);
				await p2p.connect(taker).take(id);

				if (rand() < 0.5) {
					await p2p.connect(borrower).repay(id);
				} else {
					await time.increase(DURATION + GRACE + 1);
					await p2p.connect(lender).claimDefault(id);
				}

				// A fully-settled loan must leave nothing escrowed.
				expect(await principal.balanceOf(p2pAddr)).to.equal(0n);
				expect(await collateral.balanceOf(p2pAddr)).to.equal(0n);
			}

			expect(await sumBalances(principal)).to.equal(pBefore);
			expect(await sumBalances(collateral)).to.equal(cBefore);
		});
	});
});
