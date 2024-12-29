import 'dotenv/config'
export const AUTH_SECRET = new sst.Secret('AuthSecret')
export const DATABASE_URL = new sst.Secret('DatabaseUrl')
export const AUTH_GITHUB_ID = new sst.Secret('AuthGithubId')
export const AUTH_GITHUB_SECRET = new sst.Secret('AuthGithubSecret')
export const AUTH_GOOGLE_ID = new sst.Secret('AuthGoogleId')
export const AUTH_GOOGLE_SECRET = new sst.Secret('AuthGoogleSecret')
export const AUTH_RESEND_KEY = new sst.Secret('AuthResendKey')
export const GASLESS_KEY = new sst.Secret('GaslessKey')
export const SECRET_KEY = new sst.Secret('SecretKey')
export const OPENAI_API_KEY = new sst.Secret('OpenAiApiKey')

export const AUTH_TRUST_HOST = new sst.Secret('AuthTrustHost')

export const NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = new sst.Secret(
  'NextPublicWalletConnectProjectId',
)

export const RPC_URL = new sst.Secret('RpcUrl')

export const NORMIE_TECH_API_KEY = new sst.Secret('NormieTechApiKey')
export const NORMIE_TECH_SECRET_KEY = new sst.Secret('NormieTechSecretKey')

export const LOOPS_API_KEY = new sst.Secret('LoopsApiKey')
