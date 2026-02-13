import { getProfileByUserId } from "@/packages/db/queries";
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
});
