# How to Update Contract Addresses After Deployment

Contract addresses are now stored in environment variables for easy management.

## After Deploying to Ethereum

1. Copy the contract address from the deployment output
2. Update `/home/rotwang/flashbank-net/website/.env.local`:
   ```bash
   NEXT_PUBLIC_ETHEREUM_FLASHBANK_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS
   ```
3. Restart the Next.js dev server (if running):
   ```bash
   cd /home/rotwang/flashbank-net/website
   npm run dev
   ```

## After Deploying to Base

1. Copy the contract address from the deployment output
2. Update `/home/rotwang/flashbank-net/website/.env.local`:
   ```bash
   NEXT_PUBLIC_BASE_FLASHBANK_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS
   ```
3. Restart the Next.js dev server (if running):
   ```bash
   cd /home/rotwang/flashbank-net/website
   npm run dev
   ```

## Quick Command to Update

After deployment, you can use this command to append the address:

```bash
# For Ethereum:
echo "NEXT_PUBLIC_ETHEREUM_FLASHBANK_ADDRESS=0xYOUR_ADDRESS" >> /home/rotwang/flashbank-net/website/.env.local

# For Base:
echo "NEXT_PUBLIC_BASE_FLASHBANK_ADDRESS=0xYOUR_ADDRESS" >> /home/rotwang/flashbank-net/website/.env.local
```

Or edit manually:
```bash
nano /home/rotwang/flashbank-net/website/.env.local
```

## Current Configuration

The website now loads contract addresses from environment variables:

```typescript
const CHAIN_CONFIGS = {
  [arbitrum.id]: {
    flashbankAddress: process.env.NEXT_PUBLIC_ARBITRUM_FLASHBANK_ADDRESS || '0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095',
    // ...
  },
  [mainnet.id]: {
    flashbankAddress: process.env.NEXT_PUBLIC_ETHEREUM_FLASHBANK_ADDRESS || '0x0000000000000000000000000000000000000000',
    // ...
  },
  [base.id]: {
    flashbankAddress: process.env.NEXT_PUBLIC_BASE_FLASHBANK_ADDRESS || '0x0000000000000000000000000000000000000000',
    // ...
  }
};
```

## Fallback Behaviour

If environment variables are not set, the website will use:
- **Arbitrum**: `0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095` (already deployed)
- **Ethereum**: `0x0000000000000000000000000000000000000000` (placeholder)
- **Base**: `0x0000000000000000000000000000000000000000` (placeholder)

## Verification

After updating, test on the website by:
1. Connecting your wallet
2. Switching to the network you deployed to
3. Checking that the contract address appears correctly in the network statistics section
4. Testing a simple read function (like viewing pool stats)

## Production Deployment

When deploying to production (Vercel, etc.), add these environment variables to your hosting platform's environment settings.

