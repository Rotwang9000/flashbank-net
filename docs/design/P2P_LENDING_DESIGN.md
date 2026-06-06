# P2P Term Lending — Design Notes

> Status: **draft / proposal**. New feature line for flashbank.net, distinct from the
> existing same-block flash-loan router. Origin: an idea raised on X (peer-to-peer
> lending/borrowing, no pools, no protocol exposure), extended with the points below.

## Branding rule (important)

**"flashbank" is only ever used as a _verb_.** We describe the action — you *flashbank*
a loan, assets get *flashbanked* peer-to-peer — and never assert that flashbank is a bank,
holds deposits, or takes custody as a financial institution. All UI copy, docs and NatSpec
must follow this. Avoid noun phrasing such as "the bank", "deposit at flashbank", "your
flashbank account".

## What this is

A peer-to-peer, **fixed-term, collateral-backed loan marketplace**. Two parties agree
terms directly; the smart contract is a neutral escrow that holds collateral (and, while an
offer is open, the lender's principal) and enforces the timeline. It is effectively a
trustless pawn / sell-and-buyback (repo): borrow now against collateral, redeem the
collateral by repaying on time, or forfeit it.

This is **not** Aave-style pooled lending. There are no pools, no shared liquidity, no
protocol balance-sheet risk. Every loan is one lender ↔ one borrower.

## The three design decisions that make it simple

### 1. Time-only liquidation → no price oracle

Liquidation is triggered **purely by time**, never by price:

- Borrower locks collateral and receives the principal.
- Borrower must repay `principal + fixedFee` before `maturity + gracePeriod`.
- Repaid in time → collateral returned to borrower.
- Not repaid in time → lender claims the collateral. Borrower keeps the principal.

Because nothing is ever valued on-chain, we need **no price feeds, no margin calls, no
keepers watching health factors**. The lender's only protection against the collateral
falling below the loan is to demand *enough* collateral up front — and since the lender
chooses the terms, that risk is theirs to price in. Short terms + healthy
over-collateralisation keep it sane. We document this risk explicitly; we do not try to
manage it on-chain.

### 2. Flat fee, not interest

The borrower repays a **single fixed fee** (`repaymentFee`), set in the offer, rather than
time-accruing interest. This is more compatible with faith-based finance that prohibits
*riba* (interest).

> ⚠️ This is **not** a claim of formal Sharia certification. A flat fee on a loan can still
> be challenged under some interpretations; true compliance (murabaha/ijara structuring,
> scholarly review) is out of scope here. We say "interest-free / fixed fee", not
> "Sharia-compliant", unless/until reviewed by a qualified scholar.

### 3. Optional, customisable fees — direct P2P pays nothing

Three independent fee sinks, **all default-off**:

| Fee | Who pays | When | Goes to | Toggle |
|-----|----------|------|---------|--------|
| **Interface / listing fee** | Lender | At funding | `protocolFeeRecipient` (us) | only if offer flagged `listed` |
| **Boost** (featured placement) | Creator | At creation | `protocolFeeRecipient` (us) | per-offer `boost`, `0` = none |
| **Service fee** | Borrower (deducted from disbursement) | At activation | any `serviceFeeRecipient` (insurer / third party) | per-offer, `0` = none |

- The **interface fee** is a basis-point cut of principal, snapshotted at offer creation. It's
  what posting *through the flashbank front-end* costs (the UI sets `listed`); calling the
  contract directly with `listed = false` pays nothing. It is hard-capped
  (`MAX_PROTOCOL_FEE_BPS`) and **set to `0` for now — an introductory waiver** (intended
  ~0.01% later). Note the contract can't tell which UI posted an offer, so the only on-chain
  signal is the creator-set `listed` flag.
- The **boost** is a flat, creator-chosen amount in the principal token, paid **straight to the
  protocol at creation** and recorded on the loan. It buys featured placement: the marketplace
  ranks open offers by `boost` descending, so *paying more ranks higher*. It is an advertising
  spend, **not escrow** — it is forwarded immediately and is **not refunded on cancel**. A
  boost with no `protocolFeeRecipient` set reverts.
- The **service fee** is a flat amount in the principal token, set per offer to any address
  — e.g. an insurance premium or a third-party arrangement fee. It is carved out of the
  borrower's disbursement (borrower receives `principal − serviceFee`) and forwarded
  immediately on activation.
- **Call the contract directly, leave all unset → zero commission.** This is the
  "do it P2P and direct on the contract" path. The faucet tokens (`fpETH`/`fpUSD`) exist
  **only on the testnet playground**; the escrow itself is token-agnostic, so mainnet/L2 use
  real ERC-20s (WETH, USDC, …) — there is nothing flashbank-specific about the assets.

## Lifecycle

```
                 create                take                 repay
   (lender or  ─────────▶  Open  ────────────▶  Active  ───────────────▶  Repaid
    borrower)               │                     │
                            │ cancel              │ (deadline + grace passes, unpaid)
                            ▼                     ▼
                        Cancelled             Defaulted  (lender claims collateral)
```

Either side can be the **creator**:

- **Lender-initiated offer** (`creatorIsLender = true`): lender escrows `principal`
  (+ listing fee) on create; a borrower `take`s it by depositing collateral and receives
  the principal.
- **Borrower-initiated request** (`creatorIsLender = false`): borrower escrows `collateral`
  on create; a lender `take`s it by providing the principal (+ listing fee).

An offer may target a specific `allowedTaker` (private, direct P2P) or be left open
(`address(0)` = open market). Offers can carry an `offerExpiry` after which they can't be
taken.

### Funds flow (always balanced, no oracle)

At **creation**, any `boost` is pulled in the principal token and forwarded to
`protocolFeeRecipient` immediately (never escrowed, never refunded). At **activation** the
principal side distributes to: `protocolFeeRecipient` (interface fee), `serviceFeeRecipient`
(service fee), and the borrower (`principal − serviceFee`). The interface fee is only actually
paid when a loan activates; a listed lender-offer that is cancelled refunds the lender in full
(minus any boost already spent).

- **Repay:** borrower pays `principal + repaymentFee` → lender; collateral → borrower.
- **Default:** after `maturity + gracePeriod`, lender claims collateral; borrower keeps principal.
- **Cancel (Open only):** creator reclaims whatever they escrowed.

## Scope / conventions for v1

- **ERC-20 on both sides.** Native ETH is handled by wrapping to WETH (consistent with the
  existing `FlashBankRouter`). NFT (ERC-721) collateral is a future extension.
- **Fee-on-transfer / rebasing tokens are unsupported** — transfers must arrive exactly, or
  the call reverts (keeps agreed terms exact).
- Solidity `0.8.24`, OpenZeppelin v4 (`Ownable`, `ReentrancyGuard`, `SafeERC20`), tabs,
  custom errors, basis points — matching `flashloans/contracts/FlashBankRouter.sol`.
- Default handling has two modes, chosen per offer via `settlementValue` (the agreed worth of the
  whole collateral in principal-token units, frozen at origination — **not** an oracle):
  - `settlementValue == 0` → **full forfeit** (pledge/pawn style): the lender takes all collateral.
  - `settlementValue > 0` → **surplus return**: the lender keeps only the collateral covering
    `principal + repaymentFee` (`collateral * debt / settlementValue`, rounded in the borrower's
    favour) and the surplus returns to the borrower. If the agreed value does not even cover the
    debt, the lender takes everything and absorbs the shortfall. See
    [LORROW_COMPATIBILITY.md](LORROW_COMPATIBILITY.md) (Option B).
- Configurable penalties / partial repayment remain future work.

## Risks to surface in the UI

- **Collateral can fall below the loan during the term** (no liquidation until maturity).
  Lenders mitigate by over-collateralising and keeping terms short. This is the lender's risk.
- **On default the borrower forfeits collateral.** With a `settlementValue` set they recover any
  surplus beyond `principal + repaymentFee`; with it unset (`0`) they forfeit the whole collateral,
  which can be worth more than the loan — show this clearly before they post or take an offer.
- Smart-contract risk, token risk (malicious/rug tokens chosen by a counterparty).

## Deployed playground (Sepolia testnet — no real value)

A self-serve playground is live on Sepolia with all source **verified on Etherscan**. The
interface fee is `0` (introductory), tokens are openly mintable via a faucet, and offers are
pre-seeded. Addresses are recorded in `loans/deployments/sepolia-playground.json`:

| Contract | Address |
| --- | --- |
| `FlashBankP2PLoan` (boost + surplus-return) | `0x990fc07f704e287dEB309B05420C6b19847145dA` |
| `PlaygroundToken` fpUSD (6 decimals) | `0x4aBb056aA5aB39b55039ACAf795Ff9403Fa9760c` |
| `PlaygroundToken` fpETH (18 decimals) | `0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5` |

The `PlaygroundToken`s are **reused** across redeploys (their addresses — and faucet links —
stay stable); only the P2P address changes. Seeded offers `#0`/`#1` carry a boost (50/15 fpUSD)
to demonstrate featured ranking; `#2` is a plain lend offer and `#3` a plain borrow request.

Redeploy: `cd loans && npx hardhat run scripts/deploy-playground.js --network sepolia`, then
`npx hardhat verify --network sepolia <address> <constructor args>` (the deploy script prints
the exact verify commands). The website bakes these as defaults for chain `11155111`, overridable
via `NEXT_PUBLIC_SEPOLIA_P2P_LOAN_ADDRESS` / `_FPUSD_ADDRESS` / `_FPETH_ADDRESS`.

## Next steps (not in this pass)

- ~~Marketplace UI on the website~~ — shipped at `website/src/pages/flashbank-loan.tsx`.
- ~~Deploy script~~ — shipped (`deploy-p2p-loan.js`, plus `deploy-playground.js` for testnets).
- Mainnet/L2 addresses (currently only the Sepolia playground is live).
- Optional: ERC-721 collateral, configurable penalties, permit-based funding.

## Artifacts in this change

- `loans/contracts/FlashBankP2PLoan.sol` — the escrow/marketplace contract.
- `loans/contracts/PlaygroundToken.sol` — freely-mintable faucet ERC-20 for testnet playgrounds.
- `loans/test/FlashBankP2PLoan.test.js` — 32 unit tests (happy path, default, cancel, both offer
  directions, fees, **featured boost**, edge cases, reentrancy, randomised fund-conservation fuzzing).
- `loans/scripts/deploy-p2p-loan.js` — generic deploy script.
- `loans/scripts/deploy-playground.js` — Sepolia playground deploy (P2P + reused faucet tokens + a
  spread of seeded offers, including boosted ones to show ranking).
- `website/src/pages/flashbank-loan.tsx` — the marketplace UI (Browse / Flashbank a loan / Your
  loans / How it works) with the Sepolia playground.
- `website/src/components/HowItWorks.tsx` — the "How it works" panel: lifecycle + timeline
  diagrams, the fee model, and the transparency "proofs".
