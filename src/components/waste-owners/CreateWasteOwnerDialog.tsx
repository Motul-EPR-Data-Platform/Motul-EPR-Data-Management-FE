"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateWasteOwnerDTO, UpdateWasteOwnerDTO } from "@/types/waste-owner";
import { WasteOwnerForm } from "./WasteOwnerForm";
import { validateCreateWasteOwner } from "@/lib/validations/waste-owner";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { toast } from "sonner";

interface CreateWasteOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWasteOwner: (
    dto: CreateWasteOwnerDTO,
  ) => Promise<{ id: string } | void>;
}

export function CreateWasteOwnerDialog({
  open,
  onOpenChange,
  onCreateWasteOwner,
}: CreateWasteOwnerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (payload: {
    data: CreateWasteOwnerDTO | UpdateWasteOwnerDTO;
    contractFiles: File[];
  }) => {
    const createData = payload.data as CreateWasteOwnerDTO;

    // Use Zod validation
    const validation = validateCreateWasteOwner(createData);

    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    setIsLoading(true);
    try {
      const created = await onCreateWasteOwner(createData);

      if (payload.contractFiles.length > 0) {
        try {
          await WasteOwnerService.uploadWasteOwnerContractFiles(
            payload.contractFiles,
            (created as any)?.id,
          );
        } catch (uploadError) {
          toast.error(
            (uploadError as any)?.response?.data?.message ||
              (uploadError as any)?.message ||
              "Không thể tải lên hợp đồng chủ nguồn thải",
          );
        }
      }
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      toast.error(
        (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          "Không thể tạo chủ nguồn thải",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm Chủ nguồn thải</DialogTitle>
          <DialogDescription>
            Thêm một chủ nguồn thải mới vào danh sách
          </DialogDescription>
        </DialogHeader>
        <WasteOwnerForm
          mode="create"
          isLoading={isLoading}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={() => {
            setErrors({});
            onOpenChange(false);
          }}
          submitButtonText="Lưu Chủ nguồn thải"
        />
      </DialogContent>
    </Dialog>
  );
}
