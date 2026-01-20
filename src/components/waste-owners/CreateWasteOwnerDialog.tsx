"use client";

import { useState, useEffect } from "react";
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
import { useFileManager } from "@/hooks/useFileManager";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { toast } from "sonner";

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

  // File management - stores files locally for preview
  const {
    files,
    addFiles,
    removeFile,
    clearFiles,
    isUploading,
  } = useFileManager(3, true); // Enable preview generation

  // Clear files when dialog closes
  useEffect(() => {
    if (!open) {
      clearFiles();
    }
  }, [open]);

  // Handle file selection - only store locally, don't upload yet
  const handleAddFiles = (newFiles: File[]) => {
    addFiles(newFiles); // Just add to local state for preview
  };

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
      let fileIds: string[] = [];

      // Step 1: Upload files first if any (pre-creation upload)
      const pendingFiles = files
        .filter((f) => f.status === "pending" && f.file)
        .map((f) => f.file!);

      if (pendingFiles.length > 0) {
        try {
          const response = await WasteOwnerService.uploadFiles(pendingFiles);
          fileIds = response.fileIds;
          toast.success(`Tải lên ${response.count} file thành công`);
        } catch (uploadError: any) {
          toast.error(uploadError.message || "Không thể tải file lên");
          setIsLoading(false);
          return; // Stop if file upload fails
        }
      }

      // Step 2: Create waste owner with file IDs
      const submitData: CreateWasteOwnerDTO = {
        ...createData,
        ...(fileIds.length > 0 && {
          files: {
            wasteOwnerContractIds: fileIds,
          },
        }),
      };

      await onCreateWasteOwner(submitData);
      setErrors({});
      clearFiles();
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
          isLoading={isLoading || isUploading}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={() => {
            setErrors({});
            clearFiles();
            onOpenChange(false);
          }}
          files={files}
          onAddFiles={handleAddFiles}
          onRemoveFile={removeFile}
          submitButtonText="Lưu Chủ nguồn thải"
        />
      </DialogContent>
    </Dialog>
  );
}
