import { env } from '@/env'
/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from '@trpc/server'
import { Events } from '@viaprize/core/viaprize'
import { Resource } from 'sst'
import { bus } from 'sst/aws/bus'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { auth } from '../auth'
import { Cache } from '../cache'
import { viaprize } from '../viaprize'
/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

type CacheReturn = {
  key: string | undefined
  value: string | undefined | any
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth()
  const cache: CacheReturn = {
    key: undefined,
    value: undefined,
  }
  const cacheClient = new Cache()

  return {
    ...opts,
    session,
    viaprize,
    cache,
    cacheClient,
  }
}

type CacheableFunction<T> = () => Promise<T>
console.log('NODE_ENV', process.env.NODE_ENV)

export async function withCache<T>(
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  tag: string,
  cacheableFunction: CacheableFunction<T>,
  expireAt = 3600,
): Promise<T | null> {
  const shouldCache = process.env.NODE_ENV === 'production'
  console.log(env.DATABASE_URL, 'DATAABSE URL')
  console.log('shouldCache', shouldCache)
  console.log(process.env.NODE_ENV)
  if (shouldCache) {
    // Try to get the value from the cache
    const value = await ctx.cacheClient.get(tag)

    if (value) {
      // If value exists in cache, parse and return it
      return JSON.parse(value) as T
    }

    // No cache hit, call the provided function
    const result = await cacheableFunction()

    await bus.publish(Resource.EventBus.name, Events.Cache.Set, {
      key: tag,
      value: JSON.stringify(result),
      ttl: expireAt,
      type: 'dynamodb',
    })
    return result
  }
  return await cacheableFunction()
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  const result = await next()

  const end = Date.now()
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

/**
 * Public (unauthenticated) procedure
 *
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware)
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || !ctx.session.user.isAdmin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You need to be admin to access this function',
      })
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: {
          ...ctx.session,
          user: {
            ...ctx.session.user,
            // infers that `id` is non-nullable
            id: ctx.session.user.id as string,
          },
        },
      },
    })
  })
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: {
          ...ctx.session,
          user: {
            ...ctx.session.user,
            // infers that `id` is non-nullable
            id: ctx.session.user.id as string,
          },
        },
      },
    })
  })
