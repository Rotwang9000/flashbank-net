import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import {
	ArrowLeft, ShieldCheck, Zap, Coins, AlertTriangle, CheckCircle2, Lock, Scale,
	FileSearch, ExternalLink, Github, FlaskConical, KeyRound, Clock
} from 'lucide-react';
import SiteFooter from '../components/SiteFooter';

const GITHUB = 'https://github.com/Rotwang9000/flashbank-net';

// Honest, plain-English audit of BOTH FlashBank features. Deliberately not a marketing page:
// it names the trust assumptions, centralisation vectors and limitations we found while reading
// our own contracts, and is explicit that nobody external has reviewed them. Severities are our
// own judgement and are no substitute for a professional audit. Content-only (no wallet wiring).

type Sev = 'good' | 'design' | 'trust' | 'low' | 'medium';

const SEV: Record<Sev, { label: string; cls: string }> = {
	good: { label: 'Strength', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
	design: { label: 'By design', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
	trust: { label: 'Trust assumption', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
	low: { label: 'Low', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
	medium: { label: 'Medium', cls: 'bg-orange-100 text-orange-700 border-orange-200' }
};

function Mono({ children }: { children: React.ReactNode }) {
	return <code className="bg-gray-100 text-gray-700 rounded px-1 py-0.5 text-[0.85em] font-mono">{children}</code>;
}

function SevBadge({ sev }: { sev: Sev }) {
	return <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${SEV[sev].cls}`}>{SEV[sev].label}</span>;
}

function Finding({ sev, title, children }: { sev: Sev; title: string; children: React.ReactNode }) {
	return (
		<div className="border-b border-gray-100 last:border-0 py-3.5">
			<div className="flex items-start gap-3">
				<div className="pt-0.5 shrink-0"><SevBadge sev={sev} /></div>
				<div>
					<h4 className="text-sm font-semibold text-gray-900">{title}</h4>
					<p className="text-sm text-gray-600 mt-1 leading-relaxed">{children}</p>
				</div>
			</div>
		</div>
	);
}

function StatCard({ icon, accent, title, rows }: { icon: React.ReactNode; accent: string; title: string; rows: { k: string; v: string }[] }) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
			<div className={`flex items-center gap-2 px-5 py-3 ${accent} text-white`}>
				{icon}<h3 className="font-semibold">{title}</h3>
			</div>
			<dl className="p-5 space-y-2 text-sm">
				{rows.map((r) => (
					<div key={r.k} className="flex items-start justify-between gap-3">
						<dt className="text-gray-400 shrink-0">{r.k}</dt>
						<dd className="text-right text-gray-700">{r.v}</dd>
					</div>
				))}
			</dl>
		</div>
	);
}

export default function Audit() {
	return (
		<>
			<Head>
				<title>Honest audit — FlashBank</title>
				<meta name="description" content="A candid, plain-English audit of both FlashBank features — the flash-loan router and the peer-to-peer term loans. Trust assumptions, centralisation, known limitations, what's tested and what isn't. Self-reviewed; no external audit." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40">
				{/* Simple header */}
				<header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
					<div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between max-w-5xl">
						<Link href="/flash" className="flex items-center gap-2.5">
							<div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm"><Zap className="h-5 w-5 text-white" /></div>
							<span className="text-lg font-bold text-gray-900 tracking-tight">Flash<span className="text-blue-600">Bank</span></span>
						</Link>
						<nav className="flex items-center gap-4 text-sm">
							<Link href="/flash" className="text-gray-500 hover:text-gray-900">Flash Loans</Link>
							<Link href="/p2p" className="text-gray-500 hover:text-gray-900">P2P Loans</Link>
							<a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"><Github className="h-4 w-4" /></a>
						</nav>
					</div>
				</header>

				<main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
					{/* Title */}
					<div>
						<Link href="/p2p" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
							<ArrowLeft className="h-4 w-4" /> Back to P2P Loans
						</Link>
						<div className="flex items-start gap-4">
							<div className="hidden sm:flex h-12 w-12 rounded-xl bg-gray-900 text-white items-center justify-center shadow-sm shrink-0">
								<FileSearch className="h-6 w-6" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">An honest audit</h1>
								<p className="text-gray-600 mt-2 max-w-3xl">
									Both FlashBank features, reviewed candidly: what they do, who you have to trust, what can go wrong,
									and exactly what is and isn&apos;t tested. We would rather under-claim than oversell — so this page
									leads with the limitations, not the badges.
								</p>
							</div>
						</div>
					</div>

					{/* Honesty banner */}
					<div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
						<AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
						<div className="text-sm text-amber-900 space-y-1.5">
							<p><strong>No external audit.</strong> Neither contract has been reviewed by a professional auditing firm. Everything below is our own reading of our own code. The severities are our judgement, not an independent rating.</p>
							<p><strong>The P2P loans are now live on Ethereum and Base</strong> (mainnet, real assets), alongside a Sepolia play-money playground. They carry no external audit — only this self-review — so weigh real-money use accordingly. The Sepolia playground uses valueless test tokens (fpUSD/fpETH from the on-page faucet); never confuse the two.</p>
							<p><strong>Custom tokens are testnet-only for now.</strong> On mainnet the interface offers only <strong>ETH and USDC</strong>; the contract itself stays fully permissionless. A next version (<code className="text-xs bg-amber-100 px-1 py-0.5 rounded">FlashBankP2PLoanV2</code>) that sanity-checks tokens and adds a graduated <em>cooling-off</em> fee rebate — so a near-instant return costs almost nothing, blocking fake-token fee farming — is written and unit-tested but <strong>not deployed</strong>. See <a href={`${GITHUB}/blob/master/docs/design/P2P_V2_COOLING_OFF.md`} target="_blank" rel="noopener noreferrer" className="underline">the v2 design notes</a>.</p>
							<p><strong>Open by default.</strong> Source for both contracts is verified on Etherscan and public on <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="underline">GitHub</a>. Please read it, and tell us what we missed.</p>
						</div>
					</div>

					{/* Summary cards */}
					<div className="grid md:grid-cols-2 gap-4">
						<StatCard
							icon={<Zap className="h-5 w-5" />}
							accent="bg-blue-600"
							title="Flash-loan router"
							rows={[
								{ k: 'Custody', v: 'Non-custodial (allowance-based)' },
								{ k: 'Liquidity', v: 'Stays in provider wallets' },
								{ k: 'Tests', v: '57 passing · 21 pending' },
								{ k: 'Admin model', v: 'Dual-sig + single-sig emergencies' },
								{ k: 'External audit', v: 'None' },
								{ k: 'Upgradeable', v: 'No (immutable)' }
							]}
						/>
						<StatCard
							icon={<Coins className="h-5 w-5" />}
							accent="bg-emerald-600"
							title="P2P term loans"
							rows={[
								{ k: 'Custody', v: 'Escrow between create & settle' },
								{ k: 'Pricing', v: 'No oracle · time-based only' },
								{ k: 'Tests', v: '48 live + 17 staged (v2)' },
								{ k: 'Owner powers', v: 'Interface fee only (≤ 1%)' },
								{ k: 'External audit', v: 'None' },
								{ k: 'Network', v: 'Ethereum + Base · Sepolia demo' }
							]}
						/>
					</div>

					{/* How to read */}
					<div className="bg-white rounded-2xl border border-gray-200 p-5">
						<h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3"><Scale className="h-5 w-5 text-gray-400" /> How to read this</h2>
						<div className="flex flex-wrap gap-2 mb-3">
							{(Object.keys(SEV) as Sev[]).map((s) => <SevBadge key={s} sev={s} />)}
						</div>
						<p className="text-sm text-gray-600 leading-relaxed">
							<strong>Strength</strong> is something we think we got right. <strong>By design</strong> is a deliberate trade-off you
							should understand before using it. <strong>Trust assumption</strong> means there is a person or counterparty you
							are relying on. <strong>Low</strong> / <strong>Medium</strong> are issues ranked by our own estimate of impact and
							likelihood.
						</p>
					</div>

					{/* ----- ROUTER ----- */}
					<section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
						<div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
							<div className="flex items-center gap-2 mb-1"><Zap className="h-6 w-6" /><h2 className="text-2xl font-bold">Flash-loan router</h2></div>
							<p className="text-blue-50 text-sm max-w-3xl">
								<Mono>FlashBankRouter</Mono> lets anyone borrow a token within a single transaction, provided they return it plus a
								fee before the transaction ends. Liquidity is never pooled in the contract — it stays in provider wallets and is
								pulled, used and returned inside one atomic call.
							</p>
						</div>

						<div className="p-6 space-y-6">
							<div>
								<h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5"><Lock className="h-4 w-4 text-gray-400" /> Custody &amp; settlement</h3>
								<p className="text-sm text-gray-600 leading-relaxed">
									Providers approve the router as a spender; the router pulls only at loan time and returns funds in the same
									transaction. Repayment is checked by comparing balances before and after — if the borrowed amount plus fee
									has not come back, the whole transaction reverts. There are no price oracles and no liquidations.
								</p>
							</div>

							<div>
								<h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-gray-400" /> Trust assumptions &amp; findings</h3>
								<div className="rounded-xl border border-gray-200 px-4">
									<Finding sev="good" title="Non-custodial, immutable, reentrancy-guarded">
										Provider funds never sit in the contract. <Mono>flashLoan()</Mono> is <Mono>nonReentrant</Mono>, repayment is
										balance-verified, the borrower callback runs inside a <Mono>try/catch</Mono>, and there is no upgrade proxy —
										the deployed bytecode is what runs forever.
									</Finding>
									<Finding sev="trust" title="A live allowance is a standing exposure">
										To earn fees you grant the router an ERC-20 allowance. While that allowance is live, a bug in the (immutable)
										router could in principle move up to the approved amount. Mitigations: the code is small and reentrancy-guarded,
										every loan must round-trip in one transaction, and you can pause or set your allowance to zero at any time. The
										provider UI now approves the <em>exact</em> amount for a bounded commitment (unlimited is opt-in) and has a one-click
										&ldquo;revoke (set to 0)&rdquo;.
									</Finding>
									<Finding sev="medium" title="The owner can take up to 100% of the fee">
										<Mono>ownerFeeBps</Mono> is capped at 100% <em>of the fee</em> (not of the loan). A misconfiguration or hostile
										owner could route the entire fee to the protocol, leaving providers with their principal back but no reward.
										Providers can pause if they dislike the split. The loan fee itself is hard-capped at 0.01%–1%.
									</Finding>
									<Finding sev="medium" title="Single-signature emergency paths exist">
										Most sensitive actions use a propose/execute dual-signature flow, but <Mono>setTokenConfig</Mono> and
										<Mono>withdrawOwnerProfits</Mono> are callable by the owner <em>or</em> admin alone. A single compromised key can
										therefore change fees/limits/enabled-status and sweep <em>accrued protocol fees</em> (not provider funds).
									</Finding>
									<Finding sev="trust" title="Admin rescue can move the contract's own balance">
										<Mono>proposeRescueToken</Mono>/<Mono>RescueETH</Mono> (dual-sig) can send any token or ETH the contract holds to any
										address. The router is normally near-empty, but this covers transient loan funds and accrued fees, so it is a
										real operator capability worth knowing about.
									</Finding>
									<Finding sev="design" title="Owner can disable a token / fee-on-transfer unsupported">
										Disabling a token only blocks <em>new</em> loans; existing commitments and balances are untouched. Rebasing and
										fee-on-transfer tokens are unsupported by design because settlement relies on exact balance deltas.
									</Finding>
									<Finding sev="low" title="Committed total can drift from real balances">
										If a provider moves funds out of their wallet, <Mono>totalCommitted</Mono> can overstate availability. No funds are
										at risk (pulls re-check the real balance at loan time); the UI reads <Mono>getActualAvailableLiquidity()</Mono> for
										an accurate figure.
									</Finding>
								</div>
							</div>

							<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
								<strong>Tested:</strong> the live v2.1 router has 57 passing tests covering reentrancy, failed-repayment reverts,
								max-borrow guards, overflow on unlimited commitments, and the dual-control flows. The 21 <em>pending</em> tests are
								a skipped suite for an experimental contract (<Mono>FlashBankRevolutionary</Mono>) that is <strong>not deployed</strong> —
								they are not a gap in the live router. We are honest that v2.1 has known centralisation trade-offs (below).
								<br /><br />
								<strong>Live &amp; verified on every chain — v3:</strong> a hardened router that caps the owner&apos;s cut at
								20% of the fee, removes every single-signature path, adds a 2-day timelock on config/rescue, fixes an expired-commitment
								drift bug, and lets borrowers pin a <Mono>maxFee</Mono> on-chain. It adds 27 dedicated tests (84 passing in the suite),
								was integration-tested on-chain (flash loan, the <Mono>maxFee</Mono> pin, and reconcile), and is now deployed and verified on
								Ethereum, Base, Arbitrum and Sepolia. The live site now runs v3 on every chain — v2.1 held zero committed
								liquidity (verified on-chain), so the cutover needed no provider migration. See the
								<a href={`${GITHUB}/blob/master/docs/design/ROUTER_IMPROVEMENTS.md`} target="_blank" rel="noopener noreferrer" className="underline"> improvement plan</a> and
								<a href={`${GITHUB}/blob/master/docs/deployment/V3_DEPLOYMENT.md`} target="_blank" rel="noopener noreferrer" className="underline"> deployment runbook</a>.
								Deeper analysis lives on the <Link href="/security" className="underline">security deep-dive</Link>.
							</div>
						</div>
					</section>

					{/* ----- P2P LOANS ----- */}
					<section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
						<div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6">
							<div className="flex items-center gap-2 mb-1"><Coins className="h-6 w-6" /><h2 className="text-2xl font-bold">P2P term loans</h2></div>
							<p className="text-emerald-50 text-sm max-w-3xl">
								<Mono>FlashBankP2PLoan</Mono> is a neutral escrow for fixed-term, collateral-backed loans between two people. One side
								posts terms, the other takes them. Repay <Mono>principal + a flat fee</Mono> before the deadline to redeem the
								collateral; miss it and the lender claims it. No pools, no shared liquidity, no oracle.
							</p>
						</div>

						<div className="p-6 space-y-6">
							<div>
								<h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" /> Custody &amp; settlement</h3>
								<p className="text-sm text-gray-600 leading-relaxed">
									The contract holds the escrowed side only between creation and settlement. Default is decided purely by the clock:
									after <Mono>maturity + grace</Mono>, an unpaid loan can be claimed. Optionally, an <strong>agreed rate</strong>
									(<Mono>settlementValue</Mono>, frozen at origination) returns any over-pledged surplus to the borrower on default —
									still without ever reading a price.
								</p>
							</div>

							<div>
								<h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-gray-400" /> Trust assumptions &amp; findings</h3>
								<div className="rounded-xl border border-gray-200 px-4">
									<Finding sev="good" title="The owner cannot touch escrowed funds">
										There is no rescue, no admin pull and no upgrade proxy. The owner can only set the optional interface fee
										(hard-capped at 1%) and where it is sent. Escrowed principal and collateral can leave only via the loan&apos;s own
										repay / claim / cancel paths. A conservation <Mono>assert</Mono> backs the disbursement maths, and it is fuzz-tested.
									</Finding>
									<Finding sev="trust" title="You must vet the counterparty's tokens">
										Either side picks the principal and collateral tokens. A malicious offer could name a honeypot or rug token.
										The contract cannot know a token is &ldquo;real&rdquo; — always check both token addresses before you take an offer.
									</Finding>
									<Finding sev="design" title="No early liquidation — the lender carries price risk">
										Because nothing is priced on-chain, a lender cannot act early if collateral falls in value mid-term; they wait for
										the deadline. That is the deliberate cost of having no oracle. Lenders should size the fee and (optional) agreed
										rate accordingly.
									</Finding>
									<Finding sev="design" title="The agreed rate is a handshake, not a market price">
										<Mono>settlementValue</Mono> is whatever the two parties agree and is frozen forever. Set it high and a defaulting
										borrower keeps more surplus (the lender can under-recover); leave it at <Mono>0</Mono> and the lender keeps the whole
										pledge (the borrower can lose more than they borrowed). Both outcomes are intended and shown up front.
									</Finding>
									<Finding sev="good" title="Offers are editable in place; the featured boost is non-refundable on cancel">
										You can re-price or amend an open offer&apos;s non-escrow terms with <Mono>updateOffer</Mono> (the agreed rate, flat fee,
										duration, grace and service fee) and top up placement with <Mono>boostOffer</Mono> — both keep your existing featured
										spend. Each edit bumps a <Mono>version</Mono>, and <Mono>takeChecked</Mono> pins it so a taker can&apos;t be front-run by a
										last-second re-price. Cancelling still refunds the escrow and listing fee but <em>not</em> the featured <Mono>boost</Mono>
										(an advertising spend) — which is exactly why in-place editing exists.
									</Finding>
									<Finding sev="design" title="All-or-nothing repayment; no fee-on-transfer tokens">
										There is no partial repayment — you redeem the whole collateral or none of it. As with the router, rebasing and
										fee-on-transfer tokens are rejected because terms are enforced to the exact unit.
									</Finding>
								</div>
							</div>

							<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
								<strong>Tested:</strong> 45 passing tests covering the full lifecycle (create/take/repay/default/cancel), the optional
								surplus split (including rounding in the borrower&apos;s favour), in-place offer amendments with the version-pinned
								take (so a re-price can&apos;t be front-run), a live re-entrancy attack via a malicious token, fee
								edge cases, and a conservation fuzz test. See how the mechanics work on{' '}
								<Link href="/p2p" className="underline">the loans page</Link> and{' '}
								<Link href="/lorrow" className="underline">Lorrow compatibility</Link>.
							</div>
						</div>
					</section>

					{/* Shared / disclosure */}
					<section className="grid md:grid-cols-2 gap-4">
						<div className="bg-white rounded-2xl border border-gray-200 p-5">
							<h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-2"><FlaskConical className="h-4 w-4 text-gray-400" /> What &ldquo;tested&rdquo; means here</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								Tests are automated checks <em>we</em> wrote. They catch the bugs we thought of — not the ones we didn&apos;t. They are
								not a guarantee of correctness, and they are not an audit. Treat a green suite as necessary, never sufficient.
							</p>
						</div>
						<div className="bg-white rounded-2xl border border-gray-200 p-5">
							<h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-2"><ShieldCheck className="h-4 w-4 text-gray-400" /> Responsible disclosure</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								Found something we missed? Please tell us before telling the world. Open a{' '}
								<a href={`${GITHUB}/security/advisories/new`} target="_blank" rel="noopener noreferrer" className="underline">private security advisory</a>{' '}
								or an <a href={`${GITHUB}/issues`} target="_blank" rel="noopener noreferrer" className="underline">issue</a> on GitHub. We read the code with you.
							</p>
						</div>
					</section>

					{/* Resources */}
					<div className="bg-white rounded-2xl border border-gray-200 p-5">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">Read the source</h3>
						<div className="grid sm:grid-cols-3 gap-3 text-sm">
							<a href={`${GITHUB}/blob/master/loans/contracts/FlashBankP2PLoan.sol`} target="_blank" rel="noopener noreferrer" className="block p-3 border border-gray-200 rounded-xl hover:border-emerald-300">
								<div className="font-semibold text-gray-900 flex items-center gap-1.5"><Coins className="h-4 w-4 text-emerald-600" /> P2P loan contract <ExternalLink className="h-3 w-3 text-gray-400" /></div>
								<div className="text-gray-500 text-xs mt-0.5">FlashBankP2PLoan.sol + tests</div>
							</a>
							<a href={`${GITHUB}/blob/master/flashloans/contracts/FlashBankRouter.sol`} target="_blank" rel="noopener noreferrer" className="block p-3 border border-gray-200 rounded-xl hover:border-blue-300">
								<div className="font-semibold text-gray-900 flex items-center gap-1.5"><Zap className="h-4 w-4 text-blue-600" /> Router contract <ExternalLink className="h-3 w-3 text-gray-400" /></div>
								<div className="text-gray-500 text-xs mt-0.5">FlashBankRouter.sol + tests</div>
							</a>
							<Link href="/security" className="block p-3 border border-gray-200 rounded-xl hover:border-blue-300">
								<div className="font-semibold text-gray-900 flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-blue-600" /> Router deep-dive</div>
								<div className="text-gray-500 text-xs mt-0.5">Reentrancy &amp; dual-control detail</div>
							</Link>
						</div>
					</div>
				</main>

				<SiteFooter />
			</div>
		</>
	);
}
