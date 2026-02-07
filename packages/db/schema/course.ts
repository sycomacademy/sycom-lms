import {
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { instructor } from "./instructor";

export const course = pgTable("course", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(), // "beginner" | "intermediate" | "advanced"
  price: integer("price").notNull(), // in pence/cents
  duration: integer("duration").notNull(), // total minutes
  instructorId: text("instructor_id")
    .notNull()
    .references(() => instructor.id, { onDelete: "cascade" }),
  thumbnailUrl: text("thumbnail_url"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  enrolledCount: integer("enrolled_count").notNull().default(0),
  whatYoullLearn: jsonb("what_youll_learn").$type<string[]>().default([]),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  whoIsThisFor: jsonb("who_is_this_for").$type<string[]>().default([]),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const courseModule = pgTable("course_module", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const courseSection = pgTable("course_section", {
  id: text("id").primaryKey(),
  moduleId: text("module_id")
    .notNull()
    .references(() => courseModule.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const courseLesson = pgTable("course_lesson", {
  id: text("id").primaryKey(),
  sectionId: text("section_id")
    .notNull()
    .references(() => courseSection.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  type: text("type").notNull(), // "article" | "video" | "image" | "quiz" | "mixed"
  duration: integer("duration").notNull(), // minutes
  content: text("content"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quizQuestion = pgTable("quiz_question", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => courseLesson.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  type: text("type").notNull(), // "multiple_choice" | "multiselect"
  options: jsonb("options")
    .$type<{ id: string; label: string; isCorrect: boolean }[]>()
    .notNull(),
  hint: text("hint"), // optional hint for the question
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const courseReview = pgTable("course_review", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
