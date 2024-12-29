'use client'
import { wagmiConfig } from '@/lib/wagmi'
import { TRPCReactProvider } from '@/trpc/react'
import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

import { env } from '@/env'
import {
  SessionProvider,
  getCsrfToken,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react'
import { type State, WagmiProvider } from 'wagmi'
import { optimism, sepolia } from 'wagmi/chains'

function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <RainbowKitProvider coolMode initialChain={env.NEXT_PUBLIC_CHAIN_ID === '10' ? optimism : sepolia}>
      {children}
    </RainbowKitProvider>
  )
}
export function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState: State | undefined
}) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <ProgressBar
        height="4px"
        color="#17824d"
        options={{ showSpinner: false }}
        shallowRouting
      />
      <TRPCReactProvider>
        <SessionProvider>
          <WalletProvider>{children}</WalletProvider>
        </SessionProvider>
      </TRPCReactProvider>
    </WagmiProvider>
  )
}
