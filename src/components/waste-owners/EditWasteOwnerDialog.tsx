"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UpdateWasteOwnerDTO,
  WasteOwnerWithLocation,
} from "@/types/waste-owner";
import { WasteOwnerForm } from "./WasteOwnerForm";
import { validateUpdateWasteOwner } from "@/lib/validations/waste-owner";

interface EditWasteOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wasteOwner: WasteOwnerWithLocation | null;
  onUpdateWasteOwner: (id: string, dto: UpdateWasteOwnerDTO) => Promise<void>;
}

export function EditWasteOwnerDialog({
  open,
  onOpenChange,
  wasteOwner,
  onUpdateWasteOwner,
}: EditWasteOwnerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (dto: UpdateWasteOwnerDTO | any) => {
    if (!wasteOwner) return;

    const updateData = dto as UpdateWasteOwnerDTO;

    // Use Zod validation
    const validation = validateUpdateWasteOwner(updateData);

    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateWasteOwner(wasteOwner.id, updateData);
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  if (!wasteOwner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Chủ nguồn thải</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chủ nguồn thải
          </DialogDescription>
        </DialogHeader>
        <WasteOwnerForm
          key={wasteOwner.id} // Force re-render when wasteOwner changes
          initialData={wasteOwner}
          mode="edit"
          isLoading={isLoading}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={() => {
            setErrors({});
            onOpenChange(false);
          }}
          submitButtonText="Cập nhật Chủ nguồn thải"
        />
      </DialogContent>
    </Dialog>
  );
}
