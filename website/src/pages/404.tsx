import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Zap, Coins, Home, FileSearch } from 'lucide-react';

// Custom 404 for the static export (GitHub Pages serves out/404.html automatically).
// Friendlier than the framework default and points lost visitors at the three places
// they most likely wanted.
export default function NotFound() {
	return (
		<>
			<Head>
				<title>Page not found — FlashBank</title>
				<meta name="robots" content="noindex" />
			</Head>
			<main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6">
				<div className="text-center max-w-md">
					<div className="mx-auto w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm mb-6">
						<Zap className="h-7 w-7 text-white" />
					</div>
					<h1 className="text-5xl font-bold text-gray-900 tracking-tight">404</h1>
					<p className="mt-3 text-gray-600">
						That page doesn&rsquo;t exist (or moved when the URLs were tidied up to <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">/flash</code> and <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">/p2p</code>).
					</p>
					<div className="mt-7 flex flex-wrap justify-center gap-2.5">
						<Link href="/" className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
							<Home className="h-4 w-4" /> Home
						</Link>
						<Link href="/flash" className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
							<Zap className="h-4 w-4" /> Flash loans
						</Link>
						<Link href="/p2p" className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
							<Coins className="h-4 w-4" /> P2P loans
						</Link>
						<Link href="/audit" className="inline-flex items-center gap-1.5 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:border-gray-400 transition-colors">
							<FileSearch className="h-4 w-4" /> Audit
						</Link>
					</div>
				</div>
			</main>
		</>
	);
}
