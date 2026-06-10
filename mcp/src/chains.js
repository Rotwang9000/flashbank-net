// Chain registry for the FlashBank MCP server.
//
// Static, public on-chain addresses (nothing here is a secret) for every network the live
// products are deployed to. Sourced from loans/deployments/*-p2p.json and
// flashloans/deployments/*-v3.json — update BOTH when redeploying.
//
// Per the project rules nothing mutable is exported: consumers go through the accessor
// functions below, which hand out frozen data.

const SEPOLIA_KEY = 'sepolia';

const CHAIN_DATA = Object.freeze({
	ethereum: Object.freeze({
		key: 'ethereum',
		chainId: 1,
		name: 'Ethereum',
		rpc: 'https://ethereum-rpc.publicnode.com',
		explorer: 'https://etherscan.io',
		p2pLoan: '0x131C8545b28bca9063B364380956Df33A70018A0',
		flashRouter: '0x7791f3A7D82db7186f085BfFa3Fd46898EEaAE35',
		isPlayground: false,
		tokens: Object.freeze([
			Object.freeze({ symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, faucet: false }),
			Object.freeze({ symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, faucet: false }),
		]),
	}),
	base: Object.freeze({
		key: 'base',
		chainId: 8453,
		name: 'Base',
		rpc: 'https://mainnet.base.org',
		explorer: 'https://basescan.org',
		p2pLoan: '0x86FbF8e03f8A6f3eF52062E3f81627F64aa5FcbB',
		flashRouter: '0xDd6D0dC7AA7Be44E4F44d15D34851f3eDc7610AA',
		isPlayground: false,
		tokens: Object.freeze([
			Object.freeze({ symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, faucet: false }),
			Object.freeze({ symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, faucet: false }),
		]),
	}),
	arbitrum: Object.freeze({
		key: 'arbitrum',
		chainId: 42161,
		name: 'Arbitrum One',
		rpc: 'https://arbitrum-one-rpc.publicnode.com',
		explorer: 'https://arbiscan.io',
		p2pLoan: null, // not deployed yet (thin deployer balance) — see docs/deployment/LIVE_NETWORKS.md
		flashRouter: '0x34DcDBCCf9cC5753F709723Fa00DDe7eCd549A17',
		isPlayground: false,
		tokens: Object.freeze([
			Object.freeze({ symbol: 'WETH', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18, faucet: false }),
			Object.freeze({ symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, faucet: false }),
		]),
	}),
	[SEPOLIA_KEY]: Object.freeze({
		key: SEPOLIA_KEY,
		chainId: 11155111,
		name: 'Sepolia (testnet playground)',
		rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
		explorer: 'https://sepolia.etherscan.io',
		p2pLoan: '0x3Ce4B6DC383d3105A6D35a6816BC10D395Aa1017',
		flashRouter: '0x6770d3e75F45a2080973c0021F184AEFE6f5CA67',
		isPlayground: true,
		tokens: Object.freeze([
			Object.freeze({ symbol: 'WETH', address: '0xdd13E55209Fd76AfE204dBda4007C227904f0a81', decimals: 18, faucet: false }),
			Object.freeze({ symbol: 'fpUSD', address: '0x4aBb056aA5aB39b55039ACAf795Ff9403Fa9760c', decimals: 6, faucet: true }),
			Object.freeze({ symbol: 'fpETH', address: '0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5', decimals: 18, faucet: true }),
		]),
	}),
});

/** Keys of every supported chain, playground last. */
export function chainKeys() {
	return Object.keys(CHAIN_DATA);
}

/** The frozen config for one chain. Throws on an unknown key. */
export function getChain(key) {
	const chain = CHAIN_DATA[key];
	if (!chain) {
		throw new Error(`Unknown chain "${key}". Supported: ${chainKeys().join(', ')}.`);
	}
	return chain;
}

/** RPC URL for a chain, honouring a FLASHBANK_MCP_RPC_<KEY> env override. */
export function rpcUrl(key) {
	const chain = getChain(key);
	const override = process.env[`FLASHBANK_MCP_RPC_${key.toUpperCase()}`];
	return override || chain.rpc;
}

/** The testnet playground key (the only chain where the faucet exists). */
export function playgroundKey() {
	return SEPOLIA_KEY;
}

/**
 * Resolve a token reference (symbol like "USDC"/"fpETH", or a 0x address) against a chain's
 * registry. Returns the frozen token entry, or null when it is not a registry token (callers
 * may then fall back to on-chain metadata).
 */
export function findToken(key, ref) {
	const chain = getChain(key);
	const needle = String(ref).trim();
	if (needle.startsWith('0x') && needle.length === 42) {
		return chain.tokens.find((t) => t.address.toLowerCase() === needle.toLowerCase()) || null;
	}
	return chain.tokens.find((t) => t.symbol.toLowerCase() === needle.toLowerCase()) || null;
}
