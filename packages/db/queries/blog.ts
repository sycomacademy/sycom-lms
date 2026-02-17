import { desc, eq, ne } from "drizzle-orm";
import { db } from "@/packages/db";
import { author, blogPost } from "@/packages/db/schema/blog";

export async function getAllBlogPosts() {
  return db
    .select({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      featuredImageUrl: blogPost.featuredImageUrl,
      publishedAt: blogPost.publishedAt,
      category: blogPost.category,
      tags: blogPost.tags,
      readingTime: blogPost.readingTime,
      author: {
        id: author.id,
        name: author.name,
        bio: author.bio,
        photoUrl: author.photoUrl,
      },
    })
    .from(blogPost)
    .innerJoin(author, eq(blogPost.authorId, author.id))
    .orderBy(desc(blogPost.publishedAt));
}

export async function getBlogPostBySlug(slug: string) {
  const result = await db
    .select({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      featuredImageUrl: blogPost.featuredImageUrl,
      publishedAt: blogPost.publishedAt,
      category: blogPost.category,
      tags: blogPost.tags,
      readingTime: blogPost.readingTime,
      author: {
        id: author.id,
        name: author.name,
        bio: author.bio,
        photoUrl: author.photoUrl,
      },
    })
    .from(blogPost)
    .innerJoin(author, eq(blogPost.authorId, author.id))
    .where(eq(blogPost.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getRelatedPosts(excludePostId: string, limit = 3) {
  return db
    .select({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      featuredImageUrl: blogPost.featuredImageUrl,
      publishedAt: blogPost.publishedAt,
      category: blogPost.category,
      tags: blogPost.tags,
      readingTime: blogPost.readingTime,
      author: {
        id: author.id,
        name: author.name,
        bio: author.bio,
        photoUrl: author.photoUrl,
      },
    })
    .from(blogPost)
    .innerJoin(author, eq(blogPost.authorId, author.id))
    .where(ne(blogPost.id, excludePostId))
    .orderBy(desc(blogPost.publishedAt))
    .limit(limit);
}

export async function getAllBlogPostSlugs() {
  return db.select({ slug: blogPost.slug }).from(blogPost);
}
