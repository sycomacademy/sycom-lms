#!/usr/bin/env bun
/**
 * Seed script: inserts course categories.
 *
 * Usage:
 *   bun run scripts/seed-categories.ts
 *
 * Requires DATABASE_URL in env (e.g. .env or dotenv).
 */

import "dotenv/config";
import { db } from "../../db";
import { category } from "../../db/schema/course";

const CATEGORIES = [
  { name: "Cybersecurity", slug: "cybersecurity", order: 1 },
  { name: "Network Security", slug: "network-security", order: 2 },
  { name: "Cloud Computing", slug: "cloud-computing", order: 3 },
  { name: "Programming", slug: "programming", order: 4 },
  { name: "Data Science", slug: "data-science", order: 5 },
  { name: "DevOps", slug: "devops", order: 6 },
  { name: "IT Fundamentals", slug: "it-fundamentals", order: 7 },
  { name: "Compliance & Governance", slug: "compliance-governance", order: 8 },
  { name: "Web Development", slug: "web-development", order: 9 },
  { name: "Ethical Hacking", slug: "ethical-hacking", order: 10 },
  { name: "Incident Response", slug: "incident-response", order: 11 },
  { name: "Cryptography", slug: "cryptography", order: 12 },
] as const;

async function main() {
  console.log("Seeding categories...\n");

  const rows = CATEGORIES.map((c) => ({
    name: c.name,
    slug: c.slug,
    order: c.order,
  }));

  await db.insert(category).values(rows).onConflictDoNothing();

  console.log(`   Inserted ${rows.length} categories.`);
  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
