import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, Scale, Info, ArrowRight } from 'lucide-react';
import ContentHeader from '../components/ContentHeader';
import SiteFooter from '../components/SiteFooter';
import CollateralSplitDiagram from '../components/CollateralSplitDiagram';

// Interactive, wallet-free scenario explorer. Everything is computed client-side from the same fixed
// terms a real offer carries (principal, collateral, flat fee, term, optional agreed rate) plus one
// thing that genuinely floats — the real market rate — so a visitor can see exactly what happens, and
// who comes out ahead, before they ever post or take an offer. Mirrors the on-chain default split.

const PRINCIPAL_SYMBOL = 'fpUSD';
const COLLATERAL_SYMBOL = 'fpETH';
const DAYS_PER_YEAR = 365;

const fmt = (n: number, dp = 2) => {
	if (!Number.isFinite(n)) return '—';
	const r = Math.round(n * 10 ** dp) / 10 ** dp;
	return Number.isInteger(r) ? r.toLocaleString() : r.toLocaleString(undefined, { maximumFractionDigits: dp });
};

function Slider({ label, value, min, max, step, onChange, suffix, hint }: {
	label: string; value: number; min: number; max: number; step: number;
	onChange: (v: number) => void; suffix?: string; hint?: string;
}) {
	return (
		<div>
			<div className="flex items-baseline justify-between gap-2">
				<label className="text-sm font-medium text-gray-700">{label}</label>
				<span className="text-sm font-semibold text-emerald-700 tabular-nums">{fmt(value)}{suffix ? ` ${suffix}` : ''}</span>
			</div>
			<input
				type="range" min={min} max={max} step={step} value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				className="w-full mt-1.5 accent-emerald-600"
			/>
			{hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
		</div>
	);
}

function Stat({ label, value, tone, sub }: { label: string; value: string; tone?: 'good' | 'bad' | 'plain'; sub?: string }) {
	const cls = tone === 'good' ? 'text-emerald-700' : tone === 'bad' ? 'text-red-600' : 'text-gray-900';
	return (
		<div className="bg-white rounded-xl border border-gray-200 p-3">
			<div className="text-[11px] uppercase tracking-wide text-gray-400">{label}</div>
			<div className={`text-lg font-bold ${cls}`}>{value}</div>
			{sub && <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>}
		</div>
	);
}

export default function CalculatorPage() {
	const [principal, setPrincipal] = useState(1000);
	const [collateral, setCollateral] = useState(3);
	const [feePct, setFeePct] = useState(3);
	const [termDays, setTermDays] = useState(30);
	const [returnSurplus, setReturnSurplus] = useState(true);
	const [agreedRate, setAgreedRate] = useState(500);
	const [marketRate, setMarketRate] = useState(620);

	const fee = (principal * feePct) / 100;
	const debt = principal + fee;
	const effRate = returnSurplus ? agreedRate : 0;

	// Mirror of the on-chain split: with no agreed rate (or one that doesn't cover the debt) the lender
	// takes the whole pledge; otherwise the lender keeps just enough to cover the debt at the agreed rate.
	const settlementValue = effRate > 0 ? effRate * collateral : 0;
	const surplusActive = settlementValue > debt;
	const toLender = surplusActive ? debt / agreedRate : collateral;
	const toBorrower = collateral - toLender;

	// The flat fee, expressed as an annualised rate, so people can compare it to interest products.
	const aprEquivalent = principal > 0 && termDays > 0 ? (fee / principal) * (DAYS_PER_YEAR / termDays) * 100 : 0;

	// Break-even market rate: above it a rational borrower repays (the collateral they'd reclaim is worth
	// more than the debt); below it they walk away. Surplus mode → the agreed rate itself; plain pledge →
	// the rate at which the whole pledge just covers the debt.
	const breakeven = returnSurplus ? agreedRate : (collateral > 0 ? debt / collateral : 0);
	const atBreakeven = Math.abs(marketRate - breakeven) < 0.5; // the slider can land exactly on it
	const borrowerRepays = marketRate > breakeven;
	const collateralMktValue = collateral * marketRate;

	// Lender's result in loan-token terms: a repayment earns exactly the fee; a default leaves them holding
	// the claimable collateral, whose market value may be above or below the principal they put in.
	const lenderResult = borrowerRepays ? fee : toLender * marketRate - principal;

	const verdict = atBreakeven ? 'breakeven' : borrowerRepays ? 'repay' : 'default';

	return (
		<>
			<Head>
				<title>Loan scenario calculator — FlashBank</title>
				<meta name="description" content="Interactive calculator for FlashBank P2P term loans. Drag the principal, collateral, flat fee, term, agreed rate and market rate to see the total to repay, the on-default collateral split, the annualised fee and who wins if the market moves." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta property="og:title" content="FlashBank loan scenario calculator" />
				<meta property="og:description" content="Model any fixed-term loan: repay total, on-default split, annualised fee, and the repay-vs-default decision as the market rate moves." />
			</Head>

			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40">
				<ContentHeader back={{ href: '/how-it-works', label: 'Back to How it works' }} />

				<main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
					<div className="flex items-start gap-4">
						<div className="hidden sm:flex h-12 w-12 rounded-xl bg-emerald-600 text-white items-center justify-center shadow-sm shrink-0">
							<Calculator className="h-6 w-6" />
						</div>
						<div>
							<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Scenario calculator</h1>
							<p className="text-gray-600 mt-2 max-w-3xl">
								Every term on a FlashBank loan is fixed when it&apos;s created — so the outcome is knowable up front. Drag the
								sliders to model a deal, then move the <strong>market rate</strong> (the one thing that genuinely floats) to see
								who comes out ahead. Nothing here touches a wallet or the chain.
							</p>
						</div>
					</div>

					<div className="grid lg:grid-cols-2 gap-6">
						{/* Inputs */}
						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
							<h2 className="text-sm font-semibold text-gray-900">The deal (fixed at creation)</h2>
							<Slider label={`Principal borrowed`} value={principal} min={100} max={10000} step={50} onChange={setPrincipal} suffix={PRINCIPAL_SYMBOL} />
							<Slider label="Collateral pledged" value={collateral} min={0.5} max={10} step={0.1} onChange={setCollateral} suffix={COLLATERAL_SYMBOL} />
							<Slider label="Flat fee" value={feePct} min={0} max={20} step={0.25} onChange={setFeePct} suffix="% of principal"
								hint={`= ${fmt(fee)} ${PRINCIPAL_SYMBOL} · a single fee, not interest`} />
							<Slider label="Term" value={termDays} min={1} max={365} step={1} onChange={setTermDays} suffix="days" />

							<div className="pt-2 border-t border-gray-100">
								<label className="flex items-start gap-2 cursor-pointer">
									<input type="checkbox" checked={returnSurplus} onChange={(e) => setReturnSurplus(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
									<span className="text-sm text-gray-700">
										<span className="font-medium">Return surplus on default</span>
										<span className="block text-[11px] text-gray-400">On = lender keeps only what the debt covers at the agreed rate. Off = lender keeps the whole pledge (pawn-style).</span>
									</span>
								</label>
								{returnSurplus && (
									<div className="mt-3">
										<Slider label="Agreed rate" value={agreedRate} min={100} max={1000} step={10} onChange={setAgreedRate}
											suffix={`${PRINCIPAL_SYMBOL} / ${COLLATERAL_SYMBOL}`} hint="Frozen at creation — never an oracle." />
									</div>
								)}
							</div>
						</div>

						{/* The split */}
						<div className="space-y-4">
							<CollateralSplitDiagram
								principal={principal} fee={fee} collateral={collateral}
								principalSymbol={PRINCIPAL_SYMBOL} collateralSymbol={COLLATERAL_SYMBOL}
								agreedRate={effRate}
							/>
							<div className="grid grid-cols-2 gap-3">
								<Stat label="Total to repay" value={`${fmt(debt)} ${PRINCIPAL_SYMBOL}`} sub={`${fmt(principal)} + ${fmt(fee)} fee`} />
								<Stat label="Fee, annualised" value={`${fmt(aprEquivalent, 1)}%`} sub={`${fmt(feePct, 2)}% flat over ${fmt(termDays, 0)}d`} />
							</div>
						</div>
					</div>

					{/* Market-rate analysis */}
					<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
						<div>
							<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Scale className="h-5 w-5 text-gray-400" /> What if the market moves?</h2>
							<p className="text-sm text-gray-500 mt-1 max-w-3xl">
								The contract never reads a price — but the <em>real</em> market rate still decides whether the borrower would
								rather repay or walk away at the deadline. Drag it and watch the decision flip at the break-even point.
							</p>
						</div>

						<div className="max-w-xl">
							<Slider label="Market rate at the deadline" value={marketRate} min={100} max={1000} step={10} onChange={setMarketRate}
								suffix={`${PRINCIPAL_SYMBOL} / ${COLLATERAL_SYMBOL}`}
								hint={`Break-even ≈ ${fmt(breakeven)} ${PRINCIPAL_SYMBOL} / ${COLLATERAL_SYMBOL} (where repaying and walking away cost the same).`} />
						</div>

						<div className={`rounded-xl border p-4 ${verdict === 'repay' ? 'border-emerald-200 bg-emerald-50' : verdict === 'default' ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
							<div className="flex items-center gap-2 mb-1">
								{verdict === 'repay' ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : verdict === 'default' ? <TrendingDown className="h-5 w-5 text-amber-600" /> : <Scale className="h-5 w-5 text-gray-500" />}
								<h3 className="text-sm font-semibold text-gray-900">
									{verdict === 'repay' ? 'A rational borrower repays' : verdict === 'default' ? 'A rational borrower walks away' : 'Right on the break-even — it’s a coin toss'}
								</h3>
							</div>
							<p className="text-sm text-gray-700 leading-relaxed">
								{verdict === 'repay' ? (
									<>At <strong>{fmt(marketRate)} {PRINCIPAL_SYMBOL}/{COLLATERAL_SYMBOL}</strong> the pledged collateral is worth{' '}
									<strong>{fmt(collateralMktValue)} {PRINCIPAL_SYMBOL}</strong> — more than the {fmt(debt)} {PRINCIPAL_SYMBOL} owed, so it&apos;s
									cheaper to repay and keep it. The lender simply earns the <strong>{fmt(fee)} {PRINCIPAL_SYMBOL}</strong> fee.</>
								) : verdict === 'default' ? (
									<>At <strong>{fmt(marketRate)} {PRINCIPAL_SYMBOL}/{COLLATERAL_SYMBOL}</strong> the claimable collateral is worth only{' '}
									<strong>{fmt(toLender * marketRate)} {PRINCIPAL_SYMBOL}</strong> — less than the {fmt(debt)} {PRINCIPAL_SYMBOL} owed, so the borrower
									keeps the borrowed {fmt(principal)} {PRINCIPAL_SYMBOL} and lets the deadline pass. The lender claims the collateral instead of the cash.</>
								) : (
									<>At <strong>{fmt(marketRate)} {PRINCIPAL_SYMBOL}/{COLLATERAL_SYMBOL}</strong> the claimable collateral is worth almost exactly the{' '}
									{fmt(debt)} {PRINCIPAL_SYMBOL} owed, so repaying and walking away come out the same. Nudge the rate either way to see the decision flip.</>
								)}
							</p>
						</div>

						<div className="grid sm:grid-cols-3 gap-3">
							<Stat label="Outcome" value={verdict === 'repay' ? 'Repaid' : verdict === 'default' ? 'Default' : 'Break-even'} tone={verdict === 'repay' ? 'good' : verdict === 'default' ? 'bad' : 'plain'} />
							<Stat label="Lender result" value={`${lenderResult >= 0 ? '+' : ''}${fmt(lenderResult)} ${PRINCIPAL_SYMBOL}`}
								tone={lenderResult > 0 ? 'good' : lenderResult < 0 ? 'bad' : 'plain'}
								sub={borrowerRepays ? 'the flat fee' : 'collateral value − principal'} />
							<Stat label="Lender holds after" value={borrowerRepays ? `${fmt(debt)} ${PRINCIPAL_SYMBOL}` : `${fmt(toLender)} ${COLLATERAL_SYMBOL}`}
								sub={borrowerRepays ? 'principal + fee' : `worth ${fmt(toLender * marketRate)} ${PRINCIPAL_SYMBOL}`} />
						</div>

						<div className="flex items-start gap-2 text-[11px] text-gray-500 bg-gray-50 rounded-lg p-3">
							<Info className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
							<span>
								This models the borrower&apos;s rational choice at the deadline; people default for other reasons too. The contract
								itself reads no price — it only checks the clock. See <Link href="/how-it-works/surplus" className="underline">surplus &amp; the agreed rate</Link> for the why.
							</span>
						</div>
					</section>

					<Link href="/p2p" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900">
						Post or take a real offer on the playground <ArrowRight className="h-4 w-4" />
					</Link>
				</main>

				<SiteFooter />
			</div>
		</>
	);
}
