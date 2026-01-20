"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Upload, FileText, Loader2, X, Replace, Eye, ExternalLink, Clock, Check, AlertCircle, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ManagedFile } from "@/hooks/useFileManager";
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

interface WasteOwnerFileUploadProps {
  files: ManagedFile[];
  maxFiles?: number;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (fileId: string) => Promise<void>;
  onReplaceFile?: (fileId: string, newFile: File) => void;
  disabled?: boolean;
  className?: string;
}

export function WasteOwnerFileUpload({
  files,
  maxFiles = 3,
  onAddFiles,
  onRemoveFile,
  onReplaceFile,
  disabled = false,
  className,
}: WasteOwnerFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [fileToReplace, setFileToReplace] = useState<string | null>(null);

  const canAddMore = files.length < maxFiles;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && canAddMore) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || !canAddMore) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== droppedFiles.length) {
      alert("Chỉ hỗ trợ file PDF");
      return;
    }

    onAddFiles(pdfFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const filesArray = Array.from(selectedFiles);
    onAddFiles(filesArray);

    // Reset input
    e.target.value = "";
  };

  const handleReplaceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !fileToReplace) return;

    if (onReplaceFile) {
      onReplaceFile(fileToReplace, selectedFile);
      setFileToReplace(null);
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveClick = (fileId: string) => {
    setFileToDelete(fileId);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      await onRemoveFile(fileToDelete);
      setFileToDelete(null);
    }
  };

  const handleReplaceClick = (fileId: string) => {
    setFileToReplace(fileId);
    replaceInputRef.current?.click();
  };

  const isImageFile = (file: ManagedFile): boolean => {
    const mimeType = file.file?.type || file.fileData?.mimeType || "";
    const fileName = file.file?.name || file.fileData?.fileName || "";
    return (
      mimeType.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)
    );
  };

  const getFileIcon = (file: ManagedFile) => {
    if (isImageFile(file)) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-red-500" />;
  };

  const getFileName = (file: ManagedFile): string => {
    // For pending files (new/replaced), show the file name from the File object
    if (file.status === "pending" && file.file) {
      return file.file.name;
    }
    // For uploaded files, show the server file name
    if (file.fileData) {
      return file.fileData.fileName;
    }
    // Fallback to File object if available
    if (file.file) {
      return file.file.name;
    }
    return "Unknown file";
  };

  const getFileSize = (file: ManagedFile): string => {
    let bytes = 0;

    // For pending files (new/replaced), use the File object size
    if (file.status === "pending" && file.file) {
      bytes = file.file.size;
    } else if (file.fileData) {
      bytes = file.fileData.fileSize;
    } else if (file.file) {
      bytes = file.file.size;
    }

    if (bytes === 0) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusBadge = (status: ManagedFile["status"]) => {
    switch (status) {
      case "uploading":
        return (
          <span className="text-xs text-blue-600 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang tải...
          </span>
        );
      case "uploaded":
        return (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Đã tải lên
          </span>
        );
      case "error":
        return (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Lỗi
          </span>
        );
      case "deleting":
        return (
          <span className="text-xs text-orange-600 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang xóa...
          </span>
        );
      case "pending":
        return (
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Sẽ tải lên khi lưu
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-sm font-medium mb-1">
            Kéo thả file vào đây hoặc click để chọn
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Chỉ hỗ trợ file PDF, tối đa {maxFiles} file (
            {maxFiles - files.length} file còn lại)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Chọn file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              File đã chọn ({files.length}/{maxFiles})
            </p>
            {files.some((f) => f.status === "pending") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                File sẽ được tải lên khi bạn nhấn Lưu
              </p>
            )}
          </div>
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* Show thumbnail for images, icon for documents */}
                {isImageFile(file) && file.preview ? (
                  <div className="shrink-0 mt-1">
                    <img
                      src={file.preview}
                      alt={getFileName(file)}
                      className="h-16 w-16 object-cover rounded border"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 mt-1">{getFileIcon(file)}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getFileName(file)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getFileSize(file)}
                  </p>
                  <div className="mt-1">{getStatusBadge(file.status)}</div>
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* View button (for files with preview) */}
                  {file.preview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      onClick={() => {
                        window.open(file.preview, "_blank");
                      }}
                      title="Xem file"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Edit/Replace button (only for uploaded files if onReplaceFile is provided) */}
                  {onReplaceFile && file.status === "uploaded" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      onClick={() => handleReplaceClick(file.id)}
                      title="Thay thế file"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      <Replace className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Delete button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={
                      disabled ||
                      file.status === "uploading" ||
                      file.status === "deleting"
                    }
                    onClick={() => handleRemoveClick(file.id)}
                    title="Xóa file"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {file.status === "deleting" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Hidden input for replace */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleReplaceFileSelect}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa file</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa file này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

