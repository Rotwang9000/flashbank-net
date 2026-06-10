// Minimal human-readable ABIs for the deployed FlashBank contracts.
//
// Kept inline (rather than importing Hardhat artifacts) so the MCP server is self-contained and
// works from a clean checkout without compiling either feature. The tuple layouts MUST mirror the
// deployed contracts exactly — see loans/contracts/FlashBankP2PLoan.sol (v1: Ethereum, Base) and
// loans/contracts/FlashBankP2PLoanV2.sol (v2: Sepolia playground), plus
// flashloans/contracts/FlashBankRouterV3.sol.

const LOAN_TUPLE_V1 =
	'tuple(address creator, address taker, address allowedTaker, bool creatorIsLender, uint8 status, ' +
	'address principalToken, address collateralToken, uint256 principal, uint256 collateral, ' +
	'uint256 repaymentFee, uint256 protocolFee, address serviceFeeRecipient, uint256 serviceFee, ' +
	'uint64 duration, uint64 gracePeriod, uint64 offerExpiry, uint64 startTime, bool listed, ' +
	'uint256 boost, uint256 settlementValue, uint64 version)';

// v2 inserts startBlock + coolingOff between startTime and listed.
const LOAN_TUPLE_V2 =
	'tuple(address creator, address taker, address allowedTaker, bool creatorIsLender, uint8 status, ' +
	'address principalToken, address collateralToken, uint256 principal, uint256 collateral, ' +
	'uint256 repaymentFee, uint256 protocolFee, address serviceFeeRecipient, uint256 serviceFee, ' +
	'uint64 duration, uint64 gracePeriod, uint64 offerExpiry, uint64 startTime, uint64 startBlock, ' +
	'uint64 coolingOff, bool listed, uint256 boost, uint256 settlementValue, uint64 version)';

const LOAN_PARAMS_TUPLE_V1 =
	'tuple(bool creatorIsLender, address allowedTaker, address principalToken, address collateralToken, ' +
	'uint256 principal, uint256 collateral, uint256 repaymentFee, uint64 duration, uint64 gracePeriod, ' +
	'uint64 offerExpiry, bool listed, address serviceFeeRecipient, uint256 serviceFee, uint256 boost, ' +
	'uint256 settlementValue)';

// v2 inserts coolingOff between offerExpiry and listed.
const LOAN_PARAMS_TUPLE_V2 =
	'tuple(bool creatorIsLender, address allowedTaker, address principalToken, address collateralToken, ' +
	'uint256 principal, uint256 collateral, uint256 repaymentFee, uint64 duration, uint64 gracePeriod, ' +
	'uint64 offerExpiry, uint64 coolingOff, bool listed, address serviceFeeRecipient, uint256 serviceFee, ' +
	'uint256 boost, uint256 settlementValue)';

const SUPPORTED_P2P_VERSIONS = Object.freeze([1, 2]);

/**
 * ABI for the deployed P2P escrow. `version` 1 = FlashBankP2PLoan (mainnets); 2 =
 * FlashBankP2PLoanV2 (Sepolia playground), which adds the cooling-off fields, vested-fee views
 * and the pull-payout surface.
 */
export function p2pAbi(version = 1) {
	if (!SUPPORTED_P2P_VERSIONS.includes(version)) {
		throw new Error(`Unsupported P2P contract version ${version}. Supported: ${SUPPORTED_P2P_VERSIONS.join(', ')}.`);
	}
	const loanTuple = version === 2 ? LOAN_TUPLE_V2 : LOAN_TUPLE_V1;
	const paramsTuple = version === 2 ? LOAN_PARAMS_TUPLE_V2 : LOAN_PARAMS_TUPLE_V1;
	const abi = [
		`function getLoan(uint256 id) view returns (${loanTuple})`,
		`function getLoansPaged(uint256 start, uint256 limit) view returns (${loanTuple}[])`,
		'function loanCount() view returns (uint256)',
		'function quoteTake(uint256 id) view returns (address token, uint256 amount)',
		'function quoteRepayment(uint256 id) view returns (uint256)',
		'function quoteDefault(uint256 id) view returns (uint256 toLender, uint256 toBorrower)',
		'function defaultDeadline(uint256 id) view returns (uint256)',
		'function isDefaultable(uint256 id) view returns (bool)',
		'function parties(uint256 id) view returns (address lender, address borrower)',
		'function getUserLoans(address user) view returns (uint256[])',
		'function protocolFeeBps() view returns (uint16)',
		'function protocolFeeRecipient() view returns (address)',
		`function createLoan(${paramsTuple} p) returns (uint256)`,
		// Both pinned-take variants. v2 and the current v1 build expose termsHash()/takeWithTerms()
		// (strongest); older builds pin via takeChecked(version) — feature-detected at call time.
		'function termsHash(uint256 id) view returns (bytes32)',
		'function takeWithTerms(uint256 id, bytes32 expectedTermsHash)',
		'function takeChecked(uint256 id, uint64 expectedVersion)',
		'function repay(uint256 id)',
		'function claimDefault(uint256 id)',
		'function cancel(uint256 id)',
		'event LoanCreated(uint256 indexed id, address indexed creator, bool creatorIsLender, address indexed principalToken, address collateralToken, uint256 principal, uint256 collateral)',
		version === 2
			? 'event LoanRepaid(uint256 indexed id, address indexed borrower, address indexed lender, uint256 amountRepaid, uint256 feePaid)'
			: 'event LoanRepaid(uint256 indexed id, address indexed borrower, address indexed lender, uint256 amountRepaid)',
	];
	if (version === 2) {
		abi.push(
			'function VERSION() view returns (string)',
			'function quoteRepaymentNow(uint256 id) view returns (uint256)',
			'function effectiveFee(uint256 id) view returns (uint256)',
			'function minCoolingOff(uint64 duration) pure returns (uint64)',
			'function unclaimed(address token, address account) view returns (uint256)',
			'function withdrawUnclaimed(address token)',
			'function repayFor(uint256 id, address borrower)',
		);
	}
	return abi;
}

/** ABI for the live FlashBankRouterV3 (read surface only — flash loans are executed by contracts, not the MCP). */
export function routerAbi() {
	return [
		'function getTokenStats(address token) view returns (uint256 committed, uint256 activeProviders, uint16 feeBps, uint256 maxFlashLoan, bool supportsPermit, uint16 maxBorrowBps)',
		'function getActualAvailableLiquidity(address token) view returns (uint256)',
		'function quoteFee(address token, uint256 amount) view returns (uint256)',
		'function getProviders(address token) view returns (address[])',
		'function VERSION() view returns (string)',
	];
}

/** Minimal ERC-20 surface, including the PlaygroundToken faucet used on Sepolia. */
export function erc20Abi() {
	return [
		'function balanceOf(address) view returns (uint256)',
		'function decimals() view returns (uint8)',
		'function symbol() view returns (string)',
		'function allowance(address owner, address spender) view returns (uint256)',
		'function approve(address spender, uint256 amount) returns (bool)',
		'function faucet()',
	];
}

/** Field order of the LoanParams tuple per contract version, for callers building positional arrays. */
export function loanParamsOrder(version = 1) {
	const base = [
		'creatorIsLender', 'allowedTaker', 'principalToken', 'collateralToken', 'principal', 'collateral',
		'repaymentFee', 'duration', 'gracePeriod', 'offerExpiry',
	];
	const tail = ['listed', 'serviceFeeRecipient', 'serviceFee', 'boost', 'settlementValue'];
	return version === 2 ? [...base, 'coolingOff', ...tail] : [...base, ...tail];
}
