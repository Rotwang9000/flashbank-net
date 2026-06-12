# Launch kit

Ready-to-post copy for getting flashbank.net in front of people. Everything below is honest:
no "audited", no yield promises, no "bank". **flashbank is always a verb.**

Channels we can't automate (need the human): X/Twitter, Hacker News, Reddit, Farcaster,
Discord/Telegram communities. Copy-paste from here and adapt.

---

## One-liners (bios, link drops, replies)

- Flash loans and fixed-fee P2P term loans with no oracles, no custody and no interest clock — plus an MCP server so your AI agent can flashbank too. https://flashbank.net
- Time-based lending: repay before the deadline or the collateral moves. No price feeds, no margin calls, one flat fee. https://flashbank.net
- `npx -y @flashbank/mcp` — give any AI agent read access to live flash-loan liquidity and P2P loan offers on Ethereum, Base and Arbitrum.

## X / Twitter thread

**1/** Most lending protocols need price oracles, liquidation bots and interest-rate models.

We built one that needs none of those. It settles on the only thing a blockchain measures perfectly: time.

flashbank.net — here's how it works 🧵

**2/** P2P term loans:

— lender escrows the principal, borrower escrows collateral
— one flat fee agreed up front. No interest. No APR.
— repay before the deadline → collateral back
— miss it → lender claims the collateral

No oracle. No margin call. Nothing to manipulate.

**3/** Because the fee is a fixed amount (not a rate that grows with time), it's compatible with interest-free finance requirements. The borrower knows the total cost to the penny before signing.

**4/** Taking an offer pins the exact reviewed terms on-chain (a terms-hash). If the lender edits the offer while your transaction is in flight, your take reverts instead of binding you to terms you never saw.

**5/** The v2 escrow (live on the Sepolia playground) adds a graduated cooling-off rebate: return the loan early and most of the fee vests back to you, with a floor that keeps spam-borrowing unprofitable. Fake-token griefing and blocklist-token traps are handled too.

**6/** Flash loans, same philosophy: liquidity never leaves the providers' wallets (allowance-based, no deposits), fees are capped, and the router is immutable. Live on Ethereum, Base and Arbitrum.

**7/** And your AI agent can use all of it:

npx -y @flashbank/mcp

15 MCP tools — browse offers, quote fees, check liquidity, and (with a throwaway key, double-gated) transact on the playground. Listed on the official MCP Registry and Glama.

**8/** Everything is open source, contracts verified on Etherscan, and the audit page is a self-audit that leads with the limitations — because nobody has audited this and we'd rather tell you that ourselves.

Free play-money playground on Sepolia: flashbank.net

## Show HN

**Title:** Show HN: Lending with no price oracles — loans settle on time, not price

**Body:**

flashbank.net is two small DeFi products built around one idea: the only thing a blockchain
measures perfectly is time, so use that instead of price feeds.

P2P term loans: lender and borrower escrow into a neutral contract, agree one flat fee up
front (no interest accrual), and settlement is purely temporal — repay before the deadline or
the collateral becomes claimable. No oracles, no liquidation bots, no margin calls, nothing
for an attacker to manipulate. Because the fee is a fixed amount rather than a rate, it also
happens to satisfy interest-free finance requirements.

Flash loans: allowance-based router where liquidity never leaves the providers' wallets,
with capped fees. Live on Ethereum, Base and Arbitrum.

Things I think are interesting:
- Takes pin a hash of the exact reviewed terms on-chain, so an offer edited mid-flight
  reverts your take rather than binding you to unseen terms.
- v2 escrow has a graduated cooling-off rebate (early repayment refunds most of the fee,
  with an anti-spam floor) and pull-payout fallbacks for blocklist tokens like USDC.
- There's an MCP server (`npx -y @flashbank/mcp`) so AI agents can browse offers and quote
  fees with zero config; writes need an explicit throwaway key and mainnet writes are
  double-gated.
- The "audit" page is a self-audit that leads with the limitations. No external audit yet
  and the site says so loudly.

Everything (contracts, site, MCP server) is MIT in one repo:
https://github.com/Rotwang9000/flashbank-net
Free playground with faucet tokens on Sepolia if you want to try it with zero risk.

## Reddit (r/ethdev, r/ethereum — adjust tone per sub)

**Title:** Built a lending escrow with no oracles — settlement is purely time-based. Sepolia playground + MCP server for agents.

**Body:**

I kept coming back to the idea that price-oracle liquidations are the most fragile part of
on-chain lending, so I built a P2P term-loan escrow that doesn't have any: lender escrows
principal, borrower escrows collateral, one flat fee agreed up front, and the only condition
is the clock — repay by the deadline or the collateral is claimable.

Design notes for the sceptical:
- Terms are pinned on-chain at take-time via a terms-hash, so offer edits can't front-run a take.
- The v2 contract (Sepolia) adds a graduated cooling-off rebate so short borrows refund most
  of the fee — with a vested floor so faucet-style spam borrowing stays unprofitable.
- Fee-on-transfer tokens are rejected by balance-delta accounting; payouts that revert
  (blocklisted recipients) queue for pull-withdrawal instead of bricking settlement.
- Fixed fee, no interest accrual — incidentally Sharia-compatible.

There's also a flash-loan router (allowance-based, liquidity stays in provider wallets) and
an MCP server (`npx -y @flashbank/mcp`) if you want your agent to poke at it.

All MIT, verified on Etherscan, unaudited (the audit page is an honest self-audit):
https://flashbank.net — playground with faucet play-money on Sepolia.

Happy to be told what I've missed — adversarial review is the point of posting.

## Farcaster / shorter communities

Lending that settles on time, not price. No oracles, no margin calls, one flat fee.
P2P term loans + flash loans, live on Ethereum/Base/Arbitrum, free playground on Sepolia.
Agents: `npx -y @flashbank/mcp`. All open source. https://flashbank.net

## Directories & registries (status)

| Where | Status |
| --- | --- |
| npm (`@flashbank/mcp`) | ✅ published |
| Official MCP Registry (`io.github.Rotwang9000/flashbank`) | ✅ published (PulseMCP and others index from it) |
| Glama | ✅ listed + claimed (`glama.json`) |
| GitHub topics/description/homepage | ✅ set (mcp, flash-loans, defi, p2p-lending, …) |
| awesome-mcp-servers lists | ☐ PR when the server has some mileage |
| DeFiLlama / DefiPulse style TVL listings | ☐ needs sustained mainnet TVL first |
| Dune dashboard | ☐ nice-to-have: public dashboard of loans/fees |

## Posting checklist

- [ ] Post the X thread from the project account; pin it.
- [ ] Show HN early UK morning (US overnight) on a weekday; first comment = honest limitations.
- [ ] r/ethdev first (technical), then r/ethereum if it lands well.
- [ ] Drop the one-liner + playground link in relevant Discord/Telegram dev channels (no spam).
- [ ] Reply to oracle-manipulation / liquidation post-mortems with the "no oracles" angle when genuinely relevant.
