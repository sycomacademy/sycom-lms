"use client";

import { CheckIcon, ChevronsUpDownIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/packages/auth/auth-client";
import { cn } from "@/packages/utils/cn";
import { getInitials } from "@/packages/utils/string";
import { useDashboardOrg } from "./dashboard-org-context";

/** Collapse class: fixed dimensions + hide name span + hide chevron when icon-only. */
const collapseClass =
  "group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:min-h-12! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:p-2!  group-data-[collapsible=icon]:[&>span:last-child]:hidden";

interface OrgAvatarProps {
  name: string;
  className?: string;
}

function OrgAvatar({ name, className }: OrgAvatarProps) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center font-bold text-[10px]",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

export function OrgSwitcher() {
  const router = useRouter();
  const { open } = useSidebar();
  const [search, setSearch] = useState("");
  const [switching, setSwitching] = useState(false);
  const { activeMember, orgs } = useDashboardOrg();

  const activeOrgId = activeMember?.organizationId;
  const activeOrg = orgs?.find((o) => o.id === activeOrgId) ?? orgs?.[0];
  const displayName = activeOrg?.name ?? "Platform";

  const filtered = (orgs ?? []).filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setSearch("");
    }
  }

  async function handleSwitch(orgId: string) {
    if (orgId === activeOrgId || switching) {
      return;
    }
    setSwitching(true);
    await authClient.organization.setActive({ organizationId: orgId });
    router.refresh();
    router.push("/dashboard");
    setSwitching(false);
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            className={cn(
              "gap-2.5 text-sm",
              collapseClass,
              !open && "justify-center"
            )}
            size="lg"
            tooltip={displayName}
          >
            <OrgAvatar
              className={cn(!open && "size-7 text-xs")}
              name={displayName}
            />
            <span className="flex-1 truncate font-medium">{displayName}</span>
            <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent
        align="start"
        className="w-64 p-0"
        side="right"
        sideOffset={4}
      >
        {/* Search */}
        <div className="px-3 py-2">
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Find organization..."
            value={search}
          />
        </div>
        <DropdownMenuSeparator />

        {/* Org list */}
        {filtered.length > 0 ? (
          filtered.map((org) => (
            <DropdownMenuItem
              className="gap-2.5 px-3 py-2"
              key={org.id}
              onClick={() => handleSwitch(org.id)}
            >
              <OrgAvatar name={org.name} />
              <span className="flex-1 truncate">{org.name}</span>
              {org.id === activeOrgId && (
                <CheckIcon className="size-4 shrink-0" />
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <UsersIcon className="size-5" />
            </div>
            <p className="text-muted-foreground text-xs">
              No organizations found
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
