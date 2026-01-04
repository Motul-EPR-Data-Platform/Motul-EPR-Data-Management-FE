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
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSidebarConfig,
  getFilteredSidebarItems,
} from "@/components/layout/sidebar/sidebarConfig";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useState } from "react";
import { ProfileCompletionDialog } from "@/components/profile/ProfileCompletionDialog";
import { Lock } from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, organization, isLoading } = useAuth();
  const { needsProfileCompletion, isAllowedRoute, getProfileCompletionUrl } =
    useProfileCompletion();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // Get sidebar config based on organization
  const config = getSidebarConfig(organization);

  // Get filtered items based on user role (hide admin-only items for non-admins)
  const items = getFilteredSidebarItems(config, userRole);

  const handleItemClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    itemUrl: string,
  ) => {
    // If profile needs completion and route is not allowed, show dialog
    if (needsProfileCompletion && !isAllowedRoute(itemUrl)) {
      e.preventDefault();
      setShowProfileDialog(true);
      return;
    }
    // Otherwise, let the link navigate normally
  };

  // Show loading state or empty sidebar while loading
  if (isLoading) {
    return (
      <Sidebar collapsible="icon" className="z-40 relative">
        <SidebarHeader className="items-center justify-center p-2">
          <div className="flex w-full justify-center">
            <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-lg group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8" />
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
      <SidebarHeader className="items-center justify-center p-2">
        <div className="flex w-full justify-center">
          <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <span className="text-white font-semibold text-lg group-data-[collapsible=icon]:text-sm">
              {config.initials}
            </span>
          </div>
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
                const isLocked =
                  needsProfileCompletion && !isAllowedRoute(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      disabled={isLocked}
                    >
                      <Link
                        href={item.url}
                        className={`flex items-center gap-2 ${
                          isLocked ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={(e) => handleItemClick(e, item.url)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {isLocked && (
                          <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                        )}
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

      <ProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />
    </Sidebar>
  );
}
