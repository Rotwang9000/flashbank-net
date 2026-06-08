import Head from 'next/head';
import Link from 'next/link';
import { Scale, Calculator, ArrowRight } from 'lucide-react';
import ContentHeader from '../../components/ContentHeader';
import SiteFooter from '../../components/SiteFooter';
import { SurplusExplainer } from '../../components/HowItWorks';

// Focused, shareable deep-dive on the one concept people ask about most: where the "surplus" on a
// default comes from, why it's just the over-pledge at an agreed rate (never an oracle), and who wins
// if the real market rate drifts. Reuses the same SurplusExplainer rendered inside the main guide.

export default function SurplusPage() {
	return (
		<>
			<Head>
				<title>Surplus &amp; the agreed rate — FlashBank</title>
				<meta name="description" content="Where the 'surplus' on a defaulted FlashBank loan comes from: it's simply the collateral pledged beyond what you borrowed at an agreed, fixed rate — never a price oracle. Plus case studies of who wins when the market rate moves." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta property="og:title" content="Surplus & the agreed rate, explained" />
				<meta property="og:description" content="No oracle, no market gain — surplus is just the collateral you pledged beyond what you borrowed at the rate you both agreed up front." />
			</Head>

			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40">
				<ContentHeader back={{ href: '/how-it-works', label: 'Back to How it works' }} />

				<main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
					<div className="flex items-start gap-4">
						<div className="hidden sm:flex h-12 w-12 rounded-xl bg-emerald-600 text-white items-center justify-center shadow-sm shrink-0">
							<Scale className="h-6 w-6" />
						</div>
						<div>
							<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Surplus &amp; the agreed rate</h1>
							<p className="text-gray-600 mt-2 max-w-3xl">
								The single most-asked question about these loans. Short version: there is no oracle and no market gain —
								&ldquo;surplus&rdquo; is simply the collateral you pledged <em>beyond</em> what you borrowed at the rate you both
								agreed and froze on day one.
							</p>
						</div>
					</div>

					<SurplusExplainer />

					<Link href="/calculator" className="block bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-5 transition-colors">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<Calculator className="h-6 w-6" />
								<div>
									<div className="font-semibold">Try your own numbers</div>
									<div className="text-emerald-50 text-sm">Drag the sliders and watch the split — and the repay-vs-default call — update live.</div>
								</div>
							</div>
							<ArrowRight className="h-5 w-5 shrink-0" />
						</div>
					</Link>
				</main>

				<SiteFooter />
			</div>
		</>
	);
}
