# P2P loans v2 — token validation & graduated cooling-off rebate

> **Status: prepared, NOT deployed.** The live contract is `FlashBankP2PLoan` (v1), deployed and
> verified on Ethereum + Base. v1 is immutable and left untouched. This note describes
> `loans/contracts/FlashBankP2PLoanV2.sol`, a staging contract (compiled + unit-tested in
> `loans/test/FlashBankP2PLoanV2.test.js`) that adds two **contract-level** features which cannot be
> retrofitted onto v1. Deploy only after review.

## Why v2 exists

Two requests that can only be satisfied in the contract, not the UI:

1. **Stop a lender farming fees off a worthless ("fake") token.** The worry: a lender lists some
   garbage token, a borrower takes it, immediately realises it is worthless and hands it straight
   back — yet still owes the flat fee. Repeated, that turns bait offers into a fee mill.
2. **…without making short-term borrowing free.** If we simply waived the fee for an early return,
   anyone could borrow for a few minutes for nothing. The resolution the brief asked for was a
   **"graduated uncooling"** — the fee should *graduate*, not flip on/off.

These pull in opposite directions at *t ≈ 0* (fraud protection wants ~0 fee; abuse protection wants
a fee). The compromise below resolves it with a linear vest plus a same-block guard.

## Mechanism

### The agreed fee is a maximum that *vests*

`repaymentFee` is no longer charged in full the instant a loan activates. It **vests linearly from
~0 to the full agreed amount over a `coolingOff` window**, then stays at the full amount for the rest
of the term:

```
elapsed = block.timestamp - startTime

feePaid =
    repaymentFee                              if block.number == startBlock   (same-block guard)
    repaymentFee                              if elapsed >= coolingOff
    repaymentFee * elapsed / coolingOff       otherwise        (rounded down, in the borrower's favour)
```

- **Repay almost immediately** (next block, a few seconds in) → pay a tiny sliver of the fee. A
  fake-token victim exits for nearly nothing.
- **Hold for half the window** → pay half the fee.
- **Hold past the window** → pay the full agreed flat fee, unchanged for the rest of the term.

### Same-block guard (anti free-flash-loan)

A take **and** repay inside the *same block* is the signature of an atomic, free intra-block (flash)
loan, not a genuine cooling-off exit. That case is charged the **full** fee regardless of elapsed
time. Genuine "this is fake, get me out" exits happen a block or more later and keep the rebate. This
is why the `Loan` struct now records `startBlock`.

### Mandatory minimum window (so the rebate can't be neutered)

A lender must not be able to set `coolingOff` so short that the rebate is meaningless. The contract
enforces a minimum that **scales with the term**, clamped between a floor and a cap and never longer
than the loan itself:

```
minCoolingOff(duration) = clamp( duration * 10%, 10 minutes, 1 day )   // and ≤ duration
```

| Term | 10% of term | Enforced minimum |
| --- | --- | --- |
| 5 minutes | 30 s | **5 minutes** (whole term; below the floor) |
| 1 hour | 6 min | **10 minutes** (floor) |
| 5 days | 12 h | **12 hours** |
| 30 days | 3 days | **1 day** (cap) |

`coolingOff` resolution on `createLoan` / `updateOffer`:

- `0` → use `minCoolingOff(duration)` (the default).
- a value in `[minCoolingOff(duration), duration]` → accepted (a **longer** window is allowed — it is
  more borrower-friendly; a shorter one reverts `InvalidCoolingOff`).
- `updateOffer` re-normalises against the (possibly new) duration.

All four bounds (`COOLING_MIN_BPS`, `COOLING_MIN_FLOOR`, `COOLING_MIN_CAP`, plus `MAX_TOKEN_DECIMALS`)
are **immutable constants** — there are deliberately no owner knobs to abuse.

### Is this still "a fixed fee, not interest"?

Yes. The agreed `repaymentFee` is a **ceiling**. The vest can only ever *reduce* what is owed (a
rebate for an early exit); it never grows the cost beyond the flat amount, and beyond the cooling
window the cost is constant for the rest of the term. There is no compounding and no time-accruing
charge above the agreed figure — so the *riba*-avoidance intent of the flat-fee model is preserved.
The honest framing is "the agreed fee **vests** over a short initial window", not "interest accrues".

### Default is unaffected

A borrower who **defaults** (never repays) is not making an early exit, so the cooling-off rebate
does not apply: `claimDefault` settles against `principal + repaymentFee` (the full agreed fee), exactly
as v1. Likewise `quoteRepayment(id)` still returns the **maximum** (`principal + repaymentFee`);
`quoteRepaymentNow(id)` / `effectiveFee(id)` expose the current vested figure.

### Terms hash

`coolingOff` is now part of the agreed economics, so it is included in `_termsHash` (added to "half
B"). A taker using `takeWithTerms` therefore pins the cooling window too. The website must mirror the
new hashing scheme and the new `Loan`/`LoanParams` fields when v2 goes live.

## Token validation

`createLoan` now runs `_validateToken` on **both** the principal and collateral tokens:

- reject the zero address;
- reject an address with **no contract code** (an EOA);
- require the **core ERC-20 surface** to answer without reverting (`totalSupply()`, `balanceOf()`);
- if `decimals()` is present, require it to be **≤ 36** (reject absurd metadata).

Fee-on-transfer / rebasing tokens remain rejected at transfer time by `_pullExact`'s exact-balance
assertion (unchanged from v1).

> **Honest limitation.** None of this can tell a *fake* token from a real one — on-chain we can only
> check ERC-20 *conformance*, never economic *value*. The real protections against value fraud are
> (1) the front-end's curated **mainnet allow-list** (ETH/USDC for now — custom token entry is
> testnet-only), (2) the cooling-off rebate above, and (3) borrower due diligence. v2 makes the
> interface honest about this rather than pretending validation equals safety.

## What ships now vs. with v2

| Concern | Now (v1 live) | v2 (prepared) |
| --- | --- | --- |
| Fake-token value fraud | UI restricted to ETH/USDC on mainnet | + cooling-off rebate so instant return ≈ free |
| Free short-term borrowing | n/a | graduated fee + same-block full-fee guard |
| Broken/garbage token addresses | UI allow-list | + on-chain `_validateToken` |
| Fee model | flat fee | flat fee that **vests** (rebate only) |

## Open questions / tunables (for review before deploy)

- **Constants.** Is 10% / 10 min / 1 day the right minimum-window curve? Should the cap be larger for
  very long terms?
- **Owner-configurable minimum?** Currently immutable. A governable minimum adds flexibility but also
  a centralisation vector; immutable was chosen for predictability.
- **Same-block vs N-block.** The guard blocks the *atomic* exploit. A 2-block round-trip still pays
  little; that is not a reliable free-loan primitive (no atomicity guarantee), so it is accepted.
- **Pro-rata vs initial free window.** We chose a pure linear vest from ~0 (matches "graduated"); an
  alternative is a short flat free window then a ramp.

## Testing

`loans/test/FlashBankP2PLoanV2.test.js` (17 cases) covers: default/exact/half/near-zero vesting, the
same-block full-fee guard, a zero-fee loan, the cooling-window bounds (below-min, above-term,
re-normalisation, floor/cap), and token validation (zero address, EOA, non-ERC-20 contract, absurd
decimals, valid tokens). Run with `cd loans && npx hardhat test test/FlashBankP2PLoanV2.test.js`.

## If/when deploying

1. Re-review constants and this note.
2. Adapt `loans/scripts/deploy-p2p-loan.js` (constructor is unchanged: `(feeRecipient, feeBps)`).
3. Verify on Etherscan/Basescan; record in `loans/deployments/*-p2p-v2.json`.
4. Update the website: `LOAN_COMPONENTS`/`OFFER_UPDATE_COMPONENTS` for the new `coolingOff` +
   `startBlock` fields, the terms-hash builder, a cooling-off control in the offer form, and a "you
   owe now vs. at maturity" display driven by `quoteRepaymentNow` / `effectiveFee`.
