import { useAuth } from "@/contexts/AuthContext";
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/rbac/permissions";

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: Permission): boolean {
  const { userRole } = useAuth();
  return hasPermission(userRole, permission);
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { userRole } = useAuth();
  return hasAnyPermission(userRole, permissions);
}

/**
 * Hook to check if user has all of the specified permissions
 */
export function useAllPermissions(permissions: Permission[]): boolean {
  const { userRole } = useAuth();
  return hasAllPermissions(userRole, permissions);
}

/**
 * Hook to get user role and permissions
 */
export function useRole() {
  const { userRole, user, organization, isAdmin } = useAuth();
  const { getPermissionsForRole } = require("@/lib/rbac/permissions");

  return {
    role: userRole,
    user,
    organization,
    isAdmin,
    permissions: userRole ? getPermissionsForRole(userRole) : [],
  };
}
