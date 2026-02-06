import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import {
  createProfile,
  getProfileByUserId,
  profileExists,
} from "@/packages/db/queries/profile";
import { emailExists, getUserByEmail } from "@/packages/db/queries/user";
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/packages/schema/auth";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/packages/trpc/core/init";

export const authRouter = router({
  /**
   * Get current session
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
   * Check if email is available
   */
  checkEmail: publicProcedure
    .input(forgotPasswordSchema)
    .query(async ({ input }) => {
      const exists = await emailExists(input.email);
      return { available: !exists };
    }),

  /**
   * Validate sign up data (server-side validation)
   */
  validateSignUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      // Check if email is already in use
      const exists = await emailExists(input.email);
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }
      return { valid: true };
    }),

  /**
   * Validate sign in data (server-side validation)
   */
  validateSignIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input }) => {
      // Check if email exists
      const user = await getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No account found with this email",
        });
      }
      return { valid: true, emailVerified: user.emailVerified };
    }),

  /**
   * Create profile after successful registration
   * This is called after better-auth creates the user
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
