// Pure formatting/translation helpers for the FlashBank MCP server. No network access here —
// everything is unit-testable (see test/format.test.js).

import { ethers } from 'ethers';

const STATUS_NAMES = Object.freeze(['None', 'Open', 'Active', 'Repaid', 'Defaulted', 'Cancelled']);

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

/** Human name for the on-chain Status enum value. */
export function statusName(status) {
	const index = Number(status);
	return STATUS_NAMES[index] || `Unknown(${index})`;
}

/** Format a raw token amount to a trimmed decimal string ("1.5", not "1.500000"). */
export function formatAmount(raw, decimals) {
	const text = ethers.formatUnits(raw, decimals);
	if (!text.includes('.')) {
		return text;
	}
	return text.replace(/\.?0+$/, '') || '0';
}

/** Parse a human amount ("1.5") into raw units; rejects garbage with a clear error. */
export function parseAmount(value, decimals) {
	const text = String(value).trim();
	if (!/^\d+(\.\d+)?$/.test(text)) {
		throw new Error(`Invalid amount "${value}" — use a plain decimal number string, e.g. "1.5".`);
	}
	return ethers.parseUnits(text, decimals);
}

/** "604800" → "7 days"; falls back to seconds for sub-minute values. */
export function secondsToHuman(seconds) {
	const s = Number(seconds);
	if (!Number.isFinite(s) || s < 0) {
		return `${seconds}s`;
	}
	if (s >= SECONDS_PER_DAY && s % SECONDS_PER_DAY === 0) {
		const d = s / SECONDS_PER_DAY;
		return `${d} day${d === 1 ? '' : 's'}`;
	}
	if (s >= SECONDS_PER_HOUR) {
		const h = Math.round((s / SECONDS_PER_HOUR) * 10) / 10;
		return `${h} hour${h === 1 ? '' : 's'}`;
	}
	if (s >= SECONDS_PER_MINUTE) {
		const m = Math.round(s / SECONDS_PER_MINUTE);
		return `${m} minute${m === 1 ? '' : 's'}`;
	}
	return `${s} second${s === 1 ? '' : 's'}`;
}

/** ISO timestamp for a unix-seconds value, or null for 0 ("never"). */
export function tsToIso(unixSeconds) {
	const n = Number(unixSeconds);
	if (!n) {
		return null;
	}
	return new Date(n * 1000).toISOString();
}

/**
 * Translate a raw on-chain Loan struct into a plain, agent-friendly object.
 * `tokenInfoFor(address)` must return `{ symbol, decimals }` (resolved by the caller, so this
 * stays pure).
 */
export function describeLoan(id, loan, tokenInfoFor, nowSeconds = Math.floor(Date.now() / 1000)) {
	const principalInfo = tokenInfoFor(loan.principalToken);
	const collateralInfo = tokenInfoFor(loan.collateralToken);
	const status = statusName(loan.status);
	const expired = loan.offerExpiry !== 0n && Number(loan.offerExpiry) < nowSeconds;

	const out = {
		id: Number(id),
		status,
		side: loan.creatorIsLender ? 'creator lends (taker borrows)' : 'creator borrows (taker lends)',
		creator: loan.creator,
		taker: loan.taker === ethers.ZeroAddress ? null : loan.taker,
		restrictedTo: loan.allowedTaker === ethers.ZeroAddress ? null : loan.allowedTaker,
		principal: `${formatAmount(loan.principal, principalInfo.decimals)} ${principalInfo.symbol}`,
		collateral: `${formatAmount(loan.collateral, collateralInfo.decimals)} ${collateralInfo.symbol}`,
		flatFee: `${formatAmount(loan.repaymentFee, principalInfo.decimals)} ${principalInfo.symbol}`,
		term: secondsToHuman(loan.duration),
		gracePeriod: secondsToHuman(loan.gracePeriod),
		offerExpires: tsToIso(loan.offerExpiry) || 'never (while open)',
		listed: Boolean(loan.listed),
		boost: loan.boost > 0n ? `${formatAmount(loan.boost, principalInfo.decimals)} ${principalInfo.symbol}` : null,
		version: Number(loan.version),
		principalToken: loan.principalToken,
		collateralToken: loan.collateralToken,
	};

	if (status === 'Open' && expired) {
		out.status = 'Open (expired — no longer takeable)';
	}
	if (loan.settlementValue > 0n) {
		out.agreedCollateralValue =
			`${formatAmount(loan.settlementValue, principalInfo.decimals)} ${principalInfo.symbol} ` +
			'(surplus above the debt returns to the borrower on default)';
	} else {
		out.agreedCollateralValue = 'none (full collateral forfeits on default)';
	}
	if (loan.serviceFee > 0n) {
		out.serviceFee = `${formatAmount(loan.serviceFee, principalInfo.decimals)} ${principalInfo.symbol} to ${loan.serviceFeeRecipient}`;
	}
	// v2-only field (FlashBankP2PLoanV2): the flat fee vests over this window, so an early
	// repayment is rebated down to a 10% floor of the agreed fee.
	if (loan.coolingOff !== undefined && loan.coolingOff !== null && loan.coolingOff > 0n) {
		out.coolingOff = `${secondsToHuman(loan.coolingOff)} (fee vests from a 10% floor to full over this window; early repay is rebated)`;
	}
	if (loan.startTime !== 0n) {
		out.activatedAt = tsToIso(loan.startTime);
		out.repayDeadline = tsToIso(BigInt(loan.startTime) + BigInt(loan.duration) + BigInt(loan.gracePeriod));
	}
	return out;
}

/** Uniform JSON tool response (MCP content block). */
export function jsonContent(payload) {
	return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
}

/** Uniform error tool response. */
export function errorContent(error) {
	const message = error instanceof Error ? error.message : String(error);
	return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
}
