import { Viaprize } from '@viaprize/core/viaprize'

export const viaprize = new Viaprize({
  config: {
    databaseUrl: process.env.DATABASE_URL ?? '',
    inMemoryDb: false,
    mode: 'development',
    wallet: {
      rpcUrl: process.env.RPC_URL ?? '',
      gaslessKey: process.env.GASLESS_KEY ?? '',
      secretKey: process.env.SECRET_KEY ?? '',
    },
    chainId: Number.parseInt(process.env.CHAIN_ID ?? '10'),
  },
})
