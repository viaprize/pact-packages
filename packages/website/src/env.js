import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: z.string().optional(),
    DATABASE_URL: z.string(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    AUTH_RESEND_KEY: z.string(),
    CHAIN_ID: z.string(),
    GASLESS_KEY: z.string(),
    SECRET_KEY: z.string(),
    NORMIE_TECH_URL: z.string(),

    RPC_URL: z.string(),

    LOOPS_API_KEY: z.string(),
    NORMIE_TECH_API_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: z.string(),
    NEXT_PUBLIC_CHAIN_ID: z.string(),
    NEXT_PUBLIC_NORMIE_TECH_API_KEY: z.string(),
    NEXT_PUBLIC_NORMIE_TECH_URL: z.string(),
    NEXT_PUBLIC_RPC_URL: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    CHAIN_ID: process.env.CHAIN_ID,
    GASLESS_KEY: process.env.GASLESS_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    NORMIE_TECH_URL: process.env.NORMIE_TECH_URL,
    NEXT_PUBLIC_NORMIE_TECH_URL: process.env.NEXT_PUBLIC_NORMIE_TECH_URL,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    RPC_URL: process.env.RPC_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    LOOPS_API_KEY: process.env.LOOPS_API_KEY,
    NORMIE_TECH_API_KEY: process.env.NORMIE_TECH_API_KEY,
    NEXT_PUBLIC_NORMIE_TECH_API_KEY:
      process.env.NEXT_PUBLIC_NORMIE_TECH_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
