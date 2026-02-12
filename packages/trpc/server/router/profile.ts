import { TRPCError } from "@trpc/server";
import { getProfileByUserId } from "@/packages/db/queries";
import { protectedProcedure, router } from "../init";

export const profileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx: { db, session } }) => {
    return getProfileByUserId(db, { userId: session.user.id });
  }),
});
