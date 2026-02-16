import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "@/packages/db/schema/auth";
import { createdAt, updatedAt } from "@/packages/db/schema/helper";

// ---------------------------------------------------------------------------
// Enums (inline text enums following existing report.ts pattern)
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
// Pathways
// ---------------------------------------------------------------------------

export const pathway = pgTable(
  "pathway",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `pth_${crypto.randomUUID()}`),
    title: text("title").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    imageUrl: text("image_url"),
    difficulty: text("difficulty", { enum: DIFFICULTY_LEVELS })
      .default("beginner")
      .notNull(),
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
    index("pathway_status_idx").on(table.status),
    index("pathway_created_by_idx").on(table.createdBy),
  ]
);

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
    summary: jsonb("summary"), // Plate.js editor JSON (long-form rich text)
    slug: text("slug").notNull().unique(),
    imageUrl: text("image_url"),
    difficulty: text("difficulty", { enum: DIFFICULTY_LEVELS })
      .default("beginner")
      .notNull(),
    estimatedDuration: integer("estimated_duration"), // minutes
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
// Pathway ↔ Course (many-to-many junction)
// ---------------------------------------------------------------------------

export const pathwayCourse = pgTable(
  "pathway_course",
  {
    pathwayId: text("pathway_id")
      .notNull()
      .references(() => pathway.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.pathwayId, table.courseId] })]
);

// ---------------------------------------------------------------------------
// Course Instructors (who can edit a course)
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
    content: jsonb("content"), // Plate.js editor JSON
    type: text("type", { enum: LESSON_TYPES }).default("text").notNull(),
    order: integer("order").notNull().default(0),
    estimatedDuration: integer("estimated_duration"), // minutes
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
// Relations
// ---------------------------------------------------------------------------

export const pathwayRelations = relations(pathway, ({ one, many }) => ({
  creator: one(user, {
    fields: [pathway.createdBy],
    references: [user.id],
  }),
  pathwayCourses: many(pathwayCourse),
}));

export const courseRelations = relations(course, ({ one, many }) => ({
  creator: one(user, {
    fields: [course.createdBy],
    references: [user.id],
  }),
  instructors: many(courseInstructor),
  sections: many(section),
  enrollments: many(enrollment),
  pathwayCourses: many(pathwayCourse),
  courseCategories: many(courseCategory),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  courseCategories: many(courseCategory),
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

export const pathwayCourseRelations = relations(pathwayCourse, ({ one }) => ({
  pathway: one(pathway, {
    fields: [pathwayCourse.pathwayId],
    references: [pathway.id],
  }),
  course: one(course, {
    fields: [pathwayCourse.courseId],
    references: [course.id],
  }),
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
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  section: one(section, {
    fields: [lesson.sectionId],
    references: [section.id],
  }),
  completions: many(lessonCompletion),
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
