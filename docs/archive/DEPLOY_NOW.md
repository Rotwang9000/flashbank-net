# 🚀 Deploy FlashBank to Ethereum and Base

Everything is configured and ready to deploy!

## ✅ Pre-Deployment Checklist

- [x] ANKR API key configured: `2e8f34fc656bf1d606b8bec1dcb00db2398ed0529bb68fe0fc39f080865397fd`
- [x] ETHERSCAN_API_KEY set (multichain support)
- [x] Contracts compiled successfully
- [x] Website configured to load addresses from .env
- [x] Arbitrum already deployed: `0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095`
- [ ] Deployer wallet has ETH on Ethereum (~0.5 ETH) and Base (~0.01 ETH)
- [ ] Private key set in `.env`

## 🎯 Deployment Commands

### Option 1: Deploy to Base First (Recommended - Cheapest)

```bash
cd /home/rotwang/flashbank-net
npx hardhat run scripts/deploy-multichain.js --network base
```

**After deployment:**
1. Copy the contract address from output
2. Update `.env.local`:
   ```bash
   cd website
   nano .env.local
   # Change: NEXT_PUBLIC_BASE_FLASHBANK_ADDRESS=0xYOUR_NEW_ADDRESS
   ```
3. Verify contract (command will be provided in output)

### Option 2: Deploy to Ethereum Mainnet

```bash
cd /home/rotwang/flashbank-net
npx hardhat run scripts/deploy-multichain.js --network ethereum
```

**After deployment:**
1. Copy the contract address from output
2. Update `.env.local`:
   ```bash
   cd website
   nano .env.local
   # Change: NEXT_PUBLIC_ETHEREUM_FLASHBANK_ADDRESS=0xYOUR_NEW_ADDRESS
   ```
3. Verify contract (command will be provided in output)

## 📝 Quick Update Commands

After each deployment, use this quick command:

**For Ethereum:**
```bash
# Replace 0xYOUR_ADDRESS with the actual deployed address
sed -i 's/NEXT_PUBLIC_ETHEREUM_FLASHBANK_ADDRESS=.*/NEXT_PUBLIC_ETHEREUM_FLASHBANK_ADDRESS=0xYOUR_ADDRESS/' /home/rotwang/flashbank-net/website/.env.local
```

**For Base:**
```bash
# Replace 0xYOUR_ADDRESS with the actual deployed address
sed -i 's/NEXT_PUBLIC_BASE_FLASHBANK_ADDRESS=.*/NEXT_PUBLIC_BASE_FLASHBANK_ADDRESS=0xYOUR_ADDRESS/' /home/rotwang/flashbank-net/website/.env.local
```

## 🔍 Verification

The deployment script will output a verification command like:

```bash
npx hardhat verify --network ethereum 0xYOUR_CONTRACT_ADDRESS "0xYOUR_OWNER_ADDRESS"
```

Since ETHERSCAN_API_KEY is now multichain, it will work for all networks (Ethereum, Arbitrum, Base).

## 🧪 Test After Deployment

1. Start the website locally:
   ```bash
   cd /home/rotwang/flashbank-net/website
   npm run dev
   ```

2. Open http://localhost:3000

3. Connect your wallet

4. Switch to the network you just deployed to

5. Check that:
   - Contract address appears in network statistics
   - Can read pool stats
   - Can interact with functions

## 💰 Cost Estimates

| Network | Deployment Cost | Transaction Speed |
|---------|----------------|-------------------|
| **Base** | 0.001-0.005 ETH | Very Fast |
| **Ethereum** | 0.1-0.3 ETH | Depends on gas |

**Recommendation:** Deploy to Base first to test at low cost, then Ethereum when confident.

## 🎉 After Both Deployments

Update `README.md` with final deployment info:

```markdown
| Network | Status | Address | Explorer |
|---------|--------|---------|----------|
| Arbitrum | ✅ Live | 0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095 | [View](https://arbiscan.io/address/0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095) |
| Ethereum | ✅ Live | 0xYOUR_ETH_ADDRESS | [View](https://etherscan.io/address/0xYOUR_ETH_ADDRESS) |
| Base | ✅ Live | 0xYOUR_BASE_ADDRESS | [View](https://basescan.org/address/0xYOUR_BASE_ADDRESS) |
```

## 🆘 Troubleshooting

**"Insufficient funds"**
- Check wallet balance with: `npx hardhat run scripts/check-balance.js --network <NETWORK>`

**"Network not configured"**
- Ensure ANKR_API_KEY is in `.env`
- Check hardhat.config.js has network defined

**Verification fails**
- Wait 1-2 minutes after deployment
- ETHERSCAN_API_KEY should work for all chains now
- Try manual verification on block explorer

## ✅ Final Checklist

After all deployments:

- [ ] All three networks have deployed contracts
- [ ] All contracts verified on block explorers
- [ ] Website `.env.local` updated with all addresses
- [ ] Website tested on all three networks
- [ ] README.md updated with deployment info
- [ ] DEPLOYMENT.md updated with dates and transactions
- [ ] Security audit page links updated (if needed)

---

**Ready to deploy! Just run the commands above.** 🚀

