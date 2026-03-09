import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  max,
  ne,
  or,
  sql,
} from "drizzle-orm";
import type { Database } from "@/packages/db";
import { db } from "@/packages/db";
import { createLoggerWithContext } from "@/packages/utils/logger";
import {
  CATEGORIES,
  NotFoundError,
  PUBLIC_COHORT_NAME,
  PUBLIC_ORG_NAME,
  PUBLIC_ORG_SLUG,
} from "./helper";
import { schema } from "./schema";
import type { OrganizationRole, UserRole } from "./schema/auth";
import { type BlogPostStatus, blogPost } from "./schema/blog";
import {
  type CourseStatus,
  category,
  course,
  courseCategory,
  courseInstructor,
  type DifficultyLevel,
  type InstructorRole,
  lesson,
  section,
} from "./schema/course";
import {
  cohortLessonSettings,
  cohortSectionSettings,
  courseAssignment,
  type EnrollmentSource,
  type EnrollmentStatus,
  enrollment,
  lessonProgress,
} from "./schema/enrollment";
import { feedback, report } from "./schema/feedback";
import { profile, profileSettingsDefault } from "./schema/profile";
import { publicInvite } from "./schema/public-invite";

const logger = createLoggerWithContext("db:queries");

function normalizedLessonType() {
  return sql<
    "article" | "test"
  >`CASE WHEN ${lesson.type} = 'text' THEN 'article' ELSE ${lesson.type} END`;
}

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

  const publicIds = await getPublicOrgAndCohortIds(database);

  // Temporarily disable preferred non-public org selection.
  // const preferredRow = await database
  //   .select({
  //     organizationId: member.organizationId,
  //     cohortId: cohort.id,
  //   })
  //   .from(member)
  //   .innerJoin(organization, eq(organization.id, member.organizationId))
  //   .leftJoin(cohort, eq(cohort.organizationId, member.organizationId))
  //   .where(
  //     and(
  //       eq(member.userId, sessionRow.userId),
  //       ne(organization.slug, PUBLIC_ORG_SLUG)
  //     )
  //   )
  //   .orderBy(asc(member.createdAt), asc(cohort.createdAt))
  //   .limit(1)
  //   .then((rows) => rows[0] ?? null);

  const activeOrganizationId = publicIds?.orgId ?? null;
  if (!activeOrganizationId) {
    return;
  }

  const activeCohortId = publicIds?.cohortId ?? null;

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

export async function claimWelcomeEmailSend(
  database: Database,
  params: { userId: string }
) {
  const [userRow] = await database
    .select({
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      settings: profile.settings,
    })
    .from(user)
    .innerJoin(profile, eq(profile.userId, user.id))
    .where(eq(user.id, params.userId))
    .limit(1);

  if (!userRow?.emailVerified) {
    return null;
  }

  const currentSettings = {
    ...profileSettingsDefault,
    ...(userRow.settings ?? {}),
  };

  if (
    currentSettings.welcomeEmailSent === true ||
    currentSettings.marketingEmails === false
  ) {
    return null;
  }

  const updated = await database
    .update(profile)
    .set({
      settings: {
        ...currentSettings,
        welcomeEmailSent: true,
      },
    })
    .where(
      and(
        eq(profile.userId, params.userId),
        sql`coalesce(${profile.settings} ->> 'welcomeEmailSent', 'false') <> 'true'`
      )
    )
    .returning({ userId: profile.userId });

  if (!updated[0]) {
    return null;
  }

  return {
    email: userRow.email,
    name: userRow.name,
    userId: params.userId,
  };
}

export async function unsubscribeUserFromMarketingEmails(
  database: Database,
  params: { userId: string }
) {
  const [row] = await database
    .select({ settings: profile.settings })
    .from(profile)
    .where(eq(profile.userId, params.userId))
    .limit(1);

  if (!row) {
    return null;
  }

  const nextSettings = {
    ...profileSettingsDefault,
    ...(row.settings ?? {}),
    marketingEmails: false,
  };

  const [updated] = await database
    .update(profile)
    .set({ settings: nextSettings })
    .where(eq(profile.userId, params.userId))
    .returning(profileColumns);

  return updated ?? null;
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

export async function hasBlogAccessForEditing(
  database: Database,
  params: { postId: string; userId: string; userRole: string | null }
): Promise<{ accessRole: "owner" | "admin" } | null> {
  if (params.userRole === "platform_admin") {
    return { accessRole: "admin" };
  }

  const [row] = await database
    .select({ id: blogPost.id })
    .from(blogPost)
    .where(
      and(eq(blogPost.id, params.postId), eq(blogPost.createdBy, params.userId))
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return { accessRole: "owner" };
}

export async function listPublicBlogPosts(
  database: Database,
  params: { limit: number; offset: number }
) {
  const rows = await database
    .select({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      imageUrl: blogPost.imageUrl,
      publishedAt: blogPost.publishedAt,
      updatedAt: blogPost.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
      },
      _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
    })
    .from(blogPost)
    .innerJoin(user, eq(user.id, blogPost.createdBy))
    .where(eq(blogPost.status, "published"))
    .orderBy(desc(blogPost.publishedAt), desc(blogPost.updatedAt))
    .limit(params.limit)
    .offset(params.offset);

  const total = rows[0]?._total ?? 0;
  const posts = rows.map(({ _total, ...rest }) => rest);

  return { posts, total };
}

export async function getPublicBlogPostBySlug(
  database: Database,
  params: { slug: string }
) {
  const [post] = await database
    .select({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      imageUrl: blogPost.imageUrl,
      status: blogPost.status,
      publishedAt: blogPost.publishedAt,
      updatedAt: blogPost.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    })
    .from(blogPost)
    .innerJoin(user, eq(user.id, blogPost.createdBy))
    .where(
      and(eq(blogPost.slug, params.slug), eq(blogPost.status, "published"))
    )
    .limit(1);

  if (!post) {
    return null;
  }

  const relatedPosts = await database
    .select({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      imageUrl: blogPost.imageUrl,
      publishedAt: blogPost.publishedAt,
    })
    .from(blogPost)
    .where(and(eq(blogPost.status, "published"), ne(blogPost.id, post.id)))
    .orderBy(desc(blogPost.publishedAt), desc(blogPost.updatedAt))
    .limit(2);

  return { ...post, relatedPosts };
}

export async function listInstructorBlogPosts(
  database: Database,
  params: {
    limit: number;
    offset: number;
    search?: string;
    sortBy: "title" | "createdAt" | "updatedAt" | "publishedAt" | "status";
    sortDirection: "asc" | "desc";
    filterStatuses?: BlogPostStatus[];
    userId: string;
    isAdmin: boolean;
  }
) {
  const conditions: Parameters<typeof and>[0][] = [];

  if (!params.isAdmin) {
    conditions.push(eq(blogPost.createdBy, params.userId));
  }

  if (params.filterStatuses?.length) {
    conditions.push(inArray(blogPost.status, params.filterStatuses));
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(blogPost.title, `%${params.search}%`),
        ilike(blogPost.excerpt, `%${params.search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const ORDER_COLUMNS = {
    title: blogPost.title,
    createdAt: blogPost.createdAt,
    updatedAt: blogPost.updatedAt,
    publishedAt: blogPost.publishedAt,
    status: blogPost.status,
  } as const;

  const orderColumn = ORDER_COLUMNS[params.sortBy];
  const orderBy =
    params.sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);

  const rows = await database
    .select({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      imageUrl: blogPost.imageUrl,
      status: blogPost.status,
      publishedAt: blogPost.publishedAt,
      createdBy: blogPost.createdBy,
      createdAt: blogPost.createdAt,
      updatedAt: blogPost.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
      _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
    })
    .from(blogPost)
    .innerJoin(user, eq(user.id, blogPost.createdBy))
    .where(where)
    .orderBy(orderBy, desc(blogPost.updatedAt))
    .limit(params.limit)
    .offset(params.offset);

  const total = rows[0]?._total ?? 0;
  const posts = rows.map(({ _total, ...rest }) => rest);

  return { posts, total };
}

export async function getBlogPostById(
  database: Database,
  params: { postId: string }
) {
  const [post] = await database
    .select({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      imageUrl: blogPost.imageUrl,
      status: blogPost.status,
      publishedAt: blogPost.publishedAt,
      createdBy: blogPost.createdBy,
      createdAt: blogPost.createdAt,
      updatedAt: blogPost.updatedAt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(blogPost)
    .innerJoin(user, eq(user.id, blogPost.createdBy))
    .where(eq(blogPost.id, params.postId))
    .limit(1);

  return post ?? null;
}

export async function createBlogPost(
  database: Database,
  params: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: unknown;
    imageUrl?: string;
    status: BlogPostStatus;
    createdBy: string;
  }
) {
  const [existing] = await database
    .select({ id: blogPost.id })
    .from(blogPost)
    .where(eq(blogPost.slug, params.slug))
    .limit(1);

  if (existing) {
    return { post: null, conflict: true as const };
  }

  const [post] = await database
    .insert(blogPost)
    .values({
      id: params.id,
      title: params.title,
      slug: params.slug,
      excerpt: params.excerpt,
      content: params.content,
      imageUrl: params.imageUrl,
      status: params.status,
      publishedAt: params.status === "published" ? new Date() : null,
      createdBy: params.createdBy,
    })
    .returning();

  return { post, conflict: false as const };
}

export async function updateBlogPost(
  database: Database,
  params: {
    postId: string;
    data: Partial<typeof blogPost.$inferInsert>;
  }
) {
  const { postId, data } = params;

  if (data.slug) {
    const [existing] = await database
      .select({ id: blogPost.id })
      .from(blogPost)
      .where(
        and(eq(blogPost.slug, data.slug), sql`${blogPost.id} != ${postId}`)
      )
      .limit(1);

    if (existing) {
      return { post: null, conflict: true as const };
    }
  }

  const [current] = await database
    .select({ id: blogPost.id, publishedAt: blogPost.publishedAt })
    .from(blogPost)
    .where(eq(blogPost.id, postId))
    .limit(1);

  if (!current) {
    return { post: null, conflict: false as const, notFound: true as const };
  }

  const updateData: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  }

  if (
    data.status === "published" &&
    current.publishedAt == null &&
    updateData.publishedAt === undefined
  ) {
    updateData.publishedAt = new Date();
  }

  if (Object.keys(updateData).length === 0) {
    return { post: null, conflict: false as const, noFields: true as const };
  }

  const [post] = await database
    .update(blogPost)
    .set(updateData)
    .where(eq(blogPost.id, postId))
    .returning();

  if (!post) {
    return { post: null, conflict: false as const, notFound: true as const };
  }

  return { post, conflict: false as const };
}

export async function deleteBlogPost(
  database: Database,
  params: { postId: string }
) {
  const [deleted] = await database
    .delete(blogPost)
    .where(eq(blogPost.id, params.postId))
    .returning({ id: blogPost.id });

  return deleted ?? null;
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
      assignedCourseId: courseAssignment.courseId,
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
      courseAssignment,
      and(
        eq(courseAssignment.cohortId, cohort.id),
        eq(courseAssignment.courseId, params.courseId)
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

export async function getCourseProgress(
  database: Database,
  params: {
    enrollmentId: string;
    courseId: string;
  }
) {
  const [enrollmentRow] = await database
    .select({ id: enrollment.id })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.id, params.enrollmentId),
        eq(enrollment.courseId, params.courseId)
      )
    )
    .limit(1);

  if (!enrollmentRow) {
    throw new NotFoundError("Enrollment not found for this course");
  }

  const [totalLessonsRows, completedLessonsRows] = await Promise.all([
    database
      .select({ lessonCount: count(lesson.id) })
      .from(lesson)
      .innerJoin(section, eq(section.id, lesson.sectionId))
      .where(eq(section.courseId, params.courseId)),
    database
      .select({ completedLessonCount: count(lessonProgress.id) })
      .from(lessonProgress)
      .innerJoin(lesson, eq(lesson.id, lessonProgress.lessonId))
      .innerJoin(section, eq(section.id, lesson.sectionId))
      .where(
        and(
          eq(lessonProgress.enrollmentId, params.enrollmentId),
          eq(section.courseId, params.courseId),
          sql`${lessonProgress.completedAt} IS NOT NULL`
        )
      ),
  ]);

  const lessonCount = Number(totalLessonsRows[0]?.lessonCount ?? 0);
  const completedLessonCount = Number(
    completedLessonsRows[0]?.completedLessonCount ?? 0
  );
  const percent =
    lessonCount > 0
      ? Math.round((completedLessonCount / lessonCount) * 100)
      : 0;

  return {
    enrollmentId: params.enrollmentId,
    courseId: params.courseId,
    lessonCount,
    completedLessonCount,
    percent,
  };
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

/**
 * Get the current organization for a session.
 * Returns null if no active organization is set.
 */
export async function getCurrentOrganization(
  database: Database,
  params: { sessionId: string; userId: string }
) {
  const [result] = await database
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      metadata: organization.metadata,
      createdAt: organization.createdAt,
    })
    .from(sessionTable)
    .innerJoin(
      organization,
      eq(organization.id, sessionTable.activeOrganizationId)
    )
    .where(
      and(
        eq(sessionTable.id, params.sessionId),
        eq(sessionTable.userId, params.userId)
      )
    )
    .limit(1);

  return result ?? null;
}

/**
 * Get the current cohort for a session.
 * Returns null if no active cohort is set.
 */
export async function getCurrentCohort(
  database: Database,
  params: { sessionId: string; userId: string }
) {
  const [result] = await database
    .select({
      id: cohort.id,
      name: cohort.name,
      image: cohort.image,
      organizationId: cohort.organizationId,
      createdAt: cohort.createdAt,
      updatedAt: cohort.updatedAt,
    })
    .from(sessionTable)
    .innerJoin(cohort, eq(cohort.id, sessionTable.activeTeamId))
    .where(
      and(
        eq(sessionTable.id, params.sessionId),
        eq(sessionTable.userId, params.userId)
      )
    )
    .limit(1);

  return result ?? null;
}

/**
 * Get the member role for a user in an organization.
 * Returns null if the user is not a member of the organization.
 */
export async function getMemberRole(
  database: Database,
  params: { userId: string; organizationId: string }
): Promise<OrganizationRole | null> {
  const [result] = await database
    .select({
      role: member.role,
    })
    .from(member)
    .where(
      and(
        eq(member.userId, params.userId),
        eq(member.organizationId, params.organizationId)
      )
    )
    .limit(1);

  return result?.role ?? null;
}

type AdminUserStatus = "active" | "banned" | "unverified";
interface ListAdminUsersParams {
  limit: number;
  offset: number;
  search?: string;
  filterRole?: UserRole;
  filterStatus?: AdminUserStatus;
  filterRoles?: UserRole[];
  filterStatuses?: AdminUserStatus[];
  sortBy: "name" | "email" | "createdAt";
  sortDirection: "asc" | "desc";
}

function buildListAdminUsersWhere(
  input: Omit<
    ListAdminUsersParams,
    "limit" | "offset" | "sortBy" | "sortDirection"
  >
) {
  let roleCondition:
    | ReturnType<typeof inArray>
    | ReturnType<typeof eq>
    | undefined;

  if (input.filterRoles && input.filterRoles.length > 0) {
    roleCondition = inArray(user.role, input.filterRoles);
  } else if (input.filterRole) {
    roleCondition = eq(user.role, input.filterRole);
  }

  const statusConditions: Parameters<typeof or>[0][] = [];
  let statuses: AdminUserStatus[] = [];

  if (input.filterStatuses?.length) {
    statuses = input.filterStatuses;
  } else if (input.filterStatus) {
    statuses = [input.filterStatus];
  }

  for (const status of statuses) {
    if (status === "banned") {
      statusConditions.push(sql`${user.banned} IS TRUE`);
      continue;
    }

    if (status === "unverified") {
      statusConditions.push(
        and(eq(user.emailVerified, false), sql`${user.banned} IS NOT TRUE`)
      );
      continue;
    }

    statusConditions.push(
      and(eq(user.emailVerified, true), sql`${user.banned} IS NOT TRUE`)
    );
  }

  const statusCondition =
    statusConditions.length > 0 ? or(...statusConditions) : undefined;

  return and(
    input.search
      ? or(
          ilike(user.name, `%${input.search}%`),
          ilike(user.email, `%${input.search}%`)
        )
      : undefined,
    roleCondition,
    statusCondition
  );
}

export async function getAdminOverview(database: Database = db) {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const signupsStart = new Date(startOfToday);
  signupsStart.setUTCDate(signupsStart.getUTCDate() - 6);

  const [
    [userCountRow],
    [organizationCountRow],
    [activeInviteCountRow],
    [pendingReportCountRow],
    roleRows,
    signupsByDayRows,
    recentUsers,
    recentInbox,
  ] = await Promise.all([
    database.select({ total: count() }).from(user),
    database
      .select({ total: count() })
      .from(organization)
      .where(ne(organization.slug, PUBLIC_ORG_SLUG)),
    database
      .select({ total: count() })
      .from(publicInvite)
      .where(
        and(
          eq(publicInvite.status, "pending"),
          sql`${publicInvite.expiresAt} >= now()`
        )
      ),
    database
      .select({ total: count() })
      .from(report)
      .where(eq(report.status, "pending")),
    database
      .select({ role: user.role, total: count() })
      .from(user)
      .groupBy(user.role),
    database
      .select({
        day: sql<string>`to_char(date_trunc('day', ${user.createdAt}), 'YYYY-MM-DD')`.as(
          "day"
        ),
        total: count(user.id).mapWith(Number).as("total"),
      })
      .from(user)
      .where(gte(user.createdAt, signupsStart))
      .groupBy(sql`date_trunc('day', ${user.createdAt})`)
      .orderBy(sql`date_trunc('day', ${user.createdAt})`),
    database
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(5),
    listAdminReports(database, {
      limit: 5,
      offset: 0,
      type: "all",
      status: "all",
    }),
  ]);

  const roleCountMap = new Map<string, number>();

  for (const row of roleRows) {
    if (row.role) {
      roleCountMap.set(row.role, Number(row.total));
    }
  }

  const signupsByDayMap = new Map(
    signupsByDayRows.map((row) => [row.day, Number(row.total)])
  );

  const signupsByDay = Array.from({ length: 7 }, (_, index) => {
    const bucketDate = new Date(signupsStart);
    bucketDate.setUTCDate(signupsStart.getUTCDate() + index);

    const dayKey = bucketDate.toISOString().slice(0, 10);

    return {
      date: dayKey,
      label: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(bucketDate),
      total: signupsByDayMap.get(dayKey) ?? 0,
    };
  });

  return {
    totals: {
      users: Number(userCountRow?.total ?? 0),
      organizations: Number(organizationCountRow?.total ?? 0),
      activeInvites: Number(activeInviteCountRow?.total ?? 0),
      pendingReports: Number(pendingReportCountRow?.total ?? 0),
    },
    roleCounts: [
      {
        role: "platform_admin" as const,
        label: "Admins",
        total: roleCountMap.get("platform_admin") ?? 0,
      },
      {
        role: "content_creator" as const,
        label: "Creators",
        total: roleCountMap.get("content_creator") ?? 0,
      },
      {
        role: "platform_student" as const,
        label: "Students",
        total: roleCountMap.get("platform_student") ?? 0,
      },
    ],
    signupsByDay,
    recentUsers,
    recentInbox: recentInbox.items,
  };
}

export async function getInstructorOverview(
  params: {
    userId: string;
    isAdmin?: boolean;
  },
  database: Database = db
) {
  const courseScope = params.isAdmin
    ? undefined
    : exists(
        database
          .select({ one: sql`1` })
          .from(courseInstructor)
          .where(
            and(
              eq(courseInstructor.courseId, course.id),
              eq(courseInstructor.userId, params.userId)
            )
          )
      );

  const postScope = params.isAdmin
    ? undefined
    : eq(blogPost.createdBy, params.userId);

  const [[courseTotalsRow], [postTotalsRow], recentCourses, recentPosts] =
    await Promise.all([
      database
        .select({
          totalCourses: count(course.id),
          publishedCourses:
            sql<number>`coalesce(sum(case when ${course.status} = 'published' then 1 else 0 end), 0)`
              .mapWith(Number)
              .as("published_courses"),
          draftCourses:
            sql<number>`coalesce(sum(case when ${course.status} = 'draft' then 1 else 0 end), 0)`
              .mapWith(Number)
              .as("draft_courses"),
          totalEnrollments:
            sql<number>`coalesce(sum((SELECT count(*)::int FROM "enrollment" WHERE "enrollment"."course_id" = "course"."id")), 0)`
              .mapWith(Number)
              .as("total_enrollments"),
          totalLessons:
            sql<number>`coalesce(sum((SELECT count(*)::int FROM "lesson" l JOIN "section" s ON l."section_id" = s."id" WHERE s."course_id" = "course"."id")), 0)`
              .mapWith(Number)
              .as("total_lessons"),
        })
        .from(course)
        .where(courseScope),
      database
        .select({
          totalPosts: count(blogPost.id),
          publishedPosts:
            sql<number>`coalesce(sum(case when ${blogPost.status} = 'published' then 1 else 0 end), 0)`
              .mapWith(Number)
              .as("published_posts"),
          draftPosts:
            sql<number>`coalesce(sum(case when ${blogPost.status} = 'draft' then 1 else 0 end), 0)`
              .mapWith(Number)
              .as("draft_posts"),
        })
        .from(blogPost)
        .where(postScope),
      database
        .select({
          id: course.id,
          title: course.title,
          status: course.status,
          updatedAt: course.updatedAt,
          enrollmentCount:
            sql<number>`(SELECT count(*)::int FROM "enrollment" WHERE "enrollment"."course_id" = "course"."id")`.as(
              "enrollment_count"
            ),
          lessonCount:
            sql<number>`(SELECT count(*)::int FROM "lesson" l JOIN "section" s ON l."section_id" = s."id" WHERE s."course_id" = "course"."id")`.as(
              "lesson_count"
            ),
        })
        .from(course)
        .where(courseScope)
        .orderBy(desc(course.updatedAt))
        .limit(4),
      database
        .select({
          id: blogPost.id,
          title: blogPost.title,
          status: blogPost.status,
          updatedAt: blogPost.updatedAt,
          publishedAt: blogPost.publishedAt,
        })
        .from(blogPost)
        .where(postScope)
        .orderBy(desc(blogPost.updatedAt))
        .limit(4),
    ]);

  const totalCourses = Number(courseTotalsRow?.totalCourses ?? 0);
  const publishedCourses = Number(courseTotalsRow?.publishedCourses ?? 0);
  const draftCourses = Number(courseTotalsRow?.draftCourses ?? 0);
  const totalEnrollments = Number(courseTotalsRow?.totalEnrollments ?? 0);
  const totalLessons = Number(courseTotalsRow?.totalLessons ?? 0);
  const totalPosts = Number(postTotalsRow?.totalPosts ?? 0);
  const publishedPosts = Number(postTotalsRow?.publishedPosts ?? 0);
  const draftPosts = Number(postTotalsRow?.draftPosts ?? 0);

  return {
    totals: {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      totalLessons,
      totalPosts,
      publishedPosts,
      draftPosts,
    },
    contentStatus: [
      {
        label: "Draft",
        courses: draftCourses,
        posts: draftPosts,
      },
      {
        label: "Published",
        courses: publishedCourses,
        posts: publishedPosts,
      },
    ],
    recentCourses,
    recentPosts,
  };
}

export async function listAdminUsers(
  database: Database,
  params: ListAdminUsersParams
) {
  const where = buildListAdminUsersWhere(params);
  const ORDER_COLUMNS = {
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  } as const;
  const orderColumn = ORDER_COLUMNS[params.sortBy];
  const orderBy =
    params.sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);

  const rows = await database
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      createdAt: user.createdAt,
      _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
    })
    .from(user)
    .where(where)
    .orderBy(orderBy)
    .limit(params.limit)
    .offset(params.offset);

  const total = rows[0]?._total ?? 0;
  const users = rows.map(({ _total, ...rest }) => rest);

  if (users.length === 0) {
    return { users: [], total };
  }

  const userIds = users.map((row) => row.id);
  const membershipRows = await database
    .select({
      userId: member.userId,
      orgId: organization.id,
      orgName: organization.name,
      orgSlug: organization.slug,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(
      and(
        inArray(member.userId, userIds),
        ne(organization.slug, PUBLIC_ORG_SLUG)
      )
    );

  const membershipsByUser = new Map<
    string,
    {
      orgs: {
        id: string;
        name: string;
        slug: string;
        role: OrganizationRole;
      }[];
      orgCount: number;
    }
  >();

  for (const row of membershipRows) {
    const existing = membershipsByUser.get(row.userId) ?? {
      orgs: [],
      orgCount: 0,
    };

    existing.orgs.push({
      id: row.orgId,
      name: row.orgName,
      slug: row.orgSlug,
      role: row.role,
    });
    existing.orgCount += 1;
    membershipsByUser.set(row.userId, existing);
  }

  return {
    users: users.map((row) => {
      const memberships = membershipsByUser.get(row.id);
      return {
        ...row,
        orgs: memberships?.orgs ?? [],
        orgCount: memberships?.orgCount ?? 0,
      };
    }),
    total,
  };
}

type PublicInviteDisplayStatus = "pending" | "accepted" | "expired" | "revoked";

interface ListPublicInvitesParams {
  limit: number;
  offset: number;
  search?: string;
  statuses?: PublicInviteDisplayStatus[];
}

function getPublicInviteDisplayStatus(
  invite: Pick<typeof publicInvite.$inferSelect, "status" | "expiresAt">
): PublicInviteDisplayStatus {
  if (invite.status === "pending" && invite.expiresAt.getTime() < Date.now()) {
    return "expired";
  }

  return invite.status;
}

export async function findUserByEmail(
  database: Database,
  params: { email: string }
) {
  const [userRow] = await database
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(eq(user.email, params.email))
    .limit(1);

  return userRow ?? null;
}

export async function getUserRoleById(
  database: Database,
  params: { userId: string }
): Promise<UserRole | null> {
  const [userRow] = await database
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, params.userId))
    .limit(1);

  return userRow?.role ?? null;
}

export async function createPublicInviteRecord(
  database: Database,
  params: {
    email: string;
    name: string;
    role: UserRole;
    tokenHash: string;
    expiresAt: Date;
    createdBy: string;
  }
) {
  const [invite] = await database
    .insert(publicInvite)
    .values(params)
    .returning();

  return invite;
}

export async function findActivePublicInviteByEmail(
  database: Database,
  params: { email: string }
) {
  const [invite] = await database
    .select()
    .from(publicInvite)
    .where(
      and(
        eq(publicInvite.email, params.email),
        eq(publicInvite.status, "pending"),
        sql`${publicInvite.expiresAt} >= now()`
      )
    )
    .orderBy(desc(publicInvite.createdAt))
    .limit(1);

  return invite ?? null;
}

export async function listPublicInvites(
  database: Database,
  params: ListPublicInvitesParams
) {
  const conditions: Parameters<typeof and>[0][] = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(publicInvite.email, `%${params.search}%`),
        ilike(publicInvite.name, `%${params.search}%`)
      )
    );
  }

  if (params.statuses?.length) {
    const statusConditions: Parameters<typeof or>[0][] = [];

    for (const status of params.statuses) {
      if (status === "expired") {
        statusConditions.push(
          and(
            eq(publicInvite.status, "pending"),
            sql`${publicInvite.expiresAt} < now()`
          )
        );
        continue;
      }

      if (status === "pending") {
        statusConditions.push(
          and(
            eq(publicInvite.status, "pending"),
            sql`${publicInvite.expiresAt} >= now()`
          )
        );
        continue;
      }

      statusConditions.push(eq(publicInvite.status, status));
    }

    conditions.push(or(...statusConditions));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await database
    .select({
      id: publicInvite.id,
      email: publicInvite.email,
      name: publicInvite.name,
      role: publicInvite.role,
      status: publicInvite.status,
      expiresAt: publicInvite.expiresAt,
      acceptedAt: publicInvite.acceptedAt,
      revokedAt: publicInvite.revokedAt,
      createdAt: publicInvite.createdAt,
      inviterName: user.name,
      _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
    })
    .from(publicInvite)
    .innerJoin(user, eq(user.id, publicInvite.createdBy))
    .where(where)
    .orderBy(desc(publicInvite.createdAt))
    .limit(params.limit)
    .offset(params.offset);

  const total = rows[0]?._total ?? 0;

  return {
    invites: rows.map(({ _total, status, expiresAt, ...rest }) => ({
      ...rest,
      expiresAt,
      status: getPublicInviteDisplayStatus({ status, expiresAt }),
    })),
    total,
  };
}

type AdminReportFilterStatus =
  | "all"
  | (typeof report.status.enumValues)[number];
type AdminReportListType = "all" | "report" | "feedback";

interface ListAdminReportsParams {
  limit: number;
  offset: number;
  type: AdminReportListType;
  status: AdminReportFilterStatus;
}

export async function listAdminReports(
  database: Database,
  params: ListAdminReportsParams
) {
  const reportWhere =
    params.status !== "all" ? eq(report.status, params.status) : undefined;

  if (params.type === "report") {
    const rows = await database
      .select({
        id: report.id,
        type: sql<"report">`'report'`,
        email: report.email,
        subject: report.subject,
        message: sql<string | null>`null`,
        category: report.type,
        status: report.status,
        createdAt: report.createdAt,
        _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
      })
      .from(report)
      .where(reportWhere)
      .orderBy(desc(report.createdAt))
      .limit(params.limit)
      .offset(params.offset);

    const total = rows[0]?._total ?? 0;
    return {
      items: rows.map(({ _total, ...item }) => item),
      total,
    };
  }

  if (params.type === "feedback") {
    const rows = await database
      .select({
        id: feedback.id,
        type: sql<"feedback">`'feedback'`,
        email: feedback.email,
        subject: sql<string | null>`null`,
        message: feedback.message,
        category: sql<string | null>`null`,
        status: sql<string | null>`null`,
        createdAt: feedback.createdAt,
        _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
      })
      .from(feedback)
      .orderBy(desc(feedback.createdAt))
      .limit(params.limit)
      .offset(params.offset);

    const total = rows[0]?._total ?? 0;
    return {
      items: rows.map(({ _total, ...item }) => item),
      total,
    };
  }

  const [reportItems, feedbackItems, [reportTotalRow], [feedbackTotalRow]] =
    await Promise.all([
      database
        .select({
          id: report.id,
          type: sql<"report">`'report'`,
          email: report.email,
          subject: report.subject,
          message: sql<string | null>`null`,
          category: report.type,
          status: report.status,
          createdAt: report.createdAt,
        })
        .from(report)
        .orderBy(desc(report.createdAt))
        .limit(300),
      database
        .select({
          id: feedback.id,
          type: sql<"feedback">`'feedback'`,
          email: feedback.email,
          subject: sql<string | null>`null`,
          message: feedback.message,
          category: sql<string | null>`null`,
          status: sql<string | null>`null`,
          createdAt: feedback.createdAt,
        })
        .from(feedback)
        .orderBy(desc(feedback.createdAt))
        .limit(300),
      database.select({ total: count() }).from(report),
      database.select({ total: count() }).from(feedback),
    ]);

  const items = [...reportItems, ...feedbackItems]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(params.offset, params.offset + params.limit);

  return {
    items,
    total: (reportTotalRow?.total ?? 0) + (feedbackTotalRow?.total ?? 0),
  };
}

export async function getAdminReportById(
  database: Database,
  params: { id: string }
) {
  const [[reportItem], [feedbackItem]] = await Promise.all([
    database.select().from(report).where(eq(report.id, params.id)).limit(1),
    database.select().from(feedback).where(eq(feedback.id, params.id)).limit(1),
  ]);

  if (reportItem) {
    return { ...reportItem, type: "report" as const };
  }

  if (feedbackItem) {
    return { ...feedbackItem, type: "feedback" as const };
  }

  return null;
}

export async function updateAdminReportStatus(
  database: Database,
  params: { id: string; status: (typeof report.status.enumValues)[number] }
) {
  const [updated] = await database
    .update(report)
    .set({ status: params.status })
    .where(eq(report.id, params.id))
    .returning({ id: report.id, status: report.status });

  return updated ?? null;
}

interface ListAdminOrganizationsParams {
  limit: number;
  offset: number;
  search?: string;
}

export async function listAdminOrganizations(
  database: Database,
  params: ListAdminOrganizationsParams
) {
  const where = and(
    ne(organization.slug, PUBLIC_ORG_SLUG),
    params.search
      ? or(
          ilike(organization.name, `%${params.search}%`),
          ilike(organization.slug, `%${params.search}%`)
        )
      : undefined
  );

  const rows = await database
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      cohortCount: sql<number>`(
        SELECT COUNT(*)::int FROM auth.cohort c
        WHERE c.organization_id = ${sql.raw('"auth"."organization"."id"')}
      )`,
      memberCount: sql<number>`(
        SELECT COUNT(*)::int FROM auth.member m
        WHERE m.organization_id = ${sql.raw('"auth"."organization"."id"')}
      )`,
      ownerName: sql<string | null>`(
        SELECT u.name FROM auth.user u
        INNER JOIN auth.member m ON m.user_id = u.id
        WHERE m.organization_id = ${sql.raw('"auth"."organization"."id"')}
          AND m.role = 'org_owner'
        LIMIT 1
      )`,
      ownerEmail: sql<string | null>`(
        SELECT u.email FROM auth.user u
        INNER JOIN auth.member m ON m.user_id = u.id
        WHERE m.organization_id = ${sql.raw('"auth"."organization"."id"')}
          AND m.role = 'org_owner'
        LIMIT 1
      )`,
      _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
    })
    .from(organization)
    .where(where)
    .orderBy(desc(organization.createdAt))
    .limit(params.limit)
    .offset(params.offset);

  const total = rows[0]?._total ?? 0;
  const orgs = rows.map(({ _total, ...org }) => org);

  return {
    orgs,
    total,
  };
}

export async function createAdminOrganization(
  database: Database,
  params: {
    name: string;
    slug: string;
    ownerEmail: string;
  }
) {
  const [[ownerUser], [existingOrganization]] = await Promise.all([
    database
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(eq(user.email, params.ownerEmail))
      .limit(1),
    database
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, params.slug))
      .limit(1),
  ]);

  if (!ownerUser) {
    return { ownerNotFound: true as const, conflict: false as const };
  }

  if (existingOrganization) {
    return { ownerNotFound: false as const, conflict: true as const };
  }

  const orgId = crypto.randomUUID();

  await database.insert(organization).values({
    id: orgId,
    name: params.name,
    slug: params.slug,
  });

  await Promise.all([
    database.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: ownerUser.id,
      role: "org_owner",
    }),
    database.insert(cohort).values({
      id: crypto.randomUUID(),
      name: "General",
      organizationId: orgId,
    }),
  ]);

  return {
    ownerNotFound: false as const,
    conflict: false as const,
    organization: {
      id: orgId,
      name: params.name,
      slug: params.slug,
    },
  };
}

export async function getPublicInviteByTokenHash(
  database: Database,
  params: { tokenHash: string }
) {
  const [invite] = await database
    .select()
    .from(publicInvite)
    .where(eq(publicInvite.tokenHash, params.tokenHash))
    .limit(1);

  if (!invite) {
    return null;
  }

  return {
    ...invite,
    displayStatus: getPublicInviteDisplayStatus(invite),
  };
}

export async function markPublicInviteAccepted(
  database: Database,
  params: { inviteId: string; acceptedUserId: string }
) {
  const [invite] = await database
    .update(publicInvite)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
      acceptedUserId: params.acceptedUserId,
    })
    .where(eq(publicInvite.id, params.inviteId))
    .returning();

  return invite ?? null;
}

export async function markPublicInviteRejected(
  database: Database,
  params: { inviteId: string }
) {
  const [invite] = await database
    .update(publicInvite)
    .set({ status: "revoked" })
    .where(eq(publicInvite.id, params.inviteId))
    .returning({ id: publicInvite.id });

  return invite ?? null;
}

export async function markPublicInviteRevoked(
  database: Database,
  params: { inviteId: string }
) {
  const [invite] = await database
    .update(publicInvite)
    .set({
      status: "revoked",
      revokedAt: new Date(),
    })
    .where(eq(publicInvite.id, params.inviteId))
    .returning({ id: publicInvite.id });

  return invite ?? null;
}

export async function updateUserInviteCompletion(
  database: Database,
  params: {
    userId: string;
    role: UserRole;
  }
) {
  const [updatedUser] = await database
    .update(user)
    .set({
      role: params.role,
      emailVerified: true,
    })
    .where(eq(user.id, params.userId))
    .returning({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    });

  return updatedUser ?? null;
}

// ---------------------------------------------------------------------------
// Course listing queries
// ---------------------------------------------------------------------------

export async function listPublicCourses(
  database: Database,
  params: {
    limit: number;
    offset: number;
    search?: string;
    sortBy: "title" | "createdAt" | "updatedAt";
    sortDirection: "asc" | "desc";
    filterDifficulties?: (
      | "beginner"
      | "intermediate"
      | "advanced"
      | "expert"
    )[];
    filterCategoryIds?: string[];
  }
) {
  const conditions: Parameters<typeof and>[0][] = [
    eq(course.status, "published"),
  ];

  if (params.filterDifficulties?.length) {
    conditions.push(inArray(course.difficulty, params.filterDifficulties));
  }

  if (params.filterCategoryIds?.length) {
    conditions.push(
      exists(
        database
          .select({ one: sql`1` })
          .from(courseCategory)
          .where(
            and(
              eq(courseCategory.courseId, course.id),
              inArray(courseCategory.categoryId, params.filterCategoryIds)
            )
          )
      )
    );
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(course.title, `%${params.search}%`),
        ilike(course.description, `%${params.search}%`)
      )
    );
  }

  const ORDER_COLUMNS = {
    title: course.title,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  } as const;
  const orderColumn = ORDER_COLUMNS[params.sortBy];
  const orderBy =
    params.sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);

  const rows = await database
    .select({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      summary: course.summary,
      imageUrl: course.imageUrl,
      difficulty: course.difficulty,
      estimatedDuration: course.estimatedDuration,
      enrollmentCount:
        sql<number>`(SELECT count(*)::int FROM "enrollment" WHERE "enrollment"."course_id" = "course"."id")`.as(
          "enrollment_count"
        ),
      lessonCount:
        sql<number>`(SELECT count(*)::int FROM "lesson" l JOIN "section" s ON l."section_id" = s."id" WHERE s."course_id" = "course"."id")`.as(
          "lesson_count"
        ),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
    })
    .from(course)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(params.limit)
    .offset(params.offset);

  const total = rows[0]?._total ?? 0;
  const courses = rows.map(({ _total, ...rest }) => rest);

  const courseIds = courses.map((courseItem) => courseItem.id);
  const categoryRows =
    courseIds.length > 0
      ? await database
          .select({
            courseId: courseCategory.courseId,
            id: category.id,
            name: category.name,
            slug: category.slug,
            order: category.order,
          })
          .from(courseCategory)
          .innerJoin(category, eq(category.id, courseCategory.categoryId))
          .where(inArray(courseCategory.courseId, courseIds))
      : [];

  const categoriesByCourse = new Map<
    string,
    { id: string; name: string; slug: string; order: number | null }[]
  >();

  for (const row of categoryRows) {
    const existing = categoriesByCourse.get(row.courseId) ?? [];
    existing.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      order: row.order,
    });
    categoriesByCourse.set(row.courseId, existing);
  }

  return {
    courses: courses.map((courseItem) => ({
      ...courseItem,
      categories: categoriesByCourse.get(courseItem.id) ?? [],
    })),
    total,
  };
}

export async function listInstructorCourses(
  database: Database,
  params: {
    limit: number;
    offset: number;
    search?: string;
    sortBy: "title" | "createdAt" | "updatedAt" | "status";
    sortDirection: "asc" | "desc";
    filterStatuses?: ("draft" | "published")[];
    filterDifficulties?: (
      | "beginner"
      | "intermediate"
      | "advanced"
      | "expert"
    )[];
    filterCategoryIds?: string[];
    userId: string;
    isAdmin: boolean;
  }
) {
  const conditions: Parameters<typeof and>[0][] = [];

  if (params.filterStatuses?.length) {
    conditions.push(inArray(course.status, params.filterStatuses));
  }
  if (params.filterDifficulties?.length) {
    conditions.push(inArray(course.difficulty, params.filterDifficulties));
  }
  if (params.filterCategoryIds?.length) {
    conditions.push(
      exists(
        database
          .select({ one: sql`1` })
          .from(courseCategory)
          .where(
            and(
              eq(courseCategory.courseId, course.id),
              inArray(courseCategory.categoryId, params.filterCategoryIds)
            )
          )
      )
    );
  }
  if (!params.isAdmin) {
    conditions.push(
      exists(
        database
          .select({ one: sql`1` })
          .from(courseInstructor)
          .where(
            and(
              eq(courseInstructor.courseId, course.id),
              eq(courseInstructor.userId, params.userId)
            )
          )
      )
    );
  }
  if (params.search) {
    conditions.push(
      or(
        ilike(course.title, `%${params.search}%`),
        ilike(course.description, `%${params.search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const ORDER_COLUMNS = {
    title: course.title,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    status: course.status,
  } as const;
  const orderColumn = ORDER_COLUMNS[params.sortBy];
  const orderBy =
    params.sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);

  const rows = await database
    .select({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      summary: course.summary,
      imageUrl: course.imageUrl,
      difficulty: course.difficulty,
      estimatedDuration: course.estimatedDuration,
      status: course.status,
      createdBy: course.createdBy,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      sectionCount:
        sql<number>`(SELECT count(*)::int FROM "section" WHERE "section"."course_id" = "course"."id")`.as(
          "section_count"
        ),
      lessonCount:
        sql<number>`(SELECT count(*)::int FROM "lesson" l JOIN "section" s ON l."section_id" = s."id" WHERE s."course_id" = "course"."id")`.as(
          "lesson_count"
        ),
      enrollmentCount:
        sql<number>`(SELECT count(*)::int FROM "enrollment" WHERE "enrollment"."course_id" = "course"."id")`.as(
          "enrollment_count"
        ),
      _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
    })
    .from(course)
    .where(where)
    .orderBy(orderBy)
    .limit(params.limit)
    .offset(params.offset);

  const total = rows[0]?._total ?? 0;
  const courses = rows.map(({ _total, ...rest }) => rest);

  // Fetch categories only for the returned courses (not all)
  const courseIds = courses.map((c) => c.id);
  const categoryRows =
    courseIds.length > 0
      ? await database
          .select({
            courseId: courseCategory.courseId,
            id: category.id,
            name: category.name,
            slug: category.slug,
            order: category.order,
          })
          .from(courseCategory)
          .innerJoin(category, eq(category.id, courseCategory.categoryId))
          .where(inArray(courseCategory.courseId, courseIds))
      : [];

  const categoriesByCourse = new Map<
    string,
    { id: string; name: string; slug: string; order: number | null }[]
  >();
  for (const row of categoryRows) {
    const arr = categoriesByCourse.get(row.courseId) ?? [];
    arr.push({ id: row.id, name: row.name, slug: row.slug, order: row.order });
    categoriesByCourse.set(row.courseId, arr);
  }

  return {
    courses: courses.map((c) => ({
      ...c,
      categories: categoriesByCourse.get(c.id) ?? [],
    })),
    total,
  };
}

export async function getPublicCourseBySlugOrId(
  database: Database,
  params: { slugOrId: string }
) {
  const [courseRow] = await database
    .select({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      summary: course.summary,
      imageUrl: course.imageUrl,
      difficulty: course.difficulty,
      estimatedDuration: course.estimatedDuration,
      status: course.status,
    })
    .from(course)
    .where(or(eq(course.id, params.slugOrId), eq(course.slug, params.slugOrId)))
    .limit(1);

  if (!courseRow || courseRow.status !== "published") {
    return null;
  }

  const [sections, [enrollmentRow]] = await Promise.all([
    database
      .select({
        id: section.id,
        title: section.title,
        description: section.description,
        order: section.order,
      })
      .from(section)
      .where(eq(section.courseId, courseRow.id))
      .orderBy(asc(section.order)),
    database
      .select({ count: count() })
      .from(enrollment)
      .where(eq(enrollment.courseId, courseRow.id)),
  ]);

  const sectionIds = sections.map((s) => s.id);
  const lessons =
    sectionIds.length > 0
      ? await database
          .select({
            id: lesson.id,
            sectionId: lesson.sectionId,
            title: lesson.title,
            type: normalizedLessonType().as("type"),
            order: lesson.order,
            estimatedDuration: lesson.estimatedDuration,
          })
          .from(lesson)
          .where(inArray(lesson.sectionId, sectionIds))
          .orderBy(asc(lesson.order))
      : [];

  const lessonsBySection = new Map<string, typeof lessons>();
  for (const l of lessons) {
    const arr = lessonsBySection.get(l.sectionId) ?? [];
    arr.push(l);
    lessonsBySection.set(l.sectionId, arr);
  }

  return {
    ...courseRow,
    sections: sections.map((s) => ({
      ...s,
      lessons: lessonsBySection.get(s.id) ?? [],
    })),
    enrollmentCount: enrollmentRow?.count ?? 0,
    lessonCount: lessons.length,
  };
}

export async function getCourseByIdForInstructor(
  database: Database,
  params: { courseId: string }
) {
  const [courseRows, sections, instructors, categoryRows] = await Promise.all([
    database
      .select()
      .from(course)
      .where(eq(course.id, params.courseId))
      .limit(1),
    database
      .select()
      .from(section)
      .where(eq(section.courseId, params.courseId))
      .orderBy(asc(section.order)),
    database
      .select({
        courseId: courseInstructor.courseId,
        userId: courseInstructor.userId,
        role: courseInstructor.role,
        createdAt: courseInstructor.createdAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(courseInstructor)
      .innerJoin(user, eq(user.id, courseInstructor.userId))
      .where(eq(courseInstructor.courseId, params.courseId)),
    database
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
        order: category.order,
      })
      .from(courseCategory)
      .innerJoin(category, eq(category.id, courseCategory.categoryId))
      .where(eq(courseCategory.courseId, params.courseId)),
  ]);

  const courseRow = courseRows[0];
  if (!courseRow) {
    return null;
  }

  const sectionIds = sections.map((s) => s.id);
  const lessons =
    sectionIds.length > 0
      ? await database
          .select()
          .from(lesson)
          .where(inArray(lesson.sectionId, sectionIds))
          .orderBy(asc(lesson.order))
      : [];

  const lessonsBySection = new Map<string, typeof lessons>();
  for (const l of lessons) {
    const arr = lessonsBySection.get(l.sectionId) ?? [];
    arr.push(l);
    lessonsBySection.set(l.sectionId, arr);
  }

  return {
    ...courseRow,
    sections: sections.map((s) => ({
      ...s,
      lessons: lessonsBySection.get(s.id) ?? [],
    })),
    instructors,
    categories: categoryRows,
  };
}

export async function getCourseInstructors(
  database: Database,
  params: { courseId: string }
) {
  const instructorRows = await database
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: courseInstructor.role,
    })
    .from(courseInstructor)
    .innerJoin(user, eq(user.id, courseInstructor.userId))
    .where(eq(courseInstructor.courseId, params.courseId));

  const mainRow = instructorRows.find((r) => r.role === "main");
  const mainInstructor = mainRow
    ? {
        id: mainRow.id,
        name: mainRow.name,
        email: mainRow.email,
        image: mainRow.image,
      }
    : null;
  const coCreators = instructorRows
    .filter((r) => r.role === "secondary")
    .map(({ role: _, ...rest }) => rest);

  return { mainInstructor, coCreators };
}

export async function createCourse(
  database: Database,
  params: {
    id?: string;
    title: string;
    description?: string;
    summary?: unknown;
    slug: string;
    imageUrl?: string;
    difficulty: string;
    estimatedDuration?: number;
    status: string;
    categoryIds?: string[];
    userId: string;
  }
) {
  const [existing] = await database
    .select({ id: course.id })
    .from(course)
    .where(eq(course.slug, params.slug))
    .limit(1);

  if (existing) {
    return { course: null, conflict: true as const };
  }

  const insertValues: typeof course.$inferInsert = {
    id: params.id,
    title: params.title,
    slug: params.slug,
    difficulty: params.difficulty as DifficultyLevel,
    status: params.status as CourseStatus,
    createdBy: params.userId,
  };
  if (params.description !== undefined) {
    insertValues.description = params.description;
  }
  if (params.summary !== undefined) {
    insertValues.summary = params.summary;
  }
  if (params.imageUrl !== undefined) {
    insertValues.imageUrl = params.imageUrl;
  }
  if (params.estimatedDuration !== undefined) {
    insertValues.estimatedDuration = params.estimatedDuration;
  }

  const [newCourse] = await database
    .insert(course)
    .values(insertValues)
    .returning();

  const followUp: Promise<unknown>[] = [
    database.insert(courseInstructor).values({
      courseId: newCourse.id,
      userId: params.userId,
      role: "main",
      addedBy: params.userId,
    }),
  ];
  if (params.categoryIds?.length) {
    followUp.push(
      database.insert(courseCategory).values(
        params.categoryIds.map((categoryId) => ({
          courseId: newCourse.id,
          categoryId,
        }))
      )
    );
  }
  await Promise.all(followUp);

  return { course: newCourse, conflict: false as const };
}

export async function updateCourse(
  database: Database,
  params: {
    courseId: string;
    data: Partial<typeof course.$inferInsert> & {
      categoryIds?: string[];
    };
  }
) {
  const { courseId, data } = params;

  if (data.slug) {
    const [existing] = await database
      .select({ id: course.id })
      .from(course)
      .where(
        and(
          eq(course.slug, data.slug as string),
          sql`${course.id} != ${courseId}`
        )
      )
      .limit(1);
    if (existing) {
      return { course: null, conflict: true as const };
    }
  }

  const updateData: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  }

  const hasCategoryUpdate = data.categoryIds !== undefined;
  if (Object.keys(updateData).length === 0 && !hasCategoryUpdate) {
    return { course: null, conflict: false as const, noFields: true as const };
  }

  let updated: typeof course.$inferSelect | undefined;
  if (Object.keys(updateData).length > 0) {
    const [updatedRow] = await database
      .update(course)
      .set(updateData)
      .where(eq(course.id, courseId))
      .returning();
    updated = updatedRow;
  } else {
    const [existingRow] = await database
      .select()
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);
    updated = existingRow;
  }

  if (!updated) {
    return { course: null, conflict: false as const, notFound: true as const };
  }

  if (data.categoryIds !== undefined) {
    await database
      .delete(courseCategory)
      .where(eq(courseCategory.courseId, courseId));
    if (data.categoryIds.length > 0) {
      await database.insert(courseCategory).values(
        data.categoryIds.map((categoryId) => ({
          courseId,
          categoryId,
        }))
      );
    }
  }

  return { course: updated, conflict: false as const };
}

export async function deleteCourse(
  database: Database,
  params: { courseId: string }
) {
  const [deleted] = await database
    .delete(course)
    .where(eq(course.id, params.courseId))
    .returning({ id: course.id });

  return deleted ?? null;
}

export async function getSectionById(
  database: Database,
  params: { sectionId: string }
) {
  const [sectionRow] = await database
    .select()
    .from(section)
    .where(eq(section.id, params.sectionId))
    .limit(1);

  return sectionRow ?? null;
}

export async function createSection(
  database: Database,
  params: {
    courseId: string;
    title: string;
    description?: string;
  }
) {
  const [maxRow] = await database
    .select({ order: max(section.order) })
    .from(section)
    .where(eq(section.courseId, params.courseId));

  const [created] = await database
    .insert(section)
    .values({
      courseId: params.courseId,
      title: params.title,
      description: params.description,
      order: (maxRow?.order ?? -1) + 1,
    })
    .returning();

  return created;
}

export async function updateSection(
  database: Database,
  params: {
    sectionId: string;
    data: Partial<typeof section.$inferInsert>;
  }
) {
  const updateData: Record<string, unknown> = {};
  for (const key of Object.keys(params.data)) {
    if (params.data[key as keyof typeof params.data] !== undefined) {
      updateData[key] = params.data[key as keyof typeof params.data];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return { section: null, noFields: true as const, notFound: false as const };
  }

  const [updated] = await database
    .update(section)
    .set(updateData)
    .where(eq(section.id, params.sectionId))
    .returning();

  if (!updated) {
    return { section: null, noFields: false as const, notFound: true as const };
  }

  return {
    section: updated,
    noFields: false as const,
    notFound: false as const,
  };
}

export async function deleteSection(
  database: Database,
  params: { sectionId: string }
) {
  const [deleted] = await database
    .delete(section)
    .where(eq(section.id, params.sectionId))
    .returning({ id: section.id });

  return deleted ?? null;
}

export async function getLessonById(
  database: Database,
  params: { lessonId: string }
) {
  const [lessonRow] = await database
    .select({
      id: lesson.id,
      sectionId: lesson.sectionId,
      courseId: section.courseId,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .where(eq(lesson.id, params.lessonId))
    .limit(1);

  return lessonRow ?? null;
}

export async function createLesson(
  database: Database,
  params: {
    sectionId: string;
    title: string;
    content?: unknown;
    type?: "article" | "test";
    estimatedDuration?: number;
  }
) {
  const [maxRow] = await database
    .select({ order: max(lesson.order) })
    .from(lesson)
    .where(eq(lesson.sectionId, params.sectionId));

  const [created] = await database
    .insert(lesson)
    .values({
      sectionId: params.sectionId,
      title: params.title,
      content: params.content,
      type: params.type ?? "article",
      order: (maxRow?.order ?? -1) + 1,
      estimatedDuration: params.estimatedDuration,
    })
    .returning();

  return created;
}

export async function updateLesson(
  database: Database,
  params: {
    lessonId: string;
    data: Partial<typeof lesson.$inferInsert>;
  }
) {
  const updateData: Record<string, unknown> = {};
  for (const key of Object.keys(params.data)) {
    if (params.data[key as keyof typeof params.data] !== undefined) {
      updateData[key] = params.data[key as keyof typeof params.data];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return { lesson: null, noFields: true as const, notFound: false as const };
  }

  const [updated] = await database
    .update(lesson)
    .set(updateData)
    .where(eq(lesson.id, params.lessonId))
    .returning();

  if (!updated) {
    return { lesson: null, noFields: false as const, notFound: true as const };
  }

  return {
    lesson: updated,
    noFields: false as const,
    notFound: false as const,
  };
}

export async function deleteLesson(
  database: Database,
  params: { lessonId: string }
) {
  const [deleted] = await database
    .delete(lesson)
    .where(eq(lesson.id, params.lessonId))
    .returning({ id: lesson.id });

  return deleted ?? null;
}

export async function reorderSections(
  database: Database,
  params: { courseId: string; sectionIds: string[] }
) {
  await Promise.all(
    params.sectionIds.map((sectionId, index) =>
      database
        .update(section)
        .set({ order: index })
        .where(
          and(eq(section.id, sectionId), eq(section.courseId, params.courseId))
        )
    )
  );
}

export async function reorderLessons(
  database: Database,
  params: { sectionId: string; lessonIds: string[] }
) {
  await Promise.all(
    params.lessonIds.map((lessonId, index) =>
      database
        .update(lesson)
        .set({ order: index })
        .where(
          and(eq(lesson.id, lessonId), eq(lesson.sectionId, params.sectionId))
        )
    )
  );
}

export async function moveLesson(
  database: Database,
  params: {
    lessonId: string;
    targetSectionId: string;
    newOrder: number;
  }
) {
  const [updated] = await database
    .update(lesson)
    .set({
      sectionId: params.targetSectionId,
      order: params.newOrder,
    })
    .where(eq(lesson.id, params.lessonId))
    .returning();

  return updated ?? null;
}

export async function searchCourseCoLeadCandidates(
  database: Database,
  params: { courseId: string; search: string }
) {
  return database
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .leftJoin(
      courseInstructor,
      and(
        eq(courseInstructor.userId, user.id),
        eq(courseInstructor.courseId, params.courseId)
      )
    )
    .where(
      and(
        eq(user.role, "content_creator"),
        params.search
          ? or(
              ilike(user.name, `%${params.search}%`),
              ilike(user.email, `%${params.search}%`)
            )
          : undefined,
        sql`${courseInstructor.userId} is null`
      )
    )
    .limit(20);
}

export async function addCourseCoLead(
  database: Database,
  params: { courseId: string; userId: string; addedBy: string }
) {
  await database
    .insert(courseInstructor)
    .values({
      courseId: params.courseId,
      userId: params.userId,
      role: "secondary",
      addedBy: params.addedBy,
    })
    .onConflictDoNothing();
}

export async function removeCourseCoLead(
  database: Database,
  params: { courseId: string; userId: string }
) {
  await database
    .delete(courseInstructor)
    .where(
      and(
        eq(courseInstructor.courseId, params.courseId),
        eq(courseInstructor.userId, params.userId),
        eq(courseInstructor.role, "secondary")
      )
    );
}

// ---------------------------------------------------------------------------
// Enrollment queries
// ---------------------------------------------------------------------------

/**
 * Create an enrollment for a user in a course within an org/cohort context.
 */
export async function createEnrollment(
  database: Database,
  params: {
    userId: string;
    courseId: string;
    organizationId: string;
    cohortId: string;
    source: EnrollmentSource;
  }
) {
  const [row] = await database
    .insert(enrollment)
    .values({
      userId: params.userId,
      courseId: params.courseId,
      organizationId: params.organizationId,
      cohortId: params.cohortId,
      source: params.source,
      status: "active",
    })
    .onConflictDoNothing({
      target: [enrollment.userId, enrollment.courseId, enrollment.cohortId],
    })
    .returning({ id: enrollment.id });

  return row ?? null;
}

/**
 * List courses assigned to any cohort the user belongs to in a given org.
 * Includes enrollment status and progress for the current user.
 */
export async function listOrgCourses(
  database: Database,
  params: {
    userId: string;
    organizationId: string;
  }
) {
  const rows = await database
    .select({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      imageUrl: course.imageUrl,
      difficulty: course.difficulty,
      cohortId: courseAssignment.cohortId,
      cohortName: cohort.name,
      enrollmentId: enrollment.id,
      lessonCount:
        sql<number>`(SELECT count(*)::int FROM "lesson" l JOIN "section" s ON l."section_id" = s."id" WHERE s."course_id" = ${course.id})`.as(
          "lesson_count"
        ),
      completedLessonCount:
        sql<number>`COALESCE((SELECT count(*)::int FROM "lesson_progress" lp WHERE lp."enrollment_id" = ${enrollment.id} AND lp."completed_at" IS NOT NULL), 0)`.as(
          "completed_lesson_count"
        ),
    })
    .from(courseAssignment)
    .innerJoin(course, eq(course.id, courseAssignment.courseId))
    .innerJoin(cohort, eq(cohort.id, courseAssignment.cohortId))
    .innerJoin(
      cohort_member,
      and(
        eq(cohort_member.teamId, courseAssignment.cohortId),
        eq(cohort_member.userId, params.userId)
      )
    )
    .leftJoin(
      enrollment,
      and(
        eq(enrollment.courseId, course.id),
        eq(enrollment.cohortId, courseAssignment.cohortId),
        eq(enrollment.userId, params.userId)
      )
    )
    .where(eq(courseAssignment.organizationId, params.organizationId))
    .orderBy(desc(courseAssignment.assignedAt));

  // Group by course, aggregate cohorts
  const courseMap = new Map<
    string,
    {
      id: string;
      title: string;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      difficulty: string;
      cohorts: { id: string; name: string }[];
      lessonCount: number;
      completedLessonCount: number;
      isEnrolled: boolean;
    }
  >();

  for (const row of rows) {
    const existing = courseMap.get(row.id);
    if (existing) {
      if (!existing.cohorts.some((c) => c.id === row.cohortId)) {
        existing.cohorts.push({ id: row.cohortId, name: row.cohortName });
      }
    } else {
      courseMap.set(row.id, {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        imageUrl: row.imageUrl,
        difficulty: row.difficulty,
        cohorts: [{ id: row.cohortId, name: row.cohortName }],
        lessonCount: row.lessonCount,
        completedLessonCount: row.completedLessonCount,
        isEnrolled: !!row.enrollmentId,
      });
    }
  }

  return { courses: Array.from(courseMap.values()) };
}

/**
 * List all published courses that can be assigned to cohorts.
 */
export async function listAssignableCourses(database: Database) {
  const rows = await database
    .select({
      id: course.id,
      title: course.title,
      slug: course.slug,
    })
    .from(course)
    .where(eq(course.status, "published"))
    .orderBy(asc(course.title));

  return { courses: rows };
}

/**
 * List courses assigned to a specific cohort.
 */
export async function listCohortCourses(
  database: Database,
  params: { cohortId: string }
) {
  const rows = await database
    .select({
      courseId: course.id,
      title: course.title,
      slug: course.slug,
      assignedAt: courseAssignment.assignedAt,
      status: course.status,
    })
    .from(courseAssignment)
    .innerJoin(course, eq(course.id, courseAssignment.courseId))
    .where(eq(courseAssignment.cohortId, params.cohortId))
    .orderBy(desc(courseAssignment.assignedAt));

  return { courses: rows };
}

/**
 * Assign a course to a cohort under an org.
 */
export async function assignCourseToCohort(
  database: Database,
  params: {
    courseId: string;
    cohortId: string;
    organizationId: string;
    assignedBy: string;
  }
) {
  const [row] = await database
    .insert(courseAssignment)
    .values({
      courseId: params.courseId,
      organizationId: params.organizationId,
      cohortId: params.cohortId,
      assignedBy: params.assignedBy,
    })
    .onConflictDoNothing()
    .returning({ id: courseAssignment.id });

  return row ?? null;
}

/**
 * Unassign a course from a cohort.
 */
export async function unassignCourseFromCohort(
  database: Database,
  params: { courseId: string; cohortId: string }
) {
  await database
    .delete(courseAssignment)
    .where(
      and(
        eq(courseAssignment.courseId, params.courseId),
        eq(courseAssignment.cohortId, params.cohortId)
      )
    );
}

/**
 * Get enrolled course with sections, lessons, lock states, and completion status.
 * Used for the learn page sidebar.
 */
export async function getEnrolledCourse(
  database: Database,
  params: {
    courseId: string;
    userId: string;
    organizationId: string;
  }
) {
  // Find enrollment
  const [enrollmentRow] = await database
    .select({
      id: enrollment.id,
      cohortId: enrollment.cohortId,
    })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.courseId, params.courseId),
        eq(enrollment.userId, params.userId),
        eq(enrollment.organizationId, params.organizationId),
        inArray(enrollment.status, ["active", "completed"])
      )
    )
    .limit(1);

  if (!enrollmentRow) {
    throw new NotFoundError("No active enrollment found for this course");
  }

  // Get course info
  const [courseRow] = await database
    .select({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      imageUrl: course.imageUrl,
      difficulty: course.difficulty,
    })
    .from(course)
    .where(eq(course.id, params.courseId))
    .limit(1);

  if (!courseRow) {
    throw new NotFoundError("Course not found");
  }

  // Get sections with lessons
  const sectionRows = await database
    .select({
      id: section.id,
      title: section.title,
      order: section.order,
      isLocked: cohortSectionSettings.isLocked,
      dueDate: cohortSectionSettings.dueDate,
    })
    .from(section)
    .leftJoin(
      cohortSectionSettings,
      and(
        eq(cohortSectionSettings.sectionId, section.id),
        eq(cohortSectionSettings.cohortId, enrollmentRow.cohortId)
      )
    )
    .where(eq(section.courseId, params.courseId))
    .orderBy(asc(section.order));

  const lessonRows = await database
    .select({
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      type: normalizedLessonType().as("type"),
      order: lesson.order,
      estimatedDuration: lesson.estimatedDuration,
      isLocked: cohortLessonSettings.isLocked,
      dueDate: cohortLessonSettings.dueDate,
      completedAt: lessonProgress.completedAt,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .leftJoin(
      cohortLessonSettings,
      and(
        eq(cohortLessonSettings.lessonId, lesson.id),
        eq(cohortLessonSettings.cohortId, enrollmentRow.cohortId)
      )
    )
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.lessonId, lesson.id),
        eq(lessonProgress.enrollmentId, enrollmentRow.id)
      )
    )
    .where(eq(section.courseId, params.courseId))
    .orderBy(asc(lesson.order));

  const sections = sectionRows.map((s) => ({
    id: s.id,
    title: s.title,
    order: s.order,
    isLocked: s.isLocked ?? false,
    dueDate: s.dueDate,
    lessons: lessonRows
      .filter((l) => l.sectionId === s.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        order: l.order,
        estimatedDuration: l.estimatedDuration,
        isLocked: (s.isLocked ?? false) || (l.isLocked ?? false),
        dueDate: l.dueDate,
        isCompleted: !!l.completedAt,
      })),
  }));

  const totalLessons = lessonRows.length;
  const completedLessons = lessonRows.filter((l) => l.completedAt).length;

  return {
    course: courseRow,
    enrollmentId: enrollmentRow.id,
    cohortId: enrollmentRow.cohortId,
    sections,
    progress: {
      total: totalLessons,
      completed: completedLessons,
      percent:
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
    },
  };
}

/**
 * Get a single lesson for the learn viewer with navigation info.
 */
export async function getEnrolledLesson(
  database: Database,
  params: {
    courseId: string;
    lessonId: string;
    userId: string;
    organizationId: string;
  }
) {
  // Find enrollment
  const [enrollmentRow] = await database
    .select({
      id: enrollment.id,
      cohortId: enrollment.cohortId,
    })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.courseId, params.courseId),
        eq(enrollment.userId, params.userId),
        eq(enrollment.organizationId, params.organizationId),
        inArray(enrollment.status, ["active", "completed"])
      )
    )
    .limit(1);

  if (!enrollmentRow) {
    throw new NotFoundError("No active enrollment found for this course");
  }

  // Get lesson with course title
  const [lessonRow] = await database
    .select({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      type: normalizedLessonType().as("type"),
      order: lesson.order,
      sectionId: lesson.sectionId,
      courseTitle: course.title,
      isLocked: cohortLessonSettings.isLocked,
      completedAt: lessonProgress.completedAt,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .innerJoin(course, eq(course.id, section.courseId))
    .leftJoin(
      cohortLessonSettings,
      and(
        eq(cohortLessonSettings.lessonId, lesson.id),
        eq(cohortLessonSettings.cohortId, enrollmentRow.cohortId)
      )
    )
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.lessonId, lesson.id),
        eq(lessonProgress.enrollmentId, enrollmentRow.id)
      )
    )
    .where(
      and(eq(lesson.id, params.lessonId), eq(section.courseId, params.courseId))
    )
    .limit(1);

  if (!lessonRow) {
    throw new NotFoundError("Lesson not found");
  }

  // Check section lock
  const [sectionLock] = await database
    .select({ isLocked: cohortSectionSettings.isLocked })
    .from(cohortSectionSettings)
    .where(
      and(
        eq(cohortSectionSettings.sectionId, lessonRow.sectionId),
        eq(cohortSectionSettings.cohortId, enrollmentRow.cohortId)
      )
    )
    .limit(1);

  const isLocked =
    (sectionLock?.isLocked ?? false) || (lessonRow.isLocked ?? false);

  // Build nav (ordered lessons for this course)
  const allLessons = await database
    .select({
      id: lesson.id,
      order: lesson.order,
      sectionOrder: section.order,
      isLocked: cohortLessonSettings.isLocked,
      sectionIsLocked: cohortSectionSettings.isLocked,
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .leftJoin(
      cohortLessonSettings,
      and(
        eq(cohortLessonSettings.lessonId, lesson.id),
        eq(cohortLessonSettings.cohortId, enrollmentRow.cohortId)
      )
    )
    .leftJoin(
      cohortSectionSettings,
      and(
        eq(cohortSectionSettings.sectionId, section.id),
        eq(cohortSectionSettings.cohortId, enrollmentRow.cohortId)
      )
    )
    .where(eq(section.courseId, params.courseId))
    .orderBy(asc(section.order), asc(lesson.order));

  const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId);
  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const next =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return {
    course: { title: lessonRow.courseTitle },
    lesson: {
      id: lessonRow.id,
      title: lessonRow.title,
      content: lessonRow.content,
      type: lessonRow.type,
      isCompleted: !!lessonRow.completedAt,
      isLocked,
    },
    nav: {
      prevLessonId: prev?.id ?? null,
      nextLessonId: next?.id ?? null,
      nextIsLocked: next
        ? (next.sectionIsLocked ?? false) || (next.isLocked ?? false)
        : false,
    },
  };
}

/**
 * Mark a lesson as complete for an enrollment.
 */
export async function markLessonComplete(
  database: Database,
  params: {
    courseId: string;
    lessonId: string;
    userId: string;
    organizationId: string;
  }
) {
  // Find enrollment
  const [enrollmentRow] = await database
    .select({ id: enrollment.id })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.courseId, params.courseId),
        eq(enrollment.userId, params.userId),
        eq(enrollment.organizationId, params.organizationId),
        inArray(enrollment.status, ["active", "completed"])
      )
    )
    .limit(1);

  if (!enrollmentRow) {
    throw new NotFoundError("No accessible enrollment found");
  }

  // Upsert lesson progress
  await database
    .insert(lessonProgress)
    .values({
      enrollmentId: enrollmentRow.id,
      lessonId: params.lessonId,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.enrollmentId, lessonProgress.lessonId],
      set: { completedAt: new Date() },
    });

  // Check if all lessons are complete
  const [totals] = await database
    .select({
      totalLessons: count(lesson.id),
      completedLessons:
        sql<number>`(SELECT count(*)::int FROM "lesson_progress" lp WHERE lp."enrollment_id" = ${enrollmentRow.id} AND lp."completed_at" IS NOT NULL)`.as(
          "completed_lessons"
        ),
    })
    .from(lesson)
    .innerJoin(section, eq(section.id, lesson.sectionId))
    .where(eq(section.courseId, params.courseId));

  const allComplete =
    totals && Number(totals.totalLessons) === Number(totals.completedLessons);

  if (allComplete) {
    await database
      .update(enrollment)
      .set({ status: "completed", completedAt: new Date() })
      .where(
        and(
          eq(enrollment.id, enrollmentRow.id),
          eq(enrollment.status, "active")
        )
      );
  }

  return { success: true, allComplete: !!allComplete };
}

/**
 * Check if a user is enrolled in a course (any org/cohort).
 * Returns the enrollment id and status if found.
 */
export async function getEnrollmentStatus(
  database: Database,
  params: { courseId: string; userId: string }
) {
  const [row] = await database
    .select({
      id: enrollment.id,
      status: enrollment.status,
      cohortId: enrollment.cohortId,
      organizationId: enrollment.organizationId,
    })
    .from(enrollment)
    .where(
      and(
        eq(enrollment.courseId, params.courseId),
        eq(enrollment.userId, params.userId),
        inArray(enrollment.status, ["active", "completed"])
      )
    )
    .limit(1);

  return row ?? null;
}

/**
 * Public enrollment: enroll user under platform org + General cohort.
 * Skips cohort assignment check since published courses are open to public.
 */
export async function enrollPublic(
  database: Database,
  params: { courseId: string; userId: string }
) {
  // Verify course is published
  const [courseRow] = await database
    .select({ id: course.id })
    .from(course)
    .where(and(eq(course.id, params.courseId), eq(course.status, "published")))
    .limit(1);

  if (!courseRow) {
    return { error: "course_not_found" as const };
  }

  // Get platform org + cohort
  const publicIds = await getPublicOrgAndCohortIds(database);
  if (!publicIds) {
    return { error: "platform_org_missing" as const };
  }

  const result = await createEnrollment(database, {
    userId: params.userId,
    courseId: params.courseId,
    organizationId: publicIds.orgId,
    cohortId: publicIds.cohortId,
    source: "public",
  });

  if (!result) {
    return { error: "already_enrolled" as const };
  }

  return { enrollmentId: result.id };
}

/**
 * List all enrolled courses for a user with progress summary.
 * Used for the "My Journey" page.
 */
export async function listMyEnrollments(
  database: Database,
  params: { userId: string }
) {
  const enrollments = await database
    .select({
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: course.slug,
      courseDescription: course.description,
      courseImageUrl: course.imageUrl,
      courseDifficulty: course.difficulty,
      courseEstimatedDuration: course.estimatedDuration,
      cohortId: enrollment.cohortId,
    })
    .from(enrollment)
    .innerJoin(course, eq(course.id, enrollment.courseId))
    .where(
      and(
        eq(enrollment.userId, params.userId),
        ne(enrollment.status, "dropped")
      )
    )
    .orderBy(desc(enrollment.enrolledAt));

  if (enrollments.length === 0) {
    return { enrollments: [] };
  }

  // Get sections + lessons + progress for each course
  const courseIds = [...new Set(enrollments.map((e) => e.courseId))];

  const sectionRows = await database
    .select({
      id: section.id,
      courseId: section.courseId,
      title: section.title,
      order: section.order,
    })
    .from(section)
    .where(inArray(section.courseId, courseIds))
    .orderBy(asc(section.courseId), asc(section.order));

  const sectionIds = sectionRows.map((s) => s.id);

  const lessonRows =
    sectionIds.length > 0
      ? await database
          .select({
            id: lesson.id,
            sectionId: lesson.sectionId,
            title: lesson.title,
            type: normalizedLessonType().as("type"),
            order: lesson.order,
          })
          .from(lesson)
          .where(inArray(lesson.sectionId, sectionIds))
          .orderBy(asc(lesson.order))
      : [];

  const enrollmentIds = enrollments.map((e) => e.enrollmentId);

  const progressRows =
    enrollmentIds.length > 0
      ? await database
          .select({
            enrollmentId: lessonProgress.enrollmentId,
            lessonId: lessonProgress.lessonId,
            startedAt: lessonProgress.startedAt,
            completedAt: lessonProgress.completedAt,
          })
          .from(lessonProgress)
          .where(inArray(lessonProgress.enrollmentId, enrollmentIds))
      : [];

  // Build progress map: enrollmentId -> Set of completed lesson IDs
  const completedMap = new Map<string, Set<string>>();
  const startedMap = new Map<string, Set<string>>();
  for (const p of progressRows) {
    if (p.completedAt) {
      const set = completedMap.get(p.enrollmentId) ?? new Set();
      set.add(p.lessonId);
      completedMap.set(p.enrollmentId, set);
    } else {
      const set = startedMap.get(p.enrollmentId) ?? new Set();
      set.add(p.lessonId);
      startedMap.set(p.enrollmentId, set);
    }
  }

  // Build sections map: courseId -> sections with lessons
  const sectionsByCourse = new Map<
    string,
    {
      id: string;
      title: string;
      order: number;
      lessons: { id: string; title: string; type: string; order: number }[];
    }[]
  >();
  for (const s of sectionRows) {
    const arr = sectionsByCourse.get(s.courseId) ?? [];
    arr.push({
      id: s.id,
      title: s.title,
      order: s.order,
      lessons: lessonRows
        .filter((l) => l.sectionId === s.id)
        .map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          order: l.order,
        })),
    });
    sectionsByCourse.set(s.courseId, arr);
  }

  return {
    enrollments: enrollments.map((e) => {
      const sections = sectionsByCourse.get(e.courseId) ?? [];
      const totalLessons = sections.reduce(
        (acc, s) => acc + s.lessons.length,
        0
      );
      const completed = completedMap.get(e.enrollmentId) ?? new Set();
      const started = startedMap.get(e.enrollmentId) ?? new Set();
      const completedCount = completed.size;
      const percent =
        totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

      return {
        enrollmentId: e.enrollmentId,
        status: e.enrollmentStatus,
        enrolledAt: e.enrolledAt,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        course: {
          id: e.courseId,
          title: e.courseTitle,
          slug: e.courseSlug,
          description: e.courseDescription,
          imageUrl: e.courseImageUrl,
          difficulty: e.courseDifficulty,
          estimatedDuration: e.courseEstimatedDuration,
        },
        sections: sections.map((s) => ({
          ...s,
          lessons: s.lessons.map((l) => ({
            ...l,
            isCompleted: completed.has(l.id),
            isStarted: started.has(l.id),
          })),
        })),
        progress: {
          total: totalLessons,
          completed: completedCount,
          percent,
        },
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Admin: list enrollments (public platform)
// ---------------------------------------------------------------------------

interface ListAdminEnrollmentsParams {
  limit: number;
  offset: number;
  search?: string;
  filterStatus?: EnrollmentStatus;
  filterSource?: EnrollmentSource;
}

export async function listAdminEnrollments(
  database: Database,
  params: ListAdminEnrollmentsParams
) {
  const conditions = [eq(organization.slug, PUBLIC_ORG_SLUG)];

  if (params.filterStatus) {
    conditions.push(eq(enrollment.status, params.filterStatus));
  }
  if (params.filterSource) {
    conditions.push(eq(enrollment.source, params.filterSource));
  }
  if (params.search) {
    conditions.push(
      or(
        ilike(user.name, `%${params.search}%`),
        ilike(user.email, `%${params.search}%`),
        ilike(course.title, `%${params.search}%`)
      )!
    );
  }

  const where = and(...conditions);

  const rows = await database
    .select({
      id: enrollment.id,
      status: enrollment.status,
      source: enrollment.source,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
      courseTitle: course.title,
      courseSlug: course.slug,
      lessonsCompleted: sql<number>`(
        SELECT COUNT(*)::int FROM lesson_progress lp
        WHERE lp.enrollment_id = ${enrollment.id}
          AND lp.completed_at IS NOT NULL
      )`.mapWith(Number),
      lessonsTotal: sql<number>`(
        SELECT COUNT(*)::int FROM lesson l
        INNER JOIN section s ON s.id = l.section_id
        WHERE s.course_id = ${enrollment.courseId}
      )`.mapWith(Number),
      _total: sql<number>`count(*) OVER()`.mapWith(Number).as("_total"),
    })
    .from(enrollment)
    .innerJoin(user, eq(enrollment.userId, user.id))
    .innerJoin(course, eq(enrollment.courseId, course.id))
    .innerJoin(organization, eq(enrollment.organizationId, organization.id))
    .where(where)
    .orderBy(desc(enrollment.enrolledAt))
    .limit(params.limit)
    .offset(params.offset);

  const total = rows[0]?._total ?? 0;
  const enrollments = rows.map(({ _total, ...row }) => row);

  return { enrollments, total };
}
