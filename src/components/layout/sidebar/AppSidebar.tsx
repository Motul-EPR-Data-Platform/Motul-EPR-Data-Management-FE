"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getSidebarConfig,
  getFilteredSidebarItems,
} from "@/components/layout/sidebar/sidebarConfig";

export function AppSidebar() {
  const pathname = usePathname();
  const { userRole, organization, isLoading } = useAuth();

  // Get sidebar config based on organization
  const config = getSidebarConfig(organization);

  // Get filtered items based on user role (hide admin-only items for non-admins)
  const items = getFilteredSidebarItems(config, userRole);

  // Show loading state or empty sidebar while loading
  if (isLoading) {
    return (
      <Sidebar collapsible="icon" className="z-40 relative">
        <SidebarHeader>
          <div className="p-4 flex justify-center">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="z-40 relative">
      <SidebarHeader>
        <div className="p-4 flex justify-center">
          <img src={config.logo} alt="Logo" className="h-8" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== config.basePath &&
                    pathname?.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      {/* @ts-ignore - Next.js Link type compatibility with Radix Slot */}
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="text-center text-sm text-gray-500 py-4 border-t">
          {config.footerText}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
