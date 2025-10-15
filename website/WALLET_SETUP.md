# 🔗 Wallet Setup Guide for FlashBank

## 🚀 Quick Setup

### 1. **WalletConnect Project ID (Required)**

To enable full wallet support, you need a free WalletConnect project ID:

1. Visit: https://cloud.walletconnect.com/
2. Sign up for free account
3. Create new project
4. Copy your Project ID
5. Create `.env.local` file in `/website/` directory:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

### 2. **Supported Wallets**

#### **✅ Currently Working (No Project ID Required):**
- **Browser Extension Wallets** (via injected wallet detection):
  - MetaMask
  - **Keplr** ✨
  - **Vultisig** ✨
  - Brave Wallet
  - Any Ethereum-compatible browser extension

- **Coinbase Wallet** (mobile & extension)

#### **🔄 Available with WalletConnect Project ID:**
- Trust Wallet
- Rainbow Wallet
- Ledger Live
- Any WalletConnect v2 compatible wallet

---

## 🎯 Wallet-Specific Instructions

### **Keplr Wallet**
1. Install Keplr browser extension
2. Add Arbitrum network to Keplr:
   - Network: Arbitrum One
   - Chain ID: 42161
   - RPC: https://arb1.arbitrum.io/rpc
3. Click "Browser Wallets" → Select detected wallet

### **Vultisig Wallet**
1. Install Vultisig browser extension
2. Ensure Arbitrum network is configured
3. Click "Browser Wallets" → Select detected wallet

### **MetaMask Issues**
If MetaMask doesn't respond:
1. Try refreshing the page
2. Restart browser
3. Use alternative wallet from "Browser Wallets" section

---

## 🔧 Development Setup

### **Environment Variables**
Create `/website/.env.local`:

```bash
# Required for WalletConnect integration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Optional: Custom RPC endpoints
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_HARDHAT_RPC_URL=http://localhost:8545

# Contract address
NEXT_PUBLIC_FLASHBANK_CONTRACT_ADDRESS=0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095
```

### **Testing Locally**
```bash
cd website
npm install
npm run dev
```

---

## 🆘 Troubleshooting

### **WebSocket Connection Errors**
- **Error**: `WebSocket connection closed abnormally with code: 3000`
- **Solution**: Add valid WalletConnect Project ID to `.env.local`

### **Wallet Not Detected**
- **Keplr/Vultisig not appearing**: Ensure browser extension is installed and enabled
- **MetaMask issues**: Try "Browser Wallets" → "Injected Wallet" option

### **Connection Fails**
1. Check network (Arbitrum)
2. Ensure wallet has ETH for gas
3. Try different wallet option
4. Refresh page and retry

---

## 🎊 Success!

Once configured, users can:
- ✅ Connect with **Keplr**, **Vultisig**, **MetaMask**, and more
- ✅ Commit ETH liquidity (stays in their wallet!)
- ✅ Earn from flash loan fees
- ✅ Pause/resume participation anytime
- ✅ Withdraw profits when ready

**FlashBank: Revolutionary trustless flash loans with zero permanent risk! 🚀**
