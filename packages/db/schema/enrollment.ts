import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { cohort, organization, user } from "@/packages/db/schema/auth";
import { course, lesson, section } from "@/packages/db/schema/course";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const ENROLLMENT_SOURCES = [
  "public",
  "cohort_assignment",
  "admin_assigned",
] as const;
export type EnrollmentSource = (typeof ENROLLMENT_SOURCES)[number];

export const ENROLLMENT_STATUSES = [
  "active",
  "completed",
  "dropped",
  "suspended",
] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Course Assignment (org assigns courses to cohorts)
// ---------------------------------------------------------------------------

export const courseAssignment = pgTable(
  "course_assignment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `cas_${crypto.randomUUID()}`),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    assignedBy: text("assigned_by").references(() => user.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => [
    unique("course_assignment_cohort_course_uniq").on(
      table.cohortId,
      table.courseId
    ),
    index("course_assignment_course_id_idx").on(table.courseId),
    index("course_assignment_org_id_idx").on(table.organizationId),
    index("course_assignment_cohort_id_idx").on(table.cohortId),
  ]
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
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    source: text("source", { enum: ENROLLMENT_SOURCES })
      .default("public")
      .notNull(),
    status: text("status", { enum: ENROLLMENT_STATUSES })
      .default("active")
      .notNull(),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    unique("enrollment_user_course_cohort_uniq").on(
      table.userId,
      table.courseId,
      table.cohortId
    ),
    index("enrollment_user_id_idx").on(table.userId),
    index("enrollment_course_id_idx").on(table.courseId),
    index("enrollment_org_id_idx").on(table.organizationId),
    index("enrollment_cohort_id_idx").on(table.cohortId),
    index("enrollment_user_org_idx").on(table.userId, table.organizationId),
    index("enrollment_user_course_cohort_idx").on(
      table.userId,
      table.courseId,
      table.cohortId
    ),
  ]
);

// ---------------------------------------------------------------------------
// Lesson Progress
// ---------------------------------------------------------------------------

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `lpr_${crypto.randomUUID()}`),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollment.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    unique("lesson_progress_enrollment_lesson_uniq").on(
      table.enrollmentId,
      table.lessonId
    ),
    index("lesson_progress_enrollment_id_idx").on(table.enrollmentId),
    index("lesson_progress_lesson_id_idx").on(table.lessonId),
  ]
);

// ---------------------------------------------------------------------------
// Cohort Section Settings (due dates + locks)
// ---------------------------------------------------------------------------

export const cohortSectionSettings = pgTable(
  "cohort_section_settings",
  {
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    sectionId: text("section_id")
      .notNull()
      .references(() => section.id, { onDelete: "cascade" }),
    isLocked: boolean("is_locked").default(false).notNull(),
    unlocksAt: timestamp("unlocks_at"),
    dueDate: timestamp("due_date"),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    primaryKey({ columns: [table.cohortId, table.sectionId] }),
    index("cohort_section_settings_cohort_id_idx").on(table.cohortId),
  ]
);

// ---------------------------------------------------------------------------
// Cohort Lesson Settings (due dates + locks)
// ---------------------------------------------------------------------------

export const cohortLessonSettings = pgTable(
  "cohort_lesson_settings",
  {
    cohortId: text("cohort_id")
      .notNull()
      .references(() => cohort.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    isLocked: boolean("is_locked").default(false).notNull(),
    unlocksAt: timestamp("unlocks_at"),
    dueDate: timestamp("due_date"),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    primaryKey({ columns: [table.cohortId, table.lessonId] }),
    index("cohort_lesson_settings_cohort_id_idx").on(table.cohortId),
  ]
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const courseAssignmentRelations = relations(
  courseAssignment,
  ({ one }) => ({
    course: one(course, {
      fields: [courseAssignment.courseId],
      references: [course.id],
    }),
    organization: one(organization, {
      fields: [courseAssignment.organizationId],
      references: [organization.id],
    }),
    cohort: one(cohort, {
      fields: [courseAssignment.cohortId],
      references: [cohort.id],
    }),
    assignedByUser: one(user, {
      fields: [courseAssignment.assignedBy],
      references: [user.id],
    }),
  })
);

export const enrollmentRelations = relations(enrollment, ({ one, many }) => ({
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
  }),
  course: one(course, {
    fields: [enrollment.courseId],
    references: [course.id],
  }),
  organization: one(organization, {
    fields: [enrollment.organizationId],
    references: [organization.id],
  }),
  cohort: one(cohort, {
    fields: [enrollment.cohortId],
    references: [cohort.id],
  }),
  lessonProgress: many(lessonProgress),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  enrollment: one(enrollment, {
    fields: [lessonProgress.enrollmentId],
    references: [enrollment.id],
  }),
  lesson: one(lesson, {
    fields: [lessonProgress.lessonId],
    references: [lesson.id],
  }),
}));

export const cohortSectionSettingsRelations = relations(
  cohortSectionSettings,
  ({ one }) => ({
    cohort: one(cohort, {
      fields: [cohortSectionSettings.cohortId],
      references: [cohort.id],
    }),
    section: one(section, {
      fields: [cohortSectionSettings.sectionId],
      references: [section.id],
    }),
  })
);

export const cohortLessonSettingsRelations = relations(
  cohortLessonSettings,
  ({ one }) => ({
    cohort: one(cohort, {
      fields: [cohortLessonSettings.cohortId],
      references: [cohort.id],
    }),
    lesson: one(lesson, {
      fields: [cohortLessonSettings.lessonId],
      references: [lesson.id],
    }),
  })
);
