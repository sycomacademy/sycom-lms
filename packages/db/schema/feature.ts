import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const feature = pgTable("feature", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `feat_${crypto.randomUUID()}`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
