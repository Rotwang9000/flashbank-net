import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import { useAppKitAccount } from '@reown/appkit/library/react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { arbitrum, mainnet, base, sepolia } from '@wagmi/core/chains';
import { useIsMounted } from '../hooks/useIsMounted';
import { useChainId, useSwitchChain } from 'wagmi';
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
  AlertTriangle,
  Wallet,
  Clock,
  Target,
  Coins,
  BookOpen
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Chain configurations - Load from environment variables
const ANKR_API_KEY = process.env.NEXT_PUBLIC_ANKR_API_KEY || '2e8f34fc656bf1d606b8bec1dcb00db2398ed0529bb68fe0fc39f080865397fd';

const CHAIN_CONFIGS = {
  [arbitrum.id]: {
    name: 'Arbitrum',
    flashbankAddress: process.env.NEXT_PUBLIC_ARBITRUM_FLASHBANK_ADDRESS || '0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    color: 'blue',
    icon: '🔷'
  },
  [mainnet.id]: {
    name: 'Ethereum',
    flashbankAddress: process.env.NEXT_PUBLIC_ETHEREUM_FLASHBANK_ADDRESS || '0x54b9Bc0679f5106AC3682a74518b229409b4eA15',
    rpcUrl: 'https://cloudflare-eth.com',
    explorerUrl: 'https://etherscan.io',
    color: 'purple',
    icon: '🔶'
  },
  [sepolia.id]: {
    name: 'Sepolia',
    flashbankAddress: process.env.NEXT_PUBLIC_SEPOLIA_FLASHBANK_ADDRESS || '0xBDcC71d5F73962d017756A04919FBba9d30F0795',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
    color: 'yellow',
    icon: '🧪'
  },
  [base.id]: {
    name: 'Base',
    flashbankAddress: process.env.NEXT_PUBLIC_BASE_FLASHBANK_ADDRESS || '0x779F8D578F279738c17D9f26B33fe46d32b91Eb7',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    color: 'red',
    icon: '🔴'
  }
};

// FlashBank Revolutionary contract ABI (JSON format for wagmi compatibility)
const FLASHBANK_ABI = [
  { "inputs": [], "name": "approveUnlimited", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "limit", "type": "uint256" }], "name": "setCommitmentLimit", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "commitLiquidity", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdrawCommitment", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "withdrawProfits", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getUserBalance", "outputs": [{ "internalType": "uint256", "name": "commitment", "type": "uint256" }, { "internalType": "uint256", "name": "profits", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getPoolStats", "outputs": [{ "internalType": "uint256", "name": "totalCommitted", "type": "uint256" }, { "internalType": "uint256", "name": "totalProfits", "type": "uint256" }, { "internalType": "uint256", "name": "numProviders", "type": "uint256" }, { "internalType": "uint256", "name": "contractAge", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "calculateFlashLoanFee", "outputs": [{ "internalType": "uint256", "name": "fee", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "flashLoanFeeRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getSecurityInfo", "outputs": [{ "internalType": "bool", "name": "isUpgradeable", "type": "bool" }, { "internalType": "uint256", "name": "maxFeeRate", "type": "uint256" }, { "internalType": "uint256", "name": "absoluteMaxFlashLoan", "type": "uint256" }, { "internalType": "uint256", "name": "deployedAt", "type": "uint256" }, { "internalType": "uint256", "name": "creationBlock", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "userCommitments", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalCommittedLiquidity", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "liquidityProviders", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "isLiquidityProvider", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }
] as const;

// Map colour keys to Tailwind classes to avoid dynamic class names
const COLOR_CLASSES: Record<string, { bg100: string; text800: string; border200: string; bg50: string; text700: string; text600: string }>= {
  blue:   { bg100: 'bg-blue-100',   text800: 'text-blue-800',   border200: 'border-blue-200',   bg50: 'bg-blue-50',   text700: 'text-blue-700',   text600: 'text-blue-600' },
  purple: { bg100: 'bg-purple-100', text800: 'text-purple-800', border200: 'border-purple-200', bg50: 'bg-purple-50', text700: 'text-purple-700', text600: 'text-purple-600' },
  yellow: { bg100: 'bg-yellow-100', text800: 'text-yellow-800', border200: 'border-yellow-200', bg50: 'bg-yellow-50', text700: 'text-yellow-700', text600: 'text-yellow-600' },
  red:    { bg100: 'bg-red-100',    text800: 'text-red-800',    border200: 'border-red-200',    bg50: 'bg-red-50',    text700: 'text-red-700',    text600: 'text-red-600' },
};

export default function Home() {
  const isMounted = useIsMounted();
  const { address, isConnected } = useAppKitAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [userCommitment, setUserCommitment] = useState('0');
  const [userProfits, setUserProfits] = useState('0');
  const [poolStats, setPoolStats] = useState({
    totalCommitted: '0',
    totalProfits: '0',
    numProviders: '0',
    contractAge: '0'
  });

  // New workflow state
  const [approvalStep, setApprovalStep] = useState<'not-approved' | 'approved' | 'limit-set'>('not-approved');
  const [commitmentLimit, setCommitmentLimit] = useState('0'); // 0 = unlimited/auto
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [unlimitedToggle, setUnlimitedToggle] = useState(false);
  const [removeAllToggle, setRemoveAllToggle] = useState(false);

  // Soft-launch: enable actions only on Sepolia
  const SOFT_LAUNCH_CHAIN_ID = sepolia.id;
  const actionsDisabled = isConnected && chainId !== SOFT_LAUNCH_CHAIN_ID;

  // Load user data and pool stats
  useEffect(() => {
    if (isMounted && isConnected && address) {
      loadUserData();
      loadPoolStats();
    }
  }, [isMounted, isConnected, address, publicClient, chainId]);

  const getCurrentChainConfig = () => {
    return CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS] || CHAIN_CONFIGS[arbitrum.id];
  };

  // Helpers to persist last commitment across sessions per chain and address
  const getLastCommitmentKey = (addr: string | undefined, id: number) => `flashbank:lastCommitment:${id}:${(addr || '').toLowerCase()}`;
  const saveLastCommitment = (addr: string, id: number, value: string) => {
    try { localStorage.setItem(getLastCommitmentKey(addr, id), value); } catch {}
  };
  const loadLastCommitment = (addr: string, id: number): string | null => {
    try { return localStorage.getItem(getLastCommitmentKey(addr, id)); } catch { return null; }
  };
  const clearLastCommitment = (addr: string, id: number) => {
    try { localStorage.removeItem(getLastCommitmentKey(addr, id)); } catch {}
  };

  // Safe write helper: simulate first; fallback with conservative gas on estimation failures
  const safeWriteContract = async (
    functionName: keyof typeof FLASHBANK_ABI extends never ? string : any,
    args: any[] = [],
    value?: bigint
  ): Promise<`0x${string}`> => {
    if (!walletClient || !publicClient || !address) throw new Error('Wallet not ready');
    const chainConfig = getCurrentChainConfig();
    try {
      const { request } = await publicClient.simulateContract({
        address: chainConfig.flashbankAddress as `0x${string}`,
        abi: FLASHBANK_ABI as any,
        functionName: functionName as any,
        args,
        value,
        account: address as `0x${string}`,
        chain: undefined as any,
      } as any);
      return await walletClient.writeContract(request as any);
    } catch (err) {
      const fallbackGas: Record<string, bigint> = {
        approveUnlimited: 120000n,
        setCommitmentLimit: 140000n,
        commitLiquidity: 220000n,
        withdrawCommitment: 220000n,
        withdrawProfits: 140000n,
      };
      const gas = fallbackGas[String(functionName)] || 220000n;
      return await walletClient.writeContract({
        address: chainConfig.flashbankAddress as `0x${string}`,
        abi: FLASHBANK_ABI as any,
        functionName: functionName as any,
        args,
        account: address as `0x${string}`,
        gas,
        chain: {
          id: chainId,
          name: chainConfig.name,
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: [chainConfig.rpcUrl] } },
          blockExplorers: { default: { name: chainConfig.name, url: chainConfig.explorerUrl } }
        } as any,
      } as any);
    }
  };

  const loadUserData = async () => {
    try {
      if (!address || !publicClient) return;

      const chainConfig = getCurrentChainConfig();
      const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
      const contract = new ethers.Contract(chainConfig.flashbankAddress, FLASHBANK_ABI, provider);

      let commitment: bigint = 0n;
      let profits: bigint = 0n;
      try {
        const res = await contract.getUserBalance(address);
        commitment = res[0];
        profits = res[1];
      } catch {}

      let userCommitmentAmount: bigint = commitment;
      try {
        userCommitmentAmount = await contract.userCommitments(address);
      } catch {}

      const isUnlimited = userCommitmentAmount === ethers.MaxUint256;
      setUserCommitment(isUnlimited ? 'Unlimited' : ethers.formatEther(userCommitmentAmount));
      setUserProfits(ethers.formatEther(profits));

      // Derive approval/paused state
      const hadLast = loadLastCommitment(address, chainId);
      if (userCommitmentAmount === 0n) {
        setIsPaused(!!hadLast);
        setApprovalStep('not-approved');
      } else if (isUnlimited) {
        setIsPaused(false);
        setApprovalStep('approved');
      } else {
        setIsPaused(false);
        setApprovalStep('limit-set');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPoolStats = async () => {
    try {
      if (!publicClient) return;
      const chainConfig = getCurrentChainConfig();
      const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
      const contract = new ethers.Contract(chainConfig.flashbankAddress, FLASHBANK_ABI, provider);

      try {
      const [totalCommitted, totalProfits, numProviders, contractAge] = await contract.getPoolStats();
      setPoolStats({
        totalCommitted: ethers.formatEther(totalCommitted),
        totalProfits: ethers.formatEther(totalProfits),
        numProviders: numProviders.toString(),
        contractAge: contractAge.toString()
      });
      } catch {
        // Keep previous stats if call fails
      }
    } catch (error) {
      console.error('Error loading pool stats:', error);
    }
  };

  const handleApproveUnlimited = async () => {
    if (!walletClient || !address) return;
    if (actionsDisabled) { toast.error('Soft launch: Sepolia only'); return; }

    try {
      setLoading(true);
      toast.loading('Approving unlimited access...', { id: 'approve' });

      const hash = await safeWriteContract('approveUnlimited', []);
      await publicClient!.waitForTransactionReceipt({ hash });

      toast.success('Unlimited approval granted!', { id: 'approve' });
      setApprovalStep('approved');

      setTimeout(() => {
        loadUserData();
        loadPoolStats();
      }, 2000);
    } catch (error) {
      console.error('Approve unlimited error:', error);
      toast.error('Approval failed', { id: 'approve' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetCommitmentLimit = async () => {
    if (!walletClient || !address) return;
    if (actionsDisabled) { toast.error('Soft launch: Sepolia only'); return; }

    try {
      setLoading(true);
      toast.loading('Setting commitment limit...', { id: 'limit' });

      const chainConfig = getCurrentChainConfig();
      if (unlimitedToggle) {
        const hash = await safeWriteContract('approveUnlimited', []);
        await publicClient!.waitForTransactionReceipt({ hash });
      } else if (removeAllToggle) {
        const hash = await safeWriteContract('setCommitmentLimit', [0n]);
        await publicClient!.waitForTransactionReceipt({ hash });
      } else {
        const limit = commitmentLimit === '0' ? 0n : ethers.parseEther(commitmentLimit);
        const hash = await safeWriteContract('setCommitmentLimit', [limit]);
        await publicClient!.waitForTransactionReceipt({ hash });
      }
      setUnlimitedToggle(false);
      setRemoveAllToggle(false);
      // Immediate refresh
      await Promise.all([loadUserData(), loadPoolStats()]);
      toast.success('Commitment limit set!', { id: 'limit' });
      setApprovalStep('limit-set');

      // Refresh data
      setTimeout(() => {
        loadUserData();
        loadPoolStats();
      }, 2000);
      setCommitmentLimit('0');
    } catch (error) {
      console.error('Set commitment limit error:', error);
      toast.error('Setting limit failed', { id: 'limit' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawCommitment = async () => {
    if (!walletClient || !withdrawAmount || !address) return;
    if (actionsDisabled) { toast.error('Soft launch: Sepolia only'); return; }

    try {
      setLoading(true);
      toast.loading('Withdrawing commitment...', { id: 'withdraw' });

      const amount = withdrawAmount === 'all' ? 0n : ethers.parseEther(withdrawAmount);
      await safeWriteContract('withdrawCommitment', [amount]);
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
    if (actionsDisabled) { toast.error('Soft launch: Sepolia only'); return; }

    try {
      setLoading(true);
      toast.loading('Pausing commitment...', { id: 'pause' });

      const chainConfig = getCurrentChainConfig();

      // Read current commitment
      const currentCommitment = (await publicClient!.readContract({
        address: chainConfig.flashbankAddress as `0x${string}`,
        abi: FLASHBANK_ABI as any,
        functionName: 'userCommitments',
        args: [address],
      } as any)) as bigint;

      if (currentCommitment > 0n) {
        // Persist last commitment
        if (currentCommitment === ethers.MaxUint256) {
          saveLastCommitment(address, chainId, 'UNLIMITED');
        } else {
          saveLastCommitment(address, chainId, currentCommitment.toString());
        }
        // Set limit to 0 to pause
        const hash = await safeWriteContract('setCommitmentLimit', [0n]);
        await publicClient!.waitForTransactionReceipt({ hash });

        setIsPaused(true);
        toast.success('Commitment paused successfully!', { id: 'pause' });
      } else {
        toast.success('No commitment to pause', { id: 'pause' });
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
    if (actionsDisabled) { toast.error('Soft launch: Sepolia only'); return; }

    try {
      setLoading(true);
      toast.loading('Resuming commitment...', { id: 'resume' });

      const last = loadLastCommitment(address, chainId);
      if (!last) {
        const chainConfig = getCurrentChainConfig();
        const current = (await publicClient!.readContract({
          address: chainConfig.flashbankAddress as `0x${string}`,
          abi: FLASHBANK_ABI as any,
          functionName: 'userCommitments',
          args: [address],
        } as any)) as bigint;
        if (current > 0n) {
          setIsPaused(false);
          toast.success('Already active', { id: 'resume' });
          setLoading(false);
          return;
        }
        toast.error('No previous commitment found', { id: 'resume' });
        setLoading(false);
        return;
      }

      if (last === 'UNLIMITED') {
        const hash = await safeWriteContract('approveUnlimited', []);
        await publicClient!.waitForTransactionReceipt({ hash });
      } else {
        const amount = BigInt(last);
        const hash = await safeWriteContract('setCommitmentLimit', [amount]);
        await publicClient!.waitForTransactionReceipt({ hash });
      }

      clearLastCommitment(address, chainId);
      setIsPaused(false);
      toast.success('Commitment resumed!', { id: 'resume' });

      setTimeout(() => {
        loadUserData();
        loadPoolStats();
      }, 2000);
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

      const chainConfig = getCurrentChainConfig();

      const hash = await walletClient.writeContract({
        address: chainConfig.flashbankAddress as `0x${string}`,
        abi: FLASHBANK_ABI,
        functionName: 'withdrawProfits',
        args: [],
        account: address as `0x${string}`,
        chain: { id: chainId, name: chainConfig.name, nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [chainConfig.rpcUrl] } }, blockExplorers: { default: { name: chainConfig.name, url: chainConfig.explorerUrl } } } as any,
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
        <meta name="description" content="The world's first immutable flash loan network where your ETH stays in your wallet. Earn from MEV opportunities with microsecond risk exposure." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        <Toaster position="top-right" />

        {/* Security Notice Banner */}
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-yellow-800">
                <strong>Security Notice:</strong> FlashBank has not been externally audited yet.
              </span>
              <a
                href="/security-audit"
                className="text-yellow-900 underline font-medium hover:text-yellow-700"
              >
                View our detailed line-by-line security analysis →
              </a>
            </div>
          </div>
        </div>
        
        {/* Header - Always visible */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">FlashBank.net</h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Chain Selector */}
                <div className="flex items-center space-x-2">
                  {Object.entries(CHAIN_CONFIGS).map(([chainIdStr, config]) => {
                    const buttonChainId = Number(chainIdStr);
                    const isActive = buttonChainId === chainId;
                    return (
                      <button
                        key={chainIdStr}
                        onClick={() => switchChain({ chainId: buttonChainId })}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? `${COLOR_CLASSES[config.color].bg100} ${COLOR_CLASSES[config.color].text800} ${COLOR_CLASSES[config.color].border200} border`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {config.icon} {config.name}
                      </button>
                    );
                  })}
                </div>

                {/* Instructions & Stats Link */}
                <a
                  href="#instructions"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm font-medium"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Instructions & Stats</span>
                </a>

                <appkit-connect-button />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Dashboard takes priority when connected */}
                {isConnected ? (
          /* User Dashboard - Primary content when connected */
          <main className="py-8">
            {actionsDisabled && (
              <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                Soft launch: Actions are enabled on Sepolia only. Switch to Sepolia to interact.
              </div>
            )}
            <div className="container mx-auto px-6">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Participation Dashboard</h1>
                <p className="text-gray-600">Manage your ETH commitments and track your earnings</p>
              </div>
              
              {/* User Stats */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-blue-50 rounded-lg p-8 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{userCommitment} ETH</div>
                  <div className="text-gray-600">Your Commitment</div>
                </div>
                <div className="bg-green-50 rounded-lg p-8 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{userProfits} ETH</div>
                  <div className="text-gray-600">Available Profits</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-8 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {isPaused ? '⏸️ Paused' : '✅ Active'}
                  </div>
                  <div className="text-gray-600">Status</div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                {/* Step 1: Approve Unlimited */}
                {approvalStep === 'not-approved' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Shield className="h-5 w-5 text-blue-600 mr-2" />
                        Step 1: Approve Access
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Give FlashBank permission to use your ETH for flash loans
                      </p>
                    </div>
                    <button
                      onClick={handleApproveUnlimited}
                      disabled={loading || actionsDisabled}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg text-sm font-medium transition-colors mt-auto"
                    >
                      {loading ? 'Approving...' : 'Approve Unlimited'}
                    </button>
                  </div>
                )}

                {/* Step 2: Set Optional Limit */}
                {approvalStep !== 'not-approved' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Target className="h-5 w-5 text-green-600 mr-2" />
                        Step 2: Set/Change Limit
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Current limit: <span className="font-semibold">{userCommitment}</span>
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Enter a new limit in ETH. Use 0 to pause. For unlimited, use "Approve Access".
                      </p>
                      <div className="flex items-center gap-6 mb-3">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input type="checkbox" checked={unlimitedToggle} onChange={(e) => { setUnlimitedToggle(e.target.checked); if (e.target.checked) setRemoveAllToggle(false); }} />
                          Unlimited
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input type="checkbox" checked={removeAllToggle} onChange={(e) => { setRemoveAllToggle(e.target.checked); if (e.target.checked) setUnlimitedToggle(false); }} />
                          Remove all
                        </label>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <input
                        type="text"
                        placeholder="New ETH limit (0 to pause)"
                        value={commitmentLimit}
                        onChange={(e) => setCommitmentLimit(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={actionsDisabled || unlimitedToggle || removeAllToggle}
                      />
                      <button
                        onClick={handleSetCommitmentLimit}
                        disabled={loading || actionsDisabled}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        {loading ? 'Setting...' : 'Set Limit'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Withdraw */}
                {false && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col"></div>
                )}

                {/* Pause/Resume */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                  <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    {isPaused ? <CheckCircle className="h-5 w-5 text-green-600 mr-2" /> : <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'} Participation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {isPaused ? 'Resume earning from flash loans' : 'Temporarily stop participation'}
                  </p>
                  </div>
                  <button
                    onClick={isPaused ? handleResumeCommitment : handlePauseCommitment}
                    disabled={loading || actionsDisabled}
                    className={`w-full text-white py-3 rounded-lg text-sm font-medium transition-colors mt-auto ${
                      isPaused
                        ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
                        : 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400'
                    }`}
                  >
                    {loading ? 'Processing...' : (isPaused ? 'Resume' : 'Pause')}
                  </button>
                </div>

                {/* Claim Profits */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                  <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    Claim Profits
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Withdraw your earnings from flash loan fees
                  </p>
                  <div className="text-2xl font-bold text-green-600 mb-3">{userProfits} ETH</div>
                  </div>
                  <button
                    onClick={handleWithdrawProfit}
                    disabled={loading || parseFloat(userProfits) === 0 || actionsDisabled}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg text-sm font-medium transition-colors mt-auto"
                  >
                    {loading ? 'Claiming...' : 'Claim Profits'}
                  </button>
                </div>
              </div>

              {/* How It Works Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">How Your Participation Works</h3>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2">1. ETH Stays Safe</h4>
                    <p className="text-blue-700">Your ETH remains in your wallet. FlashBank only gets temporary approval to use it.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-900 mb-2">2. Smart Selection</h4>
                    <p className="text-green-700">When flash loans need ETH, the system pulls from wallets with amounts closest to the loan size.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-purple-900 mb-2">3. Fair Rewards</h4>
                    <p className="text-purple-700">Only ETH that actually gets lent receives profits - ensuring fair distribution.</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : (
          /* Marketing Content - Shown when not connected */
          <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
              <div className="container mx-auto px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    Trustless Flash Loans
                    <span className="block text-blue-600">Zero Permanent Risk</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    The world's first immutable flash loan network where your ETH stays in your wallet.
                    Earn from MEV opportunities with microsecond risk exposure.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <appkit-connect-button />

                    <a
                      href="https://arbiscan.io/address/0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                      <span>View Contract</span>
                    </a>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-white">
              <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">How FlashBank Works</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    A revolutionary approach where your ETH stays in your wallet while earning from flash loans
                  </p>
                </div>

                {/* Simple Process Diagram */}
                <div className="mb-16">
                  <div className="grid md:grid-cols-3 gap-8 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="bg-blue-50 rounded-lg p-8"
                    >
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Keep Your ETH</h3>
                      <p className="text-gray-600">
                        Your ETH stays in your wallet. You approve FlashBank to temporarily use it for flash loans.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="bg-green-50 rounded-lg p-8"
                    >
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Smart Selection</h3>
                      <p className="text-gray-600">
                        When a flash loan needs ETH, FlashBank pulls from wallets with amounts closest to the loan size.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="bg-purple-50 rounded-lg p-8"
                    >
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Coins className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Earn & Return</h3>
                      <p className="text-gray-600">
                        Only ETH that gets lent receives profits. Your original ETH is returned immediately after the flash loan.
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Benefits for Both Sides */}
                <div className="grid md:grid-cols-2 gap-12">
                  {/* For Lenders */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Users className="h-6 w-6 text-blue-600 mr-3" />
                      For ETH Holders (Lenders)
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: Shield,
                          title: "Zero Permanent Risk",
                          desc: "Your ETH only leaves your wallet during flash loan execution - typically microseconds"
                        },
                        {
                          icon: Clock,
                          title: "Capital Efficiency",
                          desc: "Your ETH can earn yield elsewhere while still participating in flash loans"
                        },
                        {
                          icon: Target,
                          title: "Fair Participation",
                          desc: "Only ETH that gets lent receives profits - no free-riding from inactive participants"
                        },
                        {
                          icon: Lock,
                          title: "Full Control",
                          desc: "Pause, resume, or adjust your participation anytime with simple approvals"
                        }
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <benefit.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                            <p className="text-gray-600 text-sm">{benefit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* For Borrowers */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Zap className="h-6 w-6 text-green-600 mr-3" />
                      For MEV Traders (Borrowers)
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: DollarSign,
                          title: "Lower Borrowing Costs",
                          desc: "Competitive fees compared to traditional protocols"
                        },
                        {
                          icon: TrendingUp,
                          title: "Higher Profits",
                          desc: "Lower borrowing costs mean higher net returns on arbitrage opportunities"
                        },
                        {
                          icon: Coins,
                          title: "No Capital Required",
                          desc: "Access flash loans without upfront capital - use committed liquidity instead"
                        },
                        {
                          icon: CheckCircle,
                          title: "Immutable & Trustless",
                          desc: "Contract cannot be changed or rug-pulled, providing maximum security"
                        }
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <benefit.icon className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                            <p className="text-gray-600 text-sm">{benefit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Network Stats */}
            <section className="py-20 bg-gray-50">
              <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Network Statistics</h2>
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">0 ETH</div>
                    <div className="text-gray-600">Total Committed Liquidity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">0 ETH</div>
                    <div className="text-gray-600">Total Profits Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
                    <div className="text-gray-600">Active Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">0.02%</div>
                    <div className="text-gray-600">Flash Loan Fee</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Instructions & Statistics */}
            <section id="instructions" className="py-20 bg-white">
              <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">📚 Instructions & Statistics</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Complete guide to using FlashBank and real-time statistics for each supported network
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-16">
                  {/* Instructions */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
                      How to Use FlashBank
                    </h3>
                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-3">1. Connect Your Wallet</h4>
                        <p className="text-blue-700 text-sm">
                          Use MetaMask, WalletConnect, or any supported wallet to connect to FlashBank.
                          Make sure you're on the correct network (Arbitrum, Ethereum, or Base).
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-6">
                        <h4 className="font-semibold text-green-900 mb-3">2. Approve Access</h4>
                        <p className="text-green-700 text-sm">
                          Grant FlashBank permission to temporarily use your ETH for flash loans.
                          Your ETH stays in your wallet - only used during loan execution.
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-6">
                        <h4 className="font-semibold text-purple-900 mb-3">3. Set Commitment (Optional)</h4>
                        <p className="text-purple-700 text-sm">
                          Set a maximum ETH limit or leave as "Auto" for unlimited participation.
                          You can change this anytime.
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-6">
                        <h4 className="font-semibold text-orange-900 mb-3">4. Start Earning</h4>
                        <p className="text-orange-700 text-sm">
                          Your ETH will be used for flash loans when needed. Earn fees proportional
                          to the amount lent. Withdraw profits anytime.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Network Statistics */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
                      Network Statistics
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(CHAIN_CONFIGS).map(([chainIdStr, config]) => {
                        const statsChainId = Number(chainIdStr);
                        const isCurrentChain = statsChainId === chainId;
                        return (
                          <div key={chainIdStr} className={`border rounded-lg p-4 ${
                            isCurrentChain ? `border-${config.color}-200 bg-${config.color}-50` : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className={`font-semibold flex items-center ${
                                isCurrentChain ? `${COLOR_CLASSES[config.color].text800}` : 'text-gray-700'
                              }`}>
                                {config.icon} {config.name}
                              </h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isCurrentChain
                                  ? `${COLOR_CLASSES[config.color].bg100} ${COLOR_CLASSES[config.color].text800}`
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {isCurrentChain ? 'Current' : 'Switch'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Total Committed:</span>
                                <div className={`font-semibold ${
                                  isCurrentChain ? `${COLOR_CLASSES[config.color].text700}` : 'text-gray-700'
                                }`}>
                                  {statsChainId === arbitrum.id ? poolStats.totalCommitted : '0.00'} ETH
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Active Providers:</span>
                                <div className={`font-semibold ${
                                  isCurrentChain ? `${COLOR_CLASSES[config.color].text700}` : 'text-gray-700'
                                }`}>
                                  {statsChainId === arbitrum.id ? poolStats.numProviders : '0'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Profits:</span>
                                <div className={`font-semibold ${
                                  isCurrentChain ? `${COLOR_CLASSES[config.color].text700}` : 'text-gray-700'
                                }`}>
                                  {statsChainId === arbitrum.id ? poolStats.totalProfits : '0.00'} ETH
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Flash Loan Fee:</span>
                                <div className={`font-semibold ${
                                  isCurrentChain ? `${COLOR_CLASSES[config.color].text700}` : 'text-gray-700'
                                }`}>
                                  0.02%
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <a
                                href={config.explorerUrl + '/address/' + config.flashbankAddress}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-xs hover:underline ${
                                  isCurrentChain ? `${COLOR_CLASSES[config.color].text600}` : 'text-gray-500'
                                }`}
                              >
                                View Contract →
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Key Benefits Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Why Choose FlashBank?</h3>
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-blue-900 mb-2">Zero Permanent Risk</h4>
                      <p className="text-blue-700 text-sm">ETH only leaves wallet during flash loan execution</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-green-900 mb-2">Competitive Returns</h4>
                      <p className="text-green-700 text-sm">Earn from flash loan fees with capital efficiency</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-purple-900 mb-2">Full Control</h4>
                      <p className="text-purple-700 text-sm">Pause, resume, or withdraw anytime</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Wallet Connection Help */}
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Wallet Connection Help</h2>
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-600 mb-6">
                    ConnectKit automatically detects and supports modern wallets:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                      <strong className="text-indigo-700">🎯 Modern Wallets</strong>
                      <p className="text-indigo-600 mt-2">
                        <strong>Keplr, Vultisig, MetaMask</strong>, and more
                      </p>
                      <p className="text-xs text-indigo-500 mt-1">Auto-detected by ConnectKit</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <strong className="text-blue-700">💼 Coinbase Wallet</strong>
                      <p className="text-blue-600 mt-2">Mobile app or browser extension</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <strong className="text-green-700">📱 Mobile Wallets</strong>
                      <p className="text-green-600 mt-2">Trust, Rainbow, Ledger, and more</p>
                      <p className="text-xs text-green-500 mt-1">Via WalletConnect (optional setup)</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <strong className="text-purple-700">🔧 Seamless Experience</strong>
                      <p className="text-purple-600 mt-2">Modern wallet connection without manual detection</p>
                    </div>
                </div>
              </div>
            </div>
          </section>
          </>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold">FlashBank.net</span>
              </div>
              <p className="text-gray-400">Revolutionary trustless flash loan network</p>
          </div>
          
          <div className="flex justify-center space-x-8 mb-8">
              <a href="#instructions" className="text-gray-400 hover:text-white transition-colors">Instructions</a>
              <a href="https://github.com/flashbank-net" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
              <a href="https://docs.flashbank.net" className="text-gray-400 hover:text-white transition-colors">Docs</a>
              <a href="https://twitter.com/FlashBankNet" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="https://discord.gg/flashbank" className="text-gray-400 hover:text-white transition-colors">Discord</a>
          </div>
          
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400">&copy; 2025 FlashBank.net. Built for the DeFi community.</p>
              <p className="text-sm mt-2 text-gray-500">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Smart contracts involve risk. Do your own research.
            </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
