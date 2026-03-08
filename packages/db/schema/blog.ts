import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "@/packages/db/helper";
import { user } from "@/packages/db/schema/auth";

export const BLOG_POST_STATUSES = ["draft", "published"] as const;
export type BlogPostStatus = (typeof BLOG_POST_STATUSES)[number];

export const blogPost = pgTable(
  "blog_post",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `blg_${crypto.randomUUID()}`),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: jsonb("content"),
    imageUrl: text("image_url"),
    status: text("status", { enum: BLOG_POST_STATUSES })
      .default("draft")
      .notNull(),
    publishedAt: timestamp("published_at"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("blog_post_status_idx").on(table.status),
    index("blog_post_created_by_idx").on(table.createdBy),
    index("blog_post_published_at_idx").on(table.publishedAt),
  ]
);

export const blogPostRelations = relations(blogPost, ({ one }) => ({
  creator: one(user, {
    fields: [blogPost.createdBy],
    references: [user.id],
  }),
}));
