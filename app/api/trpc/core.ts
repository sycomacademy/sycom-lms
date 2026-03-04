import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { treeifyError, ZodError } from "zod";
import type { Context } from "@/packages/trpc/context";

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
