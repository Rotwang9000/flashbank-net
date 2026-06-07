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

So out of the box we are **Lorrow-*spirited*, not Lorrow-*compatible*** in the strict sense the spec
defines, and becoming strictly compatible would mean adding an oracle and giving up the flat-fee framing —
i.e. losing the core intents. What we *can* do without losing them is adopt Lorrow's **common grammar**
(variable names, lifecycle states, events) and **publish an Implementation Profile**, then propose to
WHYSIDEAS a small Core extension that recognises a *time-settled, flat-fee* profile.

**Update — [Option B](#option-b--add-surplus-return-without-an-oracle) is now implemented.** Lorrow's
surplus-return guardrail is honoured **with no oracle at all** via an optional agreed rate (loan-token per
collateral-token, stored as `settlementValue` and frozen at origination). It is opt-in: set it and
a defaulting borrower recovers any surplus beyond `principal + repaymentFee`; leave it `0` and the original
full-forfeit pledge still applies. This closes the only Core *guardrail* we were breaching.

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
| **Surplus Return at default (mandatory guardrail)** | ✅ **now honoured** via an opt-in `settlementValue` (Option B). With it set, `claimDefault` returns the surplus to the borrower; left `0`, the lender takes the whole collateral (the original pledge/pawn). | Surplus return needs a *valuation*. Rather than a live oracle we use a price/value **agreed at origination and frozen** — satisfying the guardrail while keeping intent #1 (no oracle). |
| `loan_term` from a fixed set (14d/30d/60d/90d/12m/18m) | Arbitrary `duration` (seconds, ≤ 365d) | We let the two parties pick any term. |
| `repayment_structure` ∈ {LUMP, INSTALLMENT, BALLOON} | LUMP only (principal + fee at maturity) | Simplicity; matches the flat-fee model. |
| Standardized variable set, **no custom fields** | Adds `allowedTaker`, `listed`, `boost`, `serviceFee` | Private offers and an opt-in marketplace/fee model. |

The honest crux: **surplus return is a Lorrow Core *guardrail*** — it calls seizing surplus "the single
most predatory move in collateralized lending." We now honour it (Option B): with a `settlementValue` set,
a defaulting borrower recovers the surplus beyond the debt. The full-forfeit pledge remains available
(`settlementValue == 0`) as a legitimate, fully **disclosed** instrument for parties who explicitly want
it — but surplus return is the guardrail-respecting default we point users toward. Compatibility cannot be
claimed by relabelling; it has to be earned by honouring the guardrails, which on this point we now do.

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
| DEFAULTED | `Defaulted` | surplus returned when `settlementValue` set; full forfeit when `0` |
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
(default after the maturity grace period, no breach needed). That path is exactly our model — and with
Option B's surplus return now implemented, our `claimDefault` matches that path *including* the surplus
guardrail, differing only in *how* the collateral is valued (a frozen agreed value, not a live oracle).

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

### Option B — Add surplus return *without* an oracle ✅ **IMPLEMENTED**

The only Core *guardrail* we breached was surplus return, and the reason was that surplus needs a
**valuation**. An oracle is one source of valuation — but the **exchange rate the two parties already
agree on at origination**, stored immutably, is another, and it needs no oracle. A loan here is really
just two tokens swapped at that agreed rate (loan-token per collateral-token) plus a flat fee, so
"surplus" is simply collateral pledged *beyond* what was borrowed at that rate.

Each offer now carries an optional `uint256 settlementValue`: the agreed rate × the pledged collateral
(i.e. the **whole** collateral's agreed worth in the principal/loan token), frozen at `createLoan`. On
default `claimDefault` splits the collateral (see `_splitCollateralOnDefault`):

1. `settlementValue == 0` → **full forfeit**: the lender takes all collateral (the original pledge/pawn).
2. `settlementValue <= principal + repaymentFee` → the agreed value does not even cover the debt, so the
   lender takes everything and **absorbs the shortfall** (Lorrow: "lender is made whole, not enriched").
3. otherwise → the lender keeps `collateral * debt / settlementValue` (the debt's share, rounded down in
   the borrower's favour via `Math.mulDiv`) and the **surplus returns to the borrower**.

Working in the principal token's units means the principal decimals cancel in `debt / settlementValue`, so
the split is correct for any token-decimal combination with **no oracle and no per-unit price**. A
same-asset loan (e.g. ETH collateral for an ETH loan) needs no price at all — just set
`settlementValue` to the collateral amount (a 1:1 value). The `quoteDefault(id)` view previews the split.

This honours the anti-predation guardrail **and** keeps intent #1 (no oracle — the value is a fixed term,
not a live feed). It is opt-in, so the pure pledge/forfeit product still exists for those who want it.
Covered by unit tests in `loans/test/FlashBankP2PLoan.test.js` ("Surplus return on default").

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
| Default settlement method | **[variant]** Time-based: after `maturity + grace` the lender calls `claimDefault`. With a per-offer `settlementValue` set, **surplus is returned to the borrower** (Core guardrail honoured, no oracle); with `settlementValue == 0`, the lender claims the full collateral (pledge/forfeit) |
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

**Option B is now implemented** (agreed settlement value → surplus return with no oracle), closing the one
Core guardrail we were breaching. Remaining work: do **Option A** (adopt the grammar + publish this Profile
— no loss of intent) and open **Option C** with WHYSIDEAS to recognise a time-settled, flat-fee profile.
That path maximises interoperability and honesty while keeping time-only settlement and the flat fee fully
intact.
