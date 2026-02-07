import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const fileMetadata = pgTable("file_metadata", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  pathname: text("pathname").notNull(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(), // bytes
  mimeType: text("mime_type").notNull(),
  uploadedById: text("uploaded_by_id").references(() => user.id, {
    onDelete: "set null",
  }),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
});
