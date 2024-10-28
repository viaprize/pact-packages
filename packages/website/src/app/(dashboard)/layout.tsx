import Header from '@/components/layout/header'
import Navbar from '@/components/layout/navbar'
import SideNavbarConfigure from '@/components/layout/sidenavbar-configure'
import { auth } from '@/server/auth'
import { ScrollArea } from '@viaprize/ui/scroll-area'
import { redirect } from 'next/navigation'
import type React from 'react'

export default async function DashBoardlayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session && !session.user.username) {
    redirect('/onboard')
  }
  return (
    <div className="h-dvh w-full  bg-white p-3">
      <header>
        <Navbar session={session} />
      </header>
      {/* Main content area with sidebar and children */}
      {/* <div className="flex md:flex-row flex-col overflow-hidden">
        <SideNavbarConfigure /> */}

      <div className="mt-2 flex-1 h-[calc(100vh-90px)]  bg-background rounded-md pb-[73px] sm:pb-0 border-[0.5px]">
        {children}
      </div>
      {/* </div> */}
    </div>
  )
}
