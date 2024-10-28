'use client'
import { wagmiConfig } from '@/lib/wagmi'
import { TRPCReactProvider } from '@/trpc/react'
import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

import {
  SessionProvider,
  getCsrfToken,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react'
import { type State, WagmiProvider } from 'wagmi'
import { optimism } from 'wagmi/chains'

function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <RainbowKitProvider coolMode initialChain={optimism}>
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
