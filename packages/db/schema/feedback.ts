import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../helper";
import { user } from "./auth";

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

export const report = pgTable("report", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  type: text("type", {
    enum: ["bug", "feature", "complaint", "other"],
  }).notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  status: text("status", {
    enum: ["pending", "in_progress", "resolved", "closed"],
  })
    .default("pending")
    .notNull(),
  createdAt,
  updatedAt,
});

export const reportRelations = relations(report, ({ one }) => ({
  user: one(user, {
    fields: [report.userId],
    references: [user.id],
  }),
}));
