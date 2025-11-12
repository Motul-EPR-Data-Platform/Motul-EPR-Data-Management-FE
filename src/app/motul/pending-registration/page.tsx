"use client";

import { PageLayout } from "@/components/layout/PageLayout";

export default function PendingRegistrationPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Đăng ký chờ duyệt" }]}
      title="Đăng ký chờ duyệt"
      subtitle="Review and approve pending registrations"
    >
      <div className="rounded-lg border bg-white p-6">
        <p className="text-muted-foreground text-center py-12">
          Nội dung trang đăng ký chờ duyệt sẽ được hiển thị tại đây
        </p>
      </div>
    </PageLayout>
  );
}

