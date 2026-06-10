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

test('contract versions: mainnets run v1, the Sepolia playground runs v2', () => {
	assert.equal(getChain('ethereum').p2pVersion, 1);
	assert.equal(getChain('base').p2pVersion, 1);
	assert.equal(getChain('arbitrum').p2pVersion, 1);
	assert.equal(getChain('sepolia').p2pVersion, 2);
	assert.equal(getChain('sepolia').p2pLoan, '0x536f4C17C18854943a45841Fef4b3054ED281E76');
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

test('both P2P ABI versions parse and decode the right tuple widths', async () => {
	const { p2pAbi, loanParamsOrder } = await import('../src/abi.js');
	const v1 = new ethers.Interface(p2pAbi(1));
	const v2 = new ethers.Interface(p2pAbi(2));
	assert.equal(v1.getFunction('getLoan').outputs[0].components.length, 21);
	assert.equal(v2.getFunction('getLoan').outputs[0].components.length, 23);
	assert.equal(v1.getFunction('createLoan').inputs[0].components.length, 15);
	assert.equal(v2.getFunction('createLoan').inputs[0].components.length, 16);
	// v2-only surface present, absent on v1 (ethers v6 returns null for unknown names).
	assert.ok(v2.getFunction('quoteRepaymentNow'));
	assert.ok(v2.getFunction('withdrawUnclaimed'));
	assert.equal(v1.getFunction('quoteRepaymentNow'), null);
	// Params order mirrors the tuples.
	assert.equal(loanParamsOrder(1).length, 15);
	assert.equal(loanParamsOrder(2).length, 16);
	assert.equal(loanParamsOrder(2)[10], 'coolingOff');
	assert.throws(() => p2pAbi(3), /Unsupported P2P contract version/);
});
