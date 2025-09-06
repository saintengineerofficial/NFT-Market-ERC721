import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const accounts = [
  process.env.NEXT_PUBLIC_ACCOUNTONE_KEY
  process.env.NEXT_PUBLIC_ACCOUNTTWO_KEY
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
