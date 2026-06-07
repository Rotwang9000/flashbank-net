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
- **Optional surplus return (no oracle).** Each offer can carry an optional **agreed rate** (stored as
  `settlementValue` — how much principal the whole collateral is taken to be worth), agreed and frozen at
  origination. Set it and a defaulting borrower forfeits only the collateral covering `principal + fee`,
  getting the surplus back; leave it `0` for a pure pledge/forfeit. See
  [Lorrow compatibility](../docs/design/LORROW_COMPATIBILITY.md).
- **Editable offers, no front-running.** While an offer is still open the creator can amend its non-escrow
  terms in place (`updateOffer`: agreed rate, flat fee, timing, service fee) and top up featured placement
  (`boostOffer`) without losing their existing boost. Each edit bumps a `version`; takers can use
  `takeChecked(id, version)` to pin the terms they reviewed so a last-second re-price can't be slipped in.
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
  FlashBankP2PLoan.sol     The escrow: create / take / takeChecked / repay / claimDefault / cancel
                           + amend an open offer (updateOffer / boostOffer)
  PlaygroundToken.sol      Free faucet ERC-20 for the testnet playground (also used by the tests)
  test/ReentrantToken.sol  Malicious token used to prove the reentrancy guards
test/                      Hardhat suite (lifecycle, time-based default, fees + boost, offer amendments, fuzz)
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
npx hardhat test            # full P2P suite (45 tests incl. a fund-conservation fuzz test)
npx hardhat compile
npx hardhat run scripts/deploy-playground.js --network sepolia
```

Set `PRIVATE_KEY`, RPC URLs and `ETHERSCAN_API_KEY` in the repository-root `.env`.

## Tokens

On mainnet / L2 the escrow uses real ERC-20s (WETH, USDC, …). On the testnet playground,
`PlaygroundToken` mints `fpETH` / `fpUSD` for free via `faucet()` — they have no value.

Full design: [../docs/design/P2P_LENDING_DESIGN.md](../docs/design/P2P_LENDING_DESIGN.md).
