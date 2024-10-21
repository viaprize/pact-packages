import { relations } from 'drizzle-orm'
import {
  decimal,
  pgTable,
  real,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { prizes } from './prizes'
import { users } from './users'

export const submissions = pgTable('submissions', {
  submissionHash: varchar('id', { length: 255 }).primaryKey(),
  description: text('description').notNull(),
  submitterAddress: text('submitterAddress').notNull(),
  projectLink: text('projectLink'),
  votes: real('votes').default(0).notNull(),
  won: real('won').default(0).notNull(),
  prizeId: varchar('prizeId')
    .references(() => prizes.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  username: varchar('username').references(() => users.username, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: true,
  })
    .$default(() => new Date())
    .notNull(),
  updatedAt: timestamp('updatedAt', {
    mode: 'date',
    withTimezone: true,
  }).$onUpdate(() => new Date()),
})

export const submissionRelations = relations(submissions, ({ one, many }) => ({
  prize: one(prizes, {
    fields: [submissions.prizeId],
    references: [prizes.id],
  }),
  user: one(users, {
    fields: [submissions.username],
    references: [users.username],
  }),
}))

export type SubmissionInsert = typeof submissions.$inferInsert
