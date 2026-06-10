# P2P loans v2 — token validation, cooling-off rebate & settlement hardening

> **Status: prepared, NOT deployed.** The live contract is `FlashBankP2PLoan` (v1), deployed and
> verified on Ethereum + Base. v1 is immutable and left untouched. This note describes
> `loans/contracts/FlashBankP2PLoanV2.sol`, a staging contract (compiled + unit-tested in
> `loans/test/FlashBankP2PLoanV2.test.js`, 22 cases) that adds **contract-level** features which
> cannot be retrofitted onto v1. Deploy only after review.

## Why v2 exists

Three problems that can only be fixed in the contract, not the UI:

1. **Stop a lender farming fees off a worthless ("fake") token.** A lender lists garbage, a borrower
   takes it, realises and hands it straight back — yet still owes the flat fee. Repeated, bait
   offers become a fee mill.
2. **…without making short-term borrowing free.** Waive the fee on quick returns and anyone can
   borrow briefly for nothing. The resolution is a **graduated** fee ("graduated uncooling").
3. **Settlement legs that a hostile/blocked recipient can brick** (found in the pre-deploy
   adversarial review; latent in v1 too — see below).

## Mechanism

### The agreed fee is a maximum that *vests* (with a floor)

`repaymentFee` vests linearly **from a 10% floor to the full amount** over a `coolingOff` window,
then stays at the full amount for the rest of the term:

```
elapsed  = block.timestamp - startTime
floorFee = repaymentFee * MIN_VESTED_FEE_BPS / 10000          (10% of the agreed fee)

feePaid =
    repaymentFee                                              if block.number == startBlock
    repaymentFee                                              if elapsed >= coolingOff
    floorFee + (repaymentFee - floorFee) * elapsed/coolingOff otherwise   (rounded down)
```

- **Repay almost immediately** (next block) → pay ≈ the floor (10% of the fee). A fake-token victim
  escapes for a tenth of the agreed fee.
- **Half-way through the window** → 55% (floor + half the remainder).
- **Past the window** → the full flat fee, constant for the rest of the term.

**Why a floor and not ~0?** Repaying *consumes the offer* (status → `Repaid`). With a zero floor,
anyone could take a rival lender's listing and repay next block for ~nothing — knocking the offer
off the marketplace and burning its non-refundable `boost`. The floor makes every take cost real
money (paid to the lender, who is made whole for the disruption), while keeping the escape cheap
for genuine victims. Trade-off acknowledged: a bait-offer scammer can still collect the floor from
each victim — but victims must approve and take a custom token, which the mainnet UI does not offer
(ETH/USDC only), and 10% of the fee is a poor return on a strategy that needs fresh marks.

### Same-block guard (anti free-flash-loan)

A take **and** repay inside the *same block* is the signature of an atomic, free intra-block loan,
not a genuine cooling-off exit. That case is charged the **full** fee regardless of elapsed time
(hence `startBlock` in the `Loan` struct). A 2-block round-trip pays only the floor — but without
atomicity it is not a usable flash-loan primitive, so this is accepted (and priced by the floor).

### Mandatory minimum window (so the rebate can't be neutered)

The contract enforces a minimum `coolingOff` that scales with the term, clamped between a floor and
a cap and never longer than the loan itself:

```
minCoolingOff(duration) = clamp( duration * 10%, 10 minutes, 1 day )   // and ≤ duration
```

| Term | 10% of term | Enforced minimum |
| --- | --- | --- |
| 5 minutes | 30 s | **5 minutes** (whole term; below the floor) |
| 1 hour | 6 min | **10 minutes** (floor) |
| 5 days | 12 h | **12 hours** |
| 30 days | 3 days | **1 day** (cap) |

`coolingOff = 0` on create/update means "use the minimum"; an explicit value must lie in
`[minCoolingOff(duration), duration]` (longer = more borrower-friendly = allowed; shorter reverts
`InvalidCoolingOff`). `updateOffer` re-normalises against the possibly-new duration. All bounds
(`COOLING_MIN_BPS`, `COOLING_MIN_FLOOR`, `COOLING_MIN_CAP`, `MIN_VESTED_FEE_BPS`,
`MAX_TOKEN_DECIMALS`) are **immutable constants** — deliberately no owner knobs to abuse.

### Is this still "a fixed fee, not interest"?

Yes. The agreed `repaymentFee` is a **ceiling**: the vest only ever *reduces* what is owed (a rebate
for an early exit) and beyond the window the cost is constant. No compounding, no accrual above the
agreed figure — the *riba*-avoidance intent of the flat-fee model is preserved. The honest framing
is "the agreed fee **vests** over a short initial window", not "interest accrues".

### Default is unaffected

A borrower who defaults is not making an early exit: `claimDefault` settles against
`principal + repaymentFee` (the full agreed fee), exactly as v1. `quoteRepayment(id)` still returns
the **maximum**; `quoteRepaymentNow(id)` / `effectiveFee(id)` expose the vested figure.

### Pull-payout fallback (`unclaimed` + `withdrawUnclaimed`)

Found in the adversarial review: with blocklisting tokens (USDC-style), v1 has two brickable legs —

- **`repay` → lender.** If the *lender* is blocked on the principal token, the borrower's repayment
  reverts. The borrower is then **forced into default** and loses their collateral — through no
  fault of their own.
- **`claimDefault` → borrower (surplus).** If the *borrower* cannot receive the surplus — or
  deliberately uses a collateral token whose transfers to themselves revert — the lender's claim
  reverts forever. Principal already gone, collateral stuck: a **total-loss grief** against lenders
  on offers with an agreed rate.

v2 fixes both with a pull-over-push fallback, `_sendOrQueue`: payouts to parties **other than the
caller** try a direct transfer; on failure (revert, or a `false` return) the amount is credited to
`unclaimed[token][recipient]` and `PayoutQueued` is emitted. The recipient withdraws later with
`withdrawUnclaimed(token)` (zeroed before sending; reverts if the transfer still fails so the
balance is preserved). Legs where the recipient *is* the caller (lender's own default claim, the
disbursement to a taker) stay strict — a failure there only delays the caller themselves.

This applies to: `repay` → lender (owed), `repay` → borrower (collateral return), and
`claimDefault` → borrower (surplus).

### Terms hash

`coolingOff` is part of the agreed economics, so it is included in `_termsHash` (added to "half B").
A taker using `takeWithTerms` therefore pins the cooling window too.

## Token validation

`createLoan` runs `_validateToken` on **both** tokens: reject the zero address; reject an address
with no contract code (an EOA); require `totalSupply()` / `balanceOf()` to answer without reverting;
if `decimals()` exists, require ≤ 36. Fee-on-transfer / rebasing tokens remain rejected at transfer
time by `_pullExact`'s exact-balance assertion (unchanged from v1).

> **Honest limitation.** On-chain checks verify ERC-20 *conformance*, never economic *value* —
> nothing can tell a fake coin from a real one. The genuine protections are (1) the front-end's
> curated mainnet allow-list (ETH/USDC for now; custom tokens are testnet-only), (2) the cooling-off
> rebate, and (3) due diligence.

## Adversarial review (pre-deploy)

Every pitfall considered before go-live, and what was decided:

| # | Vector | Outcome |
| --- | --- | --- |
| 1 | **Bait offer with fake principal** — lender farms fees from instant-return victims | Mitigated: cooling-off rebate (victim pays only the 10% floor) + mainnet allow-list |
| 2 | **Free short-term borrowing** via instant repay | Mitigated: same-block guard pays full fee; 2-block round-trip pays the floor |
| 3 | **Offer-griefing** — take+repay a rival's listing for ~0 to consume it and burn its boost | **Fixed in v2**: `MIN_VESTED_FEE_BPS` floor — every take pays the lender ≥ 10% of the fee |
| 4 | **Blocked lender bricks `repay`** → borrower forced into default (USDC blocklist) | **Fixed in v2**: pull-payout fallback |
| 5 | **Borrower bricks `claimDefault`** via a collateral token that reverts transfers to them | **Fixed in v2**: surplus leg queues instead of reverting |
| 6 | **Fake collateral against a real lender** (borrower-initiated request) | **Not fixable on-chain** — cooling-off is asymmetric (protects borrowers, not lenders). Lender protections: allow-list, due diligence, pricing the risk. Documented prominently |
| 7 | Re-price front-running a taker | Already mitigated (v1): `takeChecked` / `takeWithTerms` pinning; `take()` kept for composability but the UI never uses it |
| 8 | Reentrancy via malicious token hooks (incl. ERC-777) | `nonReentrant` on every fund-moving path; v1 suite includes a live reentrancy attack test |
| 9 | Token returns `true` without moving funds | Undetectable on the send side; `_pullExact` catches it on the pull side. Queueing is not falsely triggered (only on reported failure); no accounting relies on contract balance |
| 10 | Fee-on-transfer / rebasing tokens | Unsupported by design: pulls revert on shortfall; a negative-rebase escrow can strand a loan — documented |
| 11 | Upgradeable/proxy token turns malicious after validation | Undetectable on-chain; allow-list + due diligence |
| 12 | Gas-griefing transfer hooks | Failure path queues; a hook burning all forwarded gas can still revert the tx — bounded nuisance, accepted |
| 13 | Marketplace spam (dust offers) | UI-level filtering/ranking; not a fund-safety issue, so no on-chain minimum |
| 14 | Sybil "reputation" gaming via self-loans | No on-chain reputation exists; flagged as a constraint for any future reputation feature |
| 15 | `withdrawUnclaimed` reentrancy/drain | `nonReentrant`, balance zeroed before send, only ever pays the recorded recipient |

### Feature ideas noted but deliberately deferred (keep v2 small and reviewable)

- **Partial repayment** — real utility, but it complicates the vest, the surplus split and the UI;
  candidate for v3.
- **Mutual term extension** (both parties sign to push maturity) — useful, adds signature plumbing.
- **Reputation / attestation layer** — better off-chain or as a separate registry (see #14).
- **Offer auto-expiry sweeper** — `cancel` after expiry already reclaims escrow; a keeper adds
  surface for little gain.

## What ships now vs. with v2

| Concern | Now (v1 live) | v2 (prepared) |
| --- | --- | --- |
| Fake-token value fraud | UI restricted to ETH/USDC on mainnet | + cooling-off rebate (escape ≈ 10% of fee) |
| Free short-term borrowing | n/a | graduated fee + same-block full-fee guard |
| Listing griefing | full fee makes it expensive | floor keeps it expensive despite the rebate |
| Blocklist bricking (repay / claimDefault) | **latent risk** | pull-payout fallback + `withdrawUnclaimed` |
| Broken/garbage token addresses | UI allow-list | + on-chain `_validateToken` |
| Fee model | flat fee | flat fee that **vests** (rebate only) |

## Open questions / tunables (for review before deploy)

- **`MIN_VESTED_FEE_BPS` = 10%.** Higher deters griefing more but punishes victims more. 10% felt
  like the balance point; revisit with real fee sizes.
- **Window curve** (10% of term, 10 min floor, 1 day cap) — right shape? Larger cap for long terms?
- **Owner-configurable bounds?** Deliberately immutable for predictability; a governance knob would
  itself be a centralisation vector.
- **Naked `take()`** — keep (composability) or force pinned takes only?

## Testing

`loans/test/FlashBankP2PLoanV2.test.js` — **22 cases**: vest curve (floor / near-immediate / 55%
half-way / full after window), anti-griefing floor, same-block full-fee guard, zero-fee loan,
window bounds (below-min, above-term, re-normalisation, floor/cap), token validation (zero address,
EOA, non-ERC-20, absurd decimals, valid), default with full fee, and the pull-payout fallback
(blocked lender on repay, blocked borrower on surplus, blocked borrower on collateral return,
nothing-to-withdraw). The blocklist scenarios use the test-only `BlocklistToken` mock.
Run with `cd loans && npx hardhat test test/FlashBankP2PLoanV2.test.js`.

## If/when deploying

1. Re-review the constants and the adversarial table above.
2. Adapt `loans/scripts/deploy-p2p-loan.js` (constructor unchanged: `(feeRecipient, feeBps)`).
3. Verify on Etherscan/Basescan; record in `loans/deployments/*-p2p-v2.json`.
4. Update the website: new `coolingOff`/`startBlock` fields in `LOAN_COMPONENTS`, the terms-hash
   builder, a cooling-off control on the offer form, a "you owe now vs. at maturity" display
   (`quoteRepaymentNow`/`effectiveFee`), and an **unclaimed-payouts banner** that checks
   `unclaimed(token, account)` and offers `withdrawUnclaimed`.
5. Update the MCP server's P2P ABI + tools for the same fields.
