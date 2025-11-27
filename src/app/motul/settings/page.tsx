"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function SettingsPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Cài đặt" }]}
      title="Cài đặt"
      subtitle="Manage system settings and preferences"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang cài đặt sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}

