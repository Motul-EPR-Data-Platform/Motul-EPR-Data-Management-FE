"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface FileDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fileName?: string;
  isDeleting?: boolean;
}

export function FileDeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  fileName,
  isDeleting = false,
}: FileDeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDialogTitle>Xác nhận xóa file</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p className="font-medium text-foreground">
              Bạn có chắc chắn muốn xóa file này không?
            </p>
            {fileName && (
              <p className="text-sm bg-gray-100 p-2 rounded border">
                <span className="font-medium">File:</span> {fileName}
              </p>
            )}
            <p className="text-red-600 font-medium flex items-center gap-1 mt-2">
              <AlertTriangle className="h-4 w-4" />
              Cảnh báo: Hành động này không thể hoàn tác!
            </p>
            <p className="text-sm text-muted-foreground">
              File sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "Đang xóa..." : "Xóa file"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

