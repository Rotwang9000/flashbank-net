import React from 'react';
import Head from 'next/head';

export default function LendGuide() {
  return (
    <>
      <Head>
        <title>Lender Guide — FlashBank.net</title>
        <meta name="description" content="How to provide liquidity on FlashBank: approve, limit, pause/resume, and claim profits." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Lender Guide</h1>
          <p className="text-gray-700 mb-8 max-w-3xl">
            Provide liquidity for flash loans while keeping your ETH in your wallet. You control your limits and can pause or resume anytime.
          </p>

          <div className="space-y-8 max-w-4xl">
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">1) Approve Access</h2>
              <p className="text-blue-800 text-sm">
                Approve FlashBank to temporarily use your ETH during flash loan execution. Your ETH remains in your wallet at all other times.
              </p>
            </section>

            <section className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-3">2) Set/Change Limit (Optional)</h2>
              <p className="text-green-800 text-sm">
                Choose a maximum amount that FlashBank can pull when your wallet is selected. Use 0 to pause; choose Unlimited for hands‑off participation.
              </p>
            </section>

            <section className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-900 mb-3">3) Pause/Resume</h2>
              <p className="text-orange-800 text-sm">
                Temporarily stop participation and later resume. Your previous preference (limit/unlimited) is preserved when resuming.
              </p>
            </section>

            <section className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-3">4) Claim Profits</h2>
              <p className="text-purple-800 text-sm">
                Withdraw your accumulated profits at any time. Optionally donate a percentage when claiming.
              </p>
            </section>

            <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Notes</h2>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                <li>Only ETH that is actually lent during a flash loan accrues profit for that event.</li>
                <li>The protocol fee is fixed at 0.02% for borrowers; profits are shared among lenders whose ETH was used.</li>
                <li>You can change limits or pause/resume at any time.</li>
              </ul>
            </section>

            <div className="text-sm">
              <a href="/#instructions" className="text-blue-700 underline">← Back to Instructions</a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
