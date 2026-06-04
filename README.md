# FlashBank

Non-custodial, on-chain lending where **your funds stay in your wallet until the moment they're used**.
FlashBank is two complementary products that share that principle:

| Product | What it is | Contract | Page |
| --- | --- | --- | --- |
| **Flash Loans** | Atomic, same-transaction liquidity for arbitrage, liquidations and MEV. Lenders approve and commit WETH from their own wallet — no deposits — and earn a fee on every loan. | [`FlashBankRouter.sol`](contracts/FlashBankRouter.sol) | [`/`](https://flashbank.net) |
| **P2P Term Loans** | Fixed-term, collateral-backed loans agreed directly between two people. One flat fee instead of interest, settled purely on time — no pools, no price oracle, no liquidations to watch. | [`FlashBankP2PLoan.sol`](contracts/FlashBankP2PLoan.sol) | [`/flashbank-loan`](https://flashbank.net/flashbank-loan) |

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

Deploy with `npx hardhat run scripts/deploy-router.js --network <network>` (set `ADMIN_ADDRESS` /
`TESTNET_ADMIN_ADDRESS` in `.env`). Per-network addresses are read from `NEXT_PUBLIC_*` env vars by the website.

---

## P2P Term Loans

`FlashBankP2PLoan` is a neutral escrow that lets two parties flashbank a fixed-term, collateral-backed loan:

- **Time-only settlement.** Repay `principal + a flat fee` before `maturity + grace`, or the lender claims the collateral. Nothing is priced on-chain, so **no oracle is needed**.
- **Flat fee, not interest.** A single fixed fee rather than time-accruing interest — more compatible with faith-based finance that avoids *riba* (this is **not** a Sharia-certification claim).
- **Three optional, default-off fees:**
  - an opt-in **interface fee** (lender-paid, only on offers posted through flashbank; **0% introductory**),
  - an optional **boost** that buys featured marketplace placement ranked by spend (an advert, not interest — non-refundable),
  - a per-offer **service fee** to any address (insurance / third party).
  Go direct on the contract and it is **zero commission**.
- **Tokens are just ERC-20s.** On mainnet/L2 the escrow uses real assets (WETH, USDC, …). On the testnet playground, `fpETH`/`fpUSD` are free faucet tokens with no value.

Full design: [docs/design/P2P_LENDING_DESIGN.md](docs/design/P2P_LENDING_DESIGN.md).

### Live on Sepolia (playground — testnet only, no real value)

A self-serve playground is deployed on **Sepolia** so anyone can try the whole flow end-to-end. All
source is **verified on Etherscan**; only key material stays in the untracked `.env`. **Unaudited demo —
never send real assets.**

| Contract | Address (verified) |
| --- | --- |
| `FlashBankP2PLoan` (boost-enabled) | [`0x56E6…B607`](https://sepolia.etherscan.io/address/0x56E6aCB38ccFb82AC158955e8f7Dd2F59a66B607#code) |
| `PlaygroundToken` fpUSD (6d) | [`0x4aBb…760c`](https://sepolia.etherscan.io/address/0x4aBb056aA5aB39b55039ACAf795Ff9403Fa9760c#code) |
| `PlaygroundToken` fpETH (18d) | [`0xB9CC…96F5`](https://sepolia.etherscan.io/address/0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5#code) |

Try it: open [`/flashbank-loan`](https://flashbank.net/flashbank-loan), switch to Sepolia, hit the
faucet to mint test tokens, then post or take an offer (a few offers are pre-seeded, including boosted
ones to show ranking). Redeploy with `npx hardhat run scripts/deploy-playground.js --network sepolia`
(addresses recorded in `deployments/sepolia-playground.json`).

---

## Repository layout

```
contracts/            Solidity sources (FlashBankRouter, FlashBankP2PLoan, PlaygroundToken, demo + mocks)
test/                 Hardhat test suites
scripts/              Deployment, verification and operational scripts
website/              Next.js front end (static export, deployed to flashbank.net)
deployments/          Recorded deployment addresses per network
docs/                 Documentation (see docs/README.md) — architecture, security, deployment, design
```

> A previous deposit-based design, `FlashBankRevolutionary`, predates the no-deposit Router. Its
> contracts and notes are kept for historical context; the Router and P2P escrow are the current products.

---

## Quick start

```bash
npm install
npm run compile        # hardhat compile
npm test               # full hardhat test suite

# website
npm run website:dev    # local dev server on http://localhost:3000
npm run website:build  # static export
```

### Tests

The Solidity suites cover the router (flash-loan flow, owner-fee accrual, dual control, validation) and
the P2P escrow (lifecycle, time-based default, the three-tier fee model and boost, reentrancy, plus a
randomised fund-conservation fuzz test).

```bash
npm test                                        # everything
npx hardhat test test/FlashBankRouter.test.js   # router only
npx hardhat test test/FlashBankP2PLoan.test.js  # P2P only
```

---

## Documentation

Browse [`docs/`](docs/README.md) for the full set:

- **Architecture** — [overview](docs/architecture/ARCHITECTURE.md), [pool mechanics](docs/architecture/POOL_MECHANICS.md), [gas analysis](docs/architecture/GAS_ANALYSIS.md)
- **P2P design** — [P2P_LENDING_DESIGN.md](docs/design/P2P_LENDING_DESIGN.md)
- **Security** — [audit](docs/security/SECURITY_AUDIT.md), [reentrancy analysis](docs/security/REENTRANCY_ANALYSIS.md), [dual-control runbook](docs/security/DUAL_CONTROL.md)
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
