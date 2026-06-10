// Network plumbing for the FlashBank MCP server: providers, the optional signer, contract
// handles, token resolution and the write-safety gate.

import { ethers } from 'ethers';
import { getChain, rpcUrl, findToken, playgroundKey } from './chains.js';
import { p2pAbi, routerAbi, erc20Abi } from './abi.js';

const PRIVATE_KEY_ENV = 'FLASHBANK_MCP_PRIVATE_KEY';
const ALLOW_MAINNET_ENV = 'FLASHBANK_MCP_ALLOW_MAINNET';

const providers = new Map();

/** Lazily-created, cached JsonRpcProvider for a chain. */
export function getProvider(chainKey) {
	if (!providers.has(chainKey)) {
		const chain = getChain(chainKey);
		const provider = new ethers.JsonRpcProvider(rpcUrl(chainKey), chain.chainId, { staticNetwork: true });
		providers.set(chainKey, provider);
	}
	return providers.get(chainKey);
}

/** Whether a signing key is configured at all. */
export function hasSigner() {
	return Boolean(process.env[PRIVATE_KEY_ENV]);
}

/**
 * Enforce the write-safety policy:
 *  - no key configured → reads only;
 *  - Sepolia playground → writes allowed whenever a key exists;
 *  - mainnets → writes additionally require FLASHBANK_MCP_ALLOW_MAINNET=true (real funds).
 */
export function assertWritesAllowed(chainKey) {
	if (!hasSigner()) {
		throw new Error(
			`Writes are disabled: no signing key configured. Set ${PRIVATE_KEY_ENV} in the MCP server env ` +
			'(use a throwaway key funded on Sepolia to experiment safely).'
		);
	}
	const chain = getChain(chainKey);
	if (!chain.isPlayground && process.env[ALLOW_MAINNET_ENV] !== 'true') {
		throw new Error(
			`Writes on ${chain.name} move REAL assets and are disabled by default. ` +
			`Set ${ALLOW_MAINNET_ENV}=true in the MCP server env to enable them, or use chain "${playgroundKey()}".`
		);
	}
}

/** The configured signer connected to a chain. Call {assertWritesAllowed} first for writes. */
export function getSigner(chainKey) {
	const key = process.env[PRIVATE_KEY_ENV];
	if (!key) {
		throw new Error(`No signing key configured (${PRIVATE_KEY_ENV}).`);
	}
	return new ethers.Wallet(key, getProvider(chainKey));
}

/** The P2P loan escrow contract on a chain (read-only by default). */
export function getP2P(chainKey, withSigner = false) {
	const chain = getChain(chainKey);
	if (!chain.p2pLoan) {
		throw new Error(`FlashBankP2PLoan is not deployed on ${chain.name} yet.`);
	}
	const runner = withSigner ? getSigner(chainKey) : getProvider(chainKey);
	return new ethers.Contract(chain.p2pLoan, p2pAbi(), runner);
}

/** The flash-loan router (v3) on a chain — read surface only. */
export function getRouter(chainKey) {
	const chain = getChain(chainKey);
	return new ethers.Contract(chain.flashRouter, routerAbi(), getProvider(chainKey));
}

/** An ERC-20 handle (read-only by default). */
export function getErc20(chainKey, address, withSigner = false) {
	const runner = withSigner ? getSigner(chainKey) : getProvider(chainKey);
	return new ethers.Contract(address, erc20Abi(), runner);
}

/**
 * Resolve a token reference (symbol or address) to `{ symbol, address, decimals, faucet }`.
 * Registry tokens resolve offline; unknown addresses fall back to on-chain metadata.
 */
export async function resolveToken(chainKey, ref) {
	const known = findToken(chainKey, ref);
	if (known) {
		return known;
	}
	const text = String(ref).trim();
	if (!ethers.isAddress(text)) {
		const chain = getChain(chainKey);
		const symbols = chain.tokens.map((t) => t.symbol).join(', ');
		throw new Error(`Unknown token "${ref}" on ${chain.name}. Use one of [${symbols}] or a 0x token address.`);
	}
	const token = getErc20(chainKey, text);
	try {
		const [symbol, decimals] = await Promise.all([token.symbol(), token.decimals()]);
		return { symbol, address: ethers.getAddress(text), decimals: Number(decimals), faucet: false };
	} catch {
		throw new Error(`Address ${text} on ${getChain(chainKey).name} does not answer as an ERC-20 (symbol/decimals failed).`);
	}
}

/**
 * Ensure `spender` may pull `amount` of `tokenAddress` from the signer, approving exactly the
 * shortfall case. Returns the approval transaction hash, or null when the allowance already
 * sufficed.
 */
export async function ensureAllowance(chainKey, tokenAddress, spender, amount) {
	const signer = getSigner(chainKey);
	const token = getErc20(chainKey, tokenAddress, true);
	const current = await token.allowance(await signer.getAddress(), spender);
	if (current >= amount) {
		return null;
	}
	const tx = await token.approve(spender, amount);
	await tx.wait();
	return tx.hash;
}

/** Explorer link for a transaction. */
export function txLink(chainKey, hash) {
	return `${getChain(chainKey).explorer}/tx/${hash}`;
}
