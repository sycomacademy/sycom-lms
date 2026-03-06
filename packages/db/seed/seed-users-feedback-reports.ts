#!/usr/bin/env bun
/**
 * Seed script: 55 users (mix of verified, banned, unverified), 5 feedback from 10 users, 15 reports from 7 users.
 *
 * Usage:
 *   bun run scripts/seed-users-feedback-reports.ts
 *
 * Requires DATABASE_URL in env (e.g. .env or dotenv).
 */

import "dotenv/config";
import { db } from "../../db";
import { user } from "../../db/schema/auth";
import { feedback, report } from "../../db/schema/feedback";

const TOTAL_USERS = 55;
const VERIFIED_COUNT = 30;
const BANNED_COUNT = 10;
const UNVERIFIED_COUNT = 15; // 30 + 10 + 15 = 55

const FEEDBACK_COUNT = 5;
const FEEDBACK_USER_POOL_SIZE = 10;

const REPORT_COUNT = 15;
const REPORT_USER_POOL_SIZE = 7;

const REPORT_TYPES = ["bug", "feature", "complaint", "other"] as const;
const REPORT_STATUSES = [
  "pending",
  "in_progress",
  "resolved",
  "closed",
] as const;

function randomId(): string {
  return crypto.randomUUID();
}

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FEEDBACK_MESSAGES = [
  "The course content is clear and well structured.",
  "Would love more practice exercises at the end of each module.",
  "Video quality could be better in lesson 4.",
  "Great instructor, very responsive in the Q&A.",
  "Suggested improvement: add downloadable slides.",
];

const REPORT_SUBJECTS = [
  "Login redirects to wrong page",
  "Feature request: dark mode",
  "Assignment deadline not showing",
  "Video playback fails on Safari",
  "Request: export progress as PDF",
  "Broken link in week 2 materials",
  "Complaint about grading delay",
  "Bug: notifications not received",
  "Suggestion: add keyboard shortcuts",
  "Error when submitting quiz",
  "Other: accessibility feedback",
  "Certificate download fails",
  "Profile picture upload error",
  "Discussion thread not loading",
  "Missing subtitles on video",
];

const REPORT_DESCRIPTIONS = [
  "Steps to reproduce: 1. Go to dashboard 2. Click...",
  "Expected: X. Actual: Y. Browser: Chrome.",
  "Happens every time after the latest update.",
  "Only on mobile. Desktop is fine.",
  "Please consider adding this feature for power users.",
];

async function main() {
  console.log("🌱 Seeding users, feedback, and reports...\n");

  const now = new Date();
  const userRows: (typeof user.$inferInsert)[] = [];

  // Build 55 users: verified, banned, unverified
  for (let i = 1; i <= TOTAL_USERS; i++) {
    const id = randomId();
    const name = `Seed User ${i}`;
    const email = `seed-${i}-${Date.now()}@example.com`; // unique per run

    let emailVerified: boolean;
    let banned: boolean;
    let banReason: string | null = null;
    let banExpires: Date | null = null;

    if (i <= VERIFIED_COUNT) {
      emailVerified = true;
      banned = false;
    } else if (i <= VERIFIED_COUNT + BANNED_COUNT) {
      emailVerified = Math.random() > 0.3; // some banned had verified email
      banned = true;
      banReason = "Seed data: banned for testing.";
      if (i % 2 === 0) {
        banExpires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
    } else {
      emailVerified = false;
      banned = false;
    }

    let role: "platform_admin" | "content_creator" | "platform_student" =
      "platform_student";
    if (i === 1) {
      role = "platform_admin";
    } else if (i <= 4) {
      role = "content_creator";
    }

    userRows.push({
      id,
      name,
      email,
      emailVerified,
      image: null,
      createdAt: now,
      updatedAt: now,
      role,
      banned,
      banReason,
      banExpires,
    });
  }

  await db.insert(user).values(userRows);
  console.log(
    `   ✅ Inserted ${TOTAL_USERS} users (${VERIFIED_COUNT} verified, ${BANNED_COUNT} banned, ${UNVERIFIED_COUNT} unverified email).`
  );

  const userIds = userRows.map((u) => u.id);

  // 5 feedback from 10 users
  const feedbackUserIds = pick(userIds, FEEDBACK_USER_POOL_SIZE);
  const feedbackRows = Array.from({ length: FEEDBACK_COUNT }, (_, i) => {
    const uid = feedbackUserIds[i % feedbackUserIds.length];
    const u = userRows.find((r) => r.id === uid);
    if (!u) {
      throw new Error("User not found for feedback");
    }
    return {
      id: randomId(),
      userId: uid,
      email: u.email,
      message: FEEDBACK_MESSAGES[i % FEEDBACK_MESSAGES.length],
      createdAt: now,
      updatedAt: now,
    };
  });
  await db.insert(feedback).values(feedbackRows);
  console.log(
    `   ✅ Inserted ${FEEDBACK_COUNT} feedback from ${FEEDBACK_USER_POOL_SIZE} users.`
  );

  // 15 reports from 7 users
  const reportUserIds = pick(userIds, REPORT_USER_POOL_SIZE);
  const reportRows = Array.from({ length: REPORT_COUNT }, (_, i) => {
    const uid = reportUserIds[i % reportUserIds.length];
    const u = userRows.find((r) => r.id === uid);
    if (!u) {
      throw new Error("User not found for report");
    }
    return {
      id: randomId(),
      userId: uid,
      email: u.email,
      type: randomItem(REPORT_TYPES),
      subject: REPORT_SUBJECTS[i % REPORT_SUBJECTS.length],
      description: randomItem(REPORT_DESCRIPTIONS),
      imageUrl: null,
      status: randomItem(REPORT_STATUSES),
      createdAt: now,
      updatedAt: now,
    };
  });
  await db.insert(report).values(reportRows);
  console.log(
    `   ✅ Inserted ${REPORT_COUNT} reports from ${REPORT_USER_POOL_SIZE} users.`
  );

  console.log("\n✅ Seed complete.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
