require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
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
      // Disable forking for testing to avoid RPC issues
      // forking: {
      //   url: process.env.ARBITRUM_HTTP_URL || "https://arb1.arbitrum.io/rpc",
      //   enabled: true,
      // },
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    arbitrum: {
      url: process.env.ARBITRUM_HTTP_URL || `https://rpc.ankr.com/arbitrum/${process.env.ANKR_API_KEY || ""}`,
      chainId: 42161,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      // Let ethers auto-calculate gas price
    },
    
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      chainId: 421613,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },

	ethereum: {
		url: process.env.ETHEREUM_HTTP_URL || "http://fin2:8545",
		chainId: 1,
		accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
		// Let ethers auto-calculate gas price
	},

	sepolia: {
		url: process.env.SEPOLIA_HTTP_URL || "https://ethereum-sepolia-rpc.publicnode.com",
		chainId: 11155111,
		accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
		gasPrice: 2000000000, // 2 gwei for testnet
	},

    base: {
      url: process.env.BASE_HTTP_URL || "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      // Let ethers auto-calculate gas price for Base
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
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "arbitrumOne",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arbiscan.io/api",
          browserURL: "https://arbiscan.io"
        }
      }
    ]
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
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  mocha: {
    timeout: 60000,
  },
};
