import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/packages/auth/auth";

/**
 * Session for the current request. Cached per-request so multiple
 * getSession() calls (e.g. in layout + page + Server Actions) only hit auth once.
 */
export const getSession = cache(async () => {
  const h = await headers();
  return auth.api.getSession({ headers: h });
});
