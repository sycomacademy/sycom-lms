# Migrating from Mock Data to Real Data

This document describes how to replace the static mock data in `lib/mock-data.ts` with real data from the database.

## Overview

The landing page and blog currently use hardcoded mock data from `lib/mock-data.ts`. To make this content dynamic, you need to:

1. Create database tables for the content types
2. Create query functions
3. Seed the database
4. Update the components to fetch from the database

---

## Step 1: Create Database Tables

Add the following schema files in `packages/db/schema/`. After creating each file, export it from `packages/db/schema/index.ts`.

### Blog Posts — `packages/db/schema/blog.ts`

```ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const blogPost = pgTable("blog_post", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  readTime: text("read_time"),
  authorId: uuid("author_id").references(() => user.id),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role"),
  authorAvatarUrl: text("author_avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Testimonials — `packages/db/schema/testimonial.ts`

```ts
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const testimonial = pgTable("testimonial", {
  id: uuid("id").defaultRandom().primaryKey(),
  quote: text("quote").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  avatarUrl: text("avatar_url"),
  rating: integer("rating").default(5).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### FAQs — `packages/db/schema/faq.ts`

```ts
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const faq = pgTable("faq", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Features — `packages/db/schema/feature.ts`

```ts
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const feature = pgTable("feature", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Stats — `packages/db/schema/stat.ts`

```ts
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const stat = pgTable("stat", {
  id: uuid("id").defaultRandom().primaryKey(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

---

## Step 2: Generate and Apply Migrations

```bash
bun run db:generate
bun run db:migrate
```

---

## Step 3: Create Query Functions

Create query functions in `packages/db/queries/` for each content type. Example for blog posts:

```ts
// packages/db/queries/blog.ts
import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { blogPost } from "../schema/blog";

export async function getAllBlogPosts() {
  return db.select().from(blogPost).orderBy(desc(blogPost.publishedAt));
}

export async function getBlogPostBySlug(slug: string) {
  const [post] = await db.select().from(blogPost).where(eq(blogPost.slug, slug)).limit(1);
  return post ?? null;
}

export async function getLatestBlogPosts(limit = 3) {
  return db.select().from(blogPost).orderBy(desc(blogPost.publishedAt)).limit(limit);
}
```

Create similar functions for testimonials, FAQs, features, and stats.

---

## Step 4: Create a Seed Script

Create `packages/db/seed/seed-landing.ts` to populate the database. Import from `lib/mock-data.ts` and insert into the database:

```ts
import { db } from "../client";
import { blogPost } from "../schema/blog";
import { testimonial } from "../schema/testimonial";
import { faq } from "../schema/faq";
import { feature } from "../schema/feature";
import { stat } from "../schema/stat";
import {
  mockBlogPosts,
  mockTestimonials,
  mockFaqs,
  mockFeatures,
  mockStats,
} from "../../lib/mock-data";

async function seedLanding() {
  // Seed blog posts
  for (const post of mockBlogPosts) {
    await db.insert(blogPost).values({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl,
      publishedAt: new Date(post.publishedAt),
      readTime: post.readTime,
      authorName: post.author.name,
      authorRole: post.author.role,
      authorAvatarUrl: post.author.avatarUrl,
    }).onConflictDoNothing();
  }

  // Similar for testimonials, faqs, features, stats...
  // Use .onConflictDoNothing() for idempotency
}

seedLanding();
```

Run: `bun run packages/db/seed/seed-landing.ts`

---

## Step 5: Update Components

Replace mock data imports with database queries. Example for the blog section:

**Before:**
```tsx
import { mockBlogPosts } from "@/lib/mock-data";
// used directly in component
```

**After:**
```tsx
import { getLatestBlogPosts } from "@/packages/db/queries/blog";

export async function BlogSection() {
  const latestPosts = await getLatestBlogPosts(3);
  // use latestPosts in JSX
}
```

For client components that currently import mock data, convert them to accept data as props from a parent server component, or use tRPC queries.

---

## Step 6: Upload Real Images

Replace placeholder image URLs with actual images:

1. Upload images to Cloudinary using the existing media asset system
2. Update the database records with the Cloudinary URLs
3. Update components to use `<Image>` from `next/image` with the Cloudinary URLs

---

## Step 7: Clean Up

Once all components fetch from the database:

1. Remove `lib/mock-data.ts` (or keep as reference/fallback)
2. Remove this `seed.md` file
3. Update any tests that reference mock data

---

## Course Data

Courses already have a database table (`course` in `packages/db/schema/course.ts`). The landing page course section should query from the existing `course` table instead of mock data. Use the existing query functions in `packages/db/queries/` or create a `getFeaturedCourses()` function.

---

## Content Type → Table Mapping

| Mock Data Type | New DB Table | Existing Table? |
|---|---|---|
| `mockCourses` | — | Yes: `course` table already exists |
| `mockBlogPosts` | `blog_post` | No — create new |
| `mockTestimonials` | `testimonial` | No — create new |
| `mockFaqs` | `faq` | No — create new |
| `mockFeatures` | `feature` | No — create new |
| `mockStats` | `stat` | No — create new |
| `mockSteps` | — | Keep hardcoded (static UI content) |
| `partnerLogos` | — | Keep hardcoded (static UI content) |
