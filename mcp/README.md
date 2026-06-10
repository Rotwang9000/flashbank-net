# FlashBank MCP server

A [Model Context Protocol](https://modelcontextprotocol.io) server that lets AI agents browse,
quote and (optionally) transact with the FlashBank contracts — the **P2P term-loan escrow** and the
**flash-loan router** — on Ethereum, Base, Arbitrum and the Sepolia playground.

Self-contained: inline minimal ABIs, public RPCs, no Hardhat compilation needed. Read tools work
with **zero configuration**; write tools are opt-in and safety-gated.

```bash
cd mcp && npm install && npm test     # 14 tests, no network/key needed
npm run smoke                         # live read-only check against the deployed contracts
```

## Safety model

| Mode | Requirement | What it allows |
| --- | --- | --- |
| Read-only (default) | nothing | browse offers, quotes, pool stats, wallet lookups |
| Playground writes | `FLASHBANK_MCP_PRIVATE_KEY` | create/take/repay/claim/cancel + faucet on **Sepolia** |
| Mainnet writes | …and `FLASHBANK_MCP_ALLOW_MAINNET=true` | the same on Ethereum/Base — **real assets, real risk** |

Use a **dedicated throwaway key** for agents; never a key holding meaningful funds. Mainnet writes
are deliberately double-gated and the contracts carry **no external audit**.

## Tools

**Read (always available)**

| Tool | Purpose |
| --- | --- |
| `explain` | Plain-English primer on both products — agents should call this first |
| `list_chains` | Chains, contract addresses, registry tokens, current write permissions |
| `wallet_status` | Signer address + native/token balances on a chain |
| `p2p_list_offers` | Open offers, boosted first, with human-readable terms |
| `p2p_get_loan` | Full detail: terms, take quote, repayment quote, default split, terms pin |
| `p2p_my_loans` | Loans created by an address (or the signing wallet) |
| `flash_pools` | Flash-loan liquidity, fee bps, caps and provider count per token |
| `flash_quote` | Fee + fundability quote for a flash-borrow amount |

**Write (gated as above)**

| Tool | Purpose |
| --- | --- |
| `p2p_create_offer` | Post a lend offer / borrow request (escrows your side; handles the approval) |
| `p2p_take_offer` | Accept an offer, **pinning the exact reviewed terms on-chain** (terms hash where supported, version pin on the older Sepolia build) |
| `p2p_repay` | Repay principal + flat fee, redeeming collateral |
| `p2p_claim_default` | Lender claims collateral after the repay window closes |
| `p2p_cancel` | Cancel your untaken offer and reclaim escrow |
| `faucet_mint` | Mint 10,000 fpUSD/fpETH play-money (Sepolia only) |

Flash loans are quote/read only by design: executing one requires a smart contract implementing the
borrower callback, which is not something an MCP tool should improvise.

## Using it from Cursor

The repo ships a project-level `.cursor/mcp.json` that registers this server in **read-only** mode.
To enable writes, add env vars (throwaway key!):

```json
{
	"mcpServers": {
		"flashbank": {
			"command": "node",
			"args": ["mcp/src/server.js"],
			"env": {
				"FLASHBANK_MCP_PRIVATE_KEY": "0x<throwaway-key-funded-on-sepolia>"
			}
		}
	}
}
```

Any other MCP client works the same way — stdio transport, command `node mcp/src/server.js`.

## Environment variables

| Variable | Default | Meaning |
| --- | --- | --- |
| `FLASHBANK_MCP_PRIVATE_KEY` | unset | Signing key; unset = read-only |
| `FLASHBANK_MCP_ALLOW_MAINNET` | unset | `true` unlocks mainnet writes |
| `FLASHBANK_MCP_RPC_<CHAIN>` | public RPC | Override the RPC per chain, e.g. `FLASHBANK_MCP_RPC_ETHEREUM` |

## Layout

```
src/chains.js    chain registry (addresses, tokens, RPCs) — update on redeploys
src/abi.js       inline minimal ABIs (must mirror the deployed v1 contracts)
src/clients.js   providers, signer, write gate, token resolution, allowances
src/format.js    pure formatting helpers (unit-tested)
src/server.js    the MCP server + tool definitions
scripts/smoke.js live read-only smoke against the real deployments
test/            node:test suites incl. a full MCP stdio protocol test
```

When `FlashBankP2PLoanV2` ships, extend `src/abi.js` and the tools for the new `coolingOff` field,
`quoteRepaymentNow` and `withdrawUnclaimed` (see `docs/design/P2P_V2_COOLING_OFF.md`).
