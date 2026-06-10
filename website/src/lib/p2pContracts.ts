// Version-aware viem ABI fragments + cooling-off maths for the deployed P2P escrows.
//
//   v1 — FlashBankP2PLoan   (Ethereum, Base): flat fee, version-pinned takes.
//   v2 — FlashBankP2PLoanV2 (Sepolia playground): adds token validation, the graduated
//        cooling-off fee rebate (vests from a 10% floor) and pull-payouts (unclaimed/withdraw).
//
// Everything is exposed through functions (project rule: never export mutable objects/arrays);
// the built ABIs are cached per version so referential identity stays stable across renders.

type AbiComponent = { internalType: string; name: string; type: string };

// Mirrors of the FlashBankP2PLoanV2 constants — keep in sync with the contract.
const COOLING_MIN_BPS = 1000; // ≥ 10% of the term
const COOLING_MIN_FLOOR_SECS = 10 * 60;
const COOLING_MIN_CAP_SECS = 24 * 60 * 60;
const MIN_VESTED_FEE_BPS = 1000n; // 10% of the agreed fee vests immediately
const FEE_DENOMINATOR = 10_000n;

function component(internalType: string, name: string): AbiComponent {
	return { internalType, name, type: internalType.startsWith('struct') ? 'tuple' : internalType };
}

function loanComponentsFor(version: 1 | 2): AbiComponent[] {
	const fields: [string, string][] = [
		['address', 'creator'], ['address', 'taker'], ['address', 'allowedTaker'],
		['bool', 'creatorIsLender'], ['uint8', 'status'],
		['address', 'principalToken'], ['address', 'collateralToken'],
		['uint256', 'principal'], ['uint256', 'collateral'], ['uint256', 'repaymentFee'],
		['uint256', 'protocolFee'], ['address', 'serviceFeeRecipient'], ['uint256', 'serviceFee'],
		['uint64', 'duration'], ['uint64', 'gracePeriod'], ['uint64', 'offerExpiry'], ['uint64', 'startTime'],
		// v2 inserts startBlock + coolingOff here.
		...(version === 2 ? ([['uint64', 'startBlock'], ['uint64', 'coolingOff']] as [string, string][]) : []),
		['bool', 'listed'], ['uint256', 'boost'], ['uint256', 'settlementValue'], ['uint64', 'version'],
	];
	return fields.map(([t, n]) => component(t, n));
}

function loanParamsComponentsFor(version: 1 | 2): AbiComponent[] {
	const fields: [string, string][] = [
		['bool', 'creatorIsLender'], ['address', 'allowedTaker'],
		['address', 'principalToken'], ['address', 'collateralToken'],
		['uint256', 'principal'], ['uint256', 'collateral'], ['uint256', 'repaymentFee'],
		['uint64', 'duration'], ['uint64', 'gracePeriod'], ['uint64', 'offerExpiry'],
		// v2 inserts coolingOff here (0 = protocol minimum for the term).
		...(version === 2 ? ([['uint64', 'coolingOff']] as [string, string][]) : []),
		['bool', 'listed'], ['address', 'serviceFeeRecipient'], ['uint256', 'serviceFee'],
		['uint256', 'boost'], ['uint256', 'settlementValue'],
	];
	return fields.map(([t, n]) => component(t, n));
}

function offerUpdateComponentsFor(version: 1 | 2): AbiComponent[] {
	const fields: [string, string][] = [
		['uint256', 'repaymentFee'], ['uint64', 'duration'], ['uint64', 'gracePeriod'], ['uint64', 'offerExpiry'],
		// v2 inserts coolingOff here (0 = re-normalise to the minimum for the new term).
		...(version === 2 ? ([['uint64', 'coolingOff']] as [string, string][]) : []),
		['uint256', 'settlementValue'], ['address', 'allowedTaker'],
		['address', 'serviceFeeRecipient'], ['uint256', 'serviceFee'],
	];
	return fields.map(([t, n]) => component(t, n));
}

function uintInput(name: string, type = 'uint256'): AbiComponent {
	return { internalType: type, name, type };
}

function buildP2PAbi(version: 1 | 2): readonly any[] {
	const structName = version === 2 ? 'FlashBankP2PLoanV2' : 'FlashBankP2PLoan';
	const abi: any[] = [
		{
			inputs: [{ components: loanParamsComponentsFor(version), internalType: `struct ${structName}.LoanParams`, name: 'p', type: 'tuple' }],
			name: 'createLoan', outputs: [uintInput('id')], stateMutability: 'nonpayable', type: 'function',
		},
		{ inputs: [uintInput('id')], name: 'take', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{ inputs: [uintInput('id'), uintInput('expectedVersion', 'uint64')], name: 'takeChecked', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{
			inputs: [uintInput('id'), { components: offerUpdateComponentsFor(version), internalType: `struct ${structName}.OfferUpdate`, name: 'u', type: 'tuple' }],
			name: 'updateOffer', outputs: [], stateMutability: 'nonpayable', type: 'function',
		},
		{ inputs: [uintInput('id'), uintInput('amount')], name: 'boostOffer', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{ inputs: [uintInput('id')], name: 'repay', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{ inputs: [uintInput('id')], name: 'claimDefault', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{ inputs: [uintInput('id')], name: 'cancel', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{ inputs: [], name: 'loanCount', outputs: [uintInput('')], stateMutability: 'view', type: 'function' },
		{ inputs: [], name: 'protocolFeeBps', outputs: [uintInput('', 'uint16')], stateMutability: 'view', type: 'function' },
		{
			inputs: [uintInput('start'), uintInput('limit')],
			name: 'getLoansPaged', outputs: [{ components: loanComponentsFor(version), internalType: `struct ${structName}.Loan[]`, name: 'page', type: 'tuple[]' }],
			stateMutability: 'view', type: 'function',
		},
		{
			inputs: [uintInput('id')],
			name: 'quoteTake', outputs: [{ internalType: 'address', name: 'token', type: 'address' }, uintInput('amount')],
			stateMutability: 'view', type: 'function',
		},
		{ inputs: [uintInput('id')], name: 'quoteRepayment', outputs: [uintInput('')], stateMutability: 'view', type: 'function' },
		{ inputs: [uintInput('id')], name: 'quoteDefault', outputs: [uintInput('toLender'), uintInput('toBorrower')], stateMutability: 'view', type: 'function' },
	];
	if (version === 2) {
		abi.push(
			{ inputs: [uintInput('id')], name: 'termsHash', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function' },
			{ inputs: [uintInput('id'), { internalType: 'bytes32', name: 'expectedTermsHash', type: 'bytes32' }], name: 'takeWithTerms', outputs: [], stateMutability: 'nonpayable', type: 'function' },
			{ inputs: [uintInput('id')], name: 'quoteRepaymentNow', outputs: [uintInput('')], stateMutability: 'view', type: 'function' },
			{ inputs: [uintInput('id')], name: 'effectiveFee', outputs: [uintInput('')], stateMutability: 'view', type: 'function' },
			{ inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'address', name: 'account', type: 'address' }], name: 'unclaimed', outputs: [uintInput('')], stateMutability: 'view', type: 'function' },
			{ inputs: [{ internalType: 'address', name: 'token', type: 'address' }], name: 'withdrawUnclaimed', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		);
	}
	return Object.freeze(abi);
}

const ABI_CACHE = new Map<number, readonly any[]>();

/** The viem ABI for a deployed P2P escrow version (cached, referentially stable). */
export function p2pAbiFor(version: 1 | 2): readonly any[] {
	if (!ABI_CACHE.has(version)) {
		ABI_CACHE.set(version, buildP2PAbi(version));
	}
	return ABI_CACHE.get(version)!;
}

let erc20Cache: readonly any[] | null = null;

/** Minimal ERC-20 surface incl. the PlaygroundToken faucet (cached). */
export function erc20Abi(): readonly any[] {
	if (!erc20Cache) {
		erc20Cache = Object.freeze([
			{ inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
			{ inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
			{ inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
			{ inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
			{ inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
			{ inputs: [], name: 'faucet', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		]);
	}
	return erc20Cache;
}

/**
 * Client-side mirror of FlashBankP2PLoanV2._minCoolingOff: 10% of the term, clamped to
 * [10 minutes, 1 day] and never longer than the term itself.
 */
export function minCoolingSecs(durationSecs: number): number {
	let minimum = Math.floor((durationSecs * COOLING_MIN_BPS) / 10_000);
	if (minimum < COOLING_MIN_FLOOR_SECS) minimum = COOLING_MIN_FLOOR_SECS;
	if (minimum > COOLING_MIN_CAP_SECS) minimum = COOLING_MIN_CAP_SECS;
	if (minimum > durationSecs) minimum = durationSecs;
	return minimum;
}

/**
 * Client-side mirror of FlashBankP2PLoanV2._effectiveFee for DISPLAY purposes: the agreed fee
 * vested linearly from the 10% floor over the cooling window. (The same-block guard isn't
 * modelled — the contract is always the source of truth at execution time.)
 */
export function vestedFeeNow(fee: bigint, startTimeSecs: bigint, coolingOffSecs: bigint, nowSecs: number): bigint {
	if (fee === 0n || coolingOffSecs === 0n) return fee;
	const elapsed = BigInt(Math.max(nowSecs - Number(startTimeSecs), 0));
	if (elapsed >= coolingOffSecs) return fee;
	const floorFee = (fee * MIN_VESTED_FEE_BPS) / FEE_DENOMINATOR;
	return floorFee + ((fee - floorFee) * elapsed) / coolingOffSecs;
}
