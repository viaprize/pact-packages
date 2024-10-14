import { unstable_update } from '@/server/auth'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  withCache,
} from '../trpc'

export const userRouter = createTRPCRouter({
  hello: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),
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
      const usernameExists = await ctx.viaprize.users.usernameExists(
        input.username,
      )
      if (usernameExists) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Username already exists',
        })
      }

      await ctx.viaprize.users.onboardUser({
        email: input.email,
        name: input.name,
        walletAddress: input.walletAddress,
        network: 'optimism',
        username: input.username,
        userId: ctx.session.user.id,
      })
    }),
})
