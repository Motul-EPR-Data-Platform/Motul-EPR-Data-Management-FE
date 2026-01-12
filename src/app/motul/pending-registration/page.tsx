"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { CollectionRecordDetail } from "@/types/record";
import { toast } from "sonner";
import { RecordsTable } from "@/components/records/RecordsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function PendingRegistrationPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CollectionRecordDetail[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<
    CollectionRecordDetail[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadRecords();
  }, [currentPage]);

  useEffect(() => {
    // Reset to page 1 when search query changes
    if (searchQuery.trim()) {
      // For now, filter client-side. In production, you might want server-side search
      filterRecords();
    } else {
      // If no search query, show all records from current page
      setFilteredRecords(records);
    }
  }, [records, searchQuery]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      // Fetch submitted records awaiting approval
      // Backend expects "SUBMITTED" status, service will map "pending" to "SUBMITTED"
      const response = await CollectionRecordService.getAllRecords({
        status: "pending", // Will be mapped to "SUBMITTED" in service
        page: currentPage,
        limit: pageSize,
      });
      const allRecords = response.data || [];

      setRecords(allRecords);

      // Update pagination info
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalRecords(response.pagination.total);
      } else if (response.count !== undefined) {
        // Fallback for legacy response format
        setTotalRecords(response.count);
        setTotalPages(Math.ceil(response.count / pageSize));
      }
    } catch (error: any) {
      console.error("Error loading pending records:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách bản ghi chờ duyệt",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

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
    // Navigate to record view page - reuse the same component
    router.push(`/motul/records/view?id=${record.id}`);
  };

  const handleRecordUpdated = () => {
    // Reload records after approval/rejection
    loadRecords();
  };

  return (
    <PageLayout
      breadcrumbs={[{ label: "Đăng ký chờ duyệt" }]}
      title="Đăng ký chờ duyệt"
      subtitle="Xem xét và phê duyệt các bản ghi đang chờ duyệt"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo ID, tên chủ nguồn thải, biển số xe..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Records Table */}
        <RecordsTable
          records={filteredRecords}
          isLoading={isLoading}
          onView={handleViewRecord}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {records.length} / {totalRecords} bản ghi
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages || isLoading}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
