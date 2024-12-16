'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Button } from '@viaprize/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@viaprize/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@viaprize/ui/sheet'
import { LogOut, Menu, User } from 'lucide-react'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Component({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false)
  const pathName = usePathname()

  useEffect(() => {
    if (open) {
      setOpen(false)
    }
  }, [pathName])

  const ProfileOrLoginButton = ({ isMobile = false }) => {
    if (!session) {
      return (
        <Link href="/login">
          <Button variant="default">Login / Sign up</Button>
        </Link>
      )
    }

    const avatarComponent = (
      <Avatar>
        <AvatarImage
          src={session.user?.image ?? ''}
          alt={session.user?.username ?? ''}
        />
        <AvatarFallback>{session.user?.name?.substring(0, 2)}</AvatarFallback>
      </Avatar>
    )

    if (isMobile) {
      return (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            {avatarComponent}
            <span className="font-semibold">{session.user?.name}</span>
          </div>
          <Link href={`/profile/${session.user?.username}`}>
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </Link>
          <Button variant="outline" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0">
            <div className="flex items-center space-x-2">
              {avatarComponent}
              <span className="font-semibold">{session.user?.name}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/profile/${session.user?.username}`}>
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
    )
  }

  return (
    <nav className="fixed top-0 right-0 left-0 overflow-x-hidden z-[999]  flex justify-between bg-background/40 backdrop-blur-lg items-center py-4 px-8">
      <Link href="/" className="flex items-center space-x-4">
        <Image src="/viaprizeBg.png" alt="Logo" width={32} height={32} />
        <h1 className="text-2xl font-bold">viaPrize</h1>
      </Link>

      <div className="hidden sm:flex sm:items-center sm:space-x-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Link href="/prize">Prizes</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block">
          <ProfileOrLoginButton />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="z-[1000]">
            <div className="grid gap-4 py-4 text-primary font-semibold">
              <div className="sm:hidden">
                <ProfileOrLoginButton isMobile={true} />
              </div>
              {['prize', 'about', 'contact'].map((item) => (
                <Link
                  key={item}
                  href={`/${item}`}
                  className="flex items-center space-x-2"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start font-semibold capitalize"
                  >
                    {item.replace('-', ' ')}
                  </Button>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
