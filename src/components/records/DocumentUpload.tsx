"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Plus, Upload, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileType } from "@/types/file-record";
import {
  validateFileType,
  getAllowedMimeTypes,
  getFileTypeDescription,
} from "@/lib/validations/file-record.validation";

export interface DocumentFile {
  id: string;
  file: File;
  type: string;
}

interface DocumentUploadProps {
  documents: DocumentFile[];
  onDocumentsChange: (documents: DocumentFile[]) => void;
  documentTypes: Array<{ value: string; label: string }>;
  disabled?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  // Optional: If provided, will use category-based validation
  category?: FileType;
  // Optional: Map document type values to FileType categories
  documentTypeToCategory?: (docType: string) => FileType;
}

export function DocumentUpload({
  documents,
  onDocumentsChange,
  documentTypes,
  disabled = false,
  maxSizeMB = 10,
  acceptedFormats,
  category,
  documentTypeToCategory,
}: DocumentUploadProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine accepted formats based on category or use provided
  const getAcceptedFormats = (): string[] => {
    if (category) {
      return getAllowedMimeTypes(category);
    }
    if (acceptedFormats) {
      return acceptedFormats;
    }
    // Default fallback
    return ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
  };

  const acceptedFormatsList = getAcceptedFormats();

  const handleAddDocument = () => {
    setShowAddForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedType) {
      alert("Vui lòng chọn loại tài liệu");
      return;
    }

    // Determine category for validation
    let fileCategory: FileType | undefined = category;
    if (!fileCategory && documentTypeToCategory) {
      fileCategory = documentTypeToCategory(selectedType);
    }

    // Validate file type based on category if available
    if (fileCategory) {
      const validation = validateFileType(fileCategory, file);
      if (!validation.valid) {
        alert(validation.error || "File không hợp lệ");
        return;
      }
    } else {
      // Fallback to basic MIME type validation
      if (!acceptedFormatsList.includes(file.type)) {
        // Check file extension as fallback
        const fileName = file.name.toLowerCase();
        const hasValidExtension =
          fileName.endsWith(".pdf") ||
          fileName.endsWith(".jpg") ||
          fileName.endsWith(".jpeg") ||
          fileName.endsWith(".png") ||
          fileName.endsWith(".webp") ||
          fileName.endsWith(".doc") ||
          fileName.endsWith(".docx");

        if (!hasValidExtension) {
          const typeDesc = fileCategory
            ? getFileTypeDescription(fileCategory)
            : "PNG, JPG, PDF";
          alert(`Chỉ chấp nhận file: ${typeDesc}`);
          return;
        }
      }
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      alert(`File không được vượt quá ${maxSizeMB}MB`);
      return;
    }

    const newDocument: DocumentFile = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      type: selectedType,
    };

    onDocumentsChange([...documents, newDocument]);
    setShowAddForm(false);
    setSelectedType("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find((dt) => dt.value === type)?.label || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-4">
      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <File className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{getDocumentTypeLabel(doc.type)}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file.size)}</span>
                  </div>
                </div>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDocument(doc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Document Form */}
      {showAddForm ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4 bg-gray-50">
          <div className="grid gap-2">
            <Label>Chọn loại tài liệu</Label>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tài liệu" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormatsList.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || !selectedType}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Chọn file
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowAddForm(false);
                setSelectedType("");
              }}
              disabled={disabled}
            >
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddDocument}
          disabled={disabled}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm tài liệu mới
        </Button>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {category
          ? `${getFileTypeDescription(category)} tối đa ${maxSizeMB}MB cho mỗi file`
          : `PNG, JPG, PDF tối đa ${maxSizeMB}MB cho mỗi file`}
      </p>
    </div>
  );
}

