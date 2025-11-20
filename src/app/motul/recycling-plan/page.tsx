"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function RecyclingPlanPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Kế hoạch tái chế" }]}
      title="Kế hoạch tái chế"
      subtitle="Manage recycling plans and schedules"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang kế hoạch tái chế sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}
