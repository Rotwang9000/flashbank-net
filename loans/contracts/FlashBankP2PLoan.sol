// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title FlashBankP2PLoan
 * @notice Peer-to-peer, fixed-term, collateral-backed loans. Lets two parties flashbank a
 *         loan directly: one side posts terms, the other takes them, and this contract acts
 *         only as a neutral escrow and timeline keeper. No pools, no shared liquidity, no
 *         price oracle.
 *
 * @dev Design highlights (see docs/design/P2P_LENDING_DESIGN.md):
 *      - Liquidation is purely time-based. Repay `principal + repaymentFee` before
 *        `maturity + gracePeriod` to redeem collateral; otherwise the lender claims it.
 *        No prices are read on-chain, so no oracle is required.
 *      - Optional surplus return: each offer carries a `settlementValue` (the worth of the whole
 *        collateral expressed in the principal token, agreed and frozen at origination — NOT an
 *        oracle). When set, a defaulting borrower forfeits only the collateral that covers
 *        `principal + repaymentFee`; the surplus returns to them. Left at `0`, the lender takes
 *        all collateral (a pure pledge/forfeit).
 *      - The borrower's cost is a single flat `repaymentFee`, not time-accruing interest.
 *      - Three optional fee sinks, all default-off, so a direct P2P loan pays no commission:
 *          * interface/listing fee (bps of principal, paid by the lender) charged only when
 *            the offer opts in via `listed` — this is what the front-end sets when an offer is
 *            posted "through flashbank"; calling the contract directly with `listed=false`
 *            pays nothing;
 *          * per-offer `boost` (flat, principal token) paid by the creator straight to the
 *            protocol on creation. It buys featured placement on the marketplace and is the
 *            signal a front-end ranks by (pay more, rank higher). It is non-refundable —
 *            an advertising spend, not escrow — so cancelling does not return it;
 *          * per-offer service fee (flat, any recipient) deducted from the borrower's
 *            disbursement.
 *      - ERC-20 on both sides. Fee-on-transfer / rebasing tokens are unsupported: every
 *        pull must arrive exactly or the call reverts, keeping agreed terms exact.
 */
contract FlashBankP2PLoan is Ownable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	uint16 public constant FEE_DENOMINATOR = 10_000;
	uint16 public constant MAX_PROTOCOL_FEE_BPS = 100; // 1% hard cap on the listing fee
	uint64 public constant MAX_DURATION = 365 days;    // sanity cap on a loan term
	uint64 public constant MAX_GRACE_PERIOD = 90 days; // sanity cap on the grace window

	enum Status {
		None,
		Open,
		Active,
		Repaid,
		Defaulted,
		Cancelled
	}

	struct Loan {
		address creator;             // who posted the offer
		address taker;               // who accepted it (set on activation)
		address allowedTaker;        // 0 = open market, else only this address may take
		bool creatorIsLender;        // true: creator lends; false: creator borrows
		Status status;
		address principalToken;      // asset that is lent
		address collateralToken;     // asset that is pledged
		uint256 principal;           // amount lent
		uint256 collateral;          // amount pledged
		uint256 repaymentFee;        // flat fee the borrower repays on top of principal
		uint256 protocolFee;         // listing fee snapshot (principal token), lender-paid
		address serviceFeeRecipient; // 0 = no service fee
		uint256 serviceFee;          // flat fee (principal token) deducted from disbursement
		uint64 duration;             // seconds from activation to maturity
		uint64 gracePeriod;          // seconds after maturity before default may be claimed
		uint64 offerExpiry;          // listing expiry (0 = never expires while Open)
		uint64 startTime;            // activation timestamp (0 until taken)
		bool listed;                 // opt-in to the interface/listing fee
		uint256 boost;               // featured-placement spend (principal token), non-refundable
		uint256 settlementValue;     // agreed rate × ALL collateral, in principal-token units (0 = full forfeit on default)
		uint64 version;              // bumped on each {updateOffer}; pinned by {takeChecked} to stop re-price front-running
	}

	/// @dev Calldata bundle for {createLoan} to keep the signature readable.
	struct LoanParams {
		bool creatorIsLender;
		address allowedTaker;
		address principalToken;
		address collateralToken;
		uint256 principal;
		uint256 collateral;
		uint256 repaymentFee;
		uint64 duration;
		uint64 gracePeriod;
		uint64 offerExpiry;
		bool listed;
		address serviceFeeRecipient;
		uint256 serviceFee;
		uint256 boost;
		uint256 settlementValue;
	}

	/// @dev Calldata bundle for {updateOffer}: the terms a creator may amend on an Open offer.
	///      Deliberately excludes anything that changes the escrow or the deal's identity
	///      (principal, collateral, tokens, side, listing opt-in) — cancel and re-create for those.
	struct OfferUpdate {
		uint256 repaymentFee;
		uint64 duration;
		uint64 gracePeriod;
		uint64 offerExpiry;
		uint256 settlementValue;
		address allowedTaker;
		address serviceFeeRecipient;
		uint256 serviceFee;
	}

	uint256 public loanCount;
	mapping(uint256 => Loan) private loans;
	mapping(address => uint256[]) private userLoans;

	address public protocolFeeRecipient;
	uint16 public protocolFeeBps;

	error InvalidToken();
	error InvalidAmount();
	error InvalidDuration();
	error InvalidGracePeriod();
	error InvalidExpiry();
	error InvalidServiceFee();
	error InvalidProtocolFee();
	error InvalidRecipient();
	error LoanNotOpen();
	error LoanNotActive();
	error OfferExpired();
	error NotCreator();
	error NotLender();
	error NotBorrower();
	error TakerNotAllowed();
	error CannotTakeOwnOffer();
	error RepayWindowClosed();
	error NotYetDefaultable();
	error UnexpectedTokenBalance();
	error OfferVersionMismatch();

	event ProtocolFeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
	event ProtocolFeeBpsUpdated(uint16 oldBps, uint16 newBps);

	event LoanCreated(
		uint256 indexed id,
		address indexed creator,
		bool creatorIsLender,
		address indexed principalToken,
		address collateralToken,
		uint256 principal,
		uint256 collateral
	);
	event OfferBoosted(uint256 indexed id, address indexed payer, uint256 amount);
	event OfferUpdated(uint256 indexed id, uint64 version);
	event LoanActivated(uint256 indexed id, address indexed taker, uint64 startTime, uint256 maturity);
	event LoanRepaid(uint256 indexed id, address indexed borrower, address indexed lender, uint256 amountRepaid);
	event LoanDefaulted(
		uint256 indexed id,
		address indexed lender,
		uint256 collateralToLender,
		uint256 surplusToBorrower
	);
	event LoanCancelled(uint256 indexed id, address indexed creator);

	constructor(address _protocolFeeRecipient, uint16 _protocolFeeBps) {
		if (_protocolFeeBps > MAX_PROTOCOL_FEE_BPS) revert InvalidProtocolFee();
		protocolFeeRecipient = _protocolFeeRecipient;
		protocolFeeBps = _protocolFeeBps;
		emit ProtocolFeeRecipientUpdated(address(0), _protocolFeeRecipient);
		emit ProtocolFeeBpsUpdated(0, _protocolFeeBps);
	}

	// --- Owner configuration -------------------------------------------------

	/// @notice Update where the optional protocol/listing fee is sent.
	function setProtocolFeeRecipient(address newRecipient) external onlyOwner {
		emit ProtocolFeeRecipientUpdated(protocolFeeRecipient, newRecipient);
		protocolFeeRecipient = newRecipient;
	}

	/// @notice Update the protocol/listing fee rate (basis points of principal), hard-capped.
	function setProtocolFeeBps(uint16 newBps) external onlyOwner {
		if (newBps > MAX_PROTOCOL_FEE_BPS) revert InvalidProtocolFee();
		emit ProtocolFeeBpsUpdated(protocolFeeBps, newBps);
		protocolFeeBps = newBps;
	}

	// --- Marketplace ---------------------------------------------------------

	/**
	 * @notice Post a loan offer (as lender) or a borrow request (as borrower).
	 * @dev The creator escrows their side immediately: a lender escrows
	 *      `principal + protocolFee`; a borrower escrows `collateral`. Any `boost` is pulled
	 *      in the principal token on top and forwarded to the protocol at once (not escrowed).
	 * @return id The new loan id.
	 */
	function createLoan(LoanParams calldata p) external nonReentrant returns (uint256 id) {
		if (p.principalToken == address(0) || p.collateralToken == address(0)) revert InvalidToken();
		if (p.principal == 0 || p.collateral == 0) revert InvalidAmount();
		if (p.duration == 0 || p.duration > MAX_DURATION) revert InvalidDuration();
		if (p.gracePeriod > MAX_GRACE_PERIOD) revert InvalidGracePeriod();
		if (p.offerExpiry != 0 && p.offerExpiry <= block.timestamp) revert InvalidExpiry();
		// A creator-only offer is un-takeable (you cannot take your own offer).
		if (p.allowedTaker == msg.sender) revert InvalidRecipient();

		if (p.serviceFeeRecipient == address(0)) {
			if (p.serviceFee != 0) revert InvalidServiceFee();
		} else if (p.serviceFee >= p.principal) {
			// Borrower must still receive a positive disbursement.
			revert InvalidServiceFee();
		}

		uint256 protocolFee = _quoteProtocolFee(p.listed, p.principal);

		id = loanCount++;
		Loan storage loan = loans[id];
		loan.creator = msg.sender;
		loan.allowedTaker = p.allowedTaker;
		loan.creatorIsLender = p.creatorIsLender;
		loan.status = Status.Open;
		loan.principalToken = p.principalToken;
		loan.collateralToken = p.collateralToken;
		loan.principal = p.principal;
		loan.collateral = p.collateral;
		loan.repaymentFee = p.repaymentFee;
		loan.protocolFee = protocolFee;
		loan.serviceFeeRecipient = p.serviceFeeRecipient;
		loan.serviceFee = p.serviceFee;
		loan.duration = p.duration;
		loan.gracePeriod = p.gracePeriod;
		loan.offerExpiry = p.offerExpiry;
		loan.listed = p.listed;
		loan.boost = p.boost;
		loan.settlementValue = p.settlementValue;

		userLoans[msg.sender].push(id);

		if (p.creatorIsLender) {
			_pullExact(p.principalToken, msg.sender, p.principal + protocolFee);
		} else {
			_pullExact(p.collateralToken, msg.sender, p.collateral);
		}

		// Featured-placement spend: paid in the principal token straight to the protocol now.
		// It is an advertising fee, not escrow, so it is never refunded (see {cancel}).
		if (p.boost > 0) {
			if (protocolFeeRecipient == address(0)) revert InvalidRecipient();
			_pullExact(p.principalToken, msg.sender, p.boost);
			_send(p.principalToken, protocolFeeRecipient, p.boost);
			emit OfferBoosted(id, msg.sender, p.boost);
		}

		emit LoanCreated(
			id,
			msg.sender,
			p.creatorIsLender,
			p.principalToken,
			p.collateralToken,
			p.principal,
			p.collateral
		);
	}

	/**
	 * @notice Accept an open offer, activating the loan.
	 * @dev If the creator is the lender, the taker is the borrower and supplies collateral.
	 *      If the creator is the borrower, the taker is the lender and supplies
	 *      `principal + protocolFee`. This unchecked variant accepts whatever the current terms are;
	 *      prefer {takeChecked} (which the front-end uses) to pin the terms you reviewed.
	 */
	function take(uint256 id) external nonReentrant {
		_take(id);
	}

	/**
	 * @notice Accept an open offer only if its terms are still the version you reviewed.
	 * @dev Pins `loan.version` so a creator cannot front-run your acceptance with a last-second
	 *      {updateOffer} that worsens the terms. Reverts with {OfferVersionMismatch} on any drift.
	 */
	function takeChecked(uint256 id, uint64 expectedVersion) external nonReentrant {
		if (loans[id].version != expectedVersion) revert OfferVersionMismatch();
		_take(id);
	}

	function _take(uint256 id) internal {
		Loan storage loan = loans[id];
		if (loan.status != Status.Open) revert LoanNotOpen();
		if (loan.offerExpiry != 0 && block.timestamp > loan.offerExpiry) revert OfferExpired();
		if (msg.sender == loan.creator) revert CannotTakeOwnOffer();
		if (loan.allowedTaker != address(0) && msg.sender != loan.allowedTaker) revert TakerNotAllowed();

		loan.taker = msg.sender;
		loan.status = Status.Active;
		loan.startTime = uint64(block.timestamp);

		address borrower = loan.creatorIsLender ? loan.taker : loan.creator;

		if (loan.creatorIsLender) {
			// Lender already escrowed principal + fee; taker (borrower) brings collateral.
			_pullExact(loan.collateralToken, msg.sender, loan.collateral);
		} else {
			// Borrower already escrowed collateral; taker (lender) brings principal + fee.
			_pullExact(loan.principalToken, msg.sender, loan.principal + loan.protocolFee);
		}

		_disburse(loan, borrower);

		uint256 maturity = block.timestamp + loan.duration;
		emit LoanActivated(id, msg.sender, uint64(block.timestamp), maturity);
	}

	/**
	 * @notice Repay `principal + repaymentFee` to redeem the collateral.
	 * @dev Only the borrower may repay, and only within `maturity + gracePeriod`.
	 */
	function repay(uint256 id) external nonReentrant {
		Loan storage loan = loans[id];
		if (loan.status != Status.Active) revert LoanNotActive();

		address lender = loan.creatorIsLender ? loan.creator : loan.taker;
		address borrower = loan.creatorIsLender ? loan.taker : loan.creator;
		if (msg.sender != borrower) revert NotBorrower();
		if (block.timestamp > _defaultDeadline(loan)) revert RepayWindowClosed();

		loan.status = Status.Repaid;

		uint256 owed = loan.principal + loan.repaymentFee;
		_pullExact(loan.principalToken, borrower, owed);
		_send(loan.principalToken, lender, owed);
		_send(loan.collateralToken, borrower, loan.collateral);

		emit LoanRepaid(id, borrower, lender, owed);
	}

	/**
	 * @notice After the repay window closes on an unpaid loan, the lender claims collateral.
	 * @dev If the offer set a `settlementValue`, the lender keeps only the collateral covering
	 *      `principal + repaymentFee` (valued at that agreed, frozen rate — no oracle) and the
	 *      surplus is returned to the borrower. With `settlementValue == 0` the lender takes all.
	 */
	function claimDefault(uint256 id) external nonReentrant {
		Loan storage loan = loans[id];
		if (loan.status != Status.Active) revert LoanNotActive();

		address lender = loan.creatorIsLender ? loan.creator : loan.taker;
		address borrower = loan.creatorIsLender ? loan.taker : loan.creator;
		if (msg.sender != lender) revert NotLender();
		if (block.timestamp <= _defaultDeadline(loan)) revert NotYetDefaultable();

		loan.status = Status.Defaulted;

		(uint256 toLender, uint256 toBorrower) = _splitCollateralOnDefault(loan);
		_send(loan.collateralToken, lender, toLender);
		if (toBorrower > 0) {
			_send(loan.collateralToken, borrower, toBorrower);
		}

		emit LoanDefaulted(id, lender, toLender, toBorrower);
	}

	/**
	 * @notice Cancel an offer that has not been taken and reclaim the escrow.
	 * @dev Only the escrowed side is returned; any `boost` already spent on featured
	 *      placement is not refunded.
	 */
	function cancel(uint256 id) external nonReentrant {
		Loan storage loan = loans[id];
		if (loan.status != Status.Open) revert LoanNotOpen();
		if (msg.sender != loan.creator) revert NotCreator();

		loan.status = Status.Cancelled;

		if (loan.creatorIsLender) {
			_send(loan.principalToken, loan.creator, loan.principal + loan.protocolFee);
		} else {
			_send(loan.collateralToken, loan.creator, loan.collateral);
		}

		emit LoanCancelled(id, loan.creator);
	}

	/**
	 * @notice Amend the terms of an offer you posted that has not been taken yet.
	 * @dev Only the creator, only while Open. Changes terms that do NOT touch the escrowed amount:
	 *      the agreed rate (`settlementValue`), the flat `repaymentFee`, the timing
	 *      (`duration`/`gracePeriod`/`offerExpiry`), who may take it, and the optional service fee.
	 *      Principal, collateral, tokens, side and listing opt-in are intentionally immutable here
	 *      (they alter the escrow or the deal's identity — cancel and re-create for those). The
	 *      featured `boost` is preserved, so re-pricing never forfeits it. Each call bumps
	 *      `version`, which {takeChecked} pins to protect a taker from a last-second re-price.
	 */
	function updateOffer(uint256 id, OfferUpdate calldata u) external {
		Loan storage loan = loans[id];
		if (loan.status != Status.Open) revert LoanNotOpen();
		if (msg.sender != loan.creator) revert NotCreator();
		if (u.duration == 0 || u.duration > MAX_DURATION) revert InvalidDuration();
		if (u.gracePeriod > MAX_GRACE_PERIOD) revert InvalidGracePeriod();
		if (u.offerExpiry != 0 && u.offerExpiry <= block.timestamp) revert InvalidExpiry();
		if (u.allowedTaker == msg.sender) revert InvalidRecipient();
		if (u.serviceFeeRecipient == address(0)) {
			if (u.serviceFee != 0) revert InvalidServiceFee();
		} else if (u.serviceFee >= loan.principal) {
			revert InvalidServiceFee();
		}

		loan.repaymentFee = u.repaymentFee;
		loan.duration = u.duration;
		loan.gracePeriod = u.gracePeriod;
		loan.offerExpiry = u.offerExpiry;
		loan.settlementValue = u.settlementValue;
		loan.allowedTaker = u.allowedTaker;
		loan.serviceFeeRecipient = u.serviceFeeRecipient;
		loan.serviceFee = u.serviceFee;

		unchecked { loan.version += 1; }
		emit OfferUpdated(id, loan.version);
	}

	/**
	 * @notice Add featured-placement spend to an open offer you posted.
	 * @dev Paid in the principal token straight to the protocol now (as in {createLoan}), added to
	 *      the offer's cumulative `boost`, and non-refundable. Lets a creator raise their ranking,
	 *      including alongside an {updateOffer} re-price.
	 */
	function boostOffer(uint256 id, uint256 amount) external nonReentrant {
		Loan storage loan = loans[id];
		if (loan.status != Status.Open) revert LoanNotOpen();
		if (msg.sender != loan.creator) revert NotCreator();
		if (amount == 0) revert InvalidAmount();
		if (protocolFeeRecipient == address(0)) revert InvalidRecipient();

		loan.boost += amount;
		_pullExact(loan.principalToken, msg.sender, amount);
		_send(loan.principalToken, protocolFeeRecipient, amount);
		emit OfferBoosted(id, msg.sender, amount);
	}

	// --- Views ---------------------------------------------------------------

	function getLoan(uint256 id) external view returns (Loan memory) {
		return loans[id];
	}

	/// @notice Preview how the collateral would split on default: collateral to the lender and
	///         surplus returned to the borrower (both 0/whole when `settlementValue` is unset).
	function quoteDefault(uint256 id) external view returns (uint256 toLender, uint256 toBorrower) {
		return _splitCollateralOnDefault(loans[id]);
	}

	/// @notice The lender and borrower of a loan (taker is zero while the offer is Open).
	function parties(uint256 id) external view returns (address lender, address borrower) {
		Loan storage loan = loans[id];
		lender = loan.creatorIsLender ? loan.creator : loan.taker;
		borrower = loan.creatorIsLender ? loan.taker : loan.creator;
	}

	/// @notice Total the borrower must repay to redeem collateral.
	function quoteRepayment(uint256 id) external view returns (uint256) {
		Loan storage loan = loans[id];
		return loan.principal + loan.repaymentFee;
	}

	/// @notice What the taker must provide to accept an offer (token + amount).
	function quoteTake(uint256 id) external view returns (address token, uint256 amount) {
		Loan storage loan = loans[id];
		if (loan.creatorIsLender) {
			return (loan.collateralToken, loan.collateral);
		}
		return (loan.principalToken, loan.principal + loan.protocolFee);
	}

	/// @notice Timestamp after which an unpaid active loan can be defaulted by the lender.
	function defaultDeadline(uint256 id) external view returns (uint256) {
		return _defaultDeadline(loans[id]);
	}

	/// @notice True if the loan is active and past its repay window.
	function isDefaultable(uint256 id) external view returns (bool) {
		Loan storage loan = loans[id];
		return loan.status == Status.Active && block.timestamp > _defaultDeadline(loan);
	}

	/// @notice Ids of every loan a user has created.
	function getUserLoans(address user) external view returns (uint256[] memory) {
		return userLoans[user];
	}

	/// @notice Paginated read of loans by id, for marketplace listing.
	function getLoansPaged(uint256 start, uint256 limit) external view returns (Loan[] memory page) {
		uint256 total = loanCount;
		if (start >= total) {
			return new Loan[](0);
		}
		uint256 end = start + limit;
		if (end > total) {
			end = total;
		}
		page = new Loan[](end - start);
		for (uint256 i = start; i < end; i++) {
			page[i - start] = loans[i];
		}
	}

	// --- Internal ------------------------------------------------------------

	/// @dev Snapshot the listing fee: only charged when the offer opts in and a recipient exists.
	function _quoteProtocolFee(bool listed, uint256 principal) internal view returns (uint256) {
		if (!listed || protocolFeeRecipient == address(0) || protocolFeeBps == 0) {
			return 0;
		}
		return (principal * protocolFeeBps) / FEE_DENOMINATOR;
	}

	/// @dev On activation, split the escrowed principal side: listing fee, service fee, borrower.
	function _disburse(Loan storage loan, address borrower) internal {
		uint256 serviceFee = loan.serviceFee;
		uint256 protocolFee = loan.protocolFee;
		uint256 toBorrower = loan.principal - serviceFee; // serviceFee < principal enforced on create

		if (protocolFee > 0) {
			_send(loan.principalToken, protocolFeeRecipient, protocolFee);
		}
		if (serviceFee > 0) {
			_send(loan.principalToken, loan.serviceFeeRecipient, serviceFee);
		}
		_send(loan.principalToken, borrower, toBorrower);

		// Invariant: everything escrowed on the principal side is fully accounted for.
		assert(protocolFee + serviceFee + toBorrower == loan.principal + protocolFee);
	}

	function _defaultDeadline(Loan storage loan) internal view returns (uint256) {
		return uint256(loan.startTime) + loan.duration + loan.gracePeriod;
	}

	/**
	 * @dev Split the collateral at default between lender and borrower.
	 *      - `settlementValue == 0`: pure forfeit, the lender takes everything.
	 *      - agreed value at or below the debt: the collateral does not even cover what is owed, so
	 *        the lender takes everything and absorbs the shortfall (lender's risk, as priced in).
	 *      - agreed value above the debt: the lender keeps the debt's share of the collateral
	 *        (`collateral * debt / settlementValue`, rounded down in the borrower's favour) and the
	 *        remainder returns to the borrower.
	 *      `settlementValue` is a fixed term agreed at origination; no price is read on-chain.
	 */
	function _splitCollateralOnDefault(Loan storage loan)
		internal
		view
		returns (uint256 toLender, uint256 toBorrower)
	{
		uint256 collateral = loan.collateral;
		uint256 settlementValue = loan.settlementValue;
		uint256 debt = loan.principal + loan.repaymentFee;

		if (settlementValue == 0 || settlementValue <= debt) {
			return (collateral, 0);
		}

		toLender = Math.mulDiv(collateral, debt, settlementValue);
		toBorrower = collateral - toLender;
	}

	/// @dev Pull `amount` and require it to arrive exactly (rejects fee-on-transfer tokens).
	function _pullExact(address token, address from, uint256 amount) internal {
		if (amount == 0) {
			return;
		}
		IERC20 t = IERC20(token);
		uint256 balanceBefore = t.balanceOf(address(this));
		t.safeTransferFrom(from, address(this), amount);
		if (t.balanceOf(address(this)) - balanceBefore != amount) revert UnexpectedTokenBalance();
	}

	function _send(address token, address to, uint256 amount) internal {
		if (amount == 0) {
			return;
		}
		IERC20(token).safeTransfer(to, amount);
	}
}
