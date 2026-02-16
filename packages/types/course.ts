import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listCoursesSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z
    .enum(["title", "createdAt", "updatedAt", "status"])
    .default("updatedAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  filterCategoryIds: z.array(z.string()).optional(),
  filterStatuses: z
    .array(z.enum(["draft", "published", "archived"]))
    .optional(),
  filterDifficulties: z
    .array(z.enum(["beginner", "intermediate", "advanced", "expert"]))
    .optional(),
});

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
  difficulty: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .default("beginner"),
  estimatedDuration: z.number().int().positive().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  categoryIds: z.array(z.string()).optional(),
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
  difficulty: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional(),
  estimatedDuration: z.number().int().positive().nullish(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const deleteCourseSchema = z.object({
  courseId: z.string(),
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
  content: z.any().optional(),
  type: z.enum(["text", "video", "quiz"]).default("text"),
  estimatedDuration: z.number().int().positive().optional(),
});

export const updateLessonSchema = z.object({
  lessonId: z.string(),
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
  type: z.enum(["text", "video", "quiz"]).optional(),
  order: z.number().int().min(0).optional(),
  estimatedDuration: z.number().int().positive().nullish(),
});

export const deleteLessonSchema = z.object({
  lessonId: z.string(),
});
