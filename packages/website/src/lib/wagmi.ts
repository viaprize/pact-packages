import { env } from '@/env'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { cookieStorage, createStorage } from 'wagmi'
import { optimism, sepolia } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'Viaprize',
  projectId: env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [env.NEXT_PUBLIC_CHAIN_ID === '10' ? optimism : sepolia],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true, // If your dApp uses server side rendering (SSR)
})
