# FlashBankRouterV3 — deployment runbook

`FlashBankRouterV3` is **live and verified on Sepolia** (2026-06-09) and integration-tested on-chain.
This is the exact rollout: Sepolia (✅ done) → mainnets (gated on deployer gas + go-ahead). There is no
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
| Sepolia | funded | deploy + verify + integration done at ~3 gwei | ✅ **deployed 2026-06-09** at `0x4682…846e`, verified + integration-tested |
| Ethereum | ~0.0073 ETH | deployed @ ~0.2 gwei ≈ 0.0012 ETH | ✅ **deployed 2026-06-09** `0x7791…AE35` |
| Base | ~0.00015 ETH | ~0.00003 ETH | ✅ **deployed 2026-06-09** `0xDd6D…10AA` |
| Arbitrum | ~0.00033 ETH | ~0.0001 ETH | ✅ **deployed 2026-06-09** `0x34Dc…9A17` |

Check any chain: `npx hardhat run scripts/check-balance.js --network <sepolia|ethereum|base|arbitrum>`.

> **Why we wait:** EIP-1559 nodes require the wallet to *hold* `gasLimit × maxFeePerGas` to even accept a tx.
> When Sepolia's base fee spikes (~11–22 gwei, as on 2026-06-09) that ceiling exceeds the ~0.0525 ETH balance,
> even though the *actual* charge would be ~half. Rather than force a tight-max-fee deploy, we watch for a dip.

## Step 1 — Sepolia (automated, low-gas)

> **✅ Done 2026-06-09.** v3 is live at [`0x468255e347F5563c9dcF78d41EDca75391Cc846e`](https://sepolia.etherscan.io/address/0x468255e347F5563c9dcF78d41EDca75391Cc846e#code),
> verified, and integration-tested on-chain — a real native flash loan
> ([tx](https://sepolia.etherscan.io/tx/0xf20c2d77cf0cc97a7c7ac7035ef0170c6690e771e05505a9a42fc06ac63fd716)), the `maxFee`
> pin (passes at the ceiling, reverts one wei under), and `reconcile`. Triggered automatically when the base fee
> dipped to ~3 gwei. Record: `flashloans/deployments/sepolia-v3.json`. The live UI deliberately stays on v2.1
> until a full cutover (the playground's demo contracts are v2.1-wired) — see the cutover note below.

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

**Sepolia cutover (when ready):** set `NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=0x468255e347F5563c9dcF78d41EDca75391Cc846e`
in `website/.env.local` **and** redeploy the demo borrower against v3 (reuse the shared `ProofOfFunds`/`DemoCounter`
at `0x0cE5…1169` / `0x1E20…8561`), updating `NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS` so the live demo and the
provider flow share the same router. The old v2.1 router (`0x9a4F…E7D4`) stays live; existing atomic loans are unaffected.

## Step 2 — mainnets (after Sepolia review)

> **✅ Done 2026-06-09.** v3 is live + verified on all three mainnets, deployed in a low-gas window with pinned
> fees (`MAX_FEE_GWEI`/`PRIORITY_FEE_GWEI`, added to the deploy script for thin balances): Ethereum
> [`0x7791…AE35`](https://etherscan.io/address/0x7791f3A7D82db7186f085BfFa3Fd46898EEaAE35#code), Base
> [`0xDd6D…10AA`](https://basescan.org/address/0xDd6D0dC7AA7Be44E4F44d15D34851f3eDc7610AA#code), Arbitrum
> [`0x34Dc…9A17`](https://arbiscan.io/address/0x34DcDBCCf9cC5753F709723Fa00DDe7eCd549A17#code). Admin = Vultisig
> vault `0xC021…19e7`. **The remaining step is the UI cutover (provider migration)** — mainnet UIs still default to v2.1.

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
