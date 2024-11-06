import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  varchar,
  vector,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { prizeComments } from './prize-comments'
import { prizesToContestants } from './prizes-to-contestants'
import { submissions } from './submissions'
import { users } from './users'
import { wallets } from './wallets'
export const prizeStagesEnum = pgEnum('prizeStage', [
  'NOT_STARTED',
  'SUBMISSIONS_OPEN',
  'VOTING_OPEN',
  'DISPUTE_AVAILABLE',
  'DISPUTE_ACTIVE',
  'WON',
  'REFUNDED',
])

export const prizeProposalStage = pgEnum('prizeProposalStage', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'APPROVED_BUT_NOT_DEPLOYED',
])

export const prizes = pgTable('prizes', {
  id: varchar('id')
    .$default(() => nanoid(10))
    .primaryKey(),
  slug: varchar('slug').unique(),
  description: text('description').notNull(),
  title: text('title').notNull(),
  startVotingDate: timestamp('startVotingDate', {
    mode: 'string',
    withTimezone: true,
  }).notNull(),
  startSubmissionDate: timestamp('startSubmissionDate', {
    mode: 'string',
    withTimezone: true,
  }).notNull(),
  submissionDurationInMinutes: integer('submissionDurationInMinutes').notNull(),
  votingDurationInMinutes: integer('votingDurationInMinutes').notNull(),
  primaryContractAddress: text('primaryContractAddress'),
  judgesAddresses: json('judgesAddresses').$type<string[]>().default([]),
  skillSets: json('skillSets').$type<string[]>().default([]),
  priorities: text('priorities').array(),
  imageUrl: varchar('imageUrl'),

  // smart contract values here
  authorFeePercentage: integer('proposerFeePercentage').default(5).notNull(),
  platformFeePercentage: integer('platformFeePercentage').default(5).notNull(),
  contractVersion: integer('contractVersion').default(201),
  funds: real('totalFunds').default(0).notNull(),
  totalRefunded: integer('totalRefunded').default(0).notNull(),
  totalVotes: integer('totalWithdrawn').default(0).notNull(),
  stage: prizeStagesEnum('prizeStage').default('NOT_STARTED'),
  proposalStage: prizeProposalStage('proposalStage').default('PENDING'),
  proposerAddress: text('proposerAddress').notNull(),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: true,
  }).$default(() => new Date()),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: true,
  }).$onUpdate(() => new Date()),

  // quick read values here
  numberOfContestants: integer('numberOfContestants').default(0).notNull(),
  numberOfFunders: integer('numberOfFunders').default(0).notNull(),
  numberOfComments: integer('numberOfComments').default(0).notNull(),
  numberOfSubmissions: integer('numberOfSubmissions').default(0).notNull(),

  // relations
  authorUsername: varchar('author')
    .references(() => users.username, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
})

export const prizesRelations = relations(prizes, ({ one, many }) => ({
  author: one(users, {
    fields: [prizes.authorUsername],
    references: [users.username],
  }),
  prizeEmbeddings: one(prizeEmbeddings, {
    fields: [prizes.id],
    references: [prizeEmbeddings.prizeId],
  }),
  contestants: many(prizesToContestants),
  submissions: many(submissions),
  secondaryContractAddresses: many(wallets),
  comments: many(prizeComments),
}))

export const insertPrizeSchema = createInsertSchema(prizes, {
  judgesAddresses: z.array(z.string()).optional(),
  skillSets: z.array(z.string()),
  priorities: z.array(z.string()).optional(),
})
export const selectPrizeSchema = createSelectSchema(prizes, {
  judgesAddresses: z.array(z.string()).optional(),
  skillSets: z.array(z.string()),
  priorities: z.array(z.string()).optional(),
})
export type selectPrizeType = z.infer<typeof selectPrizeSchema>
export type insertPrizeType = z.infer<typeof insertPrizeSchema>

export const prizeEmbeddings = pgTable(
  'prizeEmbeddings',
  {
    prizeId: text('prizeId')
      .references(() => prizes.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .primaryKey(),
    embedding: vector('embedding', { dimensions: 1536 }),
  },
  (table) => ({
    embeddingIndex: index('embeddingIndex').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  }),
)

export const prizeEmbeddingsRelations = relations(
  prizeEmbeddings,
  ({ one }) => ({
    prize: one(prizes, {
      fields: [prizeEmbeddings.prizeId],
      references: [prizes.id],
    }),
  }),
)
