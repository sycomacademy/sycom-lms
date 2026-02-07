import { publicProcedure, router } from "@/packages/trpc/core/init";
import { authRouter } from "./auth";
import { enrollmentRouter } from "./enrollment";
import { lessonRouter } from "./lesson";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  auth: authRouter,
  enrollment: enrollmentRouter,
  lesson: lessonRouter,
});
export type AppRouter = typeof appRouter;
