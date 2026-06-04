# 💱 Multi-Currency Flash Loans Analysis

## 🎯 The Liquidation Question

### Traditional Liquidation Flow

**Scenario:** Alice has ETH collateral, borrowed USDC. Her position becomes undercollateralized.

**Liquidator's Problem:**
1. Need USDC to repay Alice's debt
2. Want to receive ETH collateral
3. Don't have USDC upfront

**Current Solution (Single Currency Flash Loan):**

```
1. Flash loan WETH from FlashBank
2. Swap WETH → USDC on DEX
3. Repay Alice's USDC debt to Aave
4. Receive Alice's ETH collateral
5. Swap ETH → WETH (if needed)
6. Repay flash loan + fee
7. Keep profit
```

**Problem:** Two swaps = 2x slippage + 2x swap fees

---

## 💡 Multi-Currency Flash Loan Solution

### Optimal Liquidation Flow

**If we had USDC flash loans:**

```
1. Flash loan USDC from FlashBank (no swap!)
2. Repay Alice's USDC debt to Aave
3. Receive Alice's ETH collateral
4. Swap ETH → USDC once
5. Repay flash loan + fee
6. Keep profit
```

**Benefits:**
- ✅ One swap instead of two
- ✅ Half the slippage
- ✅ Half the swap fees
- ✅ More profitable liquidations
- ✅ Faster execution

---

## 🔍 Do They NEED to Convert?

### Answer: It Depends on the Protocol

#### Aave/Compound Style (Debt Token Repayment)
**YES - Must convert to debt token**

Example:
- User borrowed USDC
- Must repay in USDC
- Can't repay with ETH

#### Maker/CDP Style (Collateral Auction)
**NO - Can bid with any token**

Example:
- User's ETH is being auctioned
- Can bid with DAI, USDC, or other tokens
- Protocol handles conversion

#### Liquidation Incentive
**Typically 5-10% bonus**

Example:
- User owes $1000 USDC
- Liquidator repays $1000 USDC
- Receives $1050-1100 worth of ETH
- Profit: $50-100 (minus fees)

---

## 📊 Market Analysis: What Tokens to Add?

### Top Liquidation Currencies

| Token | Use Case | Volume | Priority |
|-------|----------|--------|----------|
| **USDC** | Most borrowed stablecoin | Very High | 🔥 HIGH |
| **USDT** | Second most borrowed | Very High | 🔥 HIGH |
| **DAI** | DeFi-native stablecoin | High | 🔥 HIGH |
| **WBTC** | BTC collateral liquidations | Medium | 🟡 MEDIUM |
| **stETH** | Liquid staking liquidations | Medium | 🟡 MEDIUM |
| **LINK** | Oracle collateral | Low | 🟢 LOW |

### Stablecoin Analysis

#### USDC (Circle)
- **Market Cap:** ~$25B
- **Protocols:** Aave, Compound, Maker, etc.
- **Liquidity:** Excellent
- **Risk:** Centralized (Circle can freeze)
- **Permit Support:** ✅ YES (EIP-2612)
- **Verdict:** 🔥 **MUST HAVE**

#### USDT (Tether)
- **Market Cap:** ~$90B
- **Protocols:** Aave, Compound, etc.
- **Liquidity:** Excellent
- **Risk:** Centralized, no permit
- **Permit Support:** ❌ NO
- **Verdict:** 🔥 **HIGH PRIORITY** (despite no permit)

#### DAI (MakerDAO)
- **Market Cap:** ~$5B
- **Protocols:** All major DeFi
- **Liquidity:** Excellent
- **Risk:** Decentralized, complex collateral
- **Permit Support:** ✅ YES
- **Verdict:** 🔥 **HIGH PRIORITY**

#### FRAX
- **Market Cap:** ~$650M
- **Protocols:** Growing adoption
- **Liquidity:** Good
- **Risk:** Algorithmic, partially collateralized
- **Permit Support:** ✅ YES
- **Verdict:** 🟡 **MEDIUM PRIORITY**

---

## 🎯 Multi-Currency Flash Loan Design

### Option 1: Sequential Flash Loans (Current)

**How it works:**
```solidity
// Liquidator calls flashLoan twice
router.flashLoan(WETH, 10 ether, false, "");
// ... in callback ...
router.flashLoan(USDC, 5000e6, false, ""); // ❌ BLOCKED by nonReentrant
```

**Problem:** ❌ Can't nest flash loans due to ReentrancyGuard

**Workaround:**
```solidity
// Take WETH loan, swap to USDC in callback
router.flashLoan(WETH, 10 ether, false, "");
```

**Limitations:**
- Must swap (slippage + fees)
- Less capital efficient
- More complex logic

---

### Option 2: Multi-Token Flash Loan (New Feature)

**How it works:**
```solidity
struct FlashLoanRequest {
    address token;
    uint256 amount;
}

function flashLoanMulti(
    FlashLoanRequest[] calldata requests,
    bytes calldata data
) external nonReentrant {
    // Pull multiple tokens
    // Call borrower with all tokens
    // Verify all repayments
    // Distribute all fees
}
```

**Benefits:**
- ✅ Borrow multiple tokens atomically
- ✅ No swaps needed for multi-currency liquidations
- ✅ More capital efficient
- ✅ Simpler borrower logic

**Example Use Case:**
```solidity
// Liquidate position with ETH collateral and USDC debt
FlashLoanRequest[] memory requests = new FlashLoanRequest[](1);
requests[0] = FlashLoanRequest(USDC, 5000e6);

router.flashLoanMulti(requests, "liquidate");

// In callback:
// 1. Repay USDC debt
// 2. Receive ETH collateral
// 3. Swap ETH → USDC
// 4. Repay flash loan
```

---

### Option 3: Cross-Pool Arbitrage

**Scenario:** USDC is 1.01 on Uniswap, 0.99 on Curve

**With Multi-Currency:**
```solidity
// Borrow both USDC and USDT
requests[0] = FlashLoanRequest(USDC, 100000e6);
requests[1] = FlashLoanRequest(USDT, 100000e6);

// In callback:
// 1. Swap USDC → USDT on Uniswap (high price)
// 2. Swap USDT → USDC on Curve (low price)
// 3. Repay both loans
// 4. Keep profit
```

---

## 🔧 Implementation Considerations

### Gas Costs

**Single Token:**
- Pull from providers: ~50k gas per provider
- Transfer to borrower: ~50k gas
- Callback: variable
- Verify repayment: ~10k gas
- Distribute: ~50k gas per provider
- **Total:** ~160k gas (2 providers)

**Multi Token (2 tokens):**
- Pull from providers: ~100k gas (2 tokens)
- Transfer to borrower: ~100k gas
- Callback: variable
- Verify repayment: ~20k gas
- Distribute: ~100k gas
- **Total:** ~320k gas (2 providers, 2 tokens)

**Verdict:** 2x gas but eliminates swap costs (often >100k gas + slippage)

---

### Liquidity Fragmentation

**Problem:** Splitting liquidity across multiple tokens

**Example:**
- 100 WETH in pool
- Add USDC pool → some LPs move
- Now 70 WETH + 30 USDC equivalent
- Each pool smaller

**Mitigation:**
- Start with high-demand tokens (USDC, USDT, DAI)
- Same LPs can provide multiple tokens
- Cross-pool fee sharing (optional)

---

### Fee Structure

**Option A: Same Fee for All Tokens**
- Simple
- Easy to understand
- May not reflect risk differences

**Option B: Per-Token Fees**
- WETH: 0.02% (volatile)
- USDC: 0.01% (stable)
- Reflects risk/demand

**Option C: Dynamic Fees**
- Based on utilization
- Higher demand = higher fees
- More complex

**Recommendation:** Start with Option A (0.02% for all), add Option B later

---

## 📈 Market Opportunity

### Liquidation Market Size

**Aave Liquidations (2023):**
- Volume: ~$500M
- Average: ~$1.4M per day
- Fee opportunity: $1.4M × 0.02% = $280/day

**If we capture 10%:**
- $140K/year in fees (WETH only)
- With stablecoins: potentially 2-3x

### Arbitrage Market

**DEX Arbitrage:**
- Stablecoin depegs
- Cross-DEX price differences
- Flash loan enables zero-capital arbitrage

**Estimated Volume:**
- $10M+ per day across all DEXes
- Fee opportunity: significant

---

## 🎯 Recommended Roadmap

### Phase 1: Current (WETH Only) ✅
- Focus on single token
- Build liquidity
- Prove concept

### Phase 2: Add Stablecoins (Next)
**Priority Order:**
1. **USDC** - Most used, has permit
2. **DAI** - DeFi standard, has permit
3. **USDT** - Highest volume, no permit

**Timeline:** 1-2 months after launch

**Benefits:**
- Enable direct liquidations
- Reduce swap costs
- Attract more users

### Phase 3: Multi-Token Flash Loans (Future)
**Features:**
- Borrow multiple tokens in one call
- More complex liquidations
- Cross-currency arbitrage

**Timeline:** 3-6 months after launch

**Benefits:**
- Advanced strategies
- Competitive advantage
- Higher TVL

### Phase 4: Additional Tokens (Long-term)
- WBTC (BTC liquidations)
- stETH (liquid staking)
- LINK (oracle collateral)
- Others based on demand

---

## 💡 Stablecoin Pool Design

### Configuration for USDC

```solidity
// Same structure as WETH
tokenConfigs[USDC] = TokenConfig({
    enabled: true,
    supportsPermit: true,  // USDC has permit!
    feeBps: 2,             // 0.02% (same as WETH)
    maxFlashLoan: 1_000_000e6,  // 1M USDC
    wrapper: address(0),   // No wrapper needed
    maxBorrowBps: 5000,    // 50% of pool
    ownerFeeBps: 200       // 2% of fee
});
```

**Key Differences from WETH:**
- No wrapper (no "native" version of USDC)
- Higher max loan (stablecoins less volatile)
- Same fee structure

---

## 🔍 Technical Challenges

### 1. No Wrapper for Stablecoins

**WETH has wrapper:**
- Can convert WETH ↔ ETH
- `toNative` parameter works

**USDC has no wrapper:**
- Can't convert to "native USDC"
- `toNative` parameter must be false
- Simpler code path

**Solution:** Already handled in contract! `wrapper` can be `address(0)`

---

### 2. Different Decimals

**WETH:** 18 decimals  
**USDC:** 6 decimals  
**USDT:** 6 decimals  
**DAI:** 18 decimals

**Impact:**
- Fee calculations work (basis points)
- Amount validation works
- Display in UI needs adjustment

**Solution:** Already handled! Contract is decimal-agnostic

---

### 3. USDT No Permit

**Problem:** USDT doesn't support EIP-2612 permit

**Impact:**
- Can't use `setCommitmentWithPermit()`
- Must use `setCommitment()` (requires prior approval)

**Solution:**
```solidity
tokenConfigs[USDT] = TokenConfig({
    enabled: true,
    supportsPermit: false,  // ← Set to false
    // ... rest of config
});
```

Already supported in contract!

---

### 4. Centralization Risk

**USDC/USDT:** Circle/Tether can freeze addresses

**Risk:** If router address is frozen, all funds stuck

**Mitigation:**
- Non-custodial design (funds in provider wallets)
- If router frozen, providers can revoke approval
- Worst case: deploy new router, migrate

**Verdict:** Low risk due to non-custodial design

---

## 📊 Competitive Analysis

### Aave Flash Loans
- **Tokens:** WETH, USDC, USDT, DAI, WBTC, etc.
- **Fee:** 0.09%
- **Multi-token:** ✅ YES
- **Advantage:** More tokens, established

### dYdX Flash Loans
- **Tokens:** WETH, USDC, DAI
- **Fee:** 0% (but complex)
- **Multi-token:** ❌ NO (sequential only)
- **Advantage:** Zero fee

### FlashBank (Current)
- **Tokens:** WETH only
- **Fee:** 0.02%
- **Multi-token:** ❌ NO
- **Advantage:** Lowest fee, non-custodial

### FlashBank (Phase 2)
- **Tokens:** WETH, USDC, DAI, USDT
- **Fee:** 0.02%
- **Multi-token:** ❌ NO (Phase 3)
- **Advantage:** Lowest fee, key tokens covered

### FlashBank (Phase 3)
- **Tokens:** WETH, USDC, DAI, USDT+
- **Fee:** 0.02%
- **Multi-token:** ✅ YES
- **Advantage:** Lowest fee, multi-token, non-custodial

---

## 🎯 Immediate Next Steps

### Research Phase (This Week)
- [x] Analyze liquidation flows
- [x] Identify key tokens
- [x] Design multi-currency approach
- [ ] Estimate market opportunity
- [ ] Survey potential users

### Design Phase (Next Week)
- [ ] Design USDC pool parameters
- [ ] Update UI for multi-token
- [ ] Plan migration strategy
- [ ] Write deployment scripts

### Implementation Phase (Month 2)
- [ ] Deploy USDC pool on testnet
- [ ] Test liquidation scenarios
- [ ] Deploy to mainnet
- [ ] Monitor usage

### Expansion Phase (Month 3+)
- [ ] Add DAI
- [ ] Add USDT
- [ ] Design multi-token flash loans
- [ ] Implement and test

---

## 💰 Revenue Projections

### Current (WETH Only)
- Estimated volume: $1M/day
- Fee (0.02%): $200/day
- Annual: $73K

### With Stablecoins
- WETH volume: $1M/day
- Stablecoin volume: $2M/day (liquidations)
- Total: $3M/day
- Fee (0.02%): $600/day
- Annual: $219K

### With Multi-Token
- Advanced strategies unlock more volume
- Estimated: $5M/day
- Fee: $1K/day
- Annual: $365K

**ROI:** Adding stablecoins could 3x revenue with minimal development cost

---

## ✅ Conclusion

### Should We Add Stablecoins?

**YES - High Priority**

**Reasons:**
1. ✅ Enables direct liquidations (no swaps)
2. ✅ Reduces costs for users (more competitive)
3. ✅ Expands addressable market (2-3x)
4. ✅ Technical implementation is straightforward
5. ✅ Contract already supports it (no changes needed!)

### Recommended Order:
1. **USDC** - Most demand, has permit, widely used
2. **DAI** - DeFi standard, decentralized, has permit
3. **USDT** - Highest volume, no permit (minor UX issue)

### Timeline:
- **Week 1-2:** Research & design
- **Week 3-4:** Deploy USDC on testnet
- **Week 5-6:** Deploy USDC on mainnet
- **Week 7-8:** Add DAI
- **Week 9-10:** Add USDT

**Total:** 2-3 months to have all major stablecoins

---

**Last Updated:** 2025-11-26  
**Status:** Research Complete ✅  
**Next:** Design USDC pool parameters


