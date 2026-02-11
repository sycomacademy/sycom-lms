import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { user } from "@/packages/db/schema/auth";
import { createdAt, updatedAt } from "@/packages/db/schema/helper";

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio").default(""),
  createdAt,
  updatedAt,
});

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));
