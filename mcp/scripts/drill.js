// LIVE two-agent drill on the Sepolia playground (play-money only, never mainnet).
//
// Spawns TWO real MCP server instances over stdio — a "lender agent" using the configured key and
// a "borrower agent" on a freshly generated throwaway key (funded with a sliver of Sepolia ETH for
// gas) — and walks the full loan lifecycle through actual MCP tool calls:
//
//   faucet → create offer → browse → inspect → take (pinned) → vested repay (cooling-off rebate!)
//   → withdraw-unclaimed probe → my-loans → create + cancel
//
// Usage: npm run drill   (needs FLASHBANK_MCP_PRIVATE_KEY, or PRIVATE_KEY in the repo-root .env,
//        holding a little Sepolia ETH)

import { ethers } from 'ethers';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startMcpServer } from './mcp-client.js';
import { rpcUrl, getChain } from '../src/chains.js';

const CHAIN = 'sepolia';
const BORROWER_GAS_ETH = '0.003';   // sliver sent to the throwaway borrower for gas
const SWEEP_GAS_MARGIN = 60_000n;   // gas units kept back when returning leftover ETH

// Drill offer: small, surplus-returning, default cooling window (16.8h for a 7-day term).
const OFFER = {
	principal: '100', collateral: '0.4', flatFee: '6',
	durationDays: 7, graceDays: 1, settlementValue: '500',
};
const EXPECTED_FEE_FLOOR = 0.6; // 10% of the 6 fpUSD fee
const FEE_SLACK = 0.05;         // vest accrued in the seconds between take and repay

function loadKey() {
	if (process.env.FLASHBANK_MCP_PRIVATE_KEY) {
		return process.env.FLASHBANK_MCP_PRIVATE_KEY;
	}
	const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env');
	const match = fs.readFileSync(envPath, 'utf8').match(/^PRIVATE_KEY=([0-9a-fx]+)/mi);
	if (!match) {
		throw new Error('No FLASHBANK_MCP_PRIVATE_KEY env and no PRIVATE_KEY in the repo-root .env.');
	}
	return match[1].trim();
}

const results = [];
let stepNo = 0;
async function step(label, fn) {
	stepNo++;
	process.stdout.write(`\n[${stepNo}] ${label}\n`);
	try {
		const out = await fn();
		results.push({ step: `${stepNo}. ${label}`, ok: true });
		return out;
	} catch (error) {
		results.push({ step: `${stepNo}. ${label}`, ok: false, error: error.message });
		throw error;
	}
}

function logKV(obj, keys) {
	for (const key of keys) {
		if (obj[key] !== undefined) {
			console.log(`    ${key}: ${typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : obj[key]}`);
		}
	}
}

/** Parse the leading number out of strings like "100.6 fpUSD". */
function amountOf(text) {
	const match = String(text).match(/[\d.]+/);
	return match ? Number(match[0]) : NaN;
}

async function main() {
	const lenderKey = loadKey();
	const provider = new ethers.JsonRpcProvider(rpcUrl(CHAIN), getChain(CHAIN).chainId, { staticNetwork: true });
	const lenderWallet = new ethers.Wallet(lenderKey, provider);
	const borrowerWallet = ethers.Wallet.createRandom().connect(provider);
	console.log('Lender agent  :', lenderWallet.address);
	console.log('Borrower agent:', borrowerWallet.address, '(fresh throwaway)');

	const lender = startMcpServer({ FLASHBANK_MCP_PRIVATE_KEY: lenderKey });
	const borrower = startMcpServer({ FLASHBANK_MCP_PRIVATE_KEY: borrowerWallet.privateKey });

	try {
		await lender.initialize('drill-lender');
		await borrower.initialize('drill-borrower');

		await step('lender: explain — primer is served', async () => {
			const out = await lender.callTool('explain');
			if (!/cooling-off/i.test(out.explainer)) {
				throw new Error('explainer is missing the v2 cooling-off note');
			}
		});

		await step('lender: wallet_status — writes enabled on the playground', async () => {
			const out = await lender.callTool('wallet_status', { chain: CHAIN });
			logKV(out, ['address', 'nativeBalance', 'writes']);
			if (out.writes !== 'enabled') {
				throw new Error(`expected writes enabled, got: ${out.writes}`);
			}
		});

		await step('lender: faucet_mint fpUSD', async () => {
			const out = await lender.callTool('faucet_mint', { token: 'fpUSD' });
			logKV(out, ['minted', 'newBalance']);
		});

		const offerId = await step('lender: p2p_create_offer (lend 100 fpUSD vs 0.4 fpETH, fee 6, 7d)', async () => {
			const out = await lender.callTool('p2p_create_offer', {
				chain: CHAIN, side: 'lend',
				principalToken: 'fpUSD', collateralToken: 'fpETH',
				...OFFER,
			});
			logKV(out, ['loanId', 'escrowed', 'tx']);
			if (typeof out.loanId !== 'number') {
				throw new Error('no loanId returned');
			}
			return out.loanId;
		});

		await step('fund borrower gas (plumbing, not MCP)', async () => {
			const tx = await lenderWallet.sendTransaction({ to: borrowerWallet.address, value: ethers.parseEther(BORROWER_GAS_ETH) });
			await tx.wait();
			console.log(`    sent ${BORROWER_GAS_ETH} ETH for gas`);
		});

		await step('borrower: faucet_mint fpETH (collateral) + fpUSD (fee headroom)', async () => {
			logKV(await borrower.callTool('faucet_mint', { token: 'fpETH' }), ['newBalance']);
			logKV(await borrower.callTool('faucet_mint', { token: 'fpUSD' }), ['newBalance']);
		});

		await step(`borrower: p2p_list_offers — sees offer #${offerId}`, async () => {
			const out = await borrower.callTool('p2p_list_offers', { chain: CHAIN, limit: 50 });
			console.log(`    open offers: ${out.openOffersReturned}`);
			if (!out.offers.some((o) => o.id === offerId)) {
				throw new Error(`offer ${offerId} not in the list`);
			}
		});

		await step(`borrower: p2p_get_loan #${offerId} — v2 detail with cooling-off + terms hash`, async () => {
			const out = await borrower.callTool('p2p_get_loan', { chain: CHAIN, id: offerId });
			logKV(out, ['principal', 'collateral', 'flatFee', 'coolingOff', 'termsHash', 'toTake']);
			if (!out.coolingOff) {
				throw new Error('v2 loan detail is missing coolingOff');
			}
			if (!out.termsHash) {
				throw new Error('v2 deployment should expose hash pinning');
			}
		});

		await step(`borrower: p2p_take_offer #${offerId} (pinned)`, async () => {
			const out = await borrower.callTool('p2p_take_offer', { chain: CHAIN, id: offerId });
			logKV(out, ['provided', 'pinned', 'toRepay', 'tx']);
			if (!String(out.pinned).startsWith('terms hash')) {
				throw new Error(`expected hash pinning on v2, got: ${out.pinned}`);
			}
		});

		await step(`borrower: p2p_get_loan #${offerId} — Active, vested fee ≈ the 10% floor`, async () => {
			const out = await borrower.callTool('p2p_get_loan', { chain: CHAIN, id: offerId });
			logKV(out, ['status', 'toRepayNow', 'repayDeadline']);
			if (out.status !== 'Active') {
				throw new Error(`expected Active, got ${out.status}`);
			}
			if (!out.toRepayNow) {
				throw new Error('missing v2 toRepayNow quote');
			}
		});

		await step(`borrower: p2p_repay #${offerId} — cooling-off rebate applies`, async () => {
			const out = await borrower.callTool('p2p_repay', { chain: CHAIN, id: offerId });
			logKV(out, ['paid', 'feePaid', 'coolingOffRebate', 'tx']);
			const feePaid = amountOf(out.feePaid);
			if (!(feePaid >= EXPECTED_FEE_FLOOR && feePaid <= EXPECTED_FEE_FLOOR + FEE_SLACK)) {
				throw new Error(`vested fee ${feePaid} outside [${EXPECTED_FEE_FLOOR}, ${EXPECTED_FEE_FLOOR + FEE_SLACK}] fpUSD`);
			}
			if (!out.coolingOffRebate) {
				throw new Error('expected a cooling-off rebate to be reported');
			}
		});

		await step('borrower: p2p_withdraw_unclaimed fpUSD — nothing queued (clean settlement)', async () => {
			const out = await borrower.callTool('p2p_withdraw_unclaimed', { chain: CHAIN, token: 'fpUSD' });
			logKV(out, ['withdrawn', 'queued', 'note']);
			if (out.withdrawn !== false) {
				throw new Error('expected nothing queued after a clean repay');
			}
		});

		await step(`lender: p2p_my_loans — #${offerId} shows Repaid`, async () => {
			const out = await lender.callTool('p2p_my_loans', { chain: CHAIN });
			const mine = out.created.find((l) => l.id === offerId);
			console.log(`    loan #${offerId} status: ${mine?.status}`);
			if (mine?.status !== 'Repaid') {
				throw new Error(`expected Repaid, got ${mine?.status}`);
			}
		});

		await step('lender: create + cancel a throwaway offer (escrow returns)', async () => {
			const created = await lender.callTool('p2p_create_offer', {
				chain: CHAIN, side: 'lend',
				principalToken: 'fpUSD', collateralToken: 'fpETH',
				principal: '10', collateral: '0.05', flatFee: '1',
				durationDays: 1, graceDays: 1,
			});
			const out = await lender.callTool('p2p_cancel', { chain: CHAIN, id: created.loanId });
			logKV(out, ['cancelled', 'loanId', 'tx']);
			if (out.cancelled !== true) {
				throw new Error('cancel did not confirm');
			}
		});

		await step('sweep: return leftover borrower ETH (hygiene)', async () => {
			const balance = await provider.getBalance(borrowerWallet.address);
			const feeData = await provider.getFeeData();
			const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice ?? 1_500_000_000n;
			const keep = gasPrice * SWEEP_GAS_MARGIN;
			if (balance > keep) {
				const tx = await borrowerWallet.sendTransaction({
					to: lenderWallet.address,
					value: balance - keep,
					gasLimit: 21_000n,
				});
				await tx.wait();
				console.log(`    returned ${ethers.formatEther(balance - keep)} ETH to the lender wallet`);
			} else {
				console.log('    nothing worth sweeping');
			}
		});
	} finally {
		await lender.stop();
		await borrower.stop();
	}

	console.log('\n' + '='.repeat(64));
	for (const r of results) {
		console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.step}${r.error ? ` — ${r.error}` : ''}`);
	}
	const failed = results.filter((r) => !r.ok).length;
	console.log('='.repeat(64));
	console.log(failed === 0 ? `DRILL OK — ${results.length} steps` : `DRILL FAILED — ${failed} step(s)`);
	process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
	console.error('\nDRILL ABORTED:', error.message || error);
	for (const r of results) {
		console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.step}${r.error ? ` — ${r.error}` : ''}`);
	}
	process.exit(1);
});
