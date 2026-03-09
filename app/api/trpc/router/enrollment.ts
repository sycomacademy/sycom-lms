import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  assignCourseToCohort,
  canEnrollInCohortCourse,
  createEnrollment,
  enrollPublic,
  getEnrolledCourse,
  getEnrolledLesson,
  getEnrollmentStatus,
  hasOrgCourseEntitlement,
  listAssignableCourses,
  listCohortCourses,
  listMyEnrollments,
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
  // ── Student-facing (public) ──

  /** Check enrollment status for a course. */
  status: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await getEnrollmentStatus(ctx.db, {
        courseId: input.courseId,
        userId: ctx.session.user.id,
      });
      return { isEnrolled: !!result, enrollmentId: result?.id ?? null };
    }),

  /** Public self-enrollment (platform org, no assignment check). */
  enrollPublic: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await enrollPublic(ctx.db, {
        courseId: input.courseId,
        userId: ctx.session.user.id,
      });

      if ("error" in result) {
        const messages: Record<string, string> = {
          course_not_found: "Course not found or not published",
          platform_org_missing: "Platform organization not configured",
          already_enrolled: "You are already enrolled in this course",
        };
        throw new TRPCError({
          code:
            result.error === "already_enrolled" ? "CONFLICT" : "BAD_REQUEST",
          message:
            messages[result.error as keyof typeof messages] ||
            "Enrollment failed",
        });
      }

      return { enrollmentId: result.enrollmentId };
    }),

  /** List all enrolled courses for the current user (My Journey). */
  listMy: protectedProcedure.query(async ({ ctx }) => {
    return listMyEnrollments(ctx.db, { userId: ctx.session.user.id });
  }),

  // ── Student-facing (org context) ──

  /** Enroll in a course within org context. */
  enroll: orgProcedure
    .input(z.object({ courseId: z.string(), cohortId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session, organizationId } = ctx;
      const userId = session.user.id;

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
        source: "cohort_assignment",
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
    return listOrgCourses(ctx.db, {
      userId: ctx.session.user.id,
      organizationId: ctx.organizationId,
    });
  }),

  /** Get enrolled course with sections, lessons, progress, and lock states. */
  getEnrolledCourse: orgProcedure
    .input(getEnrolledCourseSchema)
    .query(async ({ ctx, input }) => {
      return getEnrolledCourse(ctx.db, {
        courseId: input.courseId,
        userId: ctx.session.user.id,
        organizationId: ctx.organizationId,
      });
    }),

  /** Get a single enrolled lesson with content and navigation. */
  getEnrolledLesson: orgProcedure
    .input(getEnrolledLessonSchema)
    .query(async ({ ctx, input }) => {
      return getEnrolledLesson(ctx.db, {
        courseId: input.courseId,
        lessonId: input.lessonId,
        userId: ctx.session.user.id,
        organizationId: ctx.organizationId,
      });
    }),

  /** Mark a lesson as complete. */
  markLessonComplete: orgProcedure
    .input(markLessonCompleteSchema)
    .mutation(async ({ ctx, input }) => {
      return markLessonComplete(ctx.db, {
        courseId: input.courseId,
        lessonId: input.lessonId,
        userId: ctx.session.user.id,
        organizationId: ctx.organizationId,
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
      // Verify org has an active entitlement for this course
      const entitled = await hasOrgCourseEntitlement(ctx.db, {
        organizationId: ctx.organizationId,
        courseId: input.courseId,
      });
      if (!entitled) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Your organization does not have access to this course. Contact your administrator.",
        });
      }

      const result = await assignCourseToCohort(ctx.db, {
        courseId: input.courseId,
        cohortId: input.cohortId,
        organizationId: ctx.organizationId,
        assignedBy: ctx.session.user.id,
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
