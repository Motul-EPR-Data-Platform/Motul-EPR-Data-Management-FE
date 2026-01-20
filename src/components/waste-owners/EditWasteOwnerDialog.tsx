"use client";

import { useState, useEffect } from "react";
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
import { useFileManager } from "@/hooks/useFileManager";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { toast } from "sonner";
import { IFileWithSignedUrl } from "@/types/file-record";

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
  const [existingFiles, setExistingFiles] = useState<IFileWithSignedUrl[]>([]);

  // File management
  const {
    files,
    addFiles,
    removeFile,
    replaceFile,
    clearFiles,
    loadExistingFiles,
    isUploading,
    getNewFiles,
    getReplacementFiles,
  } = useFileManager(3, false);

  // Load existing files when waste owner changes
  useEffect(() => {
    if (wasteOwner && open) {
      const fetchFiles = async () => {
        try {
          const filesData = await WasteOwnerService.getFilesWithPreview(
            wasteOwner.id,
          );
          setExistingFiles(filesData.wasteOwnerContract || []);
          loadExistingFiles(filesData.wasteOwnerContract || []);
        } catch (error) {
          console.error("Error loading files:", error);
          setExistingFiles([]);
        }
      };
      fetchFiles();
    }
  }, [wasteOwner, open, loadExistingFiles]);

  // Clear files when dialog closes
  useEffect(() => {
    if (!open) {
      clearFiles();
      setExistingFiles([]);
    }
  }, [open, clearFiles]);

  const handleAddFiles = (newFiles: File[]) => {
    // Just add to local state for preview, don't upload yet
    addFiles(newFiles);
  };

  const handleReplaceFile = (fileId: string, newFile: File) => {
    // Just swap the file locally - no API call yet
    // The file will be marked as "pending" and uploaded on save
    replaceFile(fileId, newFile);
  };

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
      // Step 1: Handle file replacements (using waste owner replace API)
      const replacementFiles = getReplacementFiles();

      if (replacementFiles.length > 0) {
        console.log(`[REPLACE] Replacing ${replacementFiles.length} files...`);
        for (const { fileId, newFile } of replacementFiles) {
          try {
            await WasteOwnerService.replaceFile(fileId, newFile);
            console.log(`[REPLACE] Successfully replaced file ${fileId}`);
          } catch (replaceError: any) {
            toast.error(`Không thể thay thế file: ${replaceError.message}`);
            setIsLoading(false);
            return; // Stop if replacement fails
          }
        }
        toast.success(`Thay thế ${replacementFiles.length} file thành công`);
      }

      // Step 2: Upload new files (not replacements)
      const newFiles = getNewFiles();

      if (newFiles.length > 0) {
        console.log(`[UPLOAD] Uploading ${newFiles.length} new files...`);
        try {
          const response = await WasteOwnerService.uploadFilesToExisting(
            wasteOwner.id,
            newFiles,
          );
          toast.success(`Tải lên ${response.count} file thành công`);
        } catch (uploadError: any) {
          toast.error(uploadError.message || "Không thể tải file lên");
          setIsLoading(false);
          return; // Stop if file upload fails
        }
      }

      // Step 3: Update waste owner
      await onUpdateWasteOwner(wasteOwner.id, updateData);
      setErrors({});
      clearFiles();
      onOpenChange(false);

      // Step 3: Reload files to show updated list
      try {
        const filesData = await WasteOwnerService.getFilesWithPreview(
          wasteOwner.id,
        );
        setExistingFiles(filesData.wasteOwnerContract || []);
      } catch (error) {
        console.error("Error reloading files:", error);
      }
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
          onReplaceFile={handleReplaceFile}
          existingFiles={existingFiles}
          submitButtonText="Cập nhật Chủ nguồn thải"
        />
      </DialogContent>
    </Dialog>
  );
}
