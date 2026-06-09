import Head from 'next/head';
import Link from 'next/link';
import { Coins, Calculator, Scale, GitCompareArrows, FileSearch, ArrowRight } from 'lucide-react';
import ContentHeader from '../../components/ContentHeader';
import SiteFooter from '../../components/SiteFooter';
import HowItWorks from '../../components/HowItWorks';

// Standalone, indexable guide for the P2P term loans. The full "How it works" content used to live in
// a single in-app tab; it now has its own shareable URLs. This hub covers the lifecycle, the time-based
// settlement model and the fees, then links out to the focused deep-dives (surplus, calculator, taxes).

// The P2P escrow only runs on the Sepolia playground today; surface that context so the verified-contract
// link and fee figures are accurate on a page with no wallet.
const EXPLORER = 'https://sepolia.etherscan.io';
const P2P_ADDRESS = process.env.NEXT_PUBLIC_SEPOLIA_P2P_LOAN_ADDRESS || '0x3Ce4B6DC383d3105A6D35a6816BC10D395Aa1017';
const INTERFACE_FEE_PCT = 0.01;

function DeepLink({ href, icon, title, body }: { href: string; icon: React.ReactNode; title: string; body: string }) {
	return (
		<Link href={href} className="group bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col">
			<div className="flex items-center gap-2 mb-1">
				<span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700">{icon}</span>
				<h3 className="text-sm font-semibold text-gray-900">{title}</h3>
			</div>
			<p className="text-xs text-gray-500 mt-1 leading-relaxed flex-1">{body}</p>
			<span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 group-hover:text-emerald-900">Open <ArrowRight className="h-3.5 w-3.5" /></span>
		</Link>
	);
}

export default function HowItWorksHub() {
	return (
		<>
			<Head>
				<title>How it works — FlashBank P2P term loans</title>
				<meta name="description" content="How FlashBank peer-to-peer term loans work: post terms, someone takes them, repay a flat fee before the deadline or the lender claims the collateral. Time-based settlement, no oracle, no liquidations." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta property="og:title" content="How FlashBank P2P term loans work" />
				<meta property="og:description" content="Post terms, shake hands on-chain. A flat fee instead of interest, settled purely on time — no pools, no price oracle, no liquidations." />
			</Head>

			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40">
				<ContentHeader back={{ href: '/p2p', label: 'Back to P2P Loans' }} />

				<main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
					<div className="flex items-start gap-4">
						<div className="hidden sm:flex h-12 w-12 rounded-xl bg-emerald-600 text-white items-center justify-center shadow-sm shrink-0">
							<Coins className="h-6 w-6" />
						</div>
						<div>
							<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">How it works</h1>
							<p className="text-gray-600 mt-2 max-w-3xl">
								FlashBank P2P is a neutral escrow for fixed-term, collateral-backed loans between two people. One side
								posts terms, the other takes them. Repay a flat fee before the deadline to redeem the collateral; miss it
								and the lender claims it. Settlement is time-based only — no pools, no price oracle, no liquidations.
							</p>
						</div>
					</div>

					<HowItWorks explorer={EXPLORER} contractAddress={P2P_ADDRESS} isPlayground protocolBps={0} interfaceFeePct={INTERFACE_FEE_PCT} showSurplus={false} />

					{/* Go deeper */}
					<section>
						<h2 className="text-xl font-bold text-gray-900 mb-1">Go deeper</h2>
						<p className="text-sm text-gray-500 mb-4 max-w-3xl">Focused pages you can share on their own.</p>
						<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<DeepLink href="/how-it-works/surplus" icon={<Scale className="h-4 w-4" />} title="Surplus & the agreed rate"
								body="Why a default can return collateral, and who wins when the market rate drifts from the one you agreed." />
							<DeepLink href="/calculator" icon={<Calculator className="h-4 w-4" />} title="Scenario calculator"
								body="Drag the numbers — principal, pledge, fee, agreed rate, market rate — and watch the outcome live." />
							<DeepLink href="/taxes" icon={<FileSearch className="h-4 w-4" />} title="Tax treatment"
								body="When taking a loan is (and isn't) a taxable event, and how a same-asset pledge is structured. Not tax advice." />
							<DeepLink href="/lorrow" icon={<GitCompareArrows className="h-4 w-4" />} title="Lorrow compatibility"
								body="How this escrow maps to the Lorrow lending standard — where we align and where we differ." />
						</div>
					</section>
				</main>

				<SiteFooter />
			</div>
		</>
	);
}
