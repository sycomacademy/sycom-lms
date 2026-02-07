/**
 * Seed entrypoint — run with: bun run db:seed
 *
 * Runs all seed scripts in order:
 * 1. main — instructors, courses, pathways, authors, blog posts, FAQs, features, testimonials
 * 2. lessons — CISSP and Network+ course content, quiz questions
 * 3. migrate-images — uploads public/images to Vercel Blob and updates DB (skipped if BLOB_READ_WRITE_TOKEN not set)
 *
 * All seeds are idempotent: safe to run multiple times.
 */
import "dotenv/config";
import { seedLessons } from "./lessons";
import { seedMain } from "./main";
import { migrateImagesToBlob } from "./migrate-images-to-blob";

async function seed() {
  console.log("Seeding database...\n");

  await seedMain();
  await seedLessons();

  const didMigrate = await migrateImagesToBlob();
  if (!didMigrate) {
    console.log(
      "  [migrate-images] BLOB_READ_WRITE_TOKEN not set. Skipping image migration."
    );
  }

  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
