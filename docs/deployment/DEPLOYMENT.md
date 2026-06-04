# Deployment Guide

This guide explains how to deploy FlashBank.net contracts to Arbitrum mainnet and testnet networks.

## ⚠️ Security Warning

**NEVER commit private keys or sensitive data to version control!**

Use environment variables and `.env` files (which are gitignored) for all sensitive configuration.

## 📋 Prerequisites

### Required Software
- Node.js v18+ (v21.7.3+ works with warnings)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Required Accounts & Keys
1. **Ethereum Wallet** with private key (for deployment)
2. **Arbiscan API Key** (for contract verification)
3. **Alchemy/Infura** API key (optional, for custom RPC)
4. **ETH on Arbitrum** for gas fees (~0.01 ETH minimum)

## 🔧 Environment Setup

### 1. Clone and Install
```bash
git clone https://github.com/flashbank-net/flashbank
cd flashbank
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit `.env` with your configuration:
```bash
# ============ RPC ENDPOINTS ============
ARBITRUM_HTTP_URL=https://arb1.arbitrum.io/rpc
# Or use Alchemy/Infura:
# ARBITRUM_HTTP_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY

# ============ PRIVATE KEYS ============
# Your wallet private key (KEEP SECRET!)
PRIVATE_KEY=0x1234567890abcdef...

# ============ API KEYS ============
ARBISCAN_API_KEY=YOUR_ARBISCAN_API_KEY
COINMARKETCAP_API_KEY=YOUR_CMC_KEY_FOR_GAS_REPORTING

# ============ FLASH LOAN CONFIG ============
FLASH_LOAN_FEE_RATE=5        # 0.05% (5 basis points)
MIN_FLASH_LOAN_AMOUNT=0.1    # 0.1 ETH minimum
MAX_FLASH_LOAN_AMOUNT=1000   # 1000 ETH maximum (adjustable later)
```

### 3. Security Check
```bash
# Verify .env is in .gitignore
cat .gitignore | grep .env

# Test configuration (without exposing keys)
npm run compile
```

## 🧪 Testnet Deployment

### Deploy to Arbitrum Goerli
```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to testnet
npx hardhat run scripts/deploy-immutable.js --network arbitrumGoerli

# Verify contracts on testnet
npx hardhat verify --network arbitrumGoerli DEPLOYED_CONTRACT_ADDRESS "CONSTRUCTOR_ARG1" "CONSTRUCTOR_ARG2"
```

### Test Deployment
```bash
# Test basic functionality
npx hardhat run scripts/test-deployment.js --network arbitrumGoerli

# Run integration tests
npm run test:integration
```

## 🚀 Mainnet Deployment

### Pre-Deployment Checklist
- [ ] All tests pass (`npm test`)
- [ ] Security review completed
- [ ] Gas costs estimated and acceptable
- [ ] Backup wallet private key securely
- [ ] Sufficient ETH for deployment (~0.01-0.05 ETH)
- [ ] Arbiscan API key configured for verification

### 1. Final Testing
```bash
# Run complete test suite
npm test

# Run security tests specifically
npx hardhat test test/SecurityTests.test.js

# Check gas costs
REPORT_GAS=true npm test
```

### 2. Deploy to Mainnet
```bash
# Deploy immutable contracts
npx hardhat run scripts/deploy-immutable.js --network arbitrum

# SAVE THE OUTPUT! You'll need the contract addresses
```

Expected output:
```bash
🎉 IMMUTABLE Deployment complete!
📋 DEPLOYMENT SUMMARY:
🔒 L2FlashPoolImmutable: 0x1234...
🤖 MEVFlashLoanReceiver: 0x5678...
👤 Owner: 0xabcd...
💸 Flash loan fee: 0.05%
```

### 3. Verify Contracts
```bash
# Verify main contract
npx hardhat verify --network arbitrum 0x1234... "OWNER_ADDRESS" 5

# Verify MEV receiver
npx hardhat verify --network arbitrum 0x5678... "FLASH_POOL_ADDRESS" "0x0000000000000000000000000000000000000000" "10000000000000000"
```

### 4. Test Deployment
```bash
# Basic functionality test
npx hardhat run scripts/test-mainnet-deployment.js --network arbitrum

# Check contract on Arbiscan
# https://arbiscan.io/address/YOUR_CONTRACT_ADDRESS
```

## 🌐 Website Deployment

### 1. Update Contract Address
Edit `website/src/pages/index.tsx`:
```typescript
const FLASHBANK_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 2. Build Website
```bash
cd website
npm install
npm run build
```

### 3. Deploy to Hosting
Choose your hosting platform:

#### Option A: Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir out
```

#### Option C: GitHub Pages
```bash
# Build static export
npm run build

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d out
```

## 📊 Post-Deployment Tasks

### 1. Document Deployment
Create deployment record:
```bash
# Create deployment record
echo "Deployment $(date):" >> DEPLOYMENT_LOG.md
echo "  - L2FlashPoolImmutable: 0x1234..." >> DEPLOYMENT_LOG.md
echo "  - MEVFlashLoanReceiver: 0x5678..." >> DEPLOYMENT_LOG.md
echo "  - Network: Arbitrum Mainnet" >> DEPLOYMENT_LOG.md
echo "  - Block: $(cast block-number --rpc-url $ARBITRUM_HTTP_URL)" >> DEPLOYMENT_LOG.md
```

### 2. Update Documentation
- [ ] Update README.md with contract addresses
- [ ] Update website with live contract address
- [ ] Create announcement for community
- [ ] Update social media profiles

### 3. Security Verification
```bash
# Verify immutability
npx hardhat run scripts/verify-immutability.js --network arbitrum

# Check security info
npx hardhat run scripts/security-check.js --network arbitrum
```

### 4. Initial Deposits
```bash
# Make initial deposit to show working system
npx hardhat run scripts/initial-deposit.js --network arbitrum
```

## 🔍 Troubleshooting

### Common Issues

#### "Insufficient funds for intrinsic transaction cost"
- Solution: Add more ETH to your deployment wallet

#### "Contract verification failed"
- Solution: Check constructor arguments match exactly
- Use `--constructor-args arguments.js` for complex args

#### "Transaction underpriced"
- Solution: Increase gas price in hardhat.config.js
- Or set `gasPrice: ethers.utils.parseUnits('10', 'gwei')`

#### "Nonce too high"
- Solution: Reset account nonce or wait for pending transactions

### Gas Optimization
```bash
# Check contract sizes
npx hardhat size-contracts

# Optimize if needed
# Contracts must be under 24KB for deployment
```

### Debugging Transactions
```bash
# Check transaction status
npx hardhat run scripts/check-tx.js --network arbitrum TRANSACTION_HASH

# Get detailed logs
npx hardhat verify --network arbitrum --show-stack-traces
```

## 📋 Deployment Scripts

### Available Scripts
```bash
# Deploy immutable contracts
npm run deploy:arbitrum

# Deploy to testnet
npm run deploy:testnet

# Verify contracts
npm run verify

# Test deployment
npm run test:deployment

# Check contract sizes
npm run size
```

### Custom Deployment
Create custom deployment script:
```javascript
// scripts/deploy-custom.js
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // Custom deployment logic here
    const L2FlashPoolImmutable = await ethers.getContractFactory("L2FlashPoolImmutable");
    const flashPool = await L2FlashPoolImmutable.deploy(
        deployer.address,  // owner
        5                  // fee rate (0.05%)
    );
    
    console.log("FlashPool deployed to:", flashPool.address);
}

main().catch(console.error);
```

## 🔒 Security Reminders

### Before Deployment
- [ ] Never commit `.env` files
- [ ] Use hardware wallet for large deployments
- [ ] Test thoroughly on testnets first
- [ ] Have deployment process reviewed
- [ ] Backup all important addresses and keys

### After Deployment
- [ ] Verify contracts on block explorer
- [ ] Test with small amounts first
- [ ] Monitor for any issues
- [ ] Document everything
- [ ] Announce to community

## 📞 Support

If you encounter issues during deployment:

1. **Check Documentation**: Review this guide and README
2. **Search Issues**: Check GitHub issues for solutions
3. **Community Help**: Ask on Discord or Telegram
4. **Contact Team**: Email team@flashbank.net for critical issues

---

## ⚠️ Legal Disclaimers

- **No Liability**: Deployers assume all risks
- **Due Diligence**: Verify all code before deployment
- **Regulatory Compliance**: Ensure compliance with local laws
- **Financial Risk**: Never deploy with funds you can't afford to lose

---

**Deploy responsibly and help make FlashBank.net the most secure flash loan protocol! 🚀**
