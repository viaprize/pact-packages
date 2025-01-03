import { cacheTable } from './cache'
import { eventBus } from './events'

import {
  AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET,
  AUTH_RESEND_KEY,
  AUTH_SECRET,
  AUTH_TRUST_HOST,
  DATABASE_URL,
  GASLESS_KEY,
  LOOPS_API_KEY,
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  NORMIE_TECH_API_KEY,
  NORMIE_TECH_SECRET_KEY,
  OPENAI_API_KEY,
  RPC_URL,
  SECRET_KEY,
} from './secrets'
import { imageBucket } from './storage'

export const website = new sst.aws.Nextjs('website', {
  path: './packages/website',
  link: [
    AUTH_SECRET,
    DATABASE_URL,
    AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET,
    AUTH_RESEND_KEY,
    AUTH_TRUST_HOST,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    RPC_URL,

    OPENAI_API_KEY,
    imageBucket,
    eventBus,
    cacheTable,
    LOOPS_API_KEY,
    GASLESS_KEY,
    SECRET_KEY,
  ],
  environment: {
    AUTH_SECRET: AUTH_SECRET.value,
    DATABASE_URL: DATABASE_URL.value,
    AUTH_GOOGLE_ID: AUTH_GOOGLE_ID.value,
    AUTH_GOOGLE_SECRET: AUTH_GOOGLE_SECRET.value,
    AUTH_RESEND_KEY: AUTH_RESEND_KEY.value,

    AUTH_TRUST_HOST: AUTH_TRUST_HOST.value,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID.value,
    NEXT_PUBLIC_RPC_URL: RPC_URL.value,
    CHAIN_ID: $app.stage === 'production' ? '10' : '11155111',
    NEXT_PUBLIC_CHAIN_ID: $app.stage === 'production' ? '10' : '11155111',
    RPC_URL: RPC_URL.value,
    GASLESS_KEY: GASLESS_KEY.value,
    SECRET_KEY: SECRET_KEY.value,
    OPENAI_API_KEY: OPENAI_API_KEY.value,
    LOOPS_API_KEY: LOOPS_API_KEY.value,
    NORMIE_TECH_SECRET_KEY: NORMIE_TECH_SECRET_KEY.value,
    NORMIE_TECH_URL:
      $app.stage === 'production'
        ? 'https://api.normie.tech'
        : 'https://api-dev.normie.tech',
    NEXT_PUBLIC_NORMIE_TECH_URL:
      $app.stage === 'production'
        ? 'https://api.normie.tech'
        : 'https://api-dev.normie.tech',
    NORMIE_TECH_API_KEY: NORMIE_TECH_API_KEY.value,
    NEXT_PUBLIC_NORMIE_TECH_API_KEY: NORMIE_TECH_API_KEY.value,
  },
})
