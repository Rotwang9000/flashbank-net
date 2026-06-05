# FlashBank P2P × Lorrow compatibility

An assessment of how [`FlashBankP2PLoan`](../../loans/contracts/FlashBankP2PLoan.sol) relates to the
**Lorrow Framework Specification v1.0** (a standard for bilateral collateralized lending, originated by
WHYSIDEAS — <https://whysideas.github.io/lorrow/>), and whether we can be compatible **without losing our
two core intents**:

1. **Time-only settlement, no price oracle.** A loan defaults purely because a deadline passed, never
   because a price moved. There is no oracle anywhere in the contract.
2. **A flat fee, not interest.** The borrower's whole cost is one fixed `repaymentFee`, not a
   time-accruing rate (friendlier to faith-based finance that avoids *riba*).

## TL;DR

FlashBank P2P and Lorrow share the same **philosophy** — bilateral, fixed-term, collateralized, pure
escrow, no pools, no protocol-set rates, immutable terms, a dual order book and visible commitment. But
**Lorrow Core, as written, mandates three things that directly collide with our two intents**: an
oracle-priced `breach_threshold`, an `interest_rate`, and **mandatory surplus return at default**.

So today we are **Lorrow-*spirited*, not Lorrow-*compatible*** in the strict sense the spec defines, and
becoming strictly compatible would mean adding an oracle and giving up the flat-fee framing — i.e. losing
the core intents. What we *can* do without losing them is adopt Lorrow's **common grammar** (variable
names, lifecycle states, events) and **publish an Implementation Profile**, then propose to WHYSIDEAS a
small Core extension that recognises a *time-settled, flat-fee* profile. One genuinely promising bridge —
**a pre-agreed settlement price fixed at origination** — would even let us honour Lorrow's surplus-return
guardrail with *no oracle at all* (see [Option B](#option-b--add-surplus-return-without-an-oracle)).

## Where we already align

| Lorrow principle | FlashBank P2P |
| --- | --- |
| Bilateral agreement, no pools, no protocol-set rate | ✅ `creator` ↔ `taker`, contract is pure escrow |
| Immutable terms once created | ✅ no function mutates an active loan; admin cannot touch live loans |
| Escrow model (locked posts) | ✅ principal/collateral is always escrowed on `createLoan` — the strongest "locked post" in Lorrow's commitment model |
| Cancel returns escrow; posts can expire | ✅ `cancel()` refunds escrow; `offerExpiry` times out open offers |
| Optional protocol fee, bounded, disclosed up front | ✅ `protocolFeeBps` is capped at **100 bps** — exactly Lorrow's "Optional Fee Hook ≤ 100 bps" |
| Frontend independence | ✅ the contract is usable directly; the website is just one interface |
| Transparent commitment signal | ◐ we use a paid `boost` for ranking rather than an on-chain Commitment Score (different mechanism, same goal of a visible signal) |

## Where we deliberately differ (and why)

| Lorrow Core requirement | FlashBank P2P | Why we differ |
| --- | --- | --- |
| `breach_threshold` ≥ 110%, oracle-priced, with `reportBreach`/`checkRecovery` and a breach window | **None.** No oracle, no breach state | Core intent #1. Oracles are the main attack surface and complexity in collateralized lending; time-only settlement removes them entirely. |
| `interest_rate`, 0–36% APR | Flat `repaymentFee` | Core intent #2. A fixed fee, not a rate. (Note: a small flat fee on a short term can *annualise* well above 36% — see below.) |
| **Surplus Return at default (mandatory guardrail)** | `claimDefault` sends the **whole** collateral to the lender | Without a price you cannot compute "debt portion vs surplus". Our instrument is a fixed-term **pledge/pawn**: the borrower knows the exact deal up front (repay by the deadline or forfeit the pledged asset). |
| `loan_term` from a fixed set (14d/30d/60d/90d/12m/18m) | Arbitrary `duration` (seconds, ≤ 365d) | We let the two parties pick any term. |
| `repayment_structure` ∈ {LUMP, INSTALLMENT, BALLOON} | LUMP only (principal + fee at maturity) | Simplicity; matches the flat-fee model. |
| Standardized variable set, **no custom fields** | Adds `allowedTaker`, `listed`, `boost`, `serviceFee` | Private offers and an opt-in marketplace/fee model. |

The honest crux: **surplus return is a Lorrow Core *guardrail*** — it calls seizing surplus "the single
most predatory move in collateralized lending." Our full-forfeit-on-time model is a legitimate, fully
**disclosed** instrument (no oracle games, no margin calls, no liquidation cascades — the borrower knows
the precise terms at origination), but it is **not** what Lorrow Core permits. Compatibility cannot be
claimed by relabelling; it has to be earned by honouring the guardrails.

### The interest-ceiling subtlety

Even if we *called* the flat fee an interest rate, a `repaymentFee` of 5 on a principal of 100 over 7 days
annualises to roughly **260% APR**, far above Lorrow's 36% hard ceiling. A flat fee that feels reasonable
to users is not expressible as a compliant `interest_rate` on short terms. This is a real, not cosmetic,
divergence.

## Variable, lifecycle, function & event mapping

**Loan variables**

| Lorrow | FlashBank P2P | Note |
| --- | --- | --- |
| `loan_asset` / `loan_amount` | `principalToken` / `principal` | same |
| `collateral_asset` / `collateral_amount` | `collateralToken` / `collateral` | same |
| `breach_threshold` | — | no oracle |
| `loan_term` | `duration` (seconds) | not the fixed enum |
| `interest_rate` | `repaymentFee` (flat) | not an APR |
| `repayment_structure` | (implicit LUMP) | |
| `early_repayment_allowed` | effectively always true | repay any time before the deadline |
| `early_repayment_penalty` | 0 | within Lorrow's 0–5% (we charge none) |
| `capital_locked` / `collateral_locked` | always true | escrowed at posting |

**Lifecycle**

| Lorrow | FlashBank | Note |
| --- | --- | --- |
| POSTED | `Open` | |
| ACTIVE | `Active` | |
| BREACHED | — | no oracle/breach |
| DEFAULTED | `Defaulted` | but full forfeit, no surplus |
| COMPLETED | `Repaid` | |
| EXPIRED | `Cancelled` (+ `offerExpiry`) | |

**Functions / events**

| Lorrow | FlashBank | Note |
| --- | --- | --- |
| `postOffer` / `postRequest` | `createLoan(creatorIsLender)` | one entry point, both sides |
| `acceptOffer` / `acceptRequest` | `take(id)` | |
| `repay` | `repay(id)` | full repayment (LUMP) |
| `reportBreach` / `checkRecovery` | — | no oracle |
| `executeDefault` | `claimDefault(id)` | **time-based only** (maps to Lorrow's *maturity* default path, not the breach path) |
| `cancelPost` | `cancel(id)` | |
| `LoanCreated`, `LoanDefaulted`, … | `LoanCreated`, `LoanRepaid`, `LoanDefaulted`, `LoanCancelled`, `OfferBoosted` | naming is close but not identical |

Notably, Lorrow's `executeDefault` already supports a **purely time-based "maturity default"** path
(default after the maturity grace period, no breach needed). That path is exactly our model — so our
settlement is a *subset* of Lorrow's, minus the surplus return.

## Can we be compatible without losing the core intents?

### Option A — Be "Lorrow-aware" (recommended, zero loss of intent)

Keep the contract and both intents exactly as they are, and add **legibility**:

- Adopt Lorrow's vocabulary in the ABI/UI where it maps (states, event names, the loan-record field
  names) so a Lorrow-literate reader/tool can read our loans.
- **Publish the Implementation Profile below**, openly declaring where we sit inside Core and where we
  deliberately step outside it. This is honest and immediately useful; we describe ourselves as
  *"Lorrow-aware / shares the Lorrow grammar; time-settled flat-fee variant; differences disclosed"* and
  do **not** claim the bare "Lorrow-compatible" label.

Cost: documentation + optional event/field renames. No change to mechanics, no oracle, no interest.

### Option B — Add surplus return *without* an oracle

The only Core *guardrail* we breach is surplus return, and the reason we breach it is that surplus needs a
**valuation**. An oracle is one source of valuation — but a **settlement price agreed by both parties at
origination and stored immutably** is another, and it needs no oracle. With an optional
`settlementPrice` (collateral priced in principal terms, fixed at creation), `claimDefault` could:

1. value the collateral at the agreed price,
2. transfer only `principal + repaymentFee` worth to the lender,
3. return the surplus collateral to the borrower.

This honours the anti-predation guardrail **and** keeps intent #1 (no oracle — the price is a fixed term,
not a live feed). It is opt-in, so the pure pledge/forfeit product still exists for those who want it.
This is the most promising "made compatible without losing intent" path and is worth prototyping.

### Option C — Propose a Core profile to WHYSIDEAS

Because it is the originator's standard, the highest-leverage move may be to **contribute back**: propose
a small, principled extension so a time-settled, flat-fee instrument can be *recognised* as compatible —
e.g. two declared axes in the Profile:

- `settlement_method`: `ORACLE_BREACH` (today's Core) **or** `TIME_ONLY` (no oracle; default on the
  maturity path);
- `lender_return`: `INTEREST` (today's Core) **or** `FLAT_FEE` (with the fee disclosed and a sane
  effective-rate cap).

Surplus return stays mandatory (satisfied via Option B's agreed settlement price). This keeps Lorrow's
anti-predation promise intact while widening the tent to cover oracle-free, riba-free designs.

### Not recommended — Strict compatibility today

Adding a live oracle, an `interest_rate`, and oracle-priced breach/recovery would make us strictly
compatible **but would discard both core intents**. That is the one outcome the user explicitly ruled out.

## Draft Implementation Profile (Lorrow §11)

Published here so the claim is verifiable. Fields outside Core's accommodation are marked **[variant]**.

| Profile field | FlashBank P2P |
| --- | --- |
| Protocol name / version | FlashBank P2P Term Loans v1 |
| Chain / VM | EVM (Ethereum, L2s); playground on Sepolia |
| Supported loan assets | Any ERC-20 (no fee-on-transfer/rebasing); WETH/USDC etc. on mainnet, faucet tokens on testnet |
| Supported collateral assets | Any ERC-20 (must differ from, or may equal, the loan asset) |
| Collateral ratio range | **[variant]** Not enforced — set by the parties; no on-chain ratio check |
| Interest rate range | **[variant]** None — a flat `repaymentFee` instead of an APR |
| Oracle provider | **[variant]** None — settlement is time-only |
| Oracle fallback / failure behaviour | N/A (no oracle) |
| Default settlement method | **[variant]** Time-based: after `maturity + grace`, lender claims the full collateral (no surplus return in v1; see Option B) |
| Liquidation method | None — no liquidations, only deadline-based default |
| Maturity grace period | Configurable `gracePeriod` (≤ 90 days; **no Core 3-day minimum enforced** — **[variant]**) |
| Breach window policy | N/A (no breach state) |
| Commitment signal | Paid `boost` ranking **[variant]** (not Lorrow's Commitment Score) |
| Fee model | Optional `protocolFeeBps` ≤ **100 bps** (Core-compatible hook); optional per-offer `serviceFee`; optional `boost`. All default-off and disclosed before acceptance. |
| Upgradeability / admin | `Ownable`; admin sets only fee recipient/bps; **cannot alter live loans** (Core-compatible immutability) |
| Compliance / KYC | None |
| Keeper model | Permissionless: `claimDefault` callable by the lender once the deadline passes |
| Frontend / operator | flashbank.net is one interface; the contract is usable directly |

## Recommendation

Do **Option A now** (adopt the grammar + publish this Profile — no loss of intent), prototype **Option B**
(agreed settlement price → surplus return with no oracle), and open **Option C** with WHYSIDEAS. That path
maximises interoperability and honesty while keeping time-only settlement and the flat fee fully intact.
