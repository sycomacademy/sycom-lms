import { eq } from "drizzle-orm";
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
