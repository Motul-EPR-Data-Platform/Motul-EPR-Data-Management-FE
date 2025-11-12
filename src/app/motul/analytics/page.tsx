"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function AnalyticsPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Phân tích" }]}
      title="Phân tích"
      subtitle="View analytics and reports"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang phân tích sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}

