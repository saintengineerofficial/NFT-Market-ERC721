import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { hardhat, mainnet } from 'wagmi/chains';
import { metaMaskWallet, walletConnectWallet, coinbaseWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string

// const bitfinity: Chain = {
//   id: 355113,
//   name: 'Bitfinity',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Bitfinity',
//     symbol: 'BFT',
//   },
//   rpcUrls: {
//     default: { http: ['https://testnet.bitfinity.network'] },
//   },
//   blockExplorers: {
//     default: { name: 'Bitfinity Block Explorer', url: 'https://explorer.bitfinity.network/' },
//   },
//   testnet: true,
// }

// 自定义连接钱包
const connectors = connectorsForWallets(
  [{
    groupName: 'Recommended',
    wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet, rainbowWallet],
  }],
  { appName: 'SaintNFT', projectId }
);

const config = createConfig({
  connectors,
  chains: [mainnet, hardhat],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`),
    [hardhat.id]: http('http://127.0.0.1:8545'),
    // [bitfinity.id]: http('https://testnet.bitfinity.network'),
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
})

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Provider