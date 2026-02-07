import { publicProcedure, router } from "@/packages/trpc/core/init";
import { authRouter } from "./auth";
import { enrollmentRouter } from "./enrollment";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  auth: authRouter,
  enrollment: enrollmentRouter,
});
export type AppRouter = typeof appRouter;
