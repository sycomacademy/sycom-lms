import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared enum values (mirrors DB schema)
// ---------------------------------------------------------------------------

export const courseStatuses = ["draft", "published", "archived"] as const;
export const difficultyLevels = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;
export const instructorRoles = ["main", "secondary"] as const;
export const lessonTypes = ["text", "video", "quiz"] as const;

// ---------------------------------------------------------------------------
// Course list / query inputs
// ---------------------------------------------------------------------------

export const listCoursesSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z
    .enum(["title", "createdAt", "updatedAt", "status"])
    .default("updatedAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  filterStatus: z.enum(courseStatuses).optional(),
  filterDifficulty: z.enum(difficultyLevels).optional(),
});

// ---------------------------------------------------------------------------
// Course mutations
// ---------------------------------------------------------------------------

export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
  imageUrl: z.string().url().optional(),
  difficulty: z.enum(difficultyLevels).default("beginner"),
  estimatedDuration: z.number().int().positive().optional(),
  status: z.enum(courseStatuses).default("draft"),
});

export const updateCourseSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  imageUrl: z.string().url().nullish(),
  difficulty: z.enum(difficultyLevels).optional(),
  estimatedDuration: z.number().int().positive().nullish(),
  status: z.enum(courseStatuses).optional(),
});

export const deleteCourseSchema = z.object({
  courseId: z.string(),
});

// ---------------------------------------------------------------------------
// Instructor management
// ---------------------------------------------------------------------------

export const addInstructorSchema = z.object({
  courseId: z.string(),
  userId: z.string(),
});

export const removeInstructorSchema = z.object({
  courseId: z.string(),
  userId: z.string(),
});

// ---------------------------------------------------------------------------
// Section mutations
// ---------------------------------------------------------------------------

export const createSectionSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
});

export const updateSectionSchema = z.object({
  sectionId: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0).optional(),
});

export const deleteSectionSchema = z.object({
  sectionId: z.string(),
});

// ---------------------------------------------------------------------------
// Lesson mutations
// ---------------------------------------------------------------------------

export const createLessonSchema = z.object({
  sectionId: z.string(),
  title: z.string().min(1, "Title is required").max(200),
  content: z.any().optional(), // Plate.js JSON
  type: z.enum(lessonTypes).default("text"),
  estimatedDuration: z.number().int().positive().optional(),
});

export const updateLessonSchema = z.object({
  lessonId: z.string(),
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(), // Plate.js JSON
  type: z.enum(lessonTypes).optional(),
  order: z.number().int().min(0).optional(),
  estimatedDuration: z.number().int().positive().nullish(),
});

export const deleteLessonSchema = z.object({
  lessonId: z.string(),
});
