import React from 'react';
import Link from 'next/link';
import { Zap, Github, ArrowLeft } from 'lucide-react';

// Lightweight sticky header shared by the static, content-only pages (How it works, the scenario
// calculator, taxes, …). Page-specific behaviour is passed in rather than reached for, so the
// component stays self-contained and re-usable. A wallet is never needed on these pages.

const GITHUB = 'https://github.com/Rotwang9000/flashbank-net';

export default function ContentHeader({ back }: { back?: { href: string; label: string } }) {
	return (
		<header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
			<div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between max-w-5xl">
				<Link href="/flash" className="flex items-center gap-2.5">
					<div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm"><Zap className="h-5 w-5 text-white" /></div>
					<span className="text-lg font-bold text-gray-900 tracking-tight">Flash<span className="text-blue-600">Bank</span></span>
				</Link>
				<nav className="flex items-center gap-4 text-sm">
					<Link href="/flash" className="text-gray-500 hover:text-gray-900">Flash Loans</Link>
					<Link href="/p2p" className="text-gray-500 hover:text-gray-900">P2P Loans</Link>
					<Link href="/how-it-works" className="text-gray-500 hover:text-gray-900 hidden sm:inline">How it works</Link>
					<a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"><Github className="h-4 w-4" /></a>
				</nav>
			</div>
			{back && (
				<div className="container mx-auto px-4 sm:px-6 max-w-5xl">
					<Link href={back.href} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 py-2">
						<ArrowLeft className="h-4 w-4" /> {back.label}
					</Link>
				</div>
			)}
		</header>
	);
}
