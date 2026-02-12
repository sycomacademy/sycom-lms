import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { user } from "@/packages/db/schema/auth";
import { createdAt, updatedAt } from "@/packages/db/schema/helper";

export const feedback = pgTable("feedback", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt,
  updatedAt,
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(user, {
    fields: [feedback.userId],
    references: [user.id],
  }),
}));
