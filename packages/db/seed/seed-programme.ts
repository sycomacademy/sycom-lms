#!/usr/bin/env bun
/**
 * Programme seed: example orgs, people, courses, cohorts, enrollments, and progress.
 *
 * Creates a test dataset for:
 * - Org switching and org-scoped dashboards
 * - People management, cohorts, course assignment
 * - Enrollments, lesson progress
 *
 * Idempotent: uses fixed IDs and onConflictDoNothing.
 *
 * Usage:
 *   bun run example/seed-programme.ts
 *
 * Requires: DATABASE_URL (e.g. .env), and db:seed or manual run of ensurePublicOrg + seedCategories first.
 *
 * Sign-in: Seed users have no password. Use "Forgot password" with their email to set one,
 * or create users via Admin > Users.
 */

import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import {
  cohort,
  cohort_member,
  member,
  organization,
  user,
} from "../../db/schema/auth";
import {
  category,
  cohortCourse,
  course,
  courseCategory,
  courseInstructor,
  enrollment,
  lesson,
  lessonCompletion,
  section,
} from "../../db/schema/course";
import { profile } from "../../db/schema/profile";

// ---------------------------------------------------------------------------
// Fixed IDs (idempotent runs)
// ---------------------------------------------------------------------------

const ORG_IDS = {
  acme: "org-seed-acme",
  techcorp: "org-seed-techcorp",
} as const;

const USER_IDS = {
  admin: "usr-seed-admin",
  creator: "usr-seed-creator",
  alice: "usr-seed-alice",
  bob: "usr-seed-bob",
  carol: "usr-seed-carol",
  dave: "usr-seed-dave",
  eve: "usr-seed-eve",
} as const;

const COHORT_IDS = {
  acmeGeneral: "coh-seed-acme-general",
  acmeAdvanced: "coh-seed-acme-advanced",
  techcorpGeneral: "coh-seed-techcorp-general",
} as const;

const COURSE_IDS = {
  introSecurity: "crs-seed-intro-security",
  networkBasics: "crs-seed-network-basics",
  webSecurity: "crs-seed-web-security",
} as const;

// ---------------------------------------------------------------------------
// Plate-compatible content
// ---------------------------------------------------------------------------

type BlockType = "h1" | "h2" | "p";

function block(
  type: BlockType,
  text: string
): { type: BlockType; children: [{ text: string }] } {
  return { type, children: [{ text }] };
}

function toPlateValue(
  blocks: Array<{ type: BlockType; text: string }>
): unknown {
  return blocks.map((b) => block(b.type, b.text));
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const USERS = [
  {
    id: USER_IDS.admin,
    name: "Alex Admin",
    email: "admin@seed.example.com",
    role: "platform_admin" as const,
  },
  {
    id: USER_IDS.creator,
    name: "Chris Creator",
    email: "creator@seed.example.com",
    role: "content_creator" as const,
  },
  {
    id: USER_IDS.alice,
    name: "Alice Student",
    email: "alice@seed.example.com",
    role: "platform_student" as const,
  },
  {
    id: USER_IDS.bob,
    name: "Bob Student",
    email: "bob@seed.example.com",
    role: "platform_student" as const,
  },
  {
    id: USER_IDS.carol,
    name: "Carol Teacher",
    email: "carol@seed.example.com",
    role: "platform_student" as const,
  },
  {
    id: USER_IDS.dave,
    name: "Dave Student",
    email: "dave@seed.example.com",
    role: "platform_student" as const,
  },
  {
    id: USER_IDS.eve,
    name: "Eve Student",
    email: "eve@seed.example.com",
    role: "platform_student" as const,
  },
];

const ORGS = [
  {
    id: ORG_IDS.acme,
    name: "Acme Security Academy",
    slug: "acme-security",
  },
  {
    id: ORG_IDS.techcorp,
    name: "TechCorp Training",
    slug: "techcorp-training",
  },
];

const COURSES = [
  {
    id: COURSE_IDS.introSecurity,
    title: "Introduction to Cybersecurity",
    slug: "intro-cybersecurity-seed",
    description:
      "Foundational concepts: threat landscape, defense in depth, CIA triad.",
    sections: [
      {
        id: "sec-intro-1",
        title: "Security fundamentals",
        order: 1,
        lessons: [
          {
            id: "lsn-intro-1-1",
            title: "What is cybersecurity?",
            content: toPlateValue([
              { type: "h1", text: "What is Cybersecurity?" },
              {
                type: "p",
                text: "Cybersecurity protects systems, networks, and data from digital attacks.",
              },
              {
                type: "h2",
                text: "The CIA Triad",
              },
              {
                type: "p",
                text: "Confidentiality, Integrity, and Availability form the foundation of security.",
              },
            ]),
          },
          {
            id: "lsn-intro-1-2",
            title: "Threat modeling basics",
            content: toPlateValue([
              { type: "h1", text: "Threat Modeling Basics" },
              {
                type: "p",
                text: "Identify assets, threats, vulnerabilities, and controls.",
              },
            ]),
          },
        ],
      },
    ],
  },
  {
    id: COURSE_IDS.networkBasics,
    title: "Network Security Essentials",
    slug: "network-essentials-seed",
    description: "Firewalls, VPNs, and secure network design.",
    sections: [
      {
        id: "sec-net-1",
        title: "Networking fundamentals",
        order: 1,
        lessons: [
          {
            id: "lsn-net-1-1",
            title: "TCP/IP and the OSI model",
            content: toPlateValue([
              { type: "h1", text: "TCP/IP and OSI Model" },
              {
                type: "p",
                text: "Understanding layers helps you secure each boundary.",
              },
            ]),
          },
        ],
      },
    ],
  },
  {
    id: COURSE_IDS.webSecurity,
    title: "Web Application Security",
    slug: "web-security-seed",
    description: "OWASP Top 10, input validation, session management.",
    sections: [
      {
        id: "sec-web-1",
        title: "OWASP Top 10",
        order: 1,
        lessons: [
          {
            id: "lsn-web-1-1",
            title: "Injection attacks",
            content: toPlateValue([
              { type: "h1", text: "Injection Attacks" },
              {
                type: "p",
                text: "SQL injection, command injection, and how to defend with parameterized queries.",
              },
            ]),
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

export async function seedProgramme() {
  // 1. Ensure public org and categories exist
  const { ensurePublicOrg, seedCategories } = await import("../../db/queries");
  await ensurePublicOrg(db);
  await seedCategories(db);

  // 2. Users (platform roles: platform_admin, content_creator, platform_student)
  console.log("  [programme] Seeding users...");
  for (const u of USERS) {
    await db
      .insert(user)
      .values({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
        image: null,
        role: u.role,
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .onConflictDoNothing({ target: user.id });

    await db
      .insert(profile)
      .values({
        id: `prf-${u.id}`,
        userId: u.id,
        bio: "",
      })
      .onConflictDoNothing({ target: profile.userId });
  }

  // 3. Organizations
  console.log("  [programme] Seeding organizations...");
  for (const o of ORGS) {
    await db
      .insert(organization)
      .values({
        id: o.id,
        name: o.name,
        slug: o.slug,
      })
      .onConflictDoNothing({ target: organization.id });
  }

  // Platform org and cohort (for dashboard access)
  const [platformOrg] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, "platform"))
    .limit(1);
  const [platformCohort] = platformOrg
    ? await db
        .select({ id: cohort.id })
        .from(cohort)
        .where(
          and(
            eq(cohort.organizationId, platformOrg.id),
            eq(cohort.name, "General")
          )
        )
        .limit(1)
    : [];

  if (platformOrg && platformCohort) {
    for (const u of USERS) {
      await db
        .insert(member)
        .values({
          id: `mem-platform-${u.id}`,
          organizationId: platformOrg.id,
          userId: u.id,
          role: "org_student",
        })
        .onConflictDoNothing({ target: member.id });
      await db
        .insert(cohort_member)
        .values({
          id: `cm-platform-${u.id}`,
          teamId: platformCohort.id,
          userId: u.id,
        })
        .onConflictDoNothing({ target: cohort_member.id });
    }
  }

  // 4. Members and org roles
  // Acme: admin=owner, creator=admin, alice=teacher, bob/dave=student
  // TechCorp: creator=owner, carol=teacher, eve=student
  const MEMBERS = [
    { orgId: ORG_IDS.acme, userId: USER_IDS.admin, role: "org_owner" as const },
    {
      orgId: ORG_IDS.acme,
      userId: USER_IDS.creator,
      role: "org_admin" as const,
    },
    {
      orgId: ORG_IDS.acme,
      userId: USER_IDS.alice,
      role: "org_teacher" as const,
    },
    { orgId: ORG_IDS.acme, userId: USER_IDS.bob, role: "org_student" as const },
    {
      orgId: ORG_IDS.acme,
      userId: USER_IDS.dave,
      role: "org_student" as const,
    },
    {
      orgId: ORG_IDS.techcorp,
      userId: USER_IDS.creator,
      role: "org_owner" as const,
    },
    {
      orgId: ORG_IDS.techcorp,
      userId: USER_IDS.carol,
      role: "org_teacher" as const,
    },
    {
      orgId: ORG_IDS.techcorp,
      userId: USER_IDS.eve,
      role: "org_student" as const,
    },
  ];

  console.log("  [programme] Seeding members...");
  for (const m of MEMBERS) {
    await db
      .insert(member)
      .values({
        id: `mem-${m.orgId}-${m.userId}`,
        organizationId: m.orgId,
        userId: m.userId,
        role: m.role,
      })
      .onConflictDoNothing({ target: member.id });
  }

  // 5. Cohorts
  const COHORTS = [
    {
      id: COHORT_IDS.acmeGeneral,
      orgId: ORG_IDS.acme,
      name: "General",
    },
    {
      id: COHORT_IDS.acmeAdvanced,
      orgId: ORG_IDS.acme,
      name: "Advanced Track",
    },
    {
      id: COHORT_IDS.techcorpGeneral,
      orgId: ORG_IDS.techcorp,
      name: "General",
    },
  ];

  console.log("  [programme] Seeding cohorts...");
  for (const c of COHORTS) {
    await db
      .insert(cohort)
      .values({
        id: c.id,
        name: c.name,
        organizationId: c.orgId,
      })
      .onConflictDoNothing({ target: cohort.id });
  }

  // 6. Cohort members
  const COHORT_MEMBERS = [
    { cohortId: COHORT_IDS.acmeGeneral, userId: USER_IDS.alice },
    { cohortId: COHORT_IDS.acmeGeneral, userId: USER_IDS.bob },
    { cohortId: COHORT_IDS.acmeGeneral, userId: USER_IDS.dave },
    { cohortId: COHORT_IDS.acmeAdvanced, userId: USER_IDS.alice },
    { cohortId: COHORT_IDS.techcorpGeneral, userId: USER_IDS.carol },
    { cohortId: COHORT_IDS.techcorpGeneral, userId: USER_IDS.eve },
  ];

  console.log("  [programme] Seeding cohort members...");
  for (const cm of COHORT_MEMBERS) {
    await db
      .insert(cohort_member)
      .values({
        id: `cm-${cm.cohortId}-${cm.userId}`,
        teamId: cm.cohortId,
        userId: cm.userId,
      })
      .onConflictDoNothing({ target: cohort_member.id });
  }

  // 7. Courses (creator as createdBy)
  const [cyberCat] = await db
    .select({ id: category.id })
    .from(category)
    .where(eq(category.slug, "cybersecurity"))
    .limit(1);

  const categoryId = cyberCat?.id;
  if (!categoryId) {
    throw new Error("Category 'cybersecurity' not found. Run db:seed first.");
  }

  console.log("  [programme] Seeding courses, sections, lessons...");
  for (const c of COURSES) {
    await db
      .insert(course)
      .values({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        difficulty: "beginner",
        status: "published",
        estimatedDuration: 60,
        createdBy: USER_IDS.creator,
      })
      .onConflictDoNothing();

    await db
      .insert(courseInstructor)
      .values({
        courseId: c.id,
        userId: USER_IDS.creator,
        role: "main",
        addedBy: USER_IDS.creator,
      })
      .onConflictDoNothing();

    await db
      .insert(courseCategory)
      .values({ courseId: c.id, categoryId })
      .onConflictDoNothing();

    for (const sec of c.sections) {
      await db
        .insert(section)
        .values({
          id: sec.id,
          courseId: c.id,
          title: sec.title,
          order: sec.order,
        })
        .onConflictDoNothing();

      for (let i = 0; i < sec.lessons.length; i++) {
        const lec = sec.lessons[i];
        await db
          .insert(lesson)
          .values({
            id: lec.id,
            sectionId: sec.id,
            title: lec.title,
            order: i + 1,
            type: "text",
            estimatedDuration: 5,
            content: lec.content,
          })
          .onConflictDoNothing();
      }
    }
  }

  // 8. Assign courses to cohorts
  const ASSIGNMENTS = [
    { cohortId: COHORT_IDS.acmeGeneral, courseId: COURSE_IDS.introSecurity },
    { cohortId: COHORT_IDS.acmeGeneral, courseId: COURSE_IDS.networkBasics },
    { cohortId: COHORT_IDS.acmeAdvanced, courseId: COURSE_IDS.webSecurity },
    {
      cohortId: COHORT_IDS.techcorpGeneral,
      courseId: COURSE_IDS.introSecurity,
    },
  ];

  console.log("  [programme] Assigning courses to cohorts...");
  for (const a of ASSIGNMENTS) {
    await db
      .insert(cohortCourse)
      .values({ cohortId: a.cohortId, courseId: a.courseId })
      .onConflictDoNothing();
  }

  // 9. Enrollments and progress (alice, bob, eve)
  const ENROLLMENTS = [
    {
      userId: USER_IDS.alice,
      courseId: COURSE_IDS.introSecurity,
      organizationId: ORG_IDS.acme,
    },
    {
      userId: USER_IDS.bob,
      courseId: COURSE_IDS.introSecurity,
      organizationId: ORG_IDS.acme,
    },
    {
      userId: USER_IDS.eve,
      courseId: COURSE_IDS.introSecurity,
      organizationId: ORG_IDS.techcorp,
    },
  ];

  console.log("  [programme] Seeding enrollments and lesson completions...");
  for (const e of ENROLLMENTS) {
    await db
      .insert(enrollment)
      .values({
        id: `enr-${e.userId}-${e.courseId}-${e.organizationId}`,
        userId: e.userId,
        courseId: e.courseId,
        organizationId: e.organizationId,
      })
      .onConflictDoNothing({
        target: [
          enrollment.userId,
          enrollment.courseId,
          enrollment.organizationId,
        ],
      });
  }

  // Alice completed first lesson of intro
  const introCourse = COURSES.find((c) => c.id === COURSE_IDS.introSecurity);
  const firstLesson = introCourse?.sections[0]?.lessons[0];
  if (firstLesson) {
    await db
      .insert(lessonCompletion)
      .values({
        id: `lcp-alice-${firstLesson.id}`,
        userId: USER_IDS.alice,
        lessonId: firstLesson.id,
        organizationId: ORG_IDS.acme,
      })
      .onConflictDoNothing({
        target: [
          lessonCompletion.userId,
          lessonCompletion.lessonId,
          lessonCompletion.organizationId,
        ],
      });
  }

  console.log("  [programme] Done.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    "Seeding programme (orgs, people, courses, cohorts, progress)...\n"
  );
  await seedProgramme();
  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
