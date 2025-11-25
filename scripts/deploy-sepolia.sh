#!/usr/bin/env bash

set -euo pipefail

NETWORK_RAW="${1:-sepolia}"
NETWORK="$(echo "$NETWORK_RAW" | tr '[:upper:]' '[:lower:]')"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load root .env for secrets such as ETHERSCAN_API_KEY / RPC URLs
if [ -f "$ROOT_DIR/.env" ]; then
	set -a
	# shellcheck disable=SC1091
	source "$ROOT_DIR/.env"
	set +a
fi

ENV_FILE="$ROOT_DIR/website/.env.local"
if [ ! -f "$ENV_FILE" ]; then
	echo "Creating $ENV_FILE"
	touch "$ENV_FILE"
fi

declare -A WETH_ADDRESSES=(
	[sepolia]="0xdd13E55209Fd76AfE204dBda4007C227904f0a81"
	[base]="0x4200000000000000000000000000000000000006"
	[arbitrum]="0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
	[ethereum]="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
)

WETH_ADDRESS="${FLASHBANK_LIQUIDITY_TOKEN:-${WETH_ADDRESSES[$NETWORK]:-}}"
if [ -z "$WETH_ADDRESS" ]; then
	echo "No WETH address configured for network '$NETWORK'. Set FLASHBANK_LIQUIDITY_TOKEN or update the map."
	exit 1
fi

upsert_env() {
	local key="$1"
	local value="$2"
	if grep -q "^$key=" "$ENV_FILE"; then
		sed -i.bak "s|^$key=.*|$key=$value|" "$ENV_FILE"
	else
		echo "$key=$value" >>"$ENV_FILE"
	fi
}

NETWORK_ENV_PREFIX="$(echo "$NETWORK" | tr '[:lower:]' '[:upper:]')"

echo ">>> Deploying FlashBankRouter on $NETWORK"
ROUTER_LOG=$(FLASHBANK_LIQUIDITY_TOKEN="$WETH_ADDRESS" npx hardhat run scripts/deploy-router.js --network "$NETWORK")
echo "$ROUTER_LOG"
ROUTER_ADDRESS=$(echo "$ROUTER_LOG" | awk '/FlashBankRouter deployed to:/ {print $NF}' | tail -n1)

if [ -z "$ROUTER_ADDRESS" ]; then
	echo "Failed to parse router address"
	exit 1
fi

echo ">>> Deploying Demo borrower + counter"
DEMO_LOG=$(FLASHBANK_ROUTER_ADDRESS="$ROUTER_ADDRESS" FLASHBANK_LIQUIDITY_TOKEN="$WETH_ADDRESS" npx hardhat run scripts/deploy-demo-borrower.js --network "$NETWORK")
echo "$DEMO_LOG"
DEMO_ADDRESS=$(echo "$DEMO_LOG" | awk '/DemoFlashBorrower deployed at:/ {print $NF}' | tail -n1)
PROOF_SINK_ADDRESS=$(echo "$DEMO_LOG" | awk '/ProofOfFunds deployed at:/ {print $NF}' | tail -n1)
DEMO_COUNTER_ADDRESS=$(echo "$DEMO_LOG" | awk '/DemoCounter deployed at:/ {print $NF}' | tail -n1)

if [ -z "$DEMO_ADDRESS" ] || [ -z "$PROOF_SINK_ADDRESS" ] || [ -z "$DEMO_COUNTER_ADDRESS" ]; then
	echo "Failed to parse demo deployment addresses"
	exit 1
fi

echo ">>> Updating website/.env.local"
upsert_env "NEXT_PUBLIC_${NETWORK_ENV_PREFIX}_ROUTER_ADDRESS" "$ROUTER_ADDRESS"
upsert_env "NEXT_PUBLIC_${NETWORK_ENV_PREFIX}_WETH_ADDRESS" "$WETH_ADDRESS"
upsert_env "NEXT_PUBLIC_${NETWORK_ENV_PREFIX}_DEMO_BORROWER_ADDRESS" "$DEMO_ADDRESS"
upsert_env "NEXT_PUBLIC_${NETWORK_ENV_PREFIX}_PROOF_SINK_ADDRESS" "$PROOF_SINK_ADDRESS"
upsert_env "NEXT_PUBLIC_${NETWORK_ENV_PREFIX}_DEMO_COUNTER_ADDRESS" "$DEMO_COUNTER_ADDRESS"

if [ -n "${ETHERSCAN_API_KEY:-}" ]; then
	echo ">>> Verifying contracts on Etherscan"
	npx hardhat verify --network "$NETWORK" "$ROUTER_ADDRESS" || echo "Router verification failed (possibly already verified)"
	npx hardhat verify --network "$NETWORK" "$PROOF_SINK_ADDRESS" || echo "ProofOfFunds verification failed"
	npx hardhat verify --network "$NETWORK" "$DEMO_COUNTER_ADDRESS" || echo "DemoCounter verification failed"
npx hardhat verify --network "$NETWORK" "$DEMO_ADDRESS" "$ROUTER_ADDRESS" "$WETH_ADDRESS" "$PROOF_SINK_ADDRESS" "$DEMO_COUNTER_ADDRESS" || echo "DemoFlashBorrower verification failed"
else
	echo "Skipping Etherscan verification (ETHERSCAN_API_KEY not set)"
fi

echo ">>> Building website"
pushd website >/dev/null
npm install
npm run build
popd >/dev/null

echo "All done! Router: $ROUTER_ADDRESS, Demo: $DEMO_ADDRESS"

