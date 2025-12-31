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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BatchService } from "@/lib/services/batch.service";
import { BatchType, CreateBatchDTO } from "@/types/batch";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateBatchDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBatchDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [batchType, setBatchType] = useState<BatchType | "">("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!batchType) {
      toast.error("Vui lòng chọn loại lô hàng");
      return;
    }

    if (!user?.recyclerId) {
      toast.error("Không tìm thấy thông tin recycler");
      return;
    }

    setIsLoading(true);
    try {
      const dto: CreateBatchDTO = {
        batchType: batchType as BatchType,
        recyclerId: user.recyclerId,
        createdBy: user.id,
        description: description.trim() || undefined,
      };

      await BatchService.createBatch(dto);
      toast.success("Tạo lô hàng thành công");
      
      // Reset form
      setBatchType("");
      setDescription("");
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tạo lô hàng";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setBatchType("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo Lô hàng mới</DialogTitle>
          <DialogDescription>
            Tạo một lô hàng mới để quản lý các bản ghi thu gom
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="batchType">
              Loại lô hàng <span className="text-red-500">*</span>
            </Label>
            <Select
              value={batchType}
              onValueChange={(value) => setBatchType(value as BatchType)}
              disabled={isLoading}
            >
              <SelectTrigger id="batchType">
                <SelectValue placeholder="Chọn loại lô hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BatchType.PORT}>Cảng (TTC - HL. LO)</SelectItem>
                <SelectItem value={BatchType.FACTORY}>Nhà máy (NMXL - LO)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả (tùy chọn)</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả cho lô hàng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !batchType}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo lô hàng"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

