import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/packages/db";
import { lessonProgress, quizAttempt } from "@/packages/db/schema/progress";

// ─── Lesson Progress ────────────────────────────────────

/**
 * Get progress for a specific user + lesson
 */
export async function getLessonProgress(userId: string, lessonId: string) {
  const result = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get all completed lesson IDs for a user within a set of lesson IDs
 * (used to show completion checkmarks in the sidebar)
 */
export async function getCompletedLessonIds(
  userId: string,
  lessonIds: string[]
) {
  if (lessonIds.length === 0) {
    return [];
  }
  const result = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        inArray(lessonProgress.lessonId, lessonIds),
        eq(lessonProgress.completed, true)
      )
    );
  return result.map((r) => r.lessonId);
}

/**
 * Mark a lesson as completed
 */
export async function markLessonComplete(data: {
  id: string;
  userId: string;
  lessonId: string;
}) {
  const existing = await getLessonProgress(data.userId, data.lessonId);
  if (existing) {
    await db
      .update(lessonProgress)
      .set({
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(lessonProgress.id, existing.id));
    return { ...existing, completed: true, completedAt: new Date() };
  }
  const result = await db
    .insert(lessonProgress)
    .values({
      id: data.id,
      userId: data.userId,
      lessonId: data.lessonId,
      completed: true,
      completedAt: new Date(),
    })
    .returning();
  return result[0];
}

// ─── Quiz Attempts ──────────────────────────────────────

/**
 * Get all attempts for a user on a specific lesson's quiz
 */
export async function getQuizAttemptsForLesson(
  userId: string,
  lessonId: string
) {
  return db
    .select()
    .from(quizAttempt)
    .where(
      and(eq(quizAttempt.userId, userId), eq(quizAttempt.lessonId, lessonId))
    );
}

/**
 * Get the number of attempts per question for a user on a lesson
 */
export async function getQuizAttemptCounts(userId: string, lessonId: string) {
  return db
    .select({
      questionId: quizAttempt.questionId,
      attempts: count(quizAttempt.id),
    })
    .from(quizAttempt)
    .where(
      and(eq(quizAttempt.userId, userId), eq(quizAttempt.lessonId, lessonId))
    )
    .groupBy(quizAttempt.questionId);
}

/**
 * Check if all quiz questions for a lesson have been answered correctly
 */
export async function isQuizComplete(
  userId: string,
  lessonId: string,
  questionIds: string[]
) {
  if (questionIds.length === 0) {
    return true;
  }
  const correctAttempts = await db
    .select({ questionId: quizAttempt.questionId })
    .from(quizAttempt)
    .where(
      and(
        eq(quizAttempt.userId, userId),
        eq(quizAttempt.lessonId, lessonId),
        eq(quizAttempt.isCorrect, true),
        inArray(quizAttempt.questionId, questionIds)
      )
    );
  const correctQuestionIds = new Set(correctAttempts.map((a) => a.questionId));
  return questionIds.every((qid) => correctQuestionIds.has(qid));
}

/**
 * Record a quiz attempt
 */
export async function createQuizAttempt(data: {
  id: string;
  userId: string;
  lessonId: string;
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  attemptNumber: number;
}) {
  const result = await db.insert(quizAttempt).values(data).returning();
  return result[0];
}

/**
 * Compute course progress (0-100) from lesson_progress for a user
 */
export async function computeEnrollmentProgress(
  userId: string,
  courseId: string
): Promise<number> {
  const { getLessonIdsForCourse } = await import("./lesson");
  const lessonIds = await getLessonIdsForCourse(courseId);
  if (lessonIds.length === 0) {
    return 0;
  }
  const completed = await getCompletedLessonIds(userId, lessonIds);
  return Math.round((completed.length / lessonIds.length) * 100);
}

/**
 * Get the latest attempt for each question in a lesson
 */
export async function getLatestQuizAttempts(userId: string, lessonId: string) {
  // Get all attempts and group by question, taking the latest
  const attempts = await db
    .select()
    .from(quizAttempt)
    .where(
      and(eq(quizAttempt.userId, userId), eq(quizAttempt.lessonId, lessonId))
    )
    .orderBy(quizAttempt.createdAt);

  // Group by question, keep latest
  const latestByQuestion = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    latestByQuestion.set(attempt.questionId, attempt);
  }
  return Array.from(latestByQuestion.values());
}
