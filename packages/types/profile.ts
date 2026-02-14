import { z } from "zod";
import { emailSchema, nameSchema } from "@/packages/types/auth";

/**
 * URL validation helper
 */
const urlSchema = z.string().url("Please enter a valid URL").or(z.literal(""));

/**
 * Twitter handle validation
 */
const twitterHandleSchema = z
  .string()
  .regex(/^@?[a-zA-Z0-9_]{1,15}$/, "Please enter a valid Twitter handle")
  .or(z.literal(""));

/**
 * Profile Settings Schema (stored in profile.settings JSONB)
 */
export const profileSettingsSchema = z.object({
  useDeviceTimezone: z.boolean().optional().default(true),
  enableFacehash: z.boolean().optional().default(true),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;

/**
 * Profile Update Schema
 */
export const updateProfileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatarUrl: urlSchema.optional(),
  jobTitle: z
    .string()
    .max(100, "Job title must be less than 100 characters")
    .optional(),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  website: urlSchema.optional(),
  linkedinUrl: urlSchema.optional(),
  twitterHandle: twitterHandleSchema.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Create Profile Schema (includes userId)
 */
export const createProfileSchema = updateProfileSchema.extend({
  settings: profileSettingsSchema.optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export const submitFeedbackSchema = z.object({
  message: z
    .string()
    .min(1, "Feedback is required")
    .max(2000, "Feedback must be less than 2000 characters"),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

export const getProfileByUserIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type GetProfileByUserIdInput = z.infer<typeof getProfileByUserIdSchema>;

/**
 * Combined account update input for profile.update (user + profile fields).
 * All fields optional; only provided fields are updated.
 */
export const updateAccountSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  image: z.url().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  settings: profileSettingsSchema.partial().optional(),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
