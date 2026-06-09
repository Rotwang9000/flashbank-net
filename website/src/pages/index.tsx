import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import { useAppKitAccount } from '@reown/appkit/library/react';
import { useChainId, useSwitchChain, usePublicClient, useWalletClient, useDisconnect } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';
import { Zap, Repeat, Shield, ShieldOff, PauseCircle, PlayCircle, ArrowRightCircle, ArrowRight, Coins, ExternalLink } from 'lucide-react';
import { useIsMounted } from '../hooks/useIsMounted';
import Nav from '../components/Nav';
import SiteFooter from '../components/SiteFooter';

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

	const networkConfig = NETWORKS[chainId as keyof typeof NETWORKS] || NETWORKS[1];
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
			} as any);

			// Get actual available liquidity by checking provider balances
			const providerAddresses = await publicClient.readContract({
				address: networkConfig.router as `0x${string}`,
				abi: ROUTER_ABI,
				functionName: 'getProviders',
				args: [selectedToken.address]
			} as any) as `0x${string}`[];

			let actualCommitted = 0n;
			for (const provider of providerAddresses) {
				const info = await publicClient.readContract({
					address: networkConfig.router as `0x${string}`,
					abi: ROUTER_ABI,
					functionName: 'getProviderInfo',
					args: [selectedToken.address, provider]
				} as any);
				const limit = info[0] as bigint;
				const paused = info[3] as boolean;
				if (!paused && limit > 0n) {
					const balance = await publicClient.readContract({
						address: selectedToken.address as `0x${string}`,
						abi: ERC20_ABI,
						functionName: 'balanceOf',
						args: [provider]
					} as any) as bigint;
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
			} as any);
			setQuoteFee(ethers.formatEther(fee as bigint));
		} catch {
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
			} as any);
			setWethBalance(ethers.formatEther(balanceWei as bigint));

			const signerBalance = await publicClient.getBalance({ address: address as `0x${string}` });
			setEthBalance(ethers.formatEther(signerBalance));

			// Now load router-specific info if available
			if (routerReady && networkConfig.router) {
				const info = await publicClient.readContract({
					address: networkConfig.router as `0x${string}`,
					abi: ROUTER_ABI,
					functionName: 'getProviderInfo',
					args: [selectedToken.address, address as `0x${string}`]
				} as any);
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
				} as any) as bigint;
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
		} catch {
			// State resets handled by the guard clauses above; silent fail is fine here
			// since the next poll or reconnect will retry.
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
			} as any);
			setDemoCounterTotal(ethers.formatEther(stats[0] as bigint));
		} catch {
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
				return await walletClient.writeContract({
					address: contractAddress,
					abi,
					functionName,
					args,
					account: address,
					value
				} as any);
			}
			throw error;
		}
	};

	const handleApproveAndCommit = async () => {
		if (!routerReady) {
			toast.error('Router address not configured for this network');
			return;
		}
		if (!selectedToken || !publicClient) return;

		let limitWei: bigint;
		try {
			limitWei = isUnlimitedCommitment ? ethers.MaxUint256 : ethers.parseEther(limitInput || '0');
		} catch {
			toast.error('Enter a valid limit amount');
			return;
		}

		try {
			// Allowance hygiene: approve exactly what a bounded commitment needs (only unlimited
			// commitments get an unlimited approval), and only when the current allowance is short.
			const desiredAllowance = isUnlimitedCommitment ? ethers.MaxUint256 : limitWei;
			const needsApproval = allowanceWei < desiredAllowance;
			if (needsApproval) {
				await toast.promise(
					(async () => {
						const hash = await safeWrite(selectedToken.address as `0x${string}`, ERC20_ABI, 'approve', [networkConfig.router, desiredAllowance]);
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
					loading: needsApproval ? 'Step 2/2: Setting commitment...' : 'Setting commitment...',
					success: 'Commitment active!',
					error: 'Commitment failed'
				}
			);
		} catch { /* toast.promise already handles user-facing errors */ }
	};

	// One-click allowance revoke: sets the router's allowance to 0 without moving any funds, so it can
	// no longer pull this token. The safest way for a provider to step back from a live router.
	const handleRevokeApproval = async () => {
		if (!routerReady) {
			toast.error('Router address not configured for this network');
			return;
		}
		if (!selectedToken || !publicClient) return;
		try {
			await toast.promise(
				(async () => {
					const hash = await safeWrite(selectedToken.address as `0x${string}`, ERC20_ABI, 'approve', [networkConfig.router, 0n]);
					await publicClient.waitForTransactionReceipt({ hash });
					await loadAccountState();
					await refreshPoolStats();
				})(),
				{
					loading: 'Revoking router approval...',
					success: 'Allowance set to 0 — the router can no longer pull this token',
					error: 'Revoke failed'
				}
			);
		} catch { /* toast.promise already handles user-facing errors */ }
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
		} catch { /* toast.promise already handles user-facing errors */ }
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
		} catch { /* toast.promise already handles user-facing errors */ }
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
		} catch { /* toast.promise already handles user-facing errors */ }
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
			const feeWei = await publicClient.readContract({
				address: networkConfig.router as `0x${string}`,
				abi: ROUTER_ABI,
				functionName: 'quoteFee',
				args: [selectedToken.address, amountWei]
			} as any) as bigint;

			// For fail demo, show the flow immediately before attempting transaction
			if (failModeOverride) {
				setDemoResult({ amount: demoAmount, fee: ethers.formatEther(feeWei) });
				setDemoOutcome('blocked');
				setDemoTxHash('pending'); // Placeholder to show the flow
			}

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
			// For fail demo, if wallet rejected, that's expected
			if (failModeOverride && (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled'))) {
				setDemoError('Your wallet rejected the transaction (expected - it detected the revert). See the flow above for what would have happened.');
				toast.success('Wallet rejected transaction (expected behaviour)');
			} else {
				toast.error(msg);
			}
		} finally {
			setIsRunningDemo(false);
		}
	};

	const networks = Object.entries(NETWORKS).map(([id, cfg]) => ({ id: Number(id), name: cfg.name }));
	const demoReady = parseFloat(poolStats.committed) >= parseFloat(demoAmount || '0') && parseFloat(ethBalance) >= parseFloat(quoteFee);

	return (
		<>
			<Head>
				<title>FlashBank — Flash Loans From Your Wallet</title>
				<meta name="description" content="Provide WETH liquidity directly from your wallet and earn flash loan fees. No deposits. Live on Ethereum, Arbitrum, and Base." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/40">
				<Toaster position="top-right" />

				<Nav
					active="flash"
					networks={networks}
					chainId={chainId}
					onSelectNetwork={(id) => switchChain({ chainId: id })}
					isConnected={isConnected}
					address={address}
					onDisconnect={disconnect}
				/>

				<main className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-6xl">
					{/* Intro — the two products, made obvious */}
					<section className="space-y-5">
						<div className="text-center max-w-2xl mx-auto pt-2">
							<h2 className="text-2xl sm:text-3xl font-bold text-gray-900">One protocol, two ways to flashbank</h2>
							<p className="text-gray-500 mt-2 text-sm sm:text-base">Keep custody of your funds. Pick the tool that fits the job.</p>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							{/* Flash Loans — this page */}
							<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-sm flex flex-col">
								<span className="inline-flex items-center gap-1.5 self-start text-[11px] font-semibold bg-white/15 rounded-full px-2.5 py-1 mb-3"><Zap className="h-3.5 w-3.5" /> You&apos;re here</span>
								<h3 className="text-xl font-bold mb-1.5">Flash Loans</h3>
								<p className="text-blue-50 text-sm mb-4">Atomic, same-transaction liquidity for arbitrage, liquidations and MEV. Lenders commit WETH straight from their wallet — no deposits — and earn a fee on every loan.</p>
								<ul className="space-y-1.5 text-sm text-blue-50/90 mb-5">
									<li>· Repaid in the same transaction, or the whole thing reverts</li>
									<li>· Funds never leave the lender&apos;s wallet until a loan executes</li>
									<li>· 0.02% configurable fee, split with the protocol</li>
								</ul>
								<a href="#flash-tools" className="mt-auto inline-flex items-center gap-1.5 self-start bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
									Provide liquidity or run the demo <ArrowRight className="h-4 w-4" />
								</a>
							</div>
							{/* P2P Loans — separate page */}
							<div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm flex flex-col">
								<span className="inline-flex items-center gap-1.5 self-start text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 mb-3"><Coins className="h-3.5 w-3.5" /> Peer-to-peer</span>
								<h3 className="text-xl font-bold text-gray-900 mb-1.5">P2P Term Loans</h3>
								<p className="text-gray-600 text-sm mb-4">Fixed-term, collateral-backed loans agreed directly between two people. A single flat fee instead of interest, settled purely on time — no pools, no price oracle, no liquidations to watch.</p>
								<ul className="space-y-1.5 text-sm text-gray-500 mb-5">
									<li>· Repay principal + a flat fee before the deadline</li>
									<li>· Miss it and the lender claims the collateral</li>
									<li>· Held by a neutral on-chain escrow</li>
								</ul>
								<a href="/flashbank-loan" className="mt-auto inline-flex items-center gap-1.5 self-start bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
									Open P2P Loans <ArrowRight className="h-4 w-4" />
								</a>
							</div>
						</div>
					</section>

					{/* ---------------- FLASH LOANS ---------------- */}
					<div id="flash-tools" className="pt-4 scroll-mt-20">
						<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							<Zap className="h-5 w-5 text-blue-600" /> Flash Loans
						</h2>
						<p className="text-sm text-gray-500 mt-1">Provide WETH liquidity from your wallet, or run the live Sepolia demo end-to-end.</p>
					</div>

					{/* Contract chip */}
					{networkConfig.router && (
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs">
							<div className="flex items-center gap-2 text-gray-500">
								<Shield className="h-3.5 w-3.5 text-blue-600" />
								<span>Router on {networkConfig.name}</span>
								<span className="font-mono text-gray-700">{formatAddress(networkConfig.router)}</span>
								<span className="hidden sm:inline text-gray-300">·</span>
								<span className="hidden sm:inline">fee {poolStats.feeBps} bps</span>
							</div>
							<a href={`${networkConfig.explorer}/address/${networkConfig.router}#code`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium">
								Verified code <ExternalLink className="h-3 w-3" />
							</a>
						</div>
					)}

					{/* Liquidity overview */}
					<div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
						<h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<Shield className="h-5 w-5 text-blue-500" />
							WETH liquidity overview
						</h3>
						<div className="grid grid-cols-3 gap-6">
							<div>
								<p className="text-sm text-gray-500">Total committed</p>
								<p className="text-2xl font-bold text-gray-900">{poolStats.committed} <span className="text-base font-medium text-gray-400">WETH</span></p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Active providers</p>
								<p className="text-2xl font-bold text-gray-900">{poolStats.providers}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Fee</p>
								<p className="text-2xl font-bold text-gray-900">{poolStats.feeBps} <span className="text-base font-medium text-gray-400">bps</span></p>
							</div>
						</div>
					</div>

					{/* Wallet + provide liquidity */}
					<div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
						<div className="flex flex-wrap gap-3 mb-6">
							{networkConfig.tokens.map((token) => (
								<button
									key={token.key}
									onClick={() => setSelectedTokenKey(token.key)}
									className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${token.key === selectedTokenKey ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
								>
									{token.symbol}
								</button>
							))}
						</div>

						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<h4 className="text-sm font-semibold text-gray-900">Wallet balances</h4>
								<div className="bg-gray-50 rounded-lg p-4 space-y-0.5">
									<p className="text-sm text-gray-500">ETH: {ethBalance}</p>
									<p className="text-sm text-gray-500">WETH: {wethBalance}</p>
									<p className="text-sm text-gray-500">Allowance: {allowance === 'Unlimited' ? 'Unlimited' : `${allowance} WETH`}</p>
								</div>
								<div className="flex gap-4">
									<div className="flex-1">
										<label className="text-sm text-gray-600">Wrap amount (ETH)</label>
										<input value={wrapAmount} onChange={(e) => setWrapAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1" />
									</div>
									<button onClick={handleWrap} className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
										<Repeat className="h-4 w-4" /> Wrap
									</button>
								</div>
								<div className="flex gap-4">
									<div className="flex-1">
										<label className="text-sm text-gray-600">Unwrap amount (WETH)</label>
										<input value={unwrapAmount} onChange={(e) => setUnwrapAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1" />
									</div>
									<button onClick={handleUnwrap} className="self-end bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors">
										<Repeat className="h-4 w-4" /> Unwrap
									</button>
								</div>
							</div>

							<div className="space-y-4">
								<h4 className="text-sm font-semibold text-gray-900">Provide liquidity</h4>
								{allowanceWei === 0n && (
									<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
										<p className="text-sm text-yellow-800">Router not approved yet. The button below will approve and then set your commitment.</p>
									</div>
								)}
								{allowanceWei > 0n && (
									<div className="bg-gray-50 rounded-lg p-4 space-y-1">
										<p className="text-sm text-gray-500">
											Current limit:{' '}
											{providerLimit === 'Unlimited'
												? 'Unlimited'
												: providerLimit === 'Not set'
													? 'Not set (set a limit to start lending)'
													: `${providerLimit} WETH`}
										</p>
										<p className="text-sm text-gray-500">
											Status:{' '}
											{providerRegistered ? (providerPaused ? 'Paused' : 'Active') : 'No commitment yet'}
										</p>
										<p className="text-sm text-gray-500">Expiry: {providerExpiry}</p>
									</div>
								)}
								<div className="flex items-center gap-2">
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
									<label htmlFor="unlimited-checkbox" className="text-sm text-gray-700 cursor-pointer">Unlimited commitment</label>
								</div>
								<div>
									<label className="text-sm text-gray-600">Commitment limit (WETH)</label>
									<input
										value={limitInput}
										onChange={(e) => {
											setLimitInput(e.target.value);
											setLimitDirty(true);
											setIsUnlimitedCommitment(false);
										}}
										placeholder={isUnlimitedCommitment ? 'Unlimited' : 'e.g. 10.0'}
										disabled={isUnlimitedCommitment}
										className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
									/>
								</div>
								{allowanceWei === 0n || limitDirty || !providerRegistered ? (
									<button onClick={handleApproveAndCommit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
										{allowanceWei === 0n ? 'Approve & set commitment' : providerRegistered ? 'Update commitment' : 'Set commitment'}
									</button>
								) : (
									<button onClick={handlePauseResume} className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${providerPaused ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}>
										{providerPaused ? (<><PlayCircle className="h-5 w-5" /> Resume</>) : (<><PauseCircle className="h-5 w-5" /> Pause</>)}
									</button>
								)}
								{allowanceWei > 0n && (
									<button onClick={handleRevokeApproval} className="w-full border border-red-200 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
										<ShieldOff className="h-4 w-4" /> Revoke approval (set allowance to 0)
									</button>
								)}
								<p className="text-xs text-gray-400">
									Approvals are scoped to your commitment — a bounded limit approves that exact amount, not unlimited. Your WETH never leaves your wallet; revoke any time to fully step back.
								</p>
							</div>
						</div>
					</div>

					{/* How it works */}
					<div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
						<h3 className="text-base font-semibold text-gray-900 mb-4">How flash loans work here</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">For lenders (you earn fees)</h4>
								<ol className="space-y-2 text-sm text-gray-700">
									<li className="flex gap-2"><span className="font-semibold text-blue-600">1.</span><span>Wrap some ETH to WETH (or use existing WETH).</span></li>
									<li className="flex gap-2"><span className="font-semibold text-blue-600">2.</span><span>Approve the FlashBankRouter to access your WETH.</span></li>
									<li className="flex gap-2"><span className="font-semibold text-blue-600">3.</span><span>Set a commitment limit (or unlimited) — <strong>WETH stays in your wallet</strong>.</span></li>
									<li className="flex gap-2"><span className="font-semibold text-blue-600">4.</span><span>Earn a fee every time borrowers use your liquidity.</span></li>
									<li className="flex gap-2"><span className="font-semibold text-blue-600">5.</span><span>Pause, change limits, or revoke approval anytime — instant effect.</span></li>
								</ol>
							</div>
							<div>
								<h4 className="font-semibold text-gray-900 mb-2">For borrowers (MEV / arb bots)</h4>
								<ol className="space-y-2 text-sm text-gray-700">
									<li className="flex gap-2"><span className="font-semibold text-purple-600">1.</span><span>Implement the <code className="bg-gray-100 px-1 rounded text-xs">IFlashLoanReceiver</code> interface.</span></li>
									<li className="flex gap-2"><span className="font-semibold text-purple-600">2.</span><span>Call <code className="bg-gray-100 px-1 rounded text-xs">flashLoan(token, amount, toNative, data)</code>.</span></li>
									<li className="flex gap-2"><span className="font-semibold text-purple-600">3.</span><span>The router pulls WETH from providers, all in one tx.</span></li>
									<li className="flex gap-2"><span className="font-semibold text-purple-600">4.</span><span>Your contract receives WETH or native ETH.</span></li>
									<li className="flex gap-2"><span className="font-semibold text-purple-600">5.</span><span>Run your arbitrage / MEV logic.</span></li>
									<li className="flex gap-2"><span className="font-semibold text-purple-600">6.</span><span>Repay principal + fee, or the entire tx reverts.</span></li>
								</ol>
							</div>
						</div>
						<div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
							<p className="text-sm text-blue-900">
								<strong>Key difference:</strong> traditional flash-loan protocols make you <em>deposit</em> funds into their contract.
								FlashBank lets you <strong>keep WETH in your own wallet</strong> and just approve the router — full custody until the moment a loan executes.
							</p>
						</div>
					</div>

					{/* Demo */}
					<div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
						<h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<ArrowRightCircle className="h-5 w-5 text-purple-500" />
							Demo flash loan
						</h3>
						<div className="grid md:grid-cols-2 gap-4 mb-4">
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<h4 className="font-semibold text-green-900 mb-2">Success demo</h4>
								<p className="text-sm text-green-800">
									Borrows WETH from the pool → unwraps to ETH → passes through the counter (proving you used others&apos; funds) → proves funds on-chain → repays the router. Transaction succeeds.
								</p>
							</div>
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<h4 className="font-semibold text-red-900 mb-2">Fail demo</h4>
								<p className="text-sm text-red-800 mb-2">
									Borrows WETH → unwraps → passes through the counter → attempts to keep the funds. The router detects the missing repayment and <strong>reverts the entire transaction</strong>. Funds are safe.
								</p>
								<p className="text-xs text-red-700 italic">
									Most wallets reject this before sending because they simulate it and detect the revert. If your wallet blocks it, that&apos;s expected. <a href="https://sepolia.etherscan.io/tx/0xd721f1d04f0c2662542c8c3fddd37ee28020606000ea22e2b356ba22299301dd" target="_blank" rel="noopener noreferrer" className="underline">See example test transaction</a>.
								</p>
							</div>
						</div>
						{networkConfig.demoCounter && (
							<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-semibold text-purple-900">Demo counter</p>
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
							<p className="text-sm font-semibold text-blue-900 mb-2">Demo requirements</p>
							<div className="space-y-1 text-sm text-blue-800">
								<div className="flex items-center gap-2">
									<span>{parseFloat(poolStats.committed) >= parseFloat(demoAmount || '0') ? '✓' : '✗'}</span>
									<span>Pool has ≥ {demoAmount} WETH committed (current: {formatEth(poolStats.committed, 4)} WETH)</span>
								</div>
								<div className="flex items-center gap-2">
									<span>{parseFloat(ethBalance) >= parseFloat(quoteFee) ? '✓' : '✗'}</span>
									<span>You have ≥ {quoteFee} ETH for the fee</span>
								</div>
							</div>
							<p className="text-xs text-blue-700 mt-2 italic">The demo borrows from the pool, not your personal commitment.</p>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<label className="text-sm text-gray-600">Amount (ETH)</label>
								<input value={demoAmount} onChange={(e) => setDemoAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1" />
								<p className="text-xs text-gray-500 mt-2">Estimated fee: {quoteFee} ETH</p>
							</div>
							<div className="flex items-end gap-2">
								<button
									onClick={() => handleRunDemo(false)}
									disabled={isRunningDemo || !demoReady}
									className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
									title={!demoReady ? 'Check requirements above' : 'Borrow, prove funds, and repay successfully'}
								>
									{isRunningDemo && !demoFailMode ? 'Running...' : 'Run demo (success)'}
								</button>
								<button
									onClick={() => handleRunDemo(true)}
									disabled={isRunningDemo || !demoReady}
									className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
									title={!demoReady ? 'Check requirements above' : 'Attempt to steal funds — the transaction will revert'}
								>
									{isRunningDemo && demoFailMode ? 'Running...' : 'Run demo (fail)'}
								</button>
							</div>
						</div>
						{(demoTxHash || demoOutcome === 'blocked') && (
							<div className="mt-4 space-y-4">
								{demoTxHash && demoTxHash !== 'pending' && (
									<div className="bg-gray-50 rounded-lg p-4">
										<p className="text-sm text-gray-600">
											Tx:{' '}
											<a href={`${networkConfig.explorer}/tx/${demoTxHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
												{demoTxHash.slice(0, 10)}...{demoTxHash.slice(-8)}
											</a>
										</p>
										{demoResult && (
											<p className="text-sm text-gray-600 mt-2">Amount {demoResult.amount} ETH · Fee {demoResult.fee} ETH</p>
										)}
									</div>
								)}
								{demoTxHash === 'pending' && demoOutcome === 'blocked' && (
									<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
										<p className="text-sm text-yellow-800 font-semibold mb-1">Wallet simulation detected the revert</p>
										<p className="text-xs text-yellow-700">
											Most wallets reject this transaction before sending. If yours does, that&apos;s working as intended. The flow below shows what would happen if the transaction were sent.
										</p>
										{demoResult && (
											<p className="text-xs text-yellow-700 mt-2">Attempted: {demoResult.amount} ETH · Fee: {demoResult.fee} ETH</p>
										)}
									</div>
								)}
								<div className="bg-white border-2 border-gray-200 rounded-lg p-4">
									<p className="text-sm font-semibold text-gray-900 mb-3">Transaction flow</p>
									<div className="flex flex-col gap-2 text-sm">
										<div className="flex items-center gap-2">
											<span className="text-2xl">💰</span>
											<a href={`${networkConfig.explorer}/address/${networkConfig.router}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">Pool providers&apos; WETH</a>
											<span className="text-gray-400">→</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-2xl">📦</span>
											<a href={`${networkConfig.explorer}/address/${networkConfig.router}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">FlashBank Router (unwrap)</a>
											<span className="text-gray-400">→</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-2xl">🤖</span>
											<a href={`${networkConfig.explorer}/address/${networkConfig.demoBorrower}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">Demo borrower (receives ETH)</a>
											<span className="text-gray-400">→</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-2xl">🔢</span>
											<a href={`${networkConfig.explorer}/address/${networkConfig.demoCounter}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">Counter (proves you used {demoResult?.amount} ETH)</a>
											<span className="text-gray-400">→</span>
										</div>
										{demoOutcome === 'success' && (
											<>
												<div className="flex items-center gap-2">
													<span className="text-2xl">✅</span>
													<a href={`${networkConfig.explorer}/address/${networkConfig.proofSink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">Proof (refunds ETH)</a>
													<span className="text-gray-400">→</span>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-2xl">💸</span>
													<span className="text-green-600 font-semibold flex-1">Repaid to router + fee</span>
													<span className="text-green-600">✓</span>
												</div>
											</>
										)}
										{demoOutcome === 'blocked' && (
											<>
												<div className="flex items-center gap-2">
													<span className="text-2xl">🚫</span>
													<a href={`${networkConfig.explorer}/address/${networkConfig.proofSink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex-1">Proof (keeps ETH — theft attempt)</a>
													<span className="text-red-600">✗</span>
												</div>
												<div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-2">
													<span className="text-2xl">⛔</span>
													<span className="text-red-600 font-semibold flex-1">Router detected missing repayment → revert</span>
												</div>
												<p className="text-xs text-red-700 italic mt-2">All state changes rolled back. Providers&apos; WETH never left their wallets.</p>
											</>
										)}
										{demoOutcome === 'none' && (
											<p className="text-xs text-gray-500 italic">Run a demo to visualise the full flow.</p>
										)}
									</div>
								</div>
								{demoError && (<p className="text-sm text-red-600">{demoError}</p>)}
							</div>
						)}
					</div>
				</main>

				<SiteFooter />
			</div>
		</>
	);
}
