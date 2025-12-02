"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpdateWasteOwnerDTO, WasteOwnerWithLocation } from "@/types/waste-owner";
import { WasteOwnerForm } from "./WasteOwnerForm";

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

  const validateForm = (data: UpdateWasteOwnerDTO): boolean => {
    const newErrors: Record<string, string> = {};

    if (data.name !== undefined && !data.name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    }
    if (data.contactPerson !== undefined && !data.contactPerson.trim()) {
      newErrors.contactPerson = "Người liên hệ là bắt buộc";
    }
    if (data.phone !== undefined && !data.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }
    if (data.email !== undefined) {
      if (!data.email.trim()) {
        newErrors.email = "Email là bắt buộc";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (dto: UpdateWasteOwnerDTO | any) => {
    if (!wasteOwner) return;

    const updateData = dto as UpdateWasteOwnerDTO;
    
    if (!validateForm(updateData)) {
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

