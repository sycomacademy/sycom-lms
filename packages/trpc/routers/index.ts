import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/packages/trpc/core/init";
import { authRouter } from "./auth";
import { todoRouter } from "./todo";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  auth: authRouter,
  todo: todoRouter,
});
export type AppRouter = typeof appRouter;
