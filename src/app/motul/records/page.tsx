"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { RecordPageContent } from "@/components/records/RecordPageContent";
import { usePermission } from "@/hooks/usePermission";

export default function RecordsPage() {
  // Check permission - records page requires records.view permission
  const canView = usePermission("records.view");

  if (!canView) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Bản ghi" }]}
        title="Bản ghi"
        subtitle="Access Denied"
      >
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground py-12">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: "Bản ghi" }]}
      title="Bản ghi"
      subtitle="Xem và quản lý tất cả các bản ghi thu gom"
    >
      <RecordPageContent mode="motul" />
    </PageLayout>
  );
}
