'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Button } from '@viaprize/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@viaprize/ui/dropdown-menu'
import { Activity, Home, LogOut, Plus, PlusCircle, User } from 'lucide-react'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { FaUserAlt } from 'react-icons/fa'
import { RiDashboardHorizontalFill } from 'react-icons/ri'

export default function Navbar({
  session,
}: {
  session: Session | null
}) {
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10)
      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [prevScrollPos])

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`bg-background rounded-md  border-[0.5px] border-border transition-all duration-300 ${visible ? 'sticky top-0' : 'fixed top-[-80px]'} z-50`}
      >
        <div className="px-6 lg:px-8 ">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center space-x-4">
              <Image src="/viaprizeBg.png" alt="Logo" width={32} height={32} />
              <h1 className="text-2xl font-bold">viaPrize</h1>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <Button variant="ghost" className="text-foreground">
                Explore Prizes
              </Button>
              {/* <Button variant="ghost" className="text-foreground">
                Activities
              </Button> */}
              <Button asChild>
                <Link href="/prize/create">
                  <Plus className="size-5 mr-1" />
                  Create Prize
                </Link>
              </Button>
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar>
                      <AvatarImage
                        src={session.user.image ?? ''}
                        alt={session.user.username}
                      />
                      <AvatarFallback>
                        {session.user.username?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${session.user.username}`}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default">Login</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex justify-around items-center h-[70px]">
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-16"
            asChild
          >
            <Link href="/prize">
              <RiDashboardHorizontalFill className="text-3xl" />
              <span className="text-xs mt-1">Prizes</span>
            </Link>
          </Button>
          <Button
            variant="default"
            className="rounded-full h-12 w-12 flex items-center justify-center -mt-16"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center h-16 justify-center"
            asChild
          >
            <Link
              href={session ? `profile/${session.user.username}` : '/login'}
            >
              {session?.user ? (
                <Avatar>
                  <AvatarImage
                    src={session.user.image || ''}
                    alt={session.user.username}
                  />
                  <AvatarFallback>
                    {session.user.username?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <FaUserAlt className="text-xl" />
              )}
              <span className="text-xs mt-1">
                {session ? session.user.username || 'Profile' : 'Login'}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}
