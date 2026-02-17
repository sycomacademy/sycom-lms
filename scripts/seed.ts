#!/usr/bin/env bun
/**
 * Unified seed script with flags. No flag = seed all.
 *
 * Usage:
 *   bun run scripts/seed.ts              # seed all
 *   bun run scripts/seed.ts --categories
 *   bun run scripts/seed.ts --users
 *   bun run scripts/seed.ts --cyber
 *   bun run scripts/seed.ts --feedback
 *   bun run scripts/seed.ts --courses
 *   bun run scripts/seed.ts --unseed     # remove all seeded data
 *
 * Requires DATABASE_URL (e.g. .env).
 */

import "dotenv/config";
import { eq, inArray, or } from "drizzle-orm";
import { db } from "../packages/db";
import { user } from "../packages/db/schema/auth";
import {
  category,
  course,
  courseCategory,
  courseInstructor,
  enrollment,
  lesson,
  pathway,
  section,
} from "../packages/db/schema/course";
import { feedback } from "../packages/db/schema/feedback";
import { profile } from "../packages/db/schema/profile";
import { report } from "../packages/db/schema/report";
import { seedCybersecurityProgramme } from "./seed-cybersecurity-programme";

// ---------------------------------------------------------------------------
// Flags
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const doUnseed = argv.includes("--unseed");
const doCategories = argv.includes("--categories");
const doUsers = argv.includes("--users");
const doCyber = argv.includes("--cyber");
const doFeedback = argv.includes("--feedback");
const doCourses = argv.includes("--courses");
const doAll = !(
  doUnseed ||
  doCategories ||
  doUsers ||
  doCyber ||
  doFeedback ||
  doCourses
);

// ---------------------------------------------------------------------------
// Helpers: markdown → Plate JSON (simple blocks)
// ---------------------------------------------------------------------------

type BlockType = "h1" | "h2" | "h3" | "p" | "blockquote";

function block(
  type: BlockType,
  text: string
): { type: BlockType; children: [{ text: string }] } {
  return { type, children: [{ text }] };
}

const RE_H3 = /^###\s*/;
const RE_H2 = /^##\s*/;
const RE_H1 = /^#\s*/;
const RE_BLOCKQUOTE = /^>\s*/;
const RE_NEWLINE = /\n/g;
const RE_PARAGRAPH_SPLIT = /\n\n+/;

function markdownToPlate(md: string): unknown {
  const blocks: Array<{ type: BlockType; text: string }> = [];
  const paragraphs = md.split(RE_PARAGRAPH_SPLIT);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      continue;
    }
    if (RE_H3.test(trimmed)) {
      blocks.push({ type: "h3", text: trimmed.replace(RE_H3, "") });
    } else if (RE_H2.test(trimmed)) {
      blocks.push({ type: "h2", text: trimmed.replace(RE_H2, "") });
    } else if (RE_H1.test(trimmed)) {
      blocks.push({ type: "h1", text: trimmed.replace(RE_H1, "") });
    } else if (RE_BLOCKQUOTE.test(trimmed)) {
      blocks.push({
        type: "blockquote",
        text: trimmed.replace(RE_BLOCKQUOTE, ""),
      });
    } else {
      blocks.push({ type: "p", text: trimmed.replace(RE_NEWLINE, " ") });
    }
  }
  return blocks.length
    ? blocks.map((b) => block(b.type, b.text))
    : [block("p", md)];
}

// ---------------------------------------------------------------------------
// Fixed IDs for unseed
// ---------------------------------------------------------------------------

const SEED_CATEGORY_IDS = [
  "cat-seed-1",
  "cat-seed-2",
  "cat-seed-3",
  "cat-seed-4",
  "cat-seed-5",
  "cat-seed-6",
  "cat-seed-7",
  "cat-seed-8",
  "cat-seed-9",
  "cat-seed-10",
  "cat-seed-11",
  "cat-seed-12",
] as const;

const SEED_INSTRUCTOR_EMAILS = [
  "seed-instructor-1@example.com",
  "seed-instructor-2@example.com",
  "seed-instructor-3@example.com",
  "seed-instructor-4@example.com",
  "seed-instructor-5@example.com",
];

const SEED_STUDENT_EMAILS = [
  "seed-student-1@example.com",
  "seed-student-2@example.com",
  "seed-student-3@example.com",
  "seed-student-4@example.com",
  "seed-student-5@example.com",
  "seed-student-6@example.com",
  "seed-student-7@example.com",
  "seed-student-8@example.com",
  "seed-student-9@example.com",
  "seed-student-10@example.com",
];

const SEED_COURSE_IDS = [
  "crs-cybersecurity-programme",
  "crs-cissp",
  "crs-network",
  "crs-security-plus",
] as const;

const SEED_PATHWAY_ID = "pth-cybersecurity-programme";

// ---------------------------------------------------------------------------
// Unseed
// ---------------------------------------------------------------------------

async function unseed() {
  console.log("Unseeding...\n");

  const seedUserEmails = [...SEED_INSTRUCTOR_EMAILS, ...SEED_STUDENT_EMAILS];
  const seedUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(inArray(user.email, seedUserEmails));

  const seedUserIds = seedUsers.map((u) => u.id);
  if (seedUserIds.length > 0) {
    await db.delete(feedback).where(inArray(feedback.userId, seedUserIds));
    console.log("   Deleted feedback for seed users.");
    await db.delete(report).where(inArray(report.userId, seedUserIds));
    console.log("   Deleted reports for seed users.");
    await db.delete(profile).where(inArray(profile.userId, seedUserIds));
    console.log("   Deleted profiles for seed users.");
  }

  await db
    .delete(enrollment)
    .where(inArray(enrollment.courseId, [...SEED_COURSE_IDS]));
  console.log("   Deleted enrollments for seed courses.");

  await db.delete(course).where(inArray(course.id, [...SEED_COURSE_IDS]));
  console.log(
    "   Deleted seed courses (cascade: sections, lessons, course_instructor, course_category)."
  );

  await db.delete(pathway).where(eq(pathway.id, SEED_PATHWAY_ID));
  console.log("   Deleted seed pathway.");

  await db.delete(category).where(inArray(category.id, [...SEED_CATEGORY_IDS]));
  console.log("   Deleted seed categories.");

  for (const id of seedUserIds) {
    await db.delete(user).where(eq(user.id, id));
  }
  console.log(`   Deleted ${seedUserIds.length} seed users.`);

  console.log("\nUnseed complete.");
}

// ---------------------------------------------------------------------------
// Seed: categories
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { id: "cat-seed-1", name: "Cybersecurity", slug: "cybersecurity", order: 1 },
  {
    id: "cat-seed-2",
    name: "Network Security",
    slug: "network-security",
    order: 2,
  },
  {
    id: "cat-seed-3",
    name: "Cloud Computing",
    slug: "cloud-computing",
    order: 3,
  },
  { id: "cat-seed-4", name: "Programming", slug: "programming", order: 4 },
  { id: "cat-seed-5", name: "Data Science", slug: "data-science", order: 5 },
  { id: "cat-seed-6", name: "DevOps", slug: "devops", order: 6 },
  {
    id: "cat-seed-7",
    name: "IT Fundamentals",
    slug: "it-fundamentals",
    order: 7,
  },
  {
    id: "cat-seed-8",
    name: "Compliance & Governance",
    slug: "compliance-governance",
    order: 8,
  },
  {
    id: "cat-seed-9",
    name: "Web Development",
    slug: "web-development",
    order: 9,
  },
  {
    id: "cat-seed-10",
    name: "Ethical Hacking",
    slug: "ethical-hacking",
    order: 10,
  },
  {
    id: "cat-seed-11",
    name: "Incident Response",
    slug: "incident-response",
    order: 11,
  },
  { id: "cat-seed-12", name: "Cryptography", slug: "cryptography", order: 12 },
];

async function seedCategories() {
  console.log("  [categories] Seeding...");
  await db.insert(category).values(CATEGORIES).onConflictDoNothing();
  console.log("  [categories] Done.");
}

// ---------------------------------------------------------------------------
// Seed: 5 instructors, 10 students, profiles
// ---------------------------------------------------------------------------

async function seedUsers(): Promise<string[]> {
  console.log("  [users] Seeding 5 instructors and 10 students...");
  const now = new Date();
  const instructorIds: string[] = [];
  const studentIds: string[] = [];

  for (let i = 0; i < SEED_INSTRUCTOR_EMAILS.length; i++) {
    const id = `seed-inst-${i + 1}`;
    instructorIds.push(id);
    await db
      .insert(user)
      .values({
        id,
        name: `Seed Instructor ${i + 1}`,
        email: SEED_INSTRUCTOR_EMAILS[i],
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
        role: "instructor",
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .onConflictDoNothing();
  }

  for (let i = 0; i < SEED_STUDENT_EMAILS.length; i++) {
    const id = `seed-stu-${i + 1}`;
    studentIds.push(id);
    await db
      .insert(user)
      .values({
        id,
        name: `Seed Student ${i + 1}`,
        email: SEED_STUDENT_EMAILS[i],
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
        role: "student",
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .onConflictDoNothing();
  }

  for (const id of [...instructorIds, ...studentIds]) {
    await db
      .insert(profile)
      .values({
        id: `profile-${id}`,
        userId: id,
        bio: "",
      })
      .onConflictDoNothing();
  }

  console.log("  [users] Done.");
  return [...instructorIds, ...studentIds];
}

// ---------------------------------------------------------------------------
// Seed: feedback and reports
// ---------------------------------------------------------------------------

async function seedFeedbackAndReports(userIds: string[]) {
  if (userIds.length === 0) {
    return;
  }
  console.log("  [feedback/reports] Seeding...");

  const sampleUserIds = userIds.slice(0, 7);
  const messages = [
    "The course content is clear and well structured.",
    "Would love more practice exercises.",
    "Great instructor, very responsive.",
    "Suggested improvement: add downloadable slides.",
    "Video quality could be better in lesson 4.",
  ];
  const reportSubjects = [
    "Login redirects to wrong page",
    "Feature request: dark mode",
    "Video playback fails on Safari",
    "Broken link in week 2 materials",
    "Bug: notifications not received",
  ];

  for (let i = 0; i < 5; i++) {
    const uid = sampleUserIds[i % sampleUserIds.length];
    const u = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, uid))
      .limit(1);
    const email = u[0]?.email ?? "seed@example.com";
    await db.insert(feedback).values({
      userId: uid,
      email,
      message: messages[i],
    });
  }

  const reportTypes = ["bug", "feature", "complaint", "other"] as const;
  const statuses = ["pending", "in_progress", "resolved", "closed"] as const;
  for (let i = 0; i < 8; i++) {
    const uid = sampleUserIds[i % sampleUserIds.length];
    const u = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, uid))
      .limit(1);
    const email = u[0]?.email ?? "seed@example.com";
    await db.insert(report).values({
      userId: uid,
      email,
      type: reportTypes[i % reportTypes.length],
      subject: reportSubjects[i % reportSubjects.length],
      description: "Steps to reproduce: 1. Go to dashboard 2. Click...",
      status: statuses[i % statuses.length],
    });
  }

  console.log("  [feedback/reports] Done.");
}

// ---------------------------------------------------------------------------
// Seed: CISSP and Network+ courses (owned by seeded instructors)
// ---------------------------------------------------------------------------

async function seedCisspAndNetwork(instructorIds: string[]) {
  if (instructorIds.length < 2) {
    console.log("  [courses] Skip: need at least 2 instructors.");
    return;
  }

  console.log("  [courses] Seeding CISSP and Network+...");

  const content = await import("./seed-content");
  const cisspCreatorId = instructorIds[0];
  const networkCreatorId = instructorIds[1];

  await db
    .insert(course)
    .values({
      id: "crs-cissp",
      title: "CISSP Masterclass",
      description:
        "Advance your cybersecurity career with the most prestigious certification in information security. Covers all eight domains of the CISSP Common Body of Knowledge.",
      slug: "cissp-masterclass",
      difficulty: "advanced",
      status: "published",
      estimatedDuration: 4800,
      createdBy: cisspCreatorId,
    })
    .onConflictDoNothing();

  await db
    .insert(courseInstructor)
    .values({
      courseId: "crs-cissp",
      userId: cisspCreatorId,
      role: "main",
      addedBy: cisspCreatorId,
    })
    .onConflictDoNothing();

  const cisspSections = [
    { id: "sec-cissp-1", title: "Security and Risk Management", order: 1 },
    { id: "sec-cissp-2", title: "Asset Security", order: 2 },
  ];
  for (const sec of cisspSections) {
    await db
      .insert(section)
      .values({
        id: sec.id,
        courseId: "crs-cissp",
        title: sec.title,
        order: sec.order,
      })
      .onConflictDoNothing();
  }

  const cisspLessons = [
    {
      id: "lsn-cissp-1",
      sectionId: "sec-cissp-1",
      title: "Welcome to CISSP",
      order: 1,
      md: content.cisspWelcomeContent,
    },
    {
      id: "lsn-cissp-2",
      sectionId: "sec-cissp-1",
      title: "CIA Triad Overview",
      order: 2,
      md: content.cisspCiaTriadContent,
    },
    {
      id: "lsn-cissp-3",
      sectionId: "sec-cissp-1",
      title: "Risk Assessment Fundamentals",
      order: 3,
      md: content.cisspRiskContent,
    },
    {
      id: "lsn-cissp-4",
      sectionId: "sec-cissp-1",
      title: "Risk Management Quiz",
      order: 4,
      md: content.cisspRiskQuizContent,
      type: "quiz" as const,
    },
    {
      id: "lsn-cissp-5",
      sectionId: "sec-cissp-2",
      title: "Data Classification Levels",
      order: 1,
      md: content.cisspDataClassContent,
    },
    {
      id: "lsn-cissp-6",
      sectionId: "sec-cissp-2",
      title: "Handling Sensitive Data",
      order: 2,
      md: content.cisspHandlingDataContent,
    },
    {
      id: "lsn-cissp-7",
      sectionId: "sec-cissp-2",
      title: "Data Lifecycle Management",
      order: 3,
      md: content.cisspDataLifecycleContent,
    },
    {
      id: "lsn-cissp-8",
      sectionId: "sec-cissp-2",
      title: "Asset Security Quiz",
      order: 4,
      md: content.cisspAssetQuizContent,
      type: "quiz" as const,
    },
  ];
  for (const lec of cisspLessons) {
    await db
      .insert(lesson)
      .values({
        id: lec.id,
        sectionId: lec.sectionId,
        title: lec.title,
        order: lec.order,
        type: lec.type ?? "text",
        estimatedDuration: 10,
        content: markdownToPlate(lec.md) as object,
      })
      .onConflictDoNothing();
  }

  await db
    .insert(course)
    .values({
      id: "crs-network",
      title: "CompTIA Network+",
      description:
        "Learn networking fundamentals and prepare for the CompTIA Network+ certification. This course covers network architecture, operations, security, troubleshooting, and industry standards and practices.",
      slug: "comptia-network-plus",
      difficulty: "beginner",
      status: "published",
      estimatedDuration: 2100,
      createdBy: networkCreatorId,
    })
    .onConflictDoNothing();

  // CompTIA Security+ (same creator as CISSP)
  await db
    .insert(course)
    .values({
      id: "crs-security-plus",
      title: "CompTIA Security+",
      description:
        "Master the fundamentals of cybersecurity and prepare for the CompTIA Security+ certification exam. This comprehensive course covers all domains tested on the exam, including threats, attacks, and vulnerabilities, architecture and design, implementation, operations and incident response, and governance, risk, and compliance.",
      slug: "comptia-security-plus",
      difficulty: "beginner",
      status: "published",
      estimatedDuration: 3600,
      createdBy: cisspCreatorId,
    })
    .onConflictDoNothing();

  await db
    .insert(courseInstructor)
    .values({
      courseId: "crs-security-plus",
      userId: cisspCreatorId,
      role: "main",
      addedBy: cisspCreatorId,
    })
    .onConflictDoNothing();

  const secPlusSections = [
    { id: "sec-secplus-1", title: "Security Fundamentals", order: 1 },
  ];
  for (const sec of secPlusSections) {
    await db
      .insert(section)
      .values({
        id: sec.id,
        courseId: "crs-security-plus",
        title: sec.title,
        order: sec.order,
      })
      .onConflictDoNothing();
  }

  const secPlusLessons = [
    {
      id: "lsn-secplus-1",
      sectionId: "sec-secplus-1",
      title: "Welcome to Security+",
      order: 1,
      md: content.securityPlusWelcomeContent,
    },
  ];
  for (const lec of secPlusLessons) {
    await db
      .insert(lesson)
      .values({
        id: lec.id,
        sectionId: lec.sectionId,
        title: lec.title,
        order: lec.order,
        type: "text",
        estimatedDuration: 10,
        content: markdownToPlate(lec.md) as object,
      })
      .onConflictDoNothing();
  }

  await db
    .insert(courseInstructor)
    .values({
      courseId: "crs-network",
      userId: networkCreatorId,
      role: "main",
      addedBy: networkCreatorId,
    })
    .onConflictDoNothing();

  const netSections = [
    { id: "sec-net-1", title: "Networking Fundamentals", order: 1 },
    { id: "sec-net-2", title: "Network Implementation", order: 2 },
  ];
  for (const sec of netSections) {
    await db
      .insert(section)
      .values({
        id: sec.id,
        courseId: "crs-network",
        title: sec.title,
        order: sec.order,
      })
      .onConflictDoNothing();
  }

  const netLessons = [
    {
      id: "lsn-net-1",
      sectionId: "sec-net-1",
      title: "The OSI Model",
      order: 1,
      md: content.networkOsiContent,
    },
    {
      id: "lsn-net-2",
      sectionId: "sec-net-1",
      title: "TCP/IP Model",
      order: 2,
      md: content.networkTcpIpContent,
    },
    {
      id: "lsn-net-3",
      sectionId: "sec-net-1",
      title: "Network Models Quiz",
      order: 3,
      md: content.networkModelsQuizContent,
      type: "quiz" as const,
    },
    {
      id: "lsn-net-4",
      sectionId: "sec-net-1",
      title: "IPv4 Addressing",
      order: 4,
      md: content.networkIpv4Content,
    },
    {
      id: "lsn-net-5",
      sectionId: "sec-net-1",
      title: "Subnetting Basics",
      order: 5,
      md: content.networkSubnettingContent,
    },
    {
      id: "lsn-net-6",
      sectionId: "sec-net-2",
      title: "How Routers Work",
      order: 1,
      md: content.networkRoutersContent,
    },
    {
      id: "lsn-net-7",
      sectionId: "sec-net-2",
      title: "VLANs and Trunking",
      order: 2,
      md: content.networkVlansContent,
    },
    {
      id: "lsn-net-8",
      sectionId: "sec-net-2",
      title: "Wi-Fi Standards",
      order: 3,
      md: content.networkWifiContent,
    },
    {
      id: "lsn-net-9",
      sectionId: "sec-net-2",
      title: "Network+ Review Quiz",
      order: 4,
      md: content.networkReviewQuizContent,
      type: "quiz" as const,
    },
  ];
  for (const lec of netLessons) {
    await db
      .insert(lesson)
      .values({
        id: lec.id,
        sectionId: lec.sectionId,
        title: lec.title,
        order: lec.order,
        type: lec.type ?? "text",
        estimatedDuration: 10,
        content: markdownToPlate(lec.md) as object,
      })
      .onConflictDoNothing();
  }

  const cyberCat = await db
    .select()
    .from(category)
    .where(eq(category.slug, "cybersecurity"))
    .limit(1);
  const netCat = await db
    .select()
    .from(category)
    .where(eq(category.slug, "network-security"))
    .limit(1);
  if (cyberCat[0]) {
    await db
      .insert(courseCategory)
      .values({ courseId: "crs-cissp", categoryId: cyberCat[0].id })
      .onConflictDoNothing();
    await db
      .insert(courseCategory)
      .values({ courseId: "crs-security-plus", categoryId: cyberCat[0].id })
      .onConflictDoNothing();
  }
  if (netCat[0]) {
    await db
      .insert(courseCategory)
      .values({ courseId: "crs-network", categoryId: netCat[0].id })
      .onConflictDoNothing();
  }

  console.log("  [courses] Done.");
}

// ---------------------------------------------------------------------------
// Seed: enrollments (each student in at least one course)
// ---------------------------------------------------------------------------

async function seedEnrollments(studentIds: string[]) {
  if (studentIds.length === 0) {
    return;
  }
  console.log("  [enrollments] Enrolling students in at least one course...");

  const courseIds = [...SEED_COURSE_IDS];
  for (let i = 0; i < studentIds.length; i++) {
    const courseId = courseIds[i % courseIds.length];
    await db
      .insert(enrollment)
      .values({
        userId: studentIds[i],
        courseId,
      })
      .onConflictDoNothing();
  }
  console.log("  [enrollments] Done.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (doUnseed) {
    await unseed();
    return;
  }

  console.log("Seeding...\n");

  let instructorIds: string[] = [];
  let studentIds: string[] = [];
  let allUserIds: string[] = [];

  if (doAll || doUsers) {
    allUserIds = await seedUsers();
    instructorIds = allUserIds.slice(0, 5);
    studentIds = allUserIds.slice(5, 15);
  } else if (doCyber || doFeedback || doCourses) {
    const seedUsersList = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(
        or(
          inArray(user.email, SEED_INSTRUCTOR_EMAILS),
          inArray(user.email, SEED_STUDENT_EMAILS)
        )
      );
    instructorIds = seedUsersList
      .filter((u) => u.role === "instructor")
      .map((u) => u.id);
    studentIds = seedUsersList
      .filter((u) => u.role === "student")
      .map((u) => u.id);
    allUserIds = seedUsersList.map((u) => u.id);
  }

  if (doAll || doCategories) {
    await seedCategories();
  }
  if (doAll || doCyber) {
    await seedCybersecurityProgramme();
  }
  if (doAll || doFeedback) {
    await seedFeedbackAndReports(allUserIds);
  }
  if (doAll || doCourses) {
    await seedCisspAndNetwork(instructorIds);
  }
  if (doAll || doUsers) {
    await seedEnrollments(studentIds);
  }

  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
