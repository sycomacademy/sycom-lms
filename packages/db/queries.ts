import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import type { Database } from "@/packages/db";
import { db } from "@/packages/db";
import { createLoggerWithContext } from "@/packages/utils/logger";
import {
  CATEGORIES,
  PUBLIC_COHORT_NAME,
  PUBLIC_ORG_NAME,
  PUBLIC_ORG_SLUG,
} from "./helper";
import { schema } from "./schema";
import type { OrganizationRole } from "./schema/auth";
import {
  category,
  cohortCourse,
  courseInstructor,
  enrollment,
  type InstructorRole,
} from "./schema/course";
import { feedback } from "./schema/feedback";
import { profile, profileSettingsDefault } from "./schema/profile";

const logger = createLoggerWithContext("db:queries");

const {
  cohort,
  cohort_member,
  member,
  organization,
  session: sessionTable,
  user,
} = schema;

/** Selected profile columns for reads/returning. */
const profileColumns = {
  id: profile.id,
  userId: profile.userId,
  bio: profile.bio,
  settings: profile.settings,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
} as const;

export async function checkHealth(database: Database = db) {
  await database.execute(sql`SELECT 1`);
  return true;
}

/**
 * Fetch public org and cohort IDs in one query. Returns null if either is missing.
 */
export async function getPublicOrgAndCohortIds(database: Database = db) {
  const [row] = await database
    .select({
      orgId: organization.id,
      cohortId: cohort.id,
    })
    .from(organization)
    .innerJoin(cohort, eq(cohort.organizationId, organization.id))
    .where(
      and(
        eq(organization.slug, PUBLIC_ORG_SLUG),
        eq(cohort.name, PUBLIC_COHORT_NAME)
      )
    )
    .limit(1);
  return row ?? null;
}

/**
 * Ensure platform org and General cohort exist. Returns their IDs for reuse.
 */
export async function ensurePublicOrg(database: Database = db) {
  const existing = await getPublicOrgAndCohortIds(database);
  if (existing) {
    logger.info(
      `Public org and cohort already exist (org: ${existing.orgId}, cohort: ${existing.cohortId})`
    );
    return existing;
  }

  const orgId = crypto.randomUUID();
  await database.insert(organization).values({
    id: orgId,
    name: PUBLIC_ORG_NAME,
    slug: PUBLIC_ORG_SLUG,
  });
  logger.info(`Created public org "${PUBLIC_ORG_NAME}" (id: ${orgId})`);

  const cohortId = crypto.randomUUID();
  await database.insert(cohort).values({
    id: cohortId,
    name: PUBLIC_COHORT_NAME,
    organizationId: orgId,
  });
  logger.info(
    `Created public cohort "${PUBLIC_COHORT_NAME}" (id: ${cohortId})`
  );
  return { orgId, cohortId };
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

/**
 * Provision a newly created user: ensure platform org/cohort exist, create
 * profile, add user as member of platform org and General cohort.
 */
export async function provisionNewUser(
  database: Database,
  params: { userId: string }
) {
  const { orgId, cohortId } = await ensurePublicOrg(database);

  await database
    .insert(profile)
    .values({
      id: crypto.randomUUID(),
      userId: params.userId,
      bio: "",
      settings: { ...profileSettingsDefault },
    })
    .onConflictDoNothing({ target: profile.userId });

  await database.insert(member).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    userId: params.userId,
    role: "org_student",
  });

  await database.insert(cohort_member).values({
    id: crypto.randomUUID(),
    teamId: cohortId,
    userId: params.userId,
  });

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
  const [sessionRow] = await database
    .select({
      userId: sessionTable.userId,
      activeOrganizationId: sessionTable.activeOrganizationId,
      activeOrgSlug: organization.slug,
    })
    .from(sessionTable)
    .leftJoin(
      organization,
      eq(organization.id, sessionTable.activeOrganizationId)
    )
    .where(eq(sessionTable.id, params.sessionId))
    .limit(1);

  if (!sessionRow) {
    return;
  }

  if (
    sessionRow.activeOrgSlug != null &&
    sessionRow.activeOrgSlug !== PUBLIC_ORG_SLUG
  ) {
    return;
  }

  const [publicIds, preferredRow] = await Promise.all([
    getPublicOrgAndCohortIds(database),
    database
      .select({ organizationId: member.organizationId })
      .from(member)
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .where(
        and(
          eq(member.userId, sessionRow.userId),
          ne(organization.slug, PUBLIC_ORG_SLUG)
        )
      )
      .orderBy(asc(member.createdAt))
      .limit(1)
      .then((rows) => rows[0] ?? null),
  ]);

  const activeOrganizationId =
    preferredRow?.organizationId ?? publicIds?.orgId ?? null;
  if (!activeOrganizationId) {
    return;
  }

  const activeCohortId = preferredRow
    ? ((
        await database
          .select({ id: cohort.id })
          .from(cohort)
          .where(eq(cohort.organizationId, preferredRow.organizationId))
          .orderBy(asc(cohort.createdAt))
          .limit(1)
      )[0]?.id ?? null)
    : (publicIds?.cohortId ?? null);

  await database
    .update(sessionTable)
    .set({
      activeOrganizationId,
      activeTeamId: activeCohortId,
    })
    .where(eq(sessionTable.id, params.sessionId));
}

export type UpdateProfileData = Partial<
  Pick<typeof profile.$inferInsert, "bio" | "settings">
>;

export async function getProfileByUserId(
  database: Database,
  params: { userId: string }
) {
  const [result] = await database
    .select(profileColumns)
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
    .returning(profileColumns);
  return updated[0] ?? null;
}

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

export async function hasCourseAccessForEditing(
  database: Database,
  params: { courseId: string; userId: string; userRole: string | null }
): Promise<{ instructorRole: InstructorRole | "admin" } | null> {
  if (params.userRole === "platform_admin") {
    return { instructorRole: "admin" };
  }

  const [row] = await database
    .select({ role: courseInstructor.role })
    .from(courseInstructor)
    .where(
      and(
        eq(courseInstructor.courseId, params.courseId),
        eq(courseInstructor.userId, params.userId)
      )
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return { instructorRole: row.role as InstructorRole };
}

export async function hasCourseAccessForLearning(
  database: Database,
  params: {
    courseId: string;
    userId: string;
    organizationId: string;
    cohortId?: string | null;
  }
): Promise<boolean> {
  const [enrolled] = await database
    .select({ id: enrollment.id })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.userId, params.userId),
        eq(enrollment.courseId, params.courseId),
        eq(enrollment.organizationId, params.organizationId)
      )
    )
    .limit(1);

  if (enrolled) {
    return true;
  }

  if (params.cohortId) {
    const [cohortRow] = await database
      .select({ id: cohort.id })
      .from(cohort)
      .where(
        and(
          eq(cohort.id, params.cohortId),
          eq(cohort.organizationId, params.organizationId)
        )
      )
      .limit(1);

    if (!cohortRow) {
      return false;
    }

    const [assigned] = await database
      .select({ courseId: cohortCourse.courseId })
      .from(cohortCourse)
      .where(
        and(
          eq(cohortCourse.cohortId, params.cohortId),
          eq(cohortCourse.courseId, params.courseId)
        )
      )
      .limit(1);

    if (assigned) {
      const [memberOf] = await database
        .select({ id: cohort_member.id })
        .from(cohort_member)
        .where(
          and(
            eq(cohort_member.teamId, params.cohortId),
            eq(cohort_member.userId, params.userId)
          )
        )
        .limit(1);
      return !!memberOf;
    }
  }

  return false;
}

// Stopped here
export async function listOrgMembers(
  database: Database,
  params: { organizationId: string }
) {
  const rows = await database
    .select({
      id: member.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: member.role,
      createdAt: member.createdAt,
    })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .where(eq(member.organizationId, params.organizationId))
    .orderBy(asc(member.createdAt));

  if (rows.length === 0) {
    return [];
  }

  const userIds = rows.map((row) => row.userId);
  const cohortRows = await database
    .select({
      userId: cohort_member.userId,
      cohortId: cohort.id,
      cohortName: cohort.name,
    })
    .from(cohort_member)
    .innerJoin(cohort, eq(cohort.id, cohort_member.teamId))
    .where(
      and(
        inArray(cohort_member.userId, userIds),
        eq(cohort.organizationId, params.organizationId)
      )
    )
    .orderBy(asc(cohort.name));

  const cohortsByUser = new Map<string, { id: string; name: string }[]>();
  for (const cohortRow of cohortRows) {
    const existing = cohortsByUser.get(cohortRow.userId) ?? [];
    existing.push({ id: cohortRow.cohortId, name: cohortRow.cohortName });
    cohortsByUser.set(cohortRow.userId, existing);
  }

  return rows.map((row) => ({
    ...row,
    cohorts: cohortsByUser.get(row.userId) ?? [],
  }));
}

export async function listOrgCohorts(
  database: Database,
  params: {
    organizationId: string;
    userId?: string;
    memberRole?: OrganizationRole | null;
  }
) {
  const { organizationId, userId, memberRole } = params;

  const canSeeAllCohorts =
    memberRole === "org_owner" ||
    memberRole === "org_admin" ||
    memberRole === "org_auditor";

  if (canSeeAllCohorts || !userId) {
    return database
      .select({
        id: cohort.id,
        name: cohort.name,
        image: cohort.image,
        organizationId: cohort.organizationId,
        createdAt: cohort.createdAt,
        memberCount:
          sql<number>`(SELECT count(*)::int FROM "auth"."cohort_member" cm WHERE cm."team_id" = ${cohort.id})`.as(
            "member_count"
          ),
        courseCount:
          sql<number>`(SELECT count(*)::int FROM "cohort_course" cc WHERE cc."cohort_id" = ${cohort.id})`.as(
            "course_count"
          ),
      })
      .from(cohort)
      .where(eq(cohort.organizationId, organizationId))
      .orderBy(asc(cohort.name));
  }

  return database
    .select({
      id: cohort.id,
      name: cohort.name,
      image: cohort.image,
      organizationId: cohort.organizationId,
      createdAt: cohort.createdAt,
      memberCount:
        sql<number>`(SELECT count(*)::int FROM "auth"."cohort_member" cm WHERE cm."team_id" = ${cohort.id})`.as(
          "member_count"
        ),
      courseCount:
        sql<number>`(SELECT count(*)::int FROM "cohort_course" cc WHERE cc."cohort_id" = ${cohort.id})`.as(
          "course_count"
        ),
    })
    .from(cohort)
    .innerJoin(
      cohort_member,
      and(eq(cohort_member.teamId, cohort.id), eq(cohort_member.userId, userId))
    )
    .where(eq(cohort.organizationId, organizationId))
    .orderBy(asc(cohort.name));
}

export async function listCohortMembers(
  database: Database,
  params: { cohortId: string }
) {
  return database
    .select({
      id: cohort_member.id,
      memberId: member.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: cohort_member.createdAt,
    })
    .from(cohort_member)
    .innerJoin(user, eq(user.id, cohort_member.userId))
    .innerJoin(cohort, eq(cohort.id, cohort_member.teamId))
    .innerJoin(
      member,
      and(
        eq(member.userId, cohort_member.userId),
        eq(member.organizationId, cohort.organizationId)
      )
    )
    .where(eq(cohort_member.teamId, params.cohortId))
    .orderBy(asc(cohort_member.createdAt));
}

export async function getOrganization(
  database: Database,
  params: { organizationId: string }
) {
  const [row] = await database
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      metadata: organization.metadata,
    })
    .from(organization)
    .where(eq(organization.id, params.organizationId))
    .limit(1);
  return row ?? null;
}
