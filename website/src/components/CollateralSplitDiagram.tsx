import React from 'react';
import { Lock } from 'lucide-react';

// Visual explainer for what happens to the collateral on default. Deliberately oracle-free: a loan is
// just two tokens swapped at an AGREED RATE (loan-token per 1 collateral-token), plus a flat fee. Every
// figure is fixed when the loan is created, so the outcome is known up front. "Surplus" is simply the
// collateral you pledged beyond what you borrowed at that agreed rate. Pure/presentational — numbers are
// passed in, nothing is read on-chain.

type Props = {
	title?: string;
	tag?: string;
	collateral?: number;
	collateralSymbol?: string;
	principal?: number;
	fee?: number;
	principalSymbol?: string;
	// Agreed exchange rate: loan-token units per 1 collateral-token. 0 => plain pledge (no surplus return).
	agreedRate?: number;
};

const round2 = (n: number) => {
	const r = Math.round(n * 100) / 100;
	return Number.isInteger(r) ? String(r) : r.toFixed(2);
};

function Chip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className={`rounded-lg border px-3 py-2 ${accent ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
			<div className="text-[10px] uppercase tracking-wide text-gray-400">{label}</div>
			<div className={`text-sm font-semibold ${accent ? 'text-emerald-800' : 'text-gray-900'}`}>{value}</div>
		</div>
	);
}

export default function CollateralSplitDiagram({
	title,
	tag,
	collateral = 3,
	collateralSymbol = 'fpETH',
	principal = 500,
	fee = 18,
	principalSymbol = 'fpUSD',
	agreedRate = 500
}: Props) {
	const debt = principal + fee;
	const settlementValue = agreedRate > 0 ? agreedRate * collateral : 0;
	const surplusActive = settlementValue > debt;
	// debt / agreedRate == collateral * debt / settlementValue (the on-chain formula), but expressed in rate terms.
	const lenderColl = surplusActive ? debt / agreedRate : collateral;
	const borrowerColl = collateral - lenderColl;
	const lenderPct = Math.max(1, Math.round((lenderColl / collateral) * 1000) / 10);
	const borrowerPct = Math.round((borrowerColl / collateral) * 1000) / 10;

	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
			{(title || tag) && (
				<div className="flex items-center justify-between gap-2">
					{title && <h4 className="text-sm font-semibold text-gray-900">{title}</h4>}
					{tag && <span className="text-[11px] font-medium text-emerald-600">{tag}</span>}
				</div>
			)}

			{/* Everything fixed at origination */}
			<div>
				<div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
					<Lock className="h-3.5 w-3.5" /> Locked when the loan is created — nothing is priced live
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					<Chip label="You borrow" value={`${round2(principal)} ${principalSymbol}`} />
					<Chip label="+ flat fee" value={`${round2(fee)} ${principalSymbol}`} />
					<Chip label="You pledge" value={`${round2(collateral)} ${collateralSymbol}`} />
					<Chip label="Agreed rate" accent value={agreedRate > 0 ? `1 ${collateralSymbol} = ${round2(agreedRate)} ${principalSymbol}` : 'none'} />
				</div>
			</div>

			{/* The bar */}
			<div>
				<div className="text-xs font-semibold text-gray-700 mb-1.5">On default, the pledged {round2(collateral)} {collateralSymbol} splits like this</div>
				<div className="flex h-12 rounded-lg overflow-hidden text-xs font-semibold text-white">
					<div className="bg-red-500 flex items-center justify-center px-2 text-center leading-tight" style={{ flex: lenderPct }}>
						Lender keeps {round2(lenderColl)} {collateralSymbol}
					</div>
					{surplusActive && borrowerColl > 0 && (
						<div className="bg-emerald-500 flex items-center justify-center px-2 text-center leading-tight" style={{ flex: borrowerPct }}>
							Surplus &rarr; borrower {round2(borrowerColl)} {collateralSymbol}
						</div>
					)}
				</div>
				<p className="text-[11px] text-gray-500 mt-1.5">
					{surplusActive ? (
						<>
							The lender takes just enough to cover the {round2(debt)} {principalSymbol} debt <em>at the agreed rate</em>:
							{' '}{round2(debt)} &divide; {round2(agreedRate)} = <strong>{round2(lenderColl)} {collateralSymbol}</strong>.
							The other <strong>{round2(borrowerColl)} {collateralSymbol}</strong> was pledged on top of what you borrowed, so it goes back.
						</>
					) : agreedRate > 0 ? (
						<>You borrowed almost the full value of the pledge ({round2(debt)} {principalSymbol} &ge; {round2(settlementValue)} {principalSymbol} at the agreed rate), so there&apos;s nothing left over — default simply completes the swap.</>
					) : (
						<>No agreed rate is set, so this is a plain pledge: the lender keeps the whole {round2(collateral)} {collateralSymbol} (pawn-style), whatever it&apos;s worth.</>
					)}
				</p>
			</div>

			{surplusActive && (
				<div className="flex flex-wrap gap-3 text-[11px] text-gray-500 pt-1 border-t border-gray-100">
					<span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Lender (made whole — principal + fee, at the agreed rate)</span>
					<span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Borrower (the over-pledged surplus)</span>
				</div>
			)}
		</div>
	);
}
