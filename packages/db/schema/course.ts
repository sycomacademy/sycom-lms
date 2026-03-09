import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "@/packages/db/helper";
import { user } from "@/packages/db/schema/auth";
import {
  cohortLessonSettings,
  cohortSectionSettings,
  courseAssignment,
  enrollment,
  lessonProgress,
} from "@/packages/db/schema/enrollment";
import { orgCourseEntitlement } from "@/packages/db/schema/entitlement";

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

export const LESSON_TYPES = ["article", "test"] as const;
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
// Lessons (smallest learning unit — stores Tiptap JSON content)
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
    type: text("type", { enum: LESSON_TYPES }).default("article").notNull(),
    order: integer("order").notNull().default(0),
    estimatedDuration: integer("estimated_duration"),
    createdAt,
    updatedAt,
  },
  (table) => [index("lesson_section_id_idx").on(table.sectionId)]
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
  courseAssignments: many(courseAssignment),
  categories: many(courseCategory),
  entitlements: many(orgCourseEntitlement),
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
  cohortSectionSettings: many(cohortSectionSettings),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  section: one(section, {
    fields: [lesson.sectionId],
    references: [section.id],
  }),
  progress: many(lessonProgress),
  cohortLessonSettings: many(cohortLessonSettings),
}));
