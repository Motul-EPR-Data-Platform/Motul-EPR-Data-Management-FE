"use client";

import * as React from "react";
import { Upload, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileType } from "@/types/file-record";
import {
  validateFileType,
  getFileTypeDescription,
} from "@/lib/validations/file-record.validation";

interface FileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  value?: File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  category?: FileType; // Optional: If provided, will use category-based validation
}

export function FileUpload({
  id,
  label,
  accept,
  maxSize = 10,
  value,
  onChange,
  error,
  required,
  disabled,
  className,
  category,
}: FileUploadProps) {
  // Determine accept string based on category or use provided
  const getAcceptString = (): string => {
    if (category) {
      const allowedTypes =
        category === FileType.ACCEPTANCE_DOC ||
        category === FileType.APPROVAL_DOC ||
        category === FileType.OUTPUT_QUALITY_METRICS ||
        category === FileType.QUALITY_METRICS ||
        category === FileType.WASTE_OWNER_CONTRACT
          ? "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "image/jpeg,image/jpg,image/png,image/webp";
      return accept || allowedTypes;
    }
    return accept || "application/pdf,image/jpeg,image/jpg,image/png";
  };

  const acceptString = getAcceptString();
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onChange?.(file);
      } else {
        // Reset input value so user can select the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onChange?.(file);
      } else {
        // Reset input value so user can select the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const validateFile = (file: File): boolean => {
    // If category is provided, use category-based validation
    if (category) {
      const validation = validateFileType(category, file);
      if (!validation.valid) {
        alert(validation.error || "File không hợp lệ");
        return false;
      }
    } else {
      // Fallback to basic MIME type validation
      const acceptedTypes = acceptString.split(",").map((type) => type.trim());
      if (!acceptedTypes.some((type) => file.type.match(type))) {
        alert("File không hợp lệ. Vui lòng chọn file đúng định dạng.");
        return false;
      }
    }

    // Check file size (maxSize in MB)
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File không được vượt quá ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleViewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      const url = URL.createObjectURL(value);
      window.open(url, "_blank");
      // Clean up the object URL after a delay to free memory
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith("image/");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className={
            required
              ? "after:content-['*'] after:ml-0.5 after:text-red-500"
              : ""
          }
        >
          {label}
        </Label>
      )}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          error && "border-red-500",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={acceptString}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
          required={required}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          {value ? (
            <div className="space-y-2 w-full">
              <p className="text-sm font-medium text-gray-900">{value.name}</p>
              <p className="text-xs text-gray-500">
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex items-center justify-center gap-2">
                {isImageFile(value) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleViewFile}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    disabled={disabled}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Xem ảnh
                  </Button>
                )}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                  disabled={disabled}
                >
                  Xóa file
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Nhấp để tải lên hoặc kéo thả file
              </p>
              <p className="text-xs text-gray-500">
                {category
                  ? `${getFileTypeDescription(category)} (Tối đa ${maxSize}MB)`
                  : `PDF, JPG, PNG (Tối đa ${maxSize}MB)`}
              </p>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
