import 'dotenv/config'
export const AUTH_SECRET = new sst.Secret('AuthSecret')

export const DATABASE_URL = new sst.Secret('DatabaseUrl')
export const AUTH_GITHUB_ID = new sst.Secret('AuthGithubId')
export const AUTH_GITHUB_SECRET = new sst.Secret('AuthGithubSecret')
export const AUTH_GOOGLE_ID = new sst.Secret('AuthGoogleId')
export const AUTH_GOOGLE_SECRET = new sst.Secret('AuthGoogleSecret')
export const AUTH_RESEND_KEY = new sst.Secret('AuthResendKey')

export const OPENAI_API_KEY = new sst.Secret('OpenAiApiKey')

export const WALLET_PAYMENT_INFRA_API = new sst.Secret('WalletPaymentInfraApi')

export const AUTH_TRUST_HOST = new sst.Secret('AuthTrustHost')

export const NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = new sst.Secret(
  'NextPublicWalletConnectProjectId',
)

export const INDEXER_PRIZE_FACTORY_STARTBLOCK = new sst.Secret(
  'IndexerPrizeFactoryStartBlock',
  '125710469',
)
export const INDEXER_PRIZE_STARTBLOCK = new sst.Secret(
  'IndexerPrizeStartBlock',
  '125710469',
)

export const CHAIN_ID = new sst.Secret('ChainId')

export const RPC_URL = new sst.Secret('RpcUrl')

export const WALLET_API_KEY = new sst.Secret('WalletApiKey')

export const INDEXER_RPC_URL = new sst.Secret('IndexerRpcUrl')

export const PAYMENT_SECRET_KEY = new sst.Secret(
  'PaymentSecretKey',
  process.env.STRIPE_API_KEY,
)

export const WEBHOOK_SECRET = new sst.Secret('WebhookSecret')

export const LOOPS_API_KEY = new sst.Secret('LoopsApiKey')
