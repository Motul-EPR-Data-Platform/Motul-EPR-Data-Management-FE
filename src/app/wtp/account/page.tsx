"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function WTPAccountPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Tài khoản" }]}
      title="Tài khoản"
      subtitle="Manage your account information"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang tài khoản sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}

