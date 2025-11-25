# FlashBankRouter Ownership Transfer Guide

## Overview

The FlashBankRouter contract is deployed using a deployer key (stored in code) but should be controlled by a more secure admin key (multisig/vault). This guide explains how to transfer ownership after deployment.

## Why Separate Deployer and Admin?

**Deployer Key:**
- Used in deployment scripts
- Stored in code/config files
- Less secure (could be exposed in version control, logs, etc.)
- Only needs to deploy once

**Admin Key:**
- Stored in secure vault (Vultisig, Gnosis Safe, etc.)
- Controls contract configuration
- Manages owner profits
- Long-term security critical

## Contract Functions Controlled by Owner

The `onlyOwner` modifier protects these functions:

### Configuration
- `setTokenConfig()` - Set fees, limits, enable/disable tokens
- Token fee range: 0.01% - 1%
- Owner fee range: 0% - 100% of total fee

### Profit Management
- `withdrawOwnerProfits()` - Withdraw accumulated owner fees
- Profits tracked per token
- Cannot withdraw provider funds (impossible)

### Ownership
- `transferOwnership()` - Transfer to new owner (one-way, irreversible)
- `renounceOwnership()` - Give up ownership (makes contract immutable)

## Ownership Transfer Process

### Step 1: Prepare Multisig/Vault

Create your secure admin wallet:

**Option A: Vultisig Vault**
1. Install Vultisig mobile app
2. Create new vault with multiple devices
3. Note the vault address

**Option B: Gnosis Safe**
1. Visit [https://app.safe.global/](https://app.safe.global/)
2. Create new Safe with 2/3 or 3/5 threshold
3. Note the Safe address

**Option C: Hardware Wallet**
1. Use Ledger/Trezor for maximum security
2. Note the hardware wallet address

### Step 2: Transfer Ownership

Run the transfer script:

```bash
# Sepolia testnet
NEW_OWNER=0xYourMultisigAddress npx hardhat run scripts/transfer-ownership.js --network sepolia

# Ethereum mainnet
NEW_OWNER=0xYourMultisigAddress npx hardhat run scripts/transfer-ownership.js --network mainnet

# Base
NEW_OWNER=0xYourMultisigAddress npx hardhat run scripts/transfer-ownership.js --network base

# Arbitrum
NEW_OWNER=0xYourMultisigAddress npx hardhat run scripts/transfer-ownership.js --network arbitrum
```

The script will:
1. Verify you are the current owner
2. Display a 10-second warning
3. Execute `transferOwnership()`
4. Verify the new owner

### Step 3: Verify Transfer

Check on Etherscan:
1. Go to the FlashBankRouter contract
2. Click "Read Contract"
3. Call `owner()` function
4. Verify it returns your multisig address

### Step 4: Test Admin Functions

From your multisig/vault, test that you can:
1. Read `getOwnerProfits()` (should work)
2. Call `setTokenConfig()` if needed (requires multisig approval)
3. Verify deployer key can NO LONGER call these functions

## What Happens After Transfer

### ✅ New Owner CAN:
- Configure tokens (fees, limits, enable/disable)
- Withdraw accumulated owner profits
- Transfer ownership again
- Renounce ownership (make immutable)

### ❌ New Owner CANNOT:
- Withdraw provider funds (no such function exists)
- Change fee limits beyond hardcoded bounds (0.01% - 1%)
- Steal funds in any way

### ❌ Old Deployer CAN NO LONGER:
- Modify any contract settings
- Withdraw any profits
- Regain ownership
- Affect provider funds

## Emergency: Renouncing Ownership

If you want to make the contract fully immutable:

```javascript
await router.renounceOwnership();
```

**WARNING**: This is irreversible! After renouncing:
- No one can change fees or configuration
- Owner profits become locked forever
- Contract is permanently frozen in current state
- Only use for fully decentralized, set-and-forget deployments

## Security Checklist

Before deploying to mainnet:

- [ ] Deploy contract from deployer key
- [ ] Verify contract on Etherscan
- [ ] Test all functions (commit, flash loan, etc.)
- [ ] Create secure multisig/vault for admin
- [ ] Transfer ownership to multisig/vault
- [ ] Verify ownership on Etherscan
- [ ] Test admin functions from multisig
- [ ] Verify deployer can no longer call owner functions
- [ ] Document multisig signers and threshold
- [ ] Store deployment addresses securely

## Multisig Best Practices

### Signer Management
- Use 3-5 signers for good decentralization
- Require 2/3 or 3/5 threshold
- Choose trusted, independent signers
- Keep signer keys on separate devices
- Use hardware wallets when possible

### Operational Security
- Document all admin operations
- Require explanation for each transaction
- Use private RPC to prevent front-running
- Monitor for unusual activity
- Have emergency response plan

### Regular Reviews
- Check owner profit accumulation monthly
- Review fee settings quarterly
- Audit multisig signer list annually
- Test emergency procedures

## Example: Complete Deployment Flow

```bash
# 1. Deploy contracts
NETWORK=mainnet ./scripts/deploy-sepolia.sh

# 2. Verify deployment
npx hardhat verify --network mainnet 0xRouterAddress arg1 arg2

# 3. Create multisig on Gnosis Safe
# Visit app.safe.global and create 3/5 multisig

# 4. Transfer ownership
NEW_OWNER=0xGnosisSafeAddress npx hardhat run scripts/transfer-ownership.js --network mainnet

# 5. Verify on Etherscan
# Visit contract, Read Contract, call owner() -> should show Safe address

# 6. Test from Safe
# Create transaction to withdrawOwnerProfits() -> sign with 3/5 -> execute

# 7. Document
# Record Safe address, signers, deployment date in docs
```

## FAQs

**Q: Can I transfer ownership back to the deployer?**  
A: Yes, the new owner can transfer to any address, including the original deployer.

**Q: What if I lose access to the multisig?**  
A: If you lose threshold number of signers, ownership is permanently lost. Choose signers carefully!

**Q: Can providers still withdraw if ownership is lost?**  
A: YES! Provider funds stay in their own wallets. Ownership doesn't affect provider operations.

**Q: Should I renounce ownership?**  
A: Only if you want a fully immutable, decentralized protocol. Most projects keep ownership for emergency controls.

**Q: How do I withdraw owner profits from a multisig?**  
A: Create a transaction in the multisig UI, call `withdrawOwnerProfits(token, recipient)`, get required signatures, execute.

## Support

For questions or issues with ownership transfer:
- GitHub Issues: https://github.com/flashbank-net/flashbank/issues
- Security: security@flashbank.net
- Discord: https://discord.gg/flashbank

---

**Last Updated**: 2025-11-25  
**Contract Version**: FlashBankRouter v2.0  
**Auditor**: Internal Security Review

