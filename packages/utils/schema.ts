import { z } from "zod";
import {
  storageFolderEnum,
  storageResourceTypeEnum,
} from "../db/schema/storage";

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

/**
 * Storage schema.
 */
export const storageFolderSchema = z.enum(storageFolderEnum.enumValues);
export const storageResourceTypeSchema = z.enum(
  storageResourceTypeEnum.enumValues
);

export const signUploadSchema = z.object({
  folder: storageFolderSchema,
  ownerId: z.string().min(1),
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
  ownerId: z.string().min(1),
  ownerType: z.string().min(1),
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
