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

  const validateForm = (data: CreateWasteOwnerDTO): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    }
    if (!data.businessCode.trim()) {
      newErrors.businessCode =
        data.wasteOwnerType === "individual"
          ? "Số CCCD là bắt buộc"
          : "Mã số thuế là bắt buộc";
    }
    if (!data.contactPerson || !data.contactPerson.trim()) {
      newErrors.contactPerson = "Người liên hệ là bắt buộc";
    }
    if (!data.phone || !data.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }
    if (!data.email || !data.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    // TODO: Add location validation back when location becomes required
    // Location is temporarily optional - no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (dto: CreateWasteOwnerDTO | any) => {
    const createData = dto as CreateWasteOwnerDTO;
    
    if (!validateForm(createData)) {
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
