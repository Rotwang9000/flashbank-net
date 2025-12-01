# FlashBank Deployment Status

## ✅ Deployed Networks

### Arbitrum One (Chain ID: 42161)
- **Router:** `0x06758B8521136E930D5b41A3c158266149d5EB16`
- **WETH:** `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1`
- **Admin:** `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7` (Vultisig vault)
- **Owner:** `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036`
- **Status:** ✅ Deployed & Verified
- **Explorer:** https://arbiscan.io/address/0x06758B8521136E930D5b41A3c158266149d5EB16
- **Configuration:**
  - Fee: 2 bps (0.02%)
  - Max loan: 1000 WETH
  - Max borrow: 50% of pool
  - Owner fee: 2% of fee (0.0004% of loan)

### Sepolia Testnet (Chain ID: 11155111)
- **Router:** `0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4`
- **WETH:** `0xdd13E55209Fd76AfE204dBda4007C227904f0a81`
- **Admin:** `0x3CD6BbF16599Af7FDe6F4b7C8b6FD6Bea4EDc191` (testnet override)
- **Owner:** `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036`
- **Demo Borrower:** `0xFD0a29b84533d9CEF69e63311bb766236f09a454`
- **Status:** ✅ Deployed & Verified
- **Explorer:** https://sepolia.etherscan.io/address/0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4

---

## ⏳ Pending Deployments

### Ethereum Mainnet (Chain ID: 1)
- **Status:** ⏳ Awaiting ETH
- **Required:** ~0.072 ETH for deployment
- **Current Balance:** 0.0051 ETH
- **Need:** ~0.067 more ETH
- **Admin (planned):** `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7` (Vultisig vault)
- **WETH:** `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`

### Base (Chain ID: 8453)
- **Status:** ⏳ Awaiting ETH
- **Required:** ~0.0038 ETH for deployment
- **Current Balance:** 0.00125 ETH
- **Need:** ~0.0026 more ETH
- **Admin (planned):** `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7` (Vultisig vault)
- **WETH:** `0x4200000000000000000000000000000000000006`

---

## 📋 Deployment Commands

Once ETH is available:

### Ethereum Mainnet
```bash
./scripts/deploy-mainnet.sh
```

### Base
```bash
./scripts/deploy-base.sh
```

### Arbitrum (Already Deployed)
```bash
./scripts/deploy-arbitrum.sh
```

---

## 🔧 Website Configuration

### Current `.env.local` Values

#### Sepolia (Active)
```bash
NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4
NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=0xdd13E55209Fd76AfE204dBda4007C227904f0a81
NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS=0xFD0a29b84533d9CEF69e63311bb766236f09a454
```

#### Arbitrum (Active)
```bash
NEXT_PUBLIC_ARBITRUM_ROUTER_ADDRESS=0x06758B8521136E930D5b41A3c158266149d5EB16
NEXT_PUBLIC_ARBITRUM_WETH_ADDRESS=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
```

#### Mainnet (Pending)
```bash
# NEXT_PUBLIC_MAINNET_ROUTER_ADDRESS=<pending>
NEXT_PUBLIC_MAINNET_WETH_ADDRESS=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
```

#### Base (Pending)
```bash
# NEXT_PUBLIC_BASE_ROUTER_ADDRESS=<pending>
NEXT_PUBLIC_BASE_WETH_ADDRESS=0x4200000000000000000000000000000000000006
```

---

## 🚀 Next Steps

1. **Fund Deployer Address:** Send ETH to `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036`
   - Mainnet: ~0.067 more ETH
   - Base: ~0.0026 more ETH

2. **Deploy Remaining Networks:**
   ```bash
   ./scripts/deploy-mainnet.sh
   ./scripts/deploy-base.sh
   ```

3. **Update Website `.env.local`:**
   - Add router addresses for mainnet and Base
   - Redeploy website

4. **Test on Each Network:**
   - Verify contracts on explorers
   - Test token approval
   - Test commitment setting
   - Test flash loan (if liquidity available)

5. **Update Documentation:**
   - Add mainnet/Base addresses to README
   - Update security page with all networks
   - Update CHANGELOG

---

## 📊 Gas Cost Estimates

| Network | Gas Price | Deployment Cost | Verification |
|---------|-----------|-----------------|--------------|
| Ethereum | ~20 gwei | ~0.076 ETH | ✅ Etherscan |
| Base | ~1 gwei | ~0.0038 ETH | ✅ Basescan |
| Arbitrum | ~0.1 gwei | ~0.0038 ETH | ✅ Arbiscan |
| Sepolia | ~2 gwei | ~0.008 ETH | ✅ Etherscan |

*Estimates based on current network conditions. Actual costs may vary.*

---

## 🔐 Security Notes

- All deployments use the same admin address: `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7` (Vultisig vault)
- Sepolia uses testnet admin: `0x3CD6BbF16599Af7FDe6F4b7C8b6FD6Bea4EDc191` for automated testing
- Dual-control mechanism active on all networks
- All contracts verified on respective block explorers

---

**Last Updated:** 2025-11-26  
**Version:** v2.1 (Dual Control + Rescue)
