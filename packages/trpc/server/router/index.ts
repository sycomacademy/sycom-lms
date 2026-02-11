import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { publicProcedure, router } from "../init";
import { dashboardRouter } from "./dashboard";

const emptyRouter = router({});

const authRouter = emptyRouter;
const enrollmentRouter = emptyRouter;
const lessonRouter = emptyRouter;

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  auth: authRouter,
  dashboard: dashboardRouter,
  enrollment: enrollmentRouter,
  lesson: lessonRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
