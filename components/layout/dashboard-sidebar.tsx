"use client";

import {
  BookOpenIcon,
  ExternalLinkIcon,
  HeadphonesIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MapIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  RouteIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const learnNav = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    label: "Modules",
    href: "/dashboard/courses",
    icon: BookOpenIcon,
    exact: false,
  },
  {
    label: "Pathway",
    href: "/pathway",
    icon: RouteIcon,
    exact: false,
  },
];

const supportNav = [
  {
    label: "FAQ",
    href: "/dashboard/faq",
    icon: HelpCircleIcon,
    exact: false,
    external: false,
  },
  {
    label: "Contact Support",
    href: "mailto:support@sycom.co.uk",
    icon: HeadphonesIcon,
    exact: true,
    external: true,
  },
  {
    label: "Report Feedback",
    href: "/dashboard/feedback",
    icon: MessageSquareIcon,
    exact: false,
    external: false,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/447000000000",
    icon: MessageCircleIcon,
    exact: true,
    external: true,
  },
];

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) {
    return pathname === href || pathname === href.split("#")[0];
  }
  return pathname.startsWith(href);
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4">
        <Link className="flex items-center gap-2" href="/dashboard">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <MapIcon className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
            SYCOM LMS
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Learn */}
        <SidebarGroup>
          <SidebarGroupLabel>Learn</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learnNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(pathname, item.href, item.exact)}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Support */}
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={
                      !item.external &&
                      isActive(pathname, item.href, item.exact)
                    }
                    render={
                      item.external ? (
                        // biome-ignore lint/a11y/useAnchorContent: content injected by SidebarMenuButton render prop
                        <a
                          href={item.href}
                          rel="noopener noreferrer"
                          target="_blank"
                        />
                      ) : (
                        <Link href={item.href} />
                      )
                    }
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {item.external && (
                      <ExternalLinkIcon className="ml-auto size-3 text-muted-foreground" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
