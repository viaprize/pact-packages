import { unstable_update } from '@/server/auth'
import { TRPCError } from '@trpc/server'
import csv from 'csv-parser'
import { LoopsClient } from 'loops'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
const loops = new LoopsClient((process.env.LOOPS_API_KEY as string) ?? '')
import fs from 'node:fs'
export const userRouter = createTRPCRouter({
  getUserStatistics: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const stats = await ctx.viaprize.users.getStatisticsByUsername(input)
      return stats
    }),

  getUserByUsername: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const user = await ctx.viaprize.users.getUserByUsername(input)
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }
      return user
    }),

  onboardUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        walletAddress: z.string().optional(),
        username: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log('onboardUser', input)
      const usernameExists = await ctx.viaprize.users.usernameExists(
        input.username,
      )
      console.log('usernameExists', usernameExists)
      if (usernameExists) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Username already exists',
        })
      }
      console.log('onboardUser', ctx.session.user.id)

      await ctx.viaprize.users.onboardUser({
        email: input.email,
        name: input.name,
        walletAddress: input.walletAddress,
        network: 'optimism',
        username: input.username,
        userId: ctx.session.user.id,
      })

      try {
        const onboardMail: { success: boolean } = await loops.sendEvent({
          email: input.email,
          eventName: 'onboardUser',
          eventProperties: {
            name: input.name,
            wallet: input.walletAddress as string,
            username: input.username,
          },
        })
        console.log(onboardMail)
      } catch (error) {
        console.log('error', error)
      }
    }),
})
