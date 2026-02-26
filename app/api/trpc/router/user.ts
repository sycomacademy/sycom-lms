import { protectedProcedure, router } from "../init";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.session.user.id,
      name: ctx.session.user.name,
      email: ctx.session.user.email,
      emailVerified: ctx.session.user.emailVerified,
      image: ctx.session.user.image,
    };
  }),
});
