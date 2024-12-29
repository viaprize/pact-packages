import { z } from 'zod'
import { ValidChainSchema } from '../lib/constants'

export const viaprizeConfigSchema = z.object({
  databaseUrl: z.string().url('Invalid database URL'),
  inMemoryDb: z.boolean().default(false),
  mode: z.enum(['development', 'production']).default('development'),
  wallet: z.object({
    gaslessKey: z.string(),
    secretKey: z.string(),
    rpcUrl: z.string().url('Invalid RPC URL'),
  }),
  chainId: ValidChainSchema,
})

export type ViaprizeConfig = z.infer<typeof viaprizeConfigSchema>
