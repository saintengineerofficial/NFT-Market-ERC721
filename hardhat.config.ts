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
    // bitfinity: {
    //   url: 'https://testnet.bitfinity.network',
    //   accounts: [''],
    //   chainId: 355113,
    // },
    BitTorrent: {
      url: "https://pre-rpc.bt.io/",
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
