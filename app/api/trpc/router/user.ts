import { auth } from "@/packages/auth/auth";
import { PUBLIC_ORG_SLUG } from "@/packages/db/helper";
import {
  getCurrentCohort,
  getCurrentOrganization,
  getMemberRole,
  getProfileByUserId,
  updateProfileByUserId,
} from "@/packages/db/queries";
import type { profile } from "@/packages/db/schema/profile";
import { updateAccountSchema } from "@/packages/utils/schema";
import { protectedProcedure, router } from "../init";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getProfileByUserId(ctx.db, {
      userId: ctx.session.user.id,
    });
    const organization = await getCurrentOrganization(ctx.db, {
      sessionId: ctx.session.session.id,
      userId: ctx.session.user.id,
    });
    const cohort = await getCurrentCohort(ctx.db, {
      sessionId: ctx.session.session.id,
      userId: ctx.session.user.id,
    });
    const memberRole = await getMemberRole(ctx.db, {
      userId: ctx.session.user.id,
      organizationId: organization.id,
    });

    return {
      session: ctx.session.session,
      user: ctx.session.user,
      profile,
      organization,
      cohort,
      memberRole,
      isPublicOrg: organization?.slug === PUBLIC_ORG_SLUG,
    };
  }),

  update: protectedProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      let updatedUser = ctx.session.user;
      let updatedProfile = await getProfileByUserId(ctx.db, { userId });

      if (
        input.name !== undefined ||
        input.email !== undefined ||
        input.image !== undefined
      ) {
        const body: { name?: string; email?: string; image?: string } = {};
        if (input.name !== undefined) {
          body.name = input.name;
        }
        if (input.email !== undefined) {
          body.email = input.email;
        }
        if (input.image !== undefined) {
          body.image = input.image;
        }

        const result = (await auth.api.updateUser({
          body,
          headers: ctx.headers,
        })) as { user?: typeof ctx.session.user };

        if (result?.user) {
          updatedUser = result.user;
        }
      }

      if (input.bio !== undefined || input.settings !== undefined) {
        const data: Partial<typeof profile.$inferInsert> = {};
        if (input.bio !== undefined) {
          data.bio = input.bio;
        }
        if (input.settings !== undefined) {
          data.settings = input.settings;
        }

        updatedProfile = await updateProfileByUserId(ctx.db, {
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
