# FlashBank

Non-custodial, on-chain lending where **your funds stay in your wallet until the moment they're used**.
FlashBank is two complementary products that share that principle:

| Product | What it is | Contract | Page |
| --- | --- | --- | --- |
| **Flash Loans** | Atomic, same-transaction liquidity for arbitrage, liquidations and MEV. Lenders approve and commit WETH from their own wallet — no deposits — and earn a fee on every loan. | [`flashloans/`](flashloans) · [`FlashBankRouter.sol`](flashloans/contracts/FlashBankRouter.sol) | [`/`](https://flashbank.net) |
| **P2P Term Loans** | Fixed-term, collateral-backed loans agreed directly between two people. One flat fee instead of interest, settled purely on time — no pools, no price oracle, no liquidations to watch. | [`loans/`](loans) · [`FlashBankP2PLoan.sol`](loans/contracts/FlashBankP2PLoan.sol) | [`/p2p`](https://flashbank.net/p2p) |

> **Branding rule:** "flashbank" is only ever used as a **verb** (you *flashbank* a loan). FlashBank is
> not a bank, does not hold deposits and takes no custody as a financial institution.

Website: **[flashbank.net](https://flashbank.net)** · Source: **[github.com/Rotwang9000/flashbank-net](https://github.com/Rotwang9000/flashbank-net)**

---

## Flash Loans (the Router)

`FlashBankRouter` is a multi-provider flash-loan pool where liquidity providers keep custody:

- **No deposits.** Providers approve the router and call `setCommitment(token, limit, expiry, paused)`. WETH stays in their wallet and is only pulled for the microseconds of a flash loan.
- **Atomic or nothing.** The borrower implements `IL2FlashLoan` and must repay `principal + fee` in the same transaction, or the whole thing reverts.
- **Configurable, bounded fees.** Per-token `feeBps` (1–100 bps) with a separate owner cut (`ownerFeeBps`) and a per-tx max-borrow share of the pool (`maxBorrowBps`).
- **Dual-control admin.** Sensitive changes (token config, ownership, profit withdrawal) use a propose-then-execute flow split between the `owner` and a separate `admin`. See [docs/security/DUAL_CONTROL.md](docs/security/DUAL_CONTROL.md).

Provider flow (WETH):

```js
await weth.deposit({ value: ethers.parseEther("5") });        // wrap ETH (stays in your wallet)
await weth.approve(routerAddress, ethers.MaxUint256);         // approve once
await router.setCommitment(wethAddress, ethers.parseEther("3"), 0, false); // lend up to 3 WETH
// pause/resume any time — just flip the paused flag or drop the limit to 0
```

Borrower flow (MEV / arbitrage bots):

```js
await router.flashLoan(
  wethAddress,
  ethers.parseEther("100"),
  true,            // receive native ETH (router unwraps WETH for you)
  strategyCalldata // forwarded to IL2FlashLoan.executeFlashLoan
);
```

Lives in [`flashloans/`](flashloans). Deploy with `cd flashloans && npx hardhat run scripts/deploy-router.js --network <network>`
(set `ADMIN_ADDRESS` / `TESTNET_ADMIN_ADDRESS` in the repository-root `.env`). Per-network addresses are read
from `NEXT_PUBLIC_*` env vars by the website.

---

## P2P Term Loans

`FlashBankP2PLoan` is a neutral escrow that lets two parties flashbank a fixed-term, collateral-backed loan:

- **Time-only settlement.** Repay `principal + a flat fee` before `maturity + grace`, or the lender claims the collateral. Nothing is priced on-chain, so **no oracle is needed**.
- **Optional surplus return (no oracle).** An offer can set an **agreed rate** (stored as `settlementValue` — how much principal the whole collateral is taken to be worth, frozen at origination); on default the borrower then recovers any collateral beyond `principal + fee`. Leave it `0` for a pure pledge/forfeit. This honours [Lorrow](https://whysideas.github.io/lorrow/)'s surplus-return guardrail without an oracle — see [`docs/design/LORROW_COMPATIBILITY.md`](docs/design/LORROW_COMPATIBILITY.md).
- **Editable offers, front-running-safe.** While an offer is open the creator can re-price or amend its non-escrow terms in place (`updateOffer`) and top up featured placement (`boostOffer`) without forfeiting the existing boost. Each edit bumps a `version`; a taker can call `takeChecked(id, version)` to pin the exact terms they reviewed.
- **Flat fee, not interest.** A single fixed fee rather than time-accruing interest — more compatible with faith-based finance that avoids *riba* (this is **not** a Sharia-certification claim).
- **Three optional, default-off fees:**
  - an opt-in **interface fee** (lender-paid, only on offers posted through flashbank; **0% introductory**),
  - an optional **boost** that buys featured marketplace placement ranked by spend (an advert, not interest — non-refundable),
  - a per-offer **service fee** to any address (insurance / third party).
  Go direct on the contract and it is **zero commission**.
- **Tokens are just ERC-20s.** On mainnet/L2 the escrow uses real assets (WETH, USDC, …). On the testnet playground, `fpETH`/`fpUSD` are free faucet tokens with no value.

Lives in [`loans/`](loans). Full design: [docs/design/P2P_LENDING_DESIGN.md](docs/design/P2P_LENDING_DESIGN.md).

### Live on mainnet (Ethereum + Base)

`FlashBankP2PLoan` is deployed and **verified** on mainnet — judged solid by the [self-audit](https://flashbank.net/audit)
and shipped while ETH gas was cheap. Same bytecode on each chain; `Ownable`, fee recipient = Vultisig vault,
**0 bps introductory** (a listing fee only ever applies to offers that opt in via `listed`, hard-capped on-chain at 1%).
**No external audit — use real assets at your own risk.**

| Chain | `FlashBankP2PLoan` (verified) |
| --- | --- |
| Ethereum | [`0x131C…18A0`](https://etherscan.io/address/0x131C8545b28bca9063B364380956Df33A70018A0#code) |
| Base | [`0x86Fb…FcbB`](https://basescan.org/address/0x86FbF8e03f8A6f3eF52062E3f81627F64aa5FcbB#code) |

The mainnet UI uses real WETH/USDC. (Arbitrum pending — deployer balance too thin to deploy yet; add later
with `MAX_FEE_GWEI` pinned low.) Per-chain records in `loans/deployments/*-p2p.json`.

**Mainnet interface is restricted to ETH and USDC for now** — custom-token entry is testnet-only — so the
front end never invites an unknown/fake token (the contract itself stays permissionless for anyone calling
it directly).

**v2 — live on the Sepolia playground.** [`FlashBankP2PLoanV2`](loans/contracts/FlashBankP2PLoanV2.sol)
adds on-chain token sanity-validation, a **graduated cooling-off rebate** (the flat fee vests from a 10%
floor so a near-instant return is cheap — killing fake-token fee-farming — while consuming a listing is
never free, and a same-block guard stops free flash loans), and **pull-payout fallbacks** so a
blocklisted recipient can never brick the other party's repayment or default claim. Adversarially
reviewed, unit-tested (22 cases) and **deployed to Sepolia** (verified, seeded) where it has passed a
live two-agent lifecycle drill; mainnets stay on v1 until it graduates. Full pitfall analysis in
[docs/design/P2P_V2_COOLING_OFF.md](docs/design/P2P_V2_COOLING_OFF.md).

### Live on Sepolia (playground — testnet only, no real value)

A self-serve playground is deployed on **Sepolia** so anyone can try the whole flow end-to-end — it
runs the **v2 escrow**, so the cooling-off rebate and pull-payouts are live there first. All source
is **verified on Etherscan**; only key material stays in the untracked `.env`. **Unaudited demo —
never send real assets.**

| Contract | Address (verified) |
| --- | --- |
| `FlashBankP2PLoanV2` (cooling-off rebate + token checks + pull-payouts) | [`0x536f…1E76`](https://sepolia.etherscan.io/address/0x536f4C17C18854943a45841Fef4b3054ED281E76#code) |
| `PlaygroundToken` fpUSD (6d) | [`0x4aBb…760c`](https://sepolia.etherscan.io/address/0x4aBb056aA5aB39b55039ACAf795Ff9403Fa9760c#code) |
| `PlaygroundToken` fpETH (18d) | [`0xB9CC…96F5`](https://sepolia.etherscan.io/address/0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5#code) |

Try it: open [`/p2p`](https://flashbank.net/p2p), switch to Sepolia, hit the
faucet to mint test tokens, then post or take an offer (a few offers are pre-seeded, including boosted
ones to show ranking and one with a creator-set 2-day cooling window). Redeploy with
`cd loans && npx hardhat run scripts/deploy-playground-v2.js --network sepolia`
(addresses recorded in `loans/deployments/sepolia-playground-v2.json`; the retired v1 playground
`0x3Ce4…1017` stays on-chain).

---

## For AI agents (MCP)

[![npm](https://img.shields.io/npm/v/%40flashbank%2Fmcp?label=%40flashbank%2Fmcp)](https://www.npmjs.com/package/@flashbank/mcp)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-io.github.Rotwang9000%2Fflashbank-8A2BE2)](https://registry.modelcontextprotocol.io/v0/servers?search=flashbank)
[![Listed on Glama](https://img.shields.io/badge/Glama-flashbank-blue)](https://glama.ai/mcp/servers/Rotwang9000/flashbank-net)

```bash
npx -y @flashbank/mcp     # zero-config read-only MCP server, any MCP client
```

The repo ships a self-contained **Model Context Protocol server** ([`mcp/`](mcp), published as
[`@flashbank/mcp`](https://www.npmjs.com/package/@flashbank/mcp), listed in the [official MCP
Registry](https://registry.modelcontextprotocol.io/v0/servers?search=flashbank) and on
[Glama](https://glama.ai/mcp/servers/Rotwang9000/flashbank-net)) so agents can
flashbank too: browse open P2P offers, get quotes, check flash-loan liquidity and fees — and, with
an explicitly configured throwaway key, post/take/repay loans and use the Sepolia faucet. Reads need
no configuration; **mainnet writes are double-gated** behind `FLASHBANK_MCP_PRIVATE_KEY` *and*
`FLASHBANK_MCP_ALLOW_MAINNET=true`. Takes always pin the exact reviewed terms on-chain, and on v2
chains the tools quote vested fees and report cooling-off rebates. The whole lifecycle is proven by
a **live two-agent drill** (`npm run drill`) that walks faucet → create → take → early repay (rebate
verified) → cancel through two real MCP server instances on Sepolia. Details and the tool catalogue:
[`mcp/README.md`](mcp/README.md).

---

## Repository layout

Each feature is a **self-contained Hardhat project**. The two never import each other's Solidity,
so you can fork this repo, delete the feature you don't want, and the other still compiles, tests
and deploys.

```
flashloans/           Flash-loan router feature — own contracts/, test/, scripts/, test-scripts/, hardhat.config.js
loans/                P2P term-loan feature — own contracts/, test/, scripts/, deployments/, hardhat.config.js
common/               Shared toolchain (hardhat.base.js) inherited by both features — do not delete
website/              Next.js front end (static export, deployed to flashbank.net) — showcases both features
mcp/                  Model Context Protocol server so AI agents can browse/quote/transact (see mcp/README.md)
docs/                 Documentation (see docs/README.md) — architecture, security, deployment, design
package.json          Thin root: installs the shared dependencies and runs both features' scripts
```

**Want only one feature?** Delete the other top-level directory:

```bash
rm -rf flashloans   # keep just the P2P term loans
# ...or...
rm -rf loans        # keep just the flash-loan router
```

`common/` is shared by both and must stay. The `website/` is a combined shopfront; if you drop a
feature, also remove its page (`website/src/pages/index.tsx` for flash loans,
`website/src/pages/p2p.tsx` for P2P) and its link in `website/src/components/Nav.tsx`.

> A previous deposit-based design, `FlashBankRevolutionary`, predates the no-deposit Router. Its
> contracts and notes live under `flashloans/` for historical context; the Router and P2P escrow are
> the current products.

---

## Quick start

```bash
npm install            # installs the shared toolchain both features build against
npm run compile        # compile both features
npm test               # run both features' test suites

# work inside a single feature
cd flashloans && npx hardhat test
cd loans && npx hardhat test

# website
npm run website:dev    # local dev server on http://localhost:3000
npm run website:build  # static export
```

Dependencies are installed once at the repository root; each feature resolves Hardhat, the plugins
and OpenZeppelin from there, so there is no per-feature `npm install`.

### Tests

The Solidity suites cover the router (flash-loan flow, owner-fee accrual, dual control, validation) and
the P2P escrow (lifecycle, time-based default, the three-tier fee model and boost, reentrancy, plus a
randomised fund-conservation fuzz test).

```bash
npm test                            # both features
npm run test:flashloans             # router suite only
npm run test:loans                  # P2P suite only
```

---

## Documentation

Browse [`docs/`](docs/README.md) for the full set:

- **Architecture** — [overview](docs/architecture/ARCHITECTURE.md), [pool mechanics](docs/architecture/POOL_MECHANICS.md), [gas analysis](docs/architecture/GAS_ANALYSIS.md)
- **P2P design** — [P2P_LENDING_DESIGN.md](docs/design/P2P_LENDING_DESIGN.md), [Lorrow compatibility](docs/design/LORROW_COMPATIBILITY.md)
- **Security** — the live [honest audit page](https://flashbank.net/audit) (both features, candid: trust assumptions, what's tested, known limits), plus [router audit notes](docs/security/SECURITY_AUDIT.md), [reentrancy analysis](docs/security/REENTRANCY_ANALYSIS.md), [dual-control runbook](docs/security/DUAL_CONTROL.md)
- **Deployment** — [guide](docs/deployment/DEPLOYMENT.md), [website](docs/deployment/WEBSITE_DEPLOYMENT.md), [live networks](docs/deployment/LIVE_NETWORKS.md)

Vulnerability disclosure: [SECURITY.md](SECURITY.md) · Contributing: [CONTRIBUTING.md](CONTRIBUTING.md) ·
Changes: [CHANGELOG.md](CHANGELOG.md)

---

## Disclaimers

Experimental, unaudited DeFi software. Smart contracts can have bugs; collateral values can move during a
loan term; flash-loan profitability depends on market opportunities. Use at your own risk and do your own
research.

## License

[MIT](LICENSE).
