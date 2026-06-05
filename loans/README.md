# loans — FlashBank P2P term loans

Fixed-term, collateral-backed loans agreed directly between two people. `FlashBankP2PLoan` is a
neutral escrow and timeline keeper: one side posts terms, the other takes them, and the contract
holds the funds and watches the clock.

This directory is a **self-contained Hardhat project**. It shares nothing with
[`../flashloans`](../flashloans); it only inherits the toolchain in [`../common`](../common). Delete
`../flashloans` and this still works.

## Core intents (the things that make it different)

- **Time-only settlement.** Repay `principal + a flat fee` before `maturity + grace`, or the lender
  claims the collateral. Nothing is priced on-chain, so **no oracle is needed** and there is no
  liquidation bot to watch.
- **Flat fee, not interest.** A single fixed fee, not time-accruing interest — friendlier to
  faith-based finance that avoids *riba* (not a certification claim).
- **Genuinely P2P.** No pools, no shared liquidity, no protocol-set rates. Go direct on the contract
  and it is zero commission; three optional, default-off fees exist only when you opt in (interface
  fee, featured-placement boost, third-party service fee).

How these intents relate to the external **Lorrow** standard (and where we deliberately differ) is
written up in [../docs/design/LORROW_COMPATIBILITY.md](../docs/design/LORROW_COMPATIBILITY.md).

## Layout

```
contracts/
  FlashBankP2PLoan.sol     The escrow: create / take / repay / claimDefault / cancel
  PlaygroundToken.sol      Free faucet ERC-20 for the testnet playground (also used by the tests)
  test/ReentrantToken.sol  Malicious token used to prove the reentrancy guards
test/                      Hardhat suite (lifecycle, time-based default, fees + boost, fuzz)
scripts/
  deploy-p2p-loan.js       Deploy the escrow
  deploy-playground.js     Deploy/seed the Sepolia playground (reuses deployments/sepolia-playground.json)
deployments/               Recorded playground addresses per network
hardhat.config.js          Inherits ../common/hardhat.base.js, sources ./contracts
```

## Develop

```bash
# from the repository root once:
npm install

# then, from this directory:
npx hardhat test            # full P2P suite (32 tests incl. a fund-conservation fuzz test)
npx hardhat compile
npx hardhat run scripts/deploy-playground.js --network sepolia
```

Set `PRIVATE_KEY`, RPC URLs and `ETHERSCAN_API_KEY` in the repository-root `.env`.

## Tokens

On mainnet / L2 the escrow uses real ERC-20s (WETH, USDC, …). On the testnet playground,
`PlaygroundToken` mints `fpETH` / `fpUSD` for free via `faucet()` — they have no value.

Full design: [../docs/design/P2P_LENDING_DESIGN.md](../docs/design/P2P_LENDING_DESIGN.md).
