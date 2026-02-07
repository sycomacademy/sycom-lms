import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import {
  createProfile,
  getProfileByUserId,
  profileExists,
} from "@/packages/db/queries/profile";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/packages/trpc/core/init";

export const authRouter = router({
  /**
   * Get current session (optional; use useSession from Better Auth for client)
   */
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  /**
   * Get current user with profile
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getProfileByUserId(ctx.session.user.id);
    return {
      user: ctx.session.user,
      profile,
    };
  }),

  /**
   * Create profile after successful registration
   * Better Auth does not manage profiles; call this after sign-up
   */
  createProfile: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Check if profile already exists
    const exists = await profileExists(userId);
    if (exists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Profile already exists",
      });
    }

    const profile = await createProfile({
      id: nanoid(),
      userId,
      settings: {
        theme: "system",
        emailNotifications: true,
        marketingEmails: false,
        courseReminders: true,
        weeklyDigest: true,
      },
    });

    return profile;
  }),

  /**
   * Check if user has a profile
   */
  hasProfile: protectedProcedure.query(async ({ ctx }) => {
    const exists = await profileExists(ctx.session.user.id);
    return { hasProfile: exists };
  }),
});
