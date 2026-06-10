// Minimal human-readable ABIs for the deployed FlashBank contracts.
//
// Kept inline (rather than importing Hardhat artifacts) so the MCP server is self-contained and
// works from a clean checkout without compiling either feature. The tuple layouts MUST mirror the
// deployed v1 contracts exactly — see loans/contracts/FlashBankP2PLoan.sol and
// flashloans/contracts/FlashBankRouterV3.sol.

const LOAN_TUPLE =
	'tuple(address creator, address taker, address allowedTaker, bool creatorIsLender, uint8 status, ' +
	'address principalToken, address collateralToken, uint256 principal, uint256 collateral, ' +
	'uint256 repaymentFee, uint256 protocolFee, address serviceFeeRecipient, uint256 serviceFee, ' +
	'uint64 duration, uint64 gracePeriod, uint64 offerExpiry, uint64 startTime, bool listed, ' +
	'uint256 boost, uint256 settlementValue, uint64 version)';

const LOAN_PARAMS_TUPLE =
	'tuple(bool creatorIsLender, address allowedTaker, address principalToken, address collateralToken, ' +
	'uint256 principal, uint256 collateral, uint256 repaymentFee, uint64 duration, uint64 gracePeriod, ' +
	'uint64 offerExpiry, bool listed, address serviceFeeRecipient, uint256 serviceFee, uint256 boost, ' +
	'uint256 settlementValue)';

/** ABI for the live FlashBankP2PLoan (v1). */
export function p2pAbi() {
	return [
		`function getLoan(uint256 id) view returns (${LOAN_TUPLE})`,
		`function getLoansPaged(uint256 start, uint256 limit) view returns (${LOAN_TUPLE}[])`,
		'function loanCount() view returns (uint256)',
		'function termsHash(uint256 id) view returns (bytes32)',
		'function quoteTake(uint256 id) view returns (address token, uint256 amount)',
		'function quoteRepayment(uint256 id) view returns (uint256)',
		'function quoteDefault(uint256 id) view returns (uint256 toLender, uint256 toBorrower)',
		'function defaultDeadline(uint256 id) view returns (uint256)',
		'function isDefaultable(uint256 id) view returns (bool)',
		'function parties(uint256 id) view returns (address lender, address borrower)',
		'function getUserLoans(address user) view returns (uint256[])',
		'function protocolFeeBps() view returns (uint16)',
		'function protocolFeeRecipient() view returns (address)',
		`function createLoan(${LOAN_PARAMS_TUPLE} p) returns (uint256)`,
		// Both pinned-take variants. The current build has takeWithTerms (strongest); the older
		// Sepolia playground build predates it and pins via takeChecked(version) — feature-detected
		// at call time by probing termsHash().
		'function takeWithTerms(uint256 id, bytes32 expectedTermsHash)',
		'function takeChecked(uint256 id, uint64 expectedVersion)',
		'function repay(uint256 id)',
		'function claimDefault(uint256 id)',
		'function cancel(uint256 id)',
		'event LoanCreated(uint256 indexed id, address indexed creator, bool creatorIsLender, address indexed principalToken, address collateralToken, uint256 principal, uint256 collateral)',
	];
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

/** Field order of the LoanParams tuple, exposed for callers that build positional arrays. */
export function loanParamsOrder() {
	return [
		'creatorIsLender', 'allowedTaker', 'principalToken', 'collateralToken', 'principal', 'collateral',
		'repaymentFee', 'duration', 'gracePeriod', 'offerExpiry', 'listed', 'serviceFeeRecipient',
		'serviceFee', 'boost', 'settlementValue',
	];
}
