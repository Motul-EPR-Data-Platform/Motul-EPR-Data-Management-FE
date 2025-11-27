"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PageLayout({
  breadcrumbs,
  title,
  subtitle,
  children,
}: PageLayoutProps) {
  const pathname = usePathname();
  
  // Determine home URL from pathname
  const homeUrl =
    pathname?.startsWith("/recycler")
      ? "/recycler"
      : pathname?.startsWith("/wtp")
      ? "/wtp"
      : "/motul";
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={homeUrl}
          className="hover:text-foreground flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          <span>Trang chủ</span>
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {crumb.href ? (
              <Link
                href={crumb.href as any}
                className="hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}

