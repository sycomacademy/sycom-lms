import { nanoid } from "nanoid";
import { z } from "zod";
import { getQuizQuestionsForLesson } from "@/packages/db/queries/lesson";
import {
  createQuizAttempt,
  getCompletedLessonIds,
  getLatestQuizAttempts,
  getQuizAttemptCounts,
  isQuizComplete,
  markLessonComplete,
} from "@/packages/db/queries/progress";
import { protectedProcedure, router } from "@/packages/trpc/core/init";

export const lessonRouter = router({
  /** Get lesson progress + quiz state for sidebar checkmarks */
  getCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.string(), lessonIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const completedIds = await getCompletedLessonIds(
        ctx.session.user.id,
        input.lessonIds
      );
      return { completedLessonIds: completedIds };
    }),

  /** Mark a lesson as complete */
  markComplete: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { getCourseIdForLesson } = await import(
        "@/packages/db/queries/lesson"
      );
      const { syncEnrollmentProgress } = await import(
        "@/packages/db/queries/enrollment"
      );
      const result = await markLessonComplete({
        id: nanoid(),
        userId: ctx.session.user.id,
        lessonId: input.lessonId,
      });
      const courseId = await getCourseIdForLesson(input.lessonId);
      if (courseId) {
        await syncEnrollmentProgress(ctx.session.user.id, courseId);
      }
      return result;
    }),

  /** Get quiz questions for a lesson (without correct answers on client) */
  getQuizQuestions: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input }) => {
      const questions = await getQuizQuestionsForLesson(input.lessonId);
      // Strip isCorrect from options for client security
      return questions.map((q) => ({
        ...q,
        options: (
          q.options as { id: string; label: string; isCorrect: boolean }[]
        ).map((opt) => ({
          id: opt.id,
          label: opt.label,
        })),
      }));
    }),

  /** Submit a quiz answer and check if it's correct */
  submitQuizAnswer: protectedProcedure
    .input(
      z.object({
        lessonId: z.string(),
        questionId: z.string(),
        selectedAnswers: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the full question with correct answers
      const questions = await getQuizQuestionsForLesson(input.lessonId);
      const question = questions.find((q) => q.id === input.questionId);
      if (!question) {
        throw new Error("Question not found");
      }

      const correctAnswerIds = (
        question.options as { id: string; label: string; isCorrect: boolean }[]
      )
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.id)
        .sort();

      const userAnswers = [...input.selectedAnswers].sort();
      const isCorrect =
        correctAnswerIds.length === userAnswers.length &&
        correctAnswerIds.every((id, i) => id === userAnswers[i]);

      // Count existing attempts for this question
      const attemptCounts = await getQuizAttemptCounts(
        ctx.session.user.id,
        input.lessonId
      );
      const existingCount =
        attemptCounts.find((a) => a.questionId === input.questionId)
          ?.attempts ?? 0;

      const attempt = await createQuizAttempt({
        id: nanoid(),
        userId: ctx.session.user.id,
        lessonId: input.lessonId,
        questionId: input.questionId,
        selectedAnswers: input.selectedAnswers,
        isCorrect,
        attemptNumber: Number(existingCount) + 1,
      });

      return {
        isCorrect,
        attemptNumber: attempt?.attemptNumber ?? 1,
        correctAnswerIds: isCorrect ? correctAnswerIds : undefined,
      };
    }),

  /** Get quiz attempt state for a lesson (for restoring state) */
  getQuizState: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [latestAttempts, attemptCounts] = await Promise.all([
        getLatestQuizAttempts(ctx.session.user.id, input.lessonId),
        getQuizAttemptCounts(ctx.session.user.id, input.lessonId),
      ]);

      // Get the questions to check if quiz is fully complete
      const questions = await getQuizQuestionsForLesson(input.lessonId);
      const questionIds = questions.map((q) => q.id);
      const quizComplete = await isQuizComplete(
        ctx.session.user.id,
        input.lessonId,
        questionIds
      );

      return {
        latestAttempts,
        attemptCounts: attemptCounts.map((a) => ({
          questionId: a.questionId,
          attempts: Number(a.attempts),
        })),
        isQuizComplete: quizComplete,
      };
    }),
});
