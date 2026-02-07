import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { courseLesson, quizQuestion } from "./course";

/**
 * Tracks per-lesson completion for each user.
 */
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => courseLesson.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    timeSpent: integer("time_spent").default(0), // seconds
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("lesson_progress_user_lesson").on(table.userId, table.lessonId),
  ]
);

/**
 * Tracks each quiz attempt per user per question.
 * We store per-question attempts so we can show "tries per quiz".
 */
export const quizAttempt = pgTable("quiz_attempt", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => courseLesson.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => quizQuestion.id, { onDelete: "cascade" }),
  selectedAnswers: jsonb("selected_answers").$type<string[]>().notNull(), // array of option IDs
  isCorrect: boolean("is_correct").notNull(),
  attemptNumber: integer("attempt_number").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
