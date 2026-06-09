#!/usr/bin/env node
"use strict";

// Unattended low-gas deployer for FlashBankRouterV3 on Sepolia.
//
// Sepolia base fee can sit high for long stretches, so rather than burn most of a small testnet
// balance at a bad price, this polls the base fee and only deploys when it dips into an affordable
// window. On a trigger it runs the already-tested pipeline: deploy -> Etherscan verify -> live
// integration check, and repoints the website env at v3 ONLY after a passing integration test.
//
// Plain Node + JSON-RPC (no Hardhat in the polling loop); it shells out to the existing Hardhat
// scripts for the actual on-chain work, so there is one source of truth for deploy/verify/integration.
//
// Tunables (all env, with sensible defaults):
//   WATCH_MAX_BASE_GWEI   trigger when base fee <= this (default 3; ~6 still fits a safe deploy)
//   WATCH_INTERVAL_SEC    poll cadence (default 60)
//   WATCH_MAX_HOURS       give up after this many hours (default 12; exit code 2)
//   WATCH_MIN_BALANCE_ETH require at least this balance before triggering (default 0.03)
//   DEPLOYER_ADDRESS      balance is checked here (default: the project deployer)
//   SEPOLIA_HTTP_URL      RPC endpoint (falls back to root .env, then a public node)

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const FLASHLOANS_DIR = path.resolve(__dirname, "..");
const ROOT = path.resolve(FLASHLOANS_DIR, "..");

const CHAIN_ID = "11155111";
const THRESHOLD_GWEI = Number(process.env.WATCH_MAX_BASE_GWEI || "3");
const INTERVAL_SEC = Number(process.env.WATCH_INTERVAL_SEC || "60");
const MAX_HOURS = Number(process.env.WATCH_MAX_HOURS || "12");
const MIN_BALANCE_ETH = Number(process.env.WATCH_MIN_BALANCE_ETH || "0.03");
const DEPLOYER = process.env.DEPLOYER_ADDRESS || "0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036";
const WETH = process.env.FLASHBANK_LIQUIDITY_TOKEN || "0xdd13E55209Fd76AfE204dBda4007C227904f0a81";

function readEnvFromFile(key) {
	try {
		const txt = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
		for (const line of txt.split(/\r?\n/)) {
			const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
			if (m && m[1] === key) {
				let v = m[2].trim();
				if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
				return v;
			}
		}
	} catch { /* no .env is fine; defaults apply */ }
	return undefined;
}

const RPC_URL = process.env.SEPOLIA_HTTP_URL || readEnvFromFile("SEPOLIA_HTTP_URL") || "https://ethereum-sepolia-rpc.publicnode.com";

function rpc(method, params) {
	return new Promise((resolve, reject) => {
		const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
		const u = new URL(RPC_URL);
		const lib = u.protocol === "http:" ? http : https;
		const req = lib.request(
			u,
			{ method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body) } },
			(res) => {
				let data = "";
				res.on("data", (c) => (data += c));
				res.on("end", () => {
					try {
						const j = JSON.parse(data);
						if (j.error) reject(new Error(j.error.message || JSON.stringify(j.error)));
						else resolve(j.result);
					} catch (e) { reject(e); }
				});
			}
		);
		req.on("error", reject);
		req.setTimeout(20000, () => req.destroy(new Error("rpc timeout")));
		req.write(body);
		req.end();
	});
}

const gwei = (wei) => Number(wei) / 1e9;
const eth = (wei) => Number(wei) / 1e18;
const ts = () => new Date().toISOString().replace("T", " ").slice(0, 19);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function run(cmd, args, extraEnv) {
	console.log(`\n[${ts()}] $ ${cmd} ${args.join(" ")}`);
	const res = spawnSync(cmd, args, {
		cwd: FLASHLOANS_DIR,
		env: { ...process.env, ...(extraEnv || {}) },
		encoding: "utf8",
		stdio: ["inherit", "pipe", "pipe"],
	});
	if (res.stdout) process.stdout.write(res.stdout);
	if (res.stderr) process.stderr.write(res.stderr);
	return res;
}

function writeRecord(rec) {
	const dir = path.join(FLASHLOANS_DIR, "deployments");
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, "sepolia-v3.json"), JSON.stringify(rec, null, 2) + "\n");
}

function upsertEnvLocal(key, value) {
	const file = path.join(ROOT, "website", ".env.local");
	let lines = [];
	try { lines = fs.readFileSync(file, "utf8").split(/\r?\n/); } catch { /* will create */ }
	let found = false;
	const re = new RegExp("^\\s*" + key + "\\s*=");
	lines = lines.map((l) => (re.test(l) ? ((found = true), `${key}=${value}`) : l));
	if (!found) {
		while (lines.length && lines[lines.length - 1] === "") lines.pop();
		lines.push(`${key}=${value}`);
	}
	fs.writeFileSync(file, lines.join("\n") + "\n");
}

function deployFlow() {
	const dep = run("npx", ["hardhat", "run", "scripts/deploy-router-v3.js", "--network", "sepolia"]);
	if (dep.status !== 0) { console.error(`[${ts()}] DEPLOY FAILED (exit ${dep.status}). Funds untouched beyond gas; safe to re-run.`); process.exit(1); }

	const m = (dep.stdout || "").match(/ROUTER=(0x[0-9a-fA-F]{40})/);
	if (!m) { console.error(`[${ts()}] deployed but could not parse ROUTER= from output; check the log above.`); process.exit(1); }
	const router = m[1];
	console.log(`[${ts()}] v3 deployed: ${router}`);

	const record = { chainId: CHAIN_ID, address: router, weth: WETH, verified: false, integration: false, deployedAt: ts() };
	writeRecord(record);

	const argsRel = `scripts/verify-args-v3-${CHAIN_ID}.js`;
	for (let i = 1; i <= 5 && !record.verified; i++) {
		const waitMs = i === 1 ? 45000 : 30000;
		console.log(`[${ts()}] waiting ${waitMs / 1000}s for Etherscan to index, then verify (attempt ${i}/5)…`);
		sleepSync(waitMs);
		const v = run("npx", ["hardhat", "verify", "--network", "sepolia", "--constructor-args", argsRel, router]);
		const out = (v.stdout || "") + (v.stderr || "");
		if (v.status === 0 || /Already Verified|Successfully verified/i.test(out)) record.verified = true;
	}
	writeRecord(record);

	const itg = run("npx", ["hardhat", "run", "scripts/test-v3-integration.js", "--network", "sepolia"], { V3_ROUTER_ADDRESS: router, V3_WETH_ADDRESS: WETH });
	record.integration = itg.status === 0;
	writeRecord(record);

	if (record.integration) {
		try {
			upsertEnvLocal("NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS", router);
			console.log(`[${ts()}] website/.env.local updated -> NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=${router}`);
		} catch (e) { console.log(`[${ts()}] could not update website/.env.local: ${e.message}`); }
	}

	console.log(`\n[${ts()}] ===== SUMMARY =====`);
	console.log(`  router:      ${router}`);
	console.log(`  verified:    ${record.verified}`);
	console.log(`  integration: ${record.integration}`);
	console.log(`  record:      flashloans/deployments/sepolia-v3.json`);
	console.log(record.integration
		? `  v3 is live, verified and integration-tested. UI env repointed — rebuild the site to switch the Sepolia router.`
		: `  v3 deployed${record.verified ? " and verified" : ""}; live integration deferred (likely gas/funds). Re-run:\n    V3_ROUTER_ADDRESS=${router} npx hardhat run scripts/test-v3-integration.js --network sepolia`);
	process.exit(0);
}

async function main() {
	console.log(`[${ts()}] watch-and-deploy-v3 | chain ${CHAIN_ID} | threshold <= ${THRESHOLD_GWEI} gwei | every ${INTERVAL_SEC}s | up to ${MAX_HOURS}h`);
	console.log(`[${ts()}] deployer ${DEPLOYER} | min balance ${MIN_BALANCE_ETH} ETH | RPC ${RPC_URL.replace(/(\/v[0-9]\/|\/)[A-Za-z0-9_-]{16,}/, "$1…")}`);
	const deadline = Date.now() + MAX_HOURS * 3600 * 1000;

	while (Date.now() < deadline) {
		try {
			const block = await rpc("eth_getBlockByNumber", ["latest", false]);
			if (!block || !block.baseFeePerGas) throw new Error("no baseFeePerGas in latest block");
			const baseGwei = gwei(BigInt(block.baseFeePerGas));
			const balEth = eth(BigInt(await rpc("eth_getBalance", [DEPLOYER, "latest"])));
			const trigger = baseGwei <= THRESHOLD_GWEI && balEth >= MIN_BALANCE_ETH;
			const why = baseGwei > THRESHOLD_GWEI ? "gas high" : balEth < MIN_BALANCE_ETH ? "balance low" : "ok";
			console.log(`[${ts()}] base ${baseGwei.toFixed(3)} gwei | bal ${balEth.toFixed(5)} ETH | ${trigger ? "TRIGGER -> deploying" : `waiting (${why})`}`);
			if (trigger) return deployFlow();
		} catch (e) {
			console.log(`[${ts()}] rpc error: ${e.message} (retrying)`);
		}
		await sleep(INTERVAL_SEC * 1000);
	}
	console.log(`[${ts()}] ${MAX_HOURS}h elapsed with no window <= ${THRESHOLD_GWEI} gwei. Re-run to keep watching (or raise WATCH_MAX_BASE_GWEI).`);
	process.exit(2);
}

main().catch((e) => { console.error(`[${ts()}] fatal: ${e.message}`); process.exit(1); });
