"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateWasteOwnerDTO } from "@/types/waste-owner";
import { WasteOwnerForm } from "./WasteOwnerForm";
import { validateCreateWasteOwner } from "@/lib/validations/waste-owner";

interface CreateWasteOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWasteOwner: (dto: CreateWasteOwnerDTO) => Promise<void>;
}

export function CreateWasteOwnerDialog({
  open,
  onOpenChange,
  onCreateWasteOwner,
}: CreateWasteOwnerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (dto: CreateWasteOwnerDTO | any) => {
    const createData = dto as CreateWasteOwnerDTO;

    // Use Zod validation
    const validation = validateCreateWasteOwner(createData);

    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    setIsLoading(true);
    try {
      await onCreateWasteOwner(createData);
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent component
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
