import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import { useAppKitAccount } from '@reown/appkit/library/react';
import { useChainId, useSwitchChain, usePublicClient, useWalletClient, useDisconnect } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';
import { Zap, Repeat, Shield, PauseCircle, PlayCircle, ArrowRightCircle, BookOpen, Code, ExternalLink } from 'lucide-react';
import { useIsMounted } from '../hooks/useIsMounted';

const NETWORKS = {
	1: {
    name: 'Ethereum',
		rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://cloudflare-eth.com',
		router: process.env.NEXT_PUBLIC_MAINNET_ROUTER_ADDRESS || '',
		explorer: 'https://etherscan.io',
    color: 'purple',
		tokens: [
			{
				key: 'weth',
				name: 'Wrapped Ether',
				symbol: 'WETH',
				address: process.env.NEXT_PUBLIC_MAINNET_WETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
				decimals: 18,
				supportsPermit: true
			}
		],
		demoBorrower: process.env.NEXT_PUBLIC_MAINNET_DEMO_BORROWER_ADDRESS || '',
		proofSink: process.env.NEXT_PUBLIC_MAINNET_PROOF_SINK_ADDRESS || '',
		demoCounter: process.env.NEXT_PUBLIC_MAINNET_DEMO_COUNTER_ADDRESS || ''
	},
	8453: {
    name: 'Base',
		rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
		router: process.env.NEXT_PUBLIC_BASE_ROUTER_ADDRESS || '',
		explorer: 'https://basescan.org',
		color: 'blue',
		tokens: [
			{
				key: 'weth',
				name: 'Wrapped Ether',
				symbol: 'WETH',
				address: process.env.NEXT_PUBLIC_BASE_WETH_ADDRESS || '0x4200000000000000000000000000000000000006',
				decimals: 18,
				supportsPermit: true
			}
		],
		demoBorrower: process.env.NEXT_PUBLIC_BASE_DEMO_BORROWER_ADDRESS || '',
		proofSink: process.env.NEXT_PUBLIC_BASE_PROOF_SINK_ADDRESS || '',
		demoCounter: process.env.NEXT_PUBLIC_BASE_DEMO_COUNTER_ADDRESS || ''
	},
	42161: {
		name: 'Arbitrum',
		rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
		router: process.env.NEXT_PUBLIC_ARBITRUM_ROUTER_ADDRESS || '',
		explorer: 'https://arbiscan.io',
		color: 'green',
		tokens: [
			{
				key: 'weth',
				name: 'Wrapped Ether',
				symbol: 'WETH',
				address: process.env.NEXT_PUBLIC_ARBITRUM_WETH_ADDRESS || '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
				decimals: 18,
				supportsPermit: true
			}
		],
		demoBorrower: process.env.NEXT_PUBLIC_ARBITRUM_DEMO_BORROWER_ADDRESS || '',
		proofSink: process.env.NEXT_PUBLIC_ARBITRUM_PROOF_SINK_ADDRESS || '',
		demoCounter: process.env.NEXT_PUBLIC_ARBITRUM_DEMO_COUNTER_ADDRESS || ''
	},
	11155111: {
		name: 'Sepolia',
		rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
		router: process.env.NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS || '',
		explorer: 'https://sepolia.etherscan.io',
		color: 'yellow',
		tokens: [
			{
				key: 'weth',
				name: 'Wrapped Ether',
				symbol: 'WETH',
				address: process.env.NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS || '0xdd13E55209Fd76AfE204dBda4007C227904f0a81',
				decimals: 18,
				supportsPermit: false
			}
		],
		demoBorrower: process.env.NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS || '',
		proofSink: process.env.NEXT_PUBLIC_SEPOLIA_PROOF_SINK_ADDRESS || '',
		demoCounter: process.env.NEXT_PUBLIC_SEPOLIA_DEMO_COUNTER_ADDRESS || ''
	}
} as const;

const ROUTER_ABI = [
	{
		inputs: [
			{ internalType: 'address', name: 'token', type: 'address' },
			{ components: [
				{ internalType: 'bool', name: 'enabled', type: 'bool' },
				{ internalType: 'bool', name: 'supportsPermit', type: 'bool' },
				{ internalType: 'uint16', name: 'feeBps', type: 'uint16' },
				{ internalType: 'uint256', name: 'maxFlashLoan', type: 'uint256' },
				{ internalType: 'address', name: 'wrapper', type: 'address' }
			], internalType: 'struct FlashBankRouter.TokenConfig', name: 'config', type: 'tuple' }
		],
		name: 'setTokenConfig',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'token', type: 'address' },
			{ internalType: 'uint256', name: 'limit', type: 'uint256' },
			{ internalType: 'uint48', name: 'expiry', type: 'uint48' },
			{ internalType: 'bool', name: 'paused', type: 'bool' }
		],
		name: 'setCommitment',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'token', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' }
		],
		name: 'quoteFee',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'token', type: 'address' },
			{ internalType: 'address', name: 'provider', type: 'address' }
		],
		name: 'getProviderInfo',
		outputs: [
			{ internalType: 'uint256', name: 'limit', type: 'uint256' },
			{ internalType: 'uint256', name: 'inUse', type: 'uint256' },
			{ internalType: 'uint48', name: 'expiry', type: 'uint48' },
			{ internalType: 'bool', name: 'paused', type: 'bool' },
			{ internalType: 'bool', name: 'registered', type: 'bool' }
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
		name: 'getTokenStats',
		outputs: [
			{ internalType: 'uint256', name: 'committed', type: 'uint256' },
			{ internalType: 'uint256', name: 'activeProviders', type: 'uint256' },
			{ internalType: 'uint16', name: 'feeBps', type: 'uint16' },
			{ internalType: 'uint256', name: 'maxFlashLoan', type: 'uint256' },
			{ internalType: 'bool', name: 'supportsPermit', type: 'bool' },
			{ internalType: 'uint16', name: 'maxBorrowBps', type: 'uint16' }
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
		name: 'getProviders',
		outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
		stateMutability: 'view',
		type: 'function'
	}
] as const;

const ERC20_ABI = [
	{ inputs: [], name: 'deposit', outputs: [], stateMutability: 'payable', type: 'function' },
	{ inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'withdraw', outputs: [], stateMutability: 'nonpayable', type: 'function' },
	{ inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
	{ inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
	{ inputs: [{ internalType: 'address', name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }
] as const;

const DEMO_BORROWER_ABI = [
	{
		inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
		name: 'runDemo',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
		name: 'runDemoFail',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'payable',
		type: 'function'
	}
] as const;

const DEMO_COUNTER_ABI = [
	{
		inputs: [],
		name: 'getStats',
		outputs: [
			{ internalType: 'uint256', name: 'total', type: 'uint256' },
			{ internalType: 'uint256', name: 'count', type: 'uint256' }
		],
		stateMutability: 'view',
		type: 'function'
	}
] as const;

const FLASHLOAN_EVENT_ABI = [
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'borrower', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'token', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' },
			{ indexed: false, internalType: 'bool', name: 'toNative', type: 'bool' }
		],
		name: 'FlashLoanExecuted',
		type: 'event'
	}
] as const;

const formatEth = (value?: string | bigint | null, decimals = 4) => {
	if (!value) return '0';
	const num = typeof value === 'bigint' ? Number(ethers.formatEther(value)) : Number(value);
	// Check if it's essentially MaxUint256 (unlimited)
	if (num > 1e20) return 'Unlimited';
	return num.toFixed(decimals);
};

const formatAddress = (addr?: string | null) => {
	if (!addr) return '';
	return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function Home() {
  const { address, isConnected } = useAppKitAccount();
  const chainId = useChainId();
	const publicClient = usePublicClient({ chainId });
	const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
	const { disconnect } = useDisconnect();
	const isMounted = useIsMounted();

	const [selectedTokenKey, setSelectedTokenKey] = useState('weth');
	const [providerLimit, setProviderLimit] = useState<string>('0');
	const [providerLimitWei, setProviderLimitWei] = useState<bigint>(0n);
	const [providerPaused, setProviderPaused] = useState(true);
	const [providerExpiry, setProviderExpiry] = useState<string>('None');
	const [providerRegistered, setProviderRegistered] = useState(false);
	const [allowance, setAllowance] = useState('0');
	const [allowanceWei, setAllowanceWei] = useState<bigint>(0n);
	const [wethBalance, setWethBalance] = useState('0');
	const [ethBalance, setEthBalance] = useState('0');
	const [limitInput, setLimitInput] = useState('');
	const [isUnlimitedCommitment, setIsUnlimitedCommitment] = useState(true);
	const [limitDirty, setLimitDirty] = useState(false);
	const [wrapAmount, setWrapAmount] = useState('0.1');
	const [unwrapAmount, setUnwrapAmount] = useState('0.1');
	const [poolStats, setPoolStats] = useState({ committed: '0', providers: '0', feeBps: 0 });
	const [quoteFee, setQuoteFee] = useState('0');
	const [demoAmount, setDemoAmount] = useState('0.1');
	const [isRunningDemo, setIsRunningDemo] = useState(false);
	const [demoTxHash, setDemoTxHash] = useState<string | null>(null);
	const [demoResult, setDemoResult] = useState<{ amount: string; fee: string } | null>(null);
	const [demoFailMode, setDemoFailMode] = useState(false);
	const [demoOutcome, setDemoOutcome] = useState<'none' | 'success' | 'blocked'>('none');
	const [demoError, setDemoError] = useState<string | null>(null);
	const [demoCounterTotal, setDemoCounterTotal] = useState('0');

	const networkConfig = NETWORKS[chainId as keyof typeof NETWORKS] || NETWORKS[11155111];
	const selectedToken = useMemo(() => {
		return networkConfig.tokens.find((token) => token.key === selectedTokenKey) || networkConfig.tokens[0];
	}, [networkConfig, selectedTokenKey]);

  useEffect(() => {
		if (!networkConfig.tokens.find((token) => token.key === selectedTokenKey)) {
			setSelectedTokenKey(networkConfig.tokens[0].key);
		}
	}, [networkConfig, selectedTokenKey]);

	const routerReady = networkConfig.router && selectedToken?.address;

	const refreshPoolStats = useCallback(async () => {
		if (!routerReady || !selectedToken || !networkConfig.router || !publicClient) {
			setPoolStats({ committed: '0', providers: '0', feeBps: 0 });
			setQuoteFee('0');
			return;
		}

		try {
			const stats = await publicClient.readContract({
				address: networkConfig.router as `0x${string}`,
				abi: ROUTER_ABI,
				functionName: 'getTokenStats',
				args: [selectedToken.address]
			});
			
			// Get actual available liquidity by checking provider balances
			const providerAddresses = await publicClient.readContract({
				address: networkConfig.router as `0x${string}`,
				abi: ROUTER_ABI,
				functionName: 'getProviders',
				args: [selectedToken.address]
			}) as `0x${string}`[];

			let actualCommitted = 0n;
			for (const provider of providerAddresses) {
				const info = await publicClient.readContract({
					address: networkConfig.router as `0x${string}`,
					abi: ROUTER_ABI,
					functionName: 'getProviderInfo',
					args: [selectedToken.address, provider]
				});
				const limit = info[0] as bigint;
				const paused = info[3] as boolean;
				if (!paused && limit > 0n) {
					const balance = await publicClient.readContract({
						address: selectedToken.address as `0x${string}`,
						abi: ERC20_ABI,
						functionName: 'balanceOf',
						args: [provider]
					}) as bigint;
					// Available = min(limit, balance)
					actualCommitted += balance < limit ? balance : limit;
				}
			}

      setPoolStats({
				committed: ethers.formatEther(actualCommitted),
				providers: (stats[1] as bigint).toString(),
				feeBps: Number(stats[2])
			});
			const fee = await publicClient.readContract({
				address: networkConfig.router as `0x${string}`,
				abi: ROUTER_ABI,
				functionName: 'quoteFee',
				args: [selectedToken.address, ethers.parseEther(demoAmount || '0')]
			});
			setQuoteFee(ethers.formatEther(fee));
    } catch (error) {
			console.error('Failed to load pool stats', error);
			setPoolStats({ committed: '0', providers: '0', feeBps: 0 });
			setQuoteFee('0');
		}
	}, [routerReady, selectedToken, networkConfig, demoAmount, publicClient]);

	const loadAccountState = useCallback(async () => {
	if (!publicClient || !isMounted || !selectedToken) {
			setProviderLimit('Not set');
			setProviderLimitWei(0n);
			setProviderPaused(true);
			setProviderExpiry('None');
			setProviderRegistered(false);
			setAllowance('0');
			setAllowanceWei(0n);
			setWethBalance('0');
			setEthBalance('0');
			return;
		}

	if (!isConnected || !address) {
			setProviderLimit('Not set');
			setProviderLimitWei(0n);
			setProviderPaused(true);
			setProviderExpiry('None');
			setProviderRegistered(false);
			setAllowance('0');
			setAllowanceWei(0n);
			setWethBalance('0');
			setEthBalance('0');
			return;
		}

		try {
			// Always load ETH and WETH balances first
			const balanceWei = await publicClient.readContract({
				address: selectedToken.address as `0x${string}`,
				abi: ERC20_ABI,
				functionName: 'balanceOf',
				args: [address as `0x${string}`]
			});
			setWethBalance(ethers.formatEther(balanceWei));

			const signerBalance = await publicClient.getBalance({ address: address as `0x${string}` });
			setEthBalance(ethers.formatEther(signerBalance));

			// Now load router-specific info if available
			if (routerReady && networkConfig.router) {
				const info = await publicClient.readContract({
					address: networkConfig.router as `0x${string}`,
					abi: ROUTER_ABI,
					functionName: 'getProviderInfo',
					args: [selectedToken.address, address as `0x${string}`]
				});
				const limitValue = info[0] as bigint;
				const registered = Boolean(info[4]);
				setProviderRegistered(registered);

				if (!registered) {
					setProviderLimit('Not set');
					setProviderLimitWei(0n);
					if (!limitDirty) {
						setIsUnlimitedCommitment(true);
						setLimitInput('');
					}
					setProviderPaused(false);
				} else {
					const isUnlimited = limitValue === ethers.MaxUint256;
					setProviderLimit(isUnlimited ? 'Unlimited' : ethers.formatEther(limitValue));
					setProviderLimitWei(limitValue);
					setProviderPaused(Boolean(info[3]));
					if (!limitDirty) {
						setIsUnlimitedCommitment(isUnlimited);
						setLimitInput(isUnlimited ? '' : ethers.formatEther(limitValue));
					}
				}

				const expiry = info[2] as bigint;
				setProviderExpiry(expiry && expiry > 0n ? new Date(Number(expiry) * 1000).toLocaleString() : 'None');

				const allowanceWeiValue = await publicClient.readContract({
					address: selectedToken.address as `0x${string}`,
					abi: ERC20_ABI,
					functionName: 'allowance',
					args: [address as `0x${string}`, networkConfig.router as `0x${string}`]
				}) as bigint;
				setAllowanceWei(allowanceWeiValue);
				if (allowanceWeiValue === ethers.MaxUint256) {
					setAllowance('Unlimited');
				} else if (allowanceWeiValue === 0n) {
					setAllowance('0');
				} else {
					setAllowance(ethers.formatEther(allowanceWeiValue));
				}
			} else {
				setProviderLimit('Not set');
				setProviderLimitWei(0n);
				setProviderRegistered(false);
				if (!limitDirty) {
					setIsUnlimitedCommitment(true);
					setLimitInput('');
				}
				setProviderPaused(true);
				setProviderExpiry('None');
				setAllowance('0');
				setAllowanceWei(0n);
			}
    } catch (error) {
			console.error('Failed to load account state', error);
		}
	}, [isMounted, isConnected, address, routerReady, selectedToken, networkConfig, publicClient]);

	useEffect(() => {
		refreshPoolStats();
	}, [refreshPoolStats]);

	useEffect(() => {
		loadAccountState();
	}, [loadAccountState]);

	useEffect(() => {
		if (!providerRegistered && !limitDirty) {
			setIsUnlimitedCommitment(true);
			setLimitInput('');
		}
	}, [providerRegistered, limitDirty]);

	const loadDemoCounter = useCallback(async () => {
		if (!publicClient || !networkConfig.demoCounter) {
			setDemoCounterTotal('0');
			return;
		}
		try {
			const stats = await publicClient.readContract({
				address: networkConfig.demoCounter as `0x${string}`,
				abi: DEMO_COUNTER_ABI,
				functionName: 'getStats'
			});
			setDemoCounterTotal(ethers.formatEther(stats[0] as bigint));
		} catch (error) {
			console.error('Failed to load demo counter', error);
			setDemoCounterTotal('0');
		}
	}, [publicClient, networkConfig]);

	useEffect(() => {
		loadDemoCounter();
	}, [loadDemoCounter]);

	const safeWrite = async (
		contractAddress: `0x${string}`,
		abi: any,
		functionName: string,
		args: any[] = [],
		options: { value?: bigint; allowRevert?: boolean } = {}
	) => {
		if (!walletClient || !publicClient || !address) throw new Error('Wallet not ready');
		const { value, allowRevert } = options;
		try {
			const { request } = await publicClient.simulateContract({
				address: contractAddress,
				abi,
				functionName: functionName as any,
				args,
				account: address,
				value
			} as any);
			return await walletClient.writeContract(request);
		} catch (error: any) {
			if (allowRevert) {
				console.warn('Simulation reverted but allowRevert=true, sending tx anyway');
				return await walletClient.writeContract({
					address: contractAddress,
					abi,
					functionName,
					args,
					account: address,
					value
				} as any);
			}
			console.error(error);
			throw error;
		}
	};

	const handleApproveAndCommit = async () => {
		if (!routerReady) {
			toast.error('Router address not configured for this network');
			return;
		}
		if (!selectedToken || !publicClient) return;
		try {
			// If not approved yet, approve first
			if (allowanceWei === 0n) {
				await toast.promise(
					(async () => {
						const hash = await safeWrite(selectedToken.address as `0x${string}`, ERC20_ABI, 'approve', [networkConfig.router, ethers.MaxUint256]);
						await publicClient.waitForTransactionReceipt({ hash });
						await loadAccountState();
					})(),
					{
						loading: 'Step 1/2: Approving router...',
						success: 'Approved! Now setting commitment...',
						error: 'Approval failed'
					}
				);
			}

			// Then set commitment
			let limitWei: bigint;
			try {
				limitWei = isUnlimitedCommitment ? ethers.MaxUint256 : ethers.parseEther(limitInput || '0');
			} catch {
				toast.error('Enter a valid limit amount');
				return;
			}
			const expirySeconds = 0n;
			await toast.promise(
				(async () => {
					const hash = await safeWrite(networkConfig.router as `0x${string}`, ROUTER_ABI, 'setCommitment', [selectedToken.address, limitWei, expirySeconds, false]);
					await publicClient.waitForTransactionReceipt({ hash });
					await loadAccountState();
					await refreshPoolStats();
					setLimitDirty(false);
				})(),
				{
					loading: allowanceWei === 0n ? 'Step 2/2: Setting commitment...' : 'Setting commitment...',
					success: 'Commitment active!',
					error: 'Commitment failed'
				}
			);
		} catch {}
	};

	const handlePauseResume = async () => {
		if (!routerReady) {
			toast.error('Router address not configured for this network');
			return;
		}
		if (!selectedToken || !publicClient) return;
		try {
			const limitWei = providerLimitWei;
			const expirySeconds = 0n;
			const newPausedState = !providerPaused;
			await toast.promise(
				(async () => {
					const hash = await safeWrite(networkConfig.router as `0x${string}`, ROUTER_ABI, 'setCommitment', [selectedToken.address, limitWei, expirySeconds, newPausedState]);
					await publicClient.waitForTransactionReceipt({ hash });
					await loadAccountState();
					await refreshPoolStats();
					setLimitDirty(false);
				})(),
				{
					loading: newPausedState ? 'Pausing...' : 'Resuming...',
					success: newPausedState ? 'Paused' : 'Resumed',
					error: 'Update failed'
				}
			);
		} catch {}
	};

	const handleWrap = async () => {
		if (!selectedToken || !publicClient) return;
		try {
			const amountWei = ethers.parseEther(wrapAmount || '0');
			await toast.promise(
				(async () => {
					const hash = await safeWrite(selectedToken.address as `0x${string}`, ERC20_ABI, 'deposit', [], { value: amountWei });
        await publicClient.waitForTransactionReceipt({ hash });
					await loadAccountState();
				})(),
				{
					loading: 'Wrapping ETH...',
					success: 'Wrapped successfully',
					error: 'Wrap failed'
				}
			);
		} catch {}
	};

	const handleUnwrap = async () => {
		if (!selectedToken || !publicClient) return;
		try {
			const amountWei = ethers.parseEther(unwrapAmount || '0');
			await toast.promise(
				(async () => {
					const hash = await safeWrite(selectedToken.address as `0x${string}`, ERC20_ABI, 'withdraw', [amountWei]);
					await publicClient.waitForTransactionReceipt({ hash });
					await loadAccountState();
				})(),
				{
					loading: 'Unwrapping WETH...',
					success: 'Unwrapped successfully',
					error: 'Unwrap failed'
				}
			);
		} catch {}
	};

	const handleRunDemo = async (failModeOverride: boolean) => {
		setDemoFailMode(failModeOverride);
		setDemoOutcome('none');
		setDemoError(null);
		if (!selectedToken || !networkConfig.demoBorrower || !networkConfig.router || !publicClient) {
			toast.error('Demo not configured for this network');
			return;
		}
		try {
			setIsRunningDemo(true);
			setDemoTxHash(null);
			setDemoResult(null);
			setDemoCounterTotal('0');
			const amountWei = ethers.parseEther(demoAmount || '0');
			const feeWei: bigint = await publicClient.readContract({
				address: networkConfig.router as `0x${string}`,
				abi: ROUTER_ABI,
				functionName: 'quoteFee',
				args: [selectedToken.address, amountWei]
			});

			const fn = failModeOverride ? 'runDemoFail' : 'runDemo';
			const hash = await safeWrite(
				networkConfig.demoBorrower as `0x${string}`,
				DEMO_BORROWER_ABI,
				fn,
				[amountWei],
				{ value: feeWei, allowRevert: failModeOverride }
			);
			setDemoTxHash(hash);

			let receipt;
			try {
				receipt = await publicClient.waitForTransactionReceipt({ hash });
			} catch (err) {
				receipt = await publicClient.getTransactionReceipt({ hash }).catch(() => null);
				if (!receipt) throw err;
			}

			if (receipt.status === 'reverted') {
				if (failModeOverride) {
					setDemoResult({ amount: demoAmount, fee: ethers.formatEther(feeWei) });
					setDemoOutcome('blocked');
					const message = 'FlashLoanFailed (expected) – router blocked the theft attempt.';
					setDemoError(message);
					toast.success('Borrow attempt blocked – funds stayed in the pool');
				} else {
					throw new Error('Demo transaction reverted');
				}
			} else {
				setDemoResult({ amount: demoAmount, fee: ethers.formatEther(feeWei) });
				setDemoOutcome(failModeOverride ? 'blocked' : 'success');
				await loadAccountState();
				await refreshPoolStats();
				await loadDemoCounter();
				toast.success(failModeOverride ? 'Borrow attempt executed and repaid' : 'Demo completed successfully!');
			}
		} catch (error: any) {
			const msg = error?.shortMessage || error?.message || 'Demo failed';
			toast.error(msg);
		} finally {
			setIsRunningDemo(false);
		}
	};

  return (
    <>
      <Head>
				<title>FlashBank Router - WETH Liquidity</title>
				<meta name="description" content="Provide WETH liquidity directly from your wallet and earn flash loan fees." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
			<div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <header className="bg-white border-b border-gray-200">
					<div className="container mx-auto px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
						<div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
							<div>
								<h1 className="text-xl font-bold text-gray-900">FlashBank Router</h1>
								<p className="text-sm text-gray-500">Permit-based WETH commitments (no deposits)</p>
              </div>
                </div>
						<div className="flex flex-wrap gap-2 items-center">
							{Object.entries(NETWORKS).map(([id, cfg]) => (
                    <button
									key={id}
									onClick={() => switchChain({ chainId: Number(id) })}
									className={`px-3 py-1 rounded-full text-sm ${Number(id) === chainId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
								>
									{cfg.name}
                    </button>
							))}
							{isConnected && address ? (
								<div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
									<span className="font-mono">{formatAddress(address)}</span>
                  <button
										onClick={() => disconnect()}
										className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
										Disconnect
                  </button>
                </div>
							) : (
                    <appkit-connect-button />
							)}
                  </div>
              </div>
				</header>

				<main className="container mx-auto px-6 py-8 space-y-8">
					{/* Welcome Banner with Links */}
					<div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
							<div>
								<h2 className="text-2xl font-bold mb-2">🏦 Welcome to FlashBank</h2>
								<p className="text-blue-100 text-sm">
									The only flash loan protocol where <strong>funds stay in your wallet</strong>. No deposits, just approve & commit.
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<a
									href="/guides/lend"
									className="inline-flex items-center gap-1 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
								>
									<BookOpen className="h-4 w-4" />
									Lender Guide
								</a>
								<a
									href="/guides/borrow"
									className="inline-flex items-center gap-1 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
								>
									<Code className="h-4 w-4" />
									Borrower Guide
								</a>
								<a
									href="/security"
									className="inline-flex items-center gap-1 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
								>
									<Shield className="h-4 w-4" />
									Security Audit
								</a>
							</div>
						</div>
					</div>

					{/* Contract Info */}
					{networkConfig.router && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
								<div>
									<p className="text-sm font-semibold text-blue-900 mb-1">📝 FlashBankRouter Contract</p>
									<p className="text-xs text-blue-700 font-mono break-all">{networkConfig.router}</p>
								</div>
								<a
									href={`https://${chainId === 11155111 ? 'sepolia.' : ''}etherscan.io/address/${networkConfig.router}#code`}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
								>
									View on Explorer
									<ExternalLink className="h-3 w-3" />
								</a>
							</div>
						</div>
					)}

					<div className="bg-white rounded-xl shadow p-6 border border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Shield className="h-5 w-5 text-blue-500" />
							WETH Liquidity Overview
						</h2>
						<div className="grid md:grid-cols-3 gap-6">
							<div>
								<p className="text-sm text-gray-500">Total Committed</p>
								<p className="text-2xl font-bold text-gray-900">{poolStats.committed} WETH</p>
                </div>
                  <div>
								<p className="text-sm text-gray-500">Active Providers</p>
								<p className="text-2xl font-bold text-gray-900">{poolStats.providers}</p>
                          </div>
                          <div>
								<p className="text-sm text-gray-500">Fee</p>
								<p className="text-2xl font-bold text-gray-900">{poolStats.feeBps} bps</p>
                          </div>
                        </div>
					</div>

					<div className="bg-white rounded-xl shadow p-6 border border-gray-200">
						<div className="flex flex-wrap gap-3 mb-6">
							{networkConfig.tokens.map((token) => (
								<button
									key={token.key}
									onClick={() => setSelectedTokenKey(token.key)}
									className={`px-4 py-2 rounded-lg text-sm font-medium ${token.key === selectedTokenKey ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
								>
									{token.symbol}
								</button>
							))}
                  </div>

						<div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
								<h3 className="text-base font-semibold text-gray-900">Wallet Balances</h3>
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-500">ETH: {ethBalance}</p>
									<p className="text-sm text-gray-500">WETH: {wethBalance}</p>
									<p className="text-sm text-gray-500">
										Allowance: {allowance === 'Unlimited' ? 'Unlimited' : `${allowance} WETH`}
									</p>
                          </div>
								<div className="flex gap-4">
									<div className="flex-1">
										<label className="text-sm text-gray-600">Wrap Amount (ETH)</label>
										<input value={wrapAmount} onChange={(e) => setWrapAmount(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
                          </div>
									<button onClick={handleWrap} className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
										<Repeat className="h-4 w-4" /> Wrap
									</button>
                        </div>
								<div className="flex gap-4">
									<div className="flex-1">
										<label className="text-sm text-gray-600">Unwrap Amount (WETH)</label>
										<input value={unwrapAmount} onChange={(e) => setUnwrapAmount(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
                    </div>
									<button onClick={handleUnwrap} className="self-end bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
										<Repeat className="h-4 w-4" /> Unwrap
									</button>
                  </div>
                </div>

							<div className="space-y-4">
								<h3 className="text-base font-semibold text-gray-900">Provide Liquidity</h3>
								{allowanceWei === 0n && (
									<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
										<p className="text-sm text-yellow-800">⚠️ Router not approved yet. The button below will approve and then set your commitment.</p>
									</div>
								)}
								{allowanceWei > 0n && (
									<div className="bg-gray-50 rounded-lg p-4 space-y-2">
									<p className="text-sm text-gray-500">
										Current Limit:{' '}
										{providerLimit === 'Unlimited'
											? 'Unlimited'
											: providerLimit === 'Not set'
												? 'Not set (set a limit to start lending)'
												: `${providerLimit} WETH`}
									</p>
									<p className="text-sm text-gray-500">
										Status:{' '}
										{providerRegistered
											? providerPaused
												? '⏸️ Paused'
												: '✓ Active'
											: 'No commitment yet'}
									</p>
										<p className="text-sm text-gray-500">Expiry: {providerExpiry}</p>
									</div>
								)}
								<div className="flex items-center gap-2 mb-2">
									<input 
										type="checkbox" 
										id="unlimited-checkbox"
										checked={isUnlimitedCommitment}
										onChange={(e) => {
											setIsUnlimitedCommitment(e.target.checked);
											setLimitDirty(true);
											if (e.target.checked) setLimitInput('');
										}}
										className="w-4 h-4 text-blue-600 rounded"
									/>
									<label htmlFor="unlimited-checkbox" className="text-sm text-gray-700 cursor-pointer">
										Unlimited commitment
									</label>
								</div>
								<label className="text-sm text-gray-600">Commitment Limit (WETH)</label>
								<input 
									value={limitInput} 
									onChange={(e) => {
										setLimitInput(e.target.value);
										setLimitDirty(true);
										setIsUnlimitedCommitment(false);
									}} 
									placeholder={isUnlimitedCommitment ? "Unlimited" : "e.g. 10.0"}
									disabled={isUnlimitedCommitment}
									className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" 
								/>
								{allowanceWei === 0n || limitDirty || !providerRegistered ? (
									<button onClick={handleApproveAndCommit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
										{allowanceWei === 0n ? 'Approve & Set Commitment' : providerRegistered ? 'Update Commitment' : 'Set Commitment'}
									</button>
								) : (
									<button onClick={handlePauseResume} className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${providerPaused ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'}`}>
										{providerPaused ? (
											<><PlayCircle className="h-5 w-5" /> Resume</>
										) : (
											<><PauseCircle className="h-5 w-5" /> Pause</>
										)}
									</button>
								)}
                  </div>
                  </div>
                </div>

					{/* How It Works */}
					<div className="bg-white rounded-xl shadow p-6 border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">💡 How FlashBank Works</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">For Lenders (You earn fees)</h4>
								<ol className="space-y-2 text-sm text-gray-700">
									<li className="flex gap-2">
										<span className="font-semibold text-blue-600">1.</span>
										<span>Wrap some ETH to WETH (or use existing WETH)</span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-blue-600">2.</span>
										<span>Approve the FlashBankRouter to access your WETH</span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-blue-600">3.</span>
										<span>Set a commitment limit (or unlimited) - <strong>WETH stays in your wallet!</strong></span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-blue-600">4.</span>
										<span>Earn fees every time borrowers use your liquidity</span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-blue-600">5.</span>
										<span>Pause/unpause or change limits anytime - instant effect</span>
									</li>
								</ol>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">For Borrowers (MEV/Arb bots)</h4>
								<ol className="space-y-2 text-sm text-gray-700">
									<li className="flex gap-2">
										<span className="font-semibold text-purple-600">1.</span>
										<span>Implement the <code className="bg-gray-100 px-1 rounded text-xs">IFlashLoanReceiver</code> interface</span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-purple-600">2.</span>
										<span>Call <code className="bg-gray-100 px-1 rounded text-xs">flashLoan(token, amount, toNative, data)</code></span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-purple-600">3.</span>
										<span>Router pulls WETH from providers (all in one tx)</span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-purple-600">4.</span>
										<span>Your contract receives WETH or native ETH</span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-purple-600">5.</span>
										<span>Execute your arbitrage/MEV logic</span>
									</li>
									<li className="flex gap-2">
										<span className="font-semibold text-purple-600">6.</span>
										<span>Repay principal + fee or entire tx reverts</span>
									</li>
								</ol>
							</div>
						</div>
						<div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
							<p className="text-sm text-blue-900">
								<strong>🔐 Key Difference:</strong> Traditional flash loan protocols require you to <em>deposit</em> your funds into their contract. 
								FlashBank lets you <strong>keep WETH in your own wallet</strong> and just approve the router. You maintain full custody until the moment a loan is executed.
							</p>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow p-6 border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<ArrowRightCircle className="h-5 w-5 text-purple-500" />
							Demo Flash Loan
                    </h3>
						<div className="grid md:grid-cols-2 gap-4 mb-4">
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<h4 className="font-semibold text-green-900 mb-2">✓ Success Demo</h4>
								<p className="text-sm text-green-800">
									Borrows WETH from the pool → unwraps to ETH → passes through counter (proving you used others' funds) → proves funds on-chain → repays router. Transaction succeeds.
								</p>
							</div>
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<h4 className="font-semibold text-red-900 mb-2">✗ Fail Demo</h4>
								<p className="text-sm text-red-800">
									Borrows WETH → unwraps → passes through counter → attempts to keep funds by sending to proof sink. Router detects missing repayment and <strong>reverts the entire transaction</strong>. Funds are safe.
								</p>
							</div>
						</div>
						{networkConfig.demoCounter && (
							<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-semibold text-purple-900">Demo Counter</p>
										<p className="text-xs text-purple-700">Total ETH that has passed through the counter</p>
									</div>
									<div className="text-right">
										<p className="text-2xl font-bold text-purple-900">{demoCounterTotal}</p>
										<p className="text-xs text-purple-700">ETH</p>
									</div>
								</div>
							</div>
						)}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
							<p className="text-sm font-semibold text-blue-900 mb-2">Demo Requirements:</p>
							<div className="space-y-1 text-sm text-blue-800">
								<div className="flex items-center gap-2">
									{Number(poolStats.committed) >= Number(demoAmount) ? '✓' : '✗'} 
									<span>Pool has ≥ {demoAmount} WETH committed (current: {formatEth(poolStats.committed, 4)} WETH)</span>
								</div>
								<div className="flex items-center gap-2">
									{Number(ethBalance) >= Number(quoteFee) ? '✓' : '✗'} 
									<span>You have ≥ {quoteFee} ETH for the fee</span>
								</div>
							</div>
							<p className="text-xs text-blue-700 mt-2 italic">Note: The demo borrows from the pool, not your personal commitment</p>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
                  <div>
								<label className="text-sm text-gray-600">Amount (ETH)</label>
								<input value={demoAmount} onChange={(e) => setDemoAmount(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
								<p className="text-xs text-gray-500 mt-2">Estimated Fee: {quoteFee} ETH</p>
                            </div>
							<div className="flex items-end gap-2">
								<button 
									onClick={() => handleRunDemo(false)} 
									disabled={isRunningDemo || Number(poolStats.committed) < Number(demoAmount) || Number(ethBalance) < Number(quoteFee)} 
									className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
									title={Number(poolStats.committed) < Number(demoAmount) || Number(ethBalance) < Number(quoteFee) ? 'Check requirements above' : 'Borrow, prove funds, and repay successfully'}
								>
									{isRunningDemo && !demoFailMode ? 'Running...' : 'Run Demo (Success)'}
								</button>
								<button 
									onClick={() => handleRunDemo(true)} 
									disabled={isRunningDemo || Number(poolStats.committed) < Number(demoAmount) || Number(ethBalance) < Number(quoteFee)} 
									className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
									title={Number(poolStats.committed) < Number(demoAmount) || Number(ethBalance) < Number(quoteFee) ? 'Check requirements above' : 'Attempt to steal funds - transaction will revert'}
								>
									{isRunningDemo && demoFailMode ? 'Running...' : 'Run Demo (Fail)'}
								</button>
							</div>
                              </div>
						{demoTxHash && (
							<>
							<div className="mt-4 space-y-4">
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-600">
										Tx:{' '}
										<a href={`${networkConfig.explorer}/tx/${demoTxHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
											{demoTxHash.slice(0, 10)}...{demoTxHash.slice(-8)}
										</a>
									</p>
									{demoResult && (
										<p className="text-sm text-gray-600 mt-2">
											Amount {demoResult.amount} ETH · Fee {demoResult.fee} ETH
										</p>
									)}
								</div>
								<div className="bg-white border-2 border-gray-200 rounded-lg p-4">
									<p className="text-sm font-semibold text-gray-900 mb-3">Transaction Flow:</p>
									<div className="flex flex-col gap-2 text-sm">
										<div className="flex items-center gap-2">
											<span className="text-2xl">💰</span>
											<a href={`${networkConfig.explorer}/address/${networkConfig.router}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">
												Pool providers' WETH
											</a>
											<span className="text-gray-400">→</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-2xl">📦</span>
											<a href={`${networkConfig.explorer}/address/${networkConfig.router}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">
												FlashBank Router (unwrap)
											</a>
											<span className="text-gray-400">→</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-2xl">🤖</span>
											<a href={`${networkConfig.explorer}/address/${networkConfig.demoBorrower}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">
												Demo Borrower (receives ETH)
											</a>
											<span className="text-gray-400">→</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-2xl">🔢</span>
											<a href={`${networkConfig.explorer}/address/${networkConfig.demoCounter}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">
												Counter (proves you used {demoResult?.amount} ETH)
											</a>
											<span className="text-gray-400">→</span>
										</div>
										{demoOutcome === 'success' && (
											<>
												<div className="flex items-center gap-2">
													<span className="text-2xl">✅</span>
													<a href={`${networkConfig.explorer}/address/${networkConfig.proofSink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">
														Proof (refunds ETH)
													</a>
													<span className="text-gray-400">→</span>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-2xl">💸</span>
													<span className="text-green-600 font-semibold flex-1">Repaid to Router + Fee</span>
													<span className="text-green-600">✓</span>
												</div>
											</>
										)}
										{demoOutcome === 'blocked' && (
											<>
												<div className="flex items-center gap-2">
													<span className="text-2xl">🚫</span>
													<a href={`${networkConfig.explorer}/address/${networkConfig.proofSink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">
														Proof (keeps ETH - theft attempt)
													</a>
													<span className="text-red-600">✗</span>
												</div>
												<div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-2">
													<span className="text-2xl">⛔</span>
													<span className="text-red-600 font-semibold flex-1">Router detected missing repayment → REVERT</span>
												</div>
												<p className="text-xs text-red-700 italic mt-2">
													All state changes rolled back. Providers' WETH never left their wallets.
												</p>
											</>
										)}
										{demoOutcome === 'none' && (
											<p className="text-xs text-gray-500 italic">Run a demo to visualise the full flow.</p>
										)}
									</div>
								</div>
							</div>
							{demoError && (
								<p className="text-sm text-red-600 mt-2">{demoError}</p>
							)}
							</>
						)}
          </div>
          
					<div className="bg-white rounded-xl shadow p-6 border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Guide</h3>
						<ol className="list-decimal list-inside space-y-2 text-gray-700">
							<li>Wrap the ETH amount you wish to make available (WETH stays in your wallet).</li>
							<li>Approve the FlashBank Router once.</li>
							<li>Set your commitment limit and optional expiry. Pause/resume at any time.</li>
							<li>Earn 0.02% (configurable) each time your WETH is pulled into a flash loan.</li>
							<li>Use the demo to verify behaviour on Sepolia before moving to production chains.</li>
						</ol>
          </div>
				</main>

				{/* Footer */}
				<footer className="bg-white border-t border-gray-200 py-8 mt-12">
					<div className="container mx-auto px-6">
						<div className="grid md:grid-cols-3 gap-8">
							<div>
								<h4 className="font-semibold text-gray-900 mb-3">📚 Documentation</h4>
								<ul className="space-y-2 text-sm">
									<li>
										<a href="/guides/lend" className="text-blue-600 hover:text-blue-800">Lender Guide</a>
									</li>
									<li>
										<a href="/guides/borrow" className="text-blue-600 hover:text-blue-800">Borrower Guide</a>
									</li>
									<li>
										<a href="/security" className="text-blue-600 hover:text-blue-800">Security Audit</a>
									</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-3">🔗 Smart Contracts</h4>
								<ul className="space-y-2 text-sm">
									{networkConfig.router && (
										<li>
											<a 
												href={`${networkConfig.explorer}/address/${networkConfig.router}#code`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
											>
												FlashBankRouter
												<ExternalLink className="h-3 w-3" />
											</a>
										</li>
									)}
									{selectedToken && (
										<li>
											<a 
												href={`${networkConfig.explorer}/address/${selectedToken.address}#code`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
											>
												WETH Token
												<ExternalLink className="h-3 w-3" />
											</a>
										</li>
									)}
									<li>
										<a 
											href="https://github.com/your-repo/flashbank-net"
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
										>
											View on GitHub
											<ExternalLink className="h-3 w-3" />
										</a>
									</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-3">ℹ️ About</h4>
								<p className="text-sm text-gray-600 mb-3">
									FlashBank is the first flash loan protocol where liquidity providers maintain full custody of their funds until the moment a loan executes.
								</p>
								<p className="text-xs text-gray-500">
									⚠️ Soft launch on Sepolia. Use at your own risk.
								</p>
							</div>
						</div>
						<div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
							<p>Built with ❤️ for the Ethereum community · No deposits, no custody, no nonsense</p>
						</div>
					</div>
				</footer>
      </div>
    </>
  );
}

