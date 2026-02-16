import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { publicProcedure, router } from "../init";
import { adminRouter } from "./admin";
import { categoryRouter } from "./category";
import { courseRouter } from "./course";
import { feedbackRouter } from "./feedback";
import { fileRouter } from "./file";
import { profileRouter } from "./profile";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  admin: adminRouter,
  category: categoryRouter,
  course: courseRouter,
  feedback: feedbackRouter,
  file: fileRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
