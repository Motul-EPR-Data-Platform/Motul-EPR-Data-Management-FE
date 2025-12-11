"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { CollectionRecordDetail } from "@/types/record";
import { toast } from "sonner";
import { RecordSummaryCards } from "@/components/records/RecordSummaryCards";
import { RecordHistorySection } from "@/components/records/RecordHistorySection";
import { RecordsFilter } from "@/components/records/RecordsFilter";
import { RecordStatus } from "@/types/record";

interface StatusCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

export default function MyRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CollectionRecordDetail[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CollectionRecordDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  });

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery, statusFilter]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      // Fetch all records (both draft and submitted) for current recycler
      // Backend will filter by recyclerId automatically for recycler_admin role
      const response = await CollectionRecordService.getAllRecords();
      const allRecords = response.data || [];

      setRecords(allRecords);

      // Calculate status counts
      const counts: StatusCounts = {
        total: allRecords.length,
        pending: allRecords.filter((r) => r.status === "pending").length,
        approved: allRecords.filter((r) => r.status === "approved").length,
        rejected: allRecords.filter((r) => r.status === "rejected").length,
        draft: allRecords.filter((r) => r.status === "draft").length,
      };
      setStatusCounts(counts);
    } catch (error: any) {
      console.error("Error loading records:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách bản ghi",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(query) ||
          r.wasteOwner?.name?.toLowerCase().includes(query) ||
          r.wasteOwner?.businessCode?.toLowerCase().includes(query) ||
          r.contractType?.name?.toLowerCase().includes(query) ||
          r.contractType?.code?.toLowerCase().includes(query),
      );
    }

    setFilteredRecords(filtered);
  };

  const handleViewRecord = (record: CollectionRecordDetail) => {
    // Use query params instead of dynamic route for static export compatibility
    router.push(`/recycler/records/view?id=${record.id}`);
  };

  const handleEditRecord = (record: CollectionRecordDetail) => {
    // Only allow editing drafts
    if (record.status === "draft") {
      // TODO: Navigate to edit page when implemented
      // For now, redirect to create page with draft ID
      toast.info(`Chỉnh sửa bản nháp ${record.id.slice(0, 8)}...`);
      // router.push(`/recycler/records/${record.id}/edit`);
      // Or redirect to create page with draft pre-filled
      router.push(`/recycler/records/create?draftId=${record.id}`);
    }
  };

  return (
    <PageLayout
      breadcrumbs={[{ label: "Bản ghi của tôi" }]}
      title="Bản ghi của tôi"
      subtitle="Xem và quản lý các bản ghi thu gom của bạn"
    >
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-start">
          <div></div>
          <Button
            onClick={() => router.push("/recycler/records/create")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo Bản ghi thu gom mới
          </Button>
        </div>

        {/* Record History Section */}
        <div className="space-y-4">
          <RecordsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <RecordHistorySection
            records={filteredRecords}
            isLoading={isLoading}
            onView={handleViewRecord}
            onEdit={handleEditRecord}
          />
        </div>

        {/* Summary Cards */}
        <RecordSummaryCards counts={statusCounts} />
      </div>
    </PageLayout>
  );
}
