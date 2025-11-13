import { Role } from "@/types/auth";
import { UserRole } from "@/types/user";

/**
 * Maps backend role to frontend UserRole
 */
export function mapBackendRoleToFrontend(backendRole: Role | string | undefined | null): UserRole {
  if (!backendRole) {
    throw new Error("User role is missing");
  }

  const mapping: Record<Role, UserRole> = {
    motul_admin: "Motul Admin",
    motul_reviewer: "Motul User",
    recycler_admin: "Recycler Admin",
    recycler: "Recycler User",
    waste_transfer_admin: "WTP Admin",
    waste_transfer: "WTP User",
  };

  // Type guard to check if backendRole is a valid Role
  if (backendRole in mapping) {
    return mapping[backendRole as Role];
  }

  // If role is not in mapping, throw error
  throw new Error(`Unknown user role: ${backendRole}`);
}

/**
 * Maps frontend UserRole to backend role
 */
export function mapFrontendRoleToBackend(frontendRole: UserRole): Role {
  const mapping: Record<UserRole, Role> = {
    "Motul Admin": "motul_admin",
    "Motul User": "motul_reviewer",
    "Recycler Admin": "recycler_admin",
    "Recycler User": "recycler",
    "WTP Admin": "waste_transfer_admin",
    "WTP User": "waste_transfer",
  };

  return mapping[frontendRole] || "motul_reviewer";
}

/**
 * Get organization from backend role
 */
export function getOrganizationFromBackendRole(role: Role): "motul" | "recycler" | "wtp" {
  if (role.startsWith("motul")) return "motul";
  if (role.startsWith("recycler")) return "recycler";
  if (role.startsWith("waste_transfer")) return "wtp";
  return "motul";
}

/**
 * Get organization from frontend role
 */
export function getOrganizationFromFrontendRole(role: UserRole): "motul" | "recycler" | "wtp" {
  if (role.startsWith("Motul")) return "motul";
  if (role.startsWith("Recycler")) return "recycler";
  if (role.startsWith("WTP")) return "wtp";
  return "motul";
}

/**
 * Check if role is admin
 */
export function isAdminRole(role: Role | UserRole): boolean {
  if (typeof role === "string") {
    // Backend role
    if (role.includes("admin")) return true;
    // Frontend role
    if (role === "Motul Admin" || role === "Recycler Admin" || role === "WTP Admin")
      return true;
  }
  return false;
}

