import React from 'react';
import {
	FileSignature, ArrowLeftRight, Users, CheckCircle2, ShieldAlert, ArrowRight, ArrowDown,
	Coins, Rocket, ShieldCheck, FlaskConical, Code2, FileCheck2, AlertTriangle, ExternalLink,
	Scale, Ban, Timer
} from 'lucide-react';

// Standalone, presentational "How it works" panel: the lifecycle, the timeline, the fee model
// and the transparency "proofs". Everything it needs is passed in (no module-level state), so it
// stays a pure view that re-themes per network.
export type HowItWorksProps = {
	explorer: string;
	contractAddress: string;
	isPlayground: boolean;
	protocolBps: number;
	interfaceFeePct: number;
};

export default function HowItWorks({ explorer, contractAddress, isPlayground, protocolBps, interfaceFeePct }: HowItWorksProps) {
	const codeLink = contractAddress ? `${explorer}/address/${contractAddress}#code` : '';
	return (
		<div className="space-y-8">
			{/* Lifecycle */}
			<section>
				<Heading eyebrow="Step by step" title="What happens when you flashbank a loan" />
				<div className="flex flex-col lg:flex-row items-stretch gap-3">
					<Step n={1} icon={<FileSignature className="h-5 w-5" />} title="Post the terms"
						body="One side sets the amount, the collateral, a single flat fee and the term, then signs. Their side is escrowed on the spot." />
					<Connector />
					<Step n={2} icon={<ArrowLeftRight className="h-5 w-5" />} title="Someone takes it"
						body="The counterparty accepts. The escrow pulls their side and releases the borrowed asset to the borrower. The clock starts." />
					<Connector />
					<div className="flex flex-col gap-3 flex-1">
						<Outcome tone="good" icon={<CheckCircle2 className="h-5 w-5" />} title="Repaid in time"
							body="Borrower repays principal + the flat fee before the deadline. They get their collateral back; the lender keeps the fee." />
						<Outcome tone="bad" icon={<ShieldAlert className="h-5 w-5" />} title="Deadline missed"
							body="If the window closes unpaid, the lender claims the collateral. No price is read — the only trigger is the clock." />
					</div>
				</div>
			</section>

			{/* Timeline */}
			<section>
				<Heading eyebrow="No oracle, just a clock" title="The only thing being watched is time" />
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
					<div className="flex h-11 rounded-lg overflow-hidden text-[11px] sm:text-xs font-semibold text-white">
						<div className="bg-emerald-500 flex items-center justify-center px-2" style={{ flex: 7 }}>Repay window — collateral redeemable</div>
						<div className="bg-amber-500 flex items-center justify-center px-2" style={{ flex: 2 }}>Grace</div>
						<div className="bg-red-500 flex items-center justify-center px-2 whitespace-nowrap" style={{ flex: 3 }}>Lender can claim →</div>
					</div>
					<div className="mt-2 flex justify-between text-[11px] text-gray-400">
						<Marker dot="bg-emerald-500" label="Start (taken)" />
						<Marker dot="bg-amber-500" label="Maturity" />
						<Marker dot="bg-red-500" label="Default deadline" align="right" />
					</div>
					<p className="text-xs text-gray-500 mt-4">
						Settlement is purely time-based: <code className="text-gray-600">defaultDeadline = start + term + grace</code>. Because nothing
						is priced on-chain, there are no liquidations to watch, no oracle to trust and no keeper bots. A flat fee — not
						time-accruing interest — keeps it simple and avoids riba.
					</p>
				</div>
			</section>

			{/* The model */}
			<section>
				<Heading eyebrow="The model in three rules" title="Why it stays simple and neutral" />
				<div className="grid sm:grid-cols-3 gap-4">
					<Principle icon={<Scale className="h-5 w-5" />} title="Flat fee, not interest"
						body="The borrower's cost is one fixed fee agreed up front — no accrual, no compounding. Friendlier to plan around (and to faiths that forbid interest)." />
					<Principle icon={<Timer className="h-5 w-5" />} title="Time-based settlement"
						body="Outcomes hinge on a deadline, never on a price feed. The contract reads only block.timestamp." />
					<Principle icon={<ShieldCheck className="h-5 w-5" />} title="Neutral escrow"
						body="It's strictly peer-to-peer. The contract holds collateral and moves funds on agreed rules — it never takes custody as a lender." />
				</div>
			</section>

			{/* Fees */}
			<section>
				<Heading eyebrow="What it costs" title="Fees: clear, optional, and mostly zero" />
				<div className="grid sm:grid-cols-3 gap-4">
					<Fee icon={<Coins className="h-5 w-5 text-emerald-600" />} title="Interface fee"
						highlight={`${protocolBps / 100}% ${protocolBps === 0 ? '· introductory' : ''}`}
						body={<>Charged for posting <em>through flashbank</em>. We&apos;re waiving it for now (normally ~{interfaceFeePct}%). Call the verified contract directly with <code>listed=false</code> and you pay nothing at all.</>} />
					<Fee icon={<Rocket className="h-5 w-5 text-amber-600" />} title="Featured boost" tone="amber"
						highlight="you choose"
						body={<>A one-off, optional spend to climb the Browse ranking — pay more, rank higher. It&apos;s an advert, not interest, so it isn&apos;t refunded if you cancel.</>} />
					<Fee icon={<Users className="h-5 w-5 text-indigo-600" />} title="Service fee"
						highlight="optional"
						body={<>Route a flat cut to any third party — an insurer, an introducer — taken from the borrower&apos;s disbursement. Default off.</>} />
				</div>
			</section>

			{/* Proofs */}
			<section>
				<Heading eyebrow="Don't trust, verify" title="Proofs &amp; transparency" />
				<div className="grid sm:grid-cols-2 gap-4">
					<Proof icon={<FileCheck2 className="h-5 w-5" />} title="Verified source &amp; ABI on Etherscan"
						body="The exact bytecode running on-chain is published and verified. Read every line and the ABI yourself."
						href={codeLink} cta="View verified contract" />
					<Proof icon={<FlaskConical className="h-5 w-5" />} title="32 automated tests"
						body="Including a live re-entrancy attack (caught by the guard), same-token edge cases, exact-deadline timing, and a randomised fund-conservation fuzz over 30 loans." />
					<Proof icon={<Code2 className="h-5 w-5" />} title="Open source, by design"
						body="The repository is public and the fee is set in the open. Nothing is hidden behind a closed back-end; what you see is what runs." />
					<Proof icon={<ShieldCheck className="h-5 w-5" />} title="Conservation invariant"
						body="Every settled loan leaves the escrow holding exactly zero — no dust, no trapped funds. It's asserted in the contract and checked by the fuzz."
						href="/security" cta="Security notes" internal />
				</div>
			</section>

			{/* Honest caveats */}
			<section>
				<div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
					<div className="flex items-center gap-2 mb-3 text-amber-800">
						<AlertTriangle className="h-5 w-5" />
						<h3 className="text-sm font-semibold">Be clear-eyed about the trade-offs</h3>
					</div>
					<ul className="grid sm:grid-cols-3 gap-3 text-xs text-amber-900/90">
						<Caveat icon={<Scale className="h-4 w-4" />} text="No margin calls. Collateral value can drift during the term, so lenders should over-collateralise to taste." />
						<Caveat icon={<Ban className="h-4 w-4" />} text="No price oracle means no early liquidation — that's the point, but it's a deliberate trade-off." />
						<Caveat icon={<Code2 className="h-4 w-4" />} text="Smart-contract and token risk always apply. Fee-on-transfer / rebasing tokens are unsupported." />
					</ul>
					{isPlayground && (
						<p className="text-xs text-amber-900 mt-3 pt-3 border-t border-amber-200">
							You&apos;re on the <strong>Sepolia playground</strong>: tokens are free, mintable play-money with <strong>no real value</strong>. Never send real assets here.
						</p>
					)}
				</div>
			</section>
		</div>
	);
}

/* ---------------- pieces ---------------- */

function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
	return (
		<div className="mb-4">
			<p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{eyebrow}</p>
			<h2 className="text-xl font-bold text-gray-900">{title}</h2>
		</div>
	);
}

function Step({ n, icon, title, body }: { n: number; icon: React.ReactNode; title: string; body: string }) {
	return (
		<div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
			<div className="flex items-center gap-2 mb-2">
				<span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700">{icon}</span>
				<span className="text-xs font-bold text-gray-300">STEP {n}</span>
			</div>
			<h3 className="text-sm font-semibold text-gray-900">{title}</h3>
			<p className="text-xs text-gray-500 mt-1 leading-relaxed">{body}</p>
		</div>
	);
}

function Connector() {
	return (
		<div className="flex items-center justify-center text-gray-300">
			<ArrowRight className="hidden lg:block h-5 w-5" />
			<ArrowDown className="lg:hidden h-5 w-5" />
		</div>
	);
}

function Outcome({ tone, icon, title, body }: { tone: 'good' | 'bad'; icon: React.ReactNode; title: string; body: string }) {
	const cls = tone === 'good'
		? { border: 'border-emerald-200', bg: 'bg-emerald-50', chip: 'bg-emerald-100 text-emerald-700' }
		: { border: 'border-red-200', bg: 'bg-red-50', chip: 'bg-red-100 text-red-700' };
	return (
		<div className={`flex-1 rounded-2xl border ${cls.border} ${cls.bg} p-4`}>
			<div className="flex items-center gap-2 mb-1">
				<span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${cls.chip}`}>{icon}</span>
				<h3 className="text-sm font-semibold text-gray-900">{title}</h3>
			</div>
			<p className="text-xs text-gray-600 mt-1 leading-relaxed">{body}</p>
		</div>
	);
}

function Marker({ dot, label, align }: { dot: string; label: string; align?: 'right' }) {
	return (
		<span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
			<span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
		</span>
	);
}

function Principle({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
			<span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 mb-2">{icon}</span>
			<h3 className="text-sm font-semibold text-gray-900">{title}</h3>
			<p className="text-xs text-gray-500 mt-1 leading-relaxed">{body}</p>
		</div>
	);
}

function Fee({ icon, title, highlight, body, tone }: { icon: React.ReactNode; title: string; highlight: string; body: React.ReactNode; tone?: 'amber' }) {
	return (
		<div className={`rounded-2xl border shadow-sm p-4 ${tone === 'amber' ? 'border-amber-200 bg-amber-50/40' : 'border-gray-200 bg-white'}`}>
			<div className="flex items-center justify-between gap-2 mb-1">
				<span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">{icon}{title}</span>
			</div>
			<p className="text-lg font-bold text-gray-900">{highlight}</p>
			<p className="text-xs text-gray-500 mt-1 leading-relaxed [&_code]:text-gray-600 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded">{body}</p>
		</div>
	);
}

function Proof({ icon, title, body, href, cta, internal }: { icon: React.ReactNode; title: string; body: string; href?: string; cta?: string; internal?: boolean }) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col">
			<div className="flex items-center gap-2 mb-1">
				<span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-600">{icon}</span>
				<h3 className="text-sm font-semibold text-gray-900">{title}</h3>
			</div>
			<p className="text-xs text-gray-500 mt-1 leading-relaxed flex-1">{body}</p>
			{href && cta && (
				<a href={href} target={internal ? undefined : '_blank'} rel={internal ? undefined : 'noopener noreferrer'}
					className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900">
					{cta} <ExternalLink className="h-3.5 w-3.5" />
				</a>
			)}
		</div>
	);
}

function Caveat({ icon, text }: { icon: React.ReactNode; text: string }) {
	return (
		<li className="flex items-start gap-2">
			<span className="mt-0.5 text-amber-600">{icon}</span>
			<span>{text}</span>
		</li>
	);
}
