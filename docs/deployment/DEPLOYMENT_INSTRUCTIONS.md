# Multi-Chain Deployment Instructions

This guide walks you through deploying FlashBankRevolutionary to Ethereum, Arbitrum, and Base networks.

## Prerequisites

1. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your private key to `.env`:
     ```
     PRIVATE_KEY=your_private_key_here
     ```
   - Add your ANKR API key (already configured):
     ```
     ANKR_API_KEY=2e8f34fc656bf1d606b8bec1dcb00db2398ed0529bb68fe0fc39f080865397fd
     ```
   - Add block explorer API keys for verification:
     ```
     ETHERSCAN_API_KEY=your_etherscan_api_key
     ARBISCAN_API_KEY=your_arbiscan_api_key
     BASESCAN_API_KEY=your_basescan_api_key
     ```

2. **Wallet Balance**
   - Ensure deployer wallet has sufficient ETH on each network:
     - **Ethereum**: ~0.5 ETH (for gas)
     - **Arbitrum**: ~0.01 ETH (cheaper gas)
     - **Base**: ~0.01 ETH (cheaper gas)

## Deployment Steps

### 1. Compile Contracts

```bash
npm install
npx hardhat compile
```

Verify compilation succeeds without errors.

### 2. Deploy to Arbitrum (Already Deployed)

Arbitrum is already live at: `0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095`

If you need to deploy a new instance:

```bash
npx hardhat run scripts/deploy-multichain.js --network arbitrum
```

### 3. Deploy to Ethereum Mainnet

**⚠️ WARNING: This will cost real ETH on mainnet!**

```bash
npx hardhat run scripts/deploy-multichain.js --network ethereum
```

**Important Notes:**
- Ethereum gas can be expensive (50-200 gwei)
- Monitor gas prices: https://etherscan.io/gastracker
- Consider deploying during low-traffic times (weekends/nights UTC)
- Estimated cost: 0.1-0.3 ETH depending on gas prices

### 4. Deploy to Base

```bash
npx hardhat run scripts/deploy-multichain.js --network base
```

**Important Notes:**
- Base has very low gas fees (typically 0.001-0.01 gwei)
- Much cheaper than Ethereum mainnet
- Estimated cost: 0.001-0.005 ETH

## After Deployment

### 1. Verify Contracts on Block Explorers

The deployment script will output verification commands. Run them:

**Ethereum:**
```bash
npx hardhat verify --network ethereum <CONTRACT_ADDRESS> "<OWNER_ADDRESS>"
```

**Arbitrum:**
```bash
npx hardhat verify --network arbitrum <CONTRACT_ADDRESS> "<OWNER_ADDRESS>"
```

**Base:**
```bash
npx hardhat verify --network base <CONTRACT_ADDRESS> "<OWNER_ADDRESS>"
```

### 2. Update Website Configuration

Edit `/website/src/pages/index.tsx` and update the `CHAIN_CONFIGS` object with deployed addresses:

```typescript
const CHAIN_CONFIGS = {
	[arbitrum.id]: {
		name: 'Arbitrum',
		flashbankAddress: '0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095', // Already deployed
		rpcUrl: 'https://rpc.ankr.com/arbitrum/2e8f34fc656bf1d606b8bec1dcb00db2398ed0529bb68fe0fc39f080865397fd',
		explorerUrl: 'https://arbiscan.io',
		color: 'blue',
		icon: '🔷'
	},
	[mainnet.id]: {
		name: 'Ethereum',
		flashbankAddress: 'YOUR_ETHEREUM_CONTRACT_ADDRESS', // Update this
		rpcUrl: 'https://rpc.ankr.com/eth/2e8f34fc656bf1d606b8bec1dcb00db2398ed0529bb68fe0fc39f080865397fd',
		explorerUrl: 'https://etherscan.io',
		color: 'purple',
		icon: '🔶'
	},
	[base.id]: {
		name: 'Base',
		flashbankAddress: 'YOUR_BASE_CONTRACT_ADDRESS', // Update this
		rpcUrl: 'https://rpc.ankr.com/base/2e8f34fc656bf1d606b8bec1dcb00db2398ed0529bb68fe0fc39f080865397fd',
		explorerUrl: 'https://basescan.org',
		color: 'red',
		icon: '🔴'
	}
};
```

### 3. Test Contract Interactions

Test basic functions on each network:

```javascript
// Connect to deployed contract
const FlashBankRevolutionary = await ethers.getContractAt(
	"FlashBankRevolutionary",
	"CONTRACT_ADDRESS"
);

// Check security info
const securityInfo = await FlashBankRevolutionary.getSecurityInfo();
console.log("Is Upgradeable:", securityInfo.isUpgradeable); // Should be false

// Check pool stats
const poolStats = await FlashBankRevolutionary.getPoolStats();
console.log("Total Committed:", ethers.formatEther(poolStats.totalCommitted));
```

### 4. Update Documentation

Update the following files with new contract addresses:

- `README.md` - Update deployment section
- `DEPLOYMENT.md` - Add new deployment details
- `website/src/pages/security-audit.tsx` - Update contract links

## Security Checklist

After deployment, verify:

- ✅ Contract is verified on block explorer
- ✅ `IS_UPGRADEABLE` returns `false`
- ✅ `MAX_FEE_RATE` is 1000 (10%)
- ✅ `ABSOLUTE_MAX_FLASH_LOAN` is 10000 ETH
- ✅ Owner address is correct
- ✅ Contract has no proxy patterns
- ✅ Source code matches GitHub repository

## Troubleshooting

### "Insufficient funds" Error
- Check wallet balance on the target network
- Ensure you have enough ETH for gas

### "nonce too low" Error
- Wait a few seconds and retry
- Or reset MetaMask account (Settings → Advanced → Reset Account)

### "Contract already deployed" Warning
- This is normal if re-running the script
- Use the previously deployed address instead

### Verification Fails
- Ensure constructor arguments match exactly
- Wait 1-2 minutes after deployment before verifying
- Check that API keys are correct in `.env`

## Gas Cost Estimates

| Network | Deployment Cost | Typical Flash Loan Gas |
|---------|----------------|------------------------|
| Ethereum | 0.1-0.3 ETH | 300,000-500,000 gas |
| Arbitrum | 0.001-0.01 ETH | 1,000,000-2,000,000 gas |
| Base | 0.001-0.005 ETH | 300,000-500,000 gas |

## Next Steps

After successful deployment:

1. Test contract functions via Etherscan/Arbiscan/Basescan
2. Update website with new addresses
3. Test website interactions on all chains
4. Monitor for any issues
5. Update README with final addresses
6. Announce deployment to community

## Support

For issues or questions:
- GitHub: https://github.com/flashbank-net/flashbank/issues
- Security: security@flashbank.net
- Discord: discord.gg/flashbank

