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
		assert.match(init.result.instructions ?? '', /verb, not a bank/i, 'connect-time instructions should orient the model');

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

		// Safety annotations are what let agent clients reason about tool risk — assert the
		// extremes: a read tool, an irreversible write and a reversible write.
		const tool = (name) => list.result.tools.find((t) => t.name === name);
		assert.equal(tool('explain').annotations.readOnlyHint, true);
		assert.equal(tool('p2p_claim_default').annotations.readOnlyHint, false);
		assert.equal(tool('p2p_claim_default').annotations.destructiveHint, true);
		assert.equal(tool('p2p_create_offer').annotations.destructiveHint, false);
		assert.equal(tool('faucet_mint').annotations.idempotentHint, false);

		const explain = await server.callTool('explain');
		assert.match(explain.explainer, /flashbank.*verb/i);
		assert.match(explain.explainer, /P2P TERM LOANS/);
		assert.match(explain.explainer, /FLASH LOANS/);
		assert.match(explain.explainer, /cooling-off/i);

		// Resources: reference docs readable without spending a tool call.
		const resources = await server.request('resources/list', {});
		const uris = resources.result.resources.map((r) => r.uri).sort();
		for (const expected of ['flashbank://guide', 'flashbank://chains', 'flashbank://cooling-off', 'flashbank://safety']) {
			assert.ok(uris.includes(expected), `missing resource ${expected}`);
		}
		const guide = await server.request('resources/read', { uri: 'flashbank://guide' });
		assert.match(guide.result.contents[0].text, /verb/i);
		const chains = await server.request('resources/read', { uri: 'flashbank://chains' });
		const registry = JSON.parse(chains.result.contents[0].text);
		const sepolia = registry.chains.find((c) => c.key === 'sepolia');
		assert.equal(sepolia.p2pVersion, 2);
		assert.equal(sepolia.playground, true);

		// Prompts: guided workflows.
		const prompts = await server.request('prompts/list', {});
		const promptNames = prompts.result.prompts.map((p) => p.name);
		for (const expected of ['play_on_sepolia', 'lend_assets', 'borrow_against_collateral']) {
			assert.ok(promptNames.includes(expected), `missing prompt ${expected}`);
		}
		const playground = await server.request('prompts/get', { name: 'play_on_sepolia', arguments: {} });
		assert.match(playground.result.messages[0].content.text, /faucet_mint/);

		// Write tools refuse politely in read-only mode (no key in this spawn).
		await assert.rejects(
			() => server.callTool('p2p_cancel', { chain: 'sepolia', id: 0 }),
			/no signing key configured/i,
		);
	} finally {
		await server.stop();
	}
});
