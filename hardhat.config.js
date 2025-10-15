require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
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
      gasPrice: 100000000, // 0.1 gwei
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
		gasPrice: 20000000000, // 20 gwei for mainnet
	},

    base: {
      url: process.env.BASE_HTTP_URL || "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei for Base
    },
  },
  
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
      arbitrumGoerli: process.env.ARBISCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
    },
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
