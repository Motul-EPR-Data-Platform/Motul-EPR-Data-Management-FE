"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function ReportsPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Báo cáo" }]}
      title="Báo cáo"
      subtitle="View and generate reports"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang báo cáo sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}
