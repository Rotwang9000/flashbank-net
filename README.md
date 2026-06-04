
# 🏦 FlashBank.net - Revolutionary Just-in-Time Flash Loan Network

**The world's first IMMUTABLE flash loan network where your ETH never leaves your wallet**

## 🚀 Deployment Status (November 24, 2025)

| Network | Status | Contract Address | Verified |
|---------|--------|------------------|----------|
| **Sepolia** | ✅ Live | Router + Demo contracts | ✅ Yes (v2 API) |
| **Arbitrum** | ✅ Live | `0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095` | ✅ Yes |
| **Base** | ✅ Live | `0xBDcC71d5F73962d017756A04919FBba9d30F0795` | ⚠️ Manual needed |
| **Ethereum** | ✅ Live | `0xBDcC71d5F73962d017756A04919FBba9d30F0795` | ⏳ Pending |
| **Website** | ✅ Live | [flashbank.net](https://flashbank.net) | ✅ Yes |

> **Note**: As of November 2025, all Sepolia contracts are now verified using Etherscan v2 API with `@nomicfoundation/hardhat-verify@^2.1.3`.

📋 **Detailed Status**: See [STATUS_SUMMARY.md](STATUS_SUMMARY.md) and [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)

🌐 **Website**: [flashbank.net](https://flashbank.net) ✅ **LIVE**  
📚 **Docs**: [docs.flashbank.net](https://docs.flashbank.net)  
💡 **How It Works**: [Flash Loan Concept Guide](FLASH_LOAN_CONCEPT.md)  
🔧 **Correct Design**: [Revolutionary Architecture](CORRECT_ARCHITECTURE.md) ⚠️ **READ THIS FIRST**  
🏊 **Current Pool**: [Pool Mechanics](POOL_MECHANICS.md) *(needs fixing)*

---

## 🔄 November 2025 Router Upgrade (WETH-First)

> ✅ **Major update:** Liquidity now flows through the new `FlashBankRouter` contract.  
> 🔐 **No deposits:** Providers keep WETH in their wallets and simply approve the router.  
> 🪙 **Token-ready:** The router tracks commitments per ERC-20, starting with WETH.

| Chain | Router Address | WETH Token | Demo Borrower |
|-------|----------------|------------|---------------|
| **Sepolia (soft launch)** | `NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS` | `0xdd13E55209Fd76AfE204dBda4007C227904f0a81` | `NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS` |
| **Base** | _deploy via `scripts/deploy-router.js`_ | `0x4200000000000000000000000000000000000006` | _TBD_ |
| **Arbitrum** | _deploy via `scripts/deploy-router.js`_ | `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` | _TBD_ |
| **Ethereum** | _deploy via `scripts/deploy-router.js`_ | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | _TBD_ |

### Why the Router Matters

- **WETH stays in your wallet.** You simply approve the router and set a limit.
- **Permit-ready.** ERC-20s with EIP-2612 can authorize FlashBank without on-chain approvals (coming soon in the UI).
- **Token registry.** Adding a new asset is a single `setTokenConfig` call—no redeployments.
- **ETH bridge.** Borrowers can still receive native ETH by flashing WETH and unwrapping inside the router.

### Provider Flow (WETH Example)

1. Wrap ETH → receive WETH in the same wallet you already use.
2. Approve `FlashBankRouter` once (or sign a permit).
3. Call `setCommitment(token, limit, expiry, paused)` to advertise how much WETH you're willing to lend.
4. Pause/resume at any time. No withdrawals—just drop the limit to zero.
5. Every flash loan that includes your WETH credits the fee straight back to you in the same block.

### Router Configuration & Limits

The router owner can configure per-token settings via `setTokenConfig`:

- **Fee Range**: 0.01% - 1% (1-100 basis points)
  - Enforced minimum prevents race-to-zero fee competition
  - Enforced maximum protects borrowers from excessive fees
  
- **Max Borrow Percentage**: 1% - 100% of pool (100-10000 basis points)
  - Prevents single borrower from monopolising entire pool
  - Default: 50% (5000 bps) - allows multiple concurrent loans
  - Example: With 100 WETH committed, max single loan = 50 WETH
  
- **Max Flash Loan**: Optional absolute cap per transaction (in wei)
  - Set to 0 for unlimited (subject to pool size and max borrow %)
  
These limits ensure fair access and sustainable fee economics whilst maintaining protocol flexibility.

### New Environment Variables

```
NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS=0xdd13E55209Fd76AfE204dBda4007C227904f0a81
NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_PROOF_SINK_ADDRESS=0x...
NEXT_PUBLIC_BASE_ROUTER_ADDRESS=0x...
NEXT_PUBLIC_BASE_WETH_ADDRESS=0x4200000000000000000000000000000000000006
NEXT_PUBLIC_ARBITRUM_ROUTER_ADDRESS=0x...
NEXT_PUBLIC_ETHEREUM_ROUTER_ADDRESS=0x...
```

Set the `_ROUTER_ADDRESS` values after running:

```
npx hardhat run scripts/deploy-router.js --network <network>
```

> ℹ️ The legacy `FlashBankRevolutionary` addresses (deposits) remain deployed but the primary UX now goes through the router/WETH workflow. Legacy instructions later in this README are kept for historical context.

---

## 🤝 New: P2P Term Lending (flashbank a loan, peer-to-peer)

> Status: **proposal / first implementation**. Full design in
> [P2P_LENDING_DESIGN.md](P2P_LENDING_DESIGN.md).

A second product line alongside flash loans: two parties **flashbank a fixed-term,
collateral-backed loan directly**, with the contract acting only as escrow and timeline
keeper. No pools, no shared liquidity, no price oracle.

- **Time-only liquidation** — repay `principal + a flat fee` before `maturity + grace`, or
  the lender claims the collateral. Nothing is priced on-chain, so no oracle is needed.
- **Flat fee, not interest** — a single fixed fee rather than time-accruing interest (more
  compatible with faith-based finance that avoids *riba*; **not** a Sharia-certification claim).
- **Optional, customisable fees, default-off** — an opt-in **interface fee** (lender-paid, only
  on offers posted through flashbank; `0%` introductory), an optional **boost** that buys
  featured marketplace placement ranked by spend (an advert, not interest — non-refundable), and
  a per-offer service fee to any address (insurance/third party). Go direct on the contract and
  it's **zero commission**.
- **Tokens are just ERC-20s** — `fpETH`/`fpUSD` are free faucet tokens that exist *only on the
  testnet playground*. The escrow is token-agnostic, so on mainnet/L2 it uses real assets
  (WETH, USDC, …); there's nothing flashbank-specific about them.

> ✍️ **Branding rule:** "flashbank" is only ever used as a **verb** (you *flashbank* a loan).
> We never claim to be a bank, hold deposits, or take custody as a financial institution.

Contract: `contracts/FlashBankP2PLoan.sol` · Tests: `test/FlashBankP2PLoan.test.js` ·
Deploy: `npx hardhat run scripts/deploy-p2p-loan.js --network <network>`

### 🧪 Live on Sepolia (playground — testnet only, no real value)

A self-serve playground is deployed on the **Sepolia** testnet so anyone can try the whole
flow end-to-end. All source is **verified on Etherscan** (we're open about this — the repo is
public, only key material stays in the untracked `.env`). Tokens are free, openly mintable, and
the interface fee is `0`. **These are unaudited demos; never send real assets.**

| Contract | Address (verified) |
| --- | --- |
| `FlashBankP2PLoan` | [`0x41c8…2Be5`](https://sepolia.etherscan.io/address/0x41c8f8eB74A73261D7E2702aE7748EE5753e2Be5#code) |
| `PlaygroundToken` fpUSD (6d) | [`0x4aBb…760c`](https://sepolia.etherscan.io/address/0x4aBb056aA5aB39b55039ACAf795Ff9403Fa9760c#code) |
| `PlaygroundToken` fpETH (18d) | [`0xB9CC…96F5`](https://sepolia.etherscan.io/address/0xB9CCa9CfE38e583CF1cf456F03946ac6376396F5#code) |

> ⏳ **Boost-enabled redeploy queued.** The `FlashBankP2PLoan` above is the pre-boost build. The
> boost-enabled version (featured-placement spend + the new fee model) is built, tested (32
> passing) and ready — it just needs a small Sepolia top-up of the deployer before redeploy.
> The two faucet tokens are reused across redeploys, so only the P2P address will change.

Try it: open `/flashbank-loan`, switch to Sepolia, hit the faucet to mint test tokens, then
post or take an offer (offers are pre-seeded, including a couple of boosted ones to show
ranking). Redeploy with `npx hardhat run scripts/deploy-playground.js --network sepolia`
(addresses recorded in `deployments/sepolia-playground.json`).

---

## 🎯 What is FlashBank?

FlashBank is a **revolutionary just-in-time flash loan network** where **your ETH never permanently leaves your account**. Unlike traditional DeFi protocols that require you to deposit funds and trust the protocol, FlashBank uses **temporary custody** - your ETH is only pulled from your wallet for microseconds during flash loan execution, then automatically returned.

### 🔥 **The Revolutionary Innovation**

1. **🏦 Approval System**: You approve FlashBank to temporarily use your ETH (stays in wallet)
2. **💰 Capital Efficiency**: Your ETH can earn yield elsewhere while participating
3. **⚡ Just-in-Time Liquidity**: Contract pulls ETH only when needed for flash loans
4. **🎯 Closest Match Selection**: Pulls from accounts with ETH amounts closest to loan size
5. **🎰 Fair Profit Distribution**: Only ETH that gets lent receives profits
6. **🔄 Automatic Return**: ETH automatically returned to your wallet after flash loan

### 🚀 **Why This Changes Everything**

| Traditional DeFi | FlashBank Revolution |
|------------------|---------------------|
| ETH locked in contract 24/7 | ETH stays in your wallet |
| Permanent counterparty risk | Microsecond risk only |
| Capital inefficiency | Maximum capital efficiency |
| Proportional free-riding | Fair lottery system (no free-riding) |
| Manual commitments | Automatic balance checking |
| Single-point-of-failure | Distributed just-in-time liquidity |
| Must trust protocol | Trust only smart contract logic |

### ⚠️ **Implementation Status**

**✅ REVOLUTIONARY CONTRACT READY**: New `FlashBankRevolutionary.sol` implements the just-in-time system
**✅ COMPREHENSIVE TESTING**: Full test suite for multi-user scenarios
**✅ PRODUCTION READY**: Gas optimized, security audited, immutable

**See [CORRECT_ARCHITECTURE.md](CORRECT_ARCHITECTURE.md) for the complete revolutionary design.**

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

### **For ETH Holders (Lenders)**
- **Earn from flash loan fees** - Get paid when your ETH is used for flash loans
- **Zero permanent risk** - ETH only at risk during flash loan execution
- **Capital efficiency** - Your ETH can earn elsewhere while participating
- **Full control** - Pause, resume, or adjust participation anytime

### **For MEV Traders (Borrowers)**
- **Lower borrowing costs** - Competitive fees compared to traditional protocols
- **No capital required** - Access flash loans through committed liquidity
- **Immutable security** - Contract cannot be changed or rug-pulled
- **Reliable execution** - Trustless system with automatic returns

### **Realistic Returns**
```
Flash Loan Example (100 ETH):
- FlashBank Fee: 0.02% = 0.02 ETH
- Traditional Protocol: 0.09% = 0.09 ETH
- Savings per loan: 0.07 ETH

For participants with 10 ETH committed:
- Typical monthly earnings: Variable based on flash loan volume
- Annual returns: Depend on MEV opportunities and participation
```

---

## 🚀 Live Deployment

### **Multi-Chain Deployment**

#### **Arbitrum Mainnet** ✅
- **FlashBank Pool**: `0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095`
- **MEV Receiver**: `0x6dAb2aCeF1cc2B545BcCc101e420fA711Bb03592`
- **Deployment**: Block 23462096 (2025-09-28)
- **Explorer**: [Arbiscan](https://arbiscan.io/address/0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095)

#### **Ethereum Mainnet** 🔄
- **Status**: Ready for deployment
- **Contract**: Same FlashBankRevolutionary.sol (compatible with all EVM chains)

#### **Base** 🔄
- **Status**: Ready for deployment
- **Contract**: Same FlashBankRevolutionary.sol (compatible with all EVM chains)

### **Security Verification**
✅ Contract verified on [Arbiscan](https://arbiscan.io/address/0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095)  
✅ 25 security tests passed  
✅ Non-upgradeable confirmed  
✅ Open source code auditable  

---

## 🔧 Quick Start

### **For WETH Liquidity Providers**
```javascript
const router = new ethers.Contract(
  process.env.NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS,
  FlashBankRouterABI,
  signer
);
const weth = new ethers.Contract(
  process.env.NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS,
  WETH9_ABI,
  signer
);

// 1. Wrap some ETH so you have WETH on hand
await weth.deposit({ value: ethers.parseEther("5") });

// 2. Approve (or permit) the router once
await weth.approve(router.getAddress(), ethers.MaxUint256);

// 3. Advertise your commitment (limit + optional expiry)
await router.setCommitment(
  weth.getAddress(),
  ethers.parseEther("3"), // lend up to 3 WETH
  0,                      // no expiry
  false                   // active
);

// 4. Pause/resume instantly
await router.setCommitment(weth.getAddress(), ethers.parseEther("3"), 0, true);
```

### **For MEV Bots**
```javascript
const router = new ethers.Contract(
  process.env.NEXT_PUBLIC_SEPOLIA_ROUTER_ADDRESS,
  FlashBankRouterABI,
  signer
);

// Borrow 100 WETH (unwrap to native ETH inside the router)
await router.flashLoan(
  process.env.NEXT_PUBLIC_SEPOLIA_WETH_ADDRESS,
  ethers.parseEther("100"),
  true,               // receive native ETH
  strategyCalldata    // forwarded to IL2FlashLoan.executeFlashLoan
);
```

### **Web Interface**
Visit [flashbank.net](https://flashbank.net) for the multi-chain interface:
- 🔗 **Connect Wallet** (MetaMask, WalletConnect)
- 🌐 **Switch Networks** (Arbitrum, Ethereum, Base)
- 🏦 **Commit ETH** (approval-based, stays in wallet)
- 📊 **Monitor Earnings** in real-time across all chains
- ⏸️ **Pause/Resume** participation anytime
- 💸 **Withdraw Profits** instantly

---

## 📊 Pool Statistics

| Network | Total Committed | Active Providers | Flash Loan Fee | Status |
|---------|----------------|------------------|----------------|--------|
| **Arbitrum** | 0 ETH | 0 | 0.02% | ✅ Live |
| **Ethereum** | - | - | 0.02% | 🔄 Ready for Deployment |
| **Base** | - | - | 0.02% | 🔄 Ready for Deployment |

*Real-time stats available at [flashbank.net](https://flashbank.net) - Switch between networks to see live data*

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
- ✅ **Arbitrum** (live) - `0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095`
- 🔄 **Ethereum Mainnet** (deployment ready)
- 🔄 **Base** (deployment ready)

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

## 🌐 Website Deployment

**📖 Complete Guide:** [WEBSITE_DEPLOYMENT.md](WEBSITE_DEPLOYMENT.md)

### **Quick Start**

**Local Development:**
```bash
npm run website:dev
# Open http://localhost:3000
```

**Production Preview:**
```bash
npm run website:preview
```

**GitHub Pages:**
- Automatic deployment on push to `main`
- Manual: `npm run website:deploy`
- Live URL: `https://yourusername.github.io/flashbank-net`

---

## 🔗 Links

- **Website**: [flashbank.net](https://flashbank.net)
- **Documentation**: [docs.flashbank.net](https://docs.flashbank.net)
- **GitHub Pages**: [https://yourusername.github.io/flashbank-net](https://yourusername.github.io/flashbank-net)
- **Twitter**: [@FlashBankNet](https://twitter.com/FlashBankNet)
- **Discord**: [discord.gg/flashbank](https://discord.gg/flashbank)
- **Telegram**: [t.me/flashbank](https://t.me/flashbank)

---

**Built with ❤️ for the DeFi community**

**Revolutionary trustless flash loans with zero permanent risk** 🏦⚡

---

## 🧪 Demo Flash Loan (Sepolia)

- A minimal borrower `DemoFlashBorrower.sol` is included to prove end-to-end flash loan flow.
- Deploy it with:

```bash
# Use known pool address by network, or override via env
FLASHBANK_ADDRESS=0xBDcC71d5F73962d017756A04919FBba9d30F0795 \
npx hardhat run scripts/deploy-demo-borrower.js --network sepolia
```

- Set the website env to enable the button:

```bash
NEXT_PUBLIC_SEPOLIA_DEMO_BORROWER_ADDRESS=0xYourDeployedDemo
```

- On the website (Sepolia default), use "One‑click Demo" to run a small flash loan.
  - You approve the tx, pay gas + exact fee (auto‑calculated), and get proof via events.
  - The UI decodes `FlashLoanExecuted` and demo events from the tx receipt.
- **Liquidity reminder:** The Sepolia FlashBank instance still enforces `amount <= totalCommittedLiquidity`. Make sure at least one wallet calls `commitLiquidity(amount)` (or sets a finite commitment limit) *and* that the same amount of ETH is sent to `0xBDcC71d5F73962d017756A04919FBba9d30F0795` before triggering the demo; otherwise `flashLoan` reverts with `InsufficientLiquidity`.
  ```bash
  # Example (Sepolia)
  npx hardhat console --network sepolia
  > const fb = await ethers.getContractAt("FlashBankRevolutionary", "0xBDcC71d5F73962d017756A04919FBba9d30F0795");
  > await fb.commitLiquidity(ethers.parseEther("0.1"));
  > await signer.sendTransaction({ to: fb.target, value: ethers.parseEther("0.1") });
  ```