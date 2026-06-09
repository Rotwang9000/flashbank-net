import React from 'react';
import { Droplets, ExternalLink } from 'lucide-react';

// A freely-mintable test token (our PlaygroundToken on Sepolia). `faucet()` mints a fixed batch
// of 10,000 to the caller — see loans/contracts/PlaygroundToken.sol.
export type FaucetToken = {
	symbol: string;
	name?: string;
	address: string;
	decimals: number;
};

type FaucetCardProps = {
	tokens: readonly FaucetToken[];
	// Each host page wires its own write path (wallet client + toast); we only ask for the action.
	onMint: (address: string, symbol: string) => void | Promise<void>;
	isConnected: boolean;
	explorer?: string;
	// Optional balance getter (human units) so the button can show what the wallet already holds.
	balanceOf?: (address: string) => number | null;
	busySymbol?: string | null;
	className?: string;
};

// The standard batch every PlaygroundToken mints per faucet() call.
const FAUCET_BATCH = '10,000';

function trim(n: number): string {
	if (!isFinite(n)) return '0';
	if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
	return String(Number(n.toFixed(4)));
}

/**
 * Reusable faucet panel for the Sepolia playground. Explains what the freely-mintable fp* tokens
 * are (so visitors know they are valueless play-money) and lets a connected wallet mint a batch
 * of each. Shared by the P2P loans page and the flash-loan page to keep the wording and behaviour
 * identical wherever a faucet appears.
 */
export default function FaucetCard({ tokens, onMint, isConnected, explorer, balanceOf, busySymbol, className }: FaucetCardProps) {
	if (!tokens || tokens.length === 0) return null;

	return (
		<div className={`rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden ${className || ''}`}>
			<div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3.5 border-b border-emerald-100 flex items-center gap-2.5">
				<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
					<Droplets className="h-4 w-4" />
				</span>
				<div>
					<h3 className="text-sm font-semibold text-emerald-900">Free test tokens (faucet)</h3>
					<p className="text-xs text-emerald-700/80">Sepolia testnet · play-money with no real value</p>
				</div>
			</div>

			<div className="px-5 py-4 space-y-3">
				<p className="text-sm text-gray-600 leading-relaxed">
					<span className="font-medium text-gray-800">{tokens.map((t) => t.symbol).join(' and ')}</span> are
					flashbank&rsquo;s own freely-mintable ERC-20s. They exist only so anyone can try the flow with
					big numbers — they are <strong>not real assets</strong> and have no value. Each tap of the faucet
					mints {FAUCET_BATCH} to your wallet; mint as often as you like.
				</p>

				<div className="grid gap-2 sm:grid-cols-2">
					{tokens.map((t) => {
						const bal = balanceOf ? balanceOf(t.address) : null;
						const busy = busySymbol === t.symbol;
						return (
							<button
								key={t.address}
								onClick={() => onMint(t.address, t.symbol)}
								disabled={!isConnected || busy}
								title={isConnected ? `Mint ${FAUCET_BATCH} ${t.symbol}` : 'Connect a wallet to mint'}
								className="group flex items-center justify-between gap-2 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2.5 rounded-xl hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<span className="inline-flex items-center gap-2 font-medium">
									<Droplets className="h-4 w-4 flex-shrink-0" />
									{busy ? `Minting ${t.symbol}…` : `Get ${FAUCET_BATCH} ${t.symbol}`}
								</span>
								<span className="text-xs text-emerald-600 tabular-nums">
									{bal != null ? `bal ${trim(bal)}` : `${t.decimals}d`}
								</span>
							</button>
						);
					})}
				</div>

				{explorer && (
					<div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
						{tokens.map((t) => (
							<a
								key={t.address}
								href={`${explorer}/address/${t.address}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors"
							>
								{t.symbol} contract <ExternalLink className="h-3 w-3" />
							</a>
						))}
					</div>
				)}

				{!isConnected && (
					<p className="text-xs text-amber-600">Connect a wallet on Sepolia to mint.</p>
				)}
			</div>
		</div>
	);
}
