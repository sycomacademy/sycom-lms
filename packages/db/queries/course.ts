import { and, eq } from "drizzle-orm";
import type { Database } from "@/packages/db";
import { cohort, cohort_member } from "@/packages/db/schema/auth";
import {
  cohortCourse,
  courseInstructor,
  enrollment,
} from "@/packages/db/schema/course";

export type InstructorRoleResult = "main" | "secondary" | "admin";

/**
 * Check if user has access to a course for editing.
 * Returns instructorRole: "admin" for platform_admin, or the courseInstructor role.
 */
export async function getCourseAccess(
  database: Database,
  params: { courseId: string; userId: string; userRole: string | null }
): Promise<{ instructorRole: InstructorRoleResult } | null> {
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
  return { instructorRole: row.role as "main" | "secondary" };
}

/**
 * Check if user can access a course for learning (enrolled or in assigned cohort).
 */
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
