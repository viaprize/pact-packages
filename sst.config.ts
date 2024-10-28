/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'viaprize',
      removal:
        input?.stage === 'production' || input.stage === 'dev'
          ? 'retain'
          : 'remove',
      home: 'aws',
      providers: {
        aws: {
          profile:
            input.stage === 'production'
              ? 'viaprize-production'
              : 'viaprize-dev',
          region: 'us-east-2',
        },
        'pulumi-stripe': '0.0.24',
      },
    }
  },
  async run() {
    const website = await import('./infra/website')
    const eventBus = await import('./infra/events')
    const storage = await import('./infra/storage')
    const cache = await import('./infra/cache')
    // const webhook = await import('./infra/payment')
    const router = await import('./infra/router')
    return {
      website: website.website.url,
      imageBucket: storage.imageBucket.name,
      eventBus: eventBus.eventBus.name,
      scheduleReceivingFunction: eventBus.scheduleReceivingFunction.arn,
      cacheTable: cache.cacheTable.name,
      cacheTableArn: cache.cacheTable.arn,
      // router: router.router.url,
      webhook: router.webhook.url,
    }
  },
})
