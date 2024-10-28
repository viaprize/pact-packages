import type React from 'react'

import Footer from '@/components/layout/marketing/footer'
import Header from '@/components/layout/marketing/header'
import { auth } from '@/server/auth'

export default async function Layout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <>
      <Header session={session} />
      {children}
      <Footer />
    </>
  )
}
