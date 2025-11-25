import React from 'react';
import Head from 'next/head';

export default function BorrowGuide() {
  return (
    <>
      <Head>
        <title>Borrower Guide — FlashBank.net</title>
        <meta name="description" content="How to borrow using FlashBank flash loans: interfaces, minimal examples, and tips." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Borrower Guide</h1>
          <p className="text-gray-700 mb-8 max-w-3xl">
            This guide shows how to take a flash loan from FlashBank for MEV and arbitrage strategies.
            You will deploy a small borrower contract that receives funds, executes your strategy, and repays <strong>amount + fee</strong> within the callback.
          </p>

          <div className="space-y-8 max-w-4xl">
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">Interface</h2>
              <p className="text-blue-800 text-sm mb-3">Your contract must implement <code>executeFlashLoan(uint256 amount, uint256 fee, bytes data)</code> and return <code>true</code> on success.</p>
              <pre className="text-xs bg-white border border-blue-100 rounded p-3 overflow-x-auto"><code>{`interface IL2FlashLoan { function executeFlashLoan(uint256 amount, uint256 fee, bytes calldata data) external returns (bool); }
interface IFlashBank { function flashLoan(uint256 amount, bytes calldata data) external; }`}</code></pre>
            </section>

            <section className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-3">Minimal Solidity Example</h2>
              <pre className="text-xs bg-white border border-green-100 rounded p-3 overflow-x-auto"><code>{`contract MyArbBot is IL2FlashLoan {
    address payable immutable flashBank;
    constructor(address payable _flashBank) { flashBank = _flashBank; }

    function start(uint256 amount, bytes calldata data) external {
        IFlashBank(flashBank).flashLoan(amount, data);
    }

    function executeFlashLoan(uint256 amount, uint256 fee, bytes calldata data) external returns (bool) {
        require(msg.sender == flashBank, "only FlashBank");
        // TODO: implement your MEV/arb strategy using this contract's balance
        // ... your logic ...

        // Repay amount + fee before returning
        (bool ok, ) = flashBank.call{ value: amount + fee }("");
        require(ok, "repay failed");
        return true;
    }

    receive() external payable {}
}`}</code></pre>
            </section>

            <section className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-3">Script Snippet (ethers v6)</h2>
              <pre className="text-xs bg-white border border-purple-100 rounded p-3 overflow-x-auto"><code>{`const borrower = new ethers.Contract(borrowerAddress, borrowerAbi, wallet);
await borrower.start(ethers.parseEther("10"), "0x"); // Request 10 ETH`}</code></pre>
            </section>

            <section className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-900 mb-3">Rules & Limits</h2>
              <ul className="list-disc pl-5 text-orange-800 text-sm space-y-1">
                <li>Minimum loan: 0.01 ETH</li>
                <li>Maximum single loan: 10,000 ETH (subject to available liquidity)</li>
                <li>Fee: 0.02% of the amount (<code>fee = (amount * 2) / 10000</code>)</li>
                <li>Repay <strong>amount + fee</strong> within <code>executeFlashLoan</code>, otherwise the transaction reverts</li>
              </ul>
            </section>

            <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Tips</h2>
              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                <li>Pass DEX routes/pools in <code>data</code> and decode inside <code>executeFlashLoan</code>.</li>
                <li>Fail safely: revert or return <code>false</code> on a missed opportunity; funds are returned to providers.</li>
                <li>Optimise gas; your EOA funds the transaction.</li>
              </ul>
            </section>

            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">⛽ Gas Cost Analysis</h2>
              <p className="text-blue-800 text-sm mb-3">
                Want to understand the gas costs of multi-provider flash loans? We've published a detailed study based on real Sepolia transactions.
              </p>
              <a 
                href="/gas-study" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📊 Read Gas Cost Study
                <span className="text-xs">→</span>
              </a>
              <p className="text-blue-700 text-xs mt-3">
                Learn when to use WETH-only mode, how provider count affects gas, and when FlashBank is more economical than Aave.
              </p>
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
