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
              <p className="text-blue-800 text-sm mb-3">Your contract must implement <code>executeFlashLoan(address token, uint256 amount, uint256 fee, bytes data)</code> and return <code>true</code> on success.</p>
              <pre className="text-xs bg-white border border-blue-100 rounded p-3 overflow-x-auto"><code>{`interface IFlashLoanReceiver {
    function executeFlashLoan(
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bool);
}

// Call the router to initiate a flash loan:
// router.flashLoan(token, amount, toNative, data)`}</code></pre>
            </section>

            <section className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-3">Minimal Solidity Example</h2>
              <pre className="text-xs bg-white border border-green-100 rounded p-3 overflow-x-auto"><code>{`import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyArbBot is IFlashLoanReceiver {
    address immutable router;
    address immutable weth;

    constructor(address _router, address _weth) {
        router = _router;
        weth = _weth;
    }

    function start(uint256 amount, bytes calldata data) external {
        // toNative=false → receive WETH; toNative=true → receive ETH
        IFlashBankRouter(router).flashLoan(weth, amount, false, data);
    }

    function executeFlashLoan(
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bool) {
        require(msg.sender == router, "only router");

        // Your MEV/arb strategy here — you hold the borrowed WETH
        // ...

        // Repay: approve router for amount + fee (WETH mode)
        IERC20(token).approve(router, amount + fee);
        return true;
    }

    receive() external payable {}
}

interface IFlashBankRouter {
    function flashLoan(
        address token,
        uint256 amount,
        bool toNative,
        bytes calldata data
    ) external;
}`}</code></pre>
            </section>

            <section className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-3">Script Snippet (ethers v6)</h2>
              <pre className="text-xs bg-white border border-purple-100 rounded p-3 overflow-x-auto"><code>{`const borrower = new ethers.Contract(borrowerAddress, borrowerAbi, wallet);
await borrower.start(ethers.parseEther("10"), "0x"); // Request 10 WETH`}</code></pre>
            </section>

            <section className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-900 mb-3">Rules & Limits</h2>
              <ul className="list-disc pl-5 text-orange-800 text-sm space-y-1">
                <li>Maximum single loan: 1,000 WETH (subject to available liquidity and 50% pool cap)</li>
                <li>Fee: 0.02% of the amount (2 bps, configurable by dual-control)</li>
                <li>Repay <strong>amount + fee</strong> within <code>executeFlashLoan</code>, otherwise the entire transaction reverts</li>
                <li>Set <code>toNative=true</code> to receive native ETH instead of WETH (useful for strategies that need ETH)</li>
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
              <a href="/#guide" className="text-blue-700 underline">← Back to Dashboard</a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
