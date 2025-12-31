"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { CollectionRecordDetail } from "@/types/record";
import { toast } from "sonner";
import { RecordSummaryCards } from "@/components/records/RecordSummaryCards";
import { RecordHistorySection } from "@/components/records/RecordHistorySection";
import { RecordsFilter } from "@/components/records/RecordsFilter";

interface StatusCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

export default function RecordsPage() {
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
      // Fetch all records - admin can see all records
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
          r.contractType?.code?.toLowerCase().includes(query) ||
          r.vehiclePlate?.toLowerCase().includes(query) ||
          r.wasteSource?.name?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredRecords(filtered);
  };

  const handleViewRecord = (record: CollectionRecordDetail) => {
    // Navigate to record view page - admin view
    router.push(`/motul/records/view?id=${record.id}`);
  };

  return (
    <PageLayout
      breadcrumbs={[{ label: "Bản ghi" }]}
      title="Bản ghi"
      subtitle="Xem và quản lý tất cả các bản ghi thu gom"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <RecordSummaryCards counts={statusCounts} />

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
          />
        </div>
      </div>
    </PageLayout>
  );
}
