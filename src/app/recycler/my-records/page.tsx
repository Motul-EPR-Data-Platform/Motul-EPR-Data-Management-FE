"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { RecordPageContent } from "@/components/records/RecordPageContent";
import { usePermission } from "@/hooks/usePermission";

export default function MyRecordsPage() {
  // Check permission - records page requires records.view permission
  const canView = usePermission("records.view");
  const canCreate = usePermission("records.create");
  const canEdit = usePermission("records.edit");

  if (!canView) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Bản ghi của tôi" }]}
        title="Bản ghi của tôi"
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
      breadcrumbs={[{ label: "Bản ghi của tôi" }]}
      title="Bản ghi của tôi"
      subtitle="Xem và quản lý các bản ghi thu gom của bạn"
    >
      <RecordPageContent mode="recycler" canCreate={canCreate} canEdit={canEdit} />
    </PageLayout>
  );
}
