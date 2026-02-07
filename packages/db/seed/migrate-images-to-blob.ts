/**
 * Migrate public images to Vercel Blob and update DB rows.
 *
 * Requires: DATABASE_URL, BLOB_READ_WRITE_TOKEN (e.g. from .env.local)
 *
 * 1. Uploads every file under public/images/ to Vercel Blob (path: images/...).
 * 2. Updates instructor, course, author, blog_post, testimonial rows where
 *    photo_url / thumbnail_url / featured_image_url match a migrated path.
 *
 * Idempotent: re-uploads overwrite blob; updates only rows that still have
 * the old public path (already-migrated rows are unchanged).
 */
import "dotenv/config";
import { config } from "dotenv";

config({ path: ".env.local" });

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { uploadFile } from "@/packages/storage/upload";
import { author, blogPost } from "../schema/blog";
import { course } from "../schema/course";
import { instructor } from "../schema/instructor";
import { testimonial } from "../schema/testimonial";

const DATABASE_URL = process.env.DATABASE_URL;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const PUBLIC_IMAGES_DIR = join(process.cwd(), "public", "images");

/** Collect relative paths under dir (e.g. "avatar.png", "instructors/james.jpg"). */
async function listImagePaths(
  dir: string,
  baseDir: string,
  prefix = ""
): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const acc: string[] = [];
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) {
      acc.push(...(await listImagePaths(join(dir, e.name), baseDir, rel)));
    } else {
      acc.push(rel);
    }
  }
  return acc;
}

export async function migrateImagesToBlob(): Promise<boolean> {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!BLOB_TOKEN) {
    return false;
  }

  const sql = neon(DATABASE_URL);
  const db = drizzle(sql);

  console.log("  [migrate-images] Migrating public/images to Vercel Blob...");

  const relativePaths = await listImagePaths(
    PUBLIC_IMAGES_DIR,
    PUBLIC_IMAGES_DIR
  );
  if (relativePaths.length === 0) {
    console.log("  [migrate-images] No files under public/images. Skipping.");
    return true;
  }

  const pathToBlobUrl: Record<string, string> = {};
  for (const rel of relativePaths) {
    const fullPath = join(PUBLIC_IMAGES_DIR, rel);
    const buf = await readFile(fullPath);
    const arrayBuffer = buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength
    );
    const { url } = await uploadFile(rel, arrayBuffer, {
      pathPrefix: "images",
    });
    const oldPublicPath = `/images/${rel}`;
    pathToBlobUrl[oldPublicPath] = url;
  }

  let updated = 0;
  for (const [oldPath, newUrl] of Object.entries(pathToBlobUrl)) {
    const r1 = await db
      .update(instructor)
      .set({ photoUrl: newUrl })
      .where(eq(instructor.photoUrl, oldPath));
    if (Number(r1.rowCount) > 0) {
      updated += Number(r1.rowCount);
    }

    const r2 = await db
      .update(course)
      .set({ thumbnailUrl: newUrl })
      .where(eq(course.thumbnailUrl, oldPath));
    if (Number(r2.rowCount) > 0) {
      updated += Number(r2.rowCount);
    }

    const r3 = await db
      .update(author)
      .set({ photoUrl: newUrl })
      .where(eq(author.photoUrl, oldPath));
    if (Number(r3.rowCount) > 0) {
      updated += Number(r3.rowCount);
    }

    const r4 = await db
      .update(blogPost)
      .set({ featuredImageUrl: newUrl })
      .where(eq(blogPost.featuredImageUrl, oldPath));
    if (Number(r4.rowCount) > 0) {
      updated += Number(r4.rowCount);
    }

    const r5 = await db
      .update(testimonial)
      .set({ photoUrl: newUrl })
      .where(eq(testimonial.photoUrl, oldPath));
    if (Number(r5.rowCount) > 0) {
      updated += Number(r5.rowCount);
    }
  }

  console.log(`  [migrate-images] Updated ${updated} row(s).`);
  return true;
}
