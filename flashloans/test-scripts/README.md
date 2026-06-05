# FlashBank Test Suite

Comprehensive test scripts for validating FlashBankRouter security and dual-control functionality.

## Overview

This directory contains automated test scripts that verify:
- ✅ Dual-control workflow (propose + execute)
- ✅ Security restrictions (unauthorized access prevention)
- ✅ Owner/admin role separation
- ✅ Profit generation and withdrawal
- ✅ Attack resistance

## Prerequisites

### Environment Variables

Required in `.env`:
```bash
PRIVATE_KEY=<deployer/owner private key>
TESTNET_ADMIN_PRIVATE_KEY=<admin private key for testnets>
TEST_PRIVATE_KEY_1=<provider wallet 1 with WETH>
TEST_PRIVATE_KEY_2=<provider wallet 2 with WETH>
ETHERSCAN_API_KEY=<for contract verification>
```

### Deployed Contracts

Ensure the following are deployed and addresses are in `website/.env.local`:
- `NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS` - FlashBankRouter
- `NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS` - WETH token
- `NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS` - Demo borrower contract

### Provider Setup

Test wallets 1 & 2 should have:
- At least 0.02 WETH each
- Sufficient ETH for gas (0.01+ ETH recommended)

## Test Scripts

### 1. Positive Tests (`test-dual-control.js`)

Tests that the dual-control workflow functions correctly.

**What it tests:**
- ✅ Token config changes (propose → execute)
- ✅ Profit withdrawals (propose → execute)
- ✅ Ownership transfers (propose only, dry run)
- ✅ Role verification (owner/admin on-chain)
- ✅ TESTNET_ADMIN_PRIVATE_KEY automation

**Run:**
```bash
npx hardhat run test-scripts/test-dual-control.js --network sepolia
```

**Expected output:**
```
✅ Token config change: PASSED
✅ Profit withdrawal: PASSED (or SKIPPED if no profits)
✅ Ownership transfer (dry run): PASSED
```

**What it does:**
1. Verifies deployer is owner and admin key matches on-chain
2. Owner proposes fee change (e.g., 2 bps → 3 bps)
3. Admin executes the change using `TESTNET_ADMIN_PRIVATE_KEY`
4. Verifies new fee on-chain
5. If profits exist, tests withdrawal workflow
6. Proposes (but doesn't execute) ownership transfer to dummy address

**Side effects:**
- Changes router fee by ±1 bps
- Withdraws half of available owner profits (if any)
- Leaves one pending ownership transfer proposal (harmless)

---

### 2. Negative Tests (`test-dual-control-negative.js`)

Tests that security restrictions prevent unauthorized actions.

**What it tests:**
- ✅ Admin cannot execute without proposal
- ✅ Non-owner cannot propose changes
- ✅ Non-admin cannot execute changes
- ✅ Direct `transferOwnership()` blocked
- ✅ Direct `renounceOwnership()` blocked
- ✅ Profit withdrawal restrictions
- ✅ Admin change restrictions
- ✅ Rescue function restrictions

**Run:**
```bash
npx hardhat run test-scripts/test-dual-control-negative.js --network sepolia
```

**Expected output:**
```
✅ Tests Passed: 12
❌ Tests Failed: 0
```

**What it does:**
1. **Setup:** Generates real profits via demo flash loan
   - Approves router for test wallets 1 & 2
   - Sets unlimited WETH commitments
   - Runs 0.01 WETH flash loan through demo borrower
   - Generates ~0.00000006 WETH in owner profits
2. **Tests:** Attempts various unauthorized actions and verifies they revert
3. **Cleanup:** Executes valid proposals to clean up state

**Side effects:**
- Test wallets 1 & 2 will have unlimited commitments set
- Generates small amount of owner profits (~0.00000006 WETH)
- Withdraws half the generated profits during cleanup
- Changes router fee by ±1 bps during cleanup

---

## Running All Tests

Run both test suites in sequence:

```bash
# Positive tests
npx hardhat run test-scripts/test-dual-control.js --network sepolia

# Negative tests
npx hardhat run test-scripts/test-dual-control-negative.js --network sepolia
```

Or create a combined script:

```bash
#!/bin/bash
echo "Running FlashBank Test Suite..."
echo ""
echo "=== Positive Tests ==="
npx hardhat run test-scripts/test-dual-control.js --network sepolia || exit 1
echo ""
echo "=== Negative Tests ==="
npx hardhat run test-scripts/test-dual-control-negative.js --network sepolia || exit 1
echo ""
echo "🎉 All tests passed!"
```

Save as `test-scripts/run-all.sh` and run:
```bash
chmod +x test-scripts/run-all.sh
./test-scripts/run-all.sh
```

---

## Test Results Reference

### Successful Positive Test Output

```
=== Dual-Control End-to-End Test ===

Router: 0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4
WETH: 0xdd13E55209Fd76AfE204dBda4007C227904f0a81

Deployer (Owner): 0x4F0B...d036
Admin: 0x3CD6...c191

✅ Roles verified!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST 1: Token Config Change
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current fee: 2 bps
Changing fee to: 3 bps

[Owner] Proposing config change...
✅ Proposed! Tx: 0x547ca...

[Admin] Executing config change...
✅ Executed! Tx: 0xa0ade...

✅ Verified! New fee: 3 bps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 ALL TESTS PASSED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Token config change: PASSED
⏭️  Profit withdrawal: SKIPPED (no profits)
✅ Ownership transfer (dry run): PASSED
```

### Successful Negative Test Output

```
=== Dual-Control Negative Tests ===

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETUP: Generate Profits via Demo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Setting up providers with WETH...
Test Wallet 1 WETH: 0.036 WETH
Test Wallet 2 WETH: 0.080 WETH

✅ Demo completed! Tx: 0x123f0...
💰 Owner profits generated: 0.00000006 WETH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST 1: Admin Execute Without Proposal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Admin executes config without proposal: PASSED (reverted as expected)

[... 11 more tests ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 NEGATIVE TESTS COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Tests Passed: 12
❌ Tests Failed: 0
```

---

## Troubleshooting

### "TESTNET_ADMIN_PRIVATE_KEY not set"

Add to `.env`:
```bash
TESTNET_ADMIN_PRIVATE_KEY=0x...
```

### "Router address not found"

Ensure `website/.env.local` has:
```bash
NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=0x...
```

### "Test wallets need WETH"

Fund test wallets:
```bash
# Wrap ETH to WETH on Sepolia
# Send to TEST_PRIVATE_KEY_1 and TEST_PRIVATE_KEY_2 addresses
```

### "Insufficient funds for gas"

Send Sepolia ETH to:
- Deployer address (PRIVATE_KEY)
- Admin address (TESTNET_ADMIN_PRIVATE_KEY)
- Test wallet addresses (TEST_PRIVATE_KEY_1, TEST_PRIVATE_KEY_2)

### Tests fail after contract changes

This is expected! The tests validate security. If they fail:
1. Review the error messages
2. Check if the contract change broke security guarantees
3. Update tests if the change is intentional
4. Fix the contract if the change broke security

---

## Maintenance

### After Contract Changes

Always run both test suites:
```bash
./test-scripts/run-all.sh
```

If tests fail, determine if:
- ✅ Tests need updating (intentional contract change)
- ❌ Contract has a security issue (unintentional break)

### Before Mainnet Deployment

1. Run full test suite on Sepolia
2. Verify all 12+ tests pass
3. Review test output for any warnings
4. Check Etherscan for transaction success
5. Verify on-chain state matches expectations

### Adding New Tests

1. Create new test file in `test-scripts/`
2. Follow naming convention: `test-<feature>.js`
3. Update this README with test description
4. Add to `run-all.sh` if applicable

---

## Test Coverage

### Covered Scenarios ✅

- Owner/admin role verification
- Token config changes (propose + execute)
- Profit withdrawals (propose + execute)
- Ownership transfers (propose + execute)
- Admin cannot execute without proposal
- Non-owner cannot propose
- Non-admin cannot execute
- Direct `transferOwnership()` blocked
- Direct `renounceOwnership()` blocked
- Profit withdrawal amount validation
- Admin change restrictions
- Rescue function restrictions
- TESTNET_ADMIN_PRIVATE_KEY automation

### Not Covered (Manual Testing Required)

- Mainnet deployment with real Vultisig vault
- Multi-device TSS signing flow
- Etherscan "Write Contract" UI workflow
- Gas cost analysis at scale
- Concurrent flash loans from real users
- Provider pause/resume during active loans

---

## Security Checklist

Before mainnet:
- [ ] All test scripts pass on testnet
- [ ] Dual-control workflow tested with real admin key
- [ ] Negative tests confirm attack resistance
- [ ] Contract verified on Etherscan
- [ ] Admin address is secure multisig/vault
- [ ] Deployer key separate from admin key
- [ ] Emergency procedures documented
- [ ] Monitoring/alerting set up for events

---

## Support

Questions or issues?
- GitHub: https://github.com/flashbank-net/flashbank/issues
- Security: security@flashbank.net
- Docs: `/DUAL_CONTROL.md`, `/SECURITY_SUMMARY.md`

---

**Last Updated:** 2025-11-26  
**Contract Version:** FlashBankRouter v2.1 (Dual Control + Rescue)  
**Test Suite Version:** 1.0

