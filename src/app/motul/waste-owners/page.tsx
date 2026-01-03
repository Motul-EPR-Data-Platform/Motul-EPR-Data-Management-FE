"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WasteOwnerWithLocation, WasteOwnerType } from "@/types/waste-owner";
import { IPaginationMeta } from "@/types/pagination";
import { WasteOwnerTable } from "@/components/waste-owners/WasteOwnerTable";
import { WasteOwnerDetailDialog } from "@/components/waste-owners/WasteOwnerDetailDialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { toast } from "sonner";

export default function WasteOwnersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL params
  const getInitialPage = () => {
    const page = searchParams.get("page");
    return page ? parseInt(page, 10) : 1;
  };

  const getInitialLimit = () => {
    const limit = searchParams.get("limit");
    return limit ? parseInt(limit, 10) : 20;
  };

  const getInitialSearch = () => {
    return searchParams.get("search") || "";
  };

  const getInitialType = () => {
    return searchParams.get("type") || "all";
  };

  const getInitialStatus = () => {
    return searchParams.get("status") || "all";
  };

  const [wasteOwners, setWasteOwners] = useState<WasteOwnerWithLocation[]>([]);
  const [pagination, setPagination] = useState<IPaginationMeta>({
    page: getInitialPage(),
    limit: getInitialLimit(),
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(getInitialSearch());
  const [selectedType, setSelectedType] = useState<string>(getInitialType());
  const [selectedStatus, setSelectedStatus] = useState<string>(getInitialStatus());
  const [selectedWasteOwner, setSelectedWasteOwner] =
    useState<WasteOwnerWithLocation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Check permission - waste-sources page requires waste-sources.view permission
  const canView = usePermission("waste-sources.view");

  // Update URL params when state changes
  const updateURLParams = useCallback(
    (updates: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
      status?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete("page");
        } else {
          params.set("page", String(updates.page));
        }
      }

      if (updates.limit !== undefined) {
        if (updates.limit === 20) {
          params.delete("limit");
        } else {
          params.set("limit", String(updates.limit));
        }
      }

      if (updates.search !== undefined) {
        if (updates.search === "") {
          params.delete("search");
        } else {
          params.set("search", updates.search);
        }
      }

      if (updates.type !== undefined) {
        if (updates.type === "all") {
          params.delete("type");
        } else {
          params.set("type", updates.type);
        }
      }

      if (updates.status !== undefined) {
        if (updates.status === "all") {
          params.delete("status");
        } else {
          params.set("status", updates.status);
        }
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  const loadWasteOwners = async () => {
    setIsLoading(true);
    try {
      const filters: {
        isActive?: boolean;
        wasteOwnerType?: WasteOwnerType;
        name?: string;
      } = {};

      if (selectedStatus !== "all") {
        filters.isActive = selectedStatus === "active";
      }

      if (selectedType !== "all") {
        filters.wasteOwnerType = selectedType as WasteOwnerType;
      }

      // Use debounced search value for API call
      if (debouncedSearchQuery.trim()) {
        filters.name = debouncedSearchQuery.trim();
      }

      const response = await WasteOwnerService.getAllWasteOwners(
        filters,
        { page: pagination.page, limit: pagination.limit }
      );

      setWasteOwners(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách chủ nguồn thải",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search value - only this triggers data reload
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(getInitialSearch());
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Sync state from URL when URL params change externally (e.g., browser back/forward)
  useEffect(() => {
    const urlPage = getInitialPage();
    const urlLimit = getInitialLimit();
    const urlSearch = getInitialSearch();
    const urlType = getInitialType();
    const urlStatus = getInitialStatus();

    // Check if this is a URL-driven change (not user input)
    const isUrlChange = urlSearch !== searchQuery ||
                       urlPage !== pagination.page ||
                       urlLimit !== pagination.limit ||
                       urlType !== selectedType ||
                       urlStatus !== selectedStatus;

    if (isUrlChange) {
      if (urlPage !== pagination.page || urlLimit !== pagination.limit) {
        setPagination(prev => ({
          ...prev,
          page: urlPage,
          limit: urlLimit,
        }));
      }

      if (urlSearch !== searchQuery) {
        setSearchQuery(urlSearch);
        setDebouncedSearchQuery(urlSearch); // Sync debounced value too
      }

      if (urlType !== selectedType) {
        setSelectedType(urlType);
      }

      if (urlStatus !== selectedStatus) {
        setSelectedStatus(urlStatus);
      }
    }

    if (isInitialMount) {
      setIsInitialMount(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounce search query - only update debounced value and URL after user stops typing
  useEffect(() => {
    if (!isInitialMount) {
      const delaySearch = setTimeout(() => {
        // Only reset page if search actually changed (not just typing)
        const searchChanged = debouncedSearchQuery !== searchQuery;

        if (searchChanged) {
          // Update debounced value (this will trigger data reload)
          setDebouncedSearchQuery(searchQuery);

          // Update URL and reset page to 1 for new search
          updateURLParams({ search: searchQuery, page: 1 });
          setPagination(prev => ({ ...prev, page: 1 }));
        }
      }, 500); // 500ms debounce
      return () => clearTimeout(delaySearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isInitialMount]);

  // Load data when dependencies change - use debouncedSearchQuery instead of searchQuery
  useEffect(() => {
    if (canView) {
      void loadWasteOwners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, pagination.page, pagination.limit, selectedType, selectedStatus, debouncedSearchQuery]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    updateURLParams({ page });
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
    updateURLParams({ page: 1, limit });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value); // Update input immediately for responsive UI
    // Debounced value and data reload will happen in useEffect
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    updateURLParams({ type: value, page: 1 });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    updateURLParams({ status: value, page: 1 });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleView = (wasteOwner: WasteOwnerWithLocation) => {
    setSelectedWasteOwner(wasteOwner);
    setIsDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Chủ nguồn thải" }]}
        title="Danh sách Chủ nguồn thải"
        subtitle="Quản lý danh sách chủ nguồn thải"
      >
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground py-12">
            Đang tải dữ liệu...
          </p>
        </div>
      </PageLayout>
    );
  }

  if (!canView) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Chủ nguồn thải" }]}
        title="Danh sách Chủ nguồn thải"
        subtitle="Access Denied"
      >
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground py-12">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: "Chủ nguồn thải" }]}
      title="Danh sách Chủ nguồn thải"
      subtitle="Quản lý danh sách chủ nguồn thải"
    >
      <div className="space-y-4">
        {/* Filter and Search Section */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Tất cả Chủ nguồn thải</h2>
            <p className="text-sm text-muted-foreground">
              Doanh nghiệp và Cá nhân
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="individual">Cá nhân</SelectItem>
                <SelectItem value="business">Doanh nghiệp</SelectItem>
                <SelectItem value="organization">Hộ kinh doanh</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table - View only, no edit/delete */}
        <WasteOwnerTable
          wasteOwners={wasteOwners}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onView={handleView}
          onEdit={undefined}
          onDelete={undefined}
        />
      </div>

      {/* Detail Dialog */}
      <WasteOwnerDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        wasteOwner={selectedWasteOwner}
      />
    </PageLayout>
  );
}

