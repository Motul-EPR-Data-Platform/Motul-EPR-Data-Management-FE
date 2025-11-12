import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/lib/rbac/routePermissions";
import { usePathname } from "next/navigation";

/**
 * Hook to check if user can access current route
 */
export function useRouteAccess() {
  const { userRole } = useAuth();
  const pathname = usePathname();

  return {
    canAccess: canAccessRoute(userRole, pathname || ""),
    pathname,
  };
}

