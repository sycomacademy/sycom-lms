#!/usr/bin/env bun
/**
 * Delete all seeded users (from scripts/seed-users-feedback-reports.ts).
 *
 * Matches users by email pattern: seed-*@example.com
 *
 * Usage:
 *   bun run scripts/delete-seeded-users.ts
 *   bun run scripts/delete-seeded-users.ts --dry-run  # Preview without deleting
 *
 * Requires DATABASE_URL in env (e.g. .env or dotenv).
 */

import "dotenv/config";
import { like } from "drizzle-orm";
import { db } from "../../db";
import { user } from "../../db/schema/auth";

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  console.log("🗑️  Delete seeded users...");
  console.log(isDryRun ? "   (DRY RUN - no rows will be deleted)\n" : "\n");

  const seedPattern = "seed-%@example.com";
  const seededUsers = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(like(user.email, seedPattern));

  if (seededUsers.length === 0) {
    console.log(
      "   No seeded users found (email LIKE 'seed-%@example.com').\n"
    );
    return;
  }

  console.log(`   Found ${seededUsers.length} seeded user(s):`);
  for (const u of seededUsers.slice(0, 5)) {
    console.log(`   - ${u.email} (${u.name})`);
  }
  if (seededUsers.length > 5) {
    console.log(`   ... and ${seededUsers.length - 5} more`);
  }
  console.log("");

  if (isDryRun) {
    console.log(
      "   DRY RUN: Would delete the above users. Run without --dry-run to delete."
    );
    return;
  }

  await db.delete(user).where(like(user.email, seedPattern));
  console.log(`   ✅ Deleted ${seededUsers.length} seeded user(s).`);
}

main().catch((err) => {
  console.error("❌ Delete failed:", err);
  process.exit(1);
});
