import React from 'react';
import { Coins, Repeat, ShieldCheck, TrendingDown, Minus, TrendingUp, Lightbulb } from 'lucide-react';

// Case studies for the optional surplus-return mode. Answers two questions the plain mechanics don't:
// (1) why would anyone pledge more than they borrow, and (2) who comes out ahead if the *real* market
// rate drifts away from the agreed rate during the term. Pure/presentational; the worked figures match
// the live seeded pawn-style offer (borrow 500 fpUSD + 18 fee against 3 fpETH at 1 fpETH = 500 fpUSD).

type Row = {
	icon: React.ReactNode;
	rate: string;
	move: string;
	lender: string;
	borrower: string;
	tone: 'down' | 'level' | 'up';
};

const ROWS: Row[] = [
	{
		icon: <TrendingDown className="h-4 w-4" />,
		rate: '1 fpETH = 300 fpUSD (fell)',
		move: 'Walk away — the pledge is now worth less than repaying',
		lender: 'Takes 1.04 fpETH ≈ 311 fpUSD — short of the 518 owed',
		borrower: 'Keeps 1.96 fpETH (≈ 589) + the 500 borrowed',
		tone: 'down'
	},
	{
		icon: <Minus className="h-4 w-4" />,
		rate: '1 fpETH = 500 fpUSD (the agreed rate)',
		move: 'Indifferent — repaying and defaulting are worth the same',
		lender: 'Made whole — 518 fpUSD either way',
		borrower: 'Fairly settled — keeps exactly the surplus',
		tone: 'level'
	},
	{
		icon: <TrendingUp className="h-4 w-4" />,
		rate: '1 fpETH = 700 fpUSD (rose)',
		move: 'Repay — the pledge is worth more than the debt',
		lender: 'Gets 518 fpUSD (principal + fee) — just the fee as profit',
		borrower: 'Redeems 3 fpETH (≈ 2 100) for 518 — keeps the upside',
		tone: 'up'
	}
];

const toneCls: Record<Row['tone'], string> = {
	down: 'text-red-600',
	level: 'text-gray-500',
	up: 'text-emerald-600'
};

export default function SurplusCaseStudies() {
	return (
		<div className="space-y-5">
			{/* Why people do it */}
			<div className="grid sm:grid-cols-3 gap-4">
				<WhyCard
					icon={<Coins className="h-5 w-5 text-emerald-600" />}
					title="Keep your ETH, get quick cash"
					body="You only need a little liquidity and you fully intend to repay. You pledge a chunky asset but borrow far less than it's worth. Surplus return means a missed deadline costs you only what you borrowed — not the whole bag."
					mode="pledge > loan · surplus matters" />
				<WhyCard
					icon={<Repeat className="h-5 w-5 text-emerald-600" />}
					title="Sell now, buy it back later"
					body="A repo-style deal: you borrow almost the full agreed value of the collateral. If you don't repay, default simply completes the swap at the rate you agreed — there's little or no surplus either way."
					mode="loan ≈ value · ~no surplus" />
				<WhyCard
					icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
					title="Lender wants a cushion"
					body="The lender sets the agreed rate conservatively (or leaves surplus return off). A lower agreed rate hands them more collateral on default, so they stay covered even if the market rate slips before they can sell."
					mode="conservative rate · lender-protected" />
			</div>

			{/* Who wins if the rate moves */}
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="px-5 pt-4 pb-3 border-b border-gray-100">
					<h4 className="text-sm font-semibold text-gray-900">Who wins if the market rate moves?</h4>
					<p className="text-xs text-gray-500 mt-1">
						Same loan throughout, <strong>surplus-return mode</strong>: borrow 500 fpUSD + 18 fee against 3 fpETH, agreed rate 1 fpETH = 500 fpUSD.
						The contract never reads a price — but the borrower will, when deciding whether to repay.
					</p>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-xs">
						<thead>
							<tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
								<th className="px-4 py-2 font-medium">Market rate at the deadline</th>
								<th className="px-4 py-2 font-medium">Borrower&apos;s smart move</th>
								<th className="px-4 py-2 font-medium">Lender ends up with</th>
								<th className="px-4 py-2 font-medium">Borrower ends up with</th>
							</tr>
						</thead>
						<tbody>
							{ROWS.map((r, i) => (
								<tr key={i} className="border-b border-gray-50 last:border-0 align-top">
									<td className={`px-4 py-2.5 font-medium ${toneCls[r.tone]}`}>
										<span className="inline-flex items-center gap-1.5">{r.icon}{r.rate}</span>
									</td>
									<td className="px-4 py-2.5 text-gray-700">{r.move}</td>
									<td className="px-4 py-2.5 text-gray-600">{r.lender}</td>
									<td className="px-4 py-2.5 text-gray-600">{r.borrower}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* The takeaway */}
			<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
				<div className="flex items-center gap-2 mb-2 text-emerald-900">
					<Lightbulb className="h-5 w-5 text-emerald-600" />
					<h4 className="text-sm font-semibold">The agreed rate is the lender&apos;s break-even</h4>
				</div>
				<p className="text-sm text-emerald-900/90 leading-relaxed">
					In surplus mode the borrower repays only when the market rate sits <strong>above</strong> the agreed rate, and walks when it sits below —
					so the agreed rate is exactly the line between the two. Above it, the lender just earns the fee; below it, they absorb the shortfall,
					because they handed the surplus back instead of keeping it. That&apos;s the cost of treating the borrower fairly.
				</p>
				<p className="text-sm text-emerald-900/90 leading-relaxed mt-2">
					In a <strong>plain pledge</strong> (surplus return off), the over-pledge itself is the cushion: at 1 fpETH = 300 the borrower still repays
					(their 3 fpETH are worth 900, more than the 518 debt), so the lender is made whole. The trade-off is blunt — fair to the borrower, or
					protective of the lender. Pick per offer; set a conservative agreed rate to lean toward the lender while still returning genuine surplus.
				</p>
			</div>
		</div>
	);
}

function WhyCard({ icon, title, body, mode }: { icon: React.ReactNode; title: string; body: string; mode: string }) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col">
			<span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 mb-2">{icon}</span>
			<h4 className="text-sm font-semibold text-gray-900">{title}</h4>
			<p className="text-xs text-gray-500 mt-1 leading-relaxed flex-1">{body}</p>
			<p className="text-[11px] font-medium text-emerald-700 mt-2">{mode}</p>
		</div>
	);
}
