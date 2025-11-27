"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { DashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";

export default function DashboardPage() {
  return (
    <PageLayout
      breadcrumbs={[]}
      title="Dashboard"
      subtitle="Overview of your system"
    >
      <DashboardSkeleton />
    </PageLayout>
  );
}

