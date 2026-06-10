import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ethers } from 'ethers';

import { statusName, formatAmount, parseAmount, secondsToHuman, tsToIso, describeLoan } from '../src/format.js';

test('statusName maps the on-chain enum and tolerates junk', () => {
	assert.equal(statusName(0), 'None');
	assert.equal(statusName(1n), 'Open');
	assert.equal(statusName(2), 'Active');
	assert.equal(statusName(3), 'Repaid');
	assert.equal(statusName(4), 'Defaulted');
	assert.equal(statusName(5), 'Cancelled');
	assert.equal(statusName(99), 'Unknown(99)');
});

test('formatAmount trims trailing zeros without losing precision', () => {
	assert.equal(formatAmount(1500000000000000000n, 18), '1.5');
	assert.equal(formatAmount(1000000n, 6), '1');
	assert.equal(formatAmount(0n, 18), '0');
	assert.equal(formatAmount(1n, 6), '0.000001');
});

test('parseAmount round-trips and rejects garbage', () => {
	assert.equal(parseAmount('1.5', 18), 1500000000000000000n);
	assert.equal(parseAmount('1000', 6), 1000000000n);
	assert.throws(() => parseAmount('1,5', 18), /Invalid amount/);
	assert.throws(() => parseAmount('-3', 18), /Invalid amount/);
	assert.throws(() => parseAmount('1e18', 18), /Invalid amount/);
});

test('secondsToHuman picks sensible units', () => {
	assert.equal(secondsToHuman(7 * 86400), '7 days');
	assert.equal(secondsToHuman(86400), '1 day');
	assert.equal(secondsToHuman(43200), '12 hours');
	assert.equal(secondsToHuman(600), '10 minutes');
	assert.equal(secondsToHuman(5), '5 seconds');
});

test('tsToIso treats zero as "never"', () => {
	assert.equal(tsToIso(0), null);
	assert.equal(tsToIso(0n), null);
	assert.equal(tsToIso(1760000000), new Date(1760000000 * 1000).toISOString());
});

test('describeLoan translates a raw struct into agent-friendly terms', () => {
	const PRINCIPAL_TOKEN = '0x' + 'aa'.repeat(20);
	const COLLATERAL_TOKEN = '0x' + 'bb'.repeat(20);
	const CREATOR = '0x' + 'cc'.repeat(20);
	const loan = {
		creator: CREATOR,
		taker: ethers.ZeroAddress,
		allowedTaker: ethers.ZeroAddress,
		creatorIsLender: true,
		status: 1n, // Open
		principalToken: PRINCIPAL_TOKEN,
		collateralToken: COLLATERAL_TOKEN,
		principal: 1000n * 10n ** 6n,
		collateral: 1n * 10n ** 18n,
		repaymentFee: 30n * 10n ** 6n,
		protocolFee: 0n,
		serviceFeeRecipient: ethers.ZeroAddress,
		serviceFee: 0n,
		duration: 7n * 86400n,
		gracePeriod: 86400n,
		offerExpiry: 0n,
		startTime: 0n,
		listed: false,
		boost: 0n,
		settlementValue: 0n,
		version: 0n,
	};
	const infoFor = (address) =>
		address.toLowerCase() === PRINCIPAL_TOKEN.toLowerCase()
			? { symbol: 'USDC', decimals: 6 }
			: { symbol: 'WETH', decimals: 18 };

	const out = describeLoan(7, loan, infoFor, 1_760_000_000);
	assert.equal(out.id, 7);
	assert.equal(out.status, 'Open');
	assert.equal(out.principal, '1000 USDC');
	assert.equal(out.collateral, '1 WETH');
	assert.equal(out.flatFee, '30 USDC');
	assert.equal(out.term, '7 days');
	assert.equal(out.gracePeriod, '1 day');
	assert.equal(out.taker, null);
	assert.equal(out.restrictedTo, null);
	assert.match(out.agreedCollateralValue, /full collateral forfeits/);
});

test('describeLoan flags an expired open offer and a surplus agreement', () => {
	const token = '0x' + 'ab'.repeat(20);
	const base = {
		creator: '0x' + 'cd'.repeat(20),
		taker: ethers.ZeroAddress,
		allowedTaker: ethers.ZeroAddress,
		creatorIsLender: false,
		status: 1n,
		principalToken: token,
		collateralToken: token,
		principal: 100n,
		collateral: 200n,
		repaymentFee: 5n,
		protocolFee: 0n,
		serviceFeeRecipient: ethers.ZeroAddress,
		serviceFee: 0n,
		duration: 3600n,
		gracePeriod: 0n,
		offerExpiry: 1000n, // long past
		startTime: 0n,
		listed: true,
		boost: 0n,
		settlementValue: 210n,
		version: 3n,
	};
	const infoFor = () => ({ symbol: 'TKN', decimals: 0 });
	const out = describeLoan(0, base, infoFor, 2_000_000_000);
	assert.match(out.status, /expired/);
	assert.match(out.agreedCollateralValue, /210 TKN/);
	assert.equal(out.version, 3);
});
