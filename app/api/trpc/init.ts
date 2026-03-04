import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { treeifyError, ZodError } from "zod";
import type { Context } from "@/packages/trpc/context";
import {
  adminMiddleware,
  loggingMiddleware,
  organizationMiddleware,
  protectedMiddleware,
} from "./middleware";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? treeifyError(error.cause) : null,
      },
    };
  },
});

export const router = t.router;
export const callerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure.use(loggingMiddleware);

export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware);

export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware)
  .use(adminMiddleware);

export const orgProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware)
  .use(organizationMiddleware);
