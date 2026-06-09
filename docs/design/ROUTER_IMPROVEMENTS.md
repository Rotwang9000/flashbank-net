# FlashBankRouter — hardening (v3)

This tracks the hardening of the flash-loan router against the trade-offs flagged in the
[honest audit](https://flashbank.net/audit). **v3 is now built, tested and validated** —
`flashloans/contracts/FlashBankRouterV3.sol`, covered by `flashloans/test/FlashBankRouterV3.test.js`
(27 tests; 84 passing in the flashloans suite). What remains is purely the on-chain rollout
(Sepolia → mainnets), which is gated on deployer gas.

## Constraints (read first)

- **The live v2.1 router is immutable.** It is deployed and verified on Ethereum mainnet, Base and
  Arbitrum (see `docs/deployment/LIVE_NETWORKS.md`). There is no proxy and no upgrade path, so v3 is a
  **new deployment**: liquidity providers must re-approve the v3 address (a migration), never a silent upgrade.
- v2.1's *current configuration* is conservative: loan fee `2 bps`, owner cut `200` (2% of the fee ≈
  0.0004% of the loan). The findings below were about **maximums the code permits**, not what is set today.

## Findings → v3 (implemented)

| # | Finding (severity) | v2.1 | v3 (`FlashBankRouterV3.sol`) |
|---|--------------------|------|------------------------------|
| 1 | Owner could take up to 100% of the fee (**medium**) | `ownerFeeBps` validated only `<= 10000` | ✅ `MAX_OWNER_FEE_BPS = 2000` (20% of fee), enforced in the constructor and every config path |
| 2 | Single-signature emergency paths (**medium**) | `setTokenConfig` / `withdrawOwnerProfits` callable by one key | ✅ **Removed.** All config, rescue, ownership and withdrawals go through propose → execute (dual signature) |
| 3 | Config changes were instant (**trust**) | dual-sig `executeTokenConfig` applied immediately | ✅ `CONFIG_TIMELOCK = 2 days` between propose and execute; `ChangeProposed` now carries the `eta`, plus `isChangeReady()` and owner `cancelChange()` |
| 4 | Admin rescue can move the contract's balance (**trust**) | dual-sig, instant | ✅ Rescues are dual-sig **and** timelocked (same 2-day window), observable in advance. Provider funds stay in their own wallets regardless |
| 5 | `totalCommitted` could drift (**low**) | expired commitments were never de-counted — and, worse, `_autoDeactivate` was dead code, so they could still be **pulled from** | ✅ Fixed `_autoDeactivate` (pauses + de-counts on expiry) **and** added permissionless `reconcile(token)` that re-derives `totalCommitted` and pauses anything expired |
| 6 | Live allowance is a standing exposure (**trust**, inherent) | providers grant an ERC-20 allowance | ⏳ UI work: show current allowance + one-click "set to 0", prefer exact-amount / `permit`. Lands with the website wiring |
| 7 | Borrower had no on-chain protection against a fee change (**new in v3**) | fee read from config at execution | ✅ `flashLoan(token, amount, toNative, data, maxFee)` overload reverts with `FeeExceedsMax` if the fee exceeds the ceiling the borrower signed — the same on-chain "pin the details" idea used by the P2P `takeChecked` |

Out of scope by design (unchanged in v3): non-custodial pull model, balance-delta repayment check,
`nonReentrant`, the 1%/0.01% loan-fee band, rejecting fee-on-transfer/rebasing tokens.

## Status

- [x] **v3 contract** — `FlashBankRouterV3.sol` (15.7 KB, well under the 24 KB limit).
- [x] **Tests** — 27 dedicated v3 tests (caps, timelock windows, removed single-sig, ownership/withdrawal,
  `maxFee` pin, reentrancy, `reconcile`, and an expiry-drift regression). Full flashloans suite: **84 passing**.
- [x] **Deploy tooling** — `scripts/deploy-router-v3.js` (bootstraps the WETH config in the constructor and
  writes Etherscan verify args) and `scripts/test-v3-integration.js` (live flash loan + `maxFee` + `reconcile`).
  Both validated end-to-end against a local node.
- [x] **Honest test framing / contactable docs** — the "21 pending" are the experimental
  `FlashBankRevolutionary` suite, not the router; disclosure points at a private GitHub advisory.
- [ ] **Sepolia deploy + verify + live integration** — gated on deployer gas (see runbook).
- [ ] **Website wiring** — point the router UI at v3 (Sepolia) behind the env var; add allowance hygiene.
- [ ] **Mainnet/Base/Arbitrum migration** — after Sepolia review; providers re-approve v3, v2.1 deprecated
  in the UI with a banner. Old v2.1 loans are unaffected (each loan is atomic and self-contained).

## Rollout runbook

See `docs/deployment/V3_DEPLOYMENT.md` for the exact commands, gas estimates and per-chain funding needs.
