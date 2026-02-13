import { auth } from "@/packages/auth/auth";
import type { UpdateProfileData } from "@/packages/db/queries";
import {
  getProfileByUserId,
  updateProfileByUserId,
} from "@/packages/db/queries";
import type { profile } from "@/packages/db/schema/profile";
import { updateAccountSchema } from "@/packages/types/profile";
import { protectedProcedure, router } from "../init";

export const profileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx: { db, session } }) => {
    const profile = await getProfileByUserId(db, { userId: session.user.id });
    return {
      profile,
      session: session.session,
      user: session.user,
    };
  }),
  update: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx: { db, session, headers }, input }) => {
      const userId = session.user.id;
      let updatedUser = session.user;
      let updatedProfile: typeof profile.$inferSelect | null = null;

      if (input.name !== undefined || input.email !== undefined) {
        const body: { name?: string; email?: string } = {};
        if (input.name !== undefined) {
          body.name = input.name;
        }
        if (input.email !== undefined) {
          body.email = input.email;
        }
        const result = (await auth.api.updateUser({
          body,
          headers,
        })) as { user?: typeof session.user };
        if (result?.user) {
          updatedUser = result.user;
        }
      }

      if (input.bio !== undefined || input.settings !== undefined) {
        const data: UpdateProfileData = {};
        if (input.bio !== undefined) {
          data.bio = input.bio;
        }
        if (input.settings !== undefined) {
          data.settings = input.settings;
        }
        updatedProfile = await updateProfileByUserId(db, {
          data,
          userId,
        });
      }

      return {
        profile: updatedProfile,
        user: updatedUser,
      };
    }),
});
