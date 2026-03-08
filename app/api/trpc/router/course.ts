import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addCourseCoLead,
  createCourse,
  createLesson,
  createSection,
  deleteCourse,
  deleteLesson,
  deleteSection,
  getCourseByIdForInstructor,
  getCourseInstructors,
  getLessonById,
  getPublicCourseBySlugOrId,
  getSectionById,
  hasCourseAccessForEditing,
  listInstructorCourses,
  listPublicCourses,
  moveLesson,
  removeCourseCoLead,
  reorderLessons,
  reorderSections,
  searchCourseCoLeadCandidates,
  updateCourse,
  updateLesson,
  updateSection,
} from "@/packages/db/queries";
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
      return getCourseInstructors(db, input);
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
      const { db, session } = ctx;
      await assertInstructorCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );
      return createSection(db, input);
    }),

  updateSection: instructorProcedure
    .input(updateSectionSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const sec = await getSectionById(db, { sectionId: input.sectionId });
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertInstructorCourseAccess(
        db,
        sec.courseId,
        session.user.id,
        session.user.role ?? null
      );
      const result = await updateSection(db, {
        sectionId: input.sectionId,
        data: {
          title: input.title,
          description: input.description,
          order: input.order,
        },
      });
      if (result.noFields) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }
      if (result.notFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      return result.section;
    }),

  deleteSection: instructorProcedure
    .input(deleteSectionSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const sec = await getSectionById(db, { sectionId: input.sectionId });
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertInstructorCourseAccess(
        db,
        sec.courseId,
        session.user.id,
        session.user.role ?? null
      );
      await deleteSection(db, input);
      return { success: true };
    }),

  createLesson: instructorProcedure
    .input(createLessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const sec = await getSectionById(db, { sectionId: input.sectionId });
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertInstructorCourseAccess(
        db,
        sec.courseId,
        session.user.id,
        session.user.role ?? null
      );
      return createLesson(db, input);
    }),

  updateLesson: instructorProcedure
    .input(updateLessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const les = await getLessonById(db, { lessonId: input.lessonId });
      if (!les) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      await assertInstructorCourseAccess(
        db,
        les.courseId,
        session.user.id,
        session.user.role ?? null
      );
      if (input.sectionId !== undefined && input.sectionId !== les.sectionId) {
        const targetSec = await getSectionById(db, {
          sectionId: input.sectionId,
        });
        if (!targetSec || targetSec.courseId !== les.courseId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot move lesson to a section in a different course",
          });
        }
      }

      const result = await updateLesson(db, {
        lessonId: input.lessonId,
        data: {
          sectionId: input.sectionId,
          title: input.title,
          content: input.content,
          type: input.type,
          order: input.order,
          estimatedDuration: input.estimatedDuration,
        },
      });
      if (result.noFields) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }
      if (result.notFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      return result.lesson;
    }),

  deleteLesson: instructorProcedure
    .input(deleteLessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const les = await getLessonById(db, { lessonId: input.lessonId });
      if (!les) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      await assertInstructorCourseAccess(
        db,
        les.courseId,
        session.user.id,
        session.user.role ?? null
      );
      await deleteLesson(db, input);
      return { success: true };
    }),

  reorderSections: instructorProcedure
    .input(reorderSectionsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      await assertInstructorCourseAccess(
        db,
        input.courseId,
        session.user.id,
        session.user.role ?? null
      );
      await reorderSections(db, input);
      return { success: true };
    }),

  reorderLessons: instructorProcedure
    .input(reorderLessonsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const sec = await getSectionById(db, { sectionId: input.sectionId });
      if (!sec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }
      await assertInstructorCourseAccess(
        db,
        sec.courseId,
        session.user.id,
        session.user.role ?? null
      );
      await reorderLessons(db, input);
      return { success: true };
    }),

  moveLesson: instructorProcedure
    .input(moveLessonSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const les = await getLessonById(db, { lessonId: input.lessonId });
      if (!les) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      const targetSec = await getSectionById(db, {
        sectionId: input.targetSectionId,
      });
      if (!targetSec) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Target section not found",
        });
      }
      if (les.courseId !== targetSec.courseId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot move lesson to a section in a different course",
        });
      }
      await assertInstructorCourseAccess(
        db,
        les.courseId,
        session.user.id,
        session.user.role ?? null
      );
      const updated = await moveLesson(db, input);
      return updated;
    }),

  searchCoLeadCandidates: instructorProcedure
    .input(z.object({ courseId: z.string(), search: z.string().default("") }))
    .query(async ({ ctx, input }) => {
      return searchCourseCoLeadCandidates(ctx.db, input);
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
      await addCourseCoLead(db, {
        courseId: input.courseId,
        userId: input.userId,
        addedBy: session.user.id,
      });
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
      await removeCourseCoLead(db, input);
      return { success: true };
    }),
});
