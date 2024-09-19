import { Events, Viaprize } from '@viaprize/core/viaprize'
import { bus } from 'sst/aws/bus'
import { Cache } from './utils/cache'

const viaprize = new Viaprize({
  config: {
    databaseUrl: process.env.DATABASE_URL ?? '',
    inMemoryDb: false,
    mode: 'development',
    wallet: {
      walletPaymentInfraUrl: 'https://null.com',
      walletApiKey: 'some-key',
      rpcUrl: 'https://null.com',
    },
    chainId: Number.parseInt(process.env.CHAIN_ID ?? '10'),
  },
})

export const handler = bus.subscriber(
  [Events.Wallet.ScheduleTransaction, Events.Prize.Approve, Events.Cache.Set],
  async (event) => {
    switch (event.type) {
      case 'wallet.transaction':
        console.log('Processing wallet transaction event')
        break
      case 'prize.approve':
        console.log('Processing prize approve event')
        await viaprize.prizes.approveDeployedPrize(
          event.properties.prizeId,
          event.properties.contractAddress,
        )
        break
      case 'cache.set':
        console.log('Processing cache set event')
        switch (event.properties.type) {
          case 'dynamodb': {
            const cache = new Cache()
            await cache.set(
              event.properties.key,
              event.properties.value,
              event.properties.ttl ?? 3600,
            )
            break
          }
        }
        break
    }
  },
)
