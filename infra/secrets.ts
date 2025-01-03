import 'dotenv/config'
export const AUTH_SECRET = new sst.Secret('AUTH_SECRET')
export const DATABASE_URL = new sst.Secret('DATABASE_URL')
export const AUTH_GOOGLE_ID = new sst.Secret('AUTH_GOOGLE_ID')
export const AUTH_GOOGLE_SECRET = new sst.Secret('AUTH_GOOGLE_SECRET')
export const AUTH_RESEND_KEY = new sst.Secret('AUTH_RESEND_KEY')
export const GASLESS_KEY = new sst.Secret('GASLESS_KEY')
export const SECRET_KEY = new sst.Secret('SECRET_KEY')
export const OPENAI_API_KEY = new sst.Secret('OPENAI_API_KEY')

export const AUTH_TRUST_HOST = new sst.Secret('AUTH_TRUST_HOST')

export const NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = new sst.Secret(
  'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID',
)

export const RPC_URL = new sst.Secret('RPC_URL')
export const NORMIE_TECH_URL = new sst.Secret(
  'NORMIE_TECH_URL',
  $app.stage === 'production'
    ? 'https://normie.tech'
    : 'https://dev-api.normie.tech',
)
export const NORMIE_TECH_API_KEY = new sst.Secret('NORMIE_TECH_API_KEY')
export const NORMIE_TECH_SECRET_KEY = new sst.Secret('NORMIE_TECH_SECRET_KEY')
export const LOOPS_API_KEY = new sst.Secret('LOOPS_API_KEY')
