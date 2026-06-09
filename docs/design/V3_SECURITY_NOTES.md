# FlashBankRouterV3 — security notes & audit scope

Companion to the [honest audit](https://flashbank.net/audit). This is the threat model, the invariants a
reviewer should hold the contract to, and a map of where each is tested. Scope: `flashloans/contracts/FlashBankRouterV3.sol`.

## Trust model

| Actor | Can | Cannot |
|-------|-----|--------|
| Anyone (borrower) | Call `flashLoan` / `flashLoan(...,maxFee)`; must repay principal + fee atomically. Call `reconcile`, `syncCommitment` | Keep funds without repaying (tx reverts); pay more than `maxFee` if pinned |
| Provider | `setCommitment` / `setCommitmentWithPermit`; pause; lower/raise/zero their own allowance any time | Be pulled beyond `min(limit, allowance, balance)`; be pulled after expiry (auto-paused) |
| Owner (1 key) | *Propose* config/rescue/ownership/withdrawal; `setAdmin`; `cancelChange` | Apply anything alone — every state change needs the admin to execute |
| Admin (1 key) | *Execute* a proposal once its timelock has elapsed | Propose anything; change values the owner did not propose (hash must match) |
| Owner + Admin | Change token config, rescue, transfer ownership, withdraw owner profits | Exceed `MAX_OWNER_FEE_BPS` (20% of fee) or the 0.01–1% fee band; touch provider wallets; skip the 2-day timelock on config/rescue |

The owner+admin keys are a 2-of-2. The intended admin is a Vultisig MPC vault.

## Invariants

1. **Non-custodial.** Liquidity is pulled from provider wallets and returned within one `flashLoan` call; the
   contract holds no provider deposits. Only `ownerProfits` (accrued fee cut) and accidental transfers ever rest here.
   *(test: native + ERC20 happy paths; provider balance deltas)*
2. **Atomic repayment.** A loan reverts unless the contract's post-callback balance ≥ pre-balance + fee
   (native: ETH balance; ERC20: token balance). Balance-delta, not trust in the borrower's return value.
   *(test: "reverts when the borrower refuses to repay")*
3. **Owner cut is bounded.** `ownerFeeBps ≤ MAX_OWNER_FEE_BPS (2000)` is enforced in the constructor and every
   config path; provider share = `fee − ownerCut`. *(test: cap at/above 2000; capped accrual)*
4. **Fee band.** `MIN_FEE_BPS (1) ≤ feeBps ≤ MAX_FEE_BPS (100)`; `maxBorrowBps ∈ [100, 10000]`. *(test: validation)*
5. **No unilateral control.** No single-signature mutator exists. All config/rescue/ownership/withdrawal go
   propose → execute. Config & rescue additionally require `block.timestamp ≥ eta` (propose + 2 days).
   *(test: removed single-sig; timelock not-ready/ready; non-admin executor; never-proposed)*
6. **Borrower fee pin.** `flashLoan(...,maxFee)` reverts `FeeExceedsMax` if `fee > maxFee`. *(test: at/over ceiling)*
7. **No drift / no stale pulls.** Expired commitments are auto-paused and de-counted on access, and
   `reconcile(token)` re-derives `totalCommitted` from live, non-expired limits. An expired commitment can
   never be pulled. *(test: reconcile sweep; "excludes an expired provider from new loans")*
8. **Reentrancy-safe.** `flashLoan` is `nonReentrant`; a nested `flashLoan` from the callback fails the loan.
   *(test: reentrancy)*

## Threats considered

- **Malicious borrower (no repay / partial repay):** caught by invariant 2 (balance-delta), tx reverts, no pull persists.
- **Reentrancy via the callback:** `nonReentrant` + the callback running inside `try/catch` (a revert ⇒ `strategySuccess=false`).
- **Fee-on-transfer / rebasing tokens:** out of scope by design; the balance-delta check rejects under-delivery, and such tokens should not be configured.
- **Owner "rug" by raising fees:** bounded by the fee band + `MAX_OWNER_FEE_BPS`, and any change is dual-sig **and** telegraphed 2 days ahead (`ChangeProposed` carries `eta`), so providers can pause / zero allowance first.
- **Front-run config change against a live loan:** borrowers can pin `maxFee`; providers' exposure is always `min(limit, allowance, balance)`.
- **`totalCommitted` overflow with unlimited commitments:** saturating arithmetic in `_updateTotals` / `reconcile`.
- **Standing allowance (inherent, not fixable on-chain):** mitigated operationally — exact-amount approvals + one-click revoke in the UI.

## Gas (hardhat, optimizer 200 runs)

| Item | Gas |
|------|-----|
| Deploy (with 1 bootstrapped token) | ~3.72M (15.7 KB) |
| `flashLoan` (single provider, via test borrower) | ~130k |
| `setCommitment` (first time) | ~141k |
| `proposeTokenConfig` / `executeTokenConfig` | ~52k / ~46k |
| `reconcile` (per token) | ~41k + per-provider |

## Diff vs the live v2.1

Added: `MAX_OWNER_FEE_BPS`, `CONFIG_TIMELOCK`, `pendingChangeEta`, `isChangeReady`, `cancelChange`,
`reconcile`, the `maxFee` `flashLoan` overload, `VERSION`. Constructor bootstraps initial token configs.
Removed: `setTokenConfig` and `withdrawOwnerProfits` single-sig variants. Fixed: `_autoDeactivate` (was dead
code on expiry). Unchanged: pull custody, distribution maths, permit, multi-provider pull, views.

## For an external auditor — start here

`_flashLoan` (custody/repayment ordering), `_pullLiquidity` / `_distribute` (accounting, rounding dust),
`_autoDeactivate` / `reconcile` (the expiry fix and `totalCommitted` consistency), and the propose/execute +
timelock state machine (`_propose` / `_consume`). Confirm there is no path that mutates config, moves a balance,
or transfers ownership without both keys and (for config/rescue) the elapsed timelock.
