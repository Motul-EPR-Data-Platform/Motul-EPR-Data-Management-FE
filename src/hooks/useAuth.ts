import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/user";
import { getOrganizationFromRole } from "@/components/layout/sidebar/sidebarConfig";

// Mock user data - Replace with real auth logic later
// This hook should be replaced with actual authentication context
export function useAuth() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine organization from pathname
    let organization: "motul" | "recycler" | "wtp" = "motul";
    let defaultRole: UserRole = "Motul User";

    if (pathname?.startsWith("/recycler")) {
      organization = "recycler";
      defaultRole = "Recycler Admin"; // Default to admin for testing
    } else if (pathname?.startsWith("/wtp")) {
      organization = "wtp";
      defaultRole = "WTP Admin"; // Default to admin for testing
    } else if (pathname?.startsWith("/motul")) {
      organization = "motul";
      defaultRole = "Motul Admin"; // Default to admin for testing
    }

    // Simulate API call to get user role
    // TODO: Replace with actual authentication logic
    const loadUserRole = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get from localStorage or API
      // Check if stored role matches the current organization
      const storedRole = localStorage.getItem("userRole") as UserRole | null;
      const storedOrg = storedRole
        ? getOrganizationFromRole(storedRole)
        : null;

      if (storedRole && storedOrg === organization) {
        // Use stored role if it matches current organization
        setUserRole(storedRole);
      } else {
        // Otherwise, use default role for current organization
        setUserRole(defaultRole);
        localStorage.setItem("userRole", defaultRole);
      }
      setIsLoading(false);
    };

    loadUserRole();
  }, [pathname]);

  const organization = userRole ? getOrganizationFromRole(userRole) : "motul";
  const isAdmin = userRole
    ? userRole === "Motul Admin" ||
      userRole === "Recycler Admin" ||
      userRole === "WTP Admin"
    : false;

  return {
    userRole,
    organization,
    isAdmin,
    isLoading,
    setUserRole, // For testing purposes
  };
}

