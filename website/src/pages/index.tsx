import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Lock,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// FlashBank Revolutionary contract details
const FLASHBANK_ADDRESS = "0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095";
const FLASHBANK_ABI = [
  // Revolutionary commitment system
  "function commitLiquidity(uint256 amount) external",
  "function withdrawCommitment(uint256 amount) external",
  "function withdrawProfits() external",

  // View functions
  "function getUserBalance(address user) external view returns (uint256 commitment, uint256 profits)",
  "function getPoolStats() external view returns (uint256 totalCommitted, uint256 totalProfits, uint256 numProviders, uint256 contractAge)",
  "function calculateFlashLoanFee(uint256 amount) external view returns (uint256 fee)",
  "function flashLoanFeeRate() external view returns (uint256)",
  "function getSecurityInfo() external view returns (bool isUpgradeable, uint256 maxFeeRate, uint256 absoluteMaxFlashLoan, uint256 deployedAt, uint256 creationBlock)",

  // Revolutionary features
  "function userCommitments(address user) external view returns (uint256)",
  "function totalCommittedLiquidity() external view returns (uint256)",
  "function liquidityProviders(uint256 index) external view returns (address)",
  "function isLiquidityProvider(address user) external view returns (bool)"
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [userCommitment, setUserCommitment] = useState('0');
  const [userProfits, setUserProfits] = useState('0');
  const [poolStats, setPoolStats] = useState({
    totalCommitted: '0',
    totalProfits: '0',
    numProviders: '0',
    contractAge: '0'
  });
  const [commitmentAmount, setCommitmentAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load user data and pool stats
  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
      loadPoolStats();
    }
  }, [isConnected, address, publicClient]);

  const loadUserData = async () => {
    try {
      if (!address || !publicClient) return;

      // Create a simple provider from publicClient for reading
      const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
      const contract = new ethers.Contract(FLASHBANK_ADDRESS, FLASHBANK_ABI, provider);

      const [commitment, profits] = await contract.getUserBalance(address);
      const userCommitmentAmount = await contract.userCommitments(address);

      setUserCommitment(ethers.formatEther(userCommitmentAmount));
      setUserProfits(ethers.formatEther(profits));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPoolStats = async () => {
    try {
      if (!publicClient) return;

      const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
      const contract = new ethers.Contract(FLASHBANK_ADDRESS, FLASHBANK_ABI, provider);

      const [totalCommitted, totalProfits, numProviders, contractAge] = await contract.getPoolStats();
      setPoolStats({
        totalCommitted: ethers.formatEther(totalCommitted),
        totalProfits: ethers.formatEther(totalProfits),
        numProviders: numProviders.toString(),
        contractAge: contractAge.toString()
      });
    } catch (error) {
      console.error('Error loading pool stats:', error);
    }
  };

  const handleCommitLiquidity = async () => {
    if (!walletClient || !commitmentAmount || !address) return;

    try {
      setLoading(true);
      toast.loading('Committing liquidity...', { id: 'commit' });

      // Use wagmi for the transaction - commitLiquidity just sets approval limit
      const hash = await walletClient.writeContract({
        address: FLASHBANK_ADDRESS as `0x${string}`,
        abi: FLASHBANK_ABI,
        functionName: 'commitLiquidity',
        args: [ethers.parseEther(commitmentAmount)],
        account: address as `0x${string}`,
        chain: arbitrum,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      toast.success('Liquidity committed successfully!', { id: 'commit' });

      // Refresh data
      setTimeout(() => {
        loadUserData();
        loadPoolStats();
      }, 2000);
      setCommitmentAmount('');
    } catch (error) {
      console.error('Commit liquidity error:', error);
      toast.error('Commitment failed', { id: 'commit' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawCommitment = async () => {
    if (!walletClient || !withdrawAmount || !address) return;

    try {
      setLoading(true);
      toast.loading('Withdrawing commitment...', { id: 'withdraw' });

      const amount = withdrawAmount === 'all' ? 0 : ethers.parseEther(withdrawAmount);

      // Use wagmi for the transaction
      const hash = await walletClient.writeContract({
        address: FLASHBANK_ADDRESS as `0x${string}`,
        abi: FLASHBANK_ABI,
        functionName: 'withdrawCommitment',
        args: [amount],
        account: address as `0x${string}`,
        chain: arbitrum,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      toast.success('Commitment withdrawn successfully!', { id: 'withdraw' });

      // Refresh data
      setTimeout(() => {
        loadUserData();
        loadPoolStats();
      }, 2000);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Withdraw commitment error:', error);
      toast.error('Withdrawal failed', { id: 'withdraw' });
    } finally {
      setLoading(false);
    }
  };

  const handlePauseCommitment = async () => {
    if (!walletClient || !address) return;

    try {
      setLoading(true);
      toast.loading('Pausing commitment...', { id: 'pause' });

      // For now, pause by withdrawing all commitment
      const currentCommitment = await publicClient.readContract({
        address: FLASHBANK_ADDRESS as `0x${string}`,
        abi: FLASHBANK_ABI,
        functionName: 'userCommitments',
        args: [address],
      }) as bigint;

      if (currentCommitment > BigInt(0)) {
        const hash = await walletClient.writeContract({
          address: FLASHBANK_ADDRESS as `0x${string}`,
          abi: FLASHBANK_ABI,
          functionName: 'withdrawCommitment',
          args: [0], // Withdraw all
          account: address as `0x${string}`,
          chain: arbitrum,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        setIsPaused(true);
        toast.success('Commitment paused successfully!', { id: 'pause' });
      }
    } catch (error) {
      console.error('Pause commitment error:', error);
      toast.error('Pause failed', { id: 'pause' });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeCommitment = async () => {
    if (!walletClient || !address) return;

    try {
      setLoading(true);
      toast.loading('Resuming commitment...', { id: 'resume' });

      // Resume by committing again (user needs to set amount)
      toast('Please set your commitment amount to resume', { id: 'resume' });
    } catch (error) {
      console.error('Resume commitment error:', error);
      toast.error('Resume failed', { id: 'resume' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawProfit = async () => {
    if (!walletClient || !address) return;
    
    try {
      setLoading(true);
      toast.loading('Claiming profits...', { id: 'profit' });
      
      const hash = await walletClient.writeContract({
        address: FLASHBANK_ADDRESS as `0x${string}`,
        abi: FLASHBANK_ABI,
        functionName: 'withdrawProfit',
        args: [],
        account: address as `0x${string}`,
        chain: arbitrum,
      });
      
      toast.loading('Confirming transaction...', { id: 'profit' });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success('Profit withdrawal successful!', { id: 'profit' });
      
      // Refresh data
      setTimeout(() => {
        loadUserData();
        loadPoolStats();
      }, 2000);
    } catch (error) {
      console.error('Profit withdrawal error:', error);
      toast.error('Profit withdrawal failed', { id: 'profit' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>FlashBank.net - Trustless Flash Loan Network</title>
        <meta name="description" content="The world's first immutable flash loan network with zero rug-pull risk. Earn up to 500% APY from MEV flash loan fees." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">FlashBank.net</h1>
          </div>
          <ConnectButton />
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              The Future of
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}Flash Loans
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The world's first <strong>immutable</strong> flash loan network. 
              Your ETH is never permanently at risk - earn up to 500% APY from MEV fees 
              with zero rug-pull possibility.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isConnected ? (
                  <button
                    onClick={() => document.getElementById('commitment-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Manage Commitments</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button 
                        onClick={openConnectModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2"
                      >
                        <span>Connect Wallet</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    )}
                  </ConnectButton.Custom>
                )}
              </motion.div>
              
              <a 
                href="https://arbiscan.io/address/0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white flex items-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>View Contract</span>
              </a>
            </div>
          </motion.div>
        </section>

        {/* Security Guarantees */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: "Non-Upgradeable", desc: "Code frozen forever" },
              { icon: Shield, title: "No Rug Pulls", desc: "Impossible to steal funds" },
              { icon: CheckCircle, title: "Audited", desc: "47 security tests passed" },
              { icon: Zap, title: "Instant Returns", desc: "ETH returned in microseconds" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg rounded-lg p-6 text-center"
              >
                <feature.icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pool Stats */}
        <section className="container mx-auto px-6 py-16">
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Network Statistics</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">{poolStats.totalCommitted} ETH</div>
                <div className="text-gray-400">Total Committed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">{poolStats.totalProfits} ETH</div>
                <div className="text-gray-400">Total Profits</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">{poolStats.numProviders}</div>
                <div className="text-gray-400">Active Providers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">0.02%</div>
                <div className="text-gray-400">Flash Loan Fee</div>
              </div>
            </div>
          </div>
        </section>

        {/* User Dashboard */}
        {isConnected && (
          <section id="commitment-section" className="container mx-auto px-6 py-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Your FlashBank Dashboard</h2>

              {/* User Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{userCommitment} ETH</div>
                  <div className="text-gray-400">Your Commitment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{userProfits} ETH</div>
                  <div className="text-gray-400">Your Profits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {isPaused ? '⏸️ Paused' : '✅ Active'}
                  </div>
                  <div className="text-gray-400">Status</div>
                </div>
              </div>

              {/* Revolutionary Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Commit Liquidity */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Commit ETH
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Approve contract to use your ETH for flash loans
                  </p>
                  <input
                    type="number"
                    placeholder="ETH amount"
                    value={commitmentAmount}
                    onChange={(e) => setCommitmentAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white mb-4"
                  />
                  <button
                    onClick={handleCommitLiquidity}
                    disabled={loading || !commitmentAmount}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold"
                  >
                    {loading ? 'Committing...' : 'Commit'}
                  </button>
                </div>

                {/* Withdraw Commitment */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                    Withdraw Commitment
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Reduce or remove your ETH commitment
                  </p>
                  <input
                    type="text"
                    placeholder="Amount or 'all'"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white mb-4"
                  />
                  <button
                    onClick={handleWithdrawCommitment}
                    disabled={loading || !withdrawAmount}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold"
                  >
                    {loading ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                </div>

                {/* Pause/Resume */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    {isPaused ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertTriangle className="h-5 w-5 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'} Participation
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {isPaused ? 'Resume earning from flash loans' : 'Temporarily pause participation'}
                  </p>
                  <button
                    onClick={isPaused ? handleResumeCommitment : handlePauseCommitment}
                    disabled={loading}
                    className={`w-full text-white py-2 rounded-lg font-semibold ${
                      isPaused
                        ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600'
                        : 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600'
                    }`}
                  >
                    {loading ? 'Processing...' : (isPaused ? 'Resume' : 'Pause')}
                  </button>
                </div>

                {/* Withdraw Profits */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Claim Profits
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Withdraw your earnings from flash loan fees
                  </p>
                  <div className="text-2xl font-bold text-green-400 mb-4">{userProfits} ETH</div>
                  <button
                    onClick={handleWithdrawProfit}
                    disabled={loading || parseFloat(userProfits) === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold"
                  >
                    {loading ? 'Claiming...' : 'Claim Profits'}
                  </button>
                </div>
              </div>

              {/* Revolutionary Features Info */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">🔥 Revolutionary Features</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <strong className="text-blue-400">🏦 ETH Stays in Your Wallet</strong>
                    <p>Your ETH remains in your wallet earning elsewhere while participating in flash loans.</p>
                  </div>
                  <div>
                    <strong className="text-blue-400">⚡ Just-in-Time Liquidity</strong>
                    <p>Contract only pulls ETH when needed for flash loans, returns it immediately after.</p>
                  </div>
                  <div>
                    <strong className="text-blue-400">🎯 Closest Match Selection</strong>
                    <p>Pulls from accounts with ETH amounts closest to loan size for optimal efficiency.</p>
                  </div>
                  <div>
                    <strong className="text-blue-400">🎰 Lottery Profit System</strong>
                    <p>Only ETH that gets lent receives profits - no free-riding, fair distribution.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="container mx-auto px-6 py-16 text-center text-gray-400">
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">FlashBank.net</span>
            </div>
            <p>The world's first immutable flash loan network</p>
          </div>
          
          <div className="flex justify-center space-x-8 mb-8">
            <a href="https://github.com/flashbank-net" className="hover:text-white">GitHub</a>
            <a href="https://docs.flashbank.net" className="hover:text-white">Docs</a>
            <a href="https://twitter.com/FlashBankNet" className="hover:text-white">Twitter</a>
            <a href="https://discord.gg/flashbank" className="hover:text-white">Discord</a>
          </div>
          
          <div className="border-t border-white/10 pt-8">
            <p>&copy; 2025 FlashBank.net. Built for the DeFi community.</p>
            <p className="text-sm mt-2">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Smart contracts involve risk. Do your own research.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}