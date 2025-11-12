"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function RecordsPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Bản ghi" }]}
      title="Bản ghi"
      subtitle="Manage and view all records"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang bản ghi sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}

