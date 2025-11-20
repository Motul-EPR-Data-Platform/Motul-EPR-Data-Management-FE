"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function WTPMyRecordsPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Bản ghi của tôi" }]}
      title="Bản ghi của tôi"
      subtitle="View and manage your records"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang bản ghi của tôi sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}
