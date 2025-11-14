import { UserRole } from "@/types/user";
import { Role } from "@/types/auth";
import {
  getOrganizationFromBackendRole,
  getOrganizationFromFrontendRole,
} from "./roleMapper";

export type Permission =
  | "users.view"
  | "users.invite"
  | "users.inviteAll"
  | "users.inviteOwnOrg"
  | "users.inviteAdmins"
  | "users.inviteMembers"
  | "users.edit"
  | "users.delete"
  | "users.viewInvitations"
  | "records.view"
  | "records.create"
  | "records.edit"
  | "records.delete"
  | "recycling-plan.view"
  | "recycling-plan.create"
  | "recycling-plan.edit"
  | "recycling-plan.delete"
  | "analytics.view"
  | "settings.view"
  | "settings.edit"
  | "pending-registration.view"
  | "pending-registration.approve"
  | "pending-registration.reject"
  | "reports.view"
  | "reports.create"
  | "waste-sources.view"
  | "waste-sources.create"
  | "waste-sources.edit"
  | "waste-sources.delete"
  | "account.view"
  | "account.edit";

/**
 * Permission matrix: maps roles to their permissions
 */
const permissionMatrix: Record<UserRole, Permission[]> = {
  "Motul Admin": [
    "users.view",
    "users.invite",
    "users.inviteAll",
    "users.inviteOwnOrg",
    "users.inviteAdmins",
    "users.edit",
    "users.delete",
    "users.viewInvitations",
    "records.view",
    "records.create",
    "records.edit",
    "records.delete",
    "recycling-plan.view",
    "recycling-plan.create",
    "recycling-plan.edit",
    "recycling-plan.delete",
    "analytics.view",
    "settings.view",
    "settings.edit",
    "pending-registration.view",
    "pending-registration.approve",
    "pending-registration.reject",
    "reports.view",
    "reports.create",
  ],
  "Motul User": [
    "users.view",
    "records.view",
    "records.create",
    "records.edit",
    "recycling-plan.view",
    "analytics.view",
    "settings.view",
    "pending-registration.view",
    "reports.view",
  ],
  "Recycler Admin": [
    "users.view",
    "users.invite",
    "users.inviteOwnOrg",
    "users.inviteMembers",
    "users.edit",
    "users.viewInvitations",
    "records.view",
    "records.create",
    "records.edit",
    "reports.view",
    "reports.create",
    "waste-sources.view",
    "waste-sources.create",
    "waste-sources.edit",
    "waste-sources.delete",
    "settings.view",
    "settings.edit",
    "account.view",
    "account.edit",
  ],
  "Recycler User": [
    "records.view",
    "records.create",
    "records.edit",
    "reports.view",
    "waste-sources.view",
    "settings.view",
    "account.view",
    "account.edit",
  ],
  "WTP Admin": [
    "users.view",
    "users.invite",
    "users.inviteOwnOrg",
    "users.inviteMembers",
    "users.edit",
    "users.viewInvitations",
    "records.view",
    "records.create",
    "records.edit",
    "reports.view",
    "reports.create",
    "settings.view",
    "settings.edit",
    "account.view",
    "account.edit",
  ],
  "WTP User": [
    "records.view",
    "records.create",
    "records.edit",
    "reports.view",
    "settings.view",
    "account.view",
    "account.edit",
  ],
};

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: UserRole | Role): Permission[] {
  // If backend role, convert to frontend first
  if (
    role === "motul_admin" ||
    role === "motul_reviewer" ||
    role === "recycler_admin" ||
    role === "recycler" ||
    role === "waste_transfer_admin" ||
    role === "waste_transfer"
  ) {
    // Import mapper dynamically to avoid circular dependency
    const { mapBackendRoleToFrontend } = require("./roleMapper");
    role = mapBackendRoleToFrontend(role as Role);
  }

  return permissionMatrix[role as UserRole] || [];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole | Role | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole | Role | null | undefined,
  permissions: Permission[],
): boolean {
  if (!role) return false;
  return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole | Role | null | undefined,
  permissions: Permission[],
): boolean {
  if (!role) return false;
  return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Get organization for a role
 */
export function getOrganization(
  role: UserRole | Role,
): "motul" | "recycler" | "wtp" {
  if (
    role === "motul_admin" ||
    role === "motul_reviewer" ||
    role === "recycler_admin" ||
    role === "recycler" ||
    role === "waste_transfer_admin" ||
    role === "waste_transfer"
  ) {
    return getOrganizationFromBackendRole(role as Role);
  }
  return getOrganizationFromFrontendRole(role as UserRole);
}

/**
 * Get available roles that can be invited by a given role
 * Rules:
 * - Motul Admin can only invite admins (Motul Admin, Recycler Admin, WTP Admin)
 * - Recycler Admin can only invite members (Recycler User)
 * - WTP Admin can only invite members (WTP User)
 */
export function getAvailableRolesForInvitation(
  inviterRole: UserRole | Role | null | undefined,
): UserRole[] {
  if (!inviterRole) return [];

  // Convert backend role to frontend role if needed
  let frontendRole: UserRole;
  if (
    inviterRole === "motul_admin" ||
    inviterRole === "motul_reviewer" ||
    inviterRole === "recycler_admin" ||
    inviterRole === "recycler" ||
    inviterRole === "waste_transfer_admin" ||
    inviterRole === "waste_transfer"
  ) {
    const { mapBackendRoleToFrontend } = require("./roleMapper");
    frontendRole = mapBackendRoleToFrontend(inviterRole as Role);
  } else {
    frontendRole = inviterRole as UserRole;
  }

  // Motul Admin can only invite other admins
  if (frontendRole === "Motul Admin") {
    return ["Motul Admin", "Recycler Admin", "WTP Admin", "Motul User"];
  }

  // Recycler Admin can only invite Recycler User (members)
  if (frontendRole === "Recycler Admin") {
    return ["Recycler User"];
  }

  // WTP Admin can only invite WTP User (members)
  if (frontendRole === "WTP Admin") {
    return ["WTP User"];
  }

  // Default: no roles available
  return [];
}
