import { publicProcedure, router } from "@/packages/trpc/core/init";
import { authRouter } from "./auth";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  auth: authRouter,
});
export type AppRouter = typeof appRouter;
