"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { WasteOwnerPageContent } from "@/components/waste-owners/WasteOwnerPageContent";
import { usePermission } from "@/hooks/usePermission";

export default function WasteSourcesPage() {
  // Check permissions
  const canView = usePermission("waste-sources.view");
  const canCreate = usePermission("waste-sources.create");
  const canEdit = usePermission("waste-sources.edit");

  if (!canView) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Chủ nguồn thải" }]}
        title="Danh sách Chủ nguồn thải"
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
      breadcrumbs={[{ label: "Chủ nguồn thải" }]}
      title="Danh sách Chủ nguồn thải"
      subtitle="Quản lý danh sách chủ nguồn thải"
    >
      <WasteOwnerPageContent
        mode="edit"
        canView={canView}
        canCreate={canCreate}
        canEdit={canEdit}
      />
    </PageLayout>
  );
}
