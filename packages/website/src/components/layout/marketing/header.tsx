'use client'

import { Button } from '@viaprize/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@viaprize/ui/sheet'
import { Menu } from 'lucide-react'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false)
  const pathName = usePathname()

  useEffect(() => {
    if (open) {
      setOpen(false)
    }
  }, [pathName])

  return (
    <nav className="fixed top-0 right-0 left-0 overflow-x-hidden z-[999] flex justify-between bg-background/40 backdrop-blur-lg items-center py-4 px-8">
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
        <Button asChild>
          {session?.user ? (
            <Link href={`/profile/${session.user.username}`}>Profile</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="sm:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="z-[1000]">
            <div className="grid gap-4 py-4 text-primary font-semibold ">
              {session?.user ? (
                <Link href={`/profile/${session.user.username}`}>Profile</Link>
              ) : (
                <Link href="/login">Login</Link>
              )}
              <Link href="/prize">Prizes</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
