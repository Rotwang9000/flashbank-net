// End-to-end MCP protocol test: spawns the real server over stdio (via the shared client used by
// the live drill), performs the initialize handshake, lists tools and calls the offline `explain`
// tool. No network or key needed.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { startMcpServer } from '../scripts/mcp-client.js';

test('the server speaks MCP: initialize, tools/list and an offline tools/call', async () => {
	// Force read-only regardless of the host env so the gating assertion below is deterministic.
	const server = startMcpServer({ FLASHBANK_MCP_PRIVATE_KEY: '' }, { timeoutMs: 10_000 });
	try {
		const init = await server.initialize('flashbank-protocol-test');
		assert.equal(init.result.serverInfo.name, 'flashbank');

		const list = await server.request('tools/list', {});
		const names = list.result.tools.map((t) => t.name).sort();
		assert.ok(names.length >= 15, `expected at least 15 tools, got ${names.length}: ${names.join(', ')}`);
		for (const expected of [
			'explain', 'list_chains', 'wallet_status',
			'p2p_list_offers', 'p2p_get_loan', 'p2p_my_loans',
			'flash_pools', 'flash_quote',
			'p2p_create_offer', 'p2p_take_offer', 'p2p_repay', 'p2p_claim_default', 'p2p_cancel',
			'p2p_withdraw_unclaimed', 'faucet_mint',
		]) {
			assert.ok(names.includes(expected), `missing tool ${expected}`);
		}

		const explain = await server.callTool('explain');
		assert.match(explain.explainer, /flashbank.*verb/i);
		assert.match(explain.explainer, /P2P TERM LOANS/);
		assert.match(explain.explainer, /FLASH LOANS/);
		assert.match(explain.explainer, /cooling-off/i);

		// Write tools refuse politely in read-only mode (no key in this spawn).
		await assert.rejects(
			() => server.callTool('p2p_cancel', { chain: 'sepolia', id: 0 }),
			/no signing key configured/i,
		);
	} finally {
		await server.stop();
	}
});
