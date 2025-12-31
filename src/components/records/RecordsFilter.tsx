"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MoreHorizontal } from "lucide-react";
import { RecordStatus } from "@/types/record";
import { BatchService } from "@/lib/services/batch.service";
import { CollectionBatch, BatchType } from "@/types/batch";
import { BatchDetailDialog } from "@/components/batches/BatchDetailDialog";

interface RecordsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  batchFilter?: string | null;
  onBatchFilterChange?: (batchId: string | null) => void;
}

export function RecordsFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  batchFilter,
  onBatchFilterChange,
}: RecordsFilterProps) {
  const [batches, setBatches] = useState<CollectionBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isBatchDetailDialogOpen, setIsBatchDetailDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoadingBatches(true);
      try {
        // Fetch all batches (including closed ones) for the record page filter
        const data = await BatchService.getAllBatches();
        setBatches(data);
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    fetchBatches();
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo ID, tên chủ nguồn thải..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {onBatchFilterChange && (
          <div className="flex gap-2">
            <Select
              value={batchFilter || "all"}
              onValueChange={(value) =>
                onBatchFilterChange(value === "all" ? null : value)
              }
              disabled={isLoadingBatches}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tất cả lô hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lô hàng</SelectItem>
                {batches.map((batch) => (
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
              className="px-3"
              title="Xem chi tiết lô hàng"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="pending">Đang chờ duyệt</SelectItem>
            <SelectItem value="approved">Đã được phê duyệt</SelectItem>
            <SelectItem value="rejected">Bị từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {onBatchFilterChange && (
        <BatchDetailDialog
          open={isBatchDetailDialogOpen}
          onOpenChange={setIsBatchDetailDialogOpen}
        />
      )}
    </>
  );
}
