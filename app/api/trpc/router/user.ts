import { protectedProcedure, router } from "../init";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      session: ctx.session.session,
      user: ctx.session.user,
    };
  }),
});
