import { t } from "./core";

import { loggingMiddleware, protectedMiddleware } from "./middleware";

export const publicProcedure = t.procedure.use(loggingMiddleware);

export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware);

export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware);
// .use(adminMiddleware);

export const orgProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware);
// .use(organizationMiddleware);
