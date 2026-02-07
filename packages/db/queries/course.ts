import { and, eq } from "drizzle-orm";
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

/**
 * Create a new course (instructor only)
 */
export async function createCourse(data: {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  level: string;
  price: number;
  duration: number;
  instructorId: string;
  thumbnailUrl?: string | null;
  whatYoullLearn?: string[];
  prerequisites?: string[];
  whoIsThisFor?: string[];
  highlights?: string[];
}) {
  const result = await db.insert(course).values(data).returning();
  return result[0];
}

/**
 * Update a course (instructor only; verify instructorId before calling)
 */
export async function updateCourse(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    category?: string;
    level?: string;
    price?: number;
    duration?: number;
    thumbnailUrl?: string | null;
    whatYoullLearn?: string[];
    prerequisites?: string[];
    whoIsThisFor?: string[];
    highlights?: string[];
  }
) {
  const result = await db
    .update(course)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(course.id, id))
    .returning();
  return result[0];
}

/**
 * Create a module
 */
export async function createModule(data: {
  id: string;
  courseId: string;
  title: string;
  order: number;
}) {
  const result = await db.insert(courseModule).values(data).returning();
  return result[0];
}

/**
 * Update a module
 */
export async function updateModule(
  id: string,
  data: { title?: string; order?: number }
) {
  const result = await db
    .update(courseModule)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courseModule.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a module (cascades to sections and lessons)
 */
export async function deleteModule(id: string) {
  await db.delete(courseModule).where(eq(courseModule.id, id));
}

/**
 * Reorder modules: set order for each id by index
 */
export async function reorderModules(courseId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(courseModule)
      .set({ order: i, updatedAt: new Date() })
      .where(
        and(
          eq(courseModule.id, orderedIds[i]),
          eq(courseModule.courseId, courseId)
        )
      );
  }
}

/**
 * Create a section
 */
export async function createSection(data: {
  id: string;
  moduleId: string;
  title: string;
  order: number;
}) {
  const result = await db.insert(courseSection).values(data).returning();
  return result[0];
}

/**
 * Update a section
 */
export async function updateSection(
  id: string,
  data: { title?: string; order?: number }
) {
  const result = await db
    .update(courseSection)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courseSection.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a section (cascades to lessons)
 */
export async function deleteSection(id: string) {
  await db.delete(courseSection).where(eq(courseSection.id, id));
}

/**
 * Reorder sections within a module
 */
export async function reorderSections(moduleId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(courseSection)
      .set({ order: i, updatedAt: new Date() })
      .where(
        and(
          eq(courseSection.id, orderedIds[i]),
          eq(courseSection.moduleId, moduleId)
        )
      );
  }
}

/**
 * Create a lesson
 */
export async function createLesson(data: {
  id: string;
  sectionId: string;
  title: string;
  order: number;
  type: string;
  duration: number;
  content?: string | null;
  videoUrl?: string | null;
}) {
  const result = await db.insert(courseLesson).values(data).returning();
  return result[0];
}

/**
 * Update a lesson
 */
export async function updateLesson(
  id: string,
  data: {
    title?: string;
    order?: number;
    type?: string;
    duration?: number;
    content?: string | null;
    videoUrl?: string | null;
  }
) {
  const result = await db
    .update(courseLesson)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courseLesson.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a lesson
 */
export async function deleteLesson(id: string) {
  await db.delete(courseLesson).where(eq(courseLesson.id, id));
}

/**
 * Reorder lessons within a section
 */
export async function reorderLessons(sectionId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(courseLesson)
      .set({ order: i, updatedAt: new Date() })
      .where(
        and(
          eq(courseLesson.id, orderedIds[i]),
          eq(courseLesson.sectionId, sectionId)
        )
      );
  }
}

/**
 * Get max module order for a course
 */
export async function getMaxModuleOrder(courseId: string): Promise<number> {
  const modules = await getModulesForCourse(courseId);
  const maxOrder =
    modules.length === 0 ? -1 : Math.max(...modules.map((m) => m.order));
  return maxOrder + 1;
}

/**
 * Get max section order for a module
 */
export async function getMaxSectionOrder(moduleId: string): Promise<number> {
  const sections = await getSectionsForModule(moduleId);
  const maxOrder =
    sections.length === 0 ? -1 : Math.max(...sections.map((s) => s.order));
  return maxOrder + 1;
}

/**
 * Get max lesson order for a section
 */
export async function getMaxLessonOrder(sectionId: string): Promise<number> {
  const lessons = await getLessonsForSection(sectionId);
  const maxOrder =
    lessons.length === 0 ? -1 : Math.max(...lessons.map((l) => l.order));
  return maxOrder + 1;
}
