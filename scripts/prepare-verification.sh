#!/bin/bash
# FlashBank Contract Verification Helper
# Prepares all information needed for manual verification

echo "╔════════════════════════════════════════════════════════╗"
echo "║     FlashBank Contract Verification Helper            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Generate flattened contract
echo "📄 Generating flattened contract..."
npx hardhat flatten contracts/FlashBankRevolutionary.sol > /tmp/FlashBankRevolutionary-flat.sol 2>/dev/null
LINES=$(wc -l < /tmp/FlashBankRevolutionary-flat.sol)
echo "✅ Flattened contract ready: /tmp/FlashBankRevolutionary-flat.sol ($LINES lines)"
echo ""

# Display verification info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 VERIFICATION INFORMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔗 VERIFICATION URLS:"
echo "   Ethereum: https://etherscan.io/verifyContract"
echo "   Base:     https://basescan.org/verifyContract"
echo ""

echo "📍 CONTRACT ADDRESSES:"
echo "   Ethereum: 0xBDcC71d5F73962d017756A04919FBba9d30F0795"
echo "   Base:     0xBDcC71d5F73962d017756A04919FBba9d30F0795"
echo ""

echo "⚙️  COMPILER SETTINGS:"
echo "   Compiler Type:    Solidity (Single file)"
echo "   Compiler Version: v0.8.19+commit.7dd6d404"
echo "   License:          MIT"
echo "   Contract Name:    FlashBankRevolutionary"
echo ""

echo "🔧 OPTIMISATION SETTINGS:"
echo "   Enabled:     Yes"
echo "   Runs:        200"
echo "   Via-IR:      Yes ⚠️  MUST BE CHECKED!"
echo ""

echo "📝 CONSTRUCTOR ARGUMENTS (ABI-encoded):"
echo "   0000000000000000000000003cd6bbf16599af7fde6f4b7c8b6fd6bea4edc191"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 CONTRACT SOURCE CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To view the flattened contract:"
echo "   cat /tmp/FlashBankRevolutionary-flat.sol"
echo ""
echo "To copy to clipboard (if xclip installed):"
echo "   cat /tmp/FlashBankRevolutionary-flat.sol | xclip -selection clipboard"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to verification URL (Etherscan or Basescan)"
echo "2. Enter contract address"
echo "3. Select compiler settings (v0.8.19, MIT license)"
echo "4. Enable optimisation: 200 runs"
echo "5. ⚠️  CHECK Via-IR box (very important!)"
echo "6. Paste entire contract from /tmp/FlashBankRevolutionary-flat.sol"
echo "7. Add constructor arguments (no 0x prefix)"
echo "8. Click 'Verify and Publish'"
echo ""

echo "📚 Full guide: MANUAL_VERIFICATION_GUIDE.md"
echo ""
echo "✨ Ready to verify! Good luck! ✨"

