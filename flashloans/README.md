# flashloans — FlashBank flash-loan router

Atomic, same-transaction liquidity for arbitrage, liquidations and MEV. Liquidity providers keep
custody of their WETH (no deposits); the router pulls it for the microseconds of a flash loan and
returns it plus a fee in the same transaction, or the whole call reverts.

This directory is a **self-contained Hardhat project**. It shares nothing with [`../loans`](../loans);
it only inherits the toolchain in [`../common`](../common). Delete `../loans` and this still works.

## Layout

```
contracts/
  FlashBankRouter.sol          The router (no-deposit, multi-provider, dual-control admin)
  IL2FlashLoan.sol             Borrower callback interface
  DemoFlashBorrower.sol        Example borrower used by the demo + tests
  DemoCounter.sol              Trivial target to prove arbitrary calls run inside a loan
  ProofOfFunds.sol             Helper asserting the borrower actually received funds
  MEVFlashLoanReceiver.sol     Reference MEV receiver
  interfaces/IWETH.sol         WETH wrap/unwrap interface
  mocks/MockWETH.sol           Test WETH (deposit/withdraw/mint)
  test/                        Solidity test helpers (mock receivers, malicious reentrancy mock)
  L2FlashPool*.sol,            Legacy deposit-based pool design, kept for historical context
  FlashBankRevolutionary.sol     (superseded by the no-deposit router)
test/                          Hardhat suites (router, legacy pool, security)
scripts/                       Deployment, verification and operational scripts
test-scripts/                  Manual dual-control integration tests against a live deployment
hardhat.config.js              Inherits ../common/hardhat.base.js, sources ./contracts
```

## Develop

```bash
# from the repository root once:
npm install

# then, from this directory:
npx hardhat test            # router + legacy + security suites
npx hardhat compile
npx hardhat run scripts/deploy-router.js --network sepolia
```

Set `PRIVATE_KEY`, RPC URLs, `ETHERSCAN_API_KEY` and `ADMIN_ADDRESS` / `TESTNET_ADMIN_ADDRESS` in the
repository-root `.env` (loaded automatically by the shared config).

## How it works

- **No deposits.** Providers `approve` the router and call `setCommitment(token, limit, expiry, paused)`.
- **Atomic or nothing.** Borrowers implement `IL2FlashLoan` and repay `principal + fee` in the same tx.
- **Bounded fees.** Per-token `feeBps` (1–100 bps), a separate `ownerFeeBps`, and a `maxBorrowBps` cap.
- **Dual control.** Token config, ownership and profit withdrawal use a propose-then-execute split
  between `owner` and `admin` — see [../docs/security/DUAL_CONTROL.md](../docs/security/DUAL_CONTROL.md).

More: [../docs/architecture/ARCHITECTURE.md](../docs/architecture/ARCHITECTURE.md).
