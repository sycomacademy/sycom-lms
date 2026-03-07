"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { listenToAuthEvents } from "@/packages/utils/auth-broadcast";
import { createLoggerWithContext } from "@/packages/utils/logger";

const logger = createLoggerWithContext("auth:events-provider");

const REDIRECT_ELIGIBLE_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const isRedirectEligiblePath = (pathname: string) => {
  return REDIRECT_ELIGIBLE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
};

export function AuthRedirectListener() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = listenToAuthEvents((message) => {
      logger.debug("listenToAuthEvents", { message });
      if (message.type !== "signed_in") {
        return;
      }

      if (!isRedirectEligiblePath(pathname)) {
        return;
      }

      router.replace("/dashboard");
    });

    return unsubscribe;
  }, [pathname, router]);

  return null;
}
