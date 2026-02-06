import { eq } from "drizzle-orm";
import { db } from "@/packages/db";
import type { ProfileSettings } from "@/packages/db/schema/profile";
import { profile } from "@/packages/db/schema/profile";

/**
 * Get a user's profile by user ID
 */
export async function getProfileByUserId(userId: string) {
  const result = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new profile for a user
 */
export async function createProfile({
  id,
  userId,
  bio,
  avatarUrl,
  jobTitle,
  company,
  location,
  website,
  linkedinUrl,
  twitterHandle,
  settings,
}: {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  settings?: ProfileSettings;
}) {
  const result = await db
    .insert(profile)
    .values({
      id,
      userId,
      bio,
      avatarUrl,
      jobTitle,
      company,
      location,
      website,
      linkedinUrl,
      twitterHandle,
      settings: settings ?? {},
    })
    .returning();

  return result[0];
}

/**
 * Update a user's profile
 */
export async function updateProfile(
  userId: string,
  data: Partial<{
    bio: string;
    avatarUrl: string;
    jobTitle: string;
    company: string;
    location: string;
    website: string;
    linkedinUrl: string;
    twitterHandle: string;
    settings: ProfileSettings;
  }>
) {
  const result = await db
    .update(profile)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId))
    .returning();

  return result[0] ?? null;
}

/**
 * Update profile settings only
 */
export async function updateProfileSettings(
  userId: string,
  settings: Partial<ProfileSettings>
) {
  const existing = await getProfileByUserId(userId);
  if (!existing) {
    return null;
  }

  const mergedSettings = {
    ...((existing.settings as ProfileSettings) ?? {}),
    ...settings,
  };

  return updateProfile(userId, { settings: mergedSettings });
}

/**
 * Delete a user's profile
 */
export async function deleteProfile(userId: string) {
  const result = await db
    .delete(profile)
    .where(eq(profile.userId, userId))
    .returning();

  return result[0] ?? null;
}

/**
 * Check if a profile exists for a user
 */
export async function profileExists(userId: string) {
  const result = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);

  return result.length > 0;
}
