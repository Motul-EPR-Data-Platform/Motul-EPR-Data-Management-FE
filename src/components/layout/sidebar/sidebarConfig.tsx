import {
  Home,
  ClipboardList,
  BarChart2,
  Settings,
  Users,
  Calendar,
  FileCheck,
  Factory,
  FileText,
  User,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { UserRole } from "@/types/user";

export interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  requiresAdmin?: boolean; // Only show for admin roles
}

export interface SidebarConfig {
  logo: string;
  footerText: string;
  items: SidebarItem[];
  basePath: string;
}

// Helper function to check if user is admin
export function isAdminRole(role: UserRole): boolean {
  return role === "Motul Admin" || role === "Recycler Admin" || role === "WTP Admin";
}

// Get organization from role
export function getOrganizationFromRole(role: UserRole): "motul" | "recycler" | "wtp" {
  if (role.startsWith("Motul")) return "motul";
  if (role.startsWith("Recycler")) return "recycler";
  if (role.startsWith("WTP")) return "wtp";
  return "motul"; // default
}

// Motul Sidebar Configuration
export const motulSidebarConfig: SidebarConfig = {
  logo: "/motul-logo.png",
  footerText: "Motul EPR",
  basePath: "/motul",
  items: [
    { title: "Dashboard", url: "/motul", icon: Home },
    { title: "Bản ghi", url: "/motul/records", icon: ClipboardList },
    { title: "Kế hoạch tái chế", url: "/motul/recycling-plan", icon: Calendar },
    { title: "Đăng ký chờ duyệt", url: "/motul/pending-registration", icon: FileCheck },
    { title: "Phân tích", url: "/motul/analytics", icon: BarChart2 },
    { title: "Quản lý người dùng", url: "/motul/users", icon: Users, requiresAdmin: true },
    { title: "Cài đặt", url: "/motul/settings", icon: Settings },
  ],
};

// Recycler Sidebar Configuration
export const recyclerSidebarConfig: SidebarConfig = {
  logo: "/motul-logo.png", // Can be changed to recycler logo
  footerText: "Recycler EPR",
  basePath: "/recycler",
  items: [
    { title: "Dashboard", url: "/recycler", icon: Home },
    { title: "Bản ghi của tôi", url: "/recycler/my-records", icon: ClipboardList },
    { title: "Chủ nguồn thải", url: "/recycler/waste-sources", icon: Factory },
    { title: "Báo cáo", url: "/recycler/reports", icon: FileText },
    { title: "Quản lý người dùng", url: "/recycler/users", icon: Users, requiresAdmin: true },
    { title: "Cài đặt", url: "/recycler/settings", icon: Settings },
    { title: "Tài khoản", url: "/recycler/account", icon: User },
  ],
};

// WTP Sidebar Configuration
export const wtpSidebarConfig: SidebarConfig = {
  logo: "/motul-logo.png", // Can be changed to WTP logo
  footerText: "WTP EPR",
  basePath: "/wtp",
  items: [
    { title: "Dashboard", url: "/wtp", icon: Home },
    { title: "Bản ghi của tôi", url: "/wtp/my-records", icon: ClipboardList },
    { title: "Quản lý người dùng", url: "/wtp/users", icon: Users, requiresAdmin: true },
    { title: "Tài khoản", url: "/wtp/account", icon: User },
  ],
};

// Get sidebar config based on organization
export function getSidebarConfig(
  organization: "motul" | "recycler" | "wtp"
): SidebarConfig {
  switch (organization) {
    case "recycler":
      return recyclerSidebarConfig;
    case "wtp":
      return wtpSidebarConfig;
    case "motul":
    default:
      return motulSidebarConfig;
  }
}

// Get filtered sidebar items based on user role
export function getFilteredSidebarItems(
  config: SidebarConfig,
  userRole: UserRole | null
): SidebarItem[] {
  if (!userRole) return config.items;

  const isAdmin = isAdminRole(userRole);
  
  return config.items.filter((item) => {
    // If item requires admin, only show if user is admin
    if (item.requiresAdmin) {
      return isAdmin;
    }
    // Otherwise show all items
    return true;
  });
}

