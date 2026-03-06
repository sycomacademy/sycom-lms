"use client";

import { createContext, type ReactNode, useContext } from "react";
import { authClient } from "@/packages/auth/auth-client";

interface DashboardOrgContextValue {
  activeMember: ReturnType<typeof authClient.useActiveMember>["data"];
  isPending: boolean;
  orgs: ReturnType<typeof authClient.useListOrganizations>["data"];
}

const DashboardOrgContext = createContext<DashboardOrgContextValue | null>(
  null
);

export function DashboardOrgProvider({ children }: { children: ReactNode }) {
  const { data: orgs, isPending: orgsPending } =
    authClient.useListOrganizations();
  const { data: activeMember, isPending: activeMemberPending } =
    authClient.useActiveMember();

  return (
    <DashboardOrgContext.Provider
      value={{
        activeMember,
        isPending: orgsPending || activeMemberPending,
        orgs,
      }}
    >
      {children}
    </DashboardOrgContext.Provider>
  );
}

export function useDashboardOrg() {
  const value = useContext(DashboardOrgContext);

  if (!value) {
    throw new Error("useDashboardOrg must be used within DashboardOrgProvider");
  }

  return value;
}
