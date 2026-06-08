# FlashBankRouter — improvement plan

This is an honest, prioritised plan for hardening the flash-loan router. It exists because the
[honest audit](https://flashbank.net/audit) flags real centralisation trade-offs on the router that the
P2P loan contract does not have.

## Constraints (read first)

- **The router is live and immutable.** v2.1 is deployed and verified on Ethereum mainnet, Base and
  Arbitrum (see `docs/deployment/LIVE_NETWORKS.md`). There is no proxy and no upgrade path.
- **Therefore none of the contract changes below can patch the deployed bytecode.** They describe a
  **v3** that would be a *new* deployment. Adopting it means liquidity providers re-approve the new
  router (a migration), so it is a deliberate operational decision, not a silent upgrade.
- The *current configuration* is conservative: loan fee `2 bps`, owner cut `DEFAULT_OWNER_FEE_BPS = 200`
  (2% of the fee ≈ 0.0004% of the loan). The findings below are about **maximums and trust vectors the
  code permits**, not what is set today.

## Findings → concrete fixes

| # | Finding (severity) | Today (v2.1) | Proposed v3 fix |
|---|--------------------|--------------|-----------------|
| 1 | Owner can take up to 100% of the fee (**medium**) | `ownerFeeBps` is validated only `<= FEE_DENOMINATOR` (10000 = 100% of fee) | Add `MAX_OWNER_FEE_BPS` (e.g. `2000` = 20% of fee) and validate against it in every config path |
| 2 | Single-signature emergency paths (**medium**) | `setTokenConfig` and `withdrawOwnerProfits` are callable by `onlyOwnerOrAdmin` (one key) | Remove the single-sig variants; route **all** config + withdrawals through the existing propose/execute dual-sig flow |
| 3 | Config changes are instant (**trust**) | A dual-sig `executeTokenConfig` applies immediately | Add a **timelock** (e.g. 24–48h) between propose and execute so providers can zero their allowance or pause before new fees/limits land |
| 4 | Admin rescue can move the contract's balance (**trust**) | `proposeRescue{Token,ETH}` (dual-sig) can sweep any balance the contract holds | Keep dual-sig; add a `RescueProposed` event + a mandatory timelock so rescues are observable in advance. Provider funds remain in their own wallets regardless. |
| 5 | `totalCommitted` can drift from real balances (**low**) | Loans re-check the real balance, so no funds are at risk; the figure can overstate | Add a permissionless `reconcile(token)` that re-syncs `totalCommitted` to summed live balances |
| 6 | Live allowance is a standing exposure (**trust**, inherent) | Providers grant an ERC-20 allowance | Document/encourage `permit`-scoped or exact-amount allowances and one-click "set allowance to 0"; surface this in the UI |

Out of scope by design (do **not** change): non-custodial pull model, balance-delta repayment check,
`nonReentrant`, the 1%/0.01% loan-fee band, rejecting fee-on-transfer/rebasing tokens.

## What we can do now (no redeploy)

These are safe and shipped/queued without touching the live contract:

- [x] **Honest test framing.** The "21 pending" tests are a `describe.skip` suite for the *experimental*
  `FlashBankRevolutionary` contract, **not** the deployed router. The audit and security pages now say so.
- [x] **Correct, contactable docs.** Removed the not-yet-live security email; point disclosure at a private
  GitHub advisory. Fixed stale repo URLs and the "62+ tests" claim (actual: 57 passing).
- [ ] **UI: allowance hygiene.** Add a visible "current allowance" + one-click "revoke / set to 0" on the
  provider flow, and prefer exact-amount / `permit` approvals over unlimited.
- [ ] **Provider playbook.** A short doc on reacting to a config change (pause, zero allowance) — mitigates #3/#6 operationally until a timelocked v3 exists.

## What needs a v3 (new deployment + migration)

Items 1–5 above. A v3 would:

1. Add `MAX_OWNER_FEE_BPS`, delete the `onlyOwnerOrAdmin` emergency variants, add a config/rescue timelock,
   add `reconcile`.
2. Ship with its **own** test suite covering the new caps, the timelock windows and the removed single-sig
   paths (target: no skipped suites presented as router coverage).
3. Deploy to Sepolia first, run a full playground migration, then mainnet/Base/Arbitrum.
4. Migrate providers: new approvals to the v3 address; deprecate v2.1 in the UI with a banner. Old loans on
   v2.1 are unaffected (each loan is atomic and self-contained).

## Recommended sequencing

1. **Now:** finish the no-redeploy items (allowance UI + provider playbook).
2. **Next:** write v3 + tests in the repo and deploy to **Sepolia only** for review. No mainnet change.
3. **Then (your call):** schedule the mainnet/Base/Arbitrum migration once v3 has had eyes on it — ideally
   the first thing an external audit looks at.

> Decision needed: how far to take this now — (a) no-redeploy items only, (b) also build v3 + tests in the
> repo and deploy to Sepolia for review, or (c) also plan the mainnet migration. This doc assumes we stop at
> (a) until you say otherwise, because (b)/(c) change live, real-money infrastructure.
