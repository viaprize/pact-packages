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
  LOOPS_API_KEY,
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  NORMIE_TECH_API_KEY,
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
    LOOPS_API_KEY,
  ],
  environment: {
    PAYMENT_URL:
      'https://84i54kd5nk.execute-api.us-east-1.amazonaws.com/v1/viaprize',
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
    LOOPS_API_KEY: LOOPS_API_KEY.value,
    NORMIE_TECH_API_KEY: NORMIE_TECH_API_KEY.value,
    NEXT_PUBLIC_NORMIE_TECH_API_KEY: NORMIE_TECH_API_KEY.value,
  },
})
