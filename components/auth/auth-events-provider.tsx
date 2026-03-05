"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { identify } from "@/packages/analytics/client";
import { useSession } from "@/packages/auth/auth-client";
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

export function AuthEventsProvider() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const lastIdentifiedUserEmail = useRef<string | null>(null);

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

  useEffect(() => {
    const user = session?.user;

    if (!user?.email) {
      lastIdentifiedUserEmail.current = null;
      return;
    }

    if (lastIdentifiedUserEmail.current === user.email) {
      return;
    }

    identify(user.email, {
      email: user.email,
      name: user.name,
      userId: user.id,
    });
    console.log("identified user", user.email);
    lastIdentifiedUserEmail.current = user.email;
  }, [session?.user]);

  return null;
}
