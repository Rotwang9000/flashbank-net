# common

Shared code used by more than one flashbank feature. This directory is **not** a feature
you can delete — both [`flashloans/`](../flashloans) and [`loans/`](../loans) depend on it.

## What lives here

| File | Purpose |
| --- | --- |
| `hardhat.base.js` | The single source of truth for compiler, network, Etherscan and gas-reporter settings. Each feature's `hardhat.config.js` spreads this base and overrides only its own `paths`. |

## Why a shared base config

The two features are independent Hardhat projects so that a fork can keep one and delete
the other. Without a shared base, the network list, Solidity version and verification
settings would drift between them. `hardhat.base.js` keeps that configuration defined
once and inherited everywhere; adding a chain or bumping the compiler is a one-line change.

The base config always loads the repository-root `.env`, regardless of which feature
directory invoked Hardhat, so RPC URLs and keys are configured in one place.
