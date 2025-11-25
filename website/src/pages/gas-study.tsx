import React from 'react';
import Head from 'next/head';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react';

export default function GasStudy() {
	return (
		<>
			<Head>
				<title>Gas Cost Study - FlashBank</title>
				<meta name="description" content="Real-world gas cost analysis of multi-provider flash loans on FlashBank" />
			</Head>
			<div className="min-h-screen bg-gray-50">
				<header className="bg-white border-b border-gray-200 shadow-sm">
					<div className="container mx-auto px-6 py-6">
						<div className="flex items-center gap-3 mb-2">
							<BarChart3 className="h-8 w-8 text-blue-600" />
							<h1 className="text-3xl font-bold text-gray-900">Gas Cost Study</h1>
						</div>
						<p className="text-gray-600">Multi-Provider Flash Loan Gas Analysis</p>
					</div>
				</header>

				<main className="container mx-auto px-6 py-8 max-w-5xl">
					<div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
						<div className="flex items-start gap-3">
							<CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
							<div>
								<h2 className="text-lg font-semibold text-green-900 mb-2">First Real-World Test: Success! ✅</h2>
								<p className="text-green-800 mb-3">
									On Nov 25, 2025, we executed the first multi-provider flash loan on Sepolia testnet:
								</p>
								<div className="bg-white rounded-lg p-4 font-mono text-sm">
									<p className="text-gray-700 mb-2">
										<strong>Transaction:</strong>{' '}
										<a
											href="https://sepolia.etherscan.io/tx/0xbe11b344027b38df7a85ad022e43d0aa2b775bd31890f722143944027db5d723"
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline break-all"
										>
											0xbe11b344027b38df7a85ad022e43d0aa2b775bd31890f722143944027db5d723
										</a>
									</p>
									<p className="text-gray-700">
										<strong>Result:</strong> 0.08 ETH borrowed from 2 providers, fees distributed proportionally
									</p>
								</div>
							</div>
						</div>
					</div>

					<section className="bg-white rounded-xl shadow p-8 mb-8 border border-gray-200">
						<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
							<Zap className="h-6 w-6 text-blue-600" />
							How It Worked
						</h2>
						<div className="space-y-4">
							<div className="bg-gray-50 rounded-lg p-4">
								<h3 className="font-semibold text-gray-900 mb-2">Provider 1 (0x3CD6...c191)</h3>
								<ul className="text-sm text-gray-700 space-y-1">
									<li>• Contributed: <strong>0.05110553 WETH</strong></li>
									<li>• Received back: <strong>0.05111575 WETH</strong></li>
									<li>• Profit: <strong>0.00001022 WETH</strong> (0.02% of their share)</li>
								</ul>
							</div>
							<div className="bg-gray-50 rounded-lg p-4">
								<h3 className="font-semibold text-gray-900 mb-2">Provider 2 (0x5CAF...0fd3)</h3>
								<ul className="text-sm text-gray-700 space-y-1">
									<li>• Contributed: <strong>0.02889447 WETH</strong></li>
									<li>• Received back: <strong>0.02890025 WETH</strong></li>
									<li>• Profit: <strong>0.00000578 WETH</strong> (0.02% of their share)</li>
								</ul>
							</div>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<p className="text-sm text-blue-900">
									<strong>✓ Key Success:</strong> Fees were distributed proportionally to each provider's contribution, 
									exactly as designed. The router pulled from multiple wallets, unwrapped to ETH for the borrower, 
									then wrapped the repayment and distributed it back with fees.
								</p>
							</div>
						</div>
					</section>

					<section className="bg-white rounded-xl shadow p-8 mb-8 border border-gray-200">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">⛽ Gas Cost Breakdown</h2>
						
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-3">Operations in This Transaction</h3>
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-gray-100">
										<tr>
											<th className="px-4 py-2 text-left">Operation</th>
											<th className="px-4 py-2 text-right">Est. Gas</th>
											<th className="px-4 py-2 text-left">Notes</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										<tr>
											<td className="px-4 py-3">2× WETH <code>transferFrom</code> (providers → router)</td>
											<td className="px-4 py-3 text-right font-mono">~100k</td>
											<td className="px-4 py-3 text-gray-600">50k each</td>
										</tr>
										<tr>
											<td className="px-4 py-3">1× WETH unwrap (WETH → ETH)</td>
											<td className="px-4 py-3 text-right font-mono">~25k</td>
											<td className="px-4 py-3 text-gray-600">toNative=true</td>
										</tr>
										<tr>
											<td className="px-4 py-3">Demo execution (counter + proof)</td>
											<td className="px-4 py-3 text-right font-mono">~70k</td>
											<td className="px-4 py-3 text-gray-600">Not typical</td>
										</tr>
										<tr>
											<td className="px-4 py-3">1× WETH wrap (repayment ETH → WETH)</td>
											<td className="px-4 py-3 text-right font-mono">~30k</td>
											<td className="px-4 py-3 text-gray-600">toNative=true</td>
										</tr>
										<tr>
											<td className="px-4 py-3">2× WETH <code>transfer</code> (router → providers)</td>
											<td className="px-4 py-3 text-right font-mono">~90k</td>
											<td className="px-4 py-3 text-gray-600">45k each with fees</td>
										</tr>
										<tr>
											<td className="px-4 py-3">Router overhead & verification</td>
											<td className="px-4 py-3 text-right font-mono">~30k</td>
											<td className="px-4 py-3 text-gray-600">Flash loan logic</td>
										</tr>
										<tr className="bg-yellow-50 font-semibold">
											<td className="px-4 py-3">Total (this demo tx)</td>
											<td className="px-4 py-3 text-right font-mono">~345k</td>
											<td className="px-4 py-3 text-gray-600">Including demo overhead</td>
										</tr>
										<tr className="bg-blue-50 font-semibold">
											<td className="px-4 py-3">Real flash loan (no demo)</td>
											<td className="px-4 py-3 text-right font-mono">~275k</td>
											<td className="px-4 py-3 text-gray-600">2 providers, toNative</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<h4 className="font-semibold text-blue-900 mb-2">💡 WETH-Only Optimization</h4>
							<p className="text-sm text-blue-800 mb-2">
								If the borrower accepts <strong>WETH directly</strong> (toNative=false), you save ~55k gas by skipping unwrap/wrap:
							</p>
							<ul className="text-sm text-blue-800 space-y-1 ml-4">
								<li>• <strong>WETH-only, 2 providers:</strong> ~220k gas</li>
								<li>• <strong>WETH-only, 1 provider:</strong> ~120k gas</li>
								<li>• <strong>Recommendation:</strong> Smaller loans should use WETH to minimize gas overhead</li>
							</ul>
						</div>

						<h3 className="text-lg font-semibold text-gray-900 mb-3">Scaling: Gas vs Number of Providers</h3>
						<div className="overflow-x-auto mb-6">
							<table className="w-full text-sm">
								<thead className="bg-gray-100">
									<tr>
										<th className="px-4 py-2 text-left">Providers</th>
										<th className="px-4 py-2 text-right">Gas (toNative)</th>
										<th className="px-4 py-2 text-right">Gas (WETH-only)</th>
										<th className="px-4 py-2 text-left">Notes</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									<tr>
										<td className="px-4 py-3">1</td>
										<td className="px-4 py-3 text-right font-mono">~175k</td>
										<td className="px-4 py-3 text-right font-mono text-green-600">~120k</td>
										<td className="px-4 py-3 text-gray-600">Comparable to Aave</td>
									</tr>
									<tr>
										<td className="px-4 py-3">2</td>
										<td className="px-4 py-3 text-right font-mono">~275k</td>
										<td className="px-4 py-3 text-right font-mono text-green-600">~220k</td>
										<td className="px-4 py-3 text-gray-600">+100k per provider</td>
									</tr>
									<tr>
										<td className="px-4 py-3">3</td>
										<td className="px-4 py-3 text-right font-mono">~375k</td>
										<td className="px-4 py-3 text-right font-mono">~320k</td>
										<td className="px-4 py-3 text-gray-600">+100k per provider</td>
									</tr>
									<tr>
										<td className="px-4 py-3">5</td>
										<td className="px-4 py-3 text-right font-mono">~575k</td>
										<td className="px-4 py-3 text-right font-mono">~520k</td>
										<td className="px-4 py-3 text-gray-600">High fragmentation</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-sm text-gray-700">
								<strong>Formula:</strong> Gas ≈ 175k + 100k × (N-1) for toNative, or 120k + 100k × (N-1) for WETH-only, 
								where N = number of providers.
							</p>
						</div>
					</section>

					<section className="bg-white rounded-xl shadow p-8 mb-8 border border-gray-200">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Cost Comparison (Mainnet)</h2>
						<p className="text-sm text-gray-600 mb-4">Assuming: Gas price = 20 gwei, ETH = $3,500</p>
						
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-gray-100">
									<tr>
										<th className="px-4 py-2 text-left">Scenario</th>
										<th className="px-4 py-2 text-right">Gas</th>
										<th className="px-4 py-2 text-right">Cost (USD)</th>
										<th className="px-4 py-2 text-left">Best For</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									<tr className="bg-green-50">
										<td className="px-4 py-3"><strong>Aave V3 Flash Loan</strong></td>
										<td className="px-4 py-3 text-right font-mono">150-200k</td>
										<td className="px-4 py-3 text-right font-mono">$10.50-$14</td>
										<td className="px-4 py-3 text-gray-600">Single source</td>
									</tr>
									<tr>
										<td className="px-4 py-3"><strong>FlashBank (1 provider, WETH)</strong></td>
										<td className="px-4 py-3 text-right font-mono">~120k</td>
										<td className="px-4 py-3 text-right font-mono text-green-600">$8.40</td>
										<td className="px-4 py-3 text-gray-600">Small WETH loans</td>
									</tr>
									<tr>
										<td className="px-4 py-3"><strong>FlashBank (1 provider, toNative)</strong></td>
										<td className="px-4 py-3 text-right font-mono">~175k</td>
										<td className="px-4 py-3 text-right font-mono">$12.25</td>
										<td className="px-4 py-3 text-gray-600">Small ETH loans</td>
									</tr>
									<tr>
										<td className="px-4 py-3"><strong>FlashBank (2 providers, WETH)</strong></td>
										<td className="px-4 py-3 text-right font-mono">~220k</td>
										<td className="px-4 py-3 text-right font-mono">$15.40</td>
										<td className="px-4 py-3 text-gray-600">Medium WETH loans</td>
									</tr>
									<tr>
										<td className="px-4 py-3"><strong>FlashBank (2 providers, toNative)</strong></td>
										<td className="px-4 py-3 text-right font-mono">~275k</td>
										<td className="px-4 py-3 text-right font-mono">$19.25</td>
										<td className="px-4 py-3 text-gray-600">Medium ETH loans</td>
									</tr>
									<tr>
										<td className="px-4 py-3"><strong>FlashBank (5 providers, toNative)</strong></td>
										<td className="px-4 py-3 text-right font-mono">~575k</td>
										<td className="px-4 py-3 text-right font-mono text-orange-600">$40.25</td>
										<td className="px-4 py-3 text-gray-600">Large/fragmented loans</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
								<div className="text-sm text-yellow-900">
									<p className="font-semibold mb-2">When Does Multi-Provider Cost Matter?</p>
									<p className="mb-2">
										FlashBank has a <strong>0.03% fee advantage</strong> over Aave (0.02% vs 0.05%). 
										The extra gas from multiple providers becomes prohibitive when:
									</p>
									<ul className="ml-4 space-y-1">
										<li>• Small loans (&lt;$10k) from many providers</li>
										<li>• The gas overhead exceeds the fee savings</li>
										<li>• High-frequency small arbitrage with tight margins</li>
									</ul>
								</div>
							</div>
						</div>
					</section>

					<section className="bg-white rounded-xl shadow p-8 mb-8 border border-gray-200">
						<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
							<TrendingUp className="h-6 w-6 text-green-600" />
							Optimizations & Strategies
						</h2>

						<div className="space-y-6">
							<div className="border-l-4 border-blue-500 pl-4">
								<h3 className="font-semibold text-gray-900 mb-2">1. Single-Provider Fast Path (Upcoming)</h3>
								<p className="text-sm text-gray-700 mb-2">
									If the loan amount is under a threshold (e.g., 10 ETH) and can be fulfilled by a single provider, 
									the router will automatically select that provider to minimize gas costs.
								</p>
								<p className="text-sm text-gray-600 italic">
									This optimization encourages small providers while keeping gas efficient for small loans.
								</p>
							</div>

							<div className="border-l-4 border-green-500 pl-4">
								<h3 className="font-semibold text-gray-900 mb-2">2. WETH-Only Mode</h3>
								<p className="text-sm text-gray-700 mb-2">
									For borrowers who can work with WETH directly (most MEV/arb bots), set <code className="bg-gray-100 px-1 rounded">toNative=false</code> 
									to save ~55k gas by skipping unwrap/wrap operations.
								</p>
								<div className="bg-green-50 rounded p-3 text-xs font-mono mt-2">
									router.flashLoan(wethAddress, amount, <span className="text-green-600 font-bold">false</span>, data);
								</div>
							</div>

							<div className="border-l-4 border-purple-500 pl-4">
								<h3 className="font-semibold text-gray-900 mb-2">3. Provider Incentives</h3>
								<p className="text-sm text-gray-700">
									We want to encourage <em>anyone</em> to provide liquidity, so we won't implement aggressive provider minimization. 
									However, borrowers benefit from having a few large providers rather than many small ones.
								</p>
							</div>

							<div className="border-l-4 border-orange-500 pl-4">
								<h3 className="font-semibold text-gray-900 mb-2">4. Fee vs Gas Trade-off</h3>
								<p className="text-sm text-gray-700">
									At 20 gwei gas and current ETH prices, the 0.03% fee advantage over Aave breaks even at:
								</p>
								<ul className="text-sm text-gray-700 ml-4 mt-2 space-y-1">
									<li>• ~$65k loan size (2 providers, toNative)</li>
									<li>• ~$130k loan size (3 providers, toNative)</li>
									<li>• Smaller for WETH-only mode</li>
								</ul>
							</div>
						</div>
					</section>

					<section className="bg-white rounded-xl shadow p-8 border border-gray-200">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Recommendations for Borrowers</h2>
						<div className="grid md:grid-cols-2 gap-6">
							<div className="bg-green-50 border border-green-200 rounded-lg p-5">
								<h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
									<CheckCircle className="h-5 w-5" />
									FlashBank is Better When:
								</h3>
								<ul className="text-sm text-green-800 space-y-2">
									<li>• Large loans (&gt;$100k) where fee savings dominate</li>
									<li>• You value custody guarantees for providers</li>
									<li>• You can accept WETH directly (toNative=false)</li>
									<li>• You need more liquidity than Aave has available</li>
									<li>• Gas prices are low (&lt;15 gwei)</li>
								</ul>
							</div>
							<div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
								<h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
									<AlertCircle className="h-5 w-5" />
									Use Aave Instead When:
								</h3>
								<ul className="text-sm text-orange-800 space-y-2">
									<li>• Small loans (&lt;$10k) from many providers</li>
									<li>• Gas prices are very high (&gt;50 gwei)</li>
									<li>• High-frequency trading with tight margins</li>
									<li>• You need multi-asset flash loans in one call</li>
									<li>• Absolute minimum gas is critical</li>
								</ul>
							</div>
						</div>
					</section>

					<div className="mt-8 text-center">
						<a href="/guides/borrow" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
							← Back to Borrower Guide
						</a>
					</div>
				</main>
			</div>
		</>
	);
}

