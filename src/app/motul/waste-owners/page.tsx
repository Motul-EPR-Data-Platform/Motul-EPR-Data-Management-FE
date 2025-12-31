"use client";

import { useState, useEffect } from "react";
import {
  WasteOwnerWithLocation,
  WasteOwnerType,
} from "@/types/waste-owner";
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

  // Check permission - waste-sources page requires waste-sources.view permission
  const canView = usePermission("waste-sources.view");

  useEffect(() => {
    if (canView) {
      loadWasteOwners();
    }
  }, [canView]);

  const loadWasteOwners = async () => {
    setIsLoading(true);
    try {
      const filters: { isActive?: boolean; wasteOwnerType?: WasteOwnerType } =
        {};

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
          </div>
        </div>

        {/* Table - View only, no edit/delete */}
        <WasteOwnerTable
          wasteOwners={filteredWasteOwners}
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

