import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Clock, ExternalLink, RefreshCw, Zap } from 'lucide-react';

// Recent FlashLoanExecuted history for the selected router. Public RPCs often reject wide
// eth_getLogs ranges (403), so we walk backwards in small chunks. No API keys — works on the
// static GitHub Pages export.

const EVENT_ABI = [
	{
		type: 'event',
		name: 'FlashLoanExecuted',
		inputs: [
			{ indexed: true, internalType: 'address', name: 'borrower', type: 'address' },
			{ indexed: true, internalType: 'address', name: 'token', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' },
			{ indexed: false, internalType: 'bool', name: 'toNative', type: 'bool' }
		]
	}
] as const;

const IFACE = new ethers.Interface(EVENT_ABI);
const TOPIC0 = IFACE.getEvent('FlashLoanExecuted')!.topicHash;

/** Public-node-safe window; wider ranges often 403. */
const CHUNK_BLOCKS = 100;
/** ~14h on 12s blocks — enough to surface playground demos without hammering the RPC. */
const LOOKBACK_CHUNKS = 40;
const MAX_ROWS = 25;

export type FlashHistoryToken = {
	address: string;
	symbol: string;
	decimals: number;
};

export type FlashHistoryRow = {
	txHash: string;
	blockNumber: number;
	timestamp: number | null;
	borrower: string;
	token: string;
	symbol: string;
	amount: string;
	fee: string;
	toNative: boolean;
};

type PublicClientLike = {
	getBlockNumber: () => Promise<bigint>;
	getLogs: (args: any) => Promise<any[]>;
	getBlock: (args: any) => Promise<{ timestamp: bigint } | null>;
};

type Props = {
	publicClient: PublicClientLike | undefined | null;
	router: string;
	explorer: string;
	tokens: readonly FlashHistoryToken[];
	/** Bump to force a refresh (e.g. after running the on-page demo). */
	refreshKey?: number;
};

function shortAddr(addr: string) {
	return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function trimAmt(s: string, max = 6) {
	if (!s.includes('.')) return s;
	const [i, d] = s.split('.');
	const dd = d.slice(0, max).replace(/0+$/, '');
	return dd ? `${i}.${dd}` : i;
}

function relativeTime(ts: number | null, now: number) {
	if (!ts) return '—';
	const sec = Math.max(0, now - ts);
	if (sec < 60) return `${sec}s ago`;
	if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
	if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
	return `${Math.floor(sec / 86400)}d ago`;
}

function tokenMeta(tokens: readonly FlashHistoryToken[], address: string): FlashHistoryToken {
	const hit = tokens.find((t) => t.address.toLowerCase() === address.toLowerCase());
	return hit || { address, symbol: shortAddr(address), decimals: 18 };
}

/**
 * Renders recent on-chain flash loans for a router. Empty when the chain has no recent
 * FlashLoanExecuted events (or the RPC refuses logs).
 */
export default function FlashLoanHistory({ publicClient, router, explorer, tokens, refreshKey = 0 }: Props) {
	const [rows, setRows] = useState<FlashHistoryRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

	useEffect(() => {
		const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 15_000);
		return () => clearInterval(t);
	}, []);

	const load = useCallback(async () => {
		if (!publicClient || !router || !ethers.isAddress(router)) {
			setRows([]);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const latest = Number(await publicClient.getBlockNumber());
			const chunks: { from: number; to: number }[] = [];
			for (let i = 0; i < LOOKBACK_CHUNKS; i++) {
				const to = latest - i * CHUNK_BLOCKS;
				const from = Math.max(0, to - CHUNK_BLOCKS + 1);
				if (to < 0) break;
				chunks.push({ from, to });
				if (from === 0) break;
			}

			const settled = await Promise.allSettled(
				chunks.map(({ from, to }) =>
					publicClient.getLogs({
						address: router as `0x${string}`,
						topics: [TOPIC0 as `0x${string}`],
						fromBlock: BigInt(from),
						toBlock: BigInt(to)
					})
				)
			);

			const logs: any[] = [];
			let anyOk = false;
			for (const s of settled) {
				if (s.status === 'fulfilled') {
					anyOk = true;
					logs.push(...s.value);
				}
			}
			if (!anyOk) {
				setError('This RPC will not return event logs right now.');
				setRows([]);
				return;
			}

			const decoded: FlashHistoryRow[] = [];
			for (const log of logs) {
				try {
					const parsed = IFACE.parseLog({ topics: log.topics as string[], data: log.data });
					if (!parsed) continue;
					const token = String(parsed.args.token);
					const meta = tokenMeta(tokens, token);
					decoded.push({
						txHash: log.transactionHash as string,
						blockNumber: Number(log.blockNumber),
						timestamp: null,
						borrower: String(parsed.args.borrower),
						token,
						symbol: meta.symbol,
						amount: trimAmt(ethers.formatUnits(parsed.args.amount as bigint, meta.decimals)),
						fee: trimAmt(ethers.formatUnits(parsed.args.fee as bigint, meta.decimals), 8),
						toNative: Boolean(parsed.args.toNative)
					});
				} catch {
					// skip undecodable
				}
			}

			decoded.sort((a, b) => b.blockNumber - a.blockNumber || a.txHash.localeCompare(b.txHash));
			const top = decoded.slice(0, MAX_ROWS);

			const uniqueBlocks = Array.from(new Set(top.map((r) => r.blockNumber)));
			const stamps = await Promise.allSettled(
				uniqueBlocks.map(async (bn) => {
					const block = await publicClient.getBlock({ blockNumber: BigInt(bn) });
					return [bn, block ? Number(block.timestamp) : null] as const;
				})
			);
			const stampMap = new Map<number, number | null>();
			for (const s of stamps) {
				if (s.status === 'fulfilled') stampMap.set(s.value[0], s.value[1]);
			}
			for (const row of top) {
				row.timestamp = stampMap.get(row.blockNumber) ?? null;
			}

			setRows(top);
		} catch (e: any) {
			setError(e?.shortMessage || e?.message || 'Could not load history');
			setRows([]);
		} finally {
			setLoading(false);
		}
	}, [publicClient, router, tokens]);

	useEffect(() => {
		load();
	}, [load, refreshKey]);

	return (
		<div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
			<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
				<h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
					<Clock className="h-5 w-5 text-blue-500" />
					Recent flash loans
				</h3>
				<button
					type="button"
					onClick={load}
					disabled={loading}
					className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 disabled:opacity-50"
				>
					<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
					{loading ? 'Loading' : 'Refresh'}
				</button>
			</div>

			{error && (
				<p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">{error}</p>
			)}

			{!loading && rows.length === 0 && !error && (
				<div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center">
					<Zap className="h-7 w-7 text-gray-300 mx-auto mb-2" />
					<p className="text-sm font-medium text-gray-800">No flash loans in the recent window</p>
					<p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
						History is read live from <code className="text-[11px] bg-gray-100 px-1 rounded">FlashLoanExecuted</code> events
						on this router. Run the demo below (Sepolia) or borrow via a contract to see rows appear here.
					</p>
				</div>
			)}

			{rows.length > 0 && (
				<div className="overflow-x-auto -mx-1">
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
								<th className="pb-2 pl-1 font-medium">When</th>
								<th className="pb-2 font-medium">Amount</th>
								<th className="pb-2 font-medium hidden sm:table-cell">Fee</th>
								<th className="pb-2 font-medium hidden md:table-cell">Borrower</th>
								<th className="pb-2 pr-1 font-medium text-right">Tx</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r) => (
								<tr key={r.txHash} className="border-b border-gray-50 last:border-0">
									<td className="py-2.5 pl-1 text-gray-600 whitespace-nowrap">{relativeTime(r.timestamp, now)}</td>
									<td className="py-2.5 font-medium text-gray-900 whitespace-nowrap">
										{r.amount} {r.symbol}
										{r.toNative && <span className="ml-1 text-[10px] font-normal text-gray-400">→ ETH</span>}
									</td>
									<td className="py-2.5 text-gray-500 hidden sm:table-cell whitespace-nowrap">{r.fee}</td>
									<td className="py-2.5 text-gray-500 font-mono text-xs hidden md:table-cell">{shortAddr(r.borrower)}</td>
									<td className="py-2.5 pr-1 text-right">
										<a
											href={`${explorer}/tx/${r.txHash}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
										>
											{shortAddr(r.txHash)} <ExternalLink className="h-3 w-3" />
										</a>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<p className="text-[11px] text-gray-400 mt-3">
						Showing up to {MAX_ROWS} loans from the last ~{LOOKBACK_CHUNKS * CHUNK_BLOCKS} blocks on this chain.
					</p>
				</div>
			)}
		</div>
	);
}
