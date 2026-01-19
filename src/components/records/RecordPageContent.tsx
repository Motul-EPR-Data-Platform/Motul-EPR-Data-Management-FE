"use client";

import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { CollectionRecordDetail, RecordStatus, GetRecordsFilters } from "@/types/record";
import { IPaginationParams } from "@/types/pagination";
import { RecordsTable } from "./RecordsTable";
import { RecordSummaryCards } from "./RecordSummaryCards";
import { TableFilters } from "@/components/ui/TableFilters";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { TaggedSearchBar, SearchTag } from "@/components/ui/tagged-search-bar";
import { Button } from "@/components/ui/button";
import { Download, Plus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BatchDetailDialog } from "@/components/batches/BatchDetailDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTaggedSearch } from "@/hooks/useTaggedSearch";
import { useURLParams } from "@/hooks/useURLParams";
import { usePaginationWithURL } from "@/hooks/usePaginationWithURL";
import { useTableData } from "@/hooks/useTableData";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { BatchService } from "@/lib/services/batch.service";
import {
  ExportService,
  type ExportRoute,
  type ExportType,
} from "@/lib/services/export.service";
import { CollectionBatch } from "@/types/batch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Search tags configuration for records
const recordSearchTags: SearchTag[] = [
  { value: "id", label: "Mã hồ sơ" },
  { value: "wasteOwner", label: "Chủ nguồn thải" },
  { value: "vehiclePlate", label: "Biển số xe" },
];

interface RecordPageContentProps {
  // Mode configuration
  mode: "motul" | "recycler"; // motul = admin view, recycler = recycler view

  // Permissions
  canCreate?: boolean;
  canEdit?: boolean;

  // Callbacks
  onView?: (record: CollectionRecordDetail) => void;
  onEdit?: (record: CollectionRecordDetail) => void;
}

export function RecordPageContent({
  mode,
  canCreate = false,
  canEdit = false,
  onView,
  onEdit,
}: RecordPageContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  // URL params for filters - memoize config to prevent recreation
  const filterConfig = useMemo(
    () => ({
      status: { defaultValue: "all" },
      batchId: { defaultValue: "all" },
      startDate: { defaultValue: "" },
      endDate: { defaultValue: "" },
    }),
    []
  );
  const { params: filterParams, updateParams: updateFilterParams } = useURLParams(filterConfig);

  // Batch filter state
  const [batches, setBatches] = useState<CollectionBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isBatchDetailDialogOpen, setIsBatchDetailDialogOpen] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<CollectionRecordDetail | null>(null);

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const data = await BatchService.getAllBatches(
          user?.recyclerId || undefined,
        );
        setBatches(data);
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [user?.recyclerId]);

  // Tagged search
  const {
    searchQuery,
    debouncedSearchQuery,
    selectedTag: searchField,
    setSearchQuery,
    setSelectedTag: setSearchField,
  } = useTaggedSearch({
    tags: recordSearchTags,
    defaultTag: "id",
    searchParamName: "search",
    tagParamName: "searchField",
  });

  // Pagination with URL sync
  const { pagination, setPagination, handlePageChange, handlePageSizeChange, resetToPageOne } =
    usePaginationWithURL({
      initialPage: 1,
      initialLimit: 20,
    });

  // Build filters for API call - memoized to prevent infinite loops
  const filters = useMemo(() => {
    const filterObj: Omit<GetRecordsFilters, "page" | "limit"> = {};

    if (filterParams.status !== "all") {
      filterObj.status = filterParams.status as RecordStatus;
    }

    if (filterParams.startDate && filterParams.endDate) {
      filterObj.startDate = filterParams.startDate;
      filterObj.endDate = filterParams.endDate;
    }

    // Use debounced search value for API call based on selected search field
    // Note: Backend doesn't support search by these fields directly, so we'll filter client-side
    // or we can add backend support later

    return filterObj;
  }, [filterParams.status, filterParams.startDate, filterParams.endDate]);

  // Memoize fetchData function to prevent recreation on every render
  const fetchData = useCallback(
    async (
      filters: Omit<GetRecordsFilters, "page" | "limit">,
      paginationParams: IPaginationParams,
      noCache?: boolean
    ) => {
      const response = await CollectionRecordService.getAllRecords(filters, paginationParams, noCache);
      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: paginationParams.page || 1,
          limit: paginationParams.limit || 20,
          total: response.count || response.data?.length || 0,
          totalPages: Math.ceil((response.count || response.data?.length || 0) / (paginationParams.limit || 20)),
          hasNext: false,
          hasPrev: false,
        },
      };
    },
    []
  );

  // Table data fetching
  const { data: records, isLoading, error, reload } = useTableData<
    CollectionRecordDetail,
    Omit<GetRecordsFilters, "page" | "limit">
  >({
    fetchData,
    filters,
    pagination,
    setPagination,
    enabled: true,
  });

  // Calculate status counts from pagination metadata
  // We'll update this when we get the response
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  });

  // Fetch status counts separately on mount
  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        // Fetch all records without pagination to get total count
        const allResponse = await CollectionRecordService.getAllRecords({}, { page: 1, limit: 1 });
        const total = allResponse.pagination?.total || allResponse.count || 0;

        // Fetch counts for each status
        const [pendingResponse, approvedResponse, rejectedResponse, draftResponse] = await Promise.all([
          CollectionRecordService.getAllRecords({ status: "pending" }, { page: 1, limit: 1 }),
          CollectionRecordService.getAllRecords({ status: "approved" }, { page: 1, limit: 1 }),
          CollectionRecordService.getAllRecords({ status: "rejected" }, { page: 1, limit: 1 }),
          CollectionRecordService.getAllRecords({ status: "draft" }, { page: 1, limit: 1 }),
        ]);

        setStatusCounts({
          total,
          pending: pendingResponse.pagination?.total || pendingResponse.count || 0,
          approved: approvedResponse.pagination?.total || approvedResponse.count || 0,
          rejected: rejectedResponse.pagination?.total || rejectedResponse.count || 0,
          draft: draftResponse.pagination?.total || draftResponse.count || 0,
        });
      } catch (err) {
        console.error("Error fetching status counts:", err);
        // Don't show error toast for status counts, just log it
      }
    };

    fetchStatusCounts();
  }, []); // Only fetch once on mount

  // Handle errors
  useEffect(() => {
    if (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách bản ghi"
      );
    }
  }, [error]);

  // Handlers - update filter and reset page together
  const handleStatusChange = (value: string) => {
    updateFilterParams({ status: value });
    if (pagination.page !== 1) {
      resetToPageOne();
    }
  };

  const handleBatchChange = (value: string) => {
    updateFilterParams({ batchId: value });
    if (pagination.page !== 1) {
      resetToPageOne();
    }
  };

  const handleStartDateChange = (value: string) => {
    updateFilterParams({ startDate: value });
    if (pagination.page !== 1) {
      resetToPageOne();
    }
  };

  const handleEndDateChange = (value: string) => {
    updateFilterParams({ endDate: value });
    if (pagination.page !== 1) {
      resetToPageOne();
    }
  };

  const mapStatusToExportType = (status: string): ExportType | null => {
    if (status === "all") return "ALL_RECORDS";
    if (status === "draft") return "DRAFT";
    if (status === "pending") return "SUBMITTED";
    if (status === "approved") return "APPROVED";
    // Backend export doesn't currently support REJECTED-only export
    if (status === "rejected") return null;
    return "ALL_RECORDS";
  };

  const resolveExportRoute = (params: {
    status: string;
    batchId: string;
    startDate: string;
    endDate: string;
    recyclerId?: string;
  }): { route?: ExportRoute; error?: string } => {
    const exportType = mapStatusToExportType(params.status);
    if (!exportType) {
      return {
        error: "Chưa hỗ trợ xuất Excel cho trạng thái 'Bị từ chối'.",
      };
    }

    const hasBatch = params.batchId !== "all";
    const hasDateRange = Boolean(params.startDate && params.endDate);
    if (hasBatch && hasDateRange) {
      return {
        error:
          "Xuất Excel chưa hỗ trợ đồng thời Lô hàng + Khoảng ngày. Vui lòng bỏ một bộ lọc.",
      };
    }

    if (hasDateRange) {
      return {
        route: {
          kind: "dateRange",
          startDate: params.startDate,
          endDate: params.endDate,
          exportType,
          recyclerId: params.recyclerId,
        },
      };
    }

    if (hasBatch) {
      return {
        route: {
          kind: "byBatch",
          batchId: params.batchId,
          exportType,
          recyclerId: params.recyclerId,
        },
      };
    }

    // Batch filter is "all" => export multi-sheet per batch
    return {
      route: {
        kind: "allBatches",
        exportType,
        recyclerId: params.recyclerId,
      },
    };
  };

  const handleExport = async () => {
    if (isExporting) return;

    const status = (filterParams.status as string) || "all";
    const batchId = (filterParams.batchId as string) || "all";
    const startDate = (filterParams.startDate as string) || "";
    const endDate = (filterParams.endDate as string) || "";

    setIsExporting(true);
    try {
      const recyclerId = user?.recyclerId || undefined;
      const exportDecision = resolveExportRoute({
        status,
        batchId,
        startDate,
        endDate,
        recyclerId,
      });

      if (exportDecision.error) {
        toast.error(exportDecision.error);
        return;
      }

      await toast.promise(
        (async () => {
          return await ExportService.exportRecords(exportDecision.route!);
        })(),
        {
          loading: "Đang xuất Excel...",
          success: (result: { filename: string; recordCount?: number }) =>
            `Đã tải xuống ${result.recordCount ? `${result.recordCount} bản ghi` : "file"} (${result.filename})`,
          error: (err: any) =>
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            "Không thể xuất Excel. Vui lòng thử lại.",
        },
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewRecord = (record: CollectionRecordDetail) => {
    if (onView) {
      onView(record);
    } else {
      if (mode === "motul") {
        router.push(`/motul/records/view?id=${record.id}`);
      } else {
        router.push(`/recycler/records/view?id=${record.id}`);
      }
    }
  };

  const handleEditRecord = (record: CollectionRecordDetail) => {
    if (record.status === "draft" || record.status === "rejected") {
      if (onEdit) {
        onEdit(record);
      } else {
        router.push(`/recycler/records/edit?id=${record.id}`);
      }
    } else {
      toast.info("Chỉ có thể chỉnh sửa bản nháp hoặc bản ghi bị từ chối");
    }
  };

  const handleDeleteRecord = (record: CollectionRecordDetail) => {
    if (record.status !== "draft") {
      toast.error("Chỉ có thể xóa bản nháp");
      return;
    }

    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;

    try {
      await toast.promise(
        CollectionRecordService.deleteDraft(recordToDelete.id),
        {
          loading: "Đang xóa bản nháp...",
          success: "Đã xóa bản nháp thành công",
          error: (err: any) =>
            err?.response?.data?.message ||
            err?.message ||
            "Không thể xóa bản nháp. Vui lòng thử lại.",
        }
      );

      // Refresh data after deletion
      reload();
      setRecordToDelete(null);
    } catch (error) {
      // Error is already handled by toast.promise
      console.error("Error deleting draft:", error);
    }
  };

  // Filter client-side by search query and batch if needed
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Filter by batch (client-side)
    if (filterParams.batchId && filterParams.batchId !== "all") {
      filtered = filtered.filter((record) => record.batchId === filterParams.batchId);
    }

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        if (searchField === "id") {
          return (
            record.id.toLowerCase().includes(query) ||
            record.recordName?.toLowerCase().includes(query)
          );
        } else if (searchField === "wasteOwner") {
          const wasteOwner =
            record.wasteOwner ||
            (record.wasteOwners && record.wasteOwners.length > 0 ? record.wasteOwners[0] : null);
          return (
            wasteOwner?.name?.toLowerCase().includes(query) ||
            wasteOwner?.businessCode?.toLowerCase().includes(query)
          );
        } else if (searchField === "vehiclePlate") {
          return record.vehiclePlate?.toLowerCase().includes(query);
        }
        return false;
      });
    }

    return filtered;
  }, [records, debouncedSearchQuery, searchField, filterParams.batchId]);

  // Filter options
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "draft", label: "Bản nháp" },
    { value: "pending", label: "Đang chờ duyệt" },
    { value: "approved", label: "Đã được phê duyệt" },
    { value: "rejected", label: "Bị từ chối" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <RecordSummaryCards counts={statusCounts} />

      {/* Filter and Search Section */}
      <TableFilters
        title="Tất cả Bản ghi"
        subtitle="Quản lý bản ghi thu gom"
        search={
          <TaggedSearchBar
            value={searchQuery}
            selectedTag={searchField}
            tags={recordSearchTags}
            onValueChange={setSearchQuery}
            onTagChange={setSearchField}
            placeholder="Tìm kiếm..."
          />
        }
        filters={[
          <FilterSelect
            key="status"
            value={filterParams.status as string}
            options={statusOptions}
            onChange={handleStatusChange}
            placeholder="Tất cả trạng thái"
          />,
          <div key="batch" className="flex gap-2 w-full sm:w-auto">
            <Select
              value={filterParams.batchId as string}
              onValueChange={handleBatchChange}
              disabled={isLoadingBatches}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tất cả lô hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lô hàng</SelectItem>
                {batches.map((batch: CollectionBatch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBatchDetailDialogOpen(true)}
              className="px-3 flex-shrink-0"
              title="Xem chi tiết lô hàng"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>,
        ]}
        headerContent={
          <div className="flex flex-wrap gap-2 sm:gap-3 items-end w-full sm:w-auto">
            <div className="grid gap-1 min-w-0 flex-1 sm:flex-initial">
              <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                Từ ngày
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filterParams.startDate as string}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleStartDateChange(e.target.value)
                }
                className="w-full sm:w-[140px] h-9"
              />
            </div>
            <div className="grid gap-1 min-w-0 flex-1 sm:flex-initial">
              <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                Đến ngày
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filterParams.endDate as string}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleEndDateChange(e.target.value)
                }
                className="w-full sm:w-[140px] h-9"
              />
            </div>
          </div>
        }
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Đang xuất..." : "Xuất Excel"}
            </Button>

            {mode === "recycler" && canCreate ? (
              <Button onClick={() => router.push("/recycler/records/create")} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Tạo Bản ghi thu gom mới</span>
                <span className="sm:hidden">Tạo mới</span>
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Batch Detail Dialog */}
      <BatchDetailDialog
        open={isBatchDetailDialogOpen}
        onOpenChange={setIsBatchDetailDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa bản nháp"
        description={
          recordToDelete
            ? `Bạn có chắc chắn muốn xóa bản nháp "${recordToDelete.recordName || recordToDelete.id}"? Hành động này không thể hoàn tác.`
            : ""
        }
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={confirmDeleteRecord}
      />

      {/* Table */}
      <RecordsTable
        records={filteredRecords}
        isLoading={isLoading}
        onView={handleViewRecord}
        onEdit={mode === "recycler" && canEdit ? handleEditRecord : undefined}
        onDelete={mode === "recycler" ? handleDeleteRecord : undefined}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

