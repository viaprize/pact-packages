import 'server-only'
import { env } from '@/env'
import { Viaprize } from '@viaprize/core/viaprize'
export const viaprize = new Viaprize({
  config: {
    databaseUrl: env.DATABASE_URL,
    inMemoryDb: false,
    mode: 'development',
    wallet: {
      rpcUrl: env.RPC_URL,
      gaslessKey: env.GASLESS_KEY,
      secretKey: env.SECRET_KEY,
    },
    chainId: Number.parseInt(env.CHAIN_ID),
  },
})
