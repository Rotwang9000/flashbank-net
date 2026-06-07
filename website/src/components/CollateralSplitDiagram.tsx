import React from 'react';
import { Lock } from 'lucide-react';

// Visual explainer for what happens to the collateral on default. Deliberately oracle-free: every
// figure is fixed when the loan is created, so the split is known up front. Defaults mirror the live
// seeded offer #0 so the picture matches what visitors see in the marketplace. Pure/presentational —
// numbers are passed in, nothing is read on-chain.

type Props = {
	collateral?: number;
	collateralSymbol?: string;
	principal?: number;
	fee?: number;
	principalSymbol?: string;
	settlementValue?: number; // agreed worth of the WHOLE collateral, in principal units (0 = forfeit)
};

const round2 = (n: number) => {
	const r = Math.round(n * 100) / 100;
	return Number.isInteger(r) ? String(r) : r.toFixed(2);
};

function Chip({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
			<div className="text-[10px] uppercase tracking-wide text-gray-400">{label}</div>
			<div className="text-sm font-semibold text-gray-900">{value}</div>
		</div>
	);
}

export default function CollateralSplitDiagram({
	collateral = 3,
	collateralSymbol = 'fpETH',
	principal = 500,
	fee = 18,
	principalSymbol = 'fpUSD',
	settlementValue = 1500
}: Props) {
	const debt = principal + fee;
	const surplusActive = settlementValue > debt;
	const lenderColl = surplusActive ? (collateral * debt) / settlementValue : collateral;
	const borrowerColl = collateral - lenderColl;
	const lenderPct = Math.round((lenderColl / collateral) * 1000) / 10; // one decimal
	const borrowerPct = Math.round((borrowerColl / collateral) * 1000) / 10;

	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
			{/* Everything fixed at origination */}
			<div>
				<div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
					<Lock className="h-3.5 w-3.5" /> Locked when the loan is created — nothing is priced live
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					<Chip label="Principal" value={`${round2(principal)} ${principalSymbol}`} />
					<Chip label="+ flat fee" value={`${round2(fee)} ${principalSymbol}`} />
					<Chip label="Collateral pledged" value={`${round2(collateral)} ${collateralSymbol}`} />
					<Chip label="Agreed value" value={`${round2(settlementValue)} ${principalSymbol}`} />
				</div>
			</div>

			{/* Mode A — plain pledge */}
			<div>
				<div className="flex items-center justify-between text-xs mb-1.5">
					<span className="font-semibold text-gray-700">Plain pledge <span className="text-gray-400 font-normal">· settlementValue = 0</span></span>
					<span className="text-gray-400">default</span>
				</div>
				<div className="flex h-12 rounded-lg overflow-hidden text-xs font-semibold text-white">
					<div className="bg-red-500 flex items-center justify-center px-2 w-full">Lender keeps all {round2(collateral)} {collateralSymbol}</div>
				</div>
				<p className="text-[11px] text-gray-400 mt-1">The borrower forfeits the whole pledge — simple, pawn-style.</p>
			</div>

			{/* Mode B — surplus return */}
			<div>
				<div className="flex items-center justify-between text-xs mb-1.5">
					<span className="font-semibold text-gray-700">Surplus return <span className="text-gray-400 font-normal">· settlementValue = {round2(settlementValue)} {principalSymbol}</span></span>
					<span className="text-emerald-600">Lorrow-compatible</span>
				</div>
				<div className="flex h-12 rounded-lg overflow-hidden text-xs font-semibold text-white">
					<div className="bg-red-500 flex items-center justify-center px-2 text-center leading-tight" style={{ flex: lenderPct }}>
						Lender {round2(lenderColl)} {collateralSymbol}
					</div>
					<div className="bg-emerald-500 flex items-center justify-center px-2 text-center leading-tight" style={{ flex: borrowerPct }}>
						Borrower reclaims {round2(borrowerColl)} {collateralSymbol}
					</div>
				</div>
				<p className="text-[11px] text-gray-400 mt-1">
					Lender&apos;s slice = debt &divide; agreed value = {round2(debt)} &divide; {round2(settlementValue)} = {lenderPct}% of the collateral. The rest goes back to the borrower.
				</p>
			</div>

			<div className="flex flex-wrap gap-3 text-[11px] text-gray-500 pt-1 border-t border-gray-100">
				<span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Lender (made whole — principal + fee)</span>
				<span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Borrower (the over-pledged surplus)</span>
			</div>
		</div>
	);
}
