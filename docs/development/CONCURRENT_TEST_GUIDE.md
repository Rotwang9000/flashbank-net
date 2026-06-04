# Concurrent Flash Loan Test Guide

## 🎯 Objective
Test multiple borrowers requesting flash loans in the same block to verify:
- Provider balance tracking across concurrent loans
- `inUse` values prevent over-commitment
- Fee distribution works correctly with concurrent transactions
- Single-provider optimization activates for small loans (<10 ETH)

## 📋 Prerequisites

### 1. **Deployed Contracts** ✅
All contracts deployed to Sepolia with single-provider optimization:

| Contract | Address |
|----------|---------|
| FlashBankRouter | `0x2d981Cec54A2fE1eAb870A804327d17B90E93Dc5` |
| WETH | `0xdd13E55209Fd76AfE204dBda4007C227904f0a81` |
| DemoFlashBorrower | `0x5559Bc4dB6Dfd2FfA3905759b44464d217001E20` |
| ProofOfFunds | `0x4D3bCf9a5F075b3A485C17a403AAC71C9435f054` |
| DemoCounter | `0xd7E35C9f88da5387cA48498bEE7493966D19415b` |

View on Etherscan:
https://sepolia.etherscan.io/address/0x2d981Cec54A2fE1eAb870A804327d17B90E93Dc5

### 2. **Liquidity Providers Needed**
You need **at least 2 accounts** with WETH committed:

**Setup via Website:**
1. Go to https://your-website.com (or localhost:3000)
2. Connect Account 1
   - Wrap some ETH → WETH (e.g., 5 ETH)
   - Approve router
   - Set commitment (e.g., 3 WETH or Unlimited)
3. Disconnect and connect Account 2
   - Wrap some ETH → WETH (e.g., 5 ETH)
   - Approve router
   - Set commitment (e.g., 3 WETH or Unlimited)

**Minimum Required:**
- Provider 1: 1 WETH committed
- Provider 2: 0.5 WETH committed
- Total: 1.5 WETH available for testing

### 3. **Test Accounts in Hardhat Config**
The test script uses hardhat accounts:
- `accounts[0]`: Deployer
- `accounts[1]`: Provider 1
- `accounts[2]`: Provider 2
- `accounts[3]`: Borrower 1
- `accounts[4]`: Borrower 2
- `accounts[5]`: Borrower 3

Make sure your `hardhat.config.js` has:
```javascript
sepolia: {
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  // ...
}
```

## 🚀 Running the Test

### Option 1: Automated Test Script

```bash
cd /home/rotwang/flashbank-net
npx hardhat run scripts/test-concurrent-loans.js --network sepolia
```

This script will:
1. ✅ Check current router state and committed liquidity
2. ✅ Send 2 concurrent small loans (0.05 ETH, 0.1 ETH) - testing single-provider optimization
3. ✅ Analyze gas usage and which providers were used
4. ✅ Send 1 large loan (15 ETH) - testing multi-provider pull
5. ✅ Display detailed results and transaction links

### Option 2: Manual Testing via Website

1. **Open 3 browser tabs/windows** (or use different browsers/devices)
2. **Tab 1**: Connect as Borrower 1
3. **Tab 2**: Connect as Borrower 2  
4. **Tab 3**: Connect as Borrower 3

**Synchronized Actions:**
1. All 3 tabs: Navigate to homepage
2. All 3 tabs: Prepare demo with different amounts:
   - Tab 1: Set demo amount to 0.05 ETH
   - Tab 2: Set demo amount to 0.1 ETH
   - Tab 3: Set demo amount to 2 ETH
3. **All 3 tabs: Click "Run Demo (Success)" at the same time**
4. Wait for transactions to confirm
5. Check Etherscan to see if they landed in the same block

## 📊 What to Look For

### 1. **Single-Provider Optimization**
For loans **< 10 ETH**, the router should prefer a single provider:

**Check in Etherscan:**
- Look at "Internal Transactions" tab
- **Small loans (0.05, 0.1 ETH)**: Should see only 2 WETH transfers:
  - `Provider → Router` (single source)
  - `Router → Provider` (repayment with fee)
- **Gas should be ~175k** for toNative=true

**Large loans (15 ETH)**: Should see 4+ WETH transfers:
  - `Provider1 → Router`
  - `Provider2 → Router`
  - `Router → Provider1` (with fee)
  - `Router → Provider2` (with fee)
- **Gas should be ~275k+** depending on provider count

### 2. **Concurrent Execution**
**Best Case:** Both transactions in the same block
- Check block numbers on Etherscan
- Verifies that `inUse` tracking works correctly

**Likely Case (Sepolia):** Different blocks (2-5 seconds apart)
- Still valid test - verifies sequential execution works
- True concurrent execution requires flashbots/private mempool or local network

### 3. **Fee Distribution**
Check each provider's WETH balance before and after:

**Provider 1 Example:**
- Before: 3.00000000 WETH
- Contributed: 0.05110553 WETH
- After: 3.00001022 WETH
- **Profit: 0.00001022 WETH** (0.02% of their contribution)

### 4. **Event Logs**
Each successful loan should emit:
- `FlashLoanExecuted(borrower, token, amount, fee, toNative)`
- Multiple `Transfer` events (WETH movements)
- `DemoStart`, `DemoReceived`, `FundsCounted`, etc. (from demo contracts)

## 🔬 Advanced Testing

### Test Different Scenarios

#### Scenario A: Insufficient Liquidity
```bash
# Try to borrow more than available
# Expected: Transaction should revert with InsufficientCommittedLiquidity
npx hardhat run scripts/test-concurrent-loans.js --network sepolia
# Then manually try a 100 ETH loan via website
```

#### Scenario B: Provider Paused Mid-Test
```bash
# 1. Start test script
# 2. While waiting, pause one provider via website
# 3. Observe that router routes around paused provider
```

#### Scenario C: Single Provider Can't Fulfill
```bash
# Set up:
# - Provider 1: 0.5 WETH limit
# - Provider 2: 0.5 WETH limit
# Request: 0.8 WETH loan (under 10 ETH threshold)
# Expected: Router falls back to multi-provider (pulls from both)
```

## 📈 Gas Analysis Checklist

| Scenario | Expected Gas | Check |
|----------|--------------|-------|
| 1 provider, WETH-only | ~120k | ☐ |
| 1 provider, toNative | ~175k | ☐ |
| 2 providers, WETH-only | ~220k | ☐ |
| 2 providers, toNative | ~275k | ☐ |
| 3+ providers, toNative | ~375k+ | ☐ |

## ✅ Success Criteria

- [ ] Multiple loans execute without reverting
- [ ] Small loans (<10 ETH) use single provider when available
- [ ] Large loans (>10 ETH) use multiple providers correctly
- [ ] Fees distributed proportionally to all providers
- [ ] No double-spending (inUse tracking works)
- [ ] Gas costs match expectations
- [ ] All transactions verifiable on Etherscan

## 🐛 Troubleshooting

### "No liquidity committed yet"
→ Set up provider commitments via website first

### "Borrowers need ETH for gas"
→ Send some Sepolia ETH to test accounts

### "Transaction reverted: InsufficientCommittedLiquidity"
→ Reduce loan amounts or add more provider commitments

### "Nonce too low/high"
→ Wait a few blocks between tests or reset account nonce

### Gas estimation failed
→ Check that demo borrower has enough ETH for fees (at least 0.01 ETH per borrower)

## 📝 Next Steps

After successful concurrent testing:

1. **Document results** in `/home/rotwang/flashbank-net/TEST_RESULTS.md`
2. **Update gas study** with real concurrent data
3. **Deploy to Base/Arbitrum** for production testing
4. **Consider adding**:
   - Maximum concurrent loan limit
   - Provider-specific rate limiting
   - Advanced fee distribution strategies

## 🔗 Useful Links

- **Router Contract:** https://sepolia.etherscan.io/address/0x2d981Cec54A2fE1eAb870A804327d17B90E93Dc5
- **Gas Study:** /gas-study (on website)
- **Borrower Guide:** /guides/borrow
- **Security Audit:** /security-audit

---

**Happy Testing! 🚀**

