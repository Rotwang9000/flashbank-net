# 🚀 FlashBank Live Networks

## ✅ All Networks Deployed & Verified!

### Ethereum Mainnet (Chain ID: 1)
- **Router:** `0x8b6c52E68185b07D6ebf451E790Fee2E81F9B334`
- **WETH:** `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- **Admin:** `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7` (Vultisig vault)
- **Owner:** `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036`
- **Status:** ✅ Live & Verified
- **Explorer:** https://etherscan.io/address/0x8b6c52E68185b07D6ebf451E790Fee2E81F9B334#code

### Base (Chain ID: 8453)
- **Router:** `0x06758b8521136e930d5b41a3c158266149d5eb16`
- **WETH:** `0x4200000000000000000000000000000000000006`
- **Admin:** `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7` (Vultisig vault)
- **Owner:** `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036`
- **Status:** ✅ Live & Verified
- **Explorer:** https://basescan.org/address/0x06758b8521136e930d5b41a3c158266149d5eb16#code

### Arbitrum One (Chain ID: 42161)
- **Router:** `0x06758B8521136E930D5b41A3c158266149d5EB16`
- **WETH:** `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1`
- **Admin:** `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7` (Vultisig vault)
- **Owner:** `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036`
- **Status:** ✅ Live & Verified
- **Explorer:** https://arbiscan.io/address/0x06758B8521136E930D5b41A3c158266149d5EB16#code

### Sepolia Testnet (Chain ID: 11155111)
- **Router:** `0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4`
- **WETH:** `0xdd13E55209Fd76AfE204dBda4007C227904f0a81`
- **Admin:** `0x3CD6BbF16599Af7FDe6F4b7C8b6FD6Bea4EDc191` (testnet override)
- **Owner:** `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036`
- **Demo Borrower:** `0xFD0a29b84533d9CEF69e63311bb766236f09a454`
- **Status:** ✅ Live & Verified (with demo contracts)
- **Explorer:** https://sepolia.etherscan.io/address/0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4#code
- **Router (v3, now the playground default):** `0x468255e347F5563c9dcF78d41EDca75391Cc846e` — ✅ verified + integration-tested 2026-06-09 ([code](https://sepolia.etherscan.io/address/0x468255e347F5563c9dcF78d41EDca75391Cc846e#code)). Demo borrower `0xCc1Af59adAB7b235698f193E34B3328213c86e7A` (v3-wired, shared proof/counter).

---

## 🆕 FlashBankRouterV3 — live & verified (2026-06-09)

The hardened router: owner cut capped at 20% of the fee, every path dual-signature with a 2-day config/rescue
timelock, the expired-commitment drift bug fixed, and an on-chain borrower `maxFee` pin. Deployed and verified
on every chain, and **the live UI now runs v3 on every chain** — v2.1 held zero committed liquidity (verified
on-chain: `totalCommitted(WETH)=0` on all three mainnet routers), so the site cut straight over with no provider migration.

| Chain | v3 Router | Verified | UI default |
|-------|-----------|----------|------------|
| Ethereum | `0x7791f3A7D82db7186f085BfFa3Fd46898EEaAE35` | [✅](https://etherscan.io/address/0x7791f3A7D82db7186f085BfFa3Fd46898EEaAE35#code) | ✅ v3 (live) |
| Base | `0xDd6D0dC7AA7Be44E4F44d15D34851f3eDc7610AA` | [✅](https://basescan.org/address/0xDd6D0dC7AA7Be44E4F44d15D34851f3eDc7610AA#code) | ✅ v3 (live) |
| Arbitrum | `0x34DcDBCCf9cC5753F709723Fa00DDe7eCd549A17` | [✅](https://arbiscan.io/address/0x34DcDBCCf9cC5753F709723Fa00DDe7eCd549A17#code) | ✅ v3 (live) |
| Sepolia | `0x468255e347F5563c9dcF78d41EDca75391Cc846e` | [✅](https://sepolia.etherscan.io/address/0x468255e347F5563c9dcF78d41EDca75391Cc846e#code) | ✅ v3 (playground) |

Admin (mainnets) = Vultisig vault `0xC021…19e7`; owner = `0x4F0B…d036`; config identical to v2.1 (fee 2 bps,
owner cut 2% of fee, maxBorrow 50%, maxLoan 1000 WETH). Per-chain records in `flashloans/deployments/*-v3.json`.
See the [v3 runbook](./V3_DEPLOYMENT.md) and [security notes](../design/V3_SECURITY_NOTES.md).

---

## 🔧 Configuration (All Networks)

All routers have identical configuration:

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Fee** | 2 bps (0.02%) | Flash loan fee |
| **Max Loan** | 1000 WETH | Maximum single loan |
| **Max Borrow** | 5000 bps (50%) | Max % of pool per loan |
| **Owner Fee** | 200 bps (2% of fee) | Owner's cut (0.0004% of loan) |
| **Supports Permit** | true | EIP-2612 gasless approvals |
| **Enabled** | true | Token is active |

---

## 🌐 Website Configuration

Add to `website/.env.local`:

```bash
# Ethereum Mainnet
NEXT_PUBLIC_MAINNET_ROUTER_ADDRESS=0x8b6c52E68185b07D6ebf451E790Fee2E81F9B334
NEXT_PUBLIC_MAINNET_WETH_ADDRESS=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

# Base
NEXT_PUBLIC_BASE_ROUTER_ADDRESS=0x06758b8521136e930d5b41a3c158266149d5eb16
NEXT_PUBLIC_BASE_WETH_ADDRESS=0x4200000000000000000000000000000000000006

# Arbitrum One
NEXT_PUBLIC_ARBITRUM_ROUTER_ADDRESS=0x06758B8521136E930D5b41A3c158266149d5EB16
NEXT_PUBLIC_ARBITRUM_WETH_ADDRESS=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1

# Sepolia Testnet
NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4
NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=0xdd13E55209Fd76AfE204dBda4007C227904f0a81
NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS=0xFD0a29b84533d9CEF69e63311bb766236f09a454
```

---

## 🚀 How to Use

### For Liquidity Providers

1. **Connect Wallet** to your preferred network (Mainnet, Base, or Arbitrum)
2. **Wrap ETH** → WETH (if needed)
3. **Approve Router** to spend your WETH
4. **Set Commitment** with your desired amount and optional expiry
5. **Earn Fees** - Get 0.02% every time your WETH is used in a flash loan!

### For Borrowers

1. **Connect Wallet** to your preferred network
2. **Implement** the `IL2FlashLoan` interface in your contract
3. **Call** `router.flashLoan(token, amount, data)` with fee included
4. **Execute** your arbitrage/liquidation/etc in the callback
5. **Repay** loan + fee in the same transaction

### For Testing

1. **Connect** to Sepolia testnet
2. **Get Sepolia ETH** from faucet
3. **Test** all features risk-free
4. **Run demos** to see success/fail scenarios

---

## 📊 Network Comparison

| Network | Gas Cost | Speed | TVL Potential | Best For |
|---------|----------|-------|---------------|----------|
| **Ethereum** | High (~20 gwei) | 12s blocks | Highest | Large arbitrage, high liquidity |
| **Base** | Low (~1-5 gwei) | 2s blocks | Growing | Coinbase ecosystem, new DeFi |
| **Arbitrum** | Lowest (~0.1 gwei) | <1s | High | Cost-sensitive operations |
| **Sepolia** | Low (testnet) | 12s blocks | Test only | Development & testing |

---

## 🔐 Security

### Dual-Control Architecture

All networks use 2-of-2 multi-signature control:

| Role | Address | Purpose |
|------|---------|---------|
| **Owner** | `0x4F0B...d036` | Proposes changes |
| **Admin** | `0xC021...19e7` | Executes changes (Vultisig vault) |

### Protected Operations

Require both owner proposal + admin execution:
- Token configuration changes
- Owner profit withdrawals
- Ownership transfers
- Token/ETH rescue operations

### Emergency Functions

Owner or admin can call directly (for initial setup):
- `setTokenConfig()` - Configure tokens
- `withdrawOwnerProfits()` - Withdraw accumulated fees

---

## 🔍 Verification

All contracts are verified with source code on their respective block explorers:

- **Mainnet:** https://etherscan.io/address/0x8b6c52E68185b07D6ebf451E790Fee2E81F9B334#code
- **Base:** https://basescan.org/address/0x06758b8521136e930d5b41a3c158266149d5eb16#code
- **Arbitrum:** https://arbiscan.io/address/0x06758B8521136E930D5b41A3c158266149d5EB16#code
- **Sepolia:** https://sepolia.etherscan.io/address/0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4#code

---

## 📈 Quick Stats

- **Networks:** 4 (3 mainnet + 1 testnet)
- **Total Deployment Cost:** ~0.08 ETH
- **Contract Version:** v2.1 (Dual Control + Rescue)
- **Security Model:** 2-of-2 Multi-Signature
- **Audit Status:** Self-reviewed, no external audit — 57 passing + 21 pending tests (see the [honest audit](https://flashbank.net/audit) and [improvement plan](../design/ROUTER_IMPROVEMENTS.md))
- **Launch Date:** 2025-11-26
- **v3 — ✅ LIVE + verified on all chains (2026-06-09):** capped owner fee, dual-sig-only, 2-day config/rescue timelock, expiry-drift fix, on-chain borrower `maxFee` pin. 84 passing tests. Ethereum `0x7791…AE35`, Base `0xDd6D…10AA`, Arbitrum `0x34Dc…9A17`, Sepolia `0x4682…846e`. The live UI now runs v3 on every chain (v2.1 had zero committed liquidity, so no migration was needed) — see the [v3 runbook](./V3_DEPLOYMENT.md).

---

## 🎯 Next Steps

### Immediate
- ✅ All networks deployed and verified
- ✅ Website configured for all networks
- 🔄 Deploy website to production
- 📢 Announce launch

### Short Term
- Monitor for any issues
- Build initial liquidity on each network
- Add demo contracts to mainnet/Base
- Create user guides and tutorials

### Medium Term
- Add more supported tokens (LINK, wstETH, etc.)
- Deploy to additional L2s (Optimism, Polygon, etc.)
- Implement cross-chain liquidity aggregation
- Add analytics dashboard

### Long Term
- Advanced features (limit orders, etc.)
- Governance system (optional)
- Protocol partnerships
- Institutional integrations

---

## 📞 Support

- **Website:** https://flashbank.net
- **Security:** [private GitHub advisory](https://github.com/Rotwang9000/flashbank-net/security/advisories/new) (email not set up yet)
- **GitHub:** https://github.com/Rotwang9000/flashbank-net
- **Documentation:** See `docs/security/DUAL_CONTROL.md` and the [honest audit](https://flashbank.net/audit)

---

**Status:** 🎉 ALL NETWORKS LIVE!  
**Last Updated:** 2025-11-26  
**Version:** v2.1 (Dual Control + Rescue)

