import { TRPCError } from "@trpc/server";
import {
  acceptPublicInvite,
  rejectPublicInvite,
  resolvePublicInviteByToken,
} from "@/packages/auth/public-invites";
import {
  acceptPublicInviteSchema,
  publicInviteTokenSchema,
} from "@/packages/utils/schema";
import { publicProcedure, router } from "../init";

export const inviteRouter = router({
  getByToken: publicProcedure
    .input(publicInviteTokenSchema)
    .query(async ({ ctx, input }) => {
      const result = await resolvePublicInviteByToken(input, ctx.db);

      if (!result.invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      return {
        email: result.invite.email,
        expiresAt: result.invite.expiresAt,
        name: result.invite.name,
        role: result.invite.role,
        status: result.error ?? result.invite.displayStatus,
      };
    }),

  accept: publicProcedure
    .input(acceptPublicInviteSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await acceptPublicInvite(input, ctx.db);

      if (result.accepted) {
        return { email: result.email, success: true };
      }

      if (result.error === "user_exists") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      if (result.error === "expired") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite has expired",
        });
      }

      if (result.error === "revoked") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite is no longer valid",
        });
      }

      if (result.error === "accepted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invite has already been used",
        });
      }

      throw new TRPCError({
        code:
          result.error === "not_found" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message:
          result.error === "create_failed"
            ? "Could not create your account"
            : "Invite not found",
      });
    }),

  reject: publicProcedure
    .input(publicInviteTokenSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await rejectPublicInvite(input, ctx.db);

      if (!result.rejected) {
        throw new TRPCError({
          code: result.error === "not_found" ? "NOT_FOUND" : "BAD_REQUEST",
          message: "This invite cannot be rejected",
        });
      }

      return { success: true };
    }),
});
