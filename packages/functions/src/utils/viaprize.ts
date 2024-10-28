import { Viaprize } from '@viaprize/core/viaprize'

export const viaprize = new Viaprize({
  config: {
    databaseUrl: process.env.DATABASE_URL ?? '',
    inMemoryDb: false,
    mode: 'development',
    wallet: {
      walletPaymentInfraUrl: process.env.WALLET_PAYMENT_INFRA_API ?? '',

      walletApiKey: process.env.WALLET_API_KEY ?? '',
      rpcUrl: process.env.RPC_URL ?? '',
    },
    chainId: Number.parseInt(process.env.CHAIN_ID ?? '10'),
  },
})
