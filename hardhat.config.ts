import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {},
    bitfinity: {
      url: 'https://testnet.bitfinity.network',
      accounts: [''],
      chainId: 355113,
    },
    BitTorrent: {
      url: "https://pre-rpc.bt.io/",
      accounts: [''],
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
