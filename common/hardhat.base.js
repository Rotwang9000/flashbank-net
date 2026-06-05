// Shared Hardhat configuration for every flashbank feature (flashloans, loans, ...).
//
// Each feature keeps its own thin `hardhat.config.js` that spreads this base and only
// overrides `paths` (so its own contracts/tests/artifacts stay self-contained). Keeping
// the networks, compiler, verification and reporting settings in one place means a fix
// or a new chain is added once and inherited everywhere.
//
// This file lives in `common/` on purpose: deleting a single feature directory never
// touches it, but deleting `common/` is understood to break every feature that relies
// on the shared toolchain.

const path = require("path");

// Always load the repository-root .env, whichever feature directory invoked Hardhat.
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

/** @type {import('hardhat/config').HardhatUserConfig} */
const baseConfig = {
	solidity: {
		version: "0.8.24",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
			evmVersion: "paris",
		},
	},

	networks: {
		hardhat: {
			chainId: 31337,
		},

		localhost: {
			url: "http://127.0.0.1:8545",
			chainId: 31337,
		},

		arbitrum: {
			url: process.env.ARBITRUM_HTTP_URL || `https://rpc.ankr.com/arbitrum/${process.env.ANKR_API_KEY || ""}`,
			chainId: 42161,
			accounts,
		},

		arbitrumGoerli: {
			url: "https://goerli-rollup.arbitrum.io/rpc",
			chainId: 421613,
			accounts,
		},

		ethereum: {
			url: process.env.ETHEREUM_HTTP_URL || "https://cloudflare-eth.com",
			chainId: 1,
			accounts,
		},

		sepolia: {
			url: process.env.SEPOLIA_HTTP_URL || "https://ethereum-sepolia-rpc.publicnode.com",
			chainId: 11155111,
			accounts,
			// Let ethers auto-calculate EIP-1559 fees (a fixed 2 gwei stalls when base fee is higher).
		},

		base: {
			url: process.env.BASE_HTTP_URL || "https://mainnet.base.org",
			chainId: 8453,
			accounts,
		},
	},

	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY || "",
		customChains: [
			{
				network: "base",
				chainId: 8453,
				urls: {
					apiURL: "https://api.basescan.org/api",
					browserURL: "https://basescan.org",
				},
			},
			{
				network: "arbitrumOne",
				chainId: 42161,
				urls: {
					apiURL: "https://api.arbiscan.io/api",
					browserURL: "https://arbiscan.io",
				},
			},
		],
	},

	gasReporter: {
		enabled: process.env.REPORT_GAS !== undefined,
		currency: "USD",
		gasPrice: 0.1, // 0.1 gwei for Arbitrum
		token: "ETH",
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
	},

	contractSizer: {
		alphaSort: true,
		disambiguatePaths: false,
		runOnCompile: true,
		strict: true,
	},

	mocha: {
		timeout: 60000,
	},
};

module.exports = baseConfig;
