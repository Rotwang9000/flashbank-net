import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useProvider, useSigner } from 'wagmi';
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

// FlashBank contract details
const FLASHBANK_ADDRESS = "0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095";
const FLASHBANK_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function withdrawProfit() external",
  "function getUserBalance(address user) external view returns (uint256 deposits, uint256 profits)",
  "function getPoolStats() external view returns (uint256 totalDeposits_, uint256 totalProfits, uint256 numDepositors, uint256 contractAge)",
  "function calculateFlashLoanFee(uint256 amount) external view returns (uint256 fee)",
  "function flashLoanFeeRate() external view returns (uint256)",
  "function getSecurityInfo() external view returns (bool isUpgradeable, uint256 maxFeeRate, uint256 absoluteMaxFlashLoan, uint256 deployedAt, uint256 creationBlock)"
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  const [userDeposits, setUserDeposits] = useState('0');
  const [userProfits, setUserProfits] = useState('0');
  const [poolStats, setPoolStats] = useState({
    totalDeposits: '0',
    totalProfits: '0',
    numDepositors: '0',
    contractAge: '0'
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user data and pool stats
  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
      loadPoolStats();
    }
  }, [isConnected, address]);

  const loadUserData = async () => {
    try {
      const contract = new ethers.Contract(FLASHBANK_ADDRESS, FLASHBANK_ABI, provider);
      const [deposits, profits] = await contract.getUserBalance(address);
      setUserDeposits(ethers.formatEther(deposits));
      setUserProfits(ethers.formatEther(profits));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPoolStats = async () => {
    try {
      const contract = new ethers.Contract(FLASHBANK_ADDRESS, FLASHBANK_ABI, provider);
      const [totalDeposits_, totalProfits, numDepositors, contractAge] = await contract.getPoolStats();
      setPoolStats({
        totalDeposits: ethers.formatEther(totalDeposits_),
        totalProfits: ethers.formatEther(totalProfits),
        numDepositors: numDepositors.toString(),
        contractAge: contractAge.toString()
      });
    } catch (error) {
      console.error('Error loading pool stats:', error);
    }
  };

  const handleDeposit = async () => {
    if (!signer || !depositAmount) return;
    
    try {
      setLoading(true);
      const contract = new ethers.Contract(FLASHBANK_ADDRESS, FLASHBANK_ABI, signer);
      const tx = await contract.deposit({ 
        value: ethers.parseEther(depositAmount) 
      });
      
      toast.loading('Depositing ETH...', { id: 'deposit' });
      await tx.wait();
      toast.success('Deposit successful!', { id: 'deposit' });
      
      // Refresh data
      await loadUserData();
      await loadPoolStats();
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Deposit failed', { id: 'deposit' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!signer || !withdrawAmount) return;
    
    try {
      setLoading(true);
      const contract = new ethers.Contract(FLASHBANK_ADDRESS, FLASHBANK_ABI, signer);
      const amount = withdrawAmount === 'all' ? 0 : ethers.parseEther(withdrawAmount);
      const tx = await contract.withdraw(amount);
      
      toast.loading('Withdrawing ETH...', { id: 'withdraw' });
      await tx.wait();
      toast.success('Withdrawal successful!', { id: 'withdraw' });
      
      // Refresh data
      await loadUserData();
      await loadPoolStats();
      setWithdrawAmount('');
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error('Withdrawal failed', { id: 'withdraw' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawProfit = async () => {
    if (!signer) return;
    
    try {
      setLoading(true);
      const contract = new ethers.Contract(FLASHBANK_ADDRESS, FLASHBANK_ABI, signer);
      const tx = await contract.withdrawProfit();
      
      toast.loading('Withdrawing profits...', { id: 'profit' });
      await tx.wait();
      toast.success('Profit withdrawal successful!', { id: 'profit' });
      
      // Refresh data
      await loadUserData();
      await loadPoolStats();
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
                    onClick={() => document.getElementById('deposit-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Start Earning</span>
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
              { icon: CheckCircle, title: "Audited", desc: "25 security tests passed" },
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
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Pool Statistics</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">{poolStats.totalDeposits} ETH</div>
                <div className="text-gray-400">Total Deposits</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">{poolStats.totalProfits} ETH</div>
                <div className="text-gray-400">Total Profits</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">{poolStats.numDepositors}</div>
                <div className="text-gray-400">Depositors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">0.05%</div>
                <div className="text-gray-400">Flash Loan Fee</div>
              </div>
            </div>
          </div>
        </section>

        {/* User Dashboard */}
        {isConnected && (
          <section id="deposit-section" className="container mx-auto px-6 py-16">
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-8">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Your Dashboard</h2>
              
              {/* User Stats */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{userDeposits} ETH</div>
                  <div className="text-gray-400">Your Deposits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{userProfits} ETH</div>
                  <div className="text-gray-400">Your Profits</div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Deposit */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Deposit ETH
                  </h3>
                  <input
                    type="number"
                    placeholder="Amount in ETH"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white mb-4"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={loading || !depositAmount}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold"
                  >
                    {loading ? 'Depositing...' : 'Deposit'}
                  </button>
                </div>

                {/* Withdraw */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                    Withdraw ETH
                  </h3>
                  <input
                    type="text"
                    placeholder="Amount or 'all'"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white mb-4"
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={loading || !withdrawAmount}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold"
                  >
                    {loading ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                </div>

                {/* Withdraw Profits */}
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Claim Profits
                  </h3>
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
