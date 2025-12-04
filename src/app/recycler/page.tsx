"use client";

import { PageLayout } from "@/components/layout/PageLayout";
import { DashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePermission } from "@/hooks/usePermission";

export default function RecyclerDashboardPage() {
  const canCreateRecord = usePermission("records.create");

  return (
    <PageLayout
      breadcrumbs={[]}
      title="Dashboard"
      subtitle="Overview of your recycler system"
    >
      <div className="space-y-6">
        {canCreateRecord && (
          <div className="flex justify-end">
            <Link href="/recycler/records/create">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Tạo bản ghi
              </Button>
            </Link>
          </div>
        )}
        <DashboardSkeleton />
      </div>
    </PageLayout>
  );
}
