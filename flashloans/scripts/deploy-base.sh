#!/usr/bin/env bash

set -euo pipefail

NETWORK="base"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FlashBank Base Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Load environment variables
if [ ! -f ".env" ]; then
	echo "❌ Error: .env file not found"
	exit 1
fi

set -a
source .env
set +a

if [ -z "${PRIVATE_KEY:-}" ]; then
	echo "❌ Error: PRIVATE_KEY not set"
	exit 1
fi

if [ -z "${ADMIN_ADDRESS:-}" ]; then
	echo "❌ Error: ADMIN_ADDRESS not set"
	exit 1
fi

echo "Admin address: $ADMIN_ADDRESS"
echo ""

# Deploy router
echo "Deploying FlashBankRouter..."
ROUTER_OUTPUT=$(npx hardhat run scripts/deploy-router.js --network "$NETWORK" 2>&1)
echo "$ROUTER_OUTPUT"

ROUTER_ADDRESS=$(echo "$ROUTER_OUTPUT" | grep "FlashBankRouter deployed to:" | awk '{print $NF}')

if [ -z "$ROUTER_ADDRESS" ]; then
	echo "❌ Failed to extract router address"
	exit 1
fi

echo ""
echo "✅ Router deployed: $ROUTER_ADDRESS"
echo ""

# Verify on Basescan
echo "Verifying router on Basescan..."
npx hardhat verify --network "$NETWORK" "$ROUTER_ADDRESS" "$ADMIN_ADDRESS" || echo "Router verification failed (possibly already verified)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BASE DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Add to website/.env.local:"
echo ""
echo "NEXT_PUBLIC_BASE_ROUTER_ADDRESS=$ROUTER_ADDRESS"
echo "NEXT_PUBLIC_BASE_WETH_ADDRESS=0x4200000000000000000000000000000000000006"
echo ""
echo "View on Basescan:"
echo "https://basescan.org/address/$ROUTER_ADDRESS"
echo ""

