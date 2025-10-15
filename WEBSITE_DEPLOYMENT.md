# Website Deployment Guide

## 🚀 FlashBank Website Deployment

The FlashBank website is now ready for deployment to GitHub Pages with full revolutionary features!

## 📋 Deployment Options

### Option 1: GitHub Pages (Recommended)

**Automatic Deployment:**
- Website automatically deploys when you push to `main` branch
- Configured via GitHub Actions workflow
- Live at: `https://yourusername.github.io/flashbank-net`

**Manual Deployment:**
```bash
cd website
npm run deploy
```

### Option 2: Custom Domain
- Point your domain to GitHub Pages
- Update `CNAME` file in website directory
- Configure DNS settings

## 🧪 Local Testing

### Development Server
```bash
# Start local development server
npm run website:dev

# Open http://localhost:3000
```

### Production Preview
```bash
# Build and preview production version
npm run website:preview

# Open http://localhost:3000
```

## 🔧 Configuration

### Environment Variables (for production)
Create `.env.local` in website directory:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5c0156da501BC97DD35017Fb20624B7f1Ce7E095
NEXT_PUBLIC_CHAIN_ID=42161
NEXT_PUBLIC_RPC_URL=https://arb1.arbitrum.io/rpc
```

### GitHub Pages Setup

1. **Enable GitHub Pages** in repository settings
2. **Set source** to "GitHub Actions"
3. **Configure branch** to `main`

## 📁 File Structure

```
flashbank-net/
├── website/
│   ├── .github/workflows/
│   │   └── deploy-website.yml    # GitHub Actions workflow
│   ├── next.config.js            # Next.js configuration
│   ├── package.json              # Dependencies and scripts
│   ├── src/
│   │   └── pages/
│   │       └── index.tsx         # Main website component
│   └── out/                      # Production build output
├── .github/workflows/
│   └── deploy-website.yml        # GitHub Actions workflow
└── README.md                     # Updated with deployment info
```

## 🎯 Revolutionary Features in Website

### ✅ Implemented Features
- **🏦 Commitment Management**: Approve contract to use your ETH
- **📊 Real-time Statistics**: Live pool data and user balances
- **⏸️ Pause/Resume**: Full control over participation
- **💰 Profit Withdrawal**: Claim earnings from flash loan fees
- **🔄 Automatic Updates**: Real-time data synchronization
- **📱 Responsive Design**: Works on mobile and desktop

### 🎨 User Experience
- **Modern UI** with Tailwind CSS and animations
- **Web3 Integration** with RainbowKit wallet connections
- **Clear Explanations** of revolutionary mechanics
- **Error Handling** with user-friendly toast notifications
- **Loading States** for all transactions

## 🚀 Deployment Checklist

### Pre-Deployment
- [x] Website builds successfully (`npm run website:build`)
- [x] All TypeScript errors resolved
- [x] Web3 integration tested
- [x] Revolutionary features implemented
- [x] GitHub Actions workflow configured
- [x] Documentation updated

### Post-Deployment
- [ ] Enable GitHub Pages in repository settings
- [ ] Test live website functionality
- [ ] Verify wallet connections work
- [ ] Check mobile responsiveness
- [ ] Validate contract interactions

## 🔗 Live URLs

### Development
- Local: `http://localhost:3000`

### Production
- GitHub Pages: `https://yourusername.github.io/flashbank-net`
- Custom Domain: `https://flashbank.net` (when configured)

## 🛠️ Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
cd website
rm -rf node_modules package-lock.json
npm install
npm run build
```

**GitHub Pages Not Deploying:**
- Check GitHub Actions tab for errors
- Verify workflow file syntax
- Ensure repository settings allow GitHub Actions

**Wallet Connection Issues:**
- Verify contract address is correct
- Check network configuration (Arbitrum)
- Test with different wallet providers

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Verify build locally first
3. Test wallet connections
4. Check browser console for errors

---

**🎉 FlashBank website is production-ready and configured for automatic GitHub Pages deployment!**

**Ready to showcase the revolutionary just-in-time flash loan system to the world! 🚀**
