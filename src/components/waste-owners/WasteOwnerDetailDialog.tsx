"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WasteOwnerWithLocation } from "@/types/waste-owner";
import { WasteOwnerForm } from "./WasteOwnerForm";

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
  if (!wasteOwner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Chủ nguồn thải</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về chủ nguồn thải
          </DialogDescription>
        </DialogHeader>
        <WasteOwnerForm
          initialData={wasteOwner}
          mode="view"
          showCancelButton={false}
        />
      </DialogContent>
    </Dialog>
  );
}
