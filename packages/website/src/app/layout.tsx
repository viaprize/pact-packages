import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import '@viaprize/ui/globals.css'

import PrizeChatbot from '@/components/prize-chatbot/prizebot-interface'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import getConfig from 'next/config'
import { headers } from 'next/headers'
import { Toaster } from 'sonner'
import { cookieToInitialState } from 'wagmi'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'viaPrize',
  description: 'viaPrize',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get('cookie'),
  )
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <Toaster />
        <Providers initialState={initialState}>
          {children}
          <PrizeChatbot />
        </Providers>
      </body>
    </html>
  )
}
