import { and, asc, eq, ne, sql } from "drizzle-orm";
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
import {
  category,
  cohortCourse,
  courseInstructor,
  enrollment,
  type InstructorRole,
} from "./schema/course";
import { feedback, report } from "./schema/feedback";
import { profile, profileSettingsDefault } from "./schema/profile";

const logger = createLoggerWithContext("db:queries");

const {
  cohort,
  cohort_member,
  member,
  organization,
  session: sessionTable,
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

  await database
    .insert(member)
    .values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: params.userId,
      role: "org_student",
    })
    .onConflictDoNothing();

  await database
    .insert(cohort_member)
    .values({
      id: crypto.randomUUID(),
      teamId: cohortId,
      userId: params.userId,
    })
    .onConflictDoNothing();

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
      .select({
        organizationId: member.organizationId,
        cohortId: cohort.id,
      })
      .from(member)
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .leftJoin(cohort, eq(cohort.organizationId, member.organizationId))
      .where(
        and(
          eq(member.userId, sessionRow.userId),
          ne(organization.slug, PUBLIC_ORG_SLUG)
        )
      )
      .orderBy(asc(member.createdAt), asc(cohort.createdAt))
      .limit(1)
      .then((rows) => rows[0] ?? null),
  ]);

  const activeOrganizationId =
    preferredRow?.organizationId ?? publicIds?.orgId ?? null;
  if (!activeOrganizationId) {
    return;
  }

  const activeCohortId = preferredRow?.cohortId ?? publicIds?.cohortId ?? null;

  await database
    .update(sessionTable)
    .set({
      activeOrganizationId,
      activeTeamId: activeCohortId,
    })
    .where(eq(sessionTable.id, params.sessionId));
}

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
  params: { userId: string; data: Partial<typeof profile.$inferInsert> }
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

export async function submitReport(
  database: Database,
  params: {
    userId: string;
    email: string;
    type: "bug" | "feature" | "complaint" | "other";
    subject: string;
    description: string;
    imageUrl?: string | null;
  }
) {
  await database.insert(report).values({
    userId: params.userId,
    email: params.email,
    type: params.type,
    subject: params.subject,
    description: params.description,
    imageUrl: params.imageUrl ?? null,
  });
  return { success: true };
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
  const context = await getCourseLearningAccessContext(database, params);
  return context.hasAccess;
}

export async function getCourseLearningAccessContext(
  database: Database,
  params: {
    courseId: string;
    userId: string;
    organizationId: string;
    cohortId?: string | null;
  }
) {
  if (!params.cohortId) {
    const [enrolled] = await database
      .select({
        enrollmentId: enrollment.id,
        cohortId: enrollment.cohortId,
      })
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, params.userId),
          eq(enrollment.courseId, params.courseId),
          eq(enrollment.organizationId, params.organizationId)
        )
      )
      .orderBy(asc(enrollment.enrolledAt))
      .limit(1);

    return {
      hasAccess: !!enrolled,
      accessType: enrolled ? ("enrollment" as const) : null,
      enrollmentId: enrolled?.enrollmentId ?? null,
      cohortId: enrolled?.cohortId ?? null,
      cohortExists: null,
      isCohortMember: null,
      isAssignedToCohort: null,
    };
  }

  const [row] = await database
    .select({
      cohortId: cohort.id,
      enrollmentId: enrollment.id,
      cohortMemberId: cohort_member.id,
      assignedCourseId: cohortCourse.courseId,
    })
    .from(cohort)
    .leftJoin(
      enrollment,
      and(
        eq(enrollment.cohortId, cohort.id),
        eq(enrollment.userId, params.userId),
        eq(enrollment.courseId, params.courseId),
        eq(enrollment.organizationId, params.organizationId)
      )
    )
    .leftJoin(
      cohort_member,
      and(
        eq(cohort_member.teamId, cohort.id),
        eq(cohort_member.userId, params.userId)
      )
    )
    .leftJoin(
      cohortCourse,
      and(
        eq(cohortCourse.cohortId, cohort.id),
        eq(cohortCourse.courseId, params.courseId)
      )
    )
    .where(
      and(
        eq(cohort.id, params.cohortId),
        eq(cohort.organizationId, params.organizationId)
      )
    )
    .limit(1);

  const hasEnrollment = !!row?.enrollmentId;
  const hasDerivedCohortAccess =
    !!row?.cohortMemberId && !!row?.assignedCourseId;
  let accessType: "enrollment" | "cohort_assignment" | null = null;

  if (hasEnrollment) {
    accessType = "enrollment";
  } else if (hasDerivedCohortAccess) {
    accessType = "cohort_assignment";
  }

  return {
    hasAccess: hasEnrollment || hasDerivedCohortAccess,
    accessType,
    enrollmentId: row?.enrollmentId ?? null,
    cohortId: row?.cohortId ?? null,
    cohortExists: !!row,
    isCohortMember: !!row?.cohortMemberId,
    isAssignedToCohort: !!row?.assignedCourseId,
  };
}

export async function requireCourseEnrollmentForLearning(
  database: Database,
  params: {
    courseId: string;
    userId: string;
    organizationId: string;
    cohortId?: string | null;
  }
) {
  const context = await getCourseLearningAccessContext(database, params);

  if (!context.hasAccess) {
    return null;
  }

  if (!context.enrollmentId) {
    throw new Error(
      context.cohortId
        ? "You have access to this cohort course, but you are not enrolled in it yet."
        : "You have course access, but no enrollment could be resolved for progress tracking."
    );
  }

  return context;
}

export async function canEnrollInCohortCourse(
  database: Database,
  params: {
    courseId: string;
    userId: string;
    organizationId: string;
    cohortId: string;
  }
) {
  const context = await getCourseLearningAccessContext(database, params);

  if (!context.cohortExists) {
    return {
      canEnroll: false,
      reason: "cohort_not_found" as const,
      context,
    };
  }

  if (!context.isAssignedToCohort) {
    return {
      canEnroll: false,
      reason: "course_not_assigned_to_cohort" as const,
      context,
    };
  }

  if (!context.isCohortMember) {
    return {
      canEnroll: false,
      reason: "user_not_in_cohort" as const,
      context,
    };
  }

  if (context.enrollmentId) {
    return {
      canEnroll: false,
      reason: "already_enrolled_in_cohort_course" as const,
      context,
    };
  }

  return {
    canEnroll: true,
    reason: "ok" as const,
    context,
  };
}
