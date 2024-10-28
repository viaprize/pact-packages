import { env } from '@/env'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'

import { viaprize } from './viaprize'

import type { DefaultSession } from 'next-auth'

import { z } from 'zod'

export const userSessionSchema = z.object({
  username: z.string(),
  id: z.string(),
  wallet: z.object({
    address: z.string(),
    key: z.string().nullable(),
  }),
  isAdmin: z.boolean(),
  email: z.string(),
})
declare module 'next-auth' {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      username?: string
      id?: string
      wallet?: {
        address: string
        key?: string | null
      }
      isAdmin?: boolean
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession['user']
  }
}

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  providers: [
    Google,
    Resend({
      from: 'support@auth.viaprize.org',
    }),
    Github,
  ],
  callbacks: {
    jwt: async ({ token }) => {
      if (!token.sub) {
        throw new Error('No sub')
      }
      const user = await viaprize.users.getUserById(token.sub)

      return {
        ...token,
        name: user?.name,
        email: user?.email,
        username: user?.username,
        wallet: user?.wallets[0],
        isAdmin: user?.isAdmin,
      }
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          username: token.username,
          id: token.sub,
          isAdmin: token.isAdmin,
          wallet: token.wallet,
        },
      }
    },
  },

  adapter: DrizzleAdapter(viaprize.database.database),
  session: {
    strategy: 'jwt',
  },
  debug: env.NODE_ENV === 'development',
})
