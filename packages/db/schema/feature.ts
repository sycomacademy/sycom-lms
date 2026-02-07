import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const feature = pgTable("feature", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // icon name or component
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
