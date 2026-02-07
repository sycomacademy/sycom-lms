import { eq } from "drizzle-orm";
import { db } from "@/packages/db";
import {
  course,
  courseLesson,
  courseModule,
  courseSection,
  quizQuestion,
} from "@/packages/db/schema/course";

/**
 * Get a single lesson by ID
 */
export async function getLessonById(lessonId: string) {
  const result = await db
    .select()
    .from(courseLesson)
    .where(eq(courseLesson.id, lessonId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get quiz questions for a lesson, ordered
 */
export async function getQuizQuestionsForLesson(lessonId: string) {
  return db
    .select()
    .from(quizQuestion)
    .where(eq(quizQuestion.lessonId, lessonId))
    .orderBy(quizQuestion.order);
}

/**
 * Get a lesson with its full context: section, module, course
 */
export async function getLessonWithContext(lessonId: string) {
  const result = await db
    .select({
      lesson: courseLesson,
      section: courseSection,
      module: courseModule,
      course,
    })
    .from(courseLesson)
    .innerJoin(courseSection, eq(courseLesson.sectionId, courseSection.id))
    .innerJoin(courseModule, eq(courseSection.moduleId, courseModule.id))
    .innerJoin(course, eq(courseModule.courseId, course.id))
    .where(eq(courseLesson.id, lessonId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get a flat ordered list of all lessons in a course (for prev/next navigation)
 */
export async function getAllLessonsForCourse(courseId: string) {
  return db
    .select({
      lessonId: courseLesson.id,
      lessonTitle: courseLesson.title,
      lessonType: courseLesson.type,
      lessonOrder: courseLesson.order,
      sectionId: courseSection.id,
      sectionTitle: courseSection.title,
      sectionOrder: courseSection.order,
      moduleId: courseModule.id,
      moduleTitle: courseModule.title,
      moduleOrder: courseModule.order,
    })
    .from(courseLesson)
    .innerJoin(courseSection, eq(courseLesson.sectionId, courseSection.id))
    .innerJoin(courseModule, eq(courseSection.moduleId, courseModule.id))
    .where(eq(courseModule.courseId, courseId))
    .orderBy(courseModule.order, courseSection.order, courseLesson.order);
}

/**
 * Get the course ID for a given lesson
 */
export async function getCourseIdForLesson(lessonId: string) {
  const result = await db
    .select({ courseId: courseModule.courseId })
    .from(courseLesson)
    .innerJoin(courseSection, eq(courseLesson.sectionId, courseSection.id))
    .innerJoin(courseModule, eq(courseSection.moduleId, courseModule.id))
    .where(eq(courseLesson.id, lessonId))
    .limit(1);
  return result[0]?.courseId ?? null;
}

/**
 * Get the next lesson for a user (first incomplete, or first lesson if none started)
 */
export async function getNextLessonForUser(
  userId: string,
  courseId: string
): Promise<{ lessonId: string } | null> {
  const { getCompletedLessonIds } = await import("./progress");
  const allLessons = await getAllLessonsForCourse(courseId);
  if (allLessons.length === 0) {
    return null;
  }
  const lessonIds = allLessons.map((l) => l.lessonId);
  const completed = await getCompletedLessonIds(userId, lessonIds);
  const firstIncomplete = allLessons.find(
    (l) => !completed.includes(l.lessonId)
  );
  return firstIncomplete
    ? { lessonId: firstIncomplete.lessonId }
    : { lessonId: allLessons[0].lessonId };
}

/**
 * Get all lesson IDs in a course (for batch progress lookup)
 */
export async function getLessonIdsForCourse(courseId: string) {
  const result = await db
    .select({ lessonId: courseLesson.id })
    .from(courseLesson)
    .innerJoin(courseSection, eq(courseLesson.sectionId, courseSection.id))
    .innerJoin(courseModule, eq(courseSection.moduleId, courseModule.id))
    .where(eq(courseModule.courseId, courseId));
  return result.map((r) => r.lessonId);
}
