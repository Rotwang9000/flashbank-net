// Minimal stdio JSON-RPC client for driving the FlashBank MCP server like a real agent client
// would. Shared by test/protocol.test.js and scripts/drill.js.

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVER_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'server.js');
const PROTOCOL_VERSION = '2025-06-18';
const DEFAULT_TIMEOUT_MS = 120_000;

/**
 * Spawn an MCP server (optionally with extra env, e.g. a signing key) and return a tiny client:
 * `request(method, params)`, `notify(method, params)`, `callTool(name, args)` and `stop()`.
 */
export function startMcpServer(extraEnv = {}, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
	const child = spawn(process.execPath, [SERVER_PATH], {
		stdio: ['pipe', 'pipe', 'pipe'],
		env: { ...process.env, ...extraEnv },
	});
	let buffer = '';
	let nextId = 1;
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
			let message;
			try {
				message = JSON.parse(line);
			} catch {
				continue; // not a protocol frame
			}
			if (message.id !== undefined && pending.has(message.id)) {
				pending.get(message.id)(message);
				pending.delete(message.id);
			}
		}
	});

	const request = (method, params) => {
		const id = nextId++;
		const promise = new Promise((resolve, reject) => {
			pending.set(id, resolve);
			setTimeout(() => {
				pending.delete(id);
				reject(new Error(`Timed out after ${timeoutMs}ms waiting for ${method}`));
			}, timeoutMs);
		});
		child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
		return promise;
	};

	const notify = (method, params) => {
		child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
	};

	/** Initialize handshake; must be called once before tools. */
	const initialize = async (clientName) => {
		const init = await request('initialize', {
			protocolVersion: PROTOCOL_VERSION,
			capabilities: {},
			clientInfo: { name: clientName, version: '0.0.0' },
		});
		notify('notifications/initialized', {});
		return init;
	};

	/** Call a tool; returns parsed JSON payload (tool outputs are JSON text). Throws on isError. */
	const callTool = async (name, args = {}) => {
		const response = await request('tools/call', { name, arguments: args });
		if (response.error) {
			throw new Error(`${name}: protocol error ${JSON.stringify(response.error)}`);
		}
		const text = response.result.content?.[0]?.text ?? '';
		if (response.result.isError) {
			throw new Error(`${name}: ${text}`);
		}
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	};

	const stop = async () => {
		child.kill();
		await once(child, 'exit').catch(() => {});
	};

	return { child, request, notify, initialize, callTool, stop };
}
