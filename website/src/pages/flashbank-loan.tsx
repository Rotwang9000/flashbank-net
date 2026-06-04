import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import { useAppKitAccount } from '@reown/appkit/library/react';
import { useChainId, useSwitchChain, usePublicClient, useWalletClient, useDisconnect } from 'wagmi';
import toast, { Toaster } from 'react-hot-toast';
import {
	Coins, Clock, ShieldCheck, ArrowLeftRight, ExternalLink, Plus, Wallet, Search,
	ChevronDown, SlidersHorizontal, Check, ArrowRight, Droplets, Timer, Lock, RefreshCw,
	Layers, AlertTriangle, ArrowDown, Sparkles, ListFilter, BookOpen, Rocket, Star
} from 'lucide-react';
import { useIsMounted } from '../hooks/useIsMounted';
import HowItWorks from '../components/HowItWorks';
import Nav from '../components/Nav';
import SiteFooter from '../components/SiteFooter';

// "flashbank" is used here only as a VERB (you *flashbank* a loan). This product is a neutral
// peer-to-peer escrow; it is not a bank and takes no custody as a financial institution.

const PLAYGROUND_CHAIN = 11155111;

const NETWORKS = {
	1: {
		name: 'Ethereum',
		explorer: 'https://etherscan.io',
		p2pLoan: process.env.NEXT_PUBLIC_MAINNET_P2P_LOAN_ADDRESS || '',
		weth: process.env.NEXT_PUBLIC_MAINNET_WETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		isPlayground: false,
		tokens: [
			{ symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, kind: 'eth' },
			{ symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, kind: 'usd' }
		]
	},
	8453: {
		name: 'Base',
		explorer: 'https://basescan.org',
		p2pLoan: process.env.NEXT_PUBLIC_BASE_P2P_LOAN_ADDRESS || '',
		weth: process.env.NEXT_PUBLIC_BASE_WETH_ADDRESS || '0x4200000000000000000000000000000000000006',
		isPlayground: false,
		tokens: [
			{ symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, kind: 'eth' },
			{ symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, kind: 'usd' }
		]
	},
	42161: {
		name: 'Arbitrum',
		explorer: 'https://arbiscan.io',
		p2pLoan: process.env.NEXT_PUBLIC_ARBITRUM_P2P_LOAN_ADDRESS || '',
		weth: process.env.NEXT_PUBLIC_ARBITRUM_WETH_ADDRESS || '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
		isPlayground: false,
		tokens: [
			{ symbol: 'WETH', name: 'Wrapped Ether', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18, kind: 'eth' },
			{ symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, kind: 'usd' }
		]
	},
	11155111: {
		name: 'Sepolia',
		explorer: 'https://sepolia.etherscan.io',
		// Public testnet playground — addresses are not secrets. Override via env if redeployed.
		p2pLoan: process.env.NEXT_PUBLIC_SEPOLIA_P2P_LOAN_ADDRESS || '0x56E6aCB38ccFb82AC158955e8f7Dd2F59a66B607',
		weth: process.env.NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS || '0xdd13E55209Fd76AfE204dBda4007C227904f0a81',
		isPlayground: true,
		tokens: [
			{ symbol: 'fpUSD', name: 'Test USD (faucet)', address: process.env.NEXT_PUBLIC_SEPOLIA_FPUSD_ADDRESS || '0x4aBb056aA5aB39b55039ACAf795Ff9403Fa9760c', decimals: 6, kind: 'usd' },
			{ symbol: 'fpETH', name: 'Test ETH (faucet)', address: process.env.NEXT_PUBLIC_SEPOLIA_FPETH_ADDRESS || '0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5', decimals: 18, kind: 'eth' }
		]
	}
} as const;

type RegToken = { symbol: string; name: string; address: string; decimals: number; kind: string };

const ZERO = '0x0000000000000000000000000000000000000000';

const TOKEN_VISUAL: Record<string, { glyph: string; cls: string }> = {
	eth: { glyph: 'Ξ', cls: 'from-indigo-500 to-violet-600' },
	usd: { glyph: '$', cls: 'from-emerald-500 to-teal-600' },
	btc: { glyph: '₿', cls: 'from-amber-500 to-orange-500' },
	other: { glyph: '•', cls: 'from-slate-400 to-slate-600' }
};

const TEMPLATES = [
	{ id: 'quick', label: 'Quick flip', sub: '7 days · 1% fee', term: 7, grace: 1, fee: 1 },
	{ id: 'standard', label: 'Standard', sub: '30 days · 3% fee', term: 30, grace: 2, fee: 3 },
	{ id: 'long', label: 'Long term', sub: '90 days · 8% fee', term: 90, grace: 3, fee: 8 }
];

// One-off featured-placement spend, expressed as a % of the principal for the quick chips.
const BOOST_PRESETS = [1, 3, 5];
// Interface fee that posting *through flashbank* normally carries; waived during the
// introductory period (the deployed contract runs at 0 bps until we switch it on).
const INTERFACE_FEE_PCT = 0.01;

const LOAN_COMPONENTS = [
	{ internalType: 'address', name: 'creator', type: 'address' },
	{ internalType: 'address', name: 'taker', type: 'address' },
	{ internalType: 'address', name: 'allowedTaker', type: 'address' },
	{ internalType: 'bool', name: 'creatorIsLender', type: 'bool' },
	{ internalType: 'uint8', name: 'status', type: 'uint8' },
	{ internalType: 'address', name: 'principalToken', type: 'address' },
	{ internalType: 'address', name: 'collateralToken', type: 'address' },
	{ internalType: 'uint256', name: 'principal', type: 'uint256' },
	{ internalType: 'uint256', name: 'collateral', type: 'uint256' },
	{ internalType: 'uint256', name: 'repaymentFee', type: 'uint256' },
	{ internalType: 'uint256', name: 'protocolFee', type: 'uint256' },
	{ internalType: 'address', name: 'serviceFeeRecipient', type: 'address' },
	{ internalType: 'uint256', name: 'serviceFee', type: 'uint256' },
	{ internalType: 'uint64', name: 'duration', type: 'uint64' },
	{ internalType: 'uint64', name: 'gracePeriod', type: 'uint64' },
	{ internalType: 'uint64', name: 'offerExpiry', type: 'uint64' },
	{ internalType: 'uint64', name: 'startTime', type: 'uint64' },
	{ internalType: 'bool', name: 'listed', type: 'bool' },
	{ internalType: 'uint256', name: 'boost', type: 'uint256' }
] as const;

const P2P_ABI = [
	{
		inputs: [{
			components: [
				{ internalType: 'bool', name: 'creatorIsLender', type: 'bool' },
				{ internalType: 'address', name: 'allowedTaker', type: 'address' },
				{ internalType: 'address', name: 'principalToken', type: 'address' },
				{ internalType: 'address', name: 'collateralToken', type: 'address' },
				{ internalType: 'uint256', name: 'principal', type: 'uint256' },
				{ internalType: 'uint256', name: 'collateral', type: 'uint256' },
				{ internalType: 'uint256', name: 'repaymentFee', type: 'uint256' },
				{ internalType: 'uint64', name: 'duration', type: 'uint64' },
				{ internalType: 'uint64', name: 'gracePeriod', type: 'uint64' },
				{ internalType: 'uint64', name: 'offerExpiry', type: 'uint64' },
				{ internalType: 'bool', name: 'listed', type: 'bool' },
				{ internalType: 'address', name: 'serviceFeeRecipient', type: 'address' },
				{ internalType: 'uint256', name: 'serviceFee', type: 'uint256' },
				{ internalType: 'uint256', name: 'boost', type: 'uint256' }
			], internalType: 'struct FlashBankP2PLoan.LoanParams', name: 'p', type: 'tuple'
		}],
		name: 'createLoan', outputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function'
	},
	{ inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }], name: 'take', outputs: [], stateMutability: 'nonpayable', type: 'function' },
	{ inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }], name: 'repay', outputs: [], stateMutability: 'nonpayable', type: 'function' },
	{ inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }], name: 'claimDefault', outputs: [], stateMutability: 'nonpayable', type: 'function' },
	{ inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }], name: 'cancel', outputs: [], stateMutability: 'nonpayable', type: 'function' },
	{ inputs: [], name: 'loanCount', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
	{ inputs: [], name: 'protocolFeeBps', outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }], stateMutability: 'view', type: 'function' },
	{
		inputs: [{ internalType: 'uint256', name: 'start', type: 'uint256' }, { internalType: 'uint256', name: 'limit', type: 'uint256' }],
		name: 'getLoansPaged', outputs: [{ components: LOAN_COMPONENTS as any, internalType: 'struct FlashBankP2PLoan.Loan[]', name: 'page', type: 'tuple[]' }], stateMutability: 'view', type: 'function'
	},
	{
		inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
		name: 'quoteTake', outputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], stateMutability: 'view', type: 'function'
	},
	{ inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }], name: 'quoteRepayment', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }
] as const;

const ERC20_ABI = [
	{ inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
	{ inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
	{ inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
	{ inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], stateMutability: 'view', type: 'function' },
	{ inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
	{ inputs: [], name: 'faucet', outputs: [], stateMutability: 'nonpayable', type: 'function' }
] as const;

const STATUS_LABEL = ['None', 'Open', 'Active', 'Repaid', 'Defaulted', 'Cancelled'];
const INPUT_CLS = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

type LoanView = {
	id: number; creator: string; taker: string; allowedTaker: string; creatorIsLender: boolean;
	status: number; principalToken: string; collateralToken: string; principal: bigint; collateral: bigint;
	repaymentFee: bigint; protocolFee: bigint; serviceFeeRecipient: string; serviceFee: bigint;
	duration: bigint; gracePeriod: bigint; offerExpiry: bigint; startTime: bigint; listed: boolean; boost: bigint;
};

type TokenMeta = { symbol: string; decimals: number };
type TokenInfo = { symbol: string; name: string; address: string; decimals: number; kind: string };

const formatAddress = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

const isAddr = (value: string) => {
	try { return ethers.isAddress(value); } catch { return false; }
};

const trimAmount = (s: string, max = 6) => {
	if (!s.includes('.')) return s;
	const [i, d] = s.split('.');
	const dd = d.slice(0, max).replace(/0+$/, '');
	return dd ? `${i}.${dd}` : i;
};

const formatDuration = (seconds: number | bigint) => {
	const s = Number(seconds);
	if (s <= 0) return 'now';
	const days = Math.floor(s / 86400);
	const hours = Math.floor((s % 86400) / 3600);
	const mins = Math.floor((s % 3600) / 60);
	if (days > 0) return `${days}d${hours ? ` ${hours}h` : ''}`;
	if (hours > 0) return `${hours}h${mins ? ` ${mins}m` : ''}`;
	return `${mins}m`;
};

export default function FlashbankLoan() {
	const { address, isConnected } = useAppKitAccount();
	const walletChainId = useChainId();
	const { switchChain } = useSwitchChain();
	const { disconnect } = useDisconnect();
	const isMounted = useIsMounted();

	// View defaults to the live playground so visitors see real offers before connecting.
	const [selectedChainId, setSelectedChainId] = useState<number>(PLAYGROUND_CHAIN);
	useEffect(() => {
		if (isConnected && walletChainId) setSelectedChainId(walletChainId);
	}, [isConnected, walletChainId]);

	const chainId = selectedChainId;
	const publicClient = usePublicClient({ chainId });
	const { data: walletClient } = useWalletClient();

	const networkConfig = NETWORKS[chainId as keyof typeof NETWORKS] || NETWORKS[1];
	const contractAddress = networkConfig.p2pLoan;
	const registry = networkConfig.tokens as readonly RegToken[];
	const ready = Boolean(contractAddress) && Boolean(publicClient);

	const [tab, setTab] = useState<'browse' | 'create' | 'active' | 'how'>('browse');
	const [loans, setLoans] = useState<LoanView[]>([]);
	const [meta, setMeta] = useState<Record<string, TokenMeta>>({});
	const [balances, setBalances] = useState<Record<string, bigint>>({});
	const [protocolBps, setProtocolBps] = useState<number>(0);
	const [loading, setLoading] = useState(false);
	const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
	const [browseFilter, setBrowseFilter] = useState<'all' | 'lend' | 'borrow'>('all');

	const pickKind = (kind: string) => registry.find((t) => t.kind === kind)?.address;
	const defPrincipal = pickKind('usd') || registry[0]?.address || networkConfig.weth;
	const defCollateral = pickKind('eth') || registry[1]?.address || registry[0]?.address || networkConfig.weth;

	// Create form
	const [role, setRole] = useState<'lend' | 'borrow'>('lend');
	const [principalToken, setPrincipalToken] = useState<string>(defPrincipal);
	const [principalAmount, setPrincipalAmount] = useState('');
	const [collateralToken, setCollateralToken] = useState<string>(defCollateral);
	const [collateralAmount, setCollateralAmount] = useState('');
	const [feePct, setFeePct] = useState(2);
	const [termDays, setTermDays] = useState(7);
	const [graceDays, setGraceDays] = useState(1);
	const [boostAmount, setBoostAmount] = useState('');
	const [advanced, setAdvanced] = useState(false);
	const [serviceRecipient, setServiceRecipient] = useState('');
	const [serviceFee, setServiceFee] = useState('');
	const [allowedTaker, setAllowedTaker] = useState('');
	// Posting through our interface always opts into the (currently 0%) interface fee.
	const listed = true;

	useEffect(() => {
		setPrincipalToken(defPrincipal);
		setCollateralToken(defCollateral);
	}, [chainId]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
		return () => clearInterval(t);
	}, []);

	const fetchMeta = useCallback(async (tokens: string[]) => {
		if (!publicClient) return;
		const unique = Array.from(new Set(tokens.map((t) => (t || '').toLowerCase()))).filter((t) => t && t !== ZERO);
		const missing = unique.filter((t) => !meta[t]);
		if (missing.length === 0) return;
		const next: Record<string, TokenMeta> = {};
		for (const token of missing) {
			try {
				const [symbol, decimals] = await Promise.all([
					publicClient.readContract({ address: token as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' } as any) as Promise<string>,
					publicClient.readContract({ address: token as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' } as any) as Promise<number>
				]);
				next[token] = { symbol, decimals: Number(decimals) };
			} catch {
				next[token] = { symbol: formatAddress(token), decimals: 18 };
			}
		}
		setMeta((prev) => ({ ...prev, ...next }));
	}, [publicClient, meta]);

	const fetchBalances = useCallback(async (tokens: string[]) => {
		if (!publicClient || !address) return;
		const unique = Array.from(new Set(tokens.map((t) => (t || '').toLowerCase()))).filter((t) => isAddr(t) && t !== ZERO);
		if (unique.length === 0) return;
		const entries = await Promise.all(unique.map(async (t) => {
			try {
				const b = await publicClient.readContract({ address: t as `0x${string}`, abi: ERC20_ABI, functionName: 'balanceOf', args: [address as `0x${string}`] } as any) as bigint;
				return [t, b] as const;
			} catch {
				return [t, 0n] as const;
			}
		}));
		setBalances((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
	}, [publicClient, address]);

	const refresh = useCallback(async () => {
		if (!ready || !publicClient) { setLoans([]); return; }
		setLoading(true);
		try {
			const count = await publicClient.readContract({
				address: contractAddress as `0x${string}`, abi: P2P_ABI, functionName: 'loanCount'
			} as any) as bigint;
			try {
				const bps = await publicClient.readContract({
					address: contractAddress as `0x${string}`, abi: P2P_ABI, functionName: 'protocolFeeBps'
				} as any) as number;
				setProtocolBps(Number(bps));
			} catch { /* ignore */ }

			const total = Number(count);
			if (total === 0) { setLoans([]); return; }
			const page = await publicClient.readContract({
				address: contractAddress as `0x${string}`, abi: P2P_ABI, functionName: 'getLoansPaged', args: [0n, count]
			} as any) as any[];

			const mapped: LoanView[] = page.map((l, i) => ({
				id: i, creator: l.creator, taker: l.taker, allowedTaker: l.allowedTaker, creatorIsLender: l.creatorIsLender,
				status: Number(l.status), principalToken: l.principalToken, collateralToken: l.collateralToken,
				principal: l.principal, collateral: l.collateral, repaymentFee: l.repaymentFee, protocolFee: l.protocolFee,
				serviceFeeRecipient: l.serviceFeeRecipient, serviceFee: l.serviceFee, duration: l.duration,
				gracePeriod: l.gracePeriod, offerExpiry: l.offerExpiry, startTime: l.startTime, listed: l.listed,
				boost: l.boost ?? 0n
			}));
			setLoans(mapped);
			await fetchMeta(mapped.flatMap((l) => [l.principalToken, l.collateralToken]));
		} catch {
			setLoans([]);
		} finally {
			setLoading(false);
		}
	}, [ready, publicClient, contractAddress, fetchMeta]);

	useEffect(() => { refresh(); }, [refresh]);
	useEffect(() => { fetchMeta([principalToken, collateralToken]); }, [principalToken, collateralToken, fetchMeta]);
	useEffect(() => {
		fetchBalances([principalToken, collateralToken, ...registry.map((t) => t.address)]);
	}, [principalToken, collateralToken, address, chainId, fetchBalances]); // eslint-disable-line react-hooks/exhaustive-deps

	const tokenInfo = useCallback((addr: string): TokenInfo => {
		const a = (addr || '').toLowerCase();
		const reg = registry.find((t) => t.address.toLowerCase() === a);
		if (reg) return reg;
		const m = meta[a];
		return { symbol: m?.symbol || formatAddress(addr), name: 'Custom token', address: addr, decimals: m?.decimals ?? 18, kind: 'other' };
	}, [registry, meta]);

	const fmt = useCallback((amount: bigint, token: string) => {
		const i = tokenInfo(token);
		return `${trimAmount(ethers.formatUnits(amount, i.decimals))} ${i.symbol}`;
	}, [tokenInfo]);

	const balanceNum = useCallback((token: string): number | null => {
		const b = balances[(token || '').toLowerCase()];
		if (b == null) return null;
		try { return Number(ethers.formatUnits(b, tokenInfo(token).decimals)); } catch { return null; }
	}, [balances, tokenInfo]);

	const safeWrite = async (target: `0x${string}`, abi: any, functionName: string, args: any[] = []) => {
		if (!walletClient || !publicClient || !address) throw new Error('Wallet not ready');
		const { request } = await publicClient.simulateContract({ address: target, abi, functionName: functionName as any, args, account: address as `0x${string}` } as any);
		return await walletClient.writeContract(request);
	};

	const ensureAllowance = async (token: string, amount: bigint) => {
		if (!publicClient || !address) throw new Error('Wallet not ready');
		const current = await publicClient.readContract({
			address: token as `0x${string}`, abi: ERC20_ABI, functionName: 'allowance', args: [address as `0x${string}`, contractAddress as `0x${string}`]
		} as any) as bigint;
		if (current >= amount) return;
		const hash = await safeWrite(token as `0x${string}`, ERC20_ABI, 'approve', [contractAddress, ethers.MaxUint256]);
		await publicClient.waitForTransactionReceipt({ hash });
	};

	const decimalsOf = async (token: string): Promise<number> => {
		const reg = registry.find((t) => t.address.toLowerCase() === token.toLowerCase());
		if (reg) return reg.decimals;
		const cached = meta[token.toLowerCase()];
		if (cached) return cached.decimals;
		try {
			const d = await publicClient!.readContract({ address: token as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' } as any) as number;
			return Number(d);
		} catch { return 18; }
	};

	const handleCreate = async () => {
		if (!ready) { toast.error('No contract on this network — switch to Sepolia'); return; }
		if (!isConnected || !address) { toast.error('Connect a wallet first'); return; }
		if (!isAddr(principalToken) || !isAddr(collateralToken)) { toast.error('Pick valid tokens'); return; }
		if (allowedTaker && !isAddr(allowedTaker)) { toast.error('Restricted taker is not a valid address'); return; }
		if (serviceFee && !isAddr(serviceRecipient)) { toast.error('A service fee needs a recipient address'); return; }
		const creatorIsLender = role === 'lend';
		try {
			const [pDec, cDec] = await Promise.all([decimalsOf(principalToken), decimalsOf(collateralToken)]);
			const principal = ethers.parseUnits(principalAmount || '0', pDec);
			const collateral = ethers.parseUnits(collateralAmount || '0', cDec);
			const feeBps = BigInt(Math.round(feePct * 100));
			const fee = (principal * feeBps) / 10000n;
			const svc = serviceFee ? ethers.parseUnits(serviceFee, pDec) : 0n;
			const boost = boostAmount ? ethers.parseUnits(boostAmount, pDec) : 0n;
			if (principal <= 0n || collateral <= 0n) { toast.error('Amounts must be greater than zero'); return; }
			if (svc >= principal) { toast.error('Service fee must be smaller than the principal'); return; }
			const duration = BigInt(Math.round(termDays * 86400));
			const grace = BigInt(Math.round(graceDays * 86400));
			if (duration <= 0n) { toast.error('Term must be at least a fraction of a day'); return; }

			const params = {
				creatorIsLender, allowedTaker: allowedTaker || ZERO, principalToken, collateralToken,
				principal, collateral, repaymentFee: fee, duration, gracePeriod: grace, offerExpiry: 0n,
				listed, serviceFeeRecipient: serviceFee ? serviceRecipient : ZERO, serviceFee: serviceFee ? svc : 0n,
				boost
			};
			// Lender escrows principal (+ interface fee) in the principal token; a borrower escrows
			// collateral. The boost is always paid in the principal token on top, so it may need its
			// own allowance when the creator is a borrower.
			const listingFee = creatorIsLender && listed ? (principal * BigInt(protocolBps)) / 10000n : 0n;

			await toast.promise((async () => {
				if (creatorIsLender) {
					await ensureAllowance(principalToken, principal + listingFee + boost);
				} else {
					await ensureAllowance(collateralToken, collateral);
					if (boost > 0n) await ensureAllowance(principalToken, boost);
				}
				const hash = await safeWrite(contractAddress as `0x${string}`, P2P_ABI, 'createLoan', [params]);
				await publicClient!.waitForTransactionReceipt({ hash });
				await refresh();
				await fetchBalances([principalToken, collateralToken]);
				setPrincipalAmount('');
				setCollateralAmount('');
				setServiceFee('');
				setBoostAmount('');
				setTab('active');
			})(), { loading: 'Posting your offer...', success: 'Offer posted', error: 'Could not post offer' });
		} catch { /* toast.promise surfaces errors */ }
	};

	const handleTake = async (loan: LoanView) => {
		if (!publicClient) return;
		if (!isConnected) { toast.error('Connect a wallet first'); return; }
		try {
			await toast.promise((async () => {
				const [token, amount] = await publicClient.readContract({
					address: contractAddress as `0x${string}`, abi: P2P_ABI, functionName: 'quoteTake', args: [BigInt(loan.id)]
				} as any) as [string, bigint];
				await ensureAllowance(token, amount);
				const hash = await safeWrite(contractAddress as `0x${string}`, P2P_ABI, 'take', [BigInt(loan.id)]);
				await publicClient.waitForTransactionReceipt({ hash });
				await refresh();
				await fetchBalances([loan.principalToken, loan.collateralToken]);
			})(), { loading: 'Accepting offer...', success: 'Loan is now active', error: 'Could not accept offer' });
		} catch { /* handled */ }
	};

	const handleRepay = async (loan: LoanView) => {
		if (!publicClient) return;
		try {
			await toast.promise((async () => {
				const owed = await publicClient.readContract({
					address: contractAddress as `0x${string}`, abi: P2P_ABI, functionName: 'quoteRepayment', args: [BigInt(loan.id)]
				} as any) as bigint;
				await ensureAllowance(loan.principalToken, owed);
				const hash = await safeWrite(contractAddress as `0x${string}`, P2P_ABI, 'repay', [BigInt(loan.id)]);
				await publicClient.waitForTransactionReceipt({ hash });
				await refresh();
				await fetchBalances([loan.principalToken, loan.collateralToken]);
			})(), { loading: 'Repaying...', success: 'Repaid — collateral released', error: 'Repayment failed' });
		} catch { /* handled */ }
	};

	const handleSimpleAction = async (loan: LoanView, fn: 'claimDefault' | 'cancel') => {
		if (!publicClient) return;
		const labels = fn === 'claimDefault'
			? { loading: 'Claiming collateral...', success: 'Collateral claimed', error: 'Claim failed' }
			: { loading: 'Cancelling...', success: 'Offer cancelled', error: 'Cancel failed' };
		try {
			await toast.promise((async () => {
				const hash = await safeWrite(contractAddress as `0x${string}`, P2P_ABI, fn, [BigInt(loan.id)]);
				await publicClient.waitForTransactionReceipt({ hash });
				await refresh();
				await fetchBalances([loan.principalToken, loan.collateralToken]);
			})(), labels);
		} catch { /* handled */ }
	};

	const handleFaucet = async (token: string, symbol: string) => {
		if (!publicClient) return;
		if (!isConnected) { toast.error('Connect a wallet first'); return; }
		try {
			await toast.promise((async () => {
				const hash = await safeWrite(token as `0x${string}`, ERC20_ABI, 'faucet', []);
				await publicClient.waitForTransactionReceipt({ hash });
				await fetchBalances([token]);
			})(), { loading: `Minting test ${symbol}...`, success: `Minted 10,000 ${symbol}`, error: 'Faucet failed' });
		} catch { /* handled */ }
	};

	const selectNetwork = (id: number) => {
		setSelectedChainId(id);
		if (isConnected) { try { switchChain({ chainId: id }); } catch { /* ignore */ } }
	};

	const me = (address || '').toLowerCase();
	const openOffers = useMemo(() => loans.filter((l) => l.status === 1), [loans]);
	const browseOffers = useMemo(() => {
		const filtered = openOffers.filter((l) =>
			browseFilter === 'all' ? true : browseFilter === 'lend' ? l.creatorIsLender : !l.creatorIsLender
		);
		// Featured offers (those that paid a boost) rank first, highest spend on top; then newest.
		return filtered.slice().sort((a, b) => (a.boost !== b.boost ? (a.boost > b.boost ? -1 : 1) : b.id - a.id));
	}, [openOffers, browseFilter]);
	const myOpenOffers = useMemo(() => openOffers.filter((l) => l.creator.toLowerCase() === me), [openOffers, me]);
	const myActive = useMemo(() => loans.filter((l) => l.status === 2 && (l.creator.toLowerCase() === me || l.taker.toLowerCase() === me)), [loans, me]);
	const activeCount = myOpenOffers.length + myActive.length;

	// Live deal preview maths
	const pInfo = tokenInfo(principalToken);
	const cInfo = tokenInfo(collateralToken);
	const principalNum = parseFloat(principalAmount) || 0;
	const collateralNum = parseFloat(collateralAmount) || 0;
	const feeAmount = principalNum * (feePct / 100);
	const totalRepay = principalNum + feeAmount;
	const boostNum = parseFloat(boostAmount) || 0;

	const createDisabledReason = !ready ? 'Switch to Sepolia to use the playground'
		: !isConnected ? 'Connect your wallet to post'
			: principalNum <= 0 ? `Enter how much ${pInfo.symbol} to ${role === 'lend' ? 'lend' : 'borrow'}`
				: collateralNum <= 0 ? `Enter the ${cInfo.symbol} collateral`
					: '';

	if (!isMounted) return null;

	return (
		<>
			<Head>
				<title>Flashbank a loan — peer-to-peer, fixed-term</title>
				<meta name="description" content="Flashbank a fixed-term, collateral-backed loan directly with another person. Time-based settlement, a single flat fee, no pools and no price oracle." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40">
				<Toaster position="top-right" />

				<Nav
					active="loans"
					networks={Object.entries(NETWORKS).map(([id, cfg]) => ({ id: Number(id), name: cfg.name }))}
					chainId={chainId}
					onSelectNetwork={(id) => selectNetwork(id)}
					isConnected={isConnected}
					address={address}
					onDisconnect={() => disconnect()}
				/>

				<main className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-6xl">
					{/* Playground ribbon */}
					{networkConfig.isPlayground && (
						<div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 flex items-start gap-2.5">
							<Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
							<p className="text-sm"><strong>Playground</strong> on the Sepolia testnet — free play-money, <strong>no real value</strong>. Mint tokens from the faucet, then try the whole flow. Unaudited demo; never send real assets.</p>
						</div>
					)}

					{/* Hero */}
					<section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white p-6 sm:p-8 shadow-lg">
						<div className="relative z-10 max-w-2xl">
							<h2 className="text-2xl sm:text-3xl font-bold mb-2">Set your terms. Shake hands on-chain.</h2>
							<p className="text-emerald-50 text-sm sm:text-base">
								Repay <strong>principal + one flat fee</strong> before the deadline to redeem your collateral; miss it and the lender claims it.
								Settlement is <strong>time-based only</strong> — no pools, no price oracle, no liquidations to watch.
							</p>
							<div className="mt-4 flex flex-wrap gap-2 text-xs">
								<span className="inline-flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5"><Timer className="h-3.5 w-3.5" /> Time-based settlement</span>
								<span className="inline-flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5"><ArrowLeftRight className="h-3.5 w-3.5" /> Flat fee, not interest</span>
								<span className="inline-flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5"><ShieldCheck className="h-3.5 w-3.5" /> 0% fee — introductory</span>
							</div>
						</div>
						<Coins className="absolute -right-6 -bottom-6 h-44 w-44 text-white/10" />
					</section>

					{/* Contract chip */}
					{contractAddress && (
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs">
							<div className="flex items-center gap-2 text-gray-500">
								<Lock className="h-3.5 w-3.5 text-emerald-600" />
								<span>Escrow on {networkConfig.name}</span>
								<span className="font-mono text-gray-700">{formatAddress(contractAddress)}</span>
								<span className="hidden sm:inline text-gray-300">·</span>
								<span className="hidden sm:inline">interface fee {protocolBps / 100}%{protocolBps === 0 ? ' (introductory)' : ''} · boost to feature</span>
							</div>
							<a href={`${networkConfig.explorer}/address/${contractAddress}#code`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium">
								Verified code <ExternalLink className="h-3 w-3" />
							</a>
						</div>
					)}

					{/* Tabs */}
					<div className="flex justify-center">
						<div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
							<TabButton active={tab === 'browse'} onClick={() => setTab('browse')} icon={<Layers className="h-4 w-4" />} label="Browse offers" count={openOffers.length} />
							<TabButton active={tab === 'create'} onClick={() => setTab('create')} icon={<Plus className="h-4 w-4" />} label="Flashbank a loan" />
							<TabButton active={tab === 'active'} onClick={() => setTab('active')} icon={<Wallet className="h-4 w-4" />} label="Your loans" count={activeCount} />
							<TabButton active={tab === 'how'} onClick={() => setTab('how')} icon={<BookOpen className="h-4 w-4" />} label="How it works" />
						</div>
					</div>

					{!contractAddress && (
						<div className="bg-white border border-amber-200 rounded-xl p-5 text-center">
							<AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
							<p className="text-sm text-gray-700 mb-3">There&apos;s no flashbank loan contract on <strong>{networkConfig.name}</strong> yet.</p>
							<button onClick={() => selectNetwork(PLAYGROUND_CHAIN)} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
								<ArrowRight className="h-4 w-4" /> Go to the Sepolia playground
							</button>
						</div>
					)}

					{/* ---- BROWSE ---- */}
					{tab === 'browse' && contractAddress && (
						<div key="browse" className="fb-fade space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<Segmented
									value={browseFilter}
									onChange={(v) => setBrowseFilter(v as any)}
									options={[
										{ value: 'all', label: 'All', icon: <ListFilter className="h-3.5 w-3.5" /> },
										{ value: 'lend', label: 'Offers to lend' },
										{ value: 'borrow', label: 'Requests to borrow' }
									]}
								/>
								<button onClick={refresh} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700">
									<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Refreshing' : 'Refresh'}
								</button>
							</div>
							{browseOffers.length === 0 ? (
								<EmptyState icon={<Search className="h-7 w-7" />} title="No open offers here yet"
									body="Be the first to post one." action={<button onClick={() => setTab('create')} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Flashbank a loan</button>} />
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{browseOffers.map((l) => (
										<OfferCard key={l.id} loan={l} mine={l.creator.toLowerCase() === me} pInfo={tokenInfo(l.principalToken)} cInfo={tokenInfo(l.collateralToken)}
											fmt={fmt} isConnected={isConnected} onTake={() => handleTake(l)} onCancel={() => handleSimpleAction(l, 'cancel')} />
									))}
								</div>
							)}
						</div>
					)}

					{/* ---- CREATE ---- */}
					{tab === 'create' && contractAddress && (
						<div key="create" className="fb-fade grid grid-cols-1 lg:grid-cols-5 gap-5">
							<div className="lg:col-span-3 space-y-5">
								<Card>
									<Segmented
										value={role}
										onChange={(v) => setRole(v as any)}
										full
										options={[
											{ value: 'lend', label: 'I want to lend', icon: <TrendingUpMini /> },
											{ value: 'borrow', label: 'I want to borrow', icon: <ArrowDown className="h-4 w-4" /> }
										]}
									/>
									<p className="text-xs text-gray-500 mt-2">
										{role === 'lend'
											? 'You deposit the asset to lend. A borrower locks collateral and repays you the fee.'
											: 'You lock collateral and receive the borrowed asset. Repay in time to get your collateral back.'}
									</p>
								</Card>

								<Card title="Start from a template" subtitle="Tap one, then fine-tune below.">
									<div className="grid grid-cols-3 gap-2">
										{TEMPLATES.map((t) => {
											const active = termDays === t.term && graceDays === t.grace && feePct === t.fee;
											return (
												<button key={t.id} onClick={() => { setTermDays(t.term); setGraceDays(t.grace); setFeePct(t.fee); }}
													className={`rounded-xl border p-3 text-left transition-all ${active ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-emerald-300'}`}>
													<div className="text-sm font-semibold text-gray-900">{t.label}</div>
													<div className="text-xs text-gray-500">{t.sub}</div>
												</button>
											);
										})}
									</div>
								</Card>

								<Card title={role === 'lend' ? 'What you lend' : 'What you borrow'}>
									<TokenAmountRow
										label={role === 'lend' ? 'You lend' : 'You want to borrow'}
										tokens={registry} value={principalToken} onSelect={setPrincipalToken}
										info={pInfo} balances={balances} tokenInfo={tokenInfo}
										amount={principalAmount} setAmount={setPrincipalAmount}
										showSlider={role === 'lend'} balance={balanceNum(principalToken)}
									/>
									<div className="flex justify-center my-2"><div className="bg-gray-100 rounded-full p-1.5"><ArrowDown className="h-4 w-4 text-gray-400" /></div></div>
									<TokenAmountRow
										label={role === 'lend' ? 'Borrower locks (collateral)' : 'You lock (collateral)'}
										tokens={registry} value={collateralToken} onSelect={setCollateralToken}
										info={cInfo} balances={balances} tokenInfo={tokenInfo}
										amount={collateralAmount} setAmount={setCollateralAmount}
										showSlider={role === 'borrow'} balance={balanceNum(collateralToken)}
									/>
								</Card>

								<Card title="Terms">
									<RangeRow label="Loan term" value={termDays} min={1} max={90} step={1} onChange={setTermDays} display={`${termDays} day${termDays === 1 ? '' : 's'}`} />
									<div className="h-4" />
									<RangeRow label="Fee" value={feePct} min={0} max={10} step={0.25} onChange={setFeePct}
										display={`${feePct}%${principalNum > 0 ? ` · ${trimAmount(String(feeAmount))} ${pInfo.symbol}` : ''}`} />
								</Card>

								<Card>
									<div className="flex items-center gap-2 mb-1">
										<span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-amber-100 text-amber-600"><Rocket className="h-4 w-4" /></span>
										<h3 className="text-sm font-semibold text-gray-900">Feature on the marketplace <span className="text-gray-400 font-normal">· optional</span></h3>
									</div>
									<p className="text-xs text-gray-500 mb-3">
										Posting is <strong>free right now</strong> (interface fee {protocolBps / 100}%, introductory). Pay a one-off
										<strong> boost</strong> to jump to the top of Browse — offers are ranked by how much they spend. Paid to flashbank on posting; non-refundable.
									</p>
									<div className="flex flex-wrap items-center gap-2">
										<button type="button" onClick={() => setBoostAmount('')}
											className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${boostNum <= 0 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-emerald-300'}`}>None</button>
										{BOOST_PRESETS.map((pct) => {
											const amt = (principalNum * pct) / 100;
											const active = boostNum > 0 && amt > 0 && Math.abs(boostNum - amt) < amt * 1e-6;
											return (
												<button key={pct} type="button" disabled={principalNum <= 0} onClick={() => setBoostAmount(trimAmount(String(amt)))}
													className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium disabled:opacity-40 ${active ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-amber-300'}`}>
													{pct}%{principalNum > 0 ? ` · ${trimAmount(String(amt))} ${pInfo.symbol}` : ''}
												</button>
											);
										})}
									</div>
									<div className="mt-3 flex items-center gap-2">
										<Monogram info={pInfo} className="h-7 w-7 text-xs" />
										<input inputMode="decimal" value={boostAmount} onChange={(e) => setBoostAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.0" className={INPUT_CLS} />
										<span className="text-xs text-gray-500 whitespace-nowrap">{pInfo.symbol} boost</span>
									</div>
									{boostNum > 0 ? (
										<p className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
											<Star className="h-3.5 w-3.5" /> Featured — ranks above non-boosted offers, and above smaller boosts.
										</p>
									) : (
										<p className="mt-2 text-xs text-gray-400">Leave at none to post a normal, free offer.</p>
									)}
								</Card>

								<Disclosure open={advanced} onToggle={() => setAdvanced((v) => !v)} label="Advanced options" hint="grace period, private deals, service fees">
									<div className="space-y-4 pt-1">
										<RangeRow label="Grace period (after the term)" value={graceDays} min={0} max={14} step={1} onChange={setGraceDays} display={graceDays === 0 ? 'none' : `${graceDays} day${graceDays === 1 ? '' : 's'}`} />
										<Field label="Restrict to one taker (private deal)" hint="Leave blank for the open market.">
											<input value={allowedTaker} onChange={(e) => setAllowedTaker(e.target.value)} placeholder="0x… address that may take this offer" className={INPUT_CLS} />
										</Field>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											<Field label="Service fee recipient" hint="e.g. an insurer or escrow agent.">
												<input value={serviceRecipient} onChange={(e) => setServiceRecipient(e.target.value)} placeholder="0x…" className={INPUT_CLS} />
											</Field>
											<Field label={`Service fee (${pInfo.symbol})`} hint="Deducted from the borrower's disbursement.">
												<input value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} placeholder="0" className={INPUT_CLS} />
											</Field>
										</div>
										<p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg p-3">
											Posting here goes <strong>through flashbank</strong>, so the interface fee ({protocolBps / 100}%, currently waived) applies.
											Prefer zero commission? Call the verified contract directly with <code className="text-gray-500">listed=false</code> — the escrow is the same.
										</p>
									</div>
								</Disclosure>
							</div>

							{/* Summary column */}
							<div className="lg:col-span-2">
								<div className="lg:sticky lg:top-20 space-y-4">
									<DealSummary role={role} pInfo={pInfo} cInfo={cInfo} principalNum={principalNum} collateralNum={collateralNum}
										feeAmount={feeAmount} totalRepay={totalRepay} termDays={termDays} graceDays={graceDays} feePct={feePct}
										boostNum={boostNum} interfacePct={protocolBps / 100} />

									<button onClick={handleCreate} disabled={Boolean(createDisabledReason)}
										className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
										{role === 'lend' ? 'Post loan offer' : 'Post borrow request'}
									</button>
									{createDisabledReason && <p className="text-xs text-center text-gray-400 -mt-1">{createDisabledReason}</p>}

									{networkConfig.isPlayground && (
										<Card title="Need test tokens?">
											<div className="flex flex-col gap-2">
												{registry.map((t) => (
													<button key={t.address} onClick={() => handleFaucet(t.address, t.symbol)} disabled={!isConnected}
														className="flex items-center justify-between gap-2 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-100 disabled:opacity-50">
														<span className="inline-flex items-center gap-2"><Droplets className="h-4 w-4" /> Get 10,000 {t.symbol}</span>
														<span className="text-xs text-emerald-600">{balanceNum(t.address) != null ? `bal ${trimAmount(String(balanceNum(t.address)))}` : ''}</span>
													</button>
												))}
											</div>
										</Card>
									)}
								</div>
							</div>
						</div>
					)}

					{/* ---- ACTIVE ---- */}
					{tab === 'active' && contractAddress && (
						<div key="active" className="fb-fade space-y-5">
							{!isConnected ? (
								<EmptyState icon={<Wallet className="h-7 w-7" />} title="Connect to see your loans"
									body="Your posted offers and active loans show up here once you connect." action={<appkit-connect-button />} />
							) : (
								<>
									<div>
										<SectionHeading icon={<Clock className="h-4 w-4" />} title="Your open offers" hint="Posted, waiting for a counterparty." />
										{myOpenOffers.length === 0 ? (
											<p className="text-sm text-gray-400 px-1">Nothing waiting. <button onClick={() => setTab('create')} className="text-emerald-700 hover:underline">Post an offer →</button></p>
										) : (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{myOpenOffers.map((l) => (
													<OfferCard key={l.id} loan={l} mine pInfo={tokenInfo(l.principalToken)} cInfo={tokenInfo(l.collateralToken)}
														fmt={fmt} isConnected={isConnected} onTake={() => handleTake(l)} onCancel={() => handleSimpleAction(l, 'cancel')} />
												))}
											</div>
										)}
									</div>
									<div>
										<SectionHeading icon={<Timer className="h-4 w-4" />} title="Active loans" hint="The clock is ticking." />
										{myActive.length === 0 ? (
											<p className="text-sm text-gray-400 px-1">No active loans yet. Take an offer from <button onClick={() => setTab('browse')} className="text-emerald-700 hover:underline">Browse →</button></p>
										) : (
											<div className="space-y-3">
												{myActive.map((l) => (
													<ActiveLoanCard key={l.id} loan={l} now={now} me={me} fmt={fmt}
														onRepay={() => handleRepay(l)} onClaim={() => handleSimpleAction(l, 'claimDefault')} />
												))}
											</div>
										)}
									</div>
								</>
							)}
						</div>
					)}

					{/* ---- HOW IT WORKS ---- */}
					{tab === 'how' && (
						<div key="how" className="fb-fade">
							<HowItWorks explorer={networkConfig.explorer} contractAddress={contractAddress}
								isPlayground={networkConfig.isPlayground} protocolBps={protocolBps} interfaceFeePct={INTERFACE_FEE_PCT} />
						</div>
					)}

					<p className="text-xs text-gray-400 text-center pt-2 pb-8 max-w-2xl mx-auto">
						Collateral is held by a neutral escrow contract; nothing is priced on-chain. Lenders should require enough
						collateral to cover the loan — its value can move during the term. Smart-contract and token risk apply.
					</p>
				</main>

				<SiteFooter />
			</div>

			<style jsx global>{`
				@keyframes fbfade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
				.fb-fade { animation: fbfade 0.25s ease; }
			`}</style>
		</>
	);
}

/* ---------------- presentational components ---------------- */

function TabButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
	return (
		<button onClick={onClick}
			className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
			{icon}<span className="hidden sm:inline">{label}</span>
			{count != null && count > 0 && (
				<span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
			)}
		</button>
	);
}

function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
	return (
		<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
			{title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
			{subtitle && <p className="text-xs text-gray-500 mt-0.5 mb-3">{subtitle}</p>}
			{title && !subtitle && <div className="mb-3" />}
			{children}
		</section>
	);
}

function SectionHeading({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
	return (
		<div className="flex items-center gap-2 mb-3">
			<span className="text-emerald-600">{icon}</span>
			<h3 className="text-base font-semibold text-gray-900">{title}</h3>
			{hint && <span className="text-xs text-gray-400">· {hint}</span>}
		</div>
	);
}

function TrendingUpMini() {
	return <span className="inline-block h-4 w-4 rotate-45"><ArrowRight className="h-4 w-4" /></span>;
}

function Segmented({ value, onChange, options, full }: { value: string; onChange: (v: string) => void; options: { value: string; label: string; icon?: React.ReactNode }[]; full?: boolean }) {
	return (
		<div className={`inline-flex bg-gray-100 rounded-xl p-1 ${full ? 'w-full' : ''}`}>
			{options.map((o) => (
				<button key={o.value} onClick={() => onChange(o.value)}
					className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${full ? 'flex-1' : ''} ${value === o.value ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
					{o.icon}{o.label}
				</button>
			))}
		</div>
	);
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
	return (
		<label className="block">
			<span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
			{children}
			{hint && <span className="block text-[11px] text-gray-400 mt-1">{hint}</span>}
		</label>
	);
}

function Disclosure({ open, onToggle, label, hint, children }: { open: boolean; onToggle: () => void; label: string; hint?: string; children: React.ReactNode }) {
	return (
		<section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
			<button onClick={onToggle} className="w-full flex items-center justify-between gap-2 p-4 text-left">
				<span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900"><SlidersHorizontal className="h-4 w-4 text-gray-400" /> {label}</span>
				<span className="inline-flex items-center gap-2 text-xs text-gray-400">{hint}<ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} /></span>
			</button>
			{open && <div className="px-4 pb-4 border-t border-gray-100">{children}</div>}
		</section>
	);
}

function Monogram({ info, className }: { info: { symbol: string; kind: string }; className?: string }) {
	const v = TOKEN_VISUAL[info.kind] || TOKEN_VISUAL.other;
	const glyph = v.glyph === '•' ? (info.symbol?.[0]?.toUpperCase() || '?') : v.glyph;
	return (
		<span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${v.cls} text-white font-bold flex-shrink-0 ${className || 'h-9 w-9 text-sm'}`}>{glyph}</span>
	);
}

function RangeRow({ label, value, min, max, step, onChange, display }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string }) {
	return (
		<div>
			<div className="flex items-center justify-between mb-1.5">
				<span className="text-xs font-medium text-gray-600">{label}</span>
				<span className="text-sm font-semibold text-emerald-700">{display}</span>
			</div>
			<input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
				className="w-full accent-emerald-600 cursor-pointer" />
		</div>
	);
}

function TokenSelect({ tokens, value, onSelect, balances, tokenInfo }: {
	tokens: readonly RegToken[]; value: string; onSelect: (addr: string) => void;
	balances: Record<string, bigint>; tokenInfo: (a: string) => TokenInfo;
}) {
	const [open, setOpen] = useState(false);
	const [custom, setCustom] = useState(false);
	const [customVal, setCustomVal] = useState('');
	const info = tokenInfo(value);
	const balOf = (addr: string) => {
		const b = balances[(addr || '').toLowerCase()];
		if (b == null) return null;
		try { return trimAmount(ethers.formatUnits(b, tokenInfo(addr).decimals)); } catch { return null; }
	};
	return (
		<div className="relative">
			<button type="button" onClick={() => setOpen((o) => !o)}
				className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg pl-1.5 pr-2 py-1.5 hover:border-emerald-400 transition-colors min-w-[130px]">
				<Monogram info={info} className="h-7 w-7 text-xs" />
				<span className="text-sm font-semibold text-gray-900">{info.symbol}</span>
				<ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
			</button>
			{open && (
				<>
					<div className="fixed inset-0 z-20" onClick={() => { setOpen(false); setCustom(false); }} />
					<div className="absolute z-30 mt-1 right-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5">
						{tokens.map((t) => {
							const b = balOf(t.address);
							return (
								<button key={t.address} type="button" onClick={() => { onSelect(t.address); setOpen(false); }}
									className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 text-left">
									<Monogram info={t} className="h-8 w-8 text-xs" />
									<div className="min-w-0 flex-1">
										<div className="text-sm font-semibold text-gray-900">{t.symbol}</div>
										<div className="text-[11px] text-gray-400 truncate">{t.name}</div>
									</div>
									{b != null && <span className="text-[11px] text-gray-400">{b}</span>}
									{value.toLowerCase() === t.address.toLowerCase() && <Check className="h-4 w-4 text-emerald-600" />}
								</button>
							);
						})}
						<div className="border-t border-gray-100 my-1" />
						{!custom ? (
							<button type="button" onClick={() => setCustom(true)} className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 text-xs text-gray-500">Use a custom token address…</button>
						) : (
							<div className="p-1.5 flex gap-1.5">
								<input autoFocus value={customVal} onChange={(e) => setCustomVal(e.target.value)} placeholder="0x…" className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:border-emerald-500" />
								<button type="button" onClick={() => { if (isAddr(customVal)) { onSelect(customVal); setOpen(false); setCustom(false); } }}
									className="bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700">Use</button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}

function TokenAmountRow({ label, tokens, value, onSelect, info, balances, tokenInfo, amount, setAmount, showSlider, balance }: {
	label: string; tokens: readonly RegToken[]; value: string; onSelect: (a: string) => void; info: TokenInfo;
	balances: Record<string, bigint>; tokenInfo: (a: string) => TokenInfo;
	amount: string; setAmount: (s: string) => void; showSlider: boolean; balance: number | null;
}) {
	const hasBal = showSlider && balance != null && balance > 0;
	const setPct = (frac: number) => setAmount(trimAmount(String(balance! * frac)));
	const sliderMax = hasBal ? balance! : 0;
	const step = hasBal ? Math.max(balance! / 1000, 0.000001) : 1;
	return (
		<div className="bg-gray-50 rounded-xl p-3">
			<div className="flex items-center justify-between mb-1">
				<span className="text-xs font-medium text-gray-500">{label}</span>
				{balance != null && <span className="text-[11px] text-gray-400">Balance: {trimAmount(String(balance))} {info.symbol}</span>}
			</div>
			<div className="flex items-center gap-2">
				<input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.0"
					className="flex-1 bg-transparent text-2xl font-semibold text-gray-900 focus:outline-none min-w-0" />
				<TokenSelect tokens={tokens} value={value} onSelect={onSelect} balances={balances} tokenInfo={tokenInfo} />
			</div>
			{hasBal && (
				<div className="mt-2">
					<input type="range" min={0} max={sliderMax} step={step} value={Math.min(parseFloat(amount) || 0, sliderMax)} onChange={(e) => setAmount(trimAmount(e.target.value))}
						className="w-full accent-emerald-600 cursor-pointer" />
					<div className="flex gap-1.5 mt-1">
						{[0.25, 0.5, 0.75].map((f) => (
							<button key={f} type="button" onClick={() => setPct(f)} className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 hover:border-emerald-300">{f * 100}%</button>
						))}
						<button type="button" onClick={() => setPct(1)} className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-500 hover:border-emerald-300">Max</button>
					</div>
				</div>
			)}
		</div>
	);
}

function DealSummary({ role, pInfo, cInfo, principalNum, collateralNum, feeAmount, totalRepay, termDays, graceDays, feePct, boostNum, interfacePct }: {
	role: 'lend' | 'borrow'; pInfo: TokenInfo; cInfo: TokenInfo; principalNum: number; collateralNum: number;
	feeAmount: number; totalRepay: number; termDays: number; graceDays: number; feePct: number; boostNum: number; interfacePct: number;
}) {
	const p = principalNum > 0 ? `${trimAmount(String(principalNum))} ${pInfo.symbol}` : `— ${pInfo.symbol}`;
	const c = collateralNum > 0 ? `${trimAmount(String(collateralNum))} ${cInfo.symbol}` : `— ${cInfo.symbol}`;
	const repay = principalNum > 0 ? `${trimAmount(String(totalRepay))} ${pInfo.symbol}` : `— ${pInfo.symbol}`;
	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
			<div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4">
				<p className="text-xs uppercase tracking-wide text-emerald-100 mb-1">In plain English</p>
				<p className="text-sm leading-relaxed">
					{role === 'lend' ? (
						<>You lend <strong>{p}</strong>. The borrower locks <strong>{c}</strong> and must repay <strong>{repay}</strong> within <strong>{termDays}d</strong>{graceDays > 0 ? <> (+{graceDays}d grace)</> : null}. If they don&apos;t, you claim the <strong>{c}</strong>.</>
					) : (
						<>You borrow <strong>{p}</strong> and lock <strong>{c}</strong> as collateral. Repay <strong>{repay}</strong> within <strong>{termDays}d</strong>{graceDays > 0 ? <> (+{graceDays}d grace)</> : null} to redeem it — otherwise the lender keeps your <strong>{c}</strong>.</>
					)}
				</p>
			</div>
			<dl className="p-4 space-y-2.5 text-sm">
				<SummaryRow label={role === 'lend' ? 'You deposit' : 'You receive'} value={p} />
				<SummaryRow label={role === 'lend' ? 'Borrower locks' : 'You lock'} value={c} />
				<SummaryRow label="Flat fee" value={`${trimAmount(String(feeAmount))} ${pInfo.symbol} (${feePct}%)`} />
				<div className="border-t border-gray-100" />
				<SummaryRow label="Total to repay" value={repay} strong />
				<SummaryRow label="Deadline" value={`${termDays}d${graceDays > 0 ? ` + ${graceDays}d grace` : ''}`} />
				<div className="border-t border-gray-100" />
				<SummaryRow label="Interface fee" value={interfacePct === 0 ? '0% — introductory' : `${interfacePct}%`} />
				<SummaryRow label="Featured boost" value={boostNum > 0 ? `${trimAmount(String(boostNum))} ${pInfo.symbol}` : 'none'} />
			</dl>
		</div>
	);
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<dt className="text-gray-400">{label}</dt>
			<dd className={`text-right ${strong ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>{value}</dd>
		</div>
	);
}

function TokenPair({ pInfo, cInfo }: { pInfo: TokenInfo; cInfo: TokenInfo }) {
	return (
		<div className="flex items-center">
			<Monogram info={pInfo} className="h-9 w-9 text-sm ring-2 ring-white" />
			<Monogram info={cInfo} className="h-9 w-9 text-sm -ml-2 ring-2 ring-white" />
		</div>
	);
}

function OfferCard({ loan, mine, pInfo, cInfo, fmt, isConnected, onTake, onCancel }: {
	loan: LoanView; mine: boolean; pInfo: TokenInfo; cInfo: TokenInfo;
	fmt: (a: bigint, t: string) => string; isConnected: boolean; onTake: () => void; onCancel: () => void;
}) {
	const isLend = loan.creatorIsLender;
	const featured = loan.boost > 0n;
	return (
		<div className={`relative bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all ${featured ? 'border-amber-300 ring-1 ring-amber-200 hover:border-amber-400' : 'border-gray-200 hover:border-emerald-200'}`}>
			<div className="flex items-start justify-between gap-2 mb-3">
				<div className="flex items-center gap-3">
					<TokenPair pInfo={pInfo} cInfo={cInfo} />
					<div>
						<div className="text-sm font-semibold text-gray-900">{pInfo.symbol} <span className="text-gray-300">/</span> {cInfo.symbol}</div>
						<span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${isLend ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
							{isLend ? 'Offer to lend' : 'Request to borrow'}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-1.5">
					{featured && (
						<span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"><Star className="h-3 w-3" /> Featured</span>
					)}
					<span className="text-xs text-gray-300">#{loan.id}</span>
				</div>
			</div>
			<dl className="space-y-1.5 text-sm">
				<SummaryRow label={isLend ? 'Lends' : 'Wants'} value={fmt(loan.principal, loan.principalToken)} />
				<SummaryRow label="Collateral" value={fmt(loan.collateral, loan.collateralToken)} />
				<SummaryRow label="Fee" value={fmt(loan.repaymentFee, loan.principalToken)} />
				<SummaryRow label="Term" value={`${formatDuration(loan.duration)} (+${formatDuration(loan.gracePeriod)} grace)`} />
				{featured && <SummaryRow label="Boost" value={fmt(loan.boost, loan.principalToken)} />}
				{loan.serviceFee > 0n && <SummaryRow label="Service fee" value={`${fmt(loan.serviceFee, loan.principalToken)} → ${formatAddress(loan.serviceFeeRecipient)}`} />}
				{loan.allowedTaker !== ZERO && (
					<div className="flex items-center gap-1 text-[11px] text-amber-600"><Lock className="h-3 w-3" /> Private to {formatAddress(loan.allowedTaker)}</div>
				)}
			</dl>
			<div className="mt-3 flex items-center justify-between gap-2">
				<span className="text-xs text-gray-400">by {mine ? 'you' : formatAddress(loan.creator)}</span>
				{mine ? (
					<button onClick={onCancel} className="text-sm bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-200 font-medium">Cancel offer</button>
				) : (
					<button onClick={onTake} disabled={!isConnected} className="inline-flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
						{isLend ? 'Borrow this' : 'Fund this'} <ArrowRight className="h-3.5 w-3.5" />
					</button>
				)}
			</div>
		</div>
	);
}

function ActiveLoanCard({ loan, now, me, fmt, onRepay, onClaim }: {
	loan: LoanView; now: number; me: string; fmt: (a: bigint, t: string) => string; onRepay: () => void; onClaim: () => void;
}) {
	const lender = loan.creatorIsLender ? loan.creator : loan.taker;
	const borrower = loan.creatorIsLender ? loan.taker : loan.creator;
	const iAmBorrower = borrower.toLowerCase() === me;
	const iAmLender = lender.toLowerCase() === me;
	const start = Number(loan.startTime);
	const maturity = start + Number(loan.duration);
	const deadline = maturity + Number(loan.gracePeriod);
	const total = Math.max(deadline - start, 1);
	const progress = Math.min(Math.max((now - start) / total, 0), 1) * 100;
	const overdue = now > deadline;
	const inGrace = now > maturity && !overdue;
	const remaining = deadline - now;
	const barCls = overdue ? 'bg-red-500' : inGrace ? 'bg-amber-500' : 'bg-emerald-500';

	let statusText: string;
	if (overdue) statusText = iAmLender ? 'Overdue — you can claim the collateral now' : 'Overdue — the lender can claim your collateral';
	else if (inGrace) statusText = `Grace period — ${iAmBorrower ? 'repay' : 'borrower repays'} within ${formatDuration(remaining)}`;
	else statusText = `${iAmBorrower ? 'Repay' : 'Borrower repays'} within ${formatDuration(maturity - now)}`;

	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<Monogram info={{ symbol: '', kind: iAmBorrower ? 'usd' : 'eth' }} className="h-9 w-9 text-xs" />
					<div>
						<div className="flex items-center gap-2">
							<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{STATUS_LABEL[loan.status]}</span>
							<span className="text-xs text-gray-400">#{loan.id}</span>
							<span className="text-xs text-gray-500">{iAmBorrower ? 'You borrowed' : 'You lent'}</span>
						</div>
						<div className="text-sm text-gray-800 mt-0.5">{fmt(loan.principal, loan.principalToken)} against {fmt(loan.collateral, loan.collateralToken)}</div>
					</div>
				</div>
				<div className="flex gap-2">
					{iAmBorrower && !overdue && (
						<button onClick={onRepay} className="inline-flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 font-medium">Repay &amp; redeem</button>
					)}
					{iAmLender && (
						<button onClick={onClaim} disabled={!overdue} className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-40 font-medium">Claim collateral</button>
					)}
				</div>
			</div>
			<div className="mt-3">
				<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
					<div className={`h-full ${barCls} transition-all`} style={{ width: `${progress}%` }} />
				</div>
				<p className={`text-xs mt-1.5 ${overdue ? 'text-red-600' : inGrace ? 'text-amber-600' : 'text-gray-500'}`}>{statusText}</p>
			</div>
		</div>
	);
}

function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
	return (
		<div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
			<div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gray-50 text-gray-300 mb-3">{icon}</div>
			<h3 className="text-base font-semibold text-gray-900">{title}</h3>
			<p className="text-sm text-gray-500 mt-1 mb-4">{body}</p>
			{action}
		</div>
	);
}
