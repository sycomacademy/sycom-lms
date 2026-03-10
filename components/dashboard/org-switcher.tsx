"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "@/components/icons/animated/check";
import { ChevronUpDown } from "@/components/icons/animated/chevron-up-down";
import { AnimateIcon } from "@/components/icons/core/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/packages/auth/auth-client";
import { useUserQuery } from "@/packages/hooks/use-user";
import { cn } from "@/packages/utils/cn";

const PUBLIC_ORG_SLUG = "platform";

export function OrgSwitcher() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { organization: activeOrg, memberRole } = useUserQuery();
  const { data: orgs } = authClient.useListOrganizations();
  const [switching, setSwitching] = useState(false);

  const visibleOrgs = orgs?.filter((o) => o.slug !== PUBLIC_ORG_SLUG) ?? [];
  const isPublicOrg = activeOrg?.slug === PUBLIC_ORG_SLUG;

  const displayName = isPublicOrg
    ? "Platform"
    : (activeOrg?.name ?? "Select org");
  const displayInitial = displayName.charAt(0).toUpperCase();

  async function handleSwitch(orgId: string, slug: string) {
    if (orgId === activeOrg?.id || switching) {
      return;
    }
    setSwitching(true);
    await authClient.organization.setActive({ organizationId: orgId });

    if (slug === PUBLIC_ORG_SLUG) {
      router.push("/dashboard");
    } else {
      router.push(`/tenant/${slug}`);
    }
    router.refresh();
    setSwitching(false);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                className={cn(
                  "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                )}
                size="lg"
                tooltip="Switch organization"
              >
                <Avatar className="size-8 rounded-lg">
                  {activeOrg?.logo ? (
                    <AvatarImage alt={displayName} src={activeOrg.logo} />
                  ) : null}
                  <AvatarFallback className="rounded-lg text-xs">
                    {displayInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{displayName}</span>
                  {memberRole && !isPublicOrg ? (
                    <span className="truncate text-muted-foreground text-xs">
                      {formatMemberRole(memberRole)}
                    </span>
                  ) : null}
                </div>
                <ChevronUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>

              <DropdownMenuItem
                disabled={switching || isPublicOrg}
                onClick={() => {
                  const platformOrg = orgs?.find(
                    (o) => o.slug === PUBLIC_ORG_SLUG
                  );
                  if (platformOrg) {
                    handleSwitch(platformOrg.id, PUBLIC_ORG_SLUG);
                  }
                }}
              >
                <Avatar className="size-6 rounded-md">
                  <AvatarFallback className="rounded-md text-[10px]">
                    P
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">Platform</span>
                {isPublicOrg ? (
                  <AnimateIcon animateOnHover>
                    <Check className="ml-auto size-4" />
                  </AnimateIcon>
                ) : null}
              </DropdownMenuItem>

              {visibleOrgs.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  {visibleOrgs.map((org) => {
                    const isActive = org.id === activeOrg?.id;
                    return (
                      <DropdownMenuItem
                        disabled={switching}
                        key={org.id}
                        onClick={() => handleSwitch(org.id, org.slug)}
                      >
                        <Avatar className="size-6">
                          {org.logo ? (
                            <AvatarImage alt={org.name} src={org.logo} />
                          ) : null}
                          <AvatarFallback className="text-[10px]">
                            {org.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 truncate">{org.name}</span>
                        {isActive ? (
                          <AnimateIcon animateOnHover>
                            <Check className="ml-auto size-4" />
                          </AnimateIcon>
                        ) : null}
                      </DropdownMenuItem>
                    );
                  })}
                </>
              ) : null}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const ROLE_PREFIX_RE = /^org_/;
const UNDERSCORE_RE = /_/g;
const WORD_START_RE = /\b\w/g;

function formatMemberRole(role: string): string {
  return role
    .replace(ROLE_PREFIX_RE, "")
    .replace(UNDERSCORE_RE, " ")
    .replace(WORD_START_RE, (c) => c.toUpperCase());
}
