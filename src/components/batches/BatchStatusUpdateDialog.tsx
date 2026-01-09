"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BatchService } from "@/lib/services/batch.service";
import { CollectionBatch, BatchStatus } from "@/types/batch";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BatchStatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: CollectionBatch;
  onSuccess?: () => void;
}

export function BatchStatusUpdateDialog({
  open,
  onOpenChange,
  batch,
  onSuccess,
}: BatchStatusUpdateDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseBatch = async () => {
    setIsLoading(true);
    try {
      await BatchService.closeBatch(batch.id);
      toast.success("Đóng lô hàng thành công");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đóng lô hàng";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReopenBatch = async () => {
    setIsLoading(true);
    try {
      await BatchService.reOpenBatch(batch.id);
      toast.success("Mở lại lô hàng thành công");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể mở lại lô hàng";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const canClose = batch.status === BatchStatus.ACTIVE;
  const canReopen = batch.status === BatchStatus.CLOSED;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {canClose
              ? "Xác nhận đóng lô hàng"
              : canReopen
                ? "Xác nhận mở lại lô hàng"
                : "Thông tin lô hàng"}
          </DialogTitle>
          <DialogDescription>
            {canClose
              ? "Bạn có chắc chắn muốn đóng lô hàng này không?"
              : canReopen
                ? "Bạn có chắc chắn muốn mở lại lô hàng này không?"
                : "Thông tin về lô hàng"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-medium">Tên lô hàng:</span>{" "}
              {batch.batchName}
            </p>
            <p className="text-sm">
              <span className="font-medium">Trạng thái hiện tại:</span>{" "}
              {batch.status === BatchStatus.ACTIVE
                ? "Đang hoạt động"
                : "Đã đóng"}
            </p>
          </div>

          {canClose && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Lô hàng phải có ít nhất một bản ghi</li>
                  <li>
                    Lô hàng có thể được đóng ngay cả khi chưa phê duyệt tất cả
                    các bản ghi
                  </li>
                  <li>Lô hàng có thể được mở lại sau khi đóng</li>
                </ul>
              </div>
            </div>
          )}

          {canReopen && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <p>
                  Lô hàng sẽ được mở lại và có thể tiếp tục thêm bản ghi mới.
                </p>
              </div>
            </div>
          )}

          {!canClose && !canReopen && (
            <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
              Không thể thay đổi trạng thái của lô hàng này.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          {canClose && (
            <Button
              type="button"
              onClick={handleCloseBatch}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận đóng"}
            </Button>
          )}
          {canReopen && (
            <Button
              type="button"
              onClick={handleReopenBatch}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận mở lại"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
