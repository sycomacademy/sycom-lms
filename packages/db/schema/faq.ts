import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const faq = pgTable("faq", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `faq_${crypto.randomUUID()}`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
