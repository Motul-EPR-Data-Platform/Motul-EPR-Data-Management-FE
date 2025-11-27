"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AppUser } from "@/types/auth";
import { UserRole } from "@/types/user";
import { AuthService } from "@/lib/services/auth.service";
import { mapBackendRoleToFrontend } from "@/lib/rbac/roleMapper";

interface AuthContextType {
  user: AppUser | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  organization: "motul" | "recycler" | "wtp";
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Try to fetch user data - cookies are sent automatically
      // If not authenticated, this will fail with 401
      const userData = await AuthService.me();

      if (!userData || !userData.role) {
        throw new Error("Invalid user data: role is missing");
      }

      const mappedRole = mapBackendRoleToFrontend(userData.role);

      setUser(userData);
      setUserRole(mappedRole);

      // Store the full role in localStorage (keep role storage as requested)
      localStorage.setItem("userRole", mappedRole);
    } catch (error) {
      // User is not authenticated or session expired
      // Clear any stale role from localStorage
      localStorage.removeItem("userRole");
      setUser(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await AuthService.login({ email, password });

      // After successful login, call /me to get full user data including wasteTransferPointId
      const userData = await AuthService.me();

      if (!userData || !userData.role) {
        throw new Error("Invalid user data: role is missing");
      }

      const mappedRole = mapBackendRoleToFrontend(userData.role);

      setUser(userData);
      setUserRole(mappedRole);

      // Store the full role in localStorage
      localStorage.setItem("userRole", mappedRole);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Try to call logout API (may fail if token is invalid/expired)
      // Backend will clear HTTP-only cookies
      await AuthService.logout();
    } catch (error) {
      // If logout API fails, still proceed with clearing local state
      // This can happen if token is already invalid/expired, which is fine
    } finally {
      // Always clear local state, regardless of API call success
      // This ensures user is logged out even if API call fails
      setUser(null);
      setUserRole(null);
      // Clear role from localStorage
      localStorage.removeItem("userRole");
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const organization = userRole
    ? (() => {
        if (userRole.startsWith("Motul")) return "motul";
        if (userRole.startsWith("Recycler")) return "recycler";
        if (userRole.startsWith("WTP")) return "wtp";
        return "motul";
      })()
    : "motul";

  const isAdmin =
    userRole === "Motul Admin" ||
    userRole === "Recycler Admin" ||
    userRole === "WTP Admin";

  const value: AuthContextType = {
    user,
    userRole,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    organization,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
