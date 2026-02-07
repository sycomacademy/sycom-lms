import { and, eq } from "drizzle-orm";
import { db } from "@/packages/db";
import { course } from "@/packages/db/schema/course";
import { pathway, pathwayCourse } from "@/packages/db/schema/pathway";

/**
 * Get all pathways (flat)
 */
export async function getAllPathways() {
  return db.select().from(pathway);
}

/**
 * Get a pathway by slug
 */
export async function getPathwayBySlug(slug: string) {
  const result = await db
    .select()
    .from(pathway)
    .where(eq(pathway.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get courses in a pathway, ordered by course_order
 */
export async function getCoursesForPathway(pathwayId: string) {
  const rows = await db
    .select({
      courseOrder: pathwayCourse.courseOrder,
      course,
    })
    .from(pathwayCourse)
    .innerJoin(course, eq(pathwayCourse.courseId, course.id))
    .where(eq(pathwayCourse.pathwayId, pathwayId))
    .orderBy(pathwayCourse.courseOrder);
  return rows.map((r) => r.course);
}

/**
 * Get all pathway slugs (for generateStaticParams)
 */
export async function getAllPathwaySlugs() {
  return db.select({ slug: pathway.slug }).from(pathway);
}

/**
 * Get a pathway by id
 */
export async function getPathwayById(id: string) {
  const result = await db
    .select()
    .from(pathway)
    .where(eq(pathway.id, id))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Create a pathway
 */
export async function createPathway(data: {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  estimatedDuration: number;
  level: string;
  certifications?: string[];
  whatYoullAchieve?: string[];
  whoIsThisFor?: string[];
  prerequisites?: string[];
  highlights?: string[];
  price?: number | null;
}) {
  const result = await db.insert(pathway).values(data).returning();
  return result[0];
}

/**
 * Update a pathway
 */
export async function updatePathway(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    estimatedDuration?: number;
    level?: string;
    certifications?: string[];
    whatYoullAchieve?: string[];
    whoIsThisFor?: string[];
    prerequisites?: string[];
    highlights?: string[];
    price?: number | null;
  }
) {
  const result = await db
    .update(pathway)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pathway.id, id))
    .returning();
  return result[0];
}

/**
 * Get pathway_course rows for a pathway (with course and order)
 */
export async function getPathwayCourses(pathwayId: string) {
  return db
    .select({
      id: pathwayCourse.id,
      courseId: pathwayCourse.courseId,
      courseOrder: pathwayCourse.courseOrder,
      course,
    })
    .from(pathwayCourse)
    .innerJoin(course, eq(pathwayCourse.courseId, course.id))
    .where(eq(pathwayCourse.pathwayId, pathwayId))
    .orderBy(pathwayCourse.courseOrder);
}

/**
 * Add a course to a pathway
 */
export async function addCourseToPathway(data: {
  id: string;
  pathwayId: string;
  courseId: string;
  courseOrder: number;
}) {
  const result = await db.insert(pathwayCourse).values(data).returning();
  return result[0];
}

/**
 * Remove a course from a pathway
 */
export async function removeCourseFromPathway(
  pathwayId: string,
  courseId: string
) {
  await db
    .delete(pathwayCourse)
    .where(
      and(
        eq(pathwayCourse.pathwayId, pathwayId),
        eq(pathwayCourse.courseId, courseId)
      )
    );
}

/**
 * Get max course order in a pathway
 */
export async function getMaxPathwayCourseOrder(
  pathwayId: string
): Promise<number> {
  const rows = await getPathwayCourses(pathwayId);
  const maxOrder =
    rows.length === 0 ? -1 : Math.max(...rows.map((r) => r.courseOrder));
  return maxOrder + 1;
}

/**
 * Reorder courses in a pathway (update course_order by index)
 */
export async function reorderPathwayCourses(
  pathwayId: string,
  orderedCourseIds: string[]
) {
  for (let i = 0; i < orderedCourseIds.length; i++) {
    await db
      .update(pathwayCourse)
      .set({ courseOrder: i })
      .where(
        and(
          eq(pathwayCourse.pathwayId, pathwayId),
          eq(pathwayCourse.courseId, orderedCourseIds[i])
        )
      );
  }
}
