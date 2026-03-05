import { and, eq, ne, sql } from "drizzle-orm";
import type { Database } from "@/packages/db";
import { db } from "@/packages/db";
import { createLoggerWithContext } from "@/packages/utils/logger";
import { schema } from "./schema";
import { category } from "./schema/course";
import { feedback } from "./schema/feedback";
import { profile, profileSettingsDefault } from "./schema/profile";

const logger = createLoggerWithContext("db:queries");

const CATEGORIES = [
  { name: "Cybersecurity", slug: "cybersecurity", order: 1 },
  { name: "Network Security", slug: "network-security", order: 2 },
  { name: "Cloud Computing", slug: "cloud-computing", order: 3 },
  { name: "Programming", slug: "programming", order: 4 },
  { name: "Data Science", slug: "data-science", order: 5 },
  { name: "DevOps", slug: "devops", order: 6 },
  { name: "IT Fundamentals", slug: "it-fundamentals", order: 7 },
  {
    name: "Compliance & Governance",
    slug: "compliance-governance",
    order: 8,
  },
  { name: "Web Development", slug: "web-development", order: 9 },
  { name: "Ethical Hacking", slug: "ethical-hacking", order: 10 },
  { name: "Incident Response", slug: "incident-response", order: 11 },
  { name: "Cryptography", slug: "cryptography", order: 12 },
] as const;
const {
  cohort,
  cohort_member,
  member,
  organization,
  session: sessionTable,
} = schema;
const PUBLIC_ORG_SLUG = "platform";
const PUBLIC_ORG_NAME = "Platform";
const PUBLIC_COHORT_NAME = "General";

export async function checkHealth(database: Database = db) {
  await database.execute(sql`SELECT 1`);
  return true;
}

export async function ensurePublicOrg(database: Database = db) {
  const [existing] = await database
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, PUBLIC_ORG_SLUG))
    .limit(1);

  let orgId: string;

  if (existing) {
    orgId = existing.id;
    logger.info(`Public org already exists (id: ${orgId})`);
  } else {
    orgId = crypto.randomUUID();
    await database.insert(organization).values({
      id: orgId,
      name: PUBLIC_ORG_NAME,
      slug: PUBLIC_ORG_SLUG,
    });
    logger.info(`Created public org "${PUBLIC_ORG_NAME}" (id: ${orgId})`);
  }

  const [existingCohort] = await database
    .select({ id: cohort.id })
    .from(cohort)
    .where(
      and(eq(cohort.organizationId, orgId), eq(cohort.name, PUBLIC_COHORT_NAME))
    )
    .limit(1);

  if (existingCohort) {
    logger.info(`Public cohort already exists (id: ${existingCohort.id})`);
  } else {
    const cohortId = crypto.randomUUID();
    await database.insert(cohort).values({
      id: cohortId,
      name: PUBLIC_COHORT_NAME,
      organizationId: orgId,
    });
    logger.info(
      `Created public cohort "${PUBLIC_COHORT_NAME}" (id: ${cohortId})`
    );
  }
}

export async function seedCategories(database: Database = db) {
  const rows = CATEGORIES.map((c) => ({
    name: c.name,
    slug: c.slug,
    order: c.order,
  }));
  await database.insert(category).values(rows).onConflictDoNothing();
  logger.info(`Seeded ${rows.length} categories`);
}

// ── Auth provisioning (used by auth hooks) ──

/**
 * Provision a newly created user: ensure platform org/cohort exist, create
 * profile, add user as member of platform org and General cohort.
 */
export async function provisionNewUser(
  database: Database,
  params: { userId: string }
) {
  await ensurePublicOrg(database);

  const [org] = await database
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, PUBLIC_ORG_SLUG))
    .limit(1);

  const [cohortRow] = org
    ? await database
        .select({ id: cohort.id })
        .from(cohort)
        .where(
          and(
            eq(cohort.organizationId, org.id),
            eq(cohort.name, PUBLIC_COHORT_NAME)
          )
        )
        .limit(1)
    : [];

  await database
    .insert(profile)
    .values({
      id: crypto.randomUUID(),
      userId: params.userId,
      bio: "",
      settings: { ...profileSettingsDefault },
    })
    .onConflictDoNothing({ target: profile.userId });

  if (org) {
    await database.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      userId: params.userId,
      role: "org_student",
    });
  }

  if (cohortRow) {
    await database.insert(cohort_member).values({
      id: crypto.randomUUID(),
      teamId: cohortRow.id,
      userId: params.userId,
    });
  }

  logger.info("user provisioned", { userId: params.userId });
}

/**
 * Remove all sessions for the user except the one with the given sessionId.
 * Used for single-session behaviour on sign-in.
 */
export async function deleteOtherSessionsForUser(
  database: Database,
  params: { userId: string; keepSessionId: string }
) {
  const result = await database
    .delete(sessionTable)
    .where(
      and(
        eq(sessionTable.userId, params.userId),
        ne(sessionTable.id, params.keepSessionId)
      )
    );
  return result;
}

/**
 * If the session has no active organization, set it to platform org and
 * General cohort.
 */
export async function setSessionActiveOrgIfNull(
  database: Database,
  params: { sessionId: string }
) {
  const [org] = await database
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, PUBLIC_ORG_SLUG))
    .limit(1);

  if (!org) {
    return;
  }

  const [cohortRow] = await database
    .select({ id: cohort.id })
    .from(cohort)
    .where(
      and(
        eq(cohort.organizationId, org.id),
        eq(cohort.name, PUBLIC_COHORT_NAME)
      )
    )
    .limit(1);

  await database
    .update(sessionTable)
    .set({
      activeOrganizationId: org.id,
      activeTeamId: cohortRow?.id ?? null,
    })
    .where(eq(sessionTable.id, params.sessionId));
}

// ── Profile queries ──

export type UpdateProfileData = Partial<
  Pick<typeof profile.$inferInsert, "bio" | "settings">
>;

export async function getProfileByUserId(
  database: Database,
  params: { userId: string }
) {
  const [result] = await database
    .select({
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      settings: profile.settings,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })
    .from(profile)
    .where(eq(profile.userId, params.userId));

  return result ?? null;
}

export async function updateProfileByUserId(
  database: Database,
  params: { userId: string; data: UpdateProfileData }
) {
  const updated = await database
    .update(profile)
    .set(params.data)
    .where(eq(profile.userId, params.userId))
    .returning({
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      settings: profile.settings,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  return updated[0] ?? null;
}

// ── Feedback queries ──

export async function submitFeedback(
  database: Database,
  params: { userId: string; email: string; message: string }
) {
  const result = await database.insert(feedback).values({
    email: params.email,
    userId: params.userId,
    message: params.message,
  });
  return result;
}
