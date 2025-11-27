"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category, CreateDefinitionDTO } from "@/types/definition";
import { CreateDefinitionForm } from "./CreateDefinitionForm";
import { createDefinition } from "@/lib/utils/definitionUtils/definitionHelpers";
import { toast } from "sonner";

interface CreateDefinitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  categoryKey: string;
  onSuccess?: () => void;
}

export function CreateDefinitionDialog({
  open,
  onOpenChange,
  category,
  categoryKey,
  onSuccess,
}: CreateDefinitionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (dto: CreateDefinitionDTO) => {
    setIsLoading(true);
    try {
      await toast.promise(createDefinition(categoryKey, dto), {
        loading: "Đang tạo định nghĩa...",
        success: "Tạo định nghĩa thành công",
        error: (err) =>
          err?.response?.data?.message ||
          "Không thể tạo định nghĩa. Vui lòng thử lại.",
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo định nghĩa mới - {category.name}</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo định nghĩa mới trong danh mục {category.name}
          </DialogDescription>
        </DialogHeader>
        <CreateDefinitionForm
          category={category}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
