"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WasteOwnerWithLocation } from "@/types/waste-owner";
import { WasteOwnerForm } from "./WasteOwnerForm";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { IFileWithSignedUrl } from "@/types/file-record";

interface WasteOwnerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wasteOwner: WasteOwnerWithLocation | null;
}

export function WasteOwnerDetailDialog({
  open,
  onOpenChange,
  wasteOwner,
}: WasteOwnerDetailDialogProps) {
  const [existingFiles, setExistingFiles] = useState<IFileWithSignedUrl[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Load files when dialog opens
  useEffect(() => {
    if (wasteOwner && open) {
      const fetchFiles = async () => {
        setIsLoadingFiles(true);
        try {
          const filesData = await WasteOwnerService.getFilesWithPreview(
            wasteOwner.id,
          );
          setExistingFiles(filesData.wasteOwnerContract || []);
        } catch (error) {
          console.error("Error loading files:", error);
          setExistingFiles([]);
        } finally {
          setIsLoadingFiles(false);
        }
      };
      fetchFiles();
    }
  }, [wasteOwner, open]);

  // Clear files when dialog closes
  useEffect(() => {
    if (!open) {
      setExistingFiles([]);
    }
  }, [open]);

  if (!wasteOwner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Chủ nguồn thải</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về chủ nguồn thải
            {isLoadingFiles && " - Đang tải file..."}
          </DialogDescription>
        </DialogHeader>
        <WasteOwnerForm
          initialData={wasteOwner}
          mode="view"
          existingFiles={existingFiles}
          showCancelButton={false}
        />
      </DialogContent>
    </Dialog>
  );
}
