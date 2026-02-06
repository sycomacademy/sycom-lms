import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const instructor = pgTable("instructor", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .unique()
    .references(() => user.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  credentials: jsonb("credentials").$type<string[]>().default([]),
  experience: text("experience").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
