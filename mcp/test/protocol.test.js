// End-to-end MCP protocol test: spawns the real server over stdio, performs the initialize
// handshake, lists tools and calls the offline `explain` tool. No network or key needed.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVER_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'server.js');
const PROTOCOL_VERSION = '2025-06-18';
const RESPONSE_TIMEOUT_MS = 10_000;

function startServer() {
	const child = spawn(process.execPath, [SERVER_PATH], { stdio: ['pipe', 'pipe', 'pipe'] });
	let buffer = '';
	const pending = new Map();
	child.stdout.on('data', (chunk) => {
		buffer += chunk.toString();
		let newline;
		while ((newline = buffer.indexOf('\n')) >= 0) {
			const line = buffer.slice(0, newline).trim();
			buffer = buffer.slice(newline + 1);
			if (!line) {
				continue;
			}
			const message = JSON.parse(line);
			if (message.id !== undefined && pending.has(message.id)) {
				pending.get(message.id)(message);
				pending.delete(message.id);
			}
		}
	});
	const request = (id, method, params) => {
		const promise = new Promise((resolve, reject) => {
			pending.set(id, resolve);
			setTimeout(() => reject(new Error(`Timed out waiting for response to ${method}`)), RESPONSE_TIMEOUT_MS);
		});
		child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
		return promise;
	};
	const notify = (method, params) => {
		child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
	};
	return { child, request, notify };
}

test('the server speaks MCP: initialize, tools/list and an offline tools/call', async () => {
	const { child, request, notify } = startServer();
	try {
		const init = await request(1, 'initialize', {
			protocolVersion: PROTOCOL_VERSION,
			capabilities: {},
			clientInfo: { name: 'flashbank-protocol-test', version: '0.0.0' },
		});
		assert.equal(init.result.serverInfo.name, 'flashbank');
		notify('notifications/initialized', {});

		const list = await request(2, 'tools/list', {});
		const names = list.result.tools.map((t) => t.name).sort();
		assert.ok(names.length >= 13, `expected at least 13 tools, got ${names.length}: ${names.join(', ')}`);
		for (const expected of [
			'explain', 'list_chains', 'wallet_status',
			'p2p_list_offers', 'p2p_get_loan', 'p2p_my_loans',
			'flash_pools', 'flash_quote',
			'p2p_create_offer', 'p2p_take_offer', 'p2p_repay', 'p2p_claim_default', 'p2p_cancel',
			'faucet_mint',
		]) {
			assert.ok(names.includes(expected), `missing tool ${expected}`);
		}

		const explain = await request(3, 'tools/call', { name: 'explain', arguments: {} });
		const text = explain.result.content[0].text;
		assert.match(text, /flashbank.*verb/i);
		assert.match(text, /P2P TERM LOANS/);
		assert.match(text, /FLASH LOANS/);
	} finally {
		child.kill();
		await once(child, 'exit').catch(() => {});
	}
});
