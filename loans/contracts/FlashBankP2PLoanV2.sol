// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title FlashBankP2PLoanV2
 * @notice ████ NOT YET DEPLOYED — prepared for the next version, kept here for review/testing. ████
 *
 *         The live contract is {FlashBankP2PLoan} (v1), deployed and verified on Ethereum + Base.
 *         v1 is immutable and is intentionally left untouched (its source must keep matching the
 *         on-chain bytecode). V2 is the staging ground for two additions that are *contract-level*
 *         and so cannot be retrofitted onto v1:
 *
 *           1. Token sanity validation at offer creation (see {_validateToken}).
 *           2. A graduated "cooling-off" rebate on the repayment fee (see {_effectiveFee}).
 *
 * @dev Everything else mirrors v1 exactly (time-only liquidation, no oracle, optional surplus
 *      return, listing/boost/service fees, version + terms pinning). Only the two features above
 *      and the bookkeeping they need are new. See docs/design/P2P_V2_COOLING_OFF.md for the full
 *      rationale, the economic trade-offs, and the open questions.
 *
 * ── Why a cooling-off rebate? ────────────────────────────────────────────────────────────────
 *      Concern: a lender lists a worthless/garbage token, a borrower takes it, realises it is fake
 *      and hands it straight back — yet still owes the flat fee, so the lender farms fees off bait
 *      offers. The fix: the agreed `repaymentFee` is a *maximum* that VESTS LINEARLY from ~0 over a
 *      `coolingOff` window. Repay almost immediately and you owe almost nothing; the longer you hold,
 *      the more of the agreed fee is earned, reaching the full flat fee at the end of the window and
 *      staying there for the rest of the term. This is a rebate schedule, never an increase — so it
 *      stays a *fixed fee, not interest*: the fee can only ever be ≤ the agreed amount and never
 *      accrues beyond it.
 *
 *      Abuse guard: a same-block take+repay round-trip is the signature of a free intra-block (flash)
 *      loan rather than a genuine cooling-off exit, so it is charged the FULL fee (see {_effectiveFee}).
 *      A protocol-enforced *minimum* cooling window (scaled to the term) stops a lender from setting
 *      the window so short that the rebate is meaningless.
 *
 *      Honest limitation: NONE of this can tell a "fake" token from a real one — on-chain we can only
 *      check ERC-20 conformance, never economic value. The genuine protections against value fraud are
 *      the front-end's curated mainnet allow-list (ETH/USDC for now), the cooling-off rebate, and the
 *      borrower's own due diligence.
 */
contract FlashBankP2PLoanV2 is Ownable, ReentrancyGuard {
	using SafeERC20 for IERC20;

	string public constant VERSION = "2.0.0";

	uint16 public constant FEE_DENOMINATOR = 10_000;
	uint16 public constant MAX_PROTOCOL_FEE_BPS = 100; // 1% hard cap on the listing fee
	uint64 public constant MAX_DURATION = 365 days;    // sanity cap on a loan term
	uint64 public constant MAX_GRACE_PERIOD = 90 days; // sanity cap on the grace window

	// --- Cooling-off rebate parameters (immutable, no owner knobs to abuse) -------------------
	// The mandatory minimum cooling window is the proportional share of the term, clamped between a
	// floor and a cap and never longer than the term itself. Examples: a 1-hour loan → 10 minutes
	// (floor); a 5-day loan → 12 hours; a 30-day loan → 1 day (cap). A creator may set a LONGER window
	// (more borrower-friendly) but never a shorter one.
	uint16 public constant COOLING_MIN_BPS = 1000;     // ≥ 10% of the term must be cooling-off
	uint64 public constant COOLING_MIN_FLOOR = 10 minutes;
	uint64 public constant COOLING_MIN_CAP = 1 days;
	uint8 public constant MAX_TOKEN_DECIMALS = 36;     // reject absurd ERC-20 metadata

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
		uint256 repaymentFee;        // MAX flat fee the borrower repays on top of principal (vests over coolingOff)
		uint256 protocolFee;         // listing fee snapshot (principal token), lender-paid
		address serviceFeeRecipient; // 0 = no service fee
		uint256 serviceFee;          // flat fee (principal token) deducted from disbursement
		uint64 duration;             // seconds from activation to maturity
		uint64 gracePeriod;          // seconds after maturity before default may be claimed
		uint64 offerExpiry;          // listing expiry (0 = never expires while Open)
		uint64 startTime;            // activation timestamp (0 until taken)
		uint64 startBlock;           // activation block (0 until taken) — guards the same-block fee
		uint64 coolingOff;           // seconds over which repaymentFee vests from ~0 to full
		bool listed;                 // opt-in to the interface/listing fee
		uint256 boost;               // featured-placement spend (principal token), non-refundable
		uint256 settlementValue;     // agreed rate × ALL collateral, in principal-token units (0 = full forfeit on default)
		uint64 version;              // bumped on each {updateOffer}; pinned by {takeChecked}
	}

	/// @dev Calldata bundle for {createLoan}.
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
		uint64 coolingOff;           // 0 = use the protocol minimum for this term
		bool listed;
		address serviceFeeRecipient;
		uint256 serviceFee;
		uint256 boost;
		uint256 settlementValue;
	}

	/// @dev Calldata bundle for {updateOffer}: the terms a creator may amend on an Open offer.
	struct OfferUpdate {
		uint256 repaymentFee;
		uint64 duration;
		uint64 gracePeriod;
		uint64 offerExpiry;
		uint64 coolingOff;           // 0 = use the protocol minimum for the (possibly new) term
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
	error InvalidCoolingOff();
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
	error OfferTermsMismatch();

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
	/// @dev `feePaid` is the *vested* fee actually charged (≤ repaymentFee), so the rebate is observable.
	event LoanRepaid(uint256 indexed id, address indexed borrower, address indexed lender, uint256 amountRepaid, uint256 feePaid);
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
	 * @dev Mirrors v1, plus: both tokens are sanity-validated ({_validateToken}) and the cooling-off
	 *      window is normalised against the term ({_normaliseCoolingOff}). The creator escrows their
	 *      side immediately: a lender escrows `principal + protocolFee`; a borrower escrows `collateral`.
	 * @return id The new loan id.
	 */
	function createLoan(LoanParams calldata p) external nonReentrant returns (uint256 id) {
		if (p.principal == 0 || p.collateral == 0) revert InvalidAmount();
		_validateToken(p.principalToken);
		_validateToken(p.collateralToken);
		if (p.duration == 0 || p.duration > MAX_DURATION) revert InvalidDuration();
		if (p.gracePeriod > MAX_GRACE_PERIOD) revert InvalidGracePeriod();
		if (p.offerExpiry != 0 && p.offerExpiry <= block.timestamp) revert InvalidExpiry();
		if (p.allowedTaker == msg.sender) revert InvalidRecipient();

		if (p.serviceFeeRecipient == address(0)) {
			if (p.serviceFee != 0) revert InvalidServiceFee();
		} else if (p.serviceFee >= p.principal) {
			revert InvalidServiceFee();
		}

		uint64 coolingOff = _normaliseCoolingOff(p.coolingOff, p.duration);
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
		loan.coolingOff = coolingOff;
		loan.listed = p.listed;
		loan.boost = p.boost;
		loan.settlementValue = p.settlementValue;

		userLoans[msg.sender].push(id);

		if (p.creatorIsLender) {
			_pullExact(p.principalToken, msg.sender, p.principal + protocolFee);
		} else {
			_pullExact(p.collateralToken, msg.sender, p.collateral);
		}

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
	 * @dev Unchecked variant; prefer {takeChecked} / {takeWithTerms} to pin the terms you reviewed.
	 */
	function take(uint256 id) external nonReentrant {
		_take(id);
	}

	/// @notice Accept an open offer only if its terms are still the version you reviewed.
	function takeChecked(uint256 id, uint64 expectedVersion) external nonReentrant {
		if (loans[id].version != expectedVersion) revert OfferVersionMismatch();
		_take(id);
	}

	/// @notice Accept an open offer only if its full economic terms still hash to `expectedTermsHash`.
	function takeWithTerms(uint256 id, bytes32 expectedTermsHash) external nonReentrant {
		if (_termsHash(loans[id]) != expectedTermsHash) revert OfferTermsMismatch();
		_take(id);
	}

	/// @notice The current terms hash of offer `id`. Pin this with {takeWithTerms}.
	function termsHash(uint256 id) external view returns (bytes32) {
		return _termsHash(loans[id]);
	}

	/// @dev Canonical hash of the economic terms a taker agrees to. Same scheme as v1 but with
	///      `coolingOff` added to halfB (it is now part of the agreed economics).
	function _termsHash(Loan storage loan) internal view returns (bytes32) {
		bytes32 halfA = keccak256(
			abi.encode(
				loan.creator,
				loan.creatorIsLender,
				loan.allowedTaker,
				loan.principalToken,
				loan.collateralToken,
				loan.principal,
				loan.collateral,
				loan.repaymentFee
			)
		);
		bytes32 halfB = keccak256(
			abi.encode(
				loan.protocolFee,
				loan.serviceFeeRecipient,
				loan.serviceFee,
				loan.duration,
				loan.gracePeriod,
				loan.offerExpiry,
				loan.coolingOff,
				loan.settlementValue,
				loan.listed
			)
		);
		return keccak256(abi.encode(halfA, halfB));
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
		loan.startBlock = uint64(block.number);

		address borrower = loan.creatorIsLender ? loan.taker : loan.creator;

		if (loan.creatorIsLender) {
			_pullExact(loan.collateralToken, msg.sender, loan.collateral);
		} else {
			_pullExact(loan.principalToken, msg.sender, loan.principal + loan.protocolFee);
		}

		_disburse(loan, borrower);

		uint256 maturity = block.timestamp + loan.duration;
		emit LoanActivated(id, msg.sender, uint64(block.timestamp), maturity);
	}

	/**
	 * @notice Repay `principal + vestedFee` to redeem the collateral.
	 * @dev Only the borrower may repay, and only within `maturity + gracePeriod`. The fee charged is
	 *      the *vested* portion of `repaymentFee` ({_effectiveFee}), so an early exit costs little and
	 *      a same-block round-trip costs the full fee.
	 */
	function repay(uint256 id) external nonReentrant {
		Loan storage loan = loans[id];
		if (loan.status != Status.Active) revert LoanNotActive();

		address lender = loan.creatorIsLender ? loan.creator : loan.taker;
		address borrower = loan.creatorIsLender ? loan.taker : loan.creator;
		if (msg.sender != borrower) revert NotBorrower();
		if (block.timestamp > _defaultDeadline(loan)) revert RepayWindowClosed();

		loan.status = Status.Repaid;

		uint256 feePaid = _effectiveFee(loan);
		uint256 owed = loan.principal + feePaid;
		_pullExact(loan.principalToken, borrower, owed);
		_send(loan.principalToken, lender, owed);
		_send(loan.collateralToken, borrower, loan.collateral);

		emit LoanRepaid(id, borrower, lender, owed, feePaid);
	}

	/**
	 * @notice After the repay window closes on an unpaid loan, the lender claims collateral.
	 * @dev Identical to v1: with a `settlementValue` set, the lender keeps only the collateral covering
	 *      `principal + repaymentFee` (the FULL agreed fee — default is not an early exit) and any
	 *      surplus returns to the borrower; with `settlementValue == 0` the lender takes all.
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

	/// @notice Cancel an untaken offer and reclaim the escrow (any spent `boost` is not refunded).
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
	 * @notice Amend the terms of an open offer you posted. Mirrors v1, plus the cooling-off window is
	 *         re-normalised against the (possibly new) duration.
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
		loan.coolingOff = _normaliseCoolingOff(u.coolingOff, u.duration);
		loan.settlementValue = u.settlementValue;
		loan.allowedTaker = u.allowedTaker;
		loan.serviceFeeRecipient = u.serviceFeeRecipient;
		loan.serviceFee = u.serviceFee;

		unchecked { loan.version += 1; }
		emit OfferUpdated(id, loan.version);
	}

	/// @notice Add featured-placement spend to an open offer you posted (non-refundable).
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

	/// @notice Preview the default collateral split (collateral to lender, surplus to borrower).
	function quoteDefault(uint256 id) external view returns (uint256 toLender, uint256 toBorrower) {
		return _splitCollateralOnDefault(loans[id]);
	}

	/// @notice The lender and borrower of a loan (taker is zero while the offer is Open).
	function parties(uint256 id) external view returns (address lender, address borrower) {
		Loan storage loan = loans[id];
		lender = loan.creatorIsLender ? loan.creator : loan.taker;
		borrower = loan.creatorIsLender ? loan.taker : loan.creator;
	}

	/// @notice The MAXIMUM the borrower could ever owe (principal + the full agreed fee).
	function quoteRepayment(uint256 id) external view returns (uint256) {
		Loan storage loan = loans[id];
		return loan.principal + loan.repaymentFee;
	}

	/// @notice What the borrower owes RIGHT NOW (principal + the vested fee), reflecting the rebate.
	function quoteRepaymentNow(uint256 id) external view returns (uint256) {
		Loan storage loan = loans[id];
		return loan.principal + _effectiveFee(loan);
	}

	/// @notice The fee currently vested on an active loan (≤ repaymentFee). 0 for a non-active loan.
	function effectiveFee(uint256 id) external view returns (uint256) {
		Loan storage loan = loans[id];
		if (loan.status != Status.Active) return 0;
		return _effectiveFee(loan);
	}

	/// @notice The mandatory minimum cooling-off window for a given term (pure helper for UIs).
	function minCoolingOff(uint64 duration) external pure returns (uint64) {
		return _minCoolingOff(duration);
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

	/**
	 * @dev Sanity-validate a token a creator wants to use. This rejects obviously broken/garbage
	 *      addresses (an EOA, or something that does not answer the core ERC-20 surface) and absurd
	 *      metadata. It deliberately does NOT — and cannot — judge a token's economic value; that is
	 *      what the front-end allow-list and the cooling-off rebate are for. Fee-on-transfer / rebasing
	 *      tokens are caught separately at transfer time by {_pullExact}'s exact-balance assertion.
	 */
	function _validateToken(address token) internal view {
		if (token == address(0)) revert InvalidToken();
		if (token.code.length == 0) revert InvalidToken(); // must be a contract
		// Core ERC-20 surface must answer without reverting.
		try IERC20(token).totalSupply() returns (uint256) {} catch { revert InvalidToken(); }
		try IERC20(token).balanceOf(address(this)) returns (uint256) {} catch { revert InvalidToken(); }
		// decimals() is optional metadata; if present, keep it sane.
		try IERC20Metadata(token).decimals() returns (uint8 d) {
			if (d > MAX_TOKEN_DECIMALS) revert InvalidToken();
		} catch {}
	}

	/// @dev The protocol-enforced minimum cooling window for a term (see the constants above).
	function _minCoolingOff(uint64 duration) internal pure returns (uint64) {
		uint64 byProportion = uint64((uint256(duration) * COOLING_MIN_BPS) / FEE_DENOMINATOR);
		uint64 floored = byProportion < COOLING_MIN_FLOOR ? COOLING_MIN_FLOOR : byProportion;
		uint64 capped = floored > COOLING_MIN_CAP ? COOLING_MIN_CAP : floored;
		// Never require a cooling window longer than the loan itself (matters for very short terms).
		return capped > duration ? duration : capped;
	}

	/// @dev Resolve a creator-supplied cooling window: 0 means "use the minimum"; otherwise it must be
	///      at least the minimum and at most the whole term. A longer window is allowed (more
	///      borrower-friendly); a shorter one is rejected so the rebate can never be made meaningless.
	function _normaliseCoolingOff(uint64 coolingOff, uint64 duration) internal pure returns (uint64) {
		uint64 minimum = _minCoolingOff(duration);
		if (coolingOff == 0) {
			return minimum;
		}
		if (coolingOff < minimum || coolingOff > duration) revert InvalidCoolingOff();
		return coolingOff;
	}

	/**
	 * @dev The fee actually owed on repayment — the agreed `repaymentFee` vested linearly over the
	 *      cooling window. A same-block take+repay (the signature of a free intra-block/flash loan,
	 *      not a cooling-off exit) pays the FULL fee. Rounded down, in the borrower's favour, and never
	 *      exceeds the agreed fee.
	 */
	function _effectiveFee(Loan storage loan) internal view returns (uint256) {
		uint256 fee = loan.repaymentFee;
		if (fee == 0) return 0;

		// Anti-abuse: a round-trip inside the activation block is not a genuine cooling-off exit.
		if (block.number == loan.startBlock) {
			return fee;
		}

		uint64 cooling = loan.coolingOff;
		if (cooling == 0) return fee; // defensive: created loans always normalise to a non-zero window

		uint256 elapsed = block.timestamp - loan.startTime;
		if (elapsed >= cooling) {
			return fee;
		}
		return (fee * elapsed) / cooling;
	}

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

		assert(serviceFee + toBorrower == loan.principal);
	}

	function _defaultDeadline(Loan storage loan) internal view returns (uint256) {
		return uint256(loan.startTime) + loan.duration + loan.gracePeriod;
	}

	/**
	 * @dev Split the collateral at default between lender and borrower (identical to v1). The debt used
	 *      here is `principal + repaymentFee` (the FULL agreed fee): a default is not an early exit, so
	 *      the cooling-off rebate does not apply to what the lender is owed.
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

	/// @dev Pull `amount` and require it to arrive exactly (rejects fee-on-transfer/rebasing tokens).
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
