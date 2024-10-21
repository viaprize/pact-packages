import { relations } from 'drizzle-orm'
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { nanoid } from 'nanoid'
import type { z } from 'zod'
import { prizeComments } from '.'
import { activities } from './activities'
import { prizes } from './prizes'
import { prizesToContestants } from './prizes-to-contestants'
import { submissions } from './submissions'
import { wallets } from './wallets'

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid(12)),

  email: text('email').unique(),
  authId: varchar('authId').unique(),
  username: varchar('username').unique(),
  provider: varchar('provider'),
  name: varchar('name'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  isAdmin: boolean('isAdmin').default(false),
  bio: text('bio').default(''),
  totalFundsWon: numeric('totalFundsWon').default('0'),
  skillSets: text('skillSets').array(),
  priorities: text('priorities').array(),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',

    withTimezone: true,
  }).$onUpdate(() => new Date()),

  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: true,
  }).$default(() => new Date()),
})

export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  prizes: many(prizes),
  prizeComments: many(prizeComments),
  submission: many(submissions),
  contestants: many(prizesToContestants),
  activities: many(activities),
}))

export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export type selectUserType = z.input<typeof selectUserSchema>
