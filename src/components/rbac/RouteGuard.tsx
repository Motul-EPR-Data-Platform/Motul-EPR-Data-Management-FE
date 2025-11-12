"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/lib/rbac/routePermissions";
import { usePathname } from "next/navigation";
import { hasPermission } from "@/lib/rbac/permissions";
import { Permission } from "@/lib/rbac/permissions";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
}

export function RouteGuard({
  children,
  requiredPermission,
  fallback,
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole, isLoading, isAuthenticated } = useAuth();

  // Redirect if not authenticated (useEffect runs after render, but we prevent rendering children)
  useEffect(() => {
    if (isLoading) return;

    // If not authenticated, redirect immediately
    if (!isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || "")}`;
      router.replace(redirectUrl as any);
      return;
    }

    // Check route access
    if (userRole && !canAccessRoute(userRole, pathname || "")) {
      const org = userRole.startsWith("Motul")
        ? "motul"
        : userRole.startsWith("Recycler")
        ? "recycler"
        : userRole.startsWith("WTP")
        ? "wtp"
        : "motul";
      router.replace(`/${org}` as any);
      return;
    }

    // Check required permission
    if (requiredPermission && userRole && !hasPermission(userRole, requiredPermission)) {
      const org = userRole.startsWith("Motul")
        ? "motul"
        : userRole.startsWith("Recycler")
        ? "recycler"
        : userRole.startsWith("WTP")
        ? "wtp"
        : "motul";
      router.replace(`/${org}` as any);
      return;
    }
  }, [userRole, isLoading, isAuthenticated, pathname, router, requiredPermission]);

  // Show loading state while checking auth - THIS PREVENTS CHILDREN FROM RENDERING
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // DON'T RENDER CHILDREN if not authenticated - prevents flash of content
  // The useEffect above will handle the redirect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check route access before rendering
  if (userRole && !canAccessRoute(userRole, pathname || "")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check required permission before rendering
  if (requiredPermission && userRole && !hasPermission(userRole, requiredPermission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

