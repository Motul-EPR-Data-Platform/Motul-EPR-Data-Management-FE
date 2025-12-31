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
  const [filteredRecords, setFilteredRecords] = useState<
    CollectionRecordDetail[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string | null>(null);
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
  }, [records, searchQuery, statusFilter, batchFilter]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      // Fetch all records (both draft and submitted) for current recycler
      // Backend will filter by recyclerId automatically for recycler_admin role
      const response = await CollectionRecordService.getAllRecords();
      const allRecords = response.data || [];

      // Ensure all records have normalized status
      const normalizedRecords = allRecords.map((r) => {
        // Additional normalization check (in case service didn't normalize)
        let status = r.status;
        if (status === "SUBMITTED") status = "pending";
        else if (status === "APPROVED") status = "approved";
        else if (status === "REJECTED") status = "rejected";
        else if (status === "DRAFT") status = "draft";
        return { ...r, status };
      });

      setRecords(normalizedRecords);

      // Calculate status counts after normalization
      const counts: StatusCounts = {
        total: normalizedRecords.length,
        pending: normalizedRecords.filter((r) => r.status === "pending").length,
        approved: normalizedRecords.filter((r) => r.status === "approved")
          .length,
        rejected: normalizedRecords.filter((r) => r.status === "rejected")
          .length,
        draft: normalizedRecords.filter((r) => r.status === "draft").length,
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

    // Filter by batch
    if (batchFilter) {
      filtered = filtered.filter((r) => (r as any).batchId === batchFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => {
        // Handle both wasteOwner (singular) and wasteOwners (array)
        const wasteOwner =
          r.wasteOwner ||
          (r.wasteOwners && r.wasteOwners.length > 0 ? r.wasteOwners[0] : null);

        return (
          r.id.toLowerCase().includes(query) ||
          wasteOwner?.name?.toLowerCase().includes(query) ||
          wasteOwner?.businessCode?.toLowerCase().includes(query) ||
          r.contractType?.name?.toLowerCase().includes(query) ||
          r.contractType?.code?.toLowerCase().includes(query)
        );
      });
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
      router.push(`/recycler/records/edit?id=${record.id}`);
    } else {
      toast.info("Chỉ có thể chỉnh sửa bản nháp");
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
            batchFilter={batchFilter}
            onBatchFilterChange={setBatchFilter}
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
