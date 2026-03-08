import { z } from "zod";
import type { UserRole } from "../db/schema/auth";
import {
  storageEntityTypeEnum,
  storageFolderEnum,
  storageResourceTypeEnum,
} from "../db/schema/storage";

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");
export const emailSchema = z.email("Please enter a valid email address");
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  );
export const signUpSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * User update payload (Better Auth). All fields optional.
 */
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Profile settings stored in profile.settings JSONB column.
 */
export const profileSettingsSchema = z.object({
  useDeviceTimezone: z.boolean().optional().default(true),
  enableFacehash: z.boolean().optional().default(true),
  marketingEmails: z.boolean().optional().default(true),
});
export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;

/**
 * Combined account update input for user.update tRPC procedure.
 * Covers both Better Auth user fields and profile fields.
 */
export const updateAccountSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  image: z.url().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  settings: profileSettingsSchema.partial().optional(),
});
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

// ---------------------------------------------------------------------------
// Feedback schemas
// ---------------------------------------------------------------------------
/**
 * Feedback submission input.
 */
export const submitFeedbackSchema = z.object({
  message: z
    .string()
    .min(1, "Feedback is required")
    .max(2000, "Feedback must be less than 2000 characters"),
});
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

export const reportTypeEnum = z.enum(["bug", "feature", "complaint", "other"]);
export type ReportType = z.infer<typeof reportTypeEnum>;

export const REPORT_TYPE_OPTIONS: Array<{
  value: ReportType;
  label: string;
}> = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];

export const submitReportSchema = z.object({
  type: reportTypeEnum,
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  imageBase64: z.string().optional().nullable(),
  imageMimeType: z.string().optional().nullable(),
});
export type SubmitReportInput = z.infer<typeof submitReportSchema>;

export const submitReportFormSchema = submitReportSchema
  .omit({ imageBase64: true, imageMimeType: true })
  .extend({
    screenshot: z.instanceof(File).nullable().optional(),
  });
export type SubmitReportFormInput = z.infer<typeof submitReportFormSchema>;

export const AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const avatarMimeTypeSchema = z.enum(AVATAR_MIME_TYPES);
export const avatarAccept = {
  "image/*": [".jpg", ".jpeg", ".png", ".webp"],
} as const;
export const MAX_AVATAR_SIZE = 1024 * 1024 * 4;

export const avatarFormSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine(
      (file) =>
        AVATAR_MIME_TYPES.includes(
          file.type as (typeof AVATAR_MIME_TYPES)[number]
        ),
      {
        message: "Please upload a JPEG, PNG, or WebP image",
      }
    )
    .refine((file) => file.size <= MAX_AVATAR_SIZE, {
      message: "Maximum file size is 4MB",
    })
    .nullable(),
});
export type AvatarFormInput = z.infer<typeof avatarFormSchema>;

// ---------------------------------------------------------------------------
// Storage schemas
// ---------------------------------------------------------------------------

/**
 * Storage schema.
 */
export const storageFolderSchema = z.enum(storageFolderEnum.enumValues);
export const storageEntityTypeSchema = z.enum(storageEntityTypeEnum.enumValues);
export const storageResourceTypeSchema = z.enum(
  storageResourceTypeEnum.enumValues
);

export const signUploadSchema = z.object({
  folder: storageFolderSchema,
  entityId: z.string().min(1),
});

export const saveAssetSchema = z.object({
  publicId: z.string().min(1),
  secureUrl: z.url(),
  folder: storageFolderSchema,
  resourceType: storageResourceTypeSchema,
  format: z.string().min(1).optional(),
  bytes: z.number().int().nonnegative().optional(),
  width: z.number().int().nonnegative().optional(),
  height: z.number().int().nonnegative().optional(),
  entityId: z.string().min(1),
  entityType: storageEntityTypeSchema,
});

export const signedUrlSchema = z.object({
  assetId: z.string().min(1),
  expireIn: z
    .number()
    .int()
    .min(60)
    .max(60 * 60)
    .default(300),
  download: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Admin schemas
// ---------------------------------------------------------------------------

export const ROLE_LABELS: Record<UserRole, string> = {
  platform_admin: "Platform Admin",
  content_creator: "Content Creator",
  platform_student: "Student",
};

export const listAdminUsersSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  search: z.string().optional(),
  filterRole: z
    .enum(["platform_admin", "content_creator", "platform_student"])
    .optional(),
  filterStatus: z.enum(["active", "banned", "unverified"]).optional(),
  filterRoles: z
    .array(z.enum(["platform_admin", "content_creator", "platform_student"]))
    .optional(),
  filterStatuses: z
    .array(z.enum(["active", "banned", "unverified"]))
    .optional(),
  sortBy: z.enum(["name", "email", "createdAt"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export const createPublicInviteSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Please enter a valid email address"),
  role: z.enum(["platform_admin", "content_creator"]),
});

export const listPublicInvitesSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  search: z.string().optional(),
  statuses: z
    .array(z.enum(["pending", "accepted", "expired", "revoked"]))
    .optional(),
});

export const publicInviteTokenSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
});

export const acceptPublicInviteSchema = publicInviteTokenSchema.extend({
  password: passwordSchema,
});

// ---------------------------------------------------------------------------
// Course schemas
// ---------------------------------------------------------------------------

export const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
] as const;

export const listPublicCoursesSchema = z.object({
  limit: z.number().min(1).max(100).default(12),
  offset: z.number().min(0).default(0),
});

export const listCoursesSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z
    .enum(["title", "createdAt", "updatedAt", "status"])
    .default("updatedAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  filterStatuses: z.array(z.enum(["draft", "published"])).optional(),
  filterDifficulties: z
    .array(z.enum(["beginner", "intermediate", "advanced", "expert"]))
    .optional(),
  filterCategoryIds: z.array(z.string()).optional(),
});

export const listLibrarySchema = z.object({
  limit: z.number().min(1).max(100).default(12),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z.enum(["title", "createdAt", "updatedAt"]).default("updatedAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  filterDifficulties: z
    .array(z.enum(["beginner", "intermediate", "advanced", "expert"]))
    .optional(),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  summary: z.any().optional(),
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
  status: z.enum(["draft", "published"]).default("draft"),
  categoryIds: z.array(z.string()).optional(),
});

export const createCourseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Must be lowercase letters, numbers, and hyphens only"
    ),
  description: z.string().max(2000).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

export type CreateCourseFormInput = z.infer<typeof createCourseFormSchema>;

export const updateCourseSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  summary: z.any().optional(),
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
  status: z.enum(["draft", "published"]).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const editCourseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Must be lowercase letters, numbers, and hyphens only"
    ),
  description: z.string().max(2000).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  status: z.enum(["draft", "published"]),
  thumbnail: z.instanceof(File).nullable().optional(),
});
export type EditCourseFormInput = z.infer<typeof editCourseFormSchema>;

export const deleteCourseSchema = z.object({
  courseId: z.string(),
});

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

export const createLessonSchema = z.object({
  sectionId: z.string(),
  title: z.string().min(1, "Title is required").max(200),
  content: z.any().optional(),
  type: z.enum(["article", "test"]).default("article"),
  isLocked: z.boolean().default(false),
  estimatedDuration: z.number().int().positive().optional(),
});

export const updateLessonSchema = z.object({
  lessonId: z.string(),
  sectionId: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
  type: z.enum(["article", "test"]).optional(),
  order: z.number().int().min(0).optional(),
  isLocked: z.boolean().optional(),
  estimatedDuration: z.number().int().positive().nullish(),
});

export const deleteLessonSchema = z.object({
  lessonId: z.string(),
});

export const reorderSectionsSchema = z.object({
  courseId: z.string(),
  sectionIds: z.array(z.string()),
});

export const reorderLessonsSchema = z.object({
  sectionId: z.string(),
  lessonIds: z.array(z.string()),
});

export const moveLessonSchema = z.object({
  lessonId: z.string(),
  targetSectionId: z.string(),
  newOrder: z.number().int().min(0),
});

export const assignCourseToCohortSchema = z.object({
  cohortId: z.string(),
  courseId: z.string(),
});

export const unassignCourseFromCohortSchema = z.object({
  cohortId: z.string(),
  courseId: z.string(),
});

export const setSectionDueDateSchema = z.object({
  cohortId: z.string(),
  sectionId: z.string(),
  dueDate: z.coerce.date(),
});

export const setLessonDueDateSchema = z.object({
  cohortId: z.string(),
  lessonId: z.string(),
  dueDate: z.coerce.date(),
});

export const getEnrolledCourseSchema = z.object({
  courseId: z.string(),
});

export const getEnrolledLessonSchema = z.object({
  courseId: z.string(),
  lessonId: z.string(),
});

export const markLessonCompleteSchema = z.object({
  courseId: z.string(),
  lessonId: z.string(),
});
