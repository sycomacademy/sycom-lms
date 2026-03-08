import { TRPCError } from "@trpc/server";
import { and, eq, ilike, max, or } from "drizzle-orm";
import { z } from "zod";
import {
  createCourse,
  deleteCourse,
  getCourseByIdForInstructor,
  getCourseInstructorsAndEnrollments,
  getPublicCourseBySlugOrId,
  hasCourseAccessForEditing,
  listInstructorCourses,
  listPublicCourses,
  updateCourse,
} from "@/packages/db/queries";
import { user } from "@/packages/db/schema/auth";
import { courseInstructor, lesson, section } from "@/packages/db/schema/course";
import {
  createCourseSchema,
  createLessonSchema,
  createSectionSchema,
  deleteCourseSchema,
  deleteLessonSchema,
  deleteSectionSchema,
  listCoursesSchema,
  listPublicCoursesSchema,
  moveLessonSchema,
  reorderLessonsSchema,
  reorderSectionsSchema,
  updateCourseSchema,
  updateLessonSchema,
  updateSectionSchema,
} from "@/packages/utils/schema";
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertInstructorCourseAccess(
  db: Parameters<typeof hasCourseAccessForEditing>[0],
  courseId: string,
  userId: string,
  userRole: string | null
) {
  const result = await hasCourseAccessForEditing(db, {
    courseId,
    userId,
    userRole,
  });
  if (!result) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this course",
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const courseRouter = router({
  listPublic: publicProcedure
    .input(listPublicCoursesSchema)
    .query(async ({ ctx, input }) => {
      const result = await listPublicCourses(ctx.db, input);
      return { ...result, limit: input.limit, offset: input.offset };
    }),

  list: instructorProcedure
    .input(listCoursesSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const result = await listInstructorCourses(db, {
        ...input,
        userId: session.user.id,
        isAdmin: session.user.role === "platform_admin",
      });
      return { ...result, limit: input.limit, offset: input.offset };
    }),

  getPublicBySlugOrId: publicProcedure
    .input(z.object({ slugOrId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getPublicCourseBySlugOrId(ctx.db, input);
    }),

  getById: instructorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      await assertInstructorCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );
      const result = await getCourseByIdForInstructor(db, input);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      return result;
    }),

  getInstructors: instructorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      await assertInstructorCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );
      return getCourseInstructorsAndEnrollments(db, input);
    }),

  create: instructorProcedure
    .input(createCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await createCourse(ctx.db, {
        ...input,
        userId: ctx.session.user.id,
      });
      if (result.conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A course with this slug already exists",
        });
      }
      return result.course;
    }),

  update: instructorProcedure
    .input(updateCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { courseId, ...data } = input;
      await assertInstructorCourseAccess(
        db,
        courseId,
        session.user.id,
        session.user.role ?? null
      );
      const result = await updateCourse(db, { courseId, data });
      if (result.conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A course with this slug already exists",
        });
      }
      if ("noFields" in result && result.noFields) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }
      if ("notFound" in result && result.notFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      return result.course;
    }),

  delete: instructorProcedure
    .input(deleteCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { instructorRole } = await assertInstructorCourseAccess(
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
      const deleted = await deleteCourse(db, input);
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      return { success: true };
    }),

  //checkpoint
  createSection: instructorProcedure
    .input(createSectionSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      await assertInstructorCourseAccess(
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
      await assertInstructorCourseAccess(
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
      await assertInstructorCourseAccess(
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
      await assertInstructorCourseAccess(
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
          type: input.type ?? "article",
          order: nextOrder,
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
      await assertInstructorCourseAccess(
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
      await assertInstructorCourseAccess(
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
      await assertInstructorCourseAccess(
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
      await assertInstructorCourseAccess(
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
      await assertInstructorCourseAccess(
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
      const { instructorRole } = await assertInstructorCourseAccess(
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
      const { instructorRole } = await assertInstructorCourseAccess(
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
});
