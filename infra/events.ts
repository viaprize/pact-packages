import { cacheTable } from './cache'

// import { scheduleReceivingFunction, schedulerRole } from "./scheduler";
import {
  DATABASE_URL,
  GASLESS_KEY,
  LOOPS_API_KEY,
  RPC_URL,
  SECRET_KEY,
} from './secrets'
sst.Linkable.wrap(aws.iam.Role, (fn) => ({
  properties: {
    arn: fn.arn,
  },
}))

export const schedulerRole = new aws.iam.Role('schedulerRole', {
  assumeRolePolicy: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Sid: '',
        Principal: {
          Service: 'scheduler.amazonaws.com',
        },
      },
    ],
  },
  inlinePolicies: [
    {
      name: 'schedulerLambdaPolicy',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 'lambda:InvokeFunction',
            Resource: '*',
          },
        ],
      }),
    },
  ],
})

sst.Linkable.wrap(sst.aws.Function, (fn) => ({
  properties: {
    arn: fn.arn,
  },
}))

export const eventBus = new sst.aws.Bus('EventBus')

export const scheduleReceivingFunction = new sst.aws.Function(
  'ScheduleReceivingLambda',
  {
    handler: 'packages/functions/src/schedule-receiver.handler',
    link: [
      eventBus,
      DATABASE_URL,
      eventBus,
      cacheTable,

      RPC_URL,
    ],
    environment: {
      DATABASE_URL: DATABASE_URL.value,
      CHAIN_ID: $app.stage === 'production' ? '10' : '11155111',

      RPC_URL: RPC_URL.value,
    },
  },
)

eventBus.subscribe({
  handler: 'packages/functions/src/events/event-handler.handler',
  permissions: [
    {
      actions: ['scheduler:CreateSchedule'],
      resources: ['*'],
    },
    {
      actions: ['iam:PassRole'],
      resources: ['*'],
    },
  ],

  environment: {
    DATABASE_URL: DATABASE_URL.value,
    CHAIN_ID: $app.stage === 'production' ? '10' : '11155111',

    RPC_URL: RPC_URL.value,
    LOOPS_API_KEY: LOOPS_API_KEY.value,
    GASLESS_KEY: GASLESS_KEY.value,
    SECRET_KEY: SECRET_KEY.value,
  },
  link: [
    DATABASE_URL,
    eventBus,
    cacheTable,

    RPC_URL,
    scheduleReceivingFunction,
    schedulerRole,
    LOOPS_API_KEY,
    GASLESS_KEY,
    SECRET_KEY,
  ],
})
