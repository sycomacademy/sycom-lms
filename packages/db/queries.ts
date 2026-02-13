import { eq } from "drizzle-orm";
import type { Database } from "@/packages/db";
import { profile } from "@/packages/db/schema/profile";
import type {
  GetProfileByUserIdInput,
  SubmitFeedbackInput,
} from "@/packages/types/profile";
import { feedback } from "./schema/feedback";

/** Updatable profile columns (no id, userId, createdAt). */
export type UpdateProfileData = Partial<
  Pick<typeof profile.$inferInsert, "bio" | "settings">
>;

export const getProfileByUserId = async (
  db: Database,
  params: GetProfileByUserIdInput
) => {
  const [result] = await db
    .select({
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      settings: profile.settings,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })
    .from(profile)
    .where(eq(profile.userId, params.userId));

  return result ?? null;
};

export const updateProfileByUserId = async (
  db: Database,
  params: { userId: string; data: UpdateProfileData }
) => {
  const updated = await db
    .update(profile)
    .set(params.data)
    .where(eq(profile.userId, params.userId))
    .returning({
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      settings: profile.settings,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  return updated[0] ?? null;
};

export const submitFeedback = async (
  db: Database,
  params: SubmitFeedbackInput & { userId: string; email: string }
) => {
  const result = await db.insert(feedback).values({
    email: params.email,
    userId: params.userId,
    message: params.message,
  });

  return result;
};
