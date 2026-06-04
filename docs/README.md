# FlashBank documentation

Reference material for the two FlashBank products — the **flash-loan Router** and the
**peer-to-peer term Loans** escrow — plus the website and operational runbooks.

Start with the [project README](../README.md) for the high-level overview and live addresses.

## Architecture

- [Architecture overview](architecture/ARCHITECTURE.md)
- [Router design (no-deposit model)](architecture/CORRECT_ARCHITECTURE.md)
- [Pool mechanics](architecture/POOL_MECHANICS.md)
- [Flash-loan concept](architecture/FLASH_LOAN_CONCEPT.md)
- [Flash-loan use cases](architecture/FLASH_LOAN_USE_CASES.md)
- [Multi-currency analysis](architecture/MULTI_CURRENCY_ANALYSIS.md)
- [Multi-loan wrapper](architecture/MULTI_LOAN_WRAPPER.md)
- [Gas analysis](architecture/GAS_ANALYSIS.md)

## P2P term lending

- [P2P lending design](design/P2P_LENDING_DESIGN.md)

## Security

- [Security audit](security/SECURITY_AUDIT.md)
- [Security enhancements](security/SECURITY_ENHANCEMENTS.md)
- [Security summary](security/SECURITY_SUMMARY.md)
- [Reentrancy analysis](security/REENTRANCY_ANALYSIS.md)
- [`nonReentrant` explained](security/NONREENTRANT_EXPLAINED.md)
- [Dual-control runbook](security/DUAL_CONTROL.md)
- [Ownership transfer](security/OWNERSHIP_TRANSFER.md)

> The repo-root [SECURITY.md](../SECURITY.md) is the vulnerability-disclosure policy.

## Deployment & operations

- [Deployment guide](deployment/DEPLOYMENT.md)
- [Deployment instructions](deployment/DEPLOYMENT_INSTRUCTIONS.md)
- [Website deployment](deployment/WEBSITE_DEPLOYMENT.md)
- [Live networks](deployment/LIVE_NETWORKS.md)
- [Manual verification guide](deployment/MANUAL_VERIFICATION_GUIDE.md)

## Development

- [Concurrent test guide](development/CONCURRENT_TEST_GUIDE.md)
- [ConnectKit upgrade notes](development/CONNECTKIT_UPGRADE.md)

## Marketing

- [Promotion strategy](marketing/PROMOTION_STRATEGY.md)
- [Marketing content](marketing/MARKETING_CONTENT.md)

## Archive

Historical status snapshots, launch checklists and one-off verification notes are kept in
[`archive/`](archive/) for provenance. They are point-in-time and may be out of date — treat the
documents above and the project README as the source of truth.
