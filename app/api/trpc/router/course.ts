import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  max,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import {
  getCourseAccess,
  hasCourseAccessForLearning,
} from "@/packages/db/queries/course";
import { cohort, cohort_member, member, user } from "@/packages/db/schema/auth";
import {
  category,
  cohortCourse,
  cohortLessonDueDate,
  cohortSectionDueDate,
  course,
  courseCategory,
  courseInstructor,
  enrollment,
  lesson,
  lessonCompletion,
  section,
} from "@/packages/db/schema/course";
import {
  assignCourseToCohortSchema,
  createCourseSchema,
  createLessonSchema,
  createSectionSchema,
  deleteCourseSchema,
  deleteLessonSchema,
  deleteSectionSchema,
  getEnrolledCourseSchema,
  getEnrolledLessonSchema,
  listCoursesSchema,
  listLibrarySchema,
  markLessonCompleteSchema,
  moveLessonSchema,
  reorderLessonsSchema,
  reorderSectionsSchema,
  setLessonDueDateSchema,
  setSectionDueDateSchema,
  unassignCourseFromCohortSchema,
  updateCourseSchema,
  updateLessonSchema,
  updateSectionSchema,
} from "@/packages/utils/course-schemas";
import { protectedProcedure, publicProcedure, router, t } from "../init";

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

const instructorMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  const role = ctx.session.user.role;
  if (role !== "content_creator" && role !== "platform_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Content creator or platform admin access required",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

const instructorProcedure = protectedProcedure.use(instructorMiddleware);

function getActiveOrganizationIdFromSession(
  session: {
    session?: { activeOrganizationId?: string; activeTeamId?: string };
  } | null
): string {
  const orgId = session?.session?.activeOrganizationId;
  if (!orgId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No organization selected",
    });
  }
  return orgId;
}

const orgCourseMemberMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  const orgId = getActiveOrganizationIdFromSession(
    ctx.session as {
      session?: { activeOrganizationId?: string; activeTeamId?: string };
    }
  );
  const [memberRow] = await ctx.db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, orgId),
        eq(member.userId, ctx.session.user.id)
      )
    )
    .limit(1);
  if (!memberRow) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this organization",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      orgId,
      orgMemberRole: memberRow.role,
    },
  });
});

const orgCourseProcedure = protectedProcedure.use(orgCourseMemberMiddleware);

const orgCourseManageProcedure = orgCourseProcedure.use(
  async ({ next, ctx }) => {
    if (
      ctx.orgMemberRole !== "org_owner" &&
      ctx.orgMemberRole !== "org_admin"
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Org owner or admin access required",
      });
    }
    return next({ ctx });
  }
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertCourseAccess(
  db: Parameters<typeof getCourseAccess>[0],
  courseId: string,
  userId: string,
  userRole: string | null
) {
  const result = await getCourseAccess(db, { courseId, userId, userRole });
  if (!result) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this course",
    });
  }
  return result;
}

async function assertEnrolledCourseAccess(
  db: Parameters<typeof getCourseAccess>[0],
  courseId: string,
  userId: string,
  organizationId: string,
  cohortId?: string | null
) {
  const [courseRow] = await db
    .select({ id: course.id, title: course.title, status: course.status })
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!courseRow) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Course not found",
    });
  }

  if (courseRow.status !== "published") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This course is not available for learning",
    });
  }

  const hasAccess = await hasCourseAccessForLearning(db, {
    courseId,
    userId,
    organizationId,
    cohortId,
  });

  if (!hasAccess) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not enrolled in this course",
    });
  }

  return { courseRow };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const courseRouter = router({
  listPublic: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(12),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const courses = await db
        .select({
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
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
        })
        .from(course)
        .where(eq(course.status, "published"))
        .orderBy(desc(course.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      const [totalResult] = await db
        .select({ count: count() })
        .from(course)
        .where(eq(course.status, "published"));

      return {
        courses,
        total: totalResult?.count ?? 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  getPublicBySlugOrId: publicProcedure
    .input(z.object({ slugOrId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const [courseRow] = await db
        .select({
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          imageUrl: course.imageUrl,
          difficulty: course.difficulty,
          estimatedDuration: course.estimatedDuration,
          status: course.status,
        })
        .from(course)
        .where(
          or(eq(course.id, input.slugOrId), eq(course.slug, input.slugOrId))
        )
        .limit(1);

      if (!courseRow || courseRow.status !== "published") {
        return null;
      }

      const [sections, enrollmentCount, lessonCount] = await Promise.all([
        db
          .select({
            id: section.id,
            title: section.title,
            description: section.description,
            order: section.order,
          })
          .from(section)
          .where(eq(section.courseId, courseRow.id))
          .orderBy(asc(section.order)),
        db
          .select({ count: count() })
          .from(enrollment)
          .where(eq(enrollment.courseId, courseRow.id)),
        db
          .select({ count: count() })
          .from(lesson)
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(eq(section.courseId, courseRow.id)),
      ]);

      const sectionIds = sections.map((s) => s.id);
      const lessons =
        sectionIds.length > 0
          ? await db
              .select({
                id: lesson.id,
                sectionId: lesson.sectionId,
                title: lesson.title,
                type: lesson.type,
                order: lesson.order,
                isLocked: lesson.isLocked,
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
        enrollmentCount: enrollmentCount[0]?.count ?? 0,
        lessonCount: lessonCount[0]?.count ?? 0,
      };
    }),

  isEnrolled: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const orgId = getActiveOrganizationIdFromSession(
        session as {
          session?: { activeOrganizationId?: string; activeTeamId?: string };
        }
      );
      const [row] = await db
        .select({ id: enrollment.id })
        .from(enrollment)
        .where(
          and(
            eq(enrollment.userId, session.user.id),
            eq(enrollment.courseId, input.courseId),
            eq(enrollment.organizationId, orgId)
          )
        )
        .limit(1);
      return { enrolled: !!row };
    }),

  list: instructorProcedure
    .input(listCoursesSchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        offset,
        search,
        sortBy,
        sortDirection,
        filterStatuses,
        filterDifficulties,
        filterCategoryIds,
      } = input;
      const { db, session } = ctx;
      const isAdmin = session.user.role === "platform_admin";

      const conditions: Parameters<typeof and>[0][] = [];
      if (filterStatuses?.length) {
        conditions.push(inArray(course.status, filterStatuses));
      }
      if (filterDifficulties?.length) {
        conditions.push(inArray(course.difficulty, filterDifficulties));
      }
      if (filterCategoryIds?.length) {
        conditions.push(
          exists(
            db
              .select({ one: sql`1` })
              .from(courseCategory)
              .where(
                and(
                  eq(courseCategory.courseId, course.id),
                  inArray(courseCategory.categoryId, filterCategoryIds)
                )
              )
          )
        );
      }
      if (!isAdmin) {
        conditions.push(
          exists(
            db
              .select({ one: sql`1` })
              .from(courseInstructor)
              .where(
                and(
                  eq(courseInstructor.courseId, course.id),
                  eq(courseInstructor.userId, session.user.id)
                )
              )
          )
        );
      }
      if (search) {
        conditions.push(
          or(
            ilike(course.title, `%${search}%`),
            ilike(course.description, `%${search}%`)
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
      const orderColumn = ORDER_COLUMNS[sortBy];
      const orderBy =
        sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);

      const [courses, totalResult, categoryRows] = await Promise.all([
        db
          .select({
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
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
          })
          .from(course)
          .where(where)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(course).where(where),
        db
          .select({
            courseId: courseCategory.courseId,
            id: category.id,
            name: category.name,
            slug: category.slug,
            order: category.order,
          })
          .from(courseCategory)
          .innerJoin(category, eq(category.id, courseCategory.categoryId)),
      ]);

      const categoriesByCourse = new Map<
        string,
        { id: string; name: string; slug: string; order: number | null }[]
      >();
      for (const row of categoryRows) {
        const arr = categoriesByCourse.get(row.courseId) ?? [];
        arr.push({
          id: row.id,
          name: row.name,
          slug: row.slug,
          order: row.order,
        });
        categoriesByCourse.set(row.courseId, arr);
      }

      return {
        courses: courses.map((c) => ({
          ...c,
          categories: categoriesByCourse.get(c.id) ?? [],
        })),
        total: totalResult[0]?.count ?? 0,
        limit,
        offset,
      };
    }),

  listLibrary: protectedProcedure
    .input(listLibrarySchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        offset,
        search,
        sortBy,
        sortDirection,
        filterDifficulties,
      } = input;
      const { db, session } = ctx;
      const userId = session.user.id;
      const orgId = getActiveOrganizationIdFromSession(
        session as {
          session?: { activeOrganizationId?: string; activeTeamId?: string };
        }
      );

      const conditions: Parameters<typeof and>[0][] = [
        eq(course.status, "published"),
      ];
      if (filterDifficulties?.length) {
        conditions.push(inArray(course.difficulty, filterDifficulties));
      }
      if (search) {
        conditions.push(
          or(
            ilike(course.title, `%${search}%`),
            ilike(course.description, `%${search}%`)
          )
        );
      }
      const where = and(...conditions);
      const ORDER_COLUMNS = {
        title: course.title,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      } as const;
      const orderBy =
        sortDirection === "asc"
          ? asc(ORDER_COLUMNS[sortBy])
          : desc(ORDER_COLUMNS[sortBy]);

      const [courses, totalResult] = await Promise.all([
        db
          .select({
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
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
          })
          .from(course)
          .where(where)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(course).where(where),
      ]);

      const courseIds = courses.map((c) => c.id);
      if (courseIds.length === 0) {
        return {
          courses: [],
          total: totalResult[0]?.count ?? 0,
          limit,
          offset,
        };
      }

      const [enrolledRows, completedByCourse] = await Promise.all([
        db
          .select({ courseId: enrollment.courseId })
          .from(enrollment)
          .where(
            and(
              eq(enrollment.userId, userId),
              inArray(enrollment.courseId, courseIds),
              eq(enrollment.organizationId, orgId)
            )
          ),
        db
          .select({
            courseId: section.courseId,
            completed: count(lessonCompletion.id),
          })
          .from(lessonCompletion)
          .innerJoin(lesson, eq(lesson.id, lessonCompletion.lessonId))
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(
            and(
              eq(lessonCompletion.userId, userId),
              eq(lessonCompletion.organizationId, orgId),
              inArray(section.courseId, courseIds)
            )
          )
          .groupBy(section.courseId),
      ]);

      const enrolledSet = new Set(enrolledRows.map((r) => r.courseId));
      const completedMap = new Map(
        completedByCourse.map((r) => [r.courseId, Number(r.completed)])
      );

      return {
        courses: courses.map((c) => ({
          ...c,
          isEnrolled: enrolledSet.has(c.id),
          completedLessonCount: completedMap.get(c.id) ?? 0,
        })),
        total: totalResult[0]?.count ?? 0,
        limit,
        offset,
      };
    }),

  getEnrolledCourse: protectedProcedure
    .input(getEnrolledCourseSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const userId = session.user.id;
      const orgId = getActiveOrganizationIdFromSession(
        session as {
          session?: { activeOrganizationId?: string; activeTeamId?: string };
        }
      );
      const cohortId =
        (session as { session?: { activeTeamId?: string } })?.session
          ?.activeTeamId ?? null;
      const { courseRow } = await assertEnrolledCourseAccess(
        db,
        input.courseId,
        userId,
        orgId,
        cohortId
      );

      const [sections, completedRows] = await Promise.all([
        db
          .select({
            id: section.id,
            title: section.title,
            description: section.description,
            order: section.order,
          })
          .from(section)
          .where(eq(section.courseId, input.courseId))
          .orderBy(asc(section.order)),
        db
          .select({ lessonId: lessonCompletion.lessonId })
          .from(lessonCompletion)
          .innerJoin(lesson, eq(lesson.id, lessonCompletion.lessonId))
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(
            and(
              eq(lessonCompletion.userId, userId),
              eq(lessonCompletion.organizationId, orgId),
              eq(section.courseId, input.courseId)
            )
          ),
      ]);

      const completedSet = new Set(completedRows.map((r) => r.lessonId));
      const sectionIds = sections.map((s) => s.id);
      const lessons =
        sectionIds.length > 0
          ? await db
              .select({
                id: lesson.id,
                sectionId: lesson.sectionId,
                title: lesson.title,
                type: lesson.type,
                order: lesson.order,
                isLocked: lesson.isLocked,
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

      const lessonCount = lessons.length;
      const completedLessonCount = completedSet.size;
      const percent =
        lessonCount > 0
          ? Math.round((completedLessonCount / lessonCount) * 100)
          : 0;

      return {
        course: { id: courseRow.id, title: courseRow.title },
        progress: { lessonCount, completedLessonCount, percent },
        sections: sections.map((s) => {
          const sectionLessons = (lessonsBySection.get(s.id) ?? []).map(
            (l) => ({
              ...l,
              isCompleted: completedSet.has(l.id),
            })
          );
          const isCompleted =
            sectionLessons.length > 0 &&
            sectionLessons.every((l) => l.isCompleted === true);
          return { ...s, isCompleted, lessons: sectionLessons };
        }),
      };
    }),

  getEnrolledLesson: protectedProcedure
    .input(getEnrolledLessonSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const userId = session.user.id;
      const orgId = getActiveOrganizationIdFromSession(
        session as {
          session?: { activeOrganizationId?: string; activeTeamId?: string };
        }
      );
      const cohortId =
        (session as { session?: { activeTeamId?: string } })?.session
          ?.activeTeamId ?? null;
      const { courseRow } = await assertEnrolledCourseAccess(
        db,
        input.courseId,
        userId,
        orgId,
        cohortId
      );

      const [lessonRow] = await db
        .select({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          type: lesson.type,
          isLocked: lesson.isLocked,
          estimatedDuration: lesson.estimatedDuration,
          sectionId: lesson.sectionId,
        })
        .from(lesson)
        .innerJoin(section, eq(section.id, lesson.sectionId))
        .where(
          and(
            eq(lesson.id, input.lessonId),
            eq(section.courseId, input.courseId)
          )
        )
        .limit(1);

      if (!lessonRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      if (lessonRow.isLocked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This lesson is locked",
        });
      }

      const [isCompletedRow, orderedLessons] = await Promise.all([
        db
          .select({ id: lessonCompletion.id })
          .from(lessonCompletion)
          .where(
            and(
              eq(lessonCompletion.userId, userId),
              eq(lessonCompletion.lessonId, lessonRow.id),
              eq(lessonCompletion.organizationId, orgId)
            )
          )
          .limit(1),
        db
          .select({ id: lesson.id, isLocked: lesson.isLocked })
          .from(lesson)
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(eq(section.courseId, input.courseId))
          .orderBy(asc(section.order), asc(lesson.order)),
      ]);

      const isCompleted = !!isCompletedRow[0];
      const idx = orderedLessons.findIndex((l) => l.id === lessonRow.id);
      const prevLessonId =
        idx > 0 ? (orderedLessons[idx - 1]?.id ?? null) : null;
      const nextLessonId =
        idx >= 0 && idx < orderedLessons.length - 1
          ? (orderedLessons[idx + 1]?.id ?? null)
          : null;
      const nextIsLocked =
        nextLessonId !== null
          ? (orderedLessons[idx + 1]?.isLocked ?? false)
          : false;

      return {
        course: { id: courseRow.id, title: courseRow.title },
        lesson: {
          id: lessonRow.id,
          title: lessonRow.title,
          content: lessonRow.content,
          type: lessonRow.type,
          estimatedDuration: lessonRow.estimatedDuration,
          isCompleted,
        },
        nav: { prevLessonId, nextLessonId, nextIsLocked },
      };
    }),

  markLessonComplete: protectedProcedure
    .input(markLessonCompleteSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const userId = session.user.id;
      const orgId = getActiveOrganizationIdFromSession(
        session as {
          session?: { activeOrganizationId?: string; activeTeamId?: string };
        }
      );
      const cohortId =
        (session as { session?: { activeTeamId?: string } })?.session
          ?.activeTeamId ?? null;
      await assertEnrolledCourseAccess(
        db,
        input.courseId,
        userId,
        orgId,
        cohortId
      );

      const [lessonRow] = await db
        .select({ id: lesson.id, isLocked: lesson.isLocked })
        .from(lesson)
        .innerJoin(section, eq(section.id, lesson.sectionId))
        .where(
          and(
            eq(lesson.id, input.lessonId),
            eq(section.courseId, input.courseId)
          )
        )
        .limit(1);

      if (!lessonRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      if (lessonRow.isLocked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This lesson is locked",
        });
      }

      await db
        .insert(lessonCompletion)
        .values({ userId, lessonId: lessonRow.id, organizationId: orgId })
        .onConflictDoNothing();

      const [totalLessonsRows, completedLessonsRows] = await Promise.all([
        db
          .select({ totalLessons: count(lesson.id) })
          .from(lesson)
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(eq(section.courseId, input.courseId)),
        db
          .select({ completedLessons: count(lessonCompletion.id) })
          .from(lessonCompletion)
          .innerJoin(lesson, eq(lesson.id, lessonCompletion.lessonId))
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(
            and(
              eq(lessonCompletion.userId, userId),
              eq(lessonCompletion.organizationId, orgId),
              eq(section.courseId, input.courseId)
            )
          ),
      ]);

      const total = Number(totalLessonsRows[0]?.totalLessons ?? 0);
      const completed = Number(completedLessonsRows[0]?.completedLessons ?? 0);
      const courseCompleted = total > 0 && completed >= total;

      if (courseCompleted) {
        await db
          .update(enrollment)
          .set({ completedAt: new Date() })
          .where(
            and(
              eq(enrollment.userId, userId),
              eq(enrollment.courseId, input.courseId),
              eq(enrollment.organizationId, orgId)
            )
          );
      }

      return { completed: true, courseCompleted };
    }),

  enroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const orgId = getActiveOrganizationIdFromSession(
        session as {
          session?: { activeOrganizationId?: string; activeTeamId?: string };
        }
      );
      const [courseRow] = await db
        .select({ id: course.id, status: course.status })
        .from(course)
        .where(eq(course.id, input.courseId))
        .limit(1);

      if (!courseRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      if (courseRow.status !== "published") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only published courses can be enrolled in",
        });
      }

      await db
        .insert(enrollment)
        .values({
          userId: session.user.id,
          courseId: input.courseId,
          organizationId: orgId,
        })
        .onConflictDoNothing();

      return { enrolled: true };
    }),

  getById: instructorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      await assertCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );

      const [courseRow] = await db
        .select()
        .from(course)
        .where(eq(course.id, input.courseId))
        .limit(1);

      if (!courseRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const [sections, instructors, enrollmentCount, categoryRows] =
        await Promise.all([
          db
            .select()
            .from(section)
            .where(eq(section.courseId, input.courseId))
            .orderBy(asc(section.order)),
          db
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
            .where(eq(courseInstructor.courseId, input.courseId)),
          db
            .select({ count: count() })
            .from(enrollment)
            .where(eq(enrollment.courseId, input.courseId)),
          db
            .select({
              id: category.id,
              name: category.name,
              slug: category.slug,
              order: category.order,
            })
            .from(courseCategory)
            .innerJoin(category, eq(category.id, courseCategory.categoryId))
            .where(eq(courseCategory.courseId, input.courseId)),
        ]);

      const sectionIds = sections.map((s) => s.id);
      const lessons =
        sectionIds.length > 0
          ? await db
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
        enrollmentCount: enrollmentCount[0]?.count ?? 0,
        categories: categoryRows,
      };
    }),

  getInstructorAndEnrollments: instructorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      await assertCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );

      const [courseRow] = await db
        .select({ createdBy: course.createdBy })
        .from(course)
        .where(eq(course.id, input.courseId))
        .limit(1);

      if (!courseRow?.createdBy) {
        return {
          mainInstructor: null,
          coCreators: [] as {
            id: string;
            name: string | null;
            email: string;
            image: string | null;
          }[],
          enrolledStudents: [] as {
            id: string;
            name: string | null;
            email: string;
            image: string | null;
            enrolledAt: Date;
          }[],
        };
      }

      const [creatorRow, coCreatorRows, enrolledRows] = await Promise.all([
        db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          })
          .from(user)
          .where(eq(user.id, courseRow.createdBy))
          .limit(1),
        db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          })
          .from(courseInstructor)
          .innerJoin(user, eq(user.id, courseInstructor.userId))
          .where(
            and(
              eq(courseInstructor.courseId, input.courseId),
              eq(courseInstructor.role, "secondary")
            )
          ),
        db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            enrolledAt: enrollment.enrolledAt,
          })
          .from(enrollment)
          .innerJoin(user, eq(user.id, enrollment.userId))
          .where(eq(enrollment.courseId, input.courseId))
          .orderBy(asc(enrollment.enrolledAt)),
      ]);

      const mainInstructor = creatorRow[0]
        ? {
            id: creatorRow[0].id,
            name: creatorRow[0].name,
            email: creatorRow[0].email,
            image: creatorRow[0].image,
          }
        : null;

      const coCreators = coCreatorRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
      }));

      const enrolledStudents = enrolledRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
        enrolledAt: row.enrolledAt,
      }));

      return { mainInstructor, coCreators, enrolledStudents };
    }),

  create: instructorProcedure
    .input(createCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const [existing] = await db
        .select({ id: course.id })
        .from(course)
        .where(eq(course.slug, input.slug))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A course with this slug already exists",
        });
      }

      const [newCourse] = await db
        .insert(course)
        .values({
          title: input.title,
          description: input.description,
          summary: input.summary,
          slug: input.slug,
          imageUrl: input.imageUrl,
          difficulty: input.difficulty,
          estimatedDuration: input.estimatedDuration,
          status: input.status,
          createdBy: session.user.id,
        })
        .returning();

      await db.insert(courseInstructor).values({
        courseId: newCourse.id,
        userId: session.user.id,
        role: "main",
        addedBy: session.user.id,
      });

      if (input.categoryIds?.length) {
        await db.insert(courseCategory).values(
          input.categoryIds.map((categoryId) => ({
            courseId: newCourse.id,
            categoryId,
          }))
        );
      }

      return newCourse;
    }),

  update: instructorProcedure
    .input(updateCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { courseId, ...data } = input;
      await assertCourseAccess(
        db,
        courseId,
        session.user.id,
        session.user.role ?? null
      );

      if (data.slug) {
        const [existing] = await db
          .select({ id: course.id })
          .from(course)
          .where(
            and(eq(course.slug, data.slug), sql`${course.id} != ${courseId}`)
          )
          .limit(1);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A course with this slug already exists",
          });
        }
      }

      const UPDATABLE_FIELDS = [
        "title",
        "description",
        "summary",
        "slug",
        "imageUrl",
        "difficulty",
        "estimatedDuration",
        "status",
      ] as const;

      const updateData: Record<string, unknown> = {};
      for (const key of UPDATABLE_FIELDS) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      const hasCategoryUpdate = data.categoryIds !== undefined;
      if (Object.keys(updateData).length === 0 && !hasCategoryUpdate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      let updated: typeof course.$inferSelect | undefined;
      if (Object.keys(updateData).length > 0) {
        const [updatedRow] = await db
          .update(course)
          .set(updateData)
          .where(eq(course.id, courseId))
          .returning();
        if (!updatedRow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found",
          });
        }
        updated = updatedRow;
      } else {
        // Category-only update: fetch current row for return value
        const [existingRow] = await db
          .select()
          .from(course)
          .where(eq(course.id, courseId))
          .limit(1);
        if (!existingRow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found",
          });
        }
        updated = existingRow;
      }

      if (data.categoryIds !== undefined) {
        await db
          .delete(courseCategory)
          .where(eq(courseCategory.courseId, courseId));
        if (data.categoryIds.length > 0) {
          await db.insert(courseCategory).values(
            data.categoryIds.map((categoryId) => ({
              courseId,
              categoryId,
            }))
          );
        }
      }

      return updated;
    }),

  delete: instructorProcedure
    .input(deleteCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { instructorRole } = await assertCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );

      if (instructorRole !== "admin" && instructorRole !== "main") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Only the main instructor or an admin can delete this course",
        });
      }

      const [deleted] = await db
        .delete(course)
        .where(eq(course.id, input.courseId))
        .returning({ id: course.id });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      return { success: true };
    }),

  createSection: instructorProcedure
    .input(createSectionSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      await assertCourseAccess(
        db,
        input.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      const [maxRow] = await db
        .select({ order: max(section.order) })
        .from(section)
        .where(eq(section.courseId, input.courseId));
      const nextOrder = (maxRow?.order ?? -1) + 1;
      const [created] = await db
        .insert(section)
        .values({
          courseId: input.courseId,
          title: input.title,
          description: input.description,
          order: nextOrder,
        })
        .returning();
      return created;
    }),

  updateSection: instructorProcedure
    .input(updateSectionSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const [sec] = await db
        .select({ courseId: section.courseId })
        .from(section)
        .where(eq(section.id, input.sectionId))
        .limit(1);
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertCourseAccess(
        db,
        sec.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) {
        updateData.title = input.title;
      }
      if (input.description !== undefined) {
        updateData.description = input.description;
      }
      if (input.order !== undefined) {
        updateData.order = input.order;
      }
      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }
      const [updated] = await db
        .update(section)
        .set(updateData)
        .where(eq(section.id, input.sectionId))
        .returning();
      return updated;
    }),

  deleteSection: instructorProcedure
    .input(deleteSectionSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const [sec] = await db
        .select({ courseId: section.courseId })
        .from(section)
        .where(eq(section.id, input.sectionId))
        .limit(1);
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertCourseAccess(
        db,
        sec.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      await db.delete(section).where(eq(section.id, input.sectionId));
      return { success: true };
    }),

  createLesson: instructorProcedure
    .input(createLessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const [sec] = await db
        .select({ id: section.id, courseId: section.courseId })
        .from(section)
        .where(eq(section.id, input.sectionId))
        .limit(1);
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertCourseAccess(
        db,
        sec.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      const [maxRow] = await db
        .select({ order: max(lesson.order) })
        .from(lesson)
        .where(eq(lesson.sectionId, input.sectionId));
      const nextOrder = (maxRow?.order ?? -1) + 1;
      const [created] = await db
        .insert(lesson)
        .values({
          sectionId: input.sectionId,
          title: input.title,
          content: input.content,
          type: input.type ?? "text",
          order: nextOrder,
          isLocked: input.isLocked ?? false,
          estimatedDuration: input.estimatedDuration,
        })
        .returning();
      return created;
    }),

  updateLesson: instructorProcedure
    .input(updateLessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const [les] = await db
        .select({ sectionId: lesson.sectionId })
        .from(lesson)
        .where(eq(lesson.id, input.lessonId))
        .limit(1);
      if (!les) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      const [sec] = await db
        .select({ courseId: section.courseId })
        .from(section)
        .where(eq(section.id, les.sectionId))
        .limit(1);
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertCourseAccess(
        db,
        sec.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      if (input.sectionId !== undefined && input.sectionId !== les.sectionId) {
        const [targetSec] = await db
          .select({ courseId: section.courseId })
          .from(section)
          .where(eq(section.id, input.sectionId))
          .limit(1);
        if (!targetSec || targetSec.courseId !== sec.courseId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot move lesson to a section in a different course",
          });
        }
      }

      const updateData: Record<string, unknown> = {};
      if (input.sectionId !== undefined) {
        updateData.sectionId = input.sectionId;
      }
      if (input.title !== undefined) {
        updateData.title = input.title;
      }
      if (input.content !== undefined) {
        updateData.content = input.content;
      }
      if (input.type !== undefined) {
        updateData.type = input.type;
      }
      if (input.order !== undefined) {
        updateData.order = input.order;
      }
      if (input.isLocked !== undefined) {
        updateData.isLocked = input.isLocked;
      }
      if (input.estimatedDuration !== undefined) {
        updateData.estimatedDuration = input.estimatedDuration;
      }
      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }
      const [updated] = await db
        .update(lesson)
        .set(updateData)
        .where(eq(lesson.id, input.lessonId))
        .returning();
      return updated;
    }),

  deleteLesson: instructorProcedure
    .input(deleteLessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const [les] = await db
        .select({ sectionId: lesson.sectionId })
        .from(lesson)
        .where(eq(lesson.id, input.lessonId))
        .limit(1);
      if (!les) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      const [sec] = await db
        .select({ courseId: section.courseId })
        .from(section)
        .where(eq(section.id, les.sectionId))
        .limit(1);
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertCourseAccess(
        db,
        sec.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      await db.delete(lesson).where(eq(lesson.id, input.lessonId));
      return { success: true };
    }),

  reorderSections: instructorProcedure
    .input(reorderSectionsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      await assertCourseAccess(
        db,
        input.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      await Promise.all(
        input.sectionIds.map((sectionId, index) =>
          db
            .update(section)
            .set({ order: index })
            .where(
              and(
                eq(section.id, sectionId),
                eq(section.courseId, input.courseId)
              )
            )
        )
      );
      return { success: true };
    }),

  reorderLessons: instructorProcedure
    .input(reorderLessonsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const [sec] = await db
        .select({ courseId: section.courseId })
        .from(section)
        .where(eq(section.id, input.sectionId))
        .limit(1);
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertCourseAccess(
        db,
        sec.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      await Promise.all(
        input.lessonIds.map((lessonId, index) =>
          db
            .update(lesson)
            .set({ order: index })
            .where(
              and(
                eq(lesson.id, lessonId),
                eq(lesson.sectionId, input.sectionId)
              )
            )
        )
      );
      return { success: true };
    }),

  moveLesson: instructorProcedure
    .input(moveLessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const [les] = await db
        .select({ sectionId: lesson.sectionId })
        .from(lesson)
        .where(eq(lesson.id, input.lessonId))
        .limit(1);
      if (!les) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      const [sourceSec] = await db
        .select({ courseId: section.courseId })
        .from(section)
        .where(eq(section.id, les.sectionId))
        .limit(1);
      if (!sourceSec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Source section not found",
        });
      }
      const [targetSec] = await db
        .select({ courseId: section.courseId })
        .from(section)
        .where(eq(section.id, input.targetSectionId))
        .limit(1);
      if (!targetSec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Target section not found",
        });
      }
      if (sourceSec.courseId !== targetSec.courseId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot move lesson to a section in a different course",
        });
      }
      await assertCourseAccess(
        db,
        sourceSec.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? null
      );
      const [updated] = await db
        .update(lesson)
        .set({
          sectionId: input.targetSectionId,
          order: input.newOrder,
        })
        .where(eq(lesson.id, input.lessonId))
        .returning();
      return updated;
    }),

  listCoLeads: instructorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const rows = await db
        .select({
          userId: courseInstructor.userId,
          role: courseInstructor.role,
          createdAt: courseInstructor.createdAt,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(courseInstructor)
        .innerJoin(user, eq(user.id, courseInstructor.userId))
        .where(
          and(
            eq(courseInstructor.courseId, input.courseId),
            eq(courseInstructor.role, "secondary")
          )
        );
      return rows;
    }),

  searchCoLeadCandidates: instructorProcedure
    .input(z.object({ courseId: z.string(), search: z.string().default("") }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      // Find existing co-leads so we can exclude them
      const existing = await db
        .select({ userId: courseInstructor.userId })
        .from(courseInstructor)
        .where(eq(courseInstructor.courseId, input.courseId));
      const existingIds = existing.map((r) => r.userId);

      const query = db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(user)
        .where(
          and(
            eq(user.role, "content_creator"),
            input.search
              ? or(
                  ilike(user.name, `%${input.search}%`),
                  ilike(user.email, `%${input.search}%`)
                )
              : undefined
          )
        )
        .limit(20);

      const candidates = await query;
      // Exclude users already on the course (main or secondary)
      return candidates.filter((c) => !existingIds.includes(c.id));
    }),

  addCoLead: instructorProcedure
    .input(z.object({ courseId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { instructorRole } = await assertCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );
      if (instructorRole !== "admin" && instructorRole !== "main") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the creator or platform admin can add co-leads",
        });
      }
      await db
        .insert(courseInstructor)
        .values({
          courseId: input.courseId,
          userId: input.userId,
          role: "secondary",
          addedBy: session.user.id,
        })
        .onConflictDoNothing();
      return { success: true };
    }),

  removeCoLead: instructorProcedure
    .input(z.object({ courseId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { instructorRole } = await assertCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );
      if (instructorRole !== "admin" && instructorRole !== "main") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the creator or platform admin can remove co-leads",
        });
      }
      await db
        .delete(courseInstructor)
        .where(
          and(
            eq(courseInstructor.courseId, input.courseId),
            eq(courseInstructor.userId, input.userId),
            eq(courseInstructor.role, "secondary")
          )
        );
      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // Org: assign/unassign courses to cohorts, set due dates
  // -------------------------------------------------------------------------

  assignCourseToCohort: orgCourseManageProcedure
    .input(assignCourseToCohortSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;
      const [cohortRow] = await db
        .select({ id: cohort.id, organizationId: cohort.organizationId })
        .from(cohort)
        .where(eq(cohort.id, input.cohortId))
        .limit(1);
      if (!cohortRow || cohortRow.organizationId !== orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cohort not found or does not belong to your organization",
        });
      }
      const [courseRow] = await db
        .select({ id: course.id })
        .from(course)
        .where(eq(course.id, input.courseId))
        .limit(1);
      if (!courseRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      await db
        .insert(cohortCourse)
        .values({ cohortId: input.cohortId, courseId: input.courseId })
        .onConflictDoNothing();
      return { success: true };
    }),

  unassignCourseFromCohort: orgCourseManageProcedure
    .input(unassignCourseFromCohortSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;
      const [cohortRow] = await db
        .select({ id: cohort.id, organizationId: cohort.organizationId })
        .from(cohort)
        .where(eq(cohort.id, input.cohortId))
        .limit(1);
      if (!cohortRow || cohortRow.organizationId !== orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cohort not found or does not belong to your organization",
        });
      }
      await db
        .delete(cohortCourse)
        .where(
          and(
            eq(cohortCourse.cohortId, input.cohortId),
            eq(cohortCourse.courseId, input.courseId)
          )
        );
      const sectionIds = await db
        .select({ id: section.id })
        .from(section)
        .where(eq(section.courseId, input.courseId));
      const lessonIds = await db
        .select({ id: lesson.id })
        .from(lesson)
        .innerJoin(section, eq(section.id, lesson.sectionId))
        .where(eq(section.courseId, input.courseId));
      if (sectionIds.length > 0) {
        await db.delete(cohortSectionDueDate).where(
          and(
            eq(cohortSectionDueDate.cohortId, input.cohortId),
            inArray(
              cohortSectionDueDate.sectionId,
              sectionIds.map((s) => s.id)
            )
          )
        );
      }
      if (lessonIds.length > 0) {
        await db.delete(cohortLessonDueDate).where(
          and(
            eq(cohortLessonDueDate.cohortId, input.cohortId),
            inArray(
              cohortLessonDueDate.lessonId,
              lessonIds.map((l) => l.id)
            )
          )
        );
      }
      return { success: true };
    }),

  listCohortCourses: orgCourseProcedure
    .input(z.object({ cohortId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, orgId, orgMemberRole } = ctx;
      const [cohortRow] = await db
        .select({ id: cohort.id, organizationId: cohort.organizationId })
        .from(cohort)
        .where(eq(cohort.id, input.cohortId))
        .limit(1);
      if (!cohortRow || cohortRow.organizationId !== orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cohort not found or does not belong to your organization",
        });
      }

      const isManager =
        orgMemberRole === "org_owner" || orgMemberRole === "org_admin";
      if (!isManager) {
        const [cohortMembership] = await db
          .select({ id: cohort_member.id })
          .from(cohort_member)
          .where(
            and(
              eq(cohort_member.teamId, input.cohortId),
              eq(cohort_member.userId, ctx.session.user.id)
            )
          )
          .limit(1);

        if (!cohortMembership) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this cohort",
          });
        }
      }

      const rows = await db
        .select({
          courseId: cohortCourse.courseId,
          assignedAt: cohortCourse.assignedAt,
          title: course.title,
          slug: course.slug,
          status: course.status,
        })
        .from(cohortCourse)
        .innerJoin(course, eq(course.id, cohortCourse.courseId))
        .where(eq(cohortCourse.cohortId, input.cohortId));
      return { courses: rows };
    }),

  listOrgCourses: orgCourseProcedure.query(async ({ ctx }) => {
    const { db, orgId, orgMemberRole, session } = ctx;
    const userId = session.user.id;
    const isManager =
      orgMemberRole === "org_owner" || orgMemberRole === "org_admin";

    const visibleCohorts = isManager
      ? await db
          .select({ id: cohort.id, name: cohort.name })
          .from(cohort)
          .where(eq(cohort.organizationId, orgId))
      : await db
          .select({ id: cohort.id, name: cohort.name })
          .from(cohort_member)
          .innerJoin(cohort, eq(cohort.id, cohort_member.teamId))
          .where(
            and(
              eq(cohort_member.userId, userId),
              eq(cohort.organizationId, orgId)
            )
          );

    const visibleCohortIds = visibleCohorts.map((c) => c.id);
    if (visibleCohortIds.length === 0) {
      return { courses: [] };
    }

    const assignedRows = await db
      .select({
        courseId: course.id,
        title: course.title,
        slug: course.slug,
        difficulty: course.difficulty,
        description: course.description,
        cohortId: cohort.id,
        cohortName: cohort.name,
      })
      .from(cohortCourse)
      .innerJoin(course, eq(course.id, cohortCourse.courseId))
      .innerJoin(cohort, eq(cohort.id, cohortCourse.cohortId))
      .where(
        and(
          inArray(cohortCourse.cohortId, visibleCohortIds),
          eq(course.status, "published")
        )
      )
      .orderBy(asc(course.title), asc(cohort.name));

    if (assignedRows.length === 0) {
      return { courses: [] };
    }

    const courseIds = Array.from(
      new Set(assignedRows.map((row) => row.courseId))
    );

    const [enrolledRows, completedByCourse, lessonCountByCourse] =
      await Promise.all([
        db
          .select({ courseId: enrollment.courseId })
          .from(enrollment)
          .where(
            and(
              eq(enrollment.userId, userId),
              eq(enrollment.organizationId, orgId),
              inArray(enrollment.courseId, courseIds)
            )
          ),
        db
          .select({
            courseId: section.courseId,
            completed: count(lessonCompletion.id),
          })
          .from(lessonCompletion)
          .innerJoin(lesson, eq(lesson.id, lessonCompletion.lessonId))
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(
            and(
              eq(lessonCompletion.userId, userId),
              eq(lessonCompletion.organizationId, orgId),
              inArray(section.courseId, courseIds)
            )
          )
          .groupBy(section.courseId),
        db
          .select({
            courseId: section.courseId,
            lessonCount: count(lesson.id),
          })
          .from(lesson)
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(inArray(section.courseId, courseIds))
          .groupBy(section.courseId),
      ]);

    const byCourse = new Map<
      string,
      {
        id: string;
        title: string;
        slug: string;
        difficulty: string;
        description: string | null;
        cohorts: { id: string; name: string }[];
      }
    >();

    for (const row of assignedRows) {
      const existing = byCourse.get(row.courseId);
      if (existing) {
        existing.cohorts.push({ id: row.cohortId, name: row.cohortName });
        continue;
      }

      byCourse.set(row.courseId, {
        id: row.courseId,
        title: row.title,
        slug: row.slug,
        difficulty: row.difficulty,
        description: row.description,
        cohorts: [{ id: row.cohortId, name: row.cohortName }],
      });
    }

    const enrolledSet = new Set(enrolledRows.map((row) => row.courseId));
    const completedMap = new Map(
      completedByCourse.map((row) => [row.courseId, Number(row.completed)])
    );
    const lessonCountMap = new Map(
      lessonCountByCourse.map((row) => [row.courseId, Number(row.lessonCount)])
    );

    return {
      courses: Array.from(byCourse.values()).map((row) => {
        const lessonCount = lessonCountMap.get(row.id) ?? 0;
        const completedLessonCount = completedMap.get(row.id) ?? 0;

        return {
          ...row,
          isEnrolled: enrolledSet.has(row.id),
          lessonCount,
          completedLessonCount,
        };
      }),
    };
  }),

  listAssignableCourses: orgCourseManageProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const conditions = [eq(course.status, "published")];
      if (input.search?.trim()) {
        conditions.push(ilike(course.title, `%${input.search.trim()}%`));
      }
      const rows = await db
        .select({
          id: course.id,
          title: course.title,
          slug: course.slug,
        })
        .from(course)
        .where(and(...conditions))
        .orderBy(asc(course.title))
        .limit(100);
      return { courses: rows };
    }),

  setSectionDueDate: orgCourseManageProcedure
    .input(setSectionDueDateSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;
      const [cohortRow] = await db
        .select({ id: cohort.id, organizationId: cohort.organizationId })
        .from(cohort)
        .where(eq(cohort.id, input.cohortId))
        .limit(1);
      if (!cohortRow || cohortRow.organizationId !== orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cohort not found or does not belong to your organization",
        });
      }
      const [sec] = await db
        .select({ id: section.id })
        .from(section)
        .where(eq(section.id, input.sectionId))
        .limit(1);
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await db
        .insert(cohortSectionDueDate)
        .values({
          cohortId: input.cohortId,
          sectionId: input.sectionId,
          dueDate: input.dueDate,
        })
        .onConflictDoUpdate({
          target: [
            cohortSectionDueDate.cohortId,
            cohortSectionDueDate.sectionId,
          ],
          set: { dueDate: input.dueDate },
        });
      return { success: true };
    }),

  setLessonDueDate: orgCourseManageProcedure
    .input(setLessonDueDateSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, orgId } = ctx;
      const [cohortRow] = await db
        .select({ id: cohort.id, organizationId: cohort.organizationId })
        .from(cohort)
        .where(eq(cohort.id, input.cohortId))
        .limit(1);
      if (!cohortRow || cohortRow.organizationId !== orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cohort not found or does not belong to your organization",
        });
      }
      const [les] = await db
        .select({ id: lesson.id })
        .from(lesson)
        .where(eq(lesson.id, input.lessonId))
        .limit(1);
      if (!les) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      await db
        .insert(cohortLessonDueDate)
        .values({
          cohortId: input.cohortId,
          lessonId: input.lessonId,
          dueDate: input.dueDate,
        })
        .onConflictDoUpdate({
          target: [cohortLessonDueDate.cohortId, cohortLessonDueDate.lessonId],
          set: { dueDate: input.dueDate },
        });
      return { success: true };
    }),

  listCohortDueDates: orgCourseManageProcedure
    .input(z.object({ cohortId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, orgId } = ctx;
      const [cohortRow] = await db
        .select({ id: cohort.id, organizationId: cohort.organizationId })
        .from(cohort)
        .where(eq(cohort.id, input.cohortId))
        .limit(1);
      if (!cohortRow || cohortRow.organizationId !== orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cohort not found or does not belong to your organization",
        });
      }
      const [sectionDueRows, lessonDueRows] = await Promise.all([
        db
          .select({
            sectionId: cohortSectionDueDate.sectionId,
            dueDate: cohortSectionDueDate.dueDate,
          })
          .from(cohortSectionDueDate)
          .where(eq(cohortSectionDueDate.cohortId, input.cohortId)),
        db
          .select({
            lessonId: cohortLessonDueDate.lessonId,
            dueDate: cohortLessonDueDate.dueDate,
          })
          .from(cohortLessonDueDate)
          .where(eq(cohortLessonDueDate.cohortId, input.cohortId)),
      ]);
      return { sectionDueDates: sectionDueRows, lessonDueDates: lessonDueRows };
    }),
});
