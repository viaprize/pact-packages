'use client'

import { IconMenu2, IconX } from '@tabler/icons-react'
import { cn } from '@viaprize/ui'
import { Button } from '@viaprize/ui/button'
import ToolTipSimple from '@viaprize/ui/tooltip-simple'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link, { type LinkProps } from 'next/link'
import type React from 'react'
import { type ReactNode, createContext, useContext, useState } from 'react'
import { MdArrowRightAlt } from 'react-icons/md'
interface SideBarItem {
  label: string
  icon: React.JSX.Element | React.ReactNode
}
interface Links extends SideBarItem {
  href: string
}

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  animate: boolean
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  const [openState, setOpenState] = useState(false)

  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  )
}

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<'div'>)} />
    </>
  )
}

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen } = useSidebar()
  return (
    <>
      <motion.div
        className={cn(
          'relative my-2 ml-2 mr-1 hidden rounded-md h-[calc(100vh-16px)] w-[300px] flex-shrink-0  bg-background px-4 py-4 md:flex md:flex-col',
          className,
        )}
        animate={{
          width: open ? '260px' : '80px',
        }}
        {...props}
      >
        <Button
          onClick={() => setOpen(!open)}
          variant="secondary"
          className="absolute -right-3 top-2 size-7 p-1 hover:bg-secondary"
        >
          <motion.span
            animate={{
              rotate: open ? 180 : 0,
              transition: {
                duration: 0.3,
                ease: 'easeInOut',
              },
            }}
          >
            <MdArrowRightAlt />
          </motion.span>
        </Button>
        {children as ReactNode}
      </motion.div>
    </>
  )
}

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) => {
  const { open, setOpen } = useSidebar()
  return (
    <>
      <div
        className={cn(
          'flex h-10 w-full flex-row items-center justify-between bg-background px-4 py-4 border-b md:hidden',
        )}
        {...props}
      >
        <div className="z-20 flex items-center w-full justify-between backdrop-blur-lg bg-opacity-10 md:bg-opacity-100 ">
          <Image
            src="/viaprizeBg.png"
            alt="viaprize logo"
            className="h-10 w-10 flex-shrink-0 p-1"
            width={50}
            height={50}
          />
          <IconMenu2 className="" onClick={() => setOpen(!open)} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
              className={cn(
                'fixed inset-0 z-[100] flex h-full w-[60%] flex-col justify-between bg-white px-4 pt-10 dark:bg-neutral-900',
                className,
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export const SidebarButton = ({
  item,
  className,
  onClick,
  variant = 'default',
  href,
}: {
  item: SideBarItem
  className?: string
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined
  variant?: 'default' | 'secondary' | 'outline'
  href?: string
}) => {
  const { open } = useSidebar()
  return (
    <Button
      className={cn(
        'group/sidebar flex items-center w-full  justify-start gap-3 p-3 py-5 rounded-md text-primary-foreground ',
        className,
      )}
      variant={variant}
      onClick={onClick}
    >
      {!open ? (
        <ToolTipSimple position="right" content={item.label}>
          {item.icon}
        </ToolTipSimple>
      ) : (
        item.icon
      )}
      <motion.span
        animate={{
          display: open ? 'inline-block' : 'none',
          opacity: open ? 1 : 0,
        }}
        className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {item.label}
      </motion.span>
    </Button>
  )
}

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links
  className?: string
  props?: LinkProps
}) => {
  const { open, animate } = useSidebar()
  return (
    <Link
      href={link.href}
      className={cn(
        'group/sidebar flex items-center justify-start gap-3 p-3 rounded-md hover:bg-primary/30',
        className,
      )}
      {...props}
    >
      {!open ? (
        <ToolTipSimple position="right" content={link.label}>
          {link.icon}
        </ToolTipSimple>
      ) : (
        link.icon
      )}
      <motion.span
        animate={{
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  )
}
