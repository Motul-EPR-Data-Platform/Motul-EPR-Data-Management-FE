"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { AnalyticsPageContent } from "@/components/analytics/AnalyticsPageContent";

export default function AnalyticsPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Phân tích" }]}
      title="Phân tích"
      subtitle="View analytics and reports"
    >
      <AnalyticsPageContent />
    </PageLayout>
  );
}
