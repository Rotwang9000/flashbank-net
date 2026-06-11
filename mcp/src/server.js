#!/usr/bin/env node
// FlashBank MCP server — lets AI agents browse, quote and (optionally) transact with the
// FlashBank contracts over the Model Context Protocol.
//
//   Read tools work with no configuration at all (public RPCs).
//   Write tools need FLASHBANK_MCP_PRIVATE_KEY, and mainnet writes additionally need
//   FLASHBANK_MCP_ALLOW_MAINNET=true — the Sepolia playground is the safe default.
//
// Run directly (stdio transport):  node src/server.js
// See mcp/README.md for the full tool catalogue and a Cursor configuration snippet.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ethers } from 'ethers';

import { chainKeys, getChain, playgroundKey } from './chains.js';
import {
	getProvider, getP2P, getRouter, getErc20, getSigner, hasSigner,
	assertWritesAllowed, resolveToken, ensureAllowance, txLink, p2pVersion,
} from './clients.js';
import {
	describeLoan, formatAmount, parseAmount, statusName, secondsToHuman, tsToIso,
	jsonContent, errorContent,
} from './format.js';

const SERVER_NAME = 'flashbank';
const SERVER_VERSION = '1.1.0';

// Shown to the model by MCP clients at connect time — orientation, not documentation.
const INSTRUCTIONS = `FlashBank MCP ("flashbank" is a verb, not a bank): browse, quote and optionally transact
with the FlashBank P2P term-loan escrow and flash-loan router on Ethereum, Base, Arbitrum and the
Sepolia playground.

Start with the "explain" tool (or the flashbank://guide resource) before acting. Read tools are
always available. Write tools need FLASHBANK_MCP_PRIVATE_KEY (use a throwaway key) and stay
Sepolia-only unless FLASHBANK_MCP_ALLOW_MAINNET=true — mainnet moves real, unaudited-contract
assets, so prefer the play-money playground. Before taking any offer, review it with p2p_get_loan
(check the on-default split and, on v2 chains, the cooling-off rebate); takes pin the reviewed
terms on-chain so a re-priced offer reverts instead of surprising you.`;

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 100;
const PAGE_SIZE = 200; // getLoansPaged batch size when scanning the book
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;

const CHAIN_ENUM = z.enum(chainKeys());

// Plain-English protocol primer returned by the `explain` tool so agents can self-serve context
// instead of guessing. Kept short on purpose; deep links cover the rest.
const EXPLAINER = `FlashBank ("flashbank" is a verb, not a bank) has two independent products:

1) P2P TERM LOANS (FlashBankP2PLoan — live on Ethereum, Base and the Sepolia playground).
   Two parties agree a fixed-term, collateral-backed loan held by a neutral escrow:
   - A creator posts an offer (as lender, escrowing the principal) or a request (as borrower,
     escrowing the collateral). The other side takes it, which activates the loan and disburses
     the principal to the borrower.
   - The borrower's whole cost is ONE FLAT FEE (no interest clock). Repay principal + fee before
     maturity + grace and the collateral comes back.
   - Settlement is PURELY TIME-BASED: no price oracle, no margin calls. After the deadline the
     lender may claim the collateral. An optional "agreed rate" (settlementValue) returns any
     surplus collateral above the debt to the borrower on default; otherwise all collateral
     forfeits.
   - Taking through this server pins the exact reviewed terms on-chain (takeWithTerms), so a
     last-second re-price by the creator makes the take revert rather than surprise you.
   - Fees: direct use is commission-free; offers posted "listed" opt into an interface fee
     (currently 0 bps, hard-capped at 1%); "boost" is an optional, non-refundable featured-
     placement spend paid to the protocol.
   - The Sepolia playground runs FlashBankP2PLoanV2, which additionally validates tokens at offer
     creation and vests the flat fee over a "cooling-off" window: repay early and the fee is
     rebated down to a 10% floor (a same-block round-trip still pays in full). If a payout to you
     ever fails (e.g. a blocklisting token), it queues for withdraw_unclaimed instead of bricking
     the other party's settlement.

2) FLASH LOANS (FlashBankRouterV3 — live on Ethereum, Base, Arbitrum and Sepolia).
   Atomic borrow-use-repay within one transaction, sourced from providers' OWN wallets via
   allowances (no deposits). A flash loan must be executed by a smart contract implementing the
   borrower callback, so this MCP exposes read/quote tools only.

SAFETY: contracts are open-source and verified but have NO external audit. Mainnet writes move
real assets and are opt-in. The Sepolia playground (faucet-minted fpUSD/fpETH play-money) is the
right place for agents to experiment. Site: https://flashbank.net (apps at /flash and /p2p,
honest self-audit at /audit).`;

/** Wrap a tool handler so every failure returns a clean MCP error payload. */
function safe(handler) {
	return async (args, extra) => {
		try {
			return await handler(args ?? {}, extra);
		} catch (error) {
			return errorContent(error);
		}
	};
}

/** Token metadata lookup used by describeLoan: registry first, single on-chain fallback. */
async function tokenInfoMap(chainKey, addresses) {
	const map = new Map();
	for (const address of addresses) {
		const key = address.toLowerCase();
		if (map.has(key)) {
			continue;
		}
		try {
			map.set(key, await resolveToken(chainKey, address));
		} catch {
			map.set(key, { symbol: `${address.slice(0, 8)}…`, address, decimals: 18, faucet: false });
		}
	}
	return (address) => map.get(address.toLowerCase());
}

/**
 * The strongest terms-pin a deployment supports. The current v1 build (Ethereum, Base) exposes
 * termsHash()/takeWithTerms(); the older Sepolia playground build predates them and pins via the
 * version counter instead. Returns { kind: 'hash', hash } or { kind: 'version', version }.
 */
async function strongestPin(p2p, id, loan) {
	try {
		return { kind: 'hash', hash: await p2p.termsHash(id) };
	} catch {
		return { kind: 'version', version: loan.version };
	}
}

/** Scan the loan book newest-first and return raw {id, loan} pairs matching `keep`. */
async function scanLoans(p2p, keep, maxMatches) {
	const total = Number(await p2p.loanCount());
	const matches = [];
	for (let end = total; end > 0 && matches.length < maxMatches; end -= PAGE_SIZE) {
		const start = Math.max(0, end - PAGE_SIZE);
		const page = await p2p.getLoansPaged(start, end - start);
		for (let i = page.length - 1; i >= 0 && matches.length < maxMatches; i--) {
			const id = start + i;
			const loan = page[i];
			if (keep(loan, id)) {
				matches.push({ id, loan });
			}
		}
	}
	return { total, matches };
}

/**
 * Read-only reference documents exposed as MCP resources, so clients can pull context without
 * spending a tool call. Everything here is static or derived from the static chain registry.
 */
function registerResources(server) {
	const textResource = (uri, text, mimeType = 'text/plain') => ({ contents: [{ uri, text, mimeType }] });

	server.registerResource('guide', 'flashbank://guide', {
		title: 'FlashBank primer',
		description: 'Plain-English primer on both products, the loan lifecycle, fees and safety rules (same text as the explain tool).',
		mimeType: 'text/plain',
	}, async (uri) => textResource(uri.href, EXPLAINER));

	server.registerResource('chains', 'flashbank://chains', {
		title: 'Chain & contract registry',
		description: 'Supported chains with deployed contract addresses, contract versions, registry tokens and explorers.',
		mimeType: 'application/json',
	}, async (uri) => {
		const chains = chainKeys().map((key) => {
			const chain = getChain(key);
			return {
				key,
				name: chain.name,
				chainId: chain.chainId,
				playground: chain.isPlayground,
				p2pLoan: chain.p2pLoan || null,
				p2pVersion: chain.p2pVersion,
				flashRouter: chain.flashRouter,
				tokens: chain.tokens,
				explorer: chain.explorer,
			};
		});
		return textResource(uri.href, JSON.stringify({ chains }, null, '\t'), 'application/json');
	});

	server.registerResource('cooling-off', 'flashbank://cooling-off', {
		title: 'v2 cooling-off fee model',
		description: 'How the flat fee vests on FlashBankP2PLoanV2 chains (Sepolia playground): the early-repay rebate, the 10% floor and the same-block guard.',
		mimeType: 'text/plain',
	}, async (uri) => textResource(uri.href, `FlashBankP2PLoanV2 cooling-off fee model (live on the Sepolia playground)

The agreed flat fee (repaymentFee) is a MAXIMUM that vests over the loan's coolingOff window:

  elapsed  = now - startTime
  floorFee = repaymentFee * 10%                      (MIN_VESTED_FEE_BPS = 1000)
  feeNow   = repaymentFee                            if same block as activation
           = repaymentFee                            if elapsed >= coolingOff
           = floorFee + (repaymentFee - floorFee) * elapsed / coolingOff   otherwise

Consequences:
- Repay almost immediately -> pay ~10% of the agreed fee (a fake-token victim escapes cheaply).
- The 10% floor means consuming someone's listing is never free (anti-griefing).
- A same-block take+repay still pays the FULL fee (no free flash loans through the escrow).
- The window: creators may set coolingOff >= the protocol minimum (10% of the term, clamped to
  [10 minutes, 1 day]); 0 means "use the minimum". Longer windows are more borrower-friendly.

Tools: p2p_get_loan shows "toRepayNow" (vested quote) on active v2 loans; p2p_repay reports the
fee actually paid and any rebate. Mainnets run v1 (no vesting) until v2 graduates.`));

	server.registerResource('safety', 'flashbank://safety', {
		title: 'Write-safety model',
		description: 'How writes are gated (env vars), what the audit status is, and which chain agents should practise on.',
		mimeType: 'text/plain',
	}, async (uri) => textResource(uri.href, `FlashBank MCP write-safety model

Mode                 Requirement                              Allows
read-only (default)  nothing                                  browsing, quotes, pool stats
playground writes    FLASHBANK_MCP_PRIVATE_KEY                create/take/repay/claim/cancel + faucet on Sepolia
mainnet writes       ... and FLASHBANK_MCP_ALLOW_MAINNET=true the same on Ethereum/Base with REAL assets

Rules of thumb for agents:
- Use a dedicated throwaway key; never one holding meaningful funds.
- The contracts are open-source and Etherscan-verified but carry NO external audit.
- Practise on Sepolia: fpUSD/fpETH are faucet-minted play money (faucet_mint tool).
- Review any offer with p2p_get_loan before taking; the take pins the reviewed terms on-chain.
- Flash loans are quote/read-only here: executing one needs a borrower-callback contract.`));
}

/** Guided workflows exposed as MCP prompts. Arguments are strings per the MCP spec. */
function registerPrompts(server) {
	const userMessage = (text) => ({ messages: [{ role: 'user', content: { type: 'text', text } }] });

	server.registerPrompt('play_on_sepolia', {
		title: 'Try FlashBank on the playground',
		description: 'A safe first session: mint play-money, post a small offer, inspect it, and exercise the v2 cooling-off rebate on Sepolia.',
	}, () => userMessage(`Walk me through a complete FlashBank P2P session on the Sepolia playground (play-money only):
1. Call explain, then wallet_status on sepolia — if writes are disabled, stop and tell me how to enable them safely (throwaway key).
2. Mint fpUSD and fpETH with faucet_mint.
3. Post a small lend offer with p2p_create_offer (e.g. lend 50 fpUSD against 0.2 fpETH, flat fee 2 fpUSD, 7-day term) and show me the resulting loan with p2p_get_loan.
4. List the market with p2p_list_offers and explain how mine ranks against the seeded/boosted ones.
5. Explain what would happen next as borrower: the cooling-off rebate if they repay early (use the flashbank://cooling-off resource), and the on-default split.
6. Cancel my offer with p2p_cancel and confirm the escrow came back.
Keep amounts tiny, narrate each step, and show transaction links.`));

	server.registerPrompt('lend_assets', {
		title: 'Post a sensible lend offer',
		description: 'Compose and post a P2P lend offer with sane terms: collateral cushion, fee sizing, term, cooling-off window and surplus-return choice.',
		argsSchema: {
			chain: z.string().optional().describe('Chain key (default sepolia; mainnets need the explicit env gate)'),
			principal: z.string().optional().describe('Amount + token to lend, e.g. "100 fpUSD"'),
			termDays: z.string().optional().describe('Loan term in days, e.g. "14"'),
		},
	}, ({ chain, principal, termDays }) => userMessage(`I want to lend ${principal || 'a small amount'} on ${chain || 'sepolia'} for ${termDays || 'about 14'} days through FlashBank P2P.
1. Check wallet_status and my balance; if the chain is a playground, faucet_mint what's missing.
2. Propose terms and JUSTIFY them: collateral asset + amount (sensible cushion over the principal at current rough rates), a flat fee (typically 1-5% of principal scaled by term), a grace period, whether to set settlementValue so surplus collateral returns to the borrower on default (fairer; recommended), and on v2 chains whether the default cooling-off window suffices.
3. Show me the exact p2p_create_offer call you intend, wait for nothing, then place it.
4. Confirm with p2p_get_loan and tell me how to monitor it (p2p_my_loans) and what happens at maturity, repayment and default.`));

	server.registerPrompt('borrow_against_collateral', {
		title: 'Find and take a borrow offer',
		description: 'Browse open offers, evaluate the real cost and default risk of the best candidates, then take one with the terms pinned on-chain.',
		argsSchema: {
			chain: z.string().optional().describe('Chain key (default sepolia)'),
			need: z.string().optional().describe('What you want to borrow, e.g. "100 fpUSD"'),
		},
	}, ({ chain, need }) => userMessage(`I want to borrow ${need || 'some tokens'} on ${chain || 'sepolia'} through FlashBank P2P.
1. Browse with p2p_list_offers and shortlist up to 3 offers that match what I need.
2. For each, call p2p_get_loan and compare: total repayment (principal + flat fee — on v2 chains also the vested "toRepayNow" if I exit early), the collateral I must lock, the term + grace, and EXACTLY what I lose on default (full forfeit vs surplus returned).
3. Recommend one with reasoning; check my balances cover the collateral (wallet_status, faucet_mint on playgrounds).
4. Take it with p2p_take_offer (this pins the reviewed terms on-chain) and show the repayment deadline, then remind me how to repay (p2p_repay) and what the cooling-off rebate would save if I repay early.`));
}

function buildServer() {
	const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION }, { instructions: INSTRUCTIONS });

	registerResources(server);
	registerPrompts(server);

	// ------------------------------------------------------------------ meta / read tools

	server.registerTool('explain', {
		title: 'Explain FlashBank',
		description: 'Plain-English primer on both FlashBank products, the loan lifecycle, fees and safety rules. Call this first if you are unsure how anything works.',
		annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
	}, safe(async () => jsonContent({ explainer: EXPLAINER })));

	server.registerTool('list_chains', {
		title: 'List chains',
		description: 'Supported chains with contract addresses, registry tokens and whether writes are currently permitted for each.',
		annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
	}, safe(async () => {
		const chains = chainKeys().map((key) => {
			const chain = getChain(key);
			let writes = 'disabled (no signing key configured)';
			if (hasSigner()) {
				try {
					assertWritesAllowed(key);
					writes = 'enabled';
				} catch {
					writes = 'disabled (set FLASHBANK_MCP_ALLOW_MAINNET=true to enable mainnet writes)';
				}
			}
			return {
				key,
				name: chain.name,
				chainId: chain.chainId,
				playground: chain.isPlayground,
				p2pLoan: chain.p2pLoan || 'not deployed',
				flashRouter: chain.flashRouter,
				tokens: chain.tokens.map((t) => `${t.symbol} (${t.decimals}d${t.faucet ? ', faucet' : ''})`),
				explorer: chain.explorer,
				writes,
			};
		});
		return jsonContent({ chains, note: 'Sepolia is a play-money playground — the safest place for agents to act.' });
	}));

	server.registerTool('wallet_status', {
		title: 'Wallet status',
		description: 'Address, native balance and registry-token balances of the configured signing wallet on one chain. Reports read-only mode when no key is set.',
		inputSchema: { chain: CHAIN_ENUM.describe('Chain to inspect') },
		annotations: { readOnlyHint: true, openWorldHint: true },
	}, safe(async ({ chain }) => {
		if (!hasSigner()) {
			return jsonContent({ mode: 'read-only', detail: 'No FLASHBANK_MCP_PRIVATE_KEY configured; all write tools are disabled.' });
		}
		const signer = getSigner(chain);
		const address = await signer.getAddress();
		const chainCfg = getChain(chain);
		const native = await getProvider(chain).getBalance(address);
		const balances = {};
		for (const token of chainCfg.tokens) {
			const bal = await getErc20(chain, token.address).balanceOf(address);
			balances[token.symbol] = formatAmount(bal, token.decimals);
		}
		let writes = 'enabled';
		try {
			assertWritesAllowed(chain);
		} catch (error) {
			writes = `disabled — ${error.message}`;
		}
		return jsonContent({ chain: chainCfg.name, address, nativeBalance: `${formatAmount(native, 18)} ETH`, tokenBalances: balances, writes });
	}));

	// ------------------------------------------------------------------ P2P read tools

	server.registerTool('p2p_list_offers', {
		title: 'List open P2P offers',
		description: 'Open, takeable loan offers/requests on a chain, newest first with boosted (featured) offers ranked on top. Returns human-readable terms plus the raw ids for follow-up calls.',
		inputSchema: {
			chain: CHAIN_ENUM.describe('Chain to browse'),
			limit: z.number().int().min(1).max(MAX_LIST_LIMIT).optional().describe(`Max offers to return (default ${DEFAULT_LIST_LIMIT})`),
		},
		annotations: { readOnlyHint: true, openWorldHint: true },
	}, safe(async ({ chain, limit }) => {
		const p2p = getP2P(chain);
		const max = limit || DEFAULT_LIST_LIMIT;
		const now = Math.floor(Date.now() / 1000);
		const isOpen = (loan) => statusName(loan.status) === 'Open' && (loan.offerExpiry === 0n || Number(loan.offerExpiry) > now);
		const { total, matches } = await scanLoans(p2p, isOpen, max);
		matches.sort((a, b) => (b.loan.boost > a.loan.boost ? 1 : b.loan.boost < a.loan.boost ? -1 : b.id - a.id));
		const addresses = matches.flatMap(({ loan }) => [loan.principalToken, loan.collateralToken]);
		const infoFor = await tokenInfoMap(chain, addresses);
		const offers = matches.map(({ id, loan }) => describeLoan(id, loan, infoFor, now));
		return jsonContent({
			chain: getChain(chain).name,
			totalLoansEver: total,
			openOffersReturned: offers.length,
			offers,
			next: 'Use p2p_get_loan for full detail and exact take quotes; p2p_take_offer to accept one.',
		});
	}));

	server.registerTool('p2p_get_loan', {
		title: 'Get P2P loan detail',
		description: 'Full detail for one loan id: terms, parties, status, what a taker must provide, repayment quote, default deadline/split and the on-chain terms hash.',
		inputSchema: {
			chain: CHAIN_ENUM,
			id: z.number().int().nonnegative().describe('Loan id'),
		},
		annotations: { readOnlyHint: true, openWorldHint: true },
	}, safe(async ({ chain, id }) => {
		const p2p = getP2P(chain);
		const loan = await p2p.getLoan(id);
		if (statusName(loan.status) === 'None') {
			throw new Error(`Loan ${id} does not exist on ${getChain(chain).name}.`);
		}
		const infoFor = await tokenInfoMap(chain, [loan.principalToken, loan.collateralToken]);
		const detail = describeLoan(id, loan, infoFor);
		const principalInfo = infoFor(loan.principalToken);
		const collateralInfo = infoFor(loan.collateralToken);

		const [pin, [takeToken, takeAmount], repayment] = await Promise.all([
			strongestPin(p2p, id, loan), p2p.quoteTake(id), p2p.quoteRepayment(id),
		]);
		const takeInfo = infoFor(takeToken) || principalInfo;
		if (pin.kind === 'hash') {
			detail.termsHash = pin.hash;
		} else {
			detail.termsPinning = `version-based (older deployment) — takes pin version ${Number(pin.version)}`;
		}
		detail.toTake = `${formatAmount(takeAmount, takeInfo.decimals)} ${takeInfo.symbol}`;
		detail.toRepay = `${formatAmount(repayment, principalInfo.decimals)} ${principalInfo.symbol} (principal + flat fee)`;

		if (statusName(loan.status) === 'Active') {
			const [deadline, defaultable, [toLender, toBorrower]] = await Promise.all([
				p2p.defaultDeadline(id), p2p.isDefaultable(id), p2p.quoteDefault(id),
			]);
			detail.repayDeadline = tsToIso(deadline);
			detail.defaultableNow = defaultable;
			detail.onDefault = {
				collateralToLender: `${formatAmount(toLender, collateralInfo.decimals)} ${collateralInfo.symbol}`,
				surplusToBorrower: `${formatAmount(toBorrower, collateralInfo.decimals)} ${collateralInfo.symbol}`,
			};
			// v2: the vested (cooling-off) figure — what repaying RIGHT NOW actually costs.
			if (p2pVersion(chain) === 2) {
				const [owedNow, feeNow] = await Promise.all([p2p.quoteRepaymentNow(id), p2p.effectiveFee(id)]);
				detail.toRepayNow = `${formatAmount(owedNow, principalInfo.decimals)} ${principalInfo.symbol} ` +
					`(vested fee so far: ${formatAmount(feeNow, principalInfo.decimals)} of ${formatAmount(loan.repaymentFee, principalInfo.decimals)} ${principalInfo.symbol})`;
			}
		}
		detail.explorer = `${getChain(chain).explorer}/address/${getChain(chain).p2pLoan}`;
		return jsonContent(detail);
	}));

	server.registerTool('p2p_my_loans', {
		title: 'My P2P loans',
		description: 'Every loan created by or assigned to an address (defaults to the configured wallet), with current status.',
		inputSchema: {
			chain: CHAIN_ENUM,
			address: z.string().optional().describe('Address to look up (defaults to the signing wallet)'),
		},
		annotations: { readOnlyHint: true, openWorldHint: true },
	}, safe(async ({ chain, address }) => {
		let who = address;
		if (!who) {
			if (!hasSigner()) {
				throw new Error('Provide an address, or configure FLASHBANK_MCP_PRIVATE_KEY so "my" has a meaning.');
			}
			who = await getSigner(chain).getAddress();
		}
		if (!ethers.isAddress(who)) {
			throw new Error(`"${who}" is not a valid address.`);
		}
		const p2p = getP2P(chain);
		const ids = await p2p.getUserLoans(who);
		const loans = [];
		for (const id of ids) {
			const loan = await p2p.getLoan(id);
			const infoFor = await tokenInfoMap(chain, [loan.principalToken, loan.collateralToken]);
			loans.push(describeLoan(id, loan, infoFor));
		}
		return jsonContent({ chain: getChain(chain).name, address: who, created: loans });
	}));

	// ------------------------------------------------------------------ flash-loan read tools

	server.registerTool('flash_pools', {
		title: 'Flash-loan pools',
		description: 'Per-token flash-loan liquidity on a chain: committed amount, live available liquidity, fee, per-loan cap and provider count.',
		inputSchema: { chain: CHAIN_ENUM },
		annotations: { readOnlyHint: true, openWorldHint: true },
	}, safe(async ({ chain }) => {
		const chainCfg = getChain(chain);
		const router = getRouter(chain);
		const pools = [];
		for (const token of chainCfg.tokens) {
			try {
				const [stats, available] = await Promise.all([
					router.getTokenStats(token.address),
					router.getActualAvailableLiquidity(token.address),
				]);
				pools.push({
					token: token.symbol,
					committed: `${formatAmount(stats.committed, token.decimals)} ${token.symbol}`,
					availableNow: `${formatAmount(available, token.decimals)} ${token.symbol}`,
					feeBps: Number(stats.feeBps),
					maxPerLoan: `${formatAmount(stats.maxFlashLoan, token.decimals)} ${token.symbol}`,
					maxBorrowOfPoolBps: Number(stats.maxBorrowBps),
					activeProviders: Number(stats.activeProviders),
				});
			} catch {
				pools.push({ token: token.symbol, note: 'not configured on this router' });
			}
		}
		return jsonContent({
			chain: chainCfg.name,
			router: chainCfg.flashRouter,
			pools,
			note: 'Flash loans must be taken by a smart contract implementing the borrower callback — see https://flashbank.net/flash.',
		});
	}));

	server.registerTool('flash_quote', {
		title: 'Quote a flash loan',
		description: 'Fee quote for flash-borrowing a given amount of a token (symbol or address) on a chain.',
		inputSchema: {
			chain: CHAIN_ENUM,
			token: z.string().describe('Token symbol (e.g. "WETH") or 0x address'),
			amount: z.string().describe('Human amount to borrow, e.g. "250"'),
		},
		annotations: { readOnlyHint: true, openWorldHint: true },
	}, safe(async ({ chain, token, amount }) => {
		const info = await resolveToken(chain, token);
		const raw = parseAmount(amount, info.decimals);
		const router = getRouter(chain);
		const [fee, available] = await Promise.all([
			router.quoteFee(info.address, raw),
			router.getActualAvailableLiquidity(info.address),
		]);
		return jsonContent({
			chain: getChain(chain).name,
			borrow: `${amount} ${info.symbol}`,
			fee: `${formatAmount(fee, info.decimals)} ${info.symbol}`,
			repayTotal: `${formatAmount(raw + fee, info.decimals)} ${info.symbol}`,
			liquidityAvailableNow: `${formatAmount(available, info.decimals)} ${info.symbol}`,
			fundable: available >= raw,
		});
	}));

	// ------------------------------------------------------------------ P2P write tools (gated)

	server.registerTool('p2p_create_offer', {
		title: 'Create a P2P offer',
		description: 'Post a loan offer (you lend) or borrow request (you borrow) on-chain. Escrows your side immediately: lenders escrow the principal, borrowers escrow the collateral. Reversible via p2p_cancel while untaken. Requires a signing key; mainnet additionally requires FLASHBANK_MCP_ALLOW_MAINNET=true.',
		annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
		inputSchema: {
			chain: CHAIN_ENUM,
			side: z.enum(['lend', 'borrow']).describe('"lend" = you provide the principal; "borrow" = you provide the collateral'),
			principalToken: z.string().describe('Token being lent — symbol or address'),
			collateralToken: z.string().describe('Token pledged as collateral — symbol or address'),
			principal: z.string().describe('Principal amount (human units, e.g. "1000")'),
			collateral: z.string().describe('Collateral amount (human units)'),
			flatFee: z.string().describe('Flat repayment fee in principal-token units (e.g. "30" = repay principal + 30). NOT a percentage.'),
			durationDays: z.number().min(0.01).max(365).describe('Loan term in days'),
			graceDays: z.number().min(0).max(90).optional().describe('Grace period after maturity (days, default 1)'),
			offerExpiryHours: z.number().min(0).optional().describe('Hours until the un-taken offer expires (default: never)'),
			coolingOffHours: z.number().min(0).optional().describe('v2 chains (Sepolia) only: cooling-off window in hours over which the fee vests. Omit or 0 = the protocol minimum for the term; longer is allowed, shorter rejects.'),
			settlementValue: z.string().optional().describe('Agreed value of ALL the collateral in principal-token units; surplus above the debt returns to the borrower on default. Omit for full forfeit.'),
			allowedTaker: z.string().optional().describe('Restrict who may take (address). Omit for open market.'),
		},
	}, safe(async ({ chain, side, principalToken, collateralToken, principal, collateral, flatFee, durationDays, graceDays, offerExpiryHours, coolingOffHours, settlementValue, allowedTaker }) => {
		assertWritesAllowed(chain);
		const version = p2pVersion(chain);
		if (coolingOffHours && version !== 2) {
			throw new Error(`coolingOffHours is a v2 feature; ${getChain(chain).name} runs the v1 contract (no cooling-off).`);
		}
		const pInfo = await resolveToken(chain, principalToken);
		const cInfo = await resolveToken(chain, collateralToken);
		if (allowedTaker && !ethers.isAddress(allowedTaker)) {
			throw new Error(`allowedTaker "${allowedTaker}" is not a valid address.`);
		}

		const creatorIsLender = side === 'lend';
		const principalRaw = parseAmount(principal, pInfo.decimals);
		const collateralRaw = parseAmount(collateral, cInfo.decimals);
		const feeRaw = parseAmount(flatFee, pInfo.decimals);
		const duration = Math.round(durationDays * SECONDS_PER_DAY);
		const grace = Math.round((graceDays ?? 1) * SECONDS_PER_DAY);
		const expiry = offerExpiryHours ? Math.floor(Date.now() / 1000) + Math.round(offerExpiryHours * SECONDS_PER_HOUR) : 0;

		const params = [
			creatorIsLender,
			allowedTaker || ethers.ZeroAddress,
			pInfo.address,
			cInfo.address,
			principalRaw,
			collateralRaw,
			feeRaw,
			duration,
			grace,
			expiry,
			// v2 inserts coolingOff here (0 = protocol minimum for the term).
			...(version === 2 ? [Math.round((coolingOffHours ?? 0) * SECONDS_PER_HOUR)] : []),
			false, // listed: direct/agent offers pay no interface fee
			ethers.ZeroAddress,
			0n, // service fee
			0n, // boost
			settlementValue ? parseAmount(settlementValue, pInfo.decimals) : 0n,
		];

		const p2p = getP2P(chain, true);
		const escrowToken = creatorIsLender ? pInfo : cInfo;
		const escrowAmount = creatorIsLender ? principalRaw : collateralRaw;
		const approvalTx = await ensureAllowance(chain, escrowToken.address, await p2p.getAddress(), escrowAmount);

		const tx = await p2p.createLoan(params);
		const receipt = await tx.wait();
		const created = receipt.logs.map((log) => { try { return p2p.interface.parseLog(log); } catch { return null; } })
			.find((parsed) => parsed && parsed.name === 'LoanCreated');
		const id = created ? Number(created.args.id) : null;

		return jsonContent({
			created: true,
			loanId: id,
			escrowed: `${creatorIsLender ? principal : collateral} ${escrowToken.symbol}`,
			approvalTx,
			tx: txLink(chain, tx.hash),
			next: `Share the id; a taker accepts with p2p_take_offer. Cancel any time before it is taken with p2p_cancel (id ${id}).`,
		});
	}));

	server.registerTool('p2p_take_offer', {
		title: 'Take a P2P offer',
		description: 'Accept an open offer, pinning the EXACT terms currently on-chain (takeWithTerms) so a last-second re-price reverts instead of surprising you. Approves and escrows your side, which activates the loan — a BINDING commitment until repaid or defaulted. Requires a signing key (mainnet gated).',
		annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
		inputSchema: {
			chain: CHAIN_ENUM,
			id: z.number().int().nonnegative().describe('Loan id to take'),
		},
	}, safe(async ({ chain, id }) => {
		assertWritesAllowed(chain);
		const p2p = getP2P(chain, true);
		const loan = await p2p.getLoan(id);
		if (statusName(loan.status) !== 'Open') {
			throw new Error(`Loan ${id} is ${statusName(loan.status)}, not Open.`);
		}
		const [pin, [takeToken, takeAmount]] = await Promise.all([strongestPin(p2p, id, loan), p2p.quoteTake(id)]);
		const info = await resolveToken(chain, takeToken);

		const signer = getSigner(chain);
		const me = await signer.getAddress();
		const balance = await getErc20(chain, takeToken).balanceOf(me);
		if (balance < takeAmount) {
			throw new Error(
				`Insufficient ${info.symbol}: need ${formatAmount(takeAmount, info.decimals)}, hold ${formatAmount(balance, info.decimals)}.` +
				(getChain(chain).isPlayground ? ' Use faucet_mint on Sepolia.' : '')
			);
		}
		const approvalTx = await ensureAllowance(chain, takeToken, await p2p.getAddress(), takeAmount);
		// Pin the exact reviewed terms: full terms-hash where the deployment supports it, otherwise
		// the version counter (older playground build) — either way a re-price reverts the take.
		const tx = pin.kind === 'hash'
			? await p2p.takeWithTerms(id, pin.hash)
			: await p2p.takeChecked(id, pin.version);
		await tx.wait();
		const repayment = await p2p.quoteRepayment(id);
		const pInfo = await resolveToken(chain, loan.principalToken);
		return jsonContent({
			taken: true,
			loanId: id,
			provided: `${formatAmount(takeAmount, info.decimals)} ${info.symbol}`,
			pinned: pin.kind === 'hash' ? `terms hash ${pin.hash}` : `offer version ${Number(pin.version)}`,
			approvalTx,
			tx: txLink(chain, tx.hash),
			repayBy: tsToIso(BigInt(Math.floor(Date.now() / 1000)) + BigInt(loan.duration) + BigInt(loan.gracePeriod)),
			toRepay: `${formatAmount(repayment, pInfo.decimals)} ${pInfo.symbol}`,
		});
	}));

	server.registerTool('p2p_repay', {
		title: 'Repay a P2P loan',
		description: 'Repay an active loan you borrowed, redeeming your collateral. On v2 chains (Sepolia) the fee is the VESTED amount — repaying inside the cooling-off window is rebated down to a 10% floor. Requires the signing wallet to be the borrower (mainnet gated).',
		annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
		inputSchema: { chain: CHAIN_ENUM, id: z.number().int().nonnegative() },
	}, safe(async ({ chain, id }) => {
		assertWritesAllowed(chain);
		const p2p = getP2P(chain, true);
		const loan = await p2p.getLoan(id);
		if (statusName(loan.status) !== 'Active') {
			throw new Error(`Loan ${id} is ${statusName(loan.status)}, not Active.`);
		}
		const maxOwed = await p2p.quoteRepayment(id);
		const pInfo = await resolveToken(chain, loan.principalToken);
		// Approve the maximum (principal + full fee): on v2 the contract pulls only the vested
		// figure at execution time, so the allowance always suffices and nothing overdraws.
		const approvalTx = await ensureAllowance(chain, loan.principalToken, await p2p.getAddress(), maxOwed);
		const tx = await p2p.repay(id);
		const receipt = await tx.wait();
		const result = {
			repaid: true,
			loanId: id,
			approvalTx,
			tx: txLink(chain, tx.hash),
			note: 'Collateral has been returned to the borrower wallet.',
		};
		const repaidEvent = receipt.logs
			.map((log) => { try { return p2p.interface.parseLog(log); } catch { return null; } })
			.find((parsed) => parsed && parsed.name === 'LoanRepaid');
		if (repaidEvent) {
			result.paid = `${formatAmount(repaidEvent.args.amountRepaid, pInfo.decimals)} ${pInfo.symbol}`;
			if (repaidEvent.args.feePaid !== undefined) {
				const rebate = BigInt(loan.repaymentFee) - BigInt(repaidEvent.args.feePaid);
				result.feePaid = `${formatAmount(repaidEvent.args.feePaid, pInfo.decimals)} ${pInfo.symbol}`;
				if (rebate > 0n) {
					result.coolingOffRebate = `${formatAmount(rebate, pInfo.decimals)} ${pInfo.symbol} of the agreed ${formatAmount(loan.repaymentFee, pInfo.decimals)} ${pInfo.symbol} fee was rebated (early exit)`;
				}
			}
		} else {
			result.paid = `${formatAmount(maxOwed, pInfo.decimals)} ${pInfo.symbol} (maximum; v1 charges the full flat fee)`;
		}
		return jsonContent(result);
	}));

	server.registerTool('p2p_claim_default', {
		title: 'Claim a defaulted P2P loan',
		description: 'After the repay window closes unpaid, the lender claims the collateral (any agreed surplus returns to the borrower). Irreversibly settles the loan. Requires the signing wallet to be the lender (mainnet gated).',
		annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
		inputSchema: { chain: CHAIN_ENUM, id: z.number().int().nonnegative() },
	}, safe(async ({ chain, id }) => {
		assertWritesAllowed(chain);
		const p2p = getP2P(chain, true);
		if (!(await p2p.isDefaultable(id))) {
			const deadline = await p2p.defaultDeadline(id);
			throw new Error(`Loan ${id} is not defaultable yet (repay window closes ${tsToIso(deadline) || 'n/a'}).`);
		}
		const [toLender, toBorrower] = await p2p.quoteDefault(id);
		const loan = await p2p.getLoan(id);
		const cInfo = await resolveToken(chain, loan.collateralToken);
		const tx = await p2p.claimDefault(id);
		await tx.wait();
		return jsonContent({
			claimed: true,
			loanId: id,
			collateralToLender: `${formatAmount(toLender, cInfo.decimals)} ${cInfo.symbol}`,
			surplusToBorrower: `${formatAmount(toBorrower, cInfo.decimals)} ${cInfo.symbol}`,
			tx: txLink(chain, tx.hash),
		});
	}));

	server.registerTool('p2p_cancel', {
		title: 'Cancel an open P2P offer',
		description: 'Cancel an offer you created that has not been taken, reclaiming your escrow (any boost spend is not refunded). Mainnet gated.',
		annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
		inputSchema: { chain: CHAIN_ENUM, id: z.number().int().nonnegative() },
	}, safe(async ({ chain, id }) => {
		assertWritesAllowed(chain);
		const p2p = getP2P(chain, true);
		const tx = await p2p.cancel(id);
		await tx.wait();
		return jsonContent({ cancelled: true, loanId: id, tx: txLink(chain, tx.hash), note: 'Escrow returned to the creator wallet.' });
	}));

	server.registerTool('p2p_withdraw_unclaimed', {
		title: 'Withdraw queued payouts (v2)',
		description: 'v2 chains (Sepolia) only: if a settlement payout to you could not be delivered (e.g. a blocklisting token), it queues on-chain — this checks your queued balance for a token and withdraws it.',
		annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
		inputSchema: {
			chain: CHAIN_ENUM,
			token: z.string().describe('Token symbol or 0x address the payout was in'),
		},
	}, safe(async ({ chain, token }) => {
		if (p2pVersion(chain) !== 2) {
			throw new Error(`${getChain(chain).name} runs the v1 contract, which has no pull-payout queue.`);
		}
		assertWritesAllowed(chain);
		const info = await resolveToken(chain, token);
		const p2p = getP2P(chain, true);
		const me = await getSigner(chain).getAddress();
		const queued = await p2p.unclaimed(info.address, me);
		if (queued === 0n) {
			return jsonContent({ withdrawn: false, queued: `0 ${info.symbol}`, note: 'Nothing queued for this wallet in that token.' });
		}
		const tx = await p2p.withdrawUnclaimed(info.address);
		await tx.wait();
		return jsonContent({ withdrawn: true, amount: `${formatAmount(queued, info.decimals)} ${info.symbol}`, tx: txLink(chain, tx.hash) });
	}));

	server.registerTool('faucet_mint', {
		title: 'Mint Sepolia play-money',
		description: 'Mint a free batch of 10,000 fpUSD or fpETH (valueless playground tokens) to the signing wallet on Sepolia. The safe way for agents to get funds to experiment with.',
		annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
		inputSchema: { token: z.enum(['fpUSD', 'fpETH']).describe('Which playground token to mint') },
	}, safe(async ({ token }) => {
		const chain = playgroundKey();
		assertWritesAllowed(chain);
		const info = await resolveToken(chain, token);
		if (!info.faucet) {
			throw new Error(`${token} has no faucet.`);
		}
		const erc20 = getErc20(chain, info.address, true);
		const tx = await erc20.faucet();
		await tx.wait();
		const balance = await erc20.balanceOf(await getSigner(chain).getAddress());
		return jsonContent({
			minted: `10,000 ${info.symbol}`,
			newBalance: `${formatAmount(balance, info.decimals)} ${info.symbol}`,
			tx: txLink(chain, tx.hash),
			reminder: 'Play-money with no value — Sepolia only.',
		});
	}));

	return server;
}

async function main() {
	const server = buildServer();
	const transport = new StdioServerTransport();
	await server.connect(transport);
	// stdout carries the MCP protocol; diagnostics must go to stderr only.
	console.error(`[flashbank-mcp] ready (v${SERVER_VERSION}) — writes ${hasSigner() ? 'enabled where permitted' : 'disabled (read-only)'}`);
}

// Allow tests to import buildServer without starting the transport.
const isDirectRun = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isDirectRun) {
	main().catch((error) => {
		console.error('[flashbank-mcp] fatal:', error);
		process.exit(1);
	});
}

export { buildServer };
