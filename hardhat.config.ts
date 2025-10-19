import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const accounts = [
  '37cee67e9e3fe48642c1ef815edef3da8ad98b1dccd486e03cc4728adeb2c242',
  '4a34385dc9d597c13db9a14b4a6a2aff36215b7cbb6f65be50ef59f6dbf11341',
]

const config: HardhatUserConfig = {
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts,
    },
    BitTorrent: {
      url: "https://pre-rpc.bt.io/",
      accounts,
      gasPrice: 1000000000,
    },
    // LayerZero 测试网配置
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY || ''}`,
      accounts,
      gasPrice: 20000000000,
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts,
      gasPrice: 10000000000,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY || ''}`,
      accounts,
      gasPrice: 20000000000,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts,
      gasPrice: 25000000000,
    },
    arbitrumGoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      accounts,
      gasPrice: 100000000,
    },
    optimismGoerli: {
      url: "https://goerli.optimism.io",
      accounts,
      gasPrice: 1000000000,
    },
    // LayerZero 主网配置
    ethereum: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY || ''}`,
      accounts,
      gasPrice: 20000000000,
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org",
      accounts,
      gasPrice: 5000000000,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY || ''}`,
      accounts,
      gasPrice: 30000000000,
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts,
      gasPrice: 25000000000,
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts,
      gasPrice: 100000000,
    },
    optimism: {
      url: "https://mainnet.optimism.io",
      accounts,
      gasPrice: 1000000000,
    },
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;
