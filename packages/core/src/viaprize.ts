import { event } from 'sst/event'
import { ZodValidator } from 'sst/event/validator'
import { z } from 'zod'
import { type ViaprizeConfig, viaprizeConfigSchema } from './config'
import { ViaprizeDatabase } from './database'
import { insertActivitySchema } from './database/schema'
import { Activities } from './lib/activities'
import {
  CONTRACT_CONSTANTS_PER_CHAIN,
  type ValidChainIDs,
  ValidChainSchema,
} from './lib/constants'
import { Donations } from './lib/donations'
import { Prizes } from './lib/prizes'
import { Users } from './lib/users'
import { Wallet } from './lib/wallet'

export class Viaprize {
  config: ViaprizeConfig
  donations: Donations
  prizes: Prizes
  users: Users
  database: ViaprizeDatabase
  constants
  wallet: Wallet
  activities: Activities

  constructor({ config }: { config: ViaprizeConfig }) {
    this.config = viaprizeConfigSchema.parse(config)
    this.database = new ViaprizeDatabase({
      databaseUrl: this.config.databaseUrl,
    })
    this.wallet = new Wallet(
      this.config.wallet.rpcUrl,
      this.config.chainId,
      this.config.wallet.secretKey,
      this.config.wallet.gaslessKey as `0x${string}`,
    )
    this.donations = new Donations(this.database)
    this.users = new Users(this.database, this.wallet)
    this.prizes = new Prizes(
      this.database,
      this.config.chainId,
      this.config.wallet.rpcUrl,
    )

    this.activities = new Activities(this.database)
    this.constants =
      CONTRACT_CONSTANTS_PER_CHAIN[this.config.chainId as ValidChainIDs]
  }
}

const defineEvent = event.builder({
  validator: ZodValidator,
})
const TransactionData = z.object({
  transactions: z.array(
    z.object({
      data: z.string(),
      to: z.string(),
      value: z.string(),
    }),
  ),
  walletType: z.enum(['gasless']).default('gasless'),
})
export const Events = {
  Activity: {
    Create: defineEvent('activity.create', insertActivitySchema),
  },
  Wallet: {
    Transaction: defineEvent('wallet.transaction', TransactionData),
    StartSubmission: defineEvent(
      'wallet.startSubmission',
      z.object({
        wallet: TransactionData,
        submissionDurationInMinutes: z.number(),
      }),
    ),
    EndVoting: defineEvent(
      'wallet.endVoting',
      z.object({
        wallet: TransactionData,
      }),
    ),
    EndSubmissionAndStartVoting: defineEvent(
      'wallet.endSubmissionAndStartVoting',
      z.object({
        wallet: TransactionData,
        votingDurationInMinutes: z.number(),
      }),
    ),
  },
  Prize: {
    Approve: defineEvent(
      'prize.approve',
      z.object({
        prizeId: z.string(),
        contractAddress: z.string(),
      }),
    ),
    StartSubmission: defineEvent(
      'prize.startSubmission',
      z.object({ contractAddress: z.string() }),
    ),
    EndSubmission: defineEvent(
      'prize.endSubmission',
      z.object({ contractAddress: z.string() }),
    ),
    StartVoting: defineEvent(
      'prize.startVoting',
      z.object({ contractAddress: z.string() }),
    ),
    EndVoting: defineEvent(
      'prize.endVoting',
      z.object({ contractAddress: z.string() }),
    ),
    ScheduleStartSubmission: defineEvent(
      'prize.scheduleStartSubmission',
      z.object({
        contractAddress: z.string(),
        submissionDurationInMinutes: z.number(),
        startSubmissionDate: z.string(),
      }),
    ),
    ScheduleEndSubmissionAndStartVoting: defineEvent(
      'prize.scheduleEndSubmissionAndStartVoting',
      z.object({
        contractAddress: z.string(),
        submissionDurationInMinutes: z.number(),
        startSubmissionDate: z.string(),
        votingDurationInMinutes: z.number(),
      }),
    ),
    ScheduleEndVoting: defineEvent(
      'prize.scheduleEndVoting',
      z.object({
        contractAddress: z.string(),
        startVotingDate: z.string(),
        votingDurationInMinutes: z.number(),
      }),
    ),
    ScheduleEndDispute: defineEvent(
      'prize.scheduleEndDispute',
      z.object({ contractAddress: z.string() }),
    ),
  },
  Cache: {
    Set: defineEvent(
      'cache.set',
      z.object({
        key: z.string(),
        value: z.string(),
        ttl: z.number().optional(),
        type: z.enum(['next', 'dynamodb']).default('dynamodb'),
      }),
    ),
    Delete: defineEvent('cache.delete', z.object({ key: z.string() })),
  },
  Indexer: {
    ConfirmEvent: defineEvent(
      'indexer.confirmEvent',
      z.object({ eventId: z.string() }),
    ),
  },
  Fiat: {
    Refund: defineEvent(
      'fiat.refund',
      z.object({
        transactionId: z.string(),
        refundAmountInCents: z.number(),
        isFullyRefunded: z.boolean(),
        isPartiallyRefunded: z.boolean(),
        totalRefunded: z.number(),
        paymentId: z.string(),
      }),
    ),
  },
  Emails: {
    Newsletter: defineEvent(
      'emails.newsletter',
      z.object({ email: z.string(), firstName: z.string() }),
    ),
    Welcome: defineEvent('emails.onboarding', z.object({ email: z.string() })),
    PrizeCreated: defineEvent(
      'emails.prizeCreated',
      z.object({ email: z.string() }),
    ),
    Donated: defineEvent(
      'emails.donated',
      z.object({
        donationId: z.number(),
      }),
    ),
    PrizeApproved: defineEvent(
      'emails.prizeApproved',
      z.object({ prizeId: z.string() }),
    ),
  },
}
