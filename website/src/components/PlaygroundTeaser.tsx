import React, { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { ArrowRight, Droplets, Sparkles, Zap, Coins, Star } from 'lucide-react';
import { p2pAbiFor } from '../lib/p2pContracts';

// Surfaces the *real* Sepolia playground market on mainnet empty states — play-money only,
// never mixed into mainnet counts. Addresses are public deployments (not secrets).

const SEPOLIA_CHAIN = 11155111;
const SEPOLIA_P2P = '0x536f4C17C18854943a45841Fef4b3054ED281E76';
const SEPOLIA_ROUTER = '0x6770d3e75F45a2080973c0021F184AEFE6f5CA67';
const SEPOLIA_FPETH = '0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5';
const SEPOLIA_FPUSD = '0x4aBb056aA5aB39b55039ACAf795Ff9403Fa9760c';

const ROUTER_STATS_ABI = [
	{
		inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
		name: 'getTokenStats',
		outputs: [
			{ internalType: 'uint256', name: 'committed', type: 'uint256' },
			{ internalType: 'uint256', name: 'activeProviders', type: 'uint256' },
			{ internalType: 'uint16', name: 'feeBps', type: 'uint16' },
			{ internalType: 'uint256', name: 'maxFlashLoan', type: 'uint256' },
			{ internalType: 'bool', name: 'supportsPermit', type: 'bool' },
			{ internalType: 'uint16', name: 'maxBorrowBps', type: 'uint16' }
		],
		stateMutability: 'view',
		type: 'function'
	}
] as const;

type PreviewOffer = {
	id: number;
	kind: 'lend' | 'borrow';
	principal: string;
	collateral: string;
	fee: string;
	termDays: number;
	boosted: boolean;
};

type P2PSnapshot = {
	openCount: number;
	loanCount: number;
	previews: PreviewOffer[];
};

type FlashSnapshot = {
	fpEthCommitted: string;
	providers: number;
	feeBps: number;
};

function tokenLabel(addr: string): { symbol: string; decimals: number } {
	const a = addr.toLowerCase();
	if (a === SEPOLIA_FPUSD.toLowerCase()) return { symbol: 'fpUSD', decimals: 6 };
	if (a === SEPOLIA_FPETH.toLowerCase()) return { symbol: 'fpETH', decimals: 18 };
	return { symbol: 'token', decimals: 18 };
}

function fmtAmt(amount: bigint, decimals: number, max = 4): string {
	const raw = ethers.formatUnits(amount, decimals);
	if (!raw.includes('.')) return raw;
	const [i, d] = raw.split('.');
	const dd = d.slice(0, max).replace(/0+$/, '');
	return dd ? `${i}.${dd}` : i;
}

type Props = {
	product: 'p2p' | 'flash';
	onOpenPlayground: () => void;
};

/**
 * Honest "looks busy" panel: live Sepolia playground stats, clearly labelled as
 * valueless play-money. Used when a mainnet market has nothing to show yet.
 */
export default function PlaygroundTeaser({ product, onOpenPlayground }: Props) {
	const sepolia = usePublicClient({ chainId: SEPOLIA_CHAIN });
	const [p2p, setP2p] = useState<P2PSnapshot | null>(null);
	const [flash, setFlash] = useState<FlashSnapshot | null>(null);

	useEffect(() => {
		if (!sepolia || product !== 'p2p') return;
		let cancelled = false;
		(async () => {
			try {
				const abi = p2pAbiFor(2);
				const count = await sepolia.readContract({
					address: SEPOLIA_P2P as `0x${string}`,
					abi,
					functionName: 'loanCount'
				} as any) as bigint;
				const total = Number(count);
				if (total === 0) {
					if (!cancelled) setP2p({ openCount: 0, loanCount: 0, previews: [] });
					return;
				}
				const page = await sepolia.readContract({
					address: SEPOLIA_P2P as `0x${string}`,
					abi,
					functionName: 'getLoansPaged',
					args: [0n, count]
				} as any) as any[];
				const now = Math.floor(Date.now() / 1000);
				const open = page
					.map((l, id) => ({ l, id }))
					.filter(({ l }) => Number(l.status) === 1 && (Number(l.offerExpiry) === 0 || Number(l.offerExpiry) > now))
					.sort((a, b) => {
						const ba = a.l.boost ?? 0n;
						const bb = b.l.boost ?? 0n;
						if (ba !== bb) return ba > bb ? -1 : 1;
						return b.id - a.id;
					});
				const previews: PreviewOffer[] = open.slice(0, 3).map(({ l, id }) => {
					const p = tokenLabel(l.principalToken);
					const c = tokenLabel(l.collateralToken);
					return {
						id,
						kind: l.creatorIsLender ? 'lend' : 'borrow',
						principal: `${fmtAmt(l.principal, p.decimals)} ${p.symbol}`,
						collateral: `${fmtAmt(l.collateral, c.decimals)} ${c.symbol}`,
						fee: `${fmtAmt(l.repaymentFee, p.decimals)} ${p.symbol}`,
						termDays: Math.max(1, Math.round(Number(l.duration) / 86400)),
						boosted: (l.boost ?? 0n) > 0n
					};
				});
				if (!cancelled) setP2p({ openCount: open.length, loanCount: total, previews });
			} catch {
				if (!cancelled) setP2p(null);
			}
		})();
		return () => { cancelled = true; };
	}, [sepolia, product]);

	useEffect(() => {
		if (!sepolia || product !== 'flash') return;
		let cancelled = false;
		(async () => {
			try {
				const stats = await sepolia.readContract({
					address: SEPOLIA_ROUTER as `0x${string}`,
					abi: ROUTER_STATS_ABI,
					functionName: 'getTokenStats',
					args: [SEPOLIA_FPETH as `0x${string}`]
				} as any) as readonly [bigint, bigint, number, bigint, boolean, number];
				if (!cancelled) {
					setFlash({
						fpEthCommitted: fmtAmt(stats[0], 18, 0),
						providers: Number(stats[1]),
						feeBps: Number(stats[2])
					});
				}
			} catch {
				if (!cancelled) setFlash(null);
			}
		})();
		return () => { cancelled = true; };
	}, [sepolia, product]);

	const accent = product === 'p2p'
		? { border: 'border-emerald-200', bg: 'bg-emerald-50/80', chip: 'bg-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700', soft: 'text-emerald-800', icon: <Coins className="h-4 w-4" /> }
		: { border: 'border-blue-200', bg: 'bg-blue-50/80', chip: 'bg-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', soft: 'text-blue-800', icon: <Zap className="h-4 w-4" /> };

	return (
		<div className={`rounded-2xl border ${accent.border} ${accent.bg} overflow-hidden`}>
			<div className="px-5 pt-4 pb-3 flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-start gap-2.5 min-w-0">
					<span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${accent.chip}`}>
						<Sparkles className="h-4 w-4" />
					</span>
					<div>
						<p className={`text-sm font-semibold ${accent.soft}`}>
							Live on the Sepolia playground
						</p>
						<p className="text-xs text-gray-600 mt-0.5 leading-relaxed max-w-xl">
							Mainnet is quiet while the product finds its feet — the testnet market below is
							<strong> real on-chain activity with faucet play-money</strong> (fpUSD / fpETH). No real value; free to try.
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onOpenPlayground}
					className={`inline-flex items-center gap-1.5 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0 ${accent.btn}`}
				>
					Open playground <ArrowRight className="h-4 w-4" />
				</button>
			</div>

			{product === 'p2p' && (
				<div className="px-5 pb-5 space-y-3">
					<div className="flex flex-wrap gap-2 text-[11px]">
						<span className="inline-flex items-center gap-1 bg-white/80 border border-emerald-100 rounded-full px-2.5 py-1 text-emerald-800 font-medium">
							<Droplets className="h-3 w-3" />
							{p2p ? `${p2p.openCount} open offer${p2p.openCount === 1 ? '' : 's'}` : 'Loading offers…'}
						</span>
						{p2p && p2p.loanCount > 0 && (
							<span className="inline-flex items-center gap-1 bg-white/80 border border-emerald-100 rounded-full px-2.5 py-1 text-gray-600">
								{p2p.loanCount} loans ever posted
							</span>
						)}
						<span className="inline-flex items-center gap-1 bg-white/80 border border-amber-100 rounded-full px-2.5 py-1 text-amber-800">
							Play-money only
						</span>
					</div>
					{p2p && p2p.previews.length > 0 ? (
						<div className="grid sm:grid-cols-3 gap-2.5">
							{p2p.previews.map((o) => (
								<button
									key={o.id}
									type="button"
									onClick={onOpenPlayground}
									className="text-left bg-white border border-emerald-100 rounded-xl p-3 hover:border-emerald-300 hover:shadow-sm transition-all"
								>
									<div className="flex items-center justify-between mb-1.5">
										<span className={`text-[10px] font-semibold uppercase tracking-wide ${o.kind === 'lend' ? 'text-emerald-700' : 'text-teal-700'}`}>
											{o.kind === 'lend' ? 'Lend offer' : 'Borrow request'}
										</span>
										{o.boosted && (
											<span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700">
												<Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Featured
											</span>
										)}
									</div>
									<p className="text-sm font-semibold text-gray-900">{o.principal}</p>
									<p className="text-[11px] text-gray-500 mt-0.5">vs {o.collateral} · {o.termDays}d · fee {o.fee}</p>
								</button>
							))}
						</div>
					) : (
						<p className="text-xs text-gray-500">
							{p2p === null
								? 'Could not reach Sepolia just now — open the playground to browse when you can.'
								: 'No open playground offers right now; mint from the faucet and post one.'}
						</p>
					)}
				</div>
			)}

			{product === 'flash' && (
				<div className="px-5 pb-5">
					<div className="grid grid-cols-3 gap-3 bg-white border border-blue-100 rounded-xl p-4">
						<div>
							<p className="text-[11px] text-gray-500">fpETH committed</p>
							<p className="text-lg font-bold text-gray-900">
								{flash ? flash.fpEthCommitted : '…'}
								<span className="text-xs font-medium text-gray-400 ml-1">fpETH</span>
							</p>
						</div>
						<div>
							<p className="text-[11px] text-gray-500">Providers</p>
							<p className="text-lg font-bold text-gray-900">{flash ? flash.providers : '…'}</p>
						</div>
						<div>
							<p className="text-[11px] text-gray-500">Fee</p>
							<p className="text-lg font-bold text-gray-900">
								{flash ? flash.feeBps : '…'}
								<span className="text-xs font-medium text-gray-400 ml-1">bps</span>
							</p>
						</div>
					</div>
					<p className="text-[11px] text-gray-500 mt-2.5 leading-relaxed">
						Faucet-mint fpETH, commit a huge limit, and run the one-click demo — all without spending real ETH beyond gas.
					</p>
				</div>
			)}
		</div>
	);
}

/** True when a mainnet (or any non-playground) market has nothing useful to show yet. */
export function isQuietMarket(opts: { isPlayground: boolean; activity: number }): boolean {
	return !opts.isPlayground && opts.activity <= 0;
}
