#!/usr/bin/env bash

set -euo pipefail

NETWORK="arbitrum"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FlashBank Arbitrum Deployment"
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

# Verify on Arbiscan
echo "Verifying router on Arbiscan..."
npx hardhat verify --network "$NETWORK" "$ROUTER_ADDRESS" "$ADMIN_ADDRESS" || echo "Router verification failed (possibly already verified)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ARBITRUM DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Add to website/.env.local:"
echo ""
echo "NEXT_PUBLIC_ARBITRUM_ROUTER_ADDRESS=$ROUTER_ADDRESS"
echo "NEXT_PUBLIC_ARBITRUM_WETH_ADDRESS=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
echo ""
echo "View on Arbiscan:"
echo "https://arbiscan.io/address/$ROUTER_ADDRESS"
echo ""

