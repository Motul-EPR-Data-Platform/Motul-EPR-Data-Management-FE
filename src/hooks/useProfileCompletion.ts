import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

/**
 * Hook to check if user needs to complete their organization profile
 * For recycler and WTP users, if isActive is false, they need to complete profile
 */
export function useProfileCompletion() {
  const { user, userRole, organization } = useAuth();

  const needsProfileCompletion = useMemo(() => {
    // Only check for recycler and WTP users
    if (organization !== "recycler" && organization !== "wtp") {
      return false;
    }

    // If user is not active, they need to complete profile
    if (user && !user.isActive) {
      return true;
    }

    return false;
  }, [user, organization]);

  const isAllowedRoute = (pathname: string): boolean => {
    // If profile is complete, allow all routes
    if (!needsProfileCompletion) {
      return true;
    }

    // Always allow settings and account/profile pages
    const allowedRoutes = [
      `/${organization}/settings`,
      `/${organization}/account`,
      `/${organization}/business-info`, // Recycler profile completion
    ];

    return allowedRoutes.some((route) => pathname.startsWith(route));
  };

  const getProfileCompletionUrl = (): string => {
    if (organization === "recycler") {
      return "/recycler/business-info";
    } else if (organization === "wtp") {
      return "/wtp/account";
    }
    return "/";
  };

  return {
    needsProfileCompletion,
    isAllowedRoute,
    getProfileCompletionUrl,
  };
}
