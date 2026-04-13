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
            Provide WETH liquidity for flash loans while keeping funds in your wallet. You control your limits and can pause or resume anytime.
          </p>

          <div className="space-y-8 max-w-4xl">
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">1) Wrap ETH → WETH</h2>
              <p className="text-blue-800 text-sm">
                The router works with WETH (Wrapped Ether). Use the dashboard to wrap some ETH to WETH, or use existing WETH you already hold. Your WETH stays in your wallet at all times.
              </p>
            </section>

            <section className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-3">2) Approve the Router</h2>
              <p className="text-green-800 text-sm">
                Approve the FlashBankRouter to temporarily access your WETH during flash loan execution. This is a one-time approval. The router only pulls WETH during an active loan and returns it immediately with your fee share.
              </p>
            </section>

            <section className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-900 mb-3">3) Set Your Commitment</h2>
              <p className="text-orange-800 text-sm">
                Choose a maximum WETH amount the router can use, or select Unlimited for hands-off participation. You can pause, resume, or change limits at any time with instant effect.
              </p>
            </section>

            <section className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-3">4) Earn Fees</h2>
              <p className="text-purple-800 text-sm">
                Every time a borrower uses your WETH in a flash loan, you earn a share of the 0.02% fee. Fees are distributed proportionally among the providers whose liquidity was used.
              </p>
            </section>

            <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Notes</h2>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                <li>Your WETH never leaves your wallet — the router only has approval to pull during active loans (milliseconds).</li>
                <li>The protocol fee is 0.02% for borrowers; fees are shared among providers whose WETH was used.</li>
                <li>You can change limits, pause, or resume at any time — changes take effect immediately.</li>
                <li>There are no lock-up periods. Simply revoke approval or pause to stop participating.</li>
              </ul>
            </section>

            <div className="text-sm">
              <a href="/#guide" className="text-blue-700 underline">← Back to Dashboard</a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
