# Dual-Control Security Architecture

## Overview

FlashBankRouter implements a **dual-signature** security model where critical operations require approval from TWO independent parties:

1. **Owner (Deployer)** - Proposes changes
2. **Admin (Vault/Multisig)** - Approves and executes changes

This prevents a single compromised key from modifying the protocol.

## Architecture

### Roles

**Owner (Deployer Key)**
- Stored in deployment code/server
- Proposes configuration changes
- Proposes profit withdrawals
- Cannot execute without admin approval

**Admin (Vultisig Vault)**
- Stored in secure vault (Vultisig, Gnosis Safe, etc.)
- Approves and executes proposed changes
- Cannot propose changes
- Independent from deployer

### Protected Operations

#### 1. Token Configuration
Requires both signatures to change:
- Fee percentage (0.01% - 1%)
- Max borrow limit
- Owner fee percentage
- Enable/disable token

**Flow:**
```
1. Owner proposes: proposeTokenConfig(token, config)
2. Admin executes: executeTokenConfig(token, config)
```

#### 2. Profit Withdrawals
Requires both signatures to withdraw owner profits:
- Withdrawal amount
- Recipient address

**Flow:**
```
1. Owner proposes: proposeProfitWithdrawal(token, recipient, amount)
2. Admin executes: executeProfitWithdrawal(token, recipient, amount)
```

#### 3. Ownership Transfer
```
1. Owner proposes: proposeOwnershipTransfer(newOwner)
2. Admin executes: executeOwnershipTransfer(newOwner)
```

> `transferOwnership()` and `renounceOwnership()` are locked behind this workflow. Direct calls revert to prevent unilateral takeovers.

#### 4. Asset Rescue (ERC-20 + ETH)
```
1. Owner proposes: proposeRescueToken(token, to, amount) OR proposeRescueETH(to, amount)
2. Admin executes: executeRescueToken(token, to, amount) OR executeRescueETH(to, amount)
```

> This ensures “rescue” operations cannot siphon provider funds without dual approval.

### Emergency Single-Signature Functions

For initial setup and emergencies, these functions allow single signature:

- `setTokenConfig()` - Can be called by owner OR admin
- `withdrawOwnerProfits()` - Can be called by owner OR admin

**Use Cases:**
- Initial token configuration during deployment
- Emergency fee adjustments
- Emergency profit collection

**Security Note:** For production use, always use the dual-signature flow (propose → execute).

## Usage Examples

### Configuration Change

**Step 1: Owner proposes (from deployer)**
```bash
ACTION=propose FEE_BPS=3 MAX_BORROW_BPS=6000 \
  npx hardhat run scripts/dual-control-config.js --network mainnet
```

**Step 2: Admin executes (from vault)**
```bash
ACTION=execute FEE_BPS=3 MAX_BORROW_BPS=6000 \
  PRIVATE_KEY=$ADMIN_VAULT_KEY \
  npx hardhat run scripts/dual-control-config.js --network mainnet
```

### Profit Withdrawal

**Step 1: Owner proposes**
```bash
ACTION=propose AMOUNT=0.5 RECIPIENT=0xTreasuryAddress \
  npx hardhat run scripts/dual-control-withdraw.js --network mainnet
```

**Step 2: Admin executes**
```bash
ACTION=execute AMOUNT=0.5 RECIPIENT=0xTreasuryAddress \
  PRIVATE_KEY=$ADMIN_VAULT_KEY \
  npx hardhat run scripts/dual-control-withdraw.js --network mainnet
```

### Using Etherscan (TSS-Friendly Flow)

Vultisig never exposes a private key, so the CLI is optional. To approve changes purely from the browser:

1. **Owner proposes**
   - Open the router contract on Etherscan → *Contract* tab → *Write Contract*
   - Connect the deployer wallet (hardware wallet / browser extension)
   - Call `proposeTokenConfig` or `proposeProfitWithdrawal` with the desired parameters
2. **Admin executes**
   - Open the same contract on Etherscan from the Vultisig wallet
   - Call `executeTokenConfig` or `executeProfitWithdrawal` using the exact same parameters
   - Vultisig coordinates the multi-device signature internally
3. **Verify**
   - Check the emitted `ChangeExecuted` event or call `tokenConfigs()` / `getOwnerProfits()` to confirm

> Tip: copy the change hash emitted in `ChangeProposed`. Admins can compare it before executing to be 100% sure the payload matches.

### Testnet Automation (CI / Local Testing)

Set the following environment variables to let CLI scripts auto-run both steps on supported testnets (Sepolia, Base/Arbitrum Sepolia, etc.):

```bash
echo "TESTNET_ADMIN_ADDRESS=0x3CD6BbF16599Af7FDe6F4b7C8b6FD6Bea4EDc191" >> .env
echo "TESTNET_ADMIN_PRIVATE_KEY=0xabc123..." >> .env   # throwaway key for testnets only
```

When `ACTION=execute` and the chainId matches a supported testnet, the dual-control scripts automatically instantiate a signer from `TESTNET_ADMIN_PRIVATE_KEY`. This keeps production admin keys inside Vultisig while still allowing automated tests/CI to exercise the full dual-control flow.

## Security Benefits

### 1. Key Compromise Mitigation
- If deployer key is compromised: Attacker cannot execute changes
- If admin key is compromised: Attacker cannot propose changes
- Both keys must be compromised simultaneously

### 2. Operational Security
- Deployer key can stay in automated systems
- Admin key stays in cold storage / vault
- Two-person approval for critical operations

### 3. Audit Trail
All proposals and executions emit events:
- `ChangeProposed(bytes32 changeHash, address proposer)`
- `ChangeExecuted(bytes32 changeHash, address executor)`

### 4. Change Hash Verification
- Each proposal creates a unique hash
- Admin must execute with EXACT same parameters
- Prevents parameter tampering

## Admin Key Setup

### Recommended: Vultisig Vault

**Advantages:**
- Multi-device threshold signatures
- Mobile-first security
- No single point of failure
- Easy to use

**Setup:**
1. Install Vultisig on multiple devices (2-3)
2. Create new vault with 2-of-3 threshold
3. Note vault address: `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7`
4. Set in `.env`: `ADMIN_ADDRESS=0xC021a233A427627aE1BB5765e925Ab6E0c4319e7`

### Alternative: Gnosis Safe

**Advantages:**
- Battle-tested multisig
- Web interface
- Transaction simulation
- Large ecosystem

**Setup:**
1. Visit https://app.safe.global/
2. Create 2/3 or 3/5 Safe
3. Set signers (trusted parties)
4. Note Safe address
5. Set in `.env`: `ADMIN_ADDRESS=0xYourSafeAddress`

### Alternative: Hardware Wallet

**Advantages:**
- Maximum security for single signer
- Air-gapped
- No software vulnerabilities

**Setup:**
1. Use Ledger or Trezor
2. Note hardware wallet address
3. Set in `.env`: `ADMIN_ADDRESS=0xYourHardwareWallet`

## Deployment Flow

```bash
# 1. Set admin addresses in .env
echo "ADMIN_ADDRESS=0xC021a233A427627aE1BB5765e925Ab6E0c4319e7" >> .env
echo "TESTNET_ADMIN_ADDRESS=0x3CD6BbF16599Af7FDe6F4b7C8b6FD6Bea4EDc191" >> .env
echo "TESTNET_ADMIN_PRIVATE_KEY=0xabc123..." >> .env   # optional, only for testnets

# 2. Deploy router (script auto-selects ADMIN vs TESTNET admin)
NETWORK=sepolia ./scripts/deploy-sepolia.sh

# 3. Verify admin on Etherscan
# Call router.admin() -> should return admin address
# Call router.owner() -> should return deployer address

# 4. Test proposal flow (testnet)
ACTION=propose FEE_BPS=2 npx hardhat run scripts/dual-control-config.js --network sepolia

# 5. Test execution flow (testnet)
ACTION=execute FEE_BPS=2 PRIVATE_KEY=$ADMIN_KEY npx hardhat run scripts/dual-control-config.js --network sepolia

# 6. Deploy to mainnet (uses ADMIN_ADDRESS by default)
NETWORK=mainnet ./scripts/deploy-sepolia.sh
```

## Changing Admin

To change the admin address (requires owner):

```javascript
await router.setAdmin(newAdminAddress);
```

**Security Warning:** Only change admin to a verified, secure address!

## Monitoring

### Check Pending Changes

```javascript
const changeHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(...));
const isPending = await router.pendingChanges(changeHash);
```

### Monitor Events

Listen for these events:
- `ChangeProposed` - Owner proposed a change
- `ChangeExecuted` - Admin executed a change
- `AdminUpdated` - Admin address changed

### View Current State

```javascript
const owner = await router.owner();
const admin = await router.admin();
const config = await router.tokenConfigs(wethAddress);
const profits = await router.getOwnerProfits(wethAddress);
```

## Security Checklist

Before mainnet:
- [ ] Admin address set correctly in `.env`
- [ ] Admin key secured in vault/multisig
- [ ] Deployer key separate from admin key
- [ ] Test proposal flow on testnet
- [ ] Test execution flow on testnet
- [ ] Verify change hash matching
- [ ] Document admin signers (if multisig)
- [ ] Set up event monitoring
- [ ] Create operational runbook
- [ ] Test emergency single-signature flow

## FAQs

**Q: Can owner execute without admin?**  
A: No, for dual-signature functions. Owner can only propose, admin must execute.

**Q: Can admin propose and execute?**  
A: No, admin can only execute proposals made by owner. This prevents admin from acting alone.

**Q: What if admin loses keys?**  
A: Owner can call `setAdmin(newAdminAddress)` to set a new admin.

**Q: What if owner loses keys?**  
A: Admin cannot change owner. Contract becomes immutable unless ownership transfer was previously initiated.

**Q: Are provider funds affected?**  
A: NO. Provider funds stay in their wallets. Dual control only affects configuration and owner profits.

**Q: Can we use 3+ signatures?**  
A: Yes! Set admin to a multisig (Gnosis Safe) with 3/5 or higher threshold.

**Q: Performance impact?**  
A: None. Dual signature only affects admin operations, not flash loans.

## Support

Questions? Issues?
- GitHub: https://github.com/flashbank-net/flashbank/issues
- Security: security@flashbank.net

---

**Last Updated**: 2025-11-26  
**Contract Version**: FlashBankRouter v2.1.1 (Dual Control + Ownership/Rescue)  
**Admin Address**: `0xC021a233A427627aE1BB5765e925Ab6E0c4319e7`

