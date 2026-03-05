import { protectedProcedure, publicProcedure, router } from "../init";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    //fetch profile
    return {
      session: ctx.session.session,
      user: ctx.session.user,
    };
  }),
  session: publicProcedure.query(async ({ ctx }) => {
    // Return session data or null if not authenticated
    return {
      session: ctx.session?.session ?? null,
      user: ctx.session?.user ?? null,
    };
  }),
});
