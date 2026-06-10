// Live read-only smoke test against the REAL deployed contracts (no key needed).
// Validates that the inline ABIs in src/abi.js match the deployed bytecode — if a tuple layout
// drifted, these calls would revert or decode garbage. Run with: npm run smoke
//
// Uses Sepolia (playground) plus a light mainnet read so both registries are exercised.

import { getP2P, getRouter, resolveToken } from '../src/clients.js';
import { getChain, playgroundKey } from '../src/chains.js';
import { describeLoan, formatAmount, statusName } from '../src/format.js';

const SMOKE_PAGE = 25;

async function smokeP2P(chainKey) {
	const chain = getChain(chainKey);
	const p2p = getP2P(chainKey);
	const total = Number(await p2p.loanCount());
	console.log(`[${chain.name}] P2P loanCount = ${total}`);

	const start = Math.max(0, total - SMOKE_PAGE);
	const page = await p2p.getLoansPaged(start, SMOKE_PAGE);
	const open = [];
	for (let i = 0; i < page.length; i++) {
		if (statusName(page[i].status) === 'Open') {
			open.push({ id: start + i, loan: page[i] });
		}
	}
	console.log(`[${chain.name}] open offers in the last ${page.length}: ${open.length}`);

	if (open.length > 0) {
		const { id, loan } = open[open.length - 1];
		const infoFor = await (async () => {
			const principal = await resolveToken(chainKey, loan.principalToken).catch(() => ({ symbol: 'P?', decimals: 18 }));
			const collateral = await resolveToken(chainKey, loan.collateralToken).catch(() => ({ symbol: 'C?', decimals: 18 }));
			return (address) => (address.toLowerCase() === loan.principalToken.toLowerCase() ? principal : collateral);
		})();
		const detail = describeLoan(id, loan, infoFor);
		console.log(`[${chain.name}] sample open offer #${id}: ${detail.principal} against ${detail.collateral}, fee ${detail.flatFee}, term ${detail.term}`);
		// Older deployments (the Sepolia playground) predate termsHash(); fall back to version pinning.
		try {
			console.log(`[${chain.name}] termsHash(${id}) = ${await p2p.termsHash(id)} (hash pinning available)`);
		} catch {
			console.log(`[${chain.name}] termsHash missing — this build pins via takeChecked(version=${Number(loan.version)})`);
		}
	}
}

async function smokeRouter(chainKey) {
	const chain = getChain(chainKey);
	const router = getRouter(chainKey);
	const weth = chain.tokens.find((t) => t.symbol === 'WETH');
	const stats = await router.getTokenStats(weth.address);
	const available = await router.getActualAvailableLiquidity(weth.address);
	const fee = await router.quoteFee(weth.address, 10n ** 18n);
	console.log(
		`[${chain.name}] router WETH: committed=${formatAmount(stats.committed, 18)}, ` +
		`availableNow=${formatAmount(available, 18)}, feeBps=${stats.feeBps}, fee(1 WETH)=${formatAmount(fee, 18)}`
	);
}

async function main() {
	const playground = playgroundKey();
	await smokeP2P(playground);
	await smokeRouter(playground);
	// One mainnet read to prove the mainnet registry decodes too.
	await smokeP2P('ethereum');
	console.log('SMOKE OK');
}

main().catch((error) => {
	console.error('SMOKE FAILED:', error.message || error);
	process.exit(1);
});
