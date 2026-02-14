import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { publicProcedure, router } from "../init";
import { feedbackRouter } from "./feedback";
import { fileRouter } from "./file";
import { profileRouter } from "./profile";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  feedback: feedbackRouter,
  file: fileRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
