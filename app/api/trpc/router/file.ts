import { protectedProcedure, router } from "../init";

export const fileRouter = router({
  myFiles: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.file.findMany({
      where: (f, { eq }) => eq(f.uploaderId, ctx.session.user.id),
    });
  }),
});
