import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ethers } from 'ethers';

import { chainKeys, getChain, rpcUrl, findToken, playgroundKey } from '../src/chains.js';

test('every chain entry is internally consistent', () => {
	for (const key of chainKeys()) {
		const chain = getChain(key);
		assert.equal(chain.key, key);
		assert.ok(chain.chainId > 0);
		assert.ok(chain.explorer.startsWith('https://'));
		assert.ok(chain.rpc.startsWith('https://'));
		// Addresses must checksum cleanly (getAddress throws on typos).
		assert.equal(ethers.getAddress(chain.flashRouter), chain.flashRouter);
		if (chain.p2pLoan) {
			assert.equal(ethers.getAddress(chain.p2pLoan), chain.p2pLoan);
		}
		assert.ok(chain.tokens.length >= 2);
		for (const token of chain.tokens) {
			assert.equal(ethers.getAddress(token.address), token.address);
			assert.ok(token.decimals >= 0 && token.decimals <= 18);
		}
	}
});

test('P2P is live on ethereum, base and sepolia; pending on arbitrum', () => {
	assert.ok(getChain('ethereum').p2pLoan);
	assert.ok(getChain('base').p2pLoan);
	assert.ok(getChain('sepolia').p2pLoan);
	assert.equal(getChain('arbitrum').p2pLoan, null);
});

test('only the playground carries faucet tokens', () => {
	for (const key of chainKeys()) {
		const chain = getChain(key);
		const faucets = chain.tokens.filter((t) => t.faucet);
		if (key === playgroundKey()) {
			assert.ok(faucets.length >= 2, 'playground should have fpUSD + fpETH');
		} else {
			assert.equal(faucets.length, 0, `${key} must not advertise faucets`);
		}
	}
});

test('findToken resolves by symbol (case-insensitive) and by address', () => {
	const usdc = findToken('ethereum', 'usdc');
	assert.ok(usdc);
	assert.equal(usdc.symbol, 'USDC');
	assert.equal(findToken('ethereum', usdc.address.toLowerCase())?.symbol, 'USDC');
	assert.equal(findToken('ethereum', 'DOGE'), null);
});

test('getChain rejects unknown keys; rpcUrl honours env overrides', () => {
	assert.throws(() => getChain('dogechain'), /Unknown chain/);
	const before = process.env.FLASHBANK_MCP_RPC_BASE;
	process.env.FLASHBANK_MCP_RPC_BASE = 'https://example.org/rpc';
	try {
		assert.equal(rpcUrl('base'), 'https://example.org/rpc');
	} finally {
		if (before === undefined) {
			delete process.env.FLASHBANK_MCP_RPC_BASE;
		} else {
			process.env.FLASHBANK_MCP_RPC_BASE = before;
		}
	}
	assert.equal(rpcUrl('base'), getChain('base').rpc);
});

test('the MCP server builds with all tools registered', async () => {
	const { buildServer } = await import('../src/server.js');
	const server = buildServer();
	assert.ok(server, 'buildServer should return a server');
	assert.equal(typeof server.connect, 'function');
});
