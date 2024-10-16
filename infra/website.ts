import { cacheTable } from './cache'
import { eventBus } from './events'
import { router } from './router'
import {
  AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET,
  AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET,
  AUTH_RESEND_KEY,
  AUTH_SECRET,
  AUTH_TRUST_HOST,
  CHAIN_ID,
  DATABASE_URL,
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  OPENAI_API_KEY,
  RPC_URL,
  WALLET_API_KEY,
  WALLET_PAYMENT_INFRA_API,
} from './secrets'
import { imageBucket } from './storage'

export const website = new sst.aws.Nextjs('website', {
  path: './packages/website',
  link: [
    AUTH_SECRET,
    DATABASE_URL,
    AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET,
    AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET,
    AUTH_RESEND_KEY,
    WALLET_PAYMENT_INFRA_API,
    AUTH_TRUST_HOST,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    CHAIN_ID,
    RPC_URL,
    WALLET_API_KEY,
    OPENAI_API_KEY,
    imageBucket,
    eventBus,
    cacheTable,
    router,
  ],
  environment: {
    PAYMENT_URL: router.url,
    AUTH_SECRET: AUTH_SECRET.value,
    DATABASE_URL: DATABASE_URL.value,
    AUTH_GITHUB_ID: AUTH_GITHUB_ID.value,
    AUTH_GITHUB_SECRET: AUTH_GITHUB_SECRET.value,
    AUTH_GOOGLE_ID: AUTH_GOOGLE_ID.value,
    AUTH_GOOGLE_SECRET: AUTH_GOOGLE_SECRET.value,
    AUTH_RESEND_KEY: AUTH_RESEND_KEY.value,
    WALLET_PAYMENT_INFRA_API: WALLET_PAYMENT_INFRA_API.value,
    AUTH_TRUST_HOST: AUTH_TRUST_HOST.value,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID.value,
    CHAIN_ID: CHAIN_ID.value,
    RPC_URL: RPC_URL.value,
    WALLET_API_KEY: WALLET_API_KEY.value,
    OPENAI_API_KEY: OPENAI_API_KEY.value,
  },
})
