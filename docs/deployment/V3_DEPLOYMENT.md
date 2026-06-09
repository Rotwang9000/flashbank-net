# FlashBankRouterV3 — deployment runbook

`FlashBankRouterV3` is built, tested and locally validated. This is the exact rollout: Sepolia first,
then the mainnets. Everything here is gated only on the **deployer wallet having gas** — there is no
remaining code work to deploy.

## Roles

| Role | Address | Notes |
|------|---------|-------|
| Deployer (owner) | `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036` | `PRIVATE_KEY` in `.env`. Pays gas; becomes `owner()`. |
| Admin (mainnet, dual-control) | `ADMIN_ADDRESS` (Vultisig MPC vault `0xC021…19e7`) | Executes what the owner proposes. |
| Admin (testnet) | `TESTNET_ADMIN_ADDRESS` | Used on Sepolia so the playground can be driven without the MPC vault. |

> The owner proposes; the admin executes. After v3 is live, **every** config change, rescue, ownership
> move and profit withdrawal needs both keys, and config/rescue additionally wait out `CONFIG_TIMELOCK`
> (2 days). The initial WETH config is set atomically in the constructor (no providers yet ⇒ no timelock).

## Funding status (checked 2026-06-09)

| Chain | Deployer balance | Needed (estimate) | Status |
|-------|------------------|-------------------|--------|
| Sepolia | ~0.0525 ETH | deploy ~3.8M gas ≈ 0.011 ETH @ 3 gwei (but ~0.087 ETH to *submit* at the ~22 gwei spikes seen 2026-06-09) | ⏳ funded; waiting for a low-gas window |
| Ethereum | unfunded | ~0.3–0.5 ETH (real) | ❌ fund before mainnet |
| Base | ~0.00005 ETH | ~0.01 ETH | ❌ fund before mainnet |
| Arbitrum | unfunded | ~0.01 ETH | ❌ fund before mainnet |

Check any chain: `npx hardhat run scripts/check-balance.js --network <sepolia|ethereum|base|arbitrum>`.

> **Why we wait:** EIP-1559 nodes require the wallet to *hold* `gasLimit × maxFeePerGas` to even accept a tx.
> When Sepolia's base fee spikes (~11–22 gwei, as on 2026-06-09) that ceiling exceeds the ~0.0525 ETH balance,
> even though the *actual* charge would be ~half. Rather than force a tight-max-fee deploy, we watch for a dip.

## Step 1 — Sepolia (automated, low-gas)

Preferred path — poll the base fee and deploy + verify + integration-test automatically once gas is cheap:

```bash
cd flashloans
# Plain Node (no Hardhat in the poll loop); it shells out to the deploy/verify/integration scripts.
# Deploys when base fee <= 3 gwei (tunable), verifies on Etherscan, runs the live integration check,
# and repoints website/.env.local at v3 only after a passing integration test.
node scripts/watch-and-deploy-v3.js
#   WATCH_MAX_BASE_GWEI=3  WATCH_INTERVAL_SEC=60  WATCH_MAX_HOURS=12  WATCH_MIN_BALANCE_ETH=0.03
```

On success it writes `flashloans/deployments/sepolia-v3.json` and prints the router address. Raise
`WATCH_MAX_BASE_GWEI` to ~6 to trigger sooner (a safe deploy still fits the current balance at ≤6 gwei).

## Step 1 — Sepolia (manual)

```bash
cd flashloans

# 1. Deploy (bootstraps the Sepolia WETH config in the constructor).
npx hardhat run scripts/deploy-router-v3.js --network sepolia
#    → prints the router address and writes scripts/verify-args-v3-11155111.js

# 2. Verify on Etherscan (constructor has a struct array, so use the generated args file).
npx hardhat verify --network sepolia \
  --constructor-args scripts/verify-args-v3-11155111.js <ROUTER_ADDRESS>

# 3. Live integration check: real native flash loan + maxFee pin + reconcile.
V3_ROUTER_ADDRESS=<ROUTER_ADDRESS> \
V3_WETH_ADDRESS=0xdd13E55209Fd76AfE204dBda4007C227904f0a81 \
V3_PROOF_SINK=0x0cE5514Cf655ce859B1FdDb412FaFcb3Fb921169 \
V3_DEMO_COUNTER=0x1E202CD9a97392f6E74F70dc29b5404A00eD8561 \
npx hardhat run scripts/test-v3-integration.js --network sepolia
```

Then set `NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=<ROUTER_ADDRESS>` (v3) in `website/.env.local` and rebuild.
The old v2.1 router (`0x9a4F…E7D4`) stays live; existing atomic loans are unaffected.

## Step 2 — mainnets (after Sepolia review)

Tunable via env (defaults shown): `FLASHBANK_FEE_BPS=2`, `FLASHBANK_OWNER_FEE_BPS=200`
(must be ≤ `2000` = the v3 cap), `FLASHBANK_MAX_BORROW_BPS=5000`, `FLASHBANK_MAX_LOAN=1000`.

```bash
# Per chain (ethereum | base | arbitrum):
npx hardhat run scripts/check-balance.js --network <chain>   # confirm gas first
npx hardhat run scripts/deploy-router-v3.js --network <chain>
npx hardhat verify --network <chain> --constructor-args scripts/verify-args-v3-<chainId>.js <ROUTER_ADDRESS>
```

Then update the matching `NEXT_PUBLIC_<CHAIN>_ROUTER_ADDRESS` in `website/.env.local`, add a "v2.1 →
v3, please re-approve" banner, and ask providers to migrate their commitments/allowances to v3.

## Rollback / safety

- v3 cannot touch v2.1; the two are independent contracts. If anything looks wrong on v3, point the UI
  back at v2.1 — no funds move because liquidity always lives in provider wallets.
- The owner cannot raise the fee or owner-cut on a live v3 without a 2-day timelock that providers can
  watch (`ChangeProposed` event carries the `eta`); they can pause or zero their allowance first.
