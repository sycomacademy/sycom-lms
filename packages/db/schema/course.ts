import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "@/packages/db/helper";
import { cohort, user } from "@/packages/db/schema/auth";

// ---------------------------------------------------------------------------
// Enums (inline text enums)
// ---------------------------------------------------------------------------

export const COURSE_STATUSES = ["draft", "published"] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const DIFFICULTY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const INSTRUCTOR_ROLES = ["main", "secondary"] as const;
export type InstructorRole = (typeof INSTRUCTOR_ROLES)[number];

export const LESSON_TYPES = ["text", "video", "quiz"] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export const course = pgTable(
  "course",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `crs_${crypto.randomUUID()}`),
    title: text("title").notNull(),
    description: text("description"),
    summary: jsonb("summary"),
    slug: text("slug").notNull().unique(),
    imageUrl: text("image_url"),
    difficulty: text("difficulty", { enum: DIFFICULTY_LEVELS })
      .default("beginner")
      .notNull(),
    estimatedDuration: integer("estimated_duration"),
    status: text("status", { enum: COURSE_STATUSES })
      .default("draft")
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("course_status_idx").on(table.status),
    index("course_created_by_idx").on(table.createdBy),
  ]
);

// ---------------------------------------------------------------------------
// Categories (for courses)
// ---------------------------------------------------------------------------

export const category = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `cat_${crypto.randomUUID()}`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  order: integer("order").default(0),
});

// ---------------------------------------------------------------------------
// Course ↔ Category (many-to-many junction)
// ---------------------------------------------------------------------------

export const courseCategory = pgTable(
  "course_category",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.courseId, table.categoryId] }),
    index("course_category_category_id_idx").on(table.categoryId),
  ]
);

// ---------------------------------------------------------------------------
// Course Instructors (creator = main, co-leads = secondary)
// ---------------------------------------------------------------------------

export const courseInstructor = pgTable(
  "course_instructor",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: INSTRUCTOR_ROLES })
      .notNull()
      .default("secondary"),
    addedBy: text("added_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt,
  },
  (table) => [primaryKey({ columns: [table.courseId, table.userId] })]
);

// ---------------------------------------------------------------------------
// Sections (groups of lessons within a course)
// ---------------------------------------------------------------------------

export const section = pgTable(
  "section",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `sec_${crypto.randomUUID()}`),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    order: integer("order").notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => [index("section_course_id_idx").on(table.courseId)]
);

// ---------------------------------------------------------------------------
// Lessons (smallest learning unit — stores Plate.js JSON content)
// ---------------------------------------------------------------------------

export const lesson = pgTable(
  "lesson",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `lsn_${crypto.randomUUID()}`),
    sectionId: text("section_id")
      .notNull()
      .references(() => section.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: jsonb("content"),
    type: text("type", { enum: LESSON_TYPES }).default("text").notNull(),
    order: integer("order").notNull().default(0),
    isLocked: boolean("is_locked").notNull().default(false),
    estimatedDuration: integer("estimated_duration"),
    createdAt,
    updatedAt,
  },
  (table) => [index("lesson_section_id_idx").on(table.sectionId)]
);

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------

export const enrollment = pgTable(
  "enrollment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `enr_${crypto.randomUUID()}`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    unique("enrollment_user_course_uniq").on(table.userId, table.courseId),
    index("enrollment_user_id_idx").on(table.userId),
    index("enrollment_course_id_idx").on(table.courseId),
  ]
);

// ---------------------------------------------------------------------------
// Lesson Completions
// ---------------------------------------------------------------------------

export const lessonCompletion = pgTable(
  "lesson_completion",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `lcp_${crypto.randomUUID()}`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [
    unique("lesson_completion_user_lesson_uniq").on(
      table.userId,
      table.lessonId
    ),
    index("lesson_completion_user_id_idx").on(table.userId),
    index("lesson_completion_lesson_id_idx").on(table.lessonId),
  ]
);

// ---------------------------------------------------------------------------
// Cohort-Course Assignment (org assigns courses to cohorts)
// ---------------------------------------------------------------------------

export const cohortCourse = pgTable(
  "cohort_course",
  {
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.cohortId, table.courseId] }),
    index("cohort_course_cohort_id_idx").on(table.cohortId),
    index("cohort_course_course_id_idx").on(table.courseId),
  ]
);

// ---------------------------------------------------------------------------
// Per-Cohort Due Dates (org_teacher/owner/admin set these)
// ---------------------------------------------------------------------------

export const cohortSectionDueDate = pgTable(
  "cohort_section_due_date",
  {
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    sectionId: text("section_id")
      .notNull()
      .references(() => section.id, { onDelete: "cascade" }),
    dueDate: timestamp("due_date").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.cohortId, table.sectionId] }),
    index("cohort_section_due_date_cohort_id_idx").on(table.cohortId),
  ]
);

export const cohortLessonDueDate = pgTable(
  "cohort_lesson_due_date",
  {
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    dueDate: timestamp("due_date").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.cohortId, table.lessonId] }),
    index("cohort_lesson_due_date_cohort_id_idx").on(table.cohortId),
  ]
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const categoryRelations = relations(category, ({ many }) => ({
  courses: many(courseCategory),
}));

export const courseCategoryRelations = relations(courseCategory, ({ one }) => ({
  course: one(course, {
    fields: [courseCategory.courseId],
    references: [course.id],
  }),
  category: one(category, {
    fields: [courseCategory.categoryId],
    references: [category.id],
  }),
}));

export const courseRelations = relations(course, ({ one, many }) => ({
  creator: one(user, {
    fields: [course.createdBy],
    references: [user.id],
  }),
  instructors: many(courseInstructor),
  sections: many(section),
  enrollments: many(enrollment),
  cohortCourses: many(cohortCourse),
  categories: many(courseCategory),
}));

export const courseInstructorRelations = relations(
  courseInstructor,
  ({ one }) => ({
    course: one(course, {
      fields: [courseInstructor.courseId],
      references: [course.id],
    }),
    user: one(user, {
      fields: [courseInstructor.userId],
      references: [user.id],
    }),
    addedByUser: one(user, {
      fields: [courseInstructor.addedBy],
      references: [user.id],
    }),
  })
);

export const sectionRelations = relations(section, ({ one, many }) => ({
  course: one(course, {
    fields: [section.courseId],
    references: [course.id],
  }),
  lessons: many(lesson),
  cohortSectionDueDates: many(cohortSectionDueDate),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  section: one(section, {
    fields: [lesson.sectionId],
    references: [section.id],
  }),
  completions: many(lessonCompletion),
  cohortLessonDueDates: many(cohortLessonDueDate),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
  }),
  course: one(course, {
    fields: [enrollment.courseId],
    references: [course.id],
  }),
}));

export const lessonCompletionRelations = relations(
  lessonCompletion,
  ({ one }) => ({
    user: one(user, {
      fields: [lessonCompletion.userId],
      references: [user.id],
    }),
    lesson: one(lesson, {
      fields: [lessonCompletion.lessonId],
      references: [lesson.id],
    }),
  })
);

export const cohortCourseRelations = relations(cohortCourse, ({ one }) => ({
  cohort: one(cohort, {
    fields: [cohortCourse.cohortId],
    references: [cohort.id],
  }),
  course: one(course, {
    fields: [cohortCourse.courseId],
    references: [course.id],
  }),
}));

export const cohortSectionDueDateRelations = relations(
  cohortSectionDueDate,
  ({ one }) => ({
    cohort: one(cohort, {
      fields: [cohortSectionDueDate.cohortId],
      references: [cohort.id],
    }),
    section: one(section, {
      fields: [cohortSectionDueDate.sectionId],
      references: [section.id],
    }),
  })
);

export const cohortLessonDueDateRelations = relations(
  cohortLessonDueDate,
  ({ one }) => ({
    cohort: one(cohort, {
      fields: [cohortLessonDueDate.cohortId],
      references: [cohort.id],
    }),
    lesson: one(lesson, {
      fields: [cohortLessonDueDate.lessonId],
      references: [lesson.id],
    }),
  })
);
