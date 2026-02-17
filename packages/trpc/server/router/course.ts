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
import type { Database } from "@/packages/db";
import { user } from "@/packages/db/schema/auth";
import {
  category,
  course,
  courseCategory,
  courseInstructor,
  enrollment,
  lesson,
  lessonCompletion,
  section,
} from "@/packages/db/schema/course";
import {
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
  updateCourseSchema,
  updateLessonSchema,
  updateSectionSchema,
} from "@/packages/types/course";
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
  if (role !== "instructor" && role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Instructor or admin access required",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

const instructorProcedure = protectedProcedure.use(instructorMiddleware);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertCourseAccess(
  db: Database,
  courseId: string,
  userId: string,
  userRole: string
): Promise<{ instructorRole: "main" | "secondary" | "admin" }> {
  if (userRole === "admin") {
    return { instructorRole: "admin" };
  }

  const [row] = await db
    .select({ role: courseInstructor.role })
    .from(courseInstructor)
    .where(
      and(
        eq(courseInstructor.courseId, courseId),
        eq(courseInstructor.userId, userId)
      )
    )
    .limit(1);

  if (!row) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this course",
    });
  }

  return { instructorRole: row.role };
}

async function assertEnrolledCourseAccess(
  db: Database,
  courseId: string,
  userId: string
): Promise<{ courseRow: { id: string; title: string; status: string } }> {
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

  const [enrolled] = await db
    .select({ id: enrollment.id })
    .from(enrollment)
    .where(
      and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId))
    )
    .limit(1);

  if (!enrolled) {
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
  // -------------------------------------------------------------------------
  // Public: list published courses (for marketing/landing)
  // -------------------------------------------------------------------------
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
            sql<number>`(SELECT count(*)::int FROM "lesson" JOIN "section" s ON "lesson"."section_id" = s."id" WHERE s."course_id" = "course"."id")`.as(
              "lesson_count"
            ),
        })
        .from(course)
        .where(eq(course.status, "published"))
        .orderBy(desc(course.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      const courseIds = courses.map((c) => c.id);
      const categoriesByCourse =
        courseIds.length > 0
          ? await db
              .select({
                courseId: courseCategory.courseId,
                id: category.id,
                name: category.name,
                slug: category.slug,
              })
              .from(courseCategory)
              .innerJoin(category, eq(category.id, courseCategory.categoryId))
              .where(inArray(courseCategory.courseId, courseIds))
          : [];

      const categoriesMap = new Map<
        string,
        { id: string; name: string; slug: string }[]
      >();
      for (const row of categoriesByCourse) {
        const list = categoriesMap.get(row.courseId) ?? [];
        list.push({ id: row.id, name: row.name, slug: row.slug });
        categoriesMap.set(row.courseId, list);
      }

      const [totalResult] = await db
        .select({ count: count() })
        .from(course)
        .where(eq(course.status, "published"));

      return {
        courses: courses.map((c) => ({
          ...c,
          categories: categoriesMap.get(c.id) ?? [],
        })),
        total: totalResult?.count ?? 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // -------------------------------------------------------------------------
  // Public: get a single published course by slug or id
  // -------------------------------------------------------------------------
  getPublicBySlugOrId: publicProcedure
    .input(z.object({ slugOrId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const slugOrId = input.slugOrId;

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
        .where(or(eq(course.id, slugOrId), eq(course.slug, slugOrId)))
        .limit(1);

      if (!courseRow || courseRow.status !== "published") {
        return null;
      }

      const [sections, categories, enrollmentCount, lessonCount] =
        await Promise.all([
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
            .select({
              id: category.id,
              name: category.name,
              slug: category.slug,
            })
            .from(courseCategory)
            .innerJoin(category, eq(category.id, courseCategory.categoryId))
            .where(eq(courseCategory.courseId, courseRow.id)),
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
        categories,
        enrollmentCount: enrollmentCount[0]?.count ?? 0,
        lessonCount: lessonCount[0]?.count ?? 0,
      };
    }),

  // -------------------------------------------------------------------------
  // Protected: check if user is enrolled in a course
  // -------------------------------------------------------------------------
  isEnrolled: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const [row] = await db
        .select({ id: enrollment.id })
        .from(enrollment)
        .where(
          and(
            eq(enrollment.userId, session.user.id),
            eq(enrollment.courseId, input.courseId)
          )
        )
        .limit(1);
      return { enrolled: !!row };
    }),

  // -------------------------------------------------------------------------
  // List courses with pagination, search, and filtering
  // -------------------------------------------------------------------------
  list: instructorProcedure
    .input(listCoursesSchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        offset,
        search,
        sortBy,
        sortDirection,
        filterCategoryIds,
        filterStatuses,
        filterDifficulties,
      } = input;
      const { db, session } = ctx;
      const isAdmin = session.user.role === "admin";

      // Build WHERE conditions
      const conditions: ReturnType<typeof eq>[] = [];

      if (filterStatuses && filterStatuses.length > 0) {
        conditions.push(inArray(course.status, filterStatuses));
      }
      if (filterDifficulties && filterDifficulties.length > 0) {
        conditions.push(inArray(course.difficulty, filterDifficulties));
      }
      if (filterCategoryIds && filterCategoryIds.length > 0) {
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

      // Non-admin: only courses they have access to
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

      // Case-insensitive search on title and description
      const searchCondition = search
        ? or(
            ilike(course.title, `%${search}%`),
            ilike(course.description, `%${search}%`)
          )
        : undefined;

      const allConditions = [
        ...conditions,
        ...(searchCondition ? [searchCondition] : []),
      ];
      const where =
        allConditions.length > 0 ? and(...allConditions) : undefined;

      // Sort
      const ORDER_COLUMNS = {
        title: course.title,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        status: course.status,
      } as const;
      const orderColumn = ORDER_COLUMNS[sortBy];
      const orderBy =
        sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);

      // Query courses with aggregate counts via subqueries
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
              sql<number>`(SELECT count(*)::int FROM "lesson" JOIN "section" s ON "lesson"."section_id" = s."id" WHERE s."course_id" = "course"."id")`.as(
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

      // Fetch categories for returned courses
      const courseIds = courses.map((c) => c.id);
      const categoriesByCourse =
        courseIds.length > 0
          ? await db
              .select({
                courseId: courseCategory.courseId,
                id: category.id,
                name: category.name,
                slug: category.slug,
              })
              .from(courseCategory)
              .innerJoin(category, eq(category.id, courseCategory.categoryId))
              .where(inArray(courseCategory.courseId, courseIds))
          : [];

      const categoriesMap = new Map<
        string,
        { id: string; name: string; slug: string }[]
      >();
      for (const row of categoriesByCourse) {
        const list = categoriesMap.get(row.courseId) ?? [];
        list.push({ id: row.id, name: row.name, slug: row.slug });
        categoriesMap.set(row.courseId, list);
      }

      return {
        courses: courses.map((c) => ({
          ...c,
          categories: categoriesMap.get(c.id) ?? [],
        })),
        total: totalResult[0]?.count ?? 0,
        limit,
        offset,
      };
    }),

  // -------------------------------------------------------------------------
  // List published courses for student library (enrollment + progress)
  // -------------------------------------------------------------------------
  listLibrary: protectedProcedure
    .input(listLibrarySchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        offset,
        search,
        sortBy,
        sortDirection,
        filterCategoryIds,
        filterDifficulties,
      } = input;
      const { db, session } = ctx;
      const userId = session.user.id;

      const conditions: ReturnType<typeof eq>[] = [
        eq(course.status, "published"),
      ];
      if (filterDifficulties && filterDifficulties.length > 0) {
        conditions.push(inArray(course.difficulty, filterDifficulties));
      }
      if (filterCategoryIds && filterCategoryIds.length > 0) {
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
      const searchCondition = search
        ? or(
            ilike(course.title, `%${search}%`),
            ilike(course.description, `%${search}%`)
          )
        : undefined;
      const allConditions = [
        ...conditions,
        ...(searchCondition ? [searchCondition] : []),
      ];
      const where =
        allConditions.length > 0 ? and(...allConditions) : undefined;

      const ORDER_COLUMNS = {
        title: course.title,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      } as const;
      const orderColumn = ORDER_COLUMNS[sortBy];
      const orderBy =
        sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);

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
              sql<number>`(SELECT count(*)::int FROM "lesson" JOIN "section" s ON "lesson"."section_id" = s."id" WHERE s."course_id" = "course"."id")`.as(
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

      const [categoriesByCourse, enrolledRows, completedByCourse] =
        await Promise.all([
          db
            .select({
              courseId: courseCategory.courseId,
              id: category.id,
              name: category.name,
              slug: category.slug,
            })
            .from(courseCategory)
            .innerJoin(category, eq(category.id, courseCategory.categoryId))
            .where(inArray(courseCategory.courseId, courseIds)),
          db
            .select({ courseId: enrollment.courseId })
            .from(enrollment)
            .where(
              and(
                eq(enrollment.userId, userId),
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
                inArray(section.courseId, courseIds)
              )
            )
            .groupBy(section.courseId),
        ]);

      const categoriesMap = new Map<
        string,
        { id: string; name: string; slug: string }[]
      >();
      for (const row of categoriesByCourse) {
        const list = categoriesMap.get(row.courseId) ?? [];
        list.push({ id: row.id, name: row.name, slug: row.slug });
        categoriesMap.set(row.courseId, list);
      }
      const enrolledSet = new Set(enrolledRows.map((r) => r.courseId));
      const completedMap = new Map(
        completedByCourse.map((r) => [r.courseId, Number(r.completed)])
      );

      return {
        courses: courses.map((c) => ({
          ...c,
          categories: categoriesMap.get(c.id) ?? [],
          isEnrolled: enrolledSet.has(c.id),
          completedLessonCount: completedMap.get(c.id) ?? 0,
        })),
        total: totalResult[0]?.count ?? 0,
        limit,
        offset,
      };
    }),

  // -------------------------------------------------------------------------
  // Student learning: enrolled course curriculum with progress
  // -------------------------------------------------------------------------
  getEnrolledCourse: protectedProcedure
    .input(getEnrolledCourseSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const userId = session.user.id;

      const { courseRow } = await assertEnrolledCourseAccess(
        db,
        input.courseId,
        userId
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
              .innerJoin(section, eq(section.id, lesson.sectionId))
              .where(inArray(lesson.sectionId, sectionIds))
              .orderBy(asc(section.order), asc(lesson.order))
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

          return {
            ...s,
            isCompleted,
            lessons: sectionLessons,
          };
        }),
      };
    }),

  // -------------------------------------------------------------------------
  // Student learning: single lesson (with prev/next)
  // -------------------------------------------------------------------------
  getEnrolledLesson: protectedProcedure
    .input(getEnrolledLessonSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const userId = session.user.id;

      const { courseRow } = await assertEnrolledCourseAccess(
        db,
        input.courseId,
        userId
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
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
              eq(lessonCompletion.lessonId, lessonRow.id)
            )
          )
          .limit(1),
        db
          .select({
            id: lesson.id,
            isLocked: lesson.isLocked,
          })
          .from(lesson)
          .innerJoin(section, eq(section.id, lesson.sectionId))
          .where(eq(section.courseId, input.courseId))
          .orderBy(asc(section.order), asc(lesson.order)),
      ]);

      const isCompleted = !!isCompletedRow;
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

  // -------------------------------------------------------------------------
  // Student learning: mark lesson complete
  // -------------------------------------------------------------------------
  markLessonComplete: protectedProcedure
    .input(markLessonCompleteSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const userId = session.user.id;

      await assertEnrolledCourseAccess(db, input.courseId, userId);

      const [lessonRow] = await db
        .select({
          id: lesson.id,
          isLocked: lesson.isLocked,
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      if (lessonRow.isLocked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This lesson is locked",
        });
      }

      await db
        .insert(lessonCompletion)
        .values({ userId, lessonId: lessonRow.id })
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
              eq(enrollment.courseId, input.courseId)
            )
          );
      }

      return { completed: true, courseCompleted };
    }),

  // -------------------------------------------------------------------------
  // Enroll current user in a published course
  // -------------------------------------------------------------------------
  enroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

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
        })
        .onConflictDoNothing();

      return { enrolled: true };
    }),

  // -------------------------------------------------------------------------
  // Get a single course with full details
  // -------------------------------------------------------------------------
  getById: instructorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      await assertCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? "student"
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
            })
            .from(courseCategory)
            .innerJoin(category, eq(category.id, courseCategory.categoryId))
            .where(eq(courseCategory.courseId, input.courseId)),
        ]);

      // Fetch lessons for all sections
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

  // -------------------------------------------------------------------------
  // Get main instructor (creator) and enrolled students for a course
  // -------------------------------------------------------------------------
  getInstructorAndEnrollments: instructorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      await assertCourseAccess(
        db,
        input.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? "student"
      );

      const [courseRow] = await db
        .select({ createdBy: course.createdBy })
        .from(course)
        .where(eq(course.id, input.courseId))
        .limit(1);

      if (!courseRow?.createdBy) {
        return {
          mainInstructor: null,
          enrolledStudents: [] as {
            id: string;
            name: string | null;
            email: string;
            image: string | null;
            enrolledAt: Date;
          }[],
        };
      }

      const [creatorRow, enrolledRows] = await Promise.all([
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

      const enrolledStudents = enrolledRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
        enrolledAt: row.enrolledAt,
      }));

      return { mainInstructor, enrolledStudents };
    }),

  // -------------------------------------------------------------------------
  // Create a course
  // -------------------------------------------------------------------------
  create: instructorProcedure
    .input(createCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      // Check slug uniqueness
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

      // Add creator as main instructor
      await db.insert(courseInstructor).values({
        courseId: newCourse.id,
        userId: session.user.id,
        role: "main",
        addedBy: session.user.id,
      });

      // Assign categories
      if (input.categoryIds && input.categoryIds.length > 0) {
        await db.insert(courseCategory).values(
          input.categoryIds.map((categoryId) => ({
            courseId: newCourse.id,
            categoryId,
          }))
        );
      }

      return newCourse;
    }),

  // -------------------------------------------------------------------------
  // Update a course
  // -------------------------------------------------------------------------
  update: instructorProcedure
    .input(updateCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { courseId, categoryIds, ...data } = input;

      await assertCourseAccess(
        db,
        courseId,
        session.user.id,
        session.user.role ?? "student"
      );

      // Check slug uniqueness if slug is being changed
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

      if (Object.keys(updateData).length === 0 && categoryIds === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      if (Object.keys(updateData).length > 0) {
        const [updated] = await db
          .update(course)
          .set(updateData)
          .where(eq(course.id, courseId))
          .returning();

        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found",
          });
        }
      }

      // Replace categories when provided
      if (categoryIds !== undefined) {
        await db
          .delete(courseCategory)
          .where(eq(courseCategory.courseId, courseId));
        if (categoryIds.length > 0) {
          await db
            .insert(courseCategory)
            .values(
              categoryIds.map((catId) => ({ courseId, categoryId: catId }))
            );
        }
      }

      const [updated] = await db
        .select()
        .from(course)
        .where(eq(course.id, courseId))
        .limit(1);

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return updated;
    }),

  // -------------------------------------------------------------------------
  // Delete a course (admin or main instructor only)
  // -------------------------------------------------------------------------
  delete: instructorProcedure
    .input(deleteCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { courseId } = input;

      const { instructorRole } = await assertCourseAccess(
        db,
        courseId,
        session.user.id,
        session.user.role ?? "student"
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
        .where(eq(course.id, courseId))
        .returning({ id: course.id });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // Sections
  // -------------------------------------------------------------------------
  createSection: instructorProcedure
    .input(createSectionSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      await assertCourseAccess(
        db,
        input.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? "student"
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
        ctx.session.user.role ?? "student"
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
        ctx.session.user.role ?? "student"
      );
      await db.delete(section).where(eq(section.id, input.sectionId));
      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // Lessons
  // -------------------------------------------------------------------------
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
        ctx.session.user.role ?? "student"
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
        ctx.session.user.role ?? "student"
      );
      // If moving to a different section, verify access to target section
      if (input.sectionId !== undefined && input.sectionId !== les.sectionId) {
        const [targetSec] = await db
          .select({ courseId: section.courseId })
          .from(section)
          .where(eq(section.id, input.sectionId))
          .limit(1);
        if (!targetSec) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Target section not found",
          });
        }
        // Ensure target section is in the same course
        if (targetSec.courseId !== sec.courseId) {
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
        ctx.session.user.role ?? "student"
      );
      await db.delete(lesson).where(eq(lesson.id, input.lessonId));
      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // Reordering (bulk operations for drag-and-drop)
  // -------------------------------------------------------------------------
  reorderSections: instructorProcedure
    .input(reorderSectionsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      await assertCourseAccess(
        db,
        input.courseId,
        ctx.session.user.id,
        ctx.session.user.role ?? "student"
      );

      // Update each section's order based on its position in the array
      await Promise.all(
        input.sectionIds.map((sectionId: string, index: number) =>
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

      // Get the section to verify access
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
        ctx.session.user.role ?? "student"
      );

      // Update each lesson's order based on its position in the array
      await Promise.all(
        input.lessonIds.map((lessonId: string, index: number) =>
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

      // Get the lesson's current section
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

      // Get source section's course
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

      // Get target section's course
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

      // Ensure both sections are in the same course
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
        ctx.session.user.role ?? "student"
      );

      // Move the lesson
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
});
