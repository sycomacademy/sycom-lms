#!/usr/bin/env bun
/**
 * Cleanup Unused Blob Storage
 *
 * This script removes files from Vercel Blob storage that are no longer
 * referenced in the database. Run this periodically (e.g., every 3 months)
 * to free up storage space.
 *
 * Usage:
 *   bun run scripts/cleanup-unused-blobs.ts
 *   bun run scripts/cleanup-unused-blobs.ts --dry-run  # Preview without deleting
 *
 * What it cleans:
 *   1. Report images not referenced in any report's imageUrl
 *   2. Files with soft-deleted records (deletedAt is set)
 *   3. Expired upload sessions and their associated incomplete uploads
 */

import "dotenv/config";
import { del } from "@vercel/blob";
import { and, eq, isNotNull, isNull, lt, notInArray, sql } from "drizzle-orm";
import { db } from "../packages/db";
import { files, uploadSessions } from "../packages/db/schema/files";
import { report } from "../packages/db/schema/report";

interface CleanupStats {
  orphanedReportImages: number;
  softDeletedFiles: number;
  expiredSessions: number;
  totalBytesFreed: number;
  errors: string[];
}

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  console.log("🧹 Starting blob storage cleanup...");
  console.log(isDryRun ? "   (DRY RUN - no files will be deleted)\n" : "\n");

  const stats: CleanupStats = {
    orphanedReportImages: 0,
    softDeletedFiles: 0,
    expiredSessions: 0,
    totalBytesFreed: 0,
    errors: [],
  };

  // 1. Clean up orphaned report images
  await cleanupOrphanedReportImages(stats);

  // 2. Clean up soft-deleted files
  await cleanupSoftDeletedFiles(stats);

  // 3. Clean up expired upload sessions
  await cleanupExpiredSessions(stats);

  // Print summary
  console.log(`\n${"=".repeat(50)}`);
  console.log("📊 Cleanup Summary");
  console.log("=".repeat(50));
  console.log(`   Orphaned report images: ${stats.orphanedReportImages}`);
  console.log(`   Soft-deleted files:     ${stats.softDeletedFiles}`);
  console.log(`   Expired sessions:       ${stats.expiredSessions}`);
  console.log(
    `   Total space freed:      ${formatBytes(stats.totalBytesFreed)}`
  );

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors (${stats.errors.length}):`);
    for (const error of stats.errors) {
      console.log(`   - ${error}`);
    }
  }

  if (isDryRun) {
    console.log(
      "\n💡 This was a dry run. Run without --dry-run to delete files."
    );
  }

  console.log("\n✅ Cleanup complete!");
}

/**
 * Clean up report images that are no longer referenced
 */
async function cleanupOrphanedReportImages(stats: CleanupStats) {
  console.log("1️⃣  Finding orphaned report images...");

  // Get all report image URLs that are currently in use
  const activeReportImages = await db
    .select({ imageUrl: report.imageUrl })
    .from(report)
    .where(isNotNull(report.imageUrl));

  const activeUrls = new Set(
    activeReportImages.map((r) => r.imageUrl).filter(Boolean)
  );

  // Find files with entityType = "report" that are not in use
  const orphanedFiles = await db
    .select()
    .from(files)
    .where(
      and(
        eq(files.entityType, "report"),
        isNull(files.deletedAt),
        activeUrls.size > 0
          ? notInArray(files.url, [...activeUrls] as string[])
          : sql`true`
      )
    );

  // If no active URLs, all report files are orphaned
  const filesToDelete =
    activeUrls.size === 0
      ? await db
          .select()
          .from(files)
          .where(and(eq(files.entityType, "report"), isNull(files.deletedAt)))
      : orphanedFiles;

  console.log(`   Found ${filesToDelete.length} orphaned report images`);

  for (const file of filesToDelete) {
    try {
      if (!isDryRun) {
        // Delete from blob storage
        await del(file.url);

        // Delete from database
        await db.delete(files).where(eq(files.id, file.id));
      }

      stats.orphanedReportImages++;
      stats.totalBytesFreed += file.size;
      console.log(
        `   ${isDryRun ? "[DRY RUN] Would delete" : "Deleted"}: ${file.filename} (${formatBytes(file.size)})`
      );
    } catch (error) {
      const message = `Failed to delete ${file.filename}: ${error instanceof Error ? error.message : "Unknown error"}`;
      stats.errors.push(message);
      console.error(`   ❌ ${message}`);
    }
  }
}

/**
 * Clean up files that have been soft-deleted
 */
async function cleanupSoftDeletedFiles(stats: CleanupStats) {
  console.log("\n2️⃣  Finding soft-deleted files...");

  // Find files where deletedAt is set (older than 30 days for safety)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const softDeletedFiles = await db
    .select()
    .from(files)
    .where(and(isNotNull(files.deletedAt), lt(files.deletedAt, thirtyDaysAgo)));

  console.log(
    `   Found ${softDeletedFiles.length} soft-deleted files (>30 days old)`
  );

  for (const file of softDeletedFiles) {
    try {
      if (!isDryRun) {
        // Delete from blob storage
        await del(file.url);

        // Hard delete from database
        await db.delete(files).where(eq(files.id, file.id));
      }

      stats.softDeletedFiles++;
      stats.totalBytesFreed += file.size;
      console.log(
        `   ${isDryRun ? "[DRY RUN] Would delete" : "Deleted"}: ${file.filename} (${formatBytes(file.size)})`
      );
    } catch (error) {
      const message = `Failed to delete ${file.filename}: ${error instanceof Error ? error.message : "Unknown error"}`;
      stats.errors.push(message);
      console.error(`   ❌ ${message}`);
    }
  }
}

/**
 * Clean up expired upload sessions and any associated incomplete uploads
 */
async function cleanupExpiredSessions(stats: CleanupStats) {
  console.log("\n3️⃣  Finding expired upload sessions...");

  const now = new Date();

  // Find expired sessions that are still pending (upload never completed)
  const expiredSessions = await db
    .select()
    .from(uploadSessions)
    .where(
      and(
        lt(uploadSessions.expiresAt, now),
        eq(uploadSessions.status, "pending")
      )
    );

  console.log(`   Found ${expiredSessions.length} expired upload sessions`);

  for (const session of expiredSessions) {
    try {
      // Try to delete any partially uploaded file from blob storage
      // The storageKey tells us where the file would have been uploaded
      const blobUrl = `https://${process.env.BLOB_READ_WRITE_TOKEN?.split("_")[0]}.public.blob.vercel-storage.com/${session.storageKey}`;

      if (!isDryRun) {
        try {
          await del(blobUrl);
        } catch {
          // File may not exist if upload never started, that's OK
        }

        // Delete the session record
        await db
          .delete(uploadSessions)
          .where(eq(uploadSessions.id, session.id));
      }

      stats.expiredSessions++;
      console.log(
        `   ${isDryRun ? "[DRY RUN] Would delete" : "Deleted"}: session ${session.id} (${session.filename})`
      );
    } catch (error) {
      const message = `Failed to clean session ${session.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
      stats.errors.push(message);
      console.error(`   ❌ ${message}`);
    }
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

// Run the script
main().catch((error) => {
  console.error("❌ Cleanup failed:", error);
  process.exit(1);
});
