import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, Scale, Clock, FileText, CheckCircle2, GitCompareArrows } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';
import CollateralSplitDiagram from '../components/CollateralSplitDiagram';

// Standalone, content-only page (no wallet wiring) presenting how FlashBank P2P relates to the
// Lorrow Framework Specification. The tables mirror docs/design/LORROW_COMPATIBILITY.md — keep the
// two in step when either changes.

const LORROW_SPEC = 'https://whysideas.github.io/lorrow/';
const REPO = 'https://github.com/Rotwang9000/flashbank-net';
const DOC_URL = `${REPO}/blob/master/docs/design/LORROW_COMPATIBILITY.md`;
const CONTRACT_SRC = `${REPO}/blob/master/loans/contracts/FlashBankP2PLoan.sol`;

type AlignRow = { principle: string; flashbank: string; full: boolean };
const ALIGN: AlignRow[] = [
	{ principle: 'Bilateral agreement, no pools, no protocol-set rate', flashbank: 'creator ↔ taker; the contract is pure escrow', full: true },
	{ principle: 'Immutable terms once created', flashbank: 'no function mutates an active loan; admin cannot touch live loans', full: true },
	{ principle: 'Escrow model (locked posts)', flashbank: 'principal/collateral is always escrowed on createLoan — the strongest "locked post"', full: true },
	{ principle: 'Cancel returns escrow; posts can expire', flashbank: 'cancel() refunds escrow; offerExpiry times out open offers', full: true },
	{ principle: 'Optional protocol fee, bounded, disclosed up front', flashbank: 'protocolFeeBps capped at 100 bps — exactly Lorrow\u2019s "Optional Fee Hook \u2264 100 bps"', full: true },
	{ principle: 'Frontend independence', flashbank: 'the contract is usable directly; the website is just one interface', full: true },
	{ principle: 'Transparent commitment signal', flashbank: 'a paid boost ranks offers rather than an on-chain Commitment Score (same goal, different mechanism)', full: false }
];

type DifferRow = { lorrow: string; flashbank: string; why: string; honoured?: boolean };
const DIFFER: DifferRow[] = [
	{
		lorrow: 'breach_threshold \u2265 110%, oracle-priced, with reportBreach / checkRecovery and a breach window',
		flashbank: 'None. No oracle, no breach state.',
		why: 'Core intent #1. Oracles are the main attack surface in collateralized lending; time-only settlement removes them entirely.'
	},
	{
		lorrow: 'interest_rate, 0\u201336% APR',
		flashbank: 'Flat repaymentFee',
		why: 'Core intent #2. A fixed fee, not a rate. (A small flat fee on a short term can annualise well above 36%.)'
	},
	{
		lorrow: 'Surplus Return at default (mandatory guardrail)',
		flashbank: 'Now honoured via an opt-in settlementValue (Option B). Set it and claimDefault returns the surplus to the borrower; leave it 0 and the lender takes the whole collateral (the original pledge/pawn).',
		why: 'Surplus needs a valuation. Rather than a live oracle we use a value agreed at origination and frozen — satisfying the guardrail while keeping intent #1 (no oracle).',
		honoured: true
	},
	{
		lorrow: 'loan_term from a fixed set (14d/30d/60d/90d/12m/18m)',
		flashbank: 'Arbitrary duration (seconds, \u2264 365d)',
		why: 'We let the two parties pick any term.'
	},
	{
		lorrow: 'repayment_structure \u2208 {LUMP, INSTALLMENT, BALLOON}',
		flashbank: 'LUMP only (principal + fee at maturity)',
		why: 'Simplicity; matches the flat-fee model.'
	},
	{
		lorrow: 'Standardized variable set, no custom fields',
		flashbank: 'Adds allowedTaker, listed, boost, serviceFee',
		why: 'Private offers and an opt-in marketplace / fee model.'
	}
];

const VARIABLES: [string, string, string][] = [
	['loan_asset / loan_amount', 'principalToken / principal', 'same'],
	['collateral_asset / collateral_amount', 'collateralToken / collateral', 'same'],
	['breach_threshold', '\u2014', 'no oracle'],
	['loan_term', 'duration (seconds)', 'not the fixed enum'],
	['interest_rate', 'repaymentFee (flat)', 'not an APR'],
	['repayment_structure', '(implicit LUMP)', ''],
	['early_repayment_allowed', 'effectively always true', 'repay any time before the deadline'],
	['early_repayment_penalty', '0', 'within Lorrow\u2019s 0\u20135% (we charge none)'],
	['capital_locked / collateral_locked', 'always true', 'escrowed at posting']
];

const LIFECYCLE: [string, string, string][] = [
	['POSTED', 'Open', ''],
	['ACTIVE', 'Active', ''],
	['BREACHED', '\u2014', 'no oracle / breach'],
	['DEFAULTED', 'Defaulted', 'surplus returned when settlementValue set; full forfeit when 0'],
	['COMPLETED', 'Repaid', ''],
	['EXPIRED', 'Cancelled (+ offerExpiry)', '']
];

const FUNCTIONS: [string, string, string][] = [
	['postOffer / postRequest', 'createLoan(creatorIsLender)', 'one entry point, both sides'],
	['acceptOffer / acceptRequest', 'take(id)', ''],
	['repay', 'repay(id)', 'full repayment (LUMP)'],
	['reportBreach / checkRecovery', '\u2014', 'no oracle'],
	['executeDefault', 'claimDefault(id)', 'time-based only (Lorrow\u2019s maturity path, not the breach path)'],
	['cancelPost', 'cancel(id)', '']
];

const PROFILE: [string, string][] = [
	['Protocol name / version', 'FlashBank P2P Term Loans v1'],
	['Chain / VM', 'EVM (Ethereum, L2s); playground on Sepolia'],
	['Supported loan assets', 'Any ERC-20 (no fee-on-transfer / rebasing); WETH/USDC etc. on mainnet, faucet tokens on testnet'],
	['Supported collateral assets', 'Any ERC-20 (must differ from, or may equal, the loan asset)'],
	['Collateral ratio range', 'Not enforced — set by the parties; no on-chain ratio check'],
	['Interest rate range', 'None — a flat repaymentFee instead of an APR'],
	['Oracle provider', 'None — settlement is time-only'],
	['Default settlement method', 'Time-based: after maturity + grace the lender calls claimDefault. With a per-offer settlementValue set, surplus is returned to the borrower (guardrail honoured, no oracle); with 0, the lender claims the full collateral'],
	['Liquidation method', 'None — no liquidations, only deadline-based default'],
	['Maturity grace period', 'Configurable gracePeriod (\u2264 90 days; no Core 3-day minimum enforced)'],
	['Commitment signal', 'Paid boost ranking (not Lorrow\u2019s Commitment Score)'],
	['Fee model', 'Optional protocolFeeBps \u2264 100 bps (Core-compatible hook); optional serviceFee; optional boost. All default-off and disclosed before acceptance.'],
	['Upgradeability / admin', 'Ownable; admin sets only fee recipient/bps; cannot alter live loans'],
	['Compliance / KYC', 'None'],
	['Keeper model', 'Permissionless: claimDefault callable by the lender once the deadline passes'],
	['Frontend / operator', 'flashbank.net is one interface; the contract is usable directly']
];

const VARIANT_FIELDS = new Set([
	'Collateral ratio range', 'Interest rate range', 'Oracle provider', 'Default settlement method',
	'Maturity grace period', 'Commitment signal'
]);

function Mono({ children }: { children: React.ReactNode }) {
	return <span className="font-mono text-[0.85em] text-gray-800">{children}</span>;
}

function MappingTable({ title, rows }: { title: string; rows: [string, string, string][] }) {
	return (
		<div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
			<div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-800">{title}</div>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
							<th className="px-4 py-2 font-medium">Lorrow</th>
							<th className="px-4 py-2 font-medium">FlashBank</th>
							<th className="px-4 py-2 font-medium">Note</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(([a, b, c], i) => (
							<tr key={i} className="border-b border-gray-50 last:border-0 align-top">
								<td className="px-4 py-2"><Mono>{a}</Mono></td>
								<td className="px-4 py-2"><Mono>{b}</Mono></td>
								<td className="px-4 py-2 text-gray-500 text-[13px]">{c}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default function LorrowCompatibility() {
	return (
		<>
			<Head>
				<title>Lorrow compatibility — FlashBank P2P</title>
				<meta name="description" content="How FlashBank's peer-to-peer term loans relate to the Lorrow Framework Specification: where we align, where we deliberately differ, and how we honour the surplus-return guardrail without an oracle." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40">
				<main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
					{/* Header */}
					<div>
						<Link href="/flashbank-loan" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
							<ArrowLeft className="h-4 w-4" /> Back to P2P Loans
						</Link>
						<div className="flex items-start gap-4">
							<div className="hidden sm:flex h-12 w-12 rounded-xl bg-emerald-600 text-white items-center justify-center shadow-sm shrink-0">
								<GitCompareArrows className="h-6 w-6" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">FlashBank P2P × Lorrow</h1>
								<p className="text-gray-600 mt-2 max-w-3xl">
									How our peer-to-peer term loans relate to the{' '}
									<a href={LORROW_SPEC} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline inline-flex items-center gap-0.5">
										Lorrow Framework Specification v1.0 <ExternalLink className="h-3 w-3" />
									</a>{' '}
									— a standard for bilateral collateralized lending originated by WHYSIDEAS — without losing our two core intents.
								</p>
							</div>
						</div>
					</div>

					{/* Core intents */}
					<div className="grid sm:grid-cols-2 gap-4">
						<div className="bg-white rounded-xl border border-gray-200 p-5">
							<div className="flex items-center gap-2 text-gray-900 font-semibold mb-1"><Clock className="h-5 w-5 text-emerald-600" /> Time-only settlement</div>
							<p className="text-sm text-gray-600">A loan defaults purely because a deadline passed, never because a price moved. There is no oracle anywhere in the contract.</p>
						</div>
						<div className="bg-white rounded-xl border border-gray-200 p-5">
							<div className="flex items-center gap-2 text-gray-900 font-semibold mb-1"><Scale className="h-5 w-5 text-emerald-600" /> A flat fee, not interest</div>
							<p className="text-sm text-gray-600">The borrower&apos;s whole cost is one fixed <Mono>repaymentFee</Mono>, not a time-accruing rate (friendlier to faith-based finance that avoids <em>riba</em>).</p>
						</div>
					</div>

					{/* Option B banner */}
					<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
						<div className="flex items-center gap-2 text-emerald-900 font-semibold mb-1">
							<CheckCircle2 className="h-5 w-5 text-emerald-600" /> Surplus-return guardrail — now honoured, with no oracle
						</div>
						<p className="text-sm text-emerald-900/90">
							Lorrow Core flags seizing a defaulter&apos;s surplus collateral as &ldquo;the single most predatory move in collateralized lending.&rdquo;
							Each offer can now carry an optional <Mono>settlementValue</Mono> — the agreed worth of the whole collateral in loan-asset terms,
							frozen at origination. On default the lender keeps only the collateral covering <Mono>principal + repaymentFee</Mono>; the surplus
							returns to the borrower. Left at <Mono>0</Mono>, the original full-forfeit pledge still applies. No live price is ever read.
						</p>
					</div>

					{/* What the split looks like */}
					<section>
						<h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2"><GitCompareArrows className="h-5 w-5 text-emerald-600" /> What the split looks like</h2>
						<p className="text-sm text-gray-600 mb-3 max-w-3xl">
							Because the <Mono>settlementValue</Mono> is frozen at origination, the default outcome is fully determined on day one —
							no price discovery, no keepers. The lender is made whole at the agreed value and the over-pledged remainder returns to the borrower.
						</p>
						<CollateralSplitDiagram />
					</section>

					{/* Align */}
					<section>
						<h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /> Where we already align</h2>
						<div className="border border-gray-200 rounded-xl overflow-hidden bg-white overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
										<th className="px-4 py-2 font-medium">Lorrow principle</th>
										<th className="px-4 py-2 font-medium">FlashBank P2P</th>
									</tr>
								</thead>
								<tbody>
									{ALIGN.map((r, i) => (
										<tr key={i} className="border-b border-gray-50 last:border-0 align-top">
											<td className="px-4 py-2.5 text-gray-700">{r.principle}</td>
											<td className="px-4 py-2.5 text-gray-600">
												<span className={`mr-1.5 ${r.full ? 'text-emerald-600' : 'text-amber-500'}`}>{r.full ? '\u2713' : '\u25d0'}</span>
												{r.flashbank}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>

					{/* Differ */}
					<section>
						<h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><GitCompareArrows className="h-5 w-5 text-emerald-600" /> Where we deliberately differ (and why)</h2>
						<div className="border border-gray-200 rounded-xl overflow-hidden bg-white overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
										<th className="px-4 py-2 font-medium">Lorrow Core requirement</th>
										<th className="px-4 py-2 font-medium">FlashBank P2P</th>
										<th className="px-4 py-2 font-medium">Why</th>
									</tr>
								</thead>
								<tbody>
									{DIFFER.map((r, i) => (
										<tr key={i} className={`border-b border-gray-50 last:border-0 align-top ${r.honoured ? 'bg-emerald-50/40' : ''}`}>
											<td className="px-4 py-2.5 text-gray-700">{r.lorrow}</td>
											<td className="px-4 py-2.5 text-gray-600">
												{r.honoured && <span className="text-emerald-600 mr-1.5">{'\u2713'}</span>}
												{r.flashbank}
											</td>
											<td className="px-4 py-2.5 text-gray-500 text-[13px]">{r.why}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p className="text-xs text-gray-500 mt-2">
							Note on the interest ceiling: a <Mono>repaymentFee</Mono> of 5 on a principal of 100 over 7 days annualises to roughly 260% APR —
							far above Lorrow&apos;s 36% cap. A flat fee that feels reasonable is simply not expressible as a compliant rate on short terms.
						</p>
					</section>

					{/* Mapping */}
					<section>
						<h2 className="text-xl font-bold text-gray-900 mb-3">Variable, lifecycle &amp; function mapping</h2>
						<div className="space-y-4">
							<MappingTable title="Loan variables" rows={VARIABLES} />
							<MappingTable title="Lifecycle" rows={LIFECYCLE} />
							<MappingTable title="Functions / events" rows={FUNCTIONS} />
						</div>
					</section>

					{/* Implementation profile */}
					<section>
						<h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-600" /> Implementation Profile</h2>
						<p className="text-sm text-gray-500 mb-3">Published so the claim is verifiable. Rows tagged <span className="text-amber-600 font-medium">variant</span> sit outside Core&apos;s accommodation.</p>
						<div className="border border-gray-200 rounded-xl overflow-hidden bg-white overflow-x-auto">
							<table className="w-full text-sm">
								<tbody>
									{PROFILE.map(([field, value], i) => (
										<tr key={i} className="border-b border-gray-50 last:border-0 align-top">
											<td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">
												{field}
												{VARIANT_FIELDS.has(field) && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 py-0.5">variant</span>}
											</td>
											<td className="px-4 py-2.5 text-gray-600">{value}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>

					{/* Links */}
					<div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
						<p className="text-sm text-gray-600">Full write-up (options A/B/C, the maths and the recommendation) lives in the repo.</p>
						<div className="flex flex-wrap gap-2">
							<a href={DOC_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium">
								Read the full assessment <ExternalLink className="h-3.5 w-3.5" />
							</a>
							<a href={CONTRACT_SRC} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
								Contract source <ExternalLink className="h-3.5 w-3.5" />
							</a>
						</div>
					</div>
				</main>

				<SiteFooter />
			</div>
		</>
	);
}
