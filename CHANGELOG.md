# FlashBank Changelog

## v3.0 - P2P Term Loans (2026-06-07)

A second, independent product alongside the flash-loan Router: `FlashBankP2PLoan`, a neutral escrow for
fixed-term, collateral-backed loans agreed directly between two people. No pools, no price oracle, no
liquidations — settlement is purely time-based.

### ✨ Core feature
- **Added** `FlashBankP2PLoan.sol` — create / take / repay / claimDefault / cancel, with the escrow held
  only between creation and settlement. Lives in its own self-contained `loans/` Hardhat project.
- **Time-only settlement.** Repay `principal + a flat fee` before `maturity + grace`, or the lender claims
  the collateral. Nothing is priced on-chain, so **no oracle is needed**.
- **Flat fee, not interest** — friendlier to faith-based finance that avoids *riba* (not a certification
  claim).
- **Three optional, default-off fees:** opt-in interface fee (0% introductory), non-refundable featured
  **boost** (advert, ranks placement), and a per-offer service fee to any address. Direct P2P is zero
  commission.

### 🤝 Optional surplus return (agreed rate, still no oracle)
- **Added** an optional per-offer **agreed rate** (`settlementValue`): on default the lender keeps only the
  collateral covering `principal + fee` at that frozen rate and the borrower reclaims the surplus; leave it
  `0` for a pure pledge/forfeit. Honours [Lorrow](https://whysideas.github.io/lorrow/)'s surplus-return
  guardrail without a price feed (see `docs/design/LORROW_COMPATIBILITY.md`).

### 📝 Editable offers (front-running-safe)
- **Added** `updateOffer` — amend an open offer's non-escrow terms in place (agreed rate, flat fee, timing,
  service fee) without forfeiting the existing featured placement.
- **Added** `boostOffer` — top up featured placement on an open offer.
- **Added** a `version` counter + `takeChecked(id, version)` so a taker can pin the exact terms they
  reviewed and reject a last-second re-price.

### 🧪 Testing
- **Added** `loans/test/FlashBankP2PLoan.test.js` — 45 unit tests: full lifecycle, time-based default, the
  three-tier fee model and boost, in-place amendments + version-pinned take, a live re-entrancy attack via
  a malicious token, and a randomised fund-conservation fuzz test.

### 🌐 Website
- **Added** `/flashbank-loan` marketplace (Browse / Flashbank a loan / Your loans / How it works) with a
  per-offer collateral-split diagram and an in-app edit-offer modal.
- **Added** `/audit` — an honest, self-reviewed audit of **both** features (custody, trust assumptions,
  what's tested, known limits), and `/lorrow` — the Lorrow compatibility write-up.

### 📦 Deployment (Sepolia playground — testnet only, no real value)
- **FlashBankP2PLoan:** `0x3Ce4B6DC383d3105A6D35a6816BC10D395Aa1017` (verified on Etherscan)
- **fpUSD (6d):** `0x4aBb056aA5aB39b55039ACAf795Ff9403Fa9760c` · **fpETH (18d):** `0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5`

## v2.1 - Dual-Control Security Architecture (2025-11-26)

### 🔐 Security Enhancements

#### Dual-Signature Control (2-of-2 Multi-Sig)
- **Added** separate `admin` role (Vultisig vault) alongside `owner` (deployer)
- **Implemented** propose/execute workflow for critical operations:
  - Token configuration changes (`proposeTokenConfig` / `executeTokenConfig`)
  - Owner profit withdrawals (`proposeProfitWithdrawal` / `executeProfitWithdrawal`)
  - Ownership transfers (`proposeOwnershipTransfer` / `executeOwnershipTransfer`)
  - Token/ETH rescue operations (`proposeRescueToken` / `proposeRescueETH`)
- **Disabled** direct `transferOwnership()` and `renounceOwnership()` calls
- **Added** `setAdmin()` function (owner-only) to change admin address
- **Added** `onlyOwnerOrAdmin` modifier for emergency/initial setup functions

#### State Management
- **Added** `mapping(bytes32 => bool) public pendingChanges` for tracking proposals
- **Added** events: `AdminUpdated`, `ChangeProposed`, `ChangeExecuted`
- **Added** custom errors: `NotAdmin`, `ChangeNotProposed`

### 🧪 Testing Infrastructure

#### Test Suite Organization
- **Created** `test-scripts/` directory for security tests
- **Added** `test-scripts/test-dual-control.js` - Positive workflow tests
- **Added** `test-scripts/test-dual-control-negative.js` - Security restriction tests (12 scenarios)
- **Added** `test-scripts/run-all.sh` - Combined test runner
- **Added** `test-scripts/README.md` - Comprehensive testing documentation

#### Test Coverage
- ✅ Owner/admin role verification
- ✅ Token config changes (propose + execute)
- ✅ Profit withdrawals (propose + execute)
- ✅ Ownership transfers (propose + execute)
- ✅ Admin cannot execute without proposal
- ✅ Non-owner cannot propose
- ✅ Non-admin cannot execute
- ✅ Direct `transferOwnership()` blocked
- ✅ Direct `renounceOwnership()` blocked
- ✅ Profit withdrawal amount validation
- ✅ Admin change restrictions
- ✅ Rescue function restrictions

### 🛠️ Deployment & Scripts

#### New Scripts
- **Added** `scripts/set-admin.js` - Change admin address (owner-only)
- **Added** `scripts/dual-control-config.js` - Helper for token config workflow
- **Added** `scripts/dual-control-withdraw.js` - Helper for profit withdrawal workflow
- **Updated** `scripts/transfer-ownership.js` - Rewritten for dual-control workflow
- **Updated** `scripts/deploy-router.js` - Pass admin address to constructor
- **Updated** `scripts/deploy-sepolia.sh` - Include admin address in verification

#### Environment Variables
- **Added** `ADMIN_ADDRESS` - Production admin (Vultisig vault)
- **Added** `TESTNET_ADMIN_ADDRESS` - Testnet admin for automated testing
- **Added** `TESTNET_ADMIN_PRIVATE_KEY` - Enables automated dual-control tests

### 📚 Documentation

#### New Documentation
- **Created** `DUAL_CONTROL.md` - Comprehensive dual-control guide with examples
- **Updated** `SECURITY_SUMMARY.md` - Added dual-control architecture details
- **Updated** `SECURITY_AUDIT.md` - Added dual-control security analysis
- **Updated** `website/src/pages/security.tsx` - Merged security audit into main page

#### Documentation Highlights
- Detailed Etherscan/Vultisig interaction guide
- CLI usage examples for propose/execute workflow
- Security benefits and threat model
- Setup instructions for Vultisig/Gnosis Safe/Hardware Wallets

### 🌐 Website Updates

#### UI Improvements
- **Updated** Fail Demo to show flow immediately when clicked
- **Added** Warning about wallet rejections for fail demo
- **Added** Link to example test transaction for fail demo
- **Added** Yellow warning box when wallet rejects fail demo
- **Merged** Security audit page into main security page
- **Added** Dual-control documentation to security page
- **Added** Etherscan interaction guide to security page

### 🔧 Contract Changes

#### Constructor
```solidity
constructor(address _admin) Ownable(msg.sender) {
    admin = _admin;
    emit AdminUpdated(address(0), _admin);
}
```

#### Example Dual-Control Functions
```solidity
function proposeTokenConfig(address token, TokenConfig calldata config) external onlyOwner {
    bytes32 changeHash = keccak256(abi.encode(token, config));
    pendingChanges[changeHash] = true;
    emit ChangeProposed(changeHash, msg.sender);
}

function executeTokenConfig(address token, TokenConfig calldata config) external {
    if (msg.sender != admin) revert NotAdmin();
    bytes32 changeHash = keccak256(abi.encode(token, config));
    if (!pendingChanges[changeHash]) revert ChangeNotProposed();
    tokenConfigs[token] = config;
    delete pendingChanges[changeHash];
    emit ChangeExecuted(changeHash, msg.sender);
}
```

### 📦 Deployment Addresses

#### Sepolia Testnet
- **Router:** `0x9a4FbC70b30f32006A3fe834173D16b7A0e4E7D4`
- **Admin:** `0x3CD6BbF16599Af7FDe6F4b7C8b6FD6Bea4EDc191` (testnet override)
- **Owner:** `0x4F0B3C7fdf5D7C3C7179E1E180b28D23a16fd036`
- **Demo Borrower:** `0xFD0a29b84533d9CEF69e63311bb766236f09a454`

#### Mainnet (Pending)
- **Admin:** `0xC021...319e7` (Vultisig vault)

### 🎯 Security Verification

All security tests passed:
- ✅ 12/12 negative security tests
- ✅ 3/3 positive workflow tests
- ✅ Dual-control mechanism verified on Sepolia
- ✅ TESTNET_ADMIN_PRIVATE_KEY automation working
- ✅ Contract ready for mainnet deployment

### 🔄 Breaking Changes

- **Constructor** now requires `_admin` address parameter
- **`transferOwnership()`** reverts with "Use proposeOwnershipTransfer"
- **`renounceOwnership()`** reverts with "Ownership cannot be renounced"
- **Critical operations** now require two signatures (owner + admin)

### 📝 Migration Guide

For existing deployments:
1. Deploy new contract with admin address
2. Owner proposes configuration migration
3. Admin executes configuration
4. Test dual-control workflow on testnet first
5. Verify all operations work correctly
6. Deploy to mainnet

---

## v2.0 - WETH-based with Owner Profits (2025-11-25)

### Features
- WETH-based flash loan system
- Owner profit accumulation (configurable percentage)
- Provider commitments stay in user wallets
- Concurrent flash loan support
- Demo borrower contract

### Testing
- ✅ Concurrent loans in same block
- ✅ Provider balance tracking
- ✅ Owner profit accumulation
- ✅ 62+ automated tests

---

## v1.0 - Initial Release (2025-11-24)

### Features
- Basic flash loan functionality
- Provider commitments
- Fee distribution
- ReentrancyGuard protection
- OpenZeppelin dependencies

---

**Last Updated:** 2025-11-26  
**Current Version:** v2.1 (Dual Control + Rescue)  
**Status:** ✅ Production Ready (pending mainnet deployment)

