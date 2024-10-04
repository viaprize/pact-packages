import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { prizes } from "./prizes";
import { users } from "./users";
import { votes } from "./votes";

export const submissions = pgTable("submissions", {
  submissionHash: varchar("id", { length: 255 }).primaryKey(),
  description: text("description").notNull(),
  submitterAddress: text("submitterAddress").notNull(),
  projectLink: text("projectLink"),

  prizeId: varchar("prizeId")
    .references(() => prizes.id, {
      onDelete: "cascade",
    })
    .notNull(),
  username: varchar("username")
    .references(() => users.username, {
      onDelete: "cascade",
    })
    .notNull(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  })
    .$default(() => new Date())
    .notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdate(() => new Date()),
});

export const submissionRelations = relations(submissions, ({ one, many }) => ({
  prize: one(prizes, {
    fields: [submissions.prizeId],
    references: [prizes.id],
  }),
  user: one(users, {
    fields: [submissions.username],
    references: [users.username],
  }),
  votes: many(votes),
}));
