import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { FileSearch, AlertTriangle, CheckCircle2, XCircle, ShieldCheck, ExternalLink, Lightbulb } from 'lucide-react';
import ContentHeader from '../components/ContentHeader';
import SiteFooter from '../components/SiteFooter';

// Plain-English, heavily-disclaimed overview of when a collateralised loan is (and isn't) a taxable
// event, and how FlashBank's structure maps onto the "pledge vs disposal" distinction. This is NOT tax
// advice; it summarises public guidance with sources so a user can take it to their own professional.

type Source = { name: string; jurisdiction: string; url: string };
const SOURCES: Source[] = [
	{ name: 'Arch Lending — Crypto Loan Tax Guide', jurisdiction: 'US', url: 'https://archlending.com/blog/crypto-loan-tax-guide' },
	{ name: 'TokenTax — DeFi Tax Guide (2026)', jurisdiction: 'US', url: 'https://tokentax.co/blog/defi-tax-guide' },
	{ name: 'Greenspoon Marder LLP — Collateralized Lending', jurisdiction: 'US', url: 'https://www.gmlaw.com/news/cryptocurrency-tax-considerations-collateralized-lending-and-evolving-regulation/' },
	{ name: 'Recap — DeFi Loans & UK Tax', jurisdiction: 'UK', url: 'https://recap.io/blog/crypto-loans-and-defi-lending' },
	{ name: 'Reed CPA — DeFi Lending Tax Treatment', jurisdiction: 'US', url: 'https://reedcorp.tax/helpful-guides/defi-lending-tax/' }
];

function JurisdictionCard({ flag, title, points }: { flag: string; title: string; points: { tone: 'ok' | 'no' | 'warn'; text: React.ReactNode }[] }) {
	const Icon = (t: string) => t === 'ok' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : t === 'no' ? <XCircle className="h-4 w-4 text-red-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />;
	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
			<h3 className="text-base font-semibold text-gray-900 mb-3"><span className="mr-2">{flag}</span>{title}</h3>
			<ul className="space-y-2.5 text-sm text-gray-600">
				{points.map((p, i) => (
					<li key={i} className="flex items-start gap-2"><span className="mt-0.5 shrink-0">{Icon(p.tone)}</span><span>{p.text}</span></li>
				))}
			</ul>
		</div>
	);
}

export default function TaxesPage() {
	return (
		<>
			<Head>
				<title>Tax treatment — FlashBank (not tax advice)</title>
				<meta name="description" content="When is a crypto-backed loan a taxable event? A plain-English, sourced overview of pledge-vs-disposal treatment in the US and UK, how FlashBank's same-asset escrow is structured, and practical ways to avoid an unexpected taxable event. Not tax advice." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta property="og:title" content="Is a FlashBank loan a taxable event?" />
				<meta property="og:description" content="Taking a same-asset pledge is generally not a disposal (US); a default/liquidation is. UK is murkier. Sourced overview — not tax advice." />
			</Head>

			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40">
				<ContentHeader back={{ href: '/how-it-works', label: 'Back to How it works' }} />

				<main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
					<div className="flex items-start gap-4">
						<div className="hidden sm:flex h-12 w-12 rounded-xl bg-gray-900 text-white items-center justify-center shadow-sm shrink-0">
							<FileSearch className="h-6 w-6" />
						</div>
						<div>
							<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Is it a taxable event?</h1>
							<p className="text-gray-600 mt-2 max-w-3xl">
								A common worry: does taking a loan against your crypto trigger a tax bill? Here&apos;s the general shape of it,
								with sources — and how FlashBank&apos;s structure lines up with the part that usually matters: whether you keep
								<strong> beneficial ownership</strong> of your collateral.
							</p>
						</div>
					</div>

					{/* Big disclaimer */}
					<div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
						<AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
						<div className="text-sm text-amber-900 space-y-1.5">
							<p><strong>This is not tax or legal advice.</strong> It is a plain-English summary of public guidance, with sources below.
								Crypto tax rules differ by country, change often, and DeFi specifically is an unsettled area with little official guidance.</p>
							<p>Your situation is your own. <strong>Talk to a qualified tax professional</strong> before acting, and keep your own records (cost basis, dates, values).</p>
						</div>
					</div>

					{/* Short version */}
					<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<h2 className="text-lg font-bold text-gray-900 mb-3">The short version</h2>
						<div className="grid sm:grid-cols-3 gap-4 text-sm">
							<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
								<div className="flex items-center gap-2 font-semibold text-emerald-800 mb-1"><CheckCircle2 className="h-4 w-4" /> Taking a loan</div>
								<p className="text-emerald-900/90">Generally <strong>not</strong> a taxable event where you <em>pledge</em> collateral and keep beneficial ownership — you haven&apos;t sold anything (US). The same principle as a margin or home-equity loan.</p>
							</div>
							<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
								<div className="flex items-center gap-2 font-semibold text-emerald-800 mb-1"><CheckCircle2 className="h-4 w-4" /> Repaying on time</div>
								<p className="text-emerald-900/90">You reclaim the <strong>same</strong> collateral you pledged. Returning borrowed principal isn&apos;t a sale of your collateral — so the round trip is generally not a disposal of it.</p>
							</div>
							<div className="rounded-xl border border-red-200 bg-red-50 p-4">
								<div className="flex items-center gap-2 font-semibold text-red-700 mb-1"><XCircle className="h-4 w-4" /> Defaulting</div>
								<p className="text-red-900/90">When collateral is claimed on default, that <strong>is</strong> a disposal — you realise a gain or loss versus your cost basis, at the collateral&apos;s value then.</p>
							</div>
						</div>
						<p className="text-xs text-gray-500 mt-4">
							The hinge is <strong>beneficial ownership</strong>: pledging without giving up ownership has long been treated as
							<em> not</em> a disposition; an actual transfer of ownership (or a forced sale) is. Sources: Arch Lending, TokenTax, Greenspoon Marder.
						</p>
					</section>

					{/* By jurisdiction */}
					<section>
						<h2 className="text-xl font-bold text-gray-900 mb-4">By jurisdiction (broad strokes)</h2>
						<div className="grid md:grid-cols-3 gap-4">
							<JurisdictionCard flag="🇺🇸" title="United States" points={[
								{ tone: 'ok', text: <>Borrowing against crypto is <strong>generally not</strong> a taxable event — pledging collateral isn&apos;t a disposition (IRS Pub. 544 principle).</> },
								{ tone: 'no', text: <>A <strong>liquidation or default</strong> is a disposal — capital gain/loss on the collateral.</> },
								{ tone: 'warn', text: <>Paying a fee <em>in crypto</em> is itself a small disposal of those fee tokens. Borrowed funds are not income.</> },
								{ tone: 'warn', text: <>The IRS has issued <strong>no DeFi-specific</strong> guidance; structure matters.</> }
							]} />
							<JurisdictionCard flag="🇬🇧" title="United Kingdom" points={[
								{ tone: 'warn', text: <>HMRC may treat moving tokens into a DeFi contract as a <strong>disposal for CGT</strong> if beneficial ownership transfers.</> },
								{ tone: 'no', text: <>Crypto &ldquo;repos&rdquo; don&apos;t get securities&apos; tax-neutral treatment; disposals/reacquisitions can be taxable.</> },
								{ tone: 'warn', text: <>A &ldquo;No Gain, No Loss&rdquo; deferral has been <strong>proposed but not enacted</strong> (as of 2026) — file under current rules.</> }
							]} />
							<JurisdictionCard flag="🌍" title="Elsewhere / general" points={[
								{ tone: 'warn', text: <>Treatment varies widely; many regimes follow the same <strong>pledge-vs-disposal</strong> logic, but few have DeFi-specific rules.</> },
								{ tone: 'ok', text: <>Low-volatility collateral (e.g. a stablecoin) realises little or no gain even <em>if</em> a disposal occurs.</> },
								{ tone: 'warn', text: <>When in doubt, assume a forced sale on default is taxable and keep records.</> }
							]} />
						</div>
					</section>

					{/* How flashbank is structured */}
					<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
						<h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3"><ShieldCheck className="h-5 w-5 text-emerald-600" /> How FlashBank is structured</h2>
						<p className="text-sm text-gray-600 mb-4 max-w-3xl">
							Nothing here changes your tax position — but the design lines up with the facts that support &ldquo;pledge, not
							sale&rdquo; treatment on the happy path:
						</p>
						<ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
							<li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> <span><strong>Same asset back.</strong> Repay and you reclaim the exact tokens you pledged — not a different or wrapped asset.</span></li>
							<li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> <span><strong>No rehypothecation.</strong> The lender never gets to use, lend on or move your collateral — it sits locked in a neutral escrow.</span></li>
							<li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> <span><strong>No receipt token.</strong> You aren&apos;t issued a derivative/receipt token for your collateral, which can muddy the &ldquo;did you dispose of it?&rdquo; question.</span></li>
							<li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> <span><strong>You keep the exposure.</strong> The collateral&apos;s ups and downs stay yours throughout the term — you just can&apos;t move it until you repay.</span></li>
						</ul>
						<p className="text-xs text-gray-500 mt-4">
							Honest caveat: whether a non-custodial smart-contract escrow counts as &ldquo;retaining beneficial ownership&rdquo; is
							legally untested for DeFi, and a default is a genuine disposal in every regime above. Structure helps the argument; it is not a guarantee.
						</p>
					</section>

					{/* Practical options */}
					<section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
						<h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-3"><Lightbulb className="h-5 w-5 text-emerald-600" /> Options to avoid an unexpected taxable event</h2>
						<ol className="space-y-2.5 text-sm text-emerald-900/90 list-decimal pl-5">
							<li><strong>Repay before the deadline.</strong> The reliable lever: a completed round trip returns your <em>same</em> collateral, so there&apos;s no forced sale to report. A default is the taxable moment — avoid it and (in the US) you generally avoid the disposal.</li>
							<li><strong>Pledge low-volatility collateral.</strong> If you may default, collateral with little gain over your cost basis (e.g. a stablecoin) realises little or no taxable gain even when it is claimed.</li>
							<li><strong>Size the fee with tax in mind.</strong> Paying the flat fee in crypto is a small disposal of those fee tokens; using a stable, low-gain token for the fee keeps that negligible.</li>
							<li><strong>Keep records.</strong> Save the offer terms, dates and on-chain values — you&apos;ll want cost basis if any disposal ever occurs.</li>
							<li><strong>Ask a professional</strong> about your country and your numbers before you post or take an offer.</li>
						</ol>
					</section>

					{/* Sources */}
					<section className="bg-white rounded-2xl border border-gray-200 p-5">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">Sources</h3>
						<ul className="grid sm:grid-cols-2 gap-2 text-sm">
							{SOURCES.map((s) => (
								<li key={s.url}>
									<a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900">
										<span className="text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{s.jurisdiction}</span>
										{s.name} <ExternalLink className="h-3 w-3 text-gray-400" />
									</a>
								</li>
							))}
						</ul>
						<p className="text-xs text-gray-400 mt-3">Summarised in good faith; guidance dated around 2026 and subject to change. Always verify against current rules.</p>
					</section>
				</main>

				<SiteFooter />
			</div>
		</>
	);
}
