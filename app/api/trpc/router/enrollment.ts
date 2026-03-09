import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  assignCourseToCohort,
  canEnrollInCohortCourse,
  createEnrollment,
  getEnrolledCourse,
  getEnrolledLesson,
  listAssignableCourses,
  listCohortCourses,
  listOrgCourses,
  markLessonComplete,
  unassignCourseFromCohort,
} from "@/packages/db/queries";
import {
  assignCourseToCohortSchema,
  getEnrolledCourseSchema,
  getEnrolledLessonSchema,
  markLessonCompleteSchema,
  unassignCourseFromCohortSchema,
} from "@/packages/utils/schema";
import { protectedProcedure, router, t } from "../init";

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

const orgMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  const orgId = ctx.session.session.activeOrganizationId;
  if (!orgId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active organization",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      organizationId: orgId,
    },
  });
});

const orgProcedure = protectedProcedure.use(orgMiddleware);

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const enrollmentRouter = router({
  // ── Student-facing ──

  /** Self-enroll in a course (public or org cohort). */
  enroll: orgProcedure
    .input(z.object({ courseId: z.string(), cohortId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session, organizationId } = ctx;
      const userId = session.user.id;

      // If cohortId provided, verify eligibility
      if (input.cohortId) {
        const check = await canEnrollInCohortCourse(db, {
          courseId: input.courseId,
          userId,
          organizationId,
          cohortId: input.cohortId,
        });

        if (!check.canEnroll) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Cannot enroll: ${check.reason}`,
          });
        }
      }

      // Resolve cohortId — use provided or find first cohort the user is in
      // that has this course assigned
      let cohortId = input.cohortId;
      if (!cohortId) {
        const orgCourses = await listOrgCourses(db, { userId, organizationId });
        const match = orgCourses.courses.find((c) => c.id === input.courseId);
        if (!match || match.cohorts.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found in any of your cohorts",
          });
        }
        cohortId = match.cohorts[0].id;
      }

      const result = await createEnrollment(db, {
        userId,
        courseId: input.courseId,
        organizationId,
        cohortId,
        source: "public",
      });

      if (!result) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already enrolled in this course",
        });
      }

      return { enrollmentId: result.id };
    }),

  /** List courses available to the user in their current org. */
  listOrgCourses: orgProcedure.query(async ({ ctx }) => {
    const { db, session, organizationId } = ctx;
    return listOrgCourses(db, {
      userId: session.user.id,
      organizationId,
    });
  }),

  /** Get enrolled course with sections, lessons, progress, and lock states. */
  getEnrolledCourse: orgProcedure
    .input(getEnrolledCourseSchema)
    .query(async ({ ctx, input }) => {
      const { db, session, organizationId } = ctx;
      return getEnrolledCourse(db, {
        courseId: input.courseId,
        userId: session.user.id,
        organizationId,
      });
    }),

  /** Get a single enrolled lesson with content and navigation. */
  getEnrolledLesson: orgProcedure
    .input(getEnrolledLessonSchema)
    .query(async ({ ctx, input }) => {
      const { db, session, organizationId } = ctx;
      return getEnrolledLesson(db, {
        courseId: input.courseId,
        lessonId: input.lessonId,
        userId: session.user.id,
        organizationId,
      });
    }),

  /** Mark a lesson as complete. */
  markLessonComplete: orgProcedure
    .input(markLessonCompleteSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session, organizationId } = ctx;
      return markLessonComplete(db, {
        courseId: input.courseId,
        lessonId: input.lessonId,
        userId: session.user.id,
        organizationId,
      });
    }),

  // ── Org admin/teacher-facing ──

  /** List all published courses available for assignment. */
  listAssignableCourses: orgProcedure.query(async ({ ctx }) => {
    return listAssignableCourses(ctx.db);
  }),

  /** List courses assigned to a specific cohort. */
  listCohortCourses: orgProcedure
    .input(z.object({ cohortId: z.string() }))
    .query(async ({ ctx, input }) => {
      return listCohortCourses(ctx.db, { cohortId: input.cohortId });
    }),

  /** Assign a course to a cohort. */
  assignCourseToCohort: orgProcedure
    .input(assignCourseToCohortSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session, organizationId } = ctx;
      const result = await assignCourseToCohort(db, {
        courseId: input.courseId,
        cohortId: input.cohortId,
        organizationId,
        assignedBy: session.user.id,
      });

      if (!result) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Course already assigned to this cohort",
        });
      }

      return { assignmentId: result.id };
    }),

  /** Unassign a course from a cohort. */
  unassignCourseFromCohort: orgProcedure
    .input(unassignCourseFromCohortSchema)
    .mutation(async ({ ctx, input }) => {
      await unassignCourseFromCohort(ctx.db, {
        courseId: input.courseId,
        cohortId: input.cohortId,
      });
      return { success: true };
    }),
});
