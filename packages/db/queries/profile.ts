import { eq } from "drizzle-orm";
import type { Database } from "@/packages/db";
import { profile } from "@/packages/db/schema/profile";

export interface GetProfileByUserIdParams {
  userId: string;
}

export const getProfileByUserId = async (
  db: Database,
  params: GetProfileByUserIdParams
) => {
  const [result] = await db
    .select({
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })
    .from(profile)
    .where(eq(profile.userId, params.userId));

  return result ?? null;
};
