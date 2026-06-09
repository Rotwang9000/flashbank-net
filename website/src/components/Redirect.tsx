import React, { useEffect } from 'react';
import Head from 'next/head';

// Client-side redirect stub. Next.js `redirects()` in next.config.js do NOT apply to a static
// `output: 'export'` build (the build warns about exactly this), so old URLs are kept alive with
// a tiny page that bounces both JS and no-JS visitors to the new canonical path. Used after the
// /flash + /p2p rename to preserve shared/bookmarked links to `/` and `/flashbank-loan`.
export default function Redirect({ to }: { to: string }) {
	useEffect(() => {
		window.location.replace(to);
	}, [to]);

	return (
		<>
			<Head>
				<meta httpEquiv="refresh" content={`0; url=${to}`} />
				<meta name="robots" content="noindex,follow" />
				<link rel="canonical" href={to} />
				<title>Redirecting…</title>
			</Head>
			<main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '4rem 1.5rem', textAlign: 'center', color: '#374151' }}>
				<p>
					This page has moved. <a href={to} style={{ color: '#2563eb', fontWeight: 600 }}>Continue&nbsp;&rarr;</a>
				</p>
			</main>
		</>
	);
}
