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

  const canClose = batch.status === BatchStatus.ACTIVE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận đóng lô hàng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn đóng lô hàng này không?
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
                    Tất cả các bản ghi trong lô hàng phải đã được phê duyệt
                  </li>
                  <li>Không thể hoàn tác sau khi đóng lô hàng</li>
                </ul>
              </div>
            </div>
          )}

          {!canClose && (
            <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
              Lô hàng này đã được đóng và không thể thay đổi trạng thái.
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
