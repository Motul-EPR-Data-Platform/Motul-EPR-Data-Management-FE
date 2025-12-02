"use client";

import { useState, useEffect } from "react";
import {
  WasteOwnerWithLocation,
  WasteOwnerType,
  CreateWasteOwnerDTO,
  UpdateWasteOwnerDTO,
} from "@/types/waste-owner";
import { WasteOwnerTable } from "@/components/waste-owners/WasteOwnerTable";
import { WasteOwnerDetailDialog } from "@/components/waste-owners/WasteOwnerDetailDialog";
import { CreateWasteOwnerDialog } from "@/components/waste-owners/CreateWasteOwnerDialog";
import { EditWasteOwnerDialog } from "@/components/waste-owners/EditWasteOwnerDialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { toast } from "sonner";

export default function WasteSourcesPage() {
  const [wasteOwners, setWasteOwners] = useState<WasteOwnerWithLocation[]>([]);
  const [filteredWasteOwners, setFilteredWasteOwners] = useState<
    WasteOwnerWithLocation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedWasteOwner, setSelectedWasteOwner] =
    useState<WasteOwnerWithLocation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Check permission - waste-sources page requires waste-sources.view permission
  const canView = usePermission("waste-sources.view");
  const canCreate = usePermission("waste-sources.create");
  const canEdit = usePermission("waste-sources.edit");

  useEffect(() => {
    if (canView) {
      loadWasteOwners();
    }
  }, [canView]);

  const loadWasteOwners = async () => {
    setIsLoading(true);
    try {
      const filters: { isActive?: boolean; wasteOwnerType?: WasteOwnerType } = {};

      if (selectedStatus !== "all") {
        filters.isActive = selectedStatus === "active";
      }

      if (selectedType !== "all") {
        filters.wasteOwnerType = selectedType as WasteOwnerType;
      }

      const response = await WasteOwnerService.getAllWasteOwners(filters);
      setWasteOwners(response.data || []);
      setFilteredWasteOwners(response.data || []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách chủ nguồn thải",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWasteOwners();
  }, [selectedType, selectedStatus]);

  useEffect(() => {
    let filtered = wasteOwners;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wo) =>
          wo.name.toLowerCase().includes(query) ||
          wo.email.toLowerCase().includes(query) ||
          wo.contactPerson.toLowerCase().includes(query) ||
          wo.phone.includes(query) ||
          wo.businessCode.includes(query) ||
          wo.id.toLowerCase().includes(query),
      );
    }

    setFilteredWasteOwners(filtered);
  }, [searchQuery, wasteOwners]);

  const handleView = (wasteOwner: WasteOwnerWithLocation) => {
    setSelectedWasteOwner(wasteOwner);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (wasteOwner: WasteOwnerWithLocation) => {
    setSelectedWasteOwner(wasteOwner);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (wasteOwner: WasteOwnerWithLocation) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa chủ nguồn thải ${wasteOwner.name}?`,
      )
    ) {
      try {
        await toast.promise(WasteOwnerService.deleteWasteOwner(wasteOwner.id), {
          loading: "Đang xóa chủ nguồn thải...",
          success: "Đã xóa chủ nguồn thải thành công",
          error: (err) =>
            err?.response?.data?.message ||
            err?.message ||
            "Không thể xóa chủ nguồn thải",
        });
        loadWasteOwners();
      } catch (error) {
        // Error handled by toast
      }
    }
  };

  const handleCreateWasteOwner = async (dto: CreateWasteOwnerDTO) => {
    await toast.promise(WasteOwnerService.createWasteOwner(dto), {
      loading: "Đang tạo chủ nguồn thải...",
      success: "Tạo chủ nguồn thải thành công",
      error: (err) =>
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo chủ nguồn thải. Vui lòng thử lại.",
    });
    loadWasteOwners();
  };

  const handleUpdateWasteOwner = async (
    id: string,
    dto: UpdateWasteOwnerDTO,
  ) => {
    await toast.promise(WasteOwnerService.updateWasteOwner(id, dto), {
      loading: "Đang cập nhật chủ nguồn thải...",
      success: "Cập nhật chủ nguồn thải thành công",
      error: (err) =>
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật chủ nguồn thải. Vui lòng thử lại.",
    });
    loadWasteOwners();
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="individual">Cá nhân</SelectItem>
                <SelectItem value="business">Doanh nghiệp</SelectItem>
                <SelectItem value="organization">Tổ chức</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>

            {canCreate && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Chủ nguồn thải
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <WasteOwnerTable
          wasteOwners={filteredWasteOwners}
          onView={handleView}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={handleDelete}
        />
      </div>

      {/* Detail Dialog */}
      <WasteOwnerDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        wasteOwner={selectedWasteOwner}
      />

      {/* Create Dialog */}
      {canCreate && (
        <CreateWasteOwnerDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateWasteOwner={handleCreateWasteOwner}
        />
      )}

      {/* Edit Dialog */}
      {canEdit && (
        <EditWasteOwnerDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          wasteOwner={selectedWasteOwner}
          onUpdateWasteOwner={handleUpdateWasteOwner}
        />
      )}
    </PageLayout>
  );
}
