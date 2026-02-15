import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, exists, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "@/packages/db";
import { user } from "@/packages/db/schema/auth";
import {
  course,
  courseInstructor,
  enrollment,
  lesson,
  section,
} from "@/packages/db/schema/course";
import {
  addInstructorSchema,
  createCourseSchema,
  deleteCourseSchema,
  listCoursesSchema,
  removeInstructorSchema,
  updateCourseSchema,
} from "@/packages/types/course";
import { protectedProcedure, router, t } from "../init";

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
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

const instructorProcedure = protectedProcedure.use(instructorMiddleware);

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

export const courseRouter = router({
  list: instructorProcedure
    .input(listCoursesSchema)
    .query(async ({ ctx, input }) => {
      const {
        limit,
        offset,
        search,
        sortBy,
        sortDirection,
        filterStatus,
        filterDifficulty,
      } = input;
      const { db, session } = ctx;
      const isAdmin = session.user.role === "admin";

      // Build WHERE conditions
      const conditions: ReturnType<typeof eq>[] = [];

      if (filterStatus) {
        conditions.push(eq(course.status, filterStatus));
      }
      if (filterDifficulty) {
        conditions.push(eq(course.difficulty, filterDifficulty));
      }

      // Instructor: only courses they have access to
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

      // Search
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
            // Main instructor info
            instructorName: sql<
              string | null
            >`(SELECT "auth"."user"."name" FROM "course_instructor" ci JOIN "auth"."user" ON "auth"."user"."id" = ci."user_id" WHERE ci."course_id" = "course"."id" AND ci."role" = 'main' LIMIT 1)`.as(
              "instructor_name"
            ),
            instructorImage: sql<
              string | null
            >`(SELECT "auth"."user"."image" FROM "course_instructor" ci2 JOIN "auth"."user" ON "auth"."user"."id" = ci2."user_id" WHERE ci2."course_id" = "course"."id" AND ci2."role" = 'main' LIMIT 1)`.as(
              "instructor_image"
            ),
          })
          .from(course)
          .where(where)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(course).where(where),
      ]);

      return {
        courses,
        total: totalResult[0]?.count ?? 0,
        limit,
        offset,
      };
    }),

  // -------------------------------------------------------------------------
  // Get a single course with full details
  // -------------------------------------------------------------------------
  getById: instructorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      // Verify access
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

      // Fetch sections, lessons, instructors, enrollment count in parallel
      const [sections, instructors, enrollmentCount] = await Promise.all([
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
      ]);

      // Fetch lessons for all sections
      const sectionIds = sections.map((s) => s.id);
      const lessons =
        sectionIds.length > 0
          ? await db
              .select()
              .from(lesson)
              .where(
                sql`${lesson.sectionId} IN (${sql.join(
                  sectionIds.map((id) => sql`${id}`),
                  sql`, `
                )})`
              )
              .orderBy(asc(lesson.order))
          : [];

      // Group lessons by section
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
      };
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
          slug: input.slug,
          imageUrl: input.imageUrl,
          difficulty: input.difficulty,
          estimatedDuration: input.estimatedDuration,
          status: input.status,
          createdBy: session.user.id,
        })
        .returning();

      // Automatically add creator as main instructor
      await db.insert(courseInstructor).values({
        courseId: newCourse.id,
        userId: session.user.id,
        role: "main",
        addedBy: session.user.id,
      });

      return newCourse;
    }),

  // -------------------------------------------------------------------------
  // Update a course
  // -------------------------------------------------------------------------
  update: instructorProcedure
    .input(updateCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { courseId, ...data } = input;

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

      // Build update object, excluding undefined values
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) {
        updateData.title = data.title;
      }
      if (data.description !== undefined) {
        updateData.description = data.description;
      }
      if (data.slug !== undefined) {
        updateData.slug = data.slug;
      }
      if (data.imageUrl !== undefined) {
        updateData.imageUrl = data.imageUrl;
      }
      if (data.difficulty !== undefined) {
        updateData.difficulty = data.difficulty;
      }
      if (data.estimatedDuration !== undefined) {
        updateData.estimatedDuration = data.estimatedDuration;
      }
      if (data.status !== undefined) {
        updateData.status = data.status;
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

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

      // Only admin or main instructor can delete
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
  // Add a secondary instructor (admin or main instructor only)
  // -------------------------------------------------------------------------
  addInstructor: instructorProcedure
    .input(addInstructorSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { courseId, userId } = input;

      const { instructorRole } = await assertCourseAccess(
        db,
        courseId,
        session.user.id,
        session.user.role ?? "student"
      );

      // Only admin or main instructor can add instructors
      if (instructorRole !== "admin" && instructorRole !== "main") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the main instructor or an admin can add instructors",
        });
      }

      // Verify the target user exists and is an instructor
      const [targetUser] = await db
        .select({ id: user.id, role: user.role })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (targetUser.role !== "instructor" && targetUser.role !== "admin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User must be an instructor or admin",
        });
      }

      // Check if already assigned
      const [existing] = await db
        .select({ userId: courseInstructor.userId })
        .from(courseInstructor)
        .where(
          and(
            eq(courseInstructor.courseId, courseId),
            eq(courseInstructor.userId, userId)
          )
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already an instructor for this course",
        });
      }

      await db.insert(courseInstructor).values({
        courseId,
        userId,
        role: "secondary",
        addedBy: session.user.id,
      });

      return { success: true };
    }),

  // -------------------------------------------------------------------------
  // Remove a secondary instructor (admin or main instructor only)
  // -------------------------------------------------------------------------
  removeInstructor: instructorProcedure
    .input(removeInstructorSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { courseId, userId } = input;

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
            "Only the main instructor or an admin can remove instructors",
        });
      }

      // Cannot remove the main instructor
      const [target] = await db
        .select({ role: courseInstructor.role })
        .from(courseInstructor)
        .where(
          and(
            eq(courseInstructor.courseId, courseId),
            eq(courseInstructor.userId, userId)
          )
        )
        .limit(1);

      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instructor not found for this course",
        });
      }

      if (target.role === "main") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the main instructor",
        });
      }

      await db
        .delete(courseInstructor)
        .where(
          and(
            eq(courseInstructor.courseId, courseId),
            eq(courseInstructor.userId, userId)
          )
        );

      return { success: true };
    }),
});
