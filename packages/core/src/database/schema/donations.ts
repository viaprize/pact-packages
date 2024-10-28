import { eq, relations, sql } from 'drizzle-orm'
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgMaterializedView,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { prizes } from './prizes'
import { users } from './users'
export const donationTokenTypeEnum = pgEnum('donationTokenTypeEnum', [
  'TOKEN',
  'NFT',
])

export const recipientTypeEnum = pgEnum('recipientTypeEnum', [
  'PRIZE',
  'FUNDRAISER',
  'GITCOIN',
  'UNKNOWN',
])
export const donationTypeEnum = pgEnum('donationTypeEnum', ['PAYMENT', 'GIFT'])
export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  valueInToken: real('valueInToken').notNull().default(0),
  token: varchar('token').notNull(),
  decimals: integer('decimals').notNull().default(6),
  tokenType: donationTokenTypeEnum('tokenType').notNull().default('TOKEN'),
  type: donationTypeEnum('type').notNull().default('PAYMENT'),
  donor: varchar('donor').notNull(),
  recipientAddress: varchar('recipient').notNull(),
  recipientType: recipientTypeEnum('recipientType')
    .notNull()
    .default('UNKNOWN'),
  transactionId: varchar('transactionId').unique(),
  paymentId: varchar('paymentId').unique(),
  prizeId: varchar('prizeId').references(() => prizes.id, {
    onDelete: 'set null',
  }),
  isFiat: boolean('isFiat').notNull().default(false),
  isFullyRefunded: boolean('isRefunded').notNull().default(false),
  isPartiallyRefunded: boolean('isPartiallyRefunded').notNull().default(false),
  totalRefunded: numeric('totalRefunded').notNull().default('0'),
  username: varchar('username').references(() => users.username, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: true,
  }).$default(() => new Date()),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: true,
  }).$onUpdate(() => new Date()),
})

export const donationsRelations = relations(donations, ({ one }) => ({
  prize: one(prizes, {
    fields: [donations.prizeId],
    references: [prizes.id],
  }),
  user: one(users, {
    fields: [donations.username],
    references: [users.username],
  }),
}))

export const prizeDonationsView = pgMaterializedView('prize_donations_view').as(
  (qb) =>
    qb.select().from(donations).where(eq(donations.recipientType, 'PRIZE')),
)
export const fundraiserDonationsView = pgMaterializedView(
  'fundraiser_donations_view',
).as((qb) =>
  qb.select().from(donations).where(eq(donations.recipientType, 'FUNDRAISER')),
)
export const gitcoinDonationsView = pgMaterializedView(
  'gitcoin_donations_view',
).as((qb) =>
  qb.select().from(donations).where(eq(donations.recipientType, 'GITCOIN')),
)

const donationViews = {
  prizeDonationsView,
  fundraiserDonationsView,
  gitcoinDonationsView,
} as const

// Schema for inserting a user - can be used to validate API requests
export const insertDonationSchema = createInsertSchema(donations)
export const selectDonationSchema = createInsertSchema(donations)
// Create a union type of the variable names
export type DonationViewNames = keyof typeof donationViews
