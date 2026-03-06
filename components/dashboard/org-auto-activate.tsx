"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { authClient } from "@/packages/auth/auth-client";

/**
 * Runs once after login to set the active org to the first non-platform org,
 * if no org is currently active. Handles all sign-in methods (email, SSO, passkey).
 */
export function OrgAutoActivate() {
  const router = useRouter();
  const activatedRef = useRef(false);

  const { data: activeMember, isPending: activeMemberPending } =
    authClient.useActiveMember();
  const { data: orgs, isPending: orgsPending } =
    authClient.useListOrganizations();

  useEffect(() => {
    if (activeMemberPending || orgsPending) {
      return;
    }
    if (activatedRef.current) {
      return;
    }
    if (activeMember) {
      return;
    }

    const nonPlatformOrg = orgs?.find((o) => o.slug !== "platform");
    if (!nonPlatformOrg) {
      return;
    }

    activatedRef.current = true;
    authClient.organization
      .setActive({ organizationId: nonPlatformOrg.id })
      .then(() => router.refresh())
      .catch(() => {
        activatedRef.current = false;
      });
  }, [activeMember, activeMemberPending, orgs, orgsPending, router]);

  return null;
}
