"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function WasteSourcesPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Chủ nguồn thải" }]}
      title="Chủ nguồn thải"
      subtitle="Manage waste sources"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang chủ nguồn thải sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}

