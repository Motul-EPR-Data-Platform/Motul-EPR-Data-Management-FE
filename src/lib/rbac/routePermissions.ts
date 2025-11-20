import { UserRole } from "@/types/user";
import { Role } from "@/types/auth";
import { getOrganization } from "./permissions";

export type RoutePermission = {
  path: string;
  organization: "motul" | "recycler" | "wtp";
  roles: UserRole[];
  permissions?: string[];
};

/**
 * Route permissions configuration
 * Defines which roles can access which routes
 */
export const routePermissions: RoutePermission[] = [
  // Motul routes
  {
    path: "/motul",
    organization: "motul",
    roles: ["Motul Admin", "Motul User"],
  },
  {
    path: "/motul/records",
    organization: "motul",
    roles: ["Motul Admin", "Motul User"],
    permissions: ["records.view"],
  },
  {
    path: "/motul/recycling-plan",
    organization: "motul",
    roles: ["Motul Admin", "Motul User"],
    permissions: ["recycling-plan.view"],
  },
  {
    path: "/motul/pending-registration",
    organization: "motul",
    roles: ["Motul Admin", "Motul User"],
    permissions: ["pending-registration.view"],
  },
  {
    path: "/motul/analytics",
    organization: "motul",
    roles: ["Motul Admin", "Motul User"],
    permissions: ["analytics.view"],
  },
  {
    path: "/motul/users",
    organization: "motul",
    roles: ["Motul Admin"],
    permissions: ["users.view"],
  },
  {
    path: "/motul/settings",
    organization: "motul",
    roles: ["Motul Admin", "Motul User"],
    permissions: ["settings.view"],
  },
  {
    path: "/motul/definitions",
    organization: "motul",
    roles: ["Motul Admin", "Motul User"],
    permissions: ["definitions.view"],
  },
  // Recycler routes
  {
    path: "/recycler",
    organization: "recycler",
    roles: ["Recycler Admin", "Recycler User"],
  },
  {
    path: "/recycler/my-records",
    organization: "recycler",
    roles: ["Recycler Admin", "Recycler User"],
    permissions: ["records.view"],
  },
  {
    path: "/recycler/reports",
    organization: "recycler",
    roles: ["Recycler Admin", "Recycler User"],
    permissions: ["reports.view"],
  },
  {
    path: "/recycler/waste-sources",
    organization: "recycler",
    roles: ["Recycler Admin", "Recycler User"],
    permissions: ["waste-sources.view"],
  },
  {
    path: "/recycler/users",
    organization: "recycler",
    roles: ["Recycler Admin"],
    permissions: ["users.view"],
  },
  {
    path: "/recycler/business-info",
    organization: "recycler",
    roles: ["Recycler Admin", "Recycler User"],
    permissions: ["settings.view"],
  },
  {
    path: "/recycler/settings",
    organization: "recycler",
    roles: ["Recycler Admin", "Recycler User"],
    permissions: ["settings.view"],
  },
  {
    path: "/recycler/account",
    organization: "recycler",
    roles: ["Recycler Admin", "Recycler User"],
    permissions: ["account.view"],
  },
  {
    path: "/recycler/definitions",
    organization: "recycler",
    roles: ["Recycler Admin", "Recycler User"],
    permissions: ["definitions.view"],
  },
  // WTP routes
  {
    path: "/wtp",
    organization: "wtp",
    roles: ["WTP Admin", "WTP User"],
  },
  {
    path: "/wtp/my-records",
    organization: "wtp",
    roles: ["WTP Admin", "WTP User"],
    permissions: ["records.view"],
  },
  {
    path: "/wtp/users",
    organization: "wtp",
    roles: ["WTP Admin"],
    permissions: ["users.view"],
  },
  {
    path: "/wtp/account",
    organization: "wtp",
    roles: ["WTP Admin", "WTP User"],
    permissions: ["account.view"],
  },
  {
    path: "/wtp/definitions",
    organization: "wtp",
    roles: ["WTP Admin", "WTP User"],
    permissions: ["definitions.view"],
  },
];

/**
 * Check if a role can access a route
 */
export function canAccessRoute(
  role: UserRole | Role | null | undefined,
  pathname: string,
): boolean {
  if (!role) return false;

  // Find matching route permission
  const routePermission = routePermissions.find((rp) => {
    // Exact match or path starts with route path
    return pathname === rp.path || pathname.startsWith(rp.path + "/");
  });

  if (!routePermission) {
    // If no specific route permission found, check if path matches organization
    const userOrg = getOrganization(role);
    if (pathname.startsWith(`/${userOrg}`)) {
      return true; // Allow access to organization routes by default
    }
    return false;
  }

  // Check if role is allowed
  const { mapBackendRoleToFrontend } = require("./roleMapper");
  const frontendRole =
    typeof role === "string" &&
    (role === "motul_admin" ||
      role === "motul_reviewer" ||
      role === "recycler_admin" ||
      role === "recycler" ||
      role === "waste_transfer_admin" ||
      role === "waste_transfer")
      ? mapBackendRoleToFrontend(role as Role)
      : (role as UserRole);

  return routePermission.roles.includes(frontendRole);
}

/**
 * Get allowed routes for a role
 */
export function getAllowedRoutes(role: UserRole | Role): string[] {
  const { mapBackendRoleToFrontend } = require("./roleMapper");
  const frontendRole =
    typeof role === "string" &&
    (role === "motul_admin" ||
      role === "motul_reviewer" ||
      role === "recycler_admin" ||
      role === "recycler" ||
      role === "waste_transfer_admin" ||
      role === "waste_transfer")
      ? mapBackendRoleToFrontend(role as Role)
      : (role as UserRole);

  return routePermissions
    .filter((rp) => rp.roles.includes(frontendRole))
    .map((rp) => rp.path);
}
