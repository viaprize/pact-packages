import { relations } from 'drizzle-orm'
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { nanoid } from 'nanoid'
import { insertUserSchema, users } from './users'
export const activities = pgTable('activities', {
  id: varchar('id')
    .$default(() => nanoid(10))
    .primaryKey(),
  username: varchar('username')
    .references(() => users.username, {
      onDelete: 'cascade',
    })
    .notNull(),
  activity: text('activity').notNull(),
  link: text('link'),
  tag: text('tag').notNull().default('PRIZE'),
  createdAt: timestamp('createdAt', {
    mode: 'date',
    withTimezone: true,
  })
    .$default(() => new Date())
    .notNull(),
})
export const insertActivitySchema = createInsertSchema(activities)
export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.username],
    references: [users.username],
  }),
}))
