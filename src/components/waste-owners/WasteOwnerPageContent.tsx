"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  WasteOwnerWithLocation,
  WasteOwnerType,
  CreateWasteOwnerDTO,
  UpdateWasteOwnerDTO,
} from "@/types/waste-owner";
import { IPaginationParams } from "@/types/pagination";
import { WasteOwnerTable } from "@/components/waste-owners/WasteOwnerTable";
import { WasteOwnerDetailDialog } from "@/components/waste-owners/WasteOwnerDetailDialog";
import { CreateWasteOwnerDialog } from "@/components/waste-owners/CreateWasteOwnerDialog";
import { EditWasteOwnerDialog } from "@/components/waste-owners/EditWasteOwnerDialog";
import { TableFilters } from "@/components/ui/TableFilters";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { TaggedSearchBar, SearchTag } from "@/components/ui/tagged-search-bar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTaggedSearch } from "@/hooks/useTaggedSearch";
import { useURLParams } from "@/hooks/useURLParams";
import { usePaginationWithURL } from "@/hooks/usePaginationWithURL";
import { useTableData } from "@/hooks/useTableData";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { toast } from "sonner";

// Search tags configuration for waste owners
const wasteOwnerSearchTags: SearchTag[] = [
  { value: "name", label: "Tên" },
  { value: "businessCode", label: "Mã số thuế / CCCD" },
];

interface WasteOwnerPageContentProps {
  // Mode configuration
  mode: "view" | "edit"; // view = motul, edit = recycler

  // Permissions
  canView: boolean;
  canCreate?: boolean;
  canEdit?: boolean;

  // Callbacks
  onCreate?: (dto: CreateWasteOwnerDTO) => Promise<void>;
  onUpdate?: (id: string, dto: UpdateWasteOwnerDTO) => Promise<void>;
  onDelete?: (wasteOwner: WasteOwnerWithLocation) => Promise<void>;
}

export function WasteOwnerPageContent({
  mode,
  canView,
  canCreate = false,
  canEdit = false,
  onCreate,
  onUpdate,
  onDelete,
}: WasteOwnerPageContentProps) {
  // URL params for filters - memoize config to prevent recreation
  const filterConfig = useMemo(
    () => ({
      type: { defaultValue: "all" },
      status: { defaultValue: "all" },
    }),
    []
  );
  const { params: filterParams, updateParams: updateFilterParams } = useURLParams(filterConfig);

  // Tagged search
  const {
    searchQuery,
    debouncedSearchQuery,
    selectedTag: searchField,
    setSearchQuery,
    setSelectedTag: setSearchField,
  } = useTaggedSearch({
    tags: wasteOwnerSearchTags,
    defaultTag: "name",
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
    const filterObj: {
      isActive?: boolean;
      wasteOwnerType?: WasteOwnerType;
      name?: string;
      businessCode?: string;
    } = {};

    if (filterParams.status !== "all") {
      filterObj.isActive = filterParams.status === "active";
    }

    if (filterParams.type !== "all") {
      filterObj.wasteOwnerType = filterParams.type as WasteOwnerType;
    }

    // Use debounced search value for API call based on selected search field
    if (debouncedSearchQuery.trim()) {
      if (searchField === "name") {
        filterObj.name = debouncedSearchQuery.trim();
      } else if (searchField === "businessCode") {
        filterObj.businessCode = debouncedSearchQuery.trim();
      }
    }

    return filterObj;
  }, [filterParams.status, filterParams.type, debouncedSearchQuery, searchField]);

  // Memoize fetchData function to prevent recreation on every render
  const fetchData = useCallback(
    async (
      filters: {
        isActive?: boolean;
        wasteOwnerType?: WasteOwnerType;
        name?: string;
        businessCode?: string;
      },
      paginationParams: IPaginationParams,
      noCache?: boolean
    ) => {
      const response = await WasteOwnerService.getAllWasteOwners(filters, paginationParams, noCache);
      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    },
    []
  );

  // Table data fetching
  const { data: wasteOwners, isLoading, error, reload } = useTableData({
    fetchData,
    filters,
    pagination,
    setPagination,
    enabled: canView,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách chủ nguồn thải"
      );
    }
  }, [error]);

  // Dialog states
  const [selectedWasteOwner, setSelectedWasteOwner] =
    useState<WasteOwnerWithLocation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Handlers - update filter and reset page together
  const handleTypeChange = (value: string) => {
    updateFilterParams({ type: value });
    // Reset page if not already on page 1
    if (pagination.page !== 1) {
      resetToPageOne();
    }
  };

  const handleStatusChange = (value: string) => {
    updateFilterParams({ status: value });
    // Reset page if not already on page 1
    if (pagination.page !== 1) {
      resetToPageOne();
    }
  };

  const handleView = (wasteOwner: WasteOwnerWithLocation) => {
    setSelectedWasteOwner(wasteOwner);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (wasteOwner: WasteOwnerWithLocation) => {
    setSelectedWasteOwner(wasteOwner);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (wasteOwner: WasteOwnerWithLocation) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chủ nguồn thải ${wasteOwner.name}?`)) {
      try {
        await toast.promise(WasteOwnerService.deleteWasteOwner(wasteOwner.id), {
          loading: "Đang xóa chủ nguồn thải...",
          success: "Đã xóa chủ nguồn thải thành công",
          error: (err) =>
            err?.response?.data?.message ||
            err?.message ||
            "Không thể xóa chủ nguồn thải",
        });

        // Wait a moment for backend to fully commit the deletion
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Reload with noCache to force fresh data after deletion
        await reload({ noCache: true });
      } catch {
        // Error handled by toast
      }
    }
  };

  const handleCreateWasteOwner = async (dto: CreateWasteOwnerDTO) => {
    try {
      if (onCreate) {
        await onCreate(dto);
      } else {
        await toast.promise(WasteOwnerService.createWasteOwner(dto), {
          loading: "Đang tạo chủ nguồn thải...",
          success: "Tạo chủ nguồn thải thành công",
          error: (err) =>
            err?.response?.data?.message ||
            err?.message ||
            "Không thể tạo chủ nguồn thải. Vui lòng thử lại.",
        });
      }

      // Close dialog first
      setIsCreateDialogOpen(false);

      // Wait a moment for backend to fully commit the transaction
      // This ensures the new item is available when we fetch
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Reset to page 1 and reload with new page value
      // Pass page: 1 and noCache: true to force fresh data
      setPagination((prev) => ({ ...prev, page: 1 }));
      await reload({ page: 1, limit: pagination.limit, noCache: true });
    } catch (error) {
      // Error already handled by toast or onCreate callback
      console.error("Error creating waste owner:", error);
    }
  };

  const handleUpdateWasteOwner = async (id: string, dto: UpdateWasteOwnerDTO) => {
    try {
      if (onUpdate) {
        await onUpdate(id, dto);
      } else {
        await toast.promise(WasteOwnerService.updateWasteOwner(id, dto), {
          loading: "Đang cập nhật chủ nguồn thải...",
          success: "Cập nhật chủ nguồn thải thành công",
          error: (err) =>
            err?.response?.data?.message ||
            err?.message ||
            "Không thể cập nhật chủ nguồn thải. Vui lòng thử lại.",
        });
      }

      // Close dialog first
      setIsEditDialogOpen(false);

      // Wait a moment for backend to fully commit the transaction
      // This ensures the updated item is available when we fetch
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Reload data to show updated information
      // Keep current page since we're updating an existing item
      // Use noCache: true to force fresh data
      await reload({ noCache: true });
    } catch (error) {
      // Error already handled by toast or onUpdate callback
      console.error("Error updating waste owner:", error);
    }
  };

  // Filter options
  const typeOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "individual", label: "Cá nhân" },
    { value: "business", label: "Doanh nghiệp" },
    { value: "organization", label: "Hộ kinh doanh" },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
  ];

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-center text-muted-foreground py-12">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter and Search Section */}
      <TableFilters
        title="Tất cả Chủ nguồn thải"
        subtitle="Doanh nghiệp và Cá nhân"
        search={
          <TaggedSearchBar
            value={searchQuery}
            selectedTag={searchField}
            tags={wasteOwnerSearchTags}
            onValueChange={setSearchQuery}
            onTagChange={setSearchField}
            placeholder="Tìm kiếm..."
          />
        }
        filters={[
          <FilterSelect
            key="type"
            value={filterParams.type as string}
            options={typeOptions}
            onChange={handleTypeChange}
            placeholder="Tất cả loại"
          />,
          <FilterSelect
            key="status"
            value={filterParams.status as string}
            options={statusOptions}
            onChange={handleStatusChange}
            placeholder="Tất cả trạng thái"
          />,
        ]}
        actions={
          mode === "edit" && canCreate ? (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Chủ nguồn thải
            </Button>
          ) : undefined
        }
      />

      {/* Table */}
      <WasteOwnerTable
        wasteOwners={wasteOwners}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onView={handleView}
        onEdit={mode === "edit" && canEdit ? handleEdit : undefined}
        onDelete={mode === "edit" ? handleDelete : undefined}
      />

      {/* Detail Dialog */}
      <WasteOwnerDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        wasteOwner={selectedWasteOwner}
      />

      {/* Create Dialog */}
      {mode === "edit" && canCreate && (
        <CreateWasteOwnerDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateWasteOwner={handleCreateWasteOwner}
        />
      )}

      {/* Edit Dialog */}
      {mode === "edit" && canEdit && (
        <EditWasteOwnerDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          wasteOwner={selectedWasteOwner}
          onUpdateWasteOwner={handleUpdateWasteOwner}
        />
      )}
    </div>
  );
}

