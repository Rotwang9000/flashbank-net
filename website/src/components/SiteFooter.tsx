import React from 'react';
import { Zap, Coins, ExternalLink } from 'lucide-react';

// Shared footer for the whole site. Kept product-agnostic so both the Router and the
// P2P Loans pages present the same clear set of destinations.

const GITHUB_URL = 'https://github.com/Rotwang9000/flashbank-net';

function Col({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<h4 className="font-semibold text-gray-900 mb-3 text-sm">{title}</h4>
			<ul className="space-y-2 text-sm">{children}</ul>
		</div>
	);
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
	return (
		<li>
			<a
				href={href}
				{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
				className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 transition-colors"
			>
				{children}
				{external && <ExternalLink className="h-3 w-3" />}
			</a>
		</li>
	);
}

export default function SiteFooter() {
	return (
		<footer className="bg-white border-t border-gray-200 py-10 mt-12">
			<div className="container mx-auto px-6 max-w-6xl">
				<div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
					<div className="sm:col-span-2 md:col-span-1">
						<div className="flex items-center gap-2.5 mb-3">
							<div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
								<Zap className="h-4 w-4 text-white" />
							</div>
							<span className="text-base font-bold text-gray-900">Flash<span className="text-blue-600">Bank</span></span>
						</div>
						<p className="text-sm text-gray-500">
							Two ways to move money on-chain without giving up custody — atomic flash loans and
							fixed-term peer-to-peer loans.
						</p>
					</div>

					<Col title="Products">
						<FooterLink href="/"><Zap className="h-3.5 w-3.5 text-blue-600" /> Flash Loans</FooterLink>
						<FooterLink href="/flashbank-loan"><Coins className="h-3.5 w-3.5 text-emerald-600" /> P2P Loans</FooterLink>
					</Col>

					<Col title="Resources">
						<FooterLink href="/guides/lend">Lender guide</FooterLink>
						<FooterLink href="/guides/borrow">Borrower guide</FooterLink>
						<FooterLink href="/security">Security</FooterLink>
						<FooterLink href="/lorrow">Lorrow compatibility</FooterLink>
						<FooterLink href="/gas-study">Gas study</FooterLink>
					</Col>

					<Col title="Project">
						<FooterLink href={GITHUB_URL} external>GitHub</FooterLink>
						<FooterLink href={`${GITHUB_URL}/tree/master/docs`} external>Documentation</FooterLink>
					</Col>
				</div>

				<div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 items-center justify-between text-sm text-gray-500">
					<p>No deposits, no custody, no nonsense.</p>
					<p className="text-xs">Unaudited software · use at your own risk · &ldquo;flashbank&rdquo; is a verb, not a bank.</p>
				</div>
			</div>
		</footer>
	);
}
