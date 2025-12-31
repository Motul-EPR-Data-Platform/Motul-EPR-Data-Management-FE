"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BatchService } from "@/lib/services/batch.service";
import { CollectionBatch, BatchStatus, BatchType } from "@/types/batch";
import { Loader2, Edit, Search, Plus } from "lucide-react";
import { BatchStatusUpdateDialog } from "./BatchStatusUpdateDialog";
import { CreateBatchDialog } from "./CreateBatchDialog";

interface BatchDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchType?: BatchType;
}

export function BatchDetailDialog({
  open,
  onOpenChange,
  batchType,
}: BatchDetailDialogProps) {
  const [batches, setBatches] = useState<CollectionBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchForUpdate, setSelectedBatchForUpdate] =
    useState<CollectionBatch | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const data = await BatchService.getAllBatches();
      // Filter by batchType if provided
      const filtered = batchType
        ? data.filter((b) => b.batchType === batchType)
        : data;
      setBatches(filtered);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.batchName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
      false,
  );

  const handleEditClick = (batch: CollectionBatch) => {
    setSelectedBatchForUpdate(batch);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchBatches(); // Refresh list after update
    setIsUpdateDialogOpen(false);
    setSelectedBatchForUpdate(null);
  };

  const handleCreateSuccess = () => {
    fetchBatches(); // Refresh list after create
  };

  const getStatusBadgeVariant = (status: BatchStatus) => {
    return status === BatchStatus.ACTIVE ? "default" : "secondary";
  };

  const getStatusLabel = (status: BatchStatus) => {
    return status === BatchStatus.ACTIVE ? "Đang hoạt động" : "Đã đóng";
  };

  const getBatchTypeLabel = (type: BatchType) => {
    return type === BatchType.PORT ? "Cảng" : "Nhà máy";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý Lô hàng</DialogTitle>
            <DialogDescription>
              Xem và quản lý tất cả các lô hàng. Bạn có thể tạo lô hàng mới hoặc
              cập nhật trạng thái lô hàng bằng cách nhấp vào biểu tượng chỉnh
              sửa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header with Create Button and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm lô hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo lô hàng
              </Button>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "Không tìm thấy lô hàng" : "Chưa có lô hàng nào"}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên lô hàng</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Ngày đóng</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">
                          {batch.batchName || "N/A"}
                        </TableCell>
                        <TableCell>
                          {getBatchTypeLabel(batch.batchType)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p
                            className="truncate"
                            title={batch.description || undefined}
                          >
                            {batch.description || "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(batch.status)}>
                            {getStatusLabel(batch.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(batch.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </TableCell>
                        <TableCell>
                          {batch.closedAt
                            ? new Date(batch.closedAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(batch)}
                            disabled={batch.status === BatchStatus.CLOSED}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedBatchForUpdate && (
        <BatchStatusUpdateDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          batch={selectedBatchForUpdate}
          onSuccess={handleUpdateSuccess}
        />
      )}

      <CreateBatchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
