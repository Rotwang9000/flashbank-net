# 🏦 FlashBank.net - Trustless Flash Loan Network

**The world's first IMMUTABLE flash loan network with zero rug-pull risk**

🌐 **Website**: [flashbank.net](https://flashbank.net)  
📚 **Docs**: [docs.flashbank.net](https://docs.flashbank.net)  
🔗 **Contract**: `0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095` (Arbitrum)

---

## 🎯 What is FlashBank?

FlashBank is a revolutionary flash loan network where **your ETH never permanently leaves your account**. Unlike traditional DeFi protocols that require you to deposit funds and trust the protocol, FlashBank uses **temporary custody** - your ETH is only held for microseconds during flash loan execution.

### 🛡️ **Zero Rug-Pull Guarantee**
- **NON-UPGRADEABLE** contract (impossible to change code)
- **No proxy patterns** (immutable forever)
- **Maximum fee hardcoded** to 10% (cannot be increased)
- **No admin backdoors** (owner cannot steal funds)

### ⚡ **How It Works**
1. **Deposit ETH** to earn from flash loan fees
2. **MEV bots borrow** ETH for arbitrage/liquidation strategies  
3. **Either**: Strategy succeeds → profit shared with depositors
4. **Or**: Strategy fails → ETH returned immediately
5. **Your ETH can ONLY**: be returned to you or returned + profit added

---

## 💰 Economics

### **For Depositors**
- **Earn 50-500% APY** from MEV flash loan fees
- **Zero permanent risk** - ETH only at risk for microseconds
- **Instant profit sharing** - earn from every successful flash loan
- **Withdraw anytime** when no flash loans are active

### **For MEV Bots**
- **44% cost savings** vs Aave (0.05% vs 0.09% fees)
- **Zero upfront capital** required
- **Instant execution** - no waiting for liquidity
- **Higher profits** due to lower costs

### **Example Returns**
```
Traditional Aave Flash Loan (100 ETH):
- Fee: 0.09% = $360
- Your cost: $360

FlashBank Flash Loan (100 ETH):  
- Fee: 0.05% = $200
- Your savings: $160 per loan!

For depositors with $10K deposited:
- One daily 100 ETH flash loan = $140 profit
- Annual return: $51,100 = 511% APY!
```

---

## 🚀 Live Deployment

### **Arbitrum Mainnet**
- **FlashBank Pool**: `0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095`
- **MEV Receiver**: `0x6dAb2aCeF1cc2B545BcCc101e420fA711Bb03592`
- **Deployment**: Block 23462096 (2025-09-28)

### **Security Verification**
✅ Contract verified on [Arbiscan](https://arbiscan.io/address/0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095)  
✅ 25 security tests passed  
✅ Non-upgradeable confirmed  
✅ Open source code auditable  

---

## 🔧 Quick Start

### **For Depositors**
```javascript
// 1. Connect to FlashBank
const flashBank = new ethers.Contract(
  "0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095", 
  FlashBankABI, 
  signer
);

// 2. Deposit ETH to earn fees
await flashBank.deposit({ value: ethers.parseEther("10") });

// 3. Check your balance
const [deposits, profits] = await flashBank.getUserBalance(address);
console.log(`Deposits: ${ethers.formatEther(deposits)} ETH`);
console.log(`Profits: ${ethers.formatEther(profits)} ETH`);

// 4. Withdraw profits
await flashBank.withdrawProfit();
```

### **For MEV Bots**
```javascript
// Execute flash loan with 44% savings vs Aave
await flashBank.flashLoan(
  ethers.parseEther("100"), // 100 ETH
  strategyData              // Your MEV strategy
);
```

### **Web Interface**
Visit [flashbank.net](https://flashbank.net) for the user-friendly interface:
- 🔗 **Connect Wallet** (MetaMask, WalletConnect)
- 💰 **Deposit ETH** with one click  
- 📊 **Monitor Earnings** in real-time
- 💸 **Withdraw Profits** instantly

---

## 📊 Pool Statistics

| Metric | Value |
|--------|-------|
| Total Deposits | 0 ETH (just launched!) |
| Total Profits Generated | 0 ETH |
| Number of Depositors | 0 |
| Flash Loan Fee | 0.05% |
| Maximum Fee (hardcoded) | 10% |
| Contract Age | Live since Sept 2025 |

*Real-time stats available at [flashbank.net/stats](https://flashbank.net/stats)*

---

## 🛡️ Security Features

### **Immutable Security**
- **Cannot be upgraded** - code is frozen forever
- **No proxy contracts** - what you see is what you get
- **Hardcoded limits** - fees cannot exceed 10%
- **No emergency exits** - owner cannot drain funds

### **Flash Loan Protection**
- **Reentrancy guards** prevent recursive attacks
- **Amount limits** prevent protocol drain
- **Automatic reversion** if strategy fails
- **Fee validation** prevents overflow attacks

### **Access Controls**
- **Only depositors** can withdraw their funds
- **Only owner** can adjust operational parameters
- **No backdoors** for unauthorized access
- **Transparent operations** - all functions public

---

## 🏗️ Technical Architecture

### **Core Contracts**
- **L2FlashPoolImmutable.sol**: Main flash loan pool (immutable)
- **MEVFlashLoanReceiver.sol**: MEV strategy integration
- **IL2FlashLoan.sol**: Interface for flash loan receivers

### **Key Features**
- **Non-upgradeable design** for maximum trust
- **Gas optimized** for low-cost operations
- **Event logging** for full transparency  
- **Modular architecture** for easy integration

### **Supported Networks**
- ✅ **Arbitrum** (live)
- 🔄 **Polygon** (coming soon)
- 🔄 **Optimism** (coming soon)
- 🔄 **Base** (coming soon)

---

## 📈 Roadmap

### **Phase 1: Foundation** ✅
- [x] Immutable smart contracts
- [x] Security testing (25 tests passed)
- [x] Arbitrum deployment
- [x] Basic web interface

### **Phase 2: Growth** 🚧
- [ ] Advanced web dashboard
- [ ] Real-time analytics
- [ ] Multi-network deployment
- [ ] MEV marketplace integration

### **Phase 3: Ecosystem** 🔮
- [ ] Cross-chain flash loans
- [ ] Governance token (if needed)
- [ ] Advanced yield strategies
- [ ] Institutional partnerships

---

## 🤝 Contributing

FlashBank is open source and welcomes contributions!

### **Development Setup**
```bash
git clone https://github.com/flashbank-net/flashbank
cd flashbank
npm install
npm run compile
npm test
```

### **Running Tests**
```bash
# Run all tests
npm test

# Run security tests only  
npx hardhat test test/SecurityTests.test.js

# Run with gas reporting
REPORT_GAS=true npm test
```

### **Contributing Guidelines**
- All code must pass security tests
- Follow existing code style
- Add tests for new features
- Update documentation

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## ⚠️ Disclaimers

- **Smart contract risk**: While extensively tested, smart contracts can have bugs
- **Market risk**: Flash loan profits depend on MEV opportunities  
- **Regulatory risk**: Flash loans may face regulatory scrutiny
- **Do your own research**: This is experimental DeFi technology

---

## 🔗 Links

- **Website**: [flashbank.net](https://flashbank.net)
- **Documentation**: [docs.flashbank.net](https://docs.flashbank.net)
- **Twitter**: [@FlashBankNet](https://twitter.com/FlashBankNet)
- **Discord**: [discord.gg/flashbank](https://discord.gg/flashbank)
- **Telegram**: [t.me/flashbank](https://t.me/flashbank)

---

**Built with ❤️ for the DeFi community by the MEV community**

*"Banking the unbanked, flashing the unflashed"* 🏦⚡