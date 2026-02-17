import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const author = pgTable("author", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `aut_${crypto.randomUUID()}`),
  name: text("name").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const blogPost = pgTable("blog_post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `blg_${crypto.randomUUID()}`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => author.id, { onDelete: "cascade" }),
  featuredImageUrl: text("featured_image_url"),
  publishedAt: timestamp("published_at").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  readingTime: integer("reading_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
