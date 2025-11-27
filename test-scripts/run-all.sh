#!/usr/bin/env bash

set -euo pipefail

NETWORK="${1:-sepolia}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FlashBank Test Suite"
echo "Network: $NETWORK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check prerequisites
if [ ! -f ".env" ]; then
	echo "❌ Error: .env file not found"
	echo "Please create .env with required keys (see test-scripts/README.md)"
	exit 1
fi

if [ ! -f "website/.env.local" ]; then
	echo "❌ Error: website/.env.local not found"
	echo "Please deploy contracts first"
	exit 1
fi

# Load .env to check for required keys
set -a
source .env
set +a

if [ -z "${PRIVATE_KEY:-}" ]; then
	echo "❌ Error: PRIVATE_KEY not set in .env"
	exit 1
fi

if [ -z "${TESTNET_ADMIN_PRIVATE_KEY:-}" ]; then
	echo "❌ Error: TESTNET_ADMIN_PRIVATE_KEY not set in .env"
	exit 1
fi

echo "✅ Prerequisites checked"
echo ""

# Run positive tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 1: Positive Tests (Dual-Control Workflow)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx hardhat run test-scripts/test-dual-control.js --network "$NETWORK" || {
	echo ""
	echo "❌ Positive tests failed!"
	exit 1
}

echo ""
echo "✅ Positive tests passed!"
echo ""

# Run negative tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 2: Negative Tests (Security Restrictions)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx hardhat run test-scripts/test-dual-control-negative.js --network "$NETWORK" || {
	echo ""
	echo "❌ Negative tests failed!"
	exit 1
}

echo ""
echo "✅ Negative tests passed!"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ALL TESTS PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ Dual-control workflow functioning correctly"
echo "  ✅ Owner/admin roles verified"
echo "  ✅ Security restrictions enforced"
echo "  ✅ Attack vectors blocked"
echo "  ✅ TESTNET_ADMIN_PRIVATE_KEY automation working"
echo ""
echo "Contract is ready for production deployment! 🚀"
echo ""

