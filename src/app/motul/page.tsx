"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { MotulDashboard } from "@/components/dashboard/MotulDashboard";

export default function DashboardPage() {
  return (
    <PageLayout
      breadcrumbs={[]}
      title="Dashboard"
      subtitle="Overview of your system"
    >
      <MotulDashboard />
    </PageLayout>
  );
}
