import { eventBus } from './events'
import { DATABASE_URL, GASLESS_KEY, RPC_URL, SECRET_KEY } from './secrets'

export const router = new sst.aws.ApiGatewayV2('Router')

router.route('POST /payment/checkout', {
  handler: 'packages/functions/src/payments/checkout.handler',
  environment: {},
})

export const webhook = new stripe.WebhookEndpoint('PaymentWebhook', {
  url: $interpolate`${router.url}/payment/webhook`,
  metadata: {
    stage: $app.stage,
  },

  enabledEvents: ['checkout.session.completed'],
})

router.route('POST /payment/webhook', {
  handler: 'packages/functions/src/payments/webhook.handler',
  link: [webhook, eventBus],
  environment: {
    DATABASE_URL: DATABASE_URL.value,
    CHAIN_ID: $app.stage === 'production' ? '10' : '11155111',

    RPC_URL: RPC_URL.value,
    SECRET_KEY: SECRET_KEY.value,
    GASLESS_KEY: GASLESS_KEY.value,
  },
})
