"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { ProfilePage } from "@/components/profile/ProfilePage";

export default function WTPAccountPage() {
  return (
    <PageLayout
      breadcrumbs={[{ label: "Tài khoản" }]}
      title="Tài khoản"
      subtitle="Quản lý thông tin tài khoản của bạn"
    >
      <ProfilePage />
    </PageLayout>
  );
}
