import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
	Zap, Coins, ArrowRight, ShieldCheck, Clock, Scale, Github, FileSearch,
	Droplets, Wallet, Timer, BadgeCheck, Bot
} from 'lucide-react';
import SiteFooter from '../components/SiteFooter';
import ContentHeader from '../components/ContentHeader';

// Landing page for the bare domain. Previously `/` redirected straight to the flash-loan app;
// a proper front door introduces BOTH products on equal footing and gives search/sharing a real
// home. "flashbank" stays a VERB throughout — we are not a bank and take no deposits.

const GITHUB = 'https://github.com/Rotwang9000/flashbank-net';

const FLASH_POINTS = [
	{ icon: <Zap className="h-4 w-4" />, text: 'Borrow, use and repay in one atomic transaction — it cannot half-happen' },
	{ icon: <Wallet className="h-4 w-4" />, text: 'Liquidity never leaves the providers\u2019 own wallets (allowance-based, no deposits)' },
	{ icon: <BadgeCheck className="h-4 w-4" />, text: 'Live on Ethereum, Base and Arbitrum · capped fees, immutable router' },
];

const P2P_POINTS = [
	{ icon: <Clock className="h-4 w-4" />, text: 'Fixed term, one flat fee — no interest clock, no price oracle, no margin calls' },
	{ icon: <Timer className="h-4 w-4" />, text: 'Settles purely on time: repay before the deadline or the collateral is claimable' },
	{ icon: <BadgeCheck className="h-4 w-4" />, text: 'Live on Ethereum and Base · direct on the contract is zero commission' },
];

function ProductCard({ accent, icon, title, blurb, points, href, cta }: {
	accent: 'blue' | 'emerald';
	icon: React.ReactNode;
	title: string;
	blurb: string;
	points: { icon: React.ReactNode; text: string }[];
	href: string;
	cta: string;
}) {
	const tone = accent === 'blue'
		? { chip: 'bg-blue-600', point: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' }
		: { chip: 'bg-emerald-600', point: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700' };
	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7 flex flex-col">
			<div className="flex items-center gap-3 mb-3">
				<span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white ${tone.chip}`}>{icon}</span>
				<h2 className="text-xl font-bold text-gray-900">{title}</h2>
			</div>
			<p className="text-sm text-gray-600 leading-relaxed mb-4">{blurb}</p>
			<ul className="space-y-2.5 mb-6">
				{points.map((p, i) => (
					<li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
						<span className={`mt-0.5 shrink-0 ${tone.point}`}>{p.icon}</span>
						<span>{p.text}</span>
					</li>
				))}
			</ul>
			<Link href={href} className={`mt-auto inline-flex items-center justify-center gap-1.5 self-start text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tone.btn}`}>
				{cta} <ArrowRight className="h-4 w-4" />
			</Link>
		</div>
	);
}

function TrustItem({ icon, title, text, href, external }: {
	icon: React.ReactNode; title: string; text: string; href: string; external?: boolean;
}) {
	return (
		<a
			href={href}
			{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
			className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all block"
		>
			<div className="flex items-center gap-2 mb-1.5 text-gray-900 font-semibold text-sm">
				<span className="text-gray-400">{icon}</span> {title}
			</div>
			<p className="text-xs text-gray-500 leading-relaxed">{text}</p>
		</a>
	);
}

export default function Home() {
	return (
		<>
			<Head>
				<title>FlashBank — flash loans &amp; P2P term loans, no custody</title>
				<meta name="description" content="Two ways to move money on-chain without giving up custody: atomic flash loans from liquidity that never leaves provider wallets, and fixed-term peer-to-peer loans with one flat fee, no interest and no price oracle. Live on Ethereum, Base and Arbitrum." />
				<link rel="canonical" href="https://flashbank.net/" />
				<meta property="og:title" content="FlashBank — flash loans & P2P term loans" />
				<meta property="og:description" content="Atomic flash loans and fixed-term P2P loans. No deposits, no custody, no nonsense." />
				<meta property="og:url" content="https://flashbank.net/" />
				<meta property="og:type" content="website" />
			</Head>

			<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col">
				<ContentHeader />

				<main className="container mx-auto px-4 sm:px-6 max-w-5xl flex-1">
					{/* Hero */}
					<section className="text-center pt-14 pb-10 sm:pt-20 sm:pb-14">
						<p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1 mb-5">
							<ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Open source · verified on Etherscan · self-custody throughout
						</p>
						<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
							To <span className="text-blue-600">flashbank</span>
						</h1>
						<p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
							To move money on-chain without handing it to anyone. Two ways to do it: an atomic{' '}
							<strong className="text-gray-800">flash loan</strong>, or a fixed-term{' '}
							<strong className="text-gray-800">peer-to-peer loan</strong> agreed directly between two people.
							No deposits, no custody, no nonsense.
						</p>
						<div className="mt-7 flex flex-wrap justify-center gap-3">
							<Link href="/flash" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
								<Zap className="h-4 w-4" /> Flash loans
							</Link>
							<Link href="/p2p" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
								<Coins className="h-4 w-4" /> P2P loans
							</Link>
							<Link href="/audit" className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 transition-colors">
								<FileSearch className="h-4 w-4" /> Read our self-audit
							</Link>
						</div>
					</section>

					{/* Products */}
					<section className="grid md:grid-cols-2 gap-5 pb-10">
						<ProductCard
							accent="blue"
							icon={<Zap className="h-5 w-5" />}
							title="Flash loans"
							blurb="Flashbank a large sum for the lifetime of a single transaction — arbitrage, refinance, liquidate — and repay it plus a small capped fee before the block closes. If anything fails, the whole thing never happened."
							points={FLASH_POINTS}
							href="/flash"
							cta="Open the flash-loan app"
						/>
						<ProductCard
							accent="emerald"
							icon={<Coins className="h-5 w-5" />}
							title="P2P term loans"
							blurb="Flashbank a loan directly with another person: collateral and terms locked in a neutral escrow, one flat fee instead of interest, and settlement decided purely by the clock — never by a price feed."
							points={P2P_POINTS}
							href="/p2p"
							cta="Open the loans marketplace"
						/>
					</section>

					{/* Trust strip */}
					<section className="pb-10">
						<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
							<TrustItem icon={<FileSearch className="h-4 w-4" />} title="Honest audit" text="A candid self-review of both products that leads with the limitations, not the badges." href="/audit" />
							<TrustItem icon={<Scale className="h-4 w-4" />} title="How it works" text="Plain-English walkthroughs, diagrams and a scenario calculator for the loan mechanics." href="/how-it-works" />
							<TrustItem icon={<Github className="h-4 w-4" />} title="All code public" text="Contracts verified on Etherscan; the whole repo — site included — is on GitHub." href={GITHUB} external />
							<TrustItem icon={<Droplets className="h-4 w-4" />} title="Try it free" text="A Sepolia playground with faucet play-money (fpETH/fpUSD) — experiment with big numbers at zero risk." href="/p2p" />
						</div>
					</section>

					{/* Agents */}
					<section className="pb-10">
						<div className="bg-slate-900 rounded-2xl px-6 py-7 sm:px-8 text-slate-100">
							<div className="flex items-center gap-2.5 mb-2">
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/60">
									<Bot className="h-4 w-4 text-emerald-400" />
								</span>
								<h2 className="text-lg font-bold">Agents can flashbank too</h2>
							</div>
							<p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
								An open-source <strong className="text-slate-100">MCP server</strong> lets AI agents browse offers,
								quote fees and check flash-loan liquidity with zero configuration — and, with an explicitly
								configured throwaway key, transact on the Sepolia playground. Mainnet writes are double-gated.
							</p>
							<pre className="mt-4 bg-slate-950 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-emerald-300 overflow-x-auto">npx -y @flashbank/mcp</pre>
							<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
								<a href="https://www.npmjs.com/package/@flashbank/mcp" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 underline underline-offset-2">npm: @flashbank/mcp</a>
								<a href="https://registry.modelcontextprotocol.io/v0/servers?search=flashbank" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 underline underline-offset-2">Official MCP Registry</a>
								<a href="https://glama.ai/mcp/servers/Rotwang9000/flashbank-net" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 underline underline-offset-2">Glama</a>
								<a href={`${GITHUB}/tree/master/mcp`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 underline underline-offset-2">Docs &amp; tool catalogue</a>
							</div>
						</div>
					</section>

					{/* Honesty line */}
					<section className="pb-14">
						<div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-900 text-center">
							<strong>Unaudited software.</strong> Everything here is open source and self-reviewed, but no external
							firm has audited it. Use real assets at your own risk — and read the <Link href="/audit" className="underline font-medium">audit page</Link> first.
						</div>
					</section>
				</main>

				<SiteFooter />
			</div>
		</>
	);
}
