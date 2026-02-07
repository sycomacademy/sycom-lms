import { eq } from "drizzle-orm";
import { db } from "@/packages/db";
import {
  course,
  courseLesson,
  courseModule,
  courseReview,
  courseSection,
} from "@/packages/db/schema/course";
import { instructor } from "@/packages/db/schema/instructor";

/**
 * Get all courses (flat, no nested modules)
 */
export async function getAllCourses() {
  return db.select().from(course);
}

/**
 * Get the first N courses (for featured sections)
 */
export async function getFeaturedCourses(limit = 3) {
  return db.select().from(course).limit(limit);
}

/**
 * Get a single course by slug
 */
export async function getCourseBySlug(slug: string) {
  const result = await db
    .select()
    .from(course)
    .where(eq(course.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get a single course by id
 */
export async function getCourseById(id: string) {
  const result = await db
    .select()
    .from(course)
    .where(eq(course.id, id))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get all courses for a given instructor (for instructor portal)
 */
export async function getCoursesByInstructorId(instructorId: string) {
  return db.select().from(course).where(eq(course.instructorId, instructorId));
}

/**
 * Get the instructor for a course
 */
export async function getInstructorForCourse(instructorId: string) {
  const result = await db
    .select()
    .from(instructor)
    .where(eq(instructor.id, instructorId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get modules for a course, ordered
 */
export async function getModulesForCourse(courseId: string) {
  return db
    .select()
    .from(courseModule)
    .where(eq(courseModule.courseId, courseId))
    .orderBy(courseModule.order);
}

/**
 * Get sections for a module, ordered
 */
export async function getSectionsForModule(moduleId: string) {
  return db
    .select()
    .from(courseSection)
    .where(eq(courseSection.moduleId, moduleId))
    .orderBy(courseSection.order);
}

/**
 * Get lessons for a section, ordered
 */
export async function getLessonsForSection(sectionId: string) {
  return db
    .select()
    .from(courseLesson)
    .where(eq(courseLesson.sectionId, sectionId))
    .orderBy(courseLesson.order);
}

/**
 * Get reviews for a course
 */
export async function getReviewsForCourse(courseId: string) {
  return db
    .select()
    .from(courseReview)
    .where(eq(courseReview.courseId, courseId));
}

/**
 * Get a full course with nested modules → sections → lessons
 */
export async function getCourseWithModules(courseId: string) {
  const modules = await getModulesForCourse(courseId);
  const modulesWithSections = await Promise.all(
    modules.map(async (mod) => {
      const sections = await getSectionsForModule(mod.id);
      const sectionsWithLessons = await Promise.all(
        sections.map(async (sec) => {
          const lessons = await getLessonsForSection(sec.id);
          return { ...sec, lessons };
        })
      );
      return { ...mod, sections: sectionsWithLessons };
    })
  );
  return modulesWithSections;
}

/**
 * Get all course slugs (for generateStaticParams)
 */
export async function getAllCourseSlugs() {
  return db.select({ slug: course.slug }).from(course);
}
