"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateDraftFormData } from "@/types/record";
import { DocumentUpload, DocumentFile } from "@/components/records/DocumentUpload";
import { FileType } from "@/types/file-record";
import { FileUpload } from "@/components/ui/file-upload";

interface Step3WarehouseRecyclingProps {
  formData: Partial<CreateDraftFormData>;
  errors?: Record<string, string>;
  onChange: (field: keyof CreateDraftFormData, value: any) => void;
  disabled?: boolean;
  recycledDate?: Date;
  onRecycledDateChange?: (date: Date) => void;
  qualityDocuments?: DocumentFile[];
  onQualityDocumentsChange?: (files: DocumentFile[]) => void;
  recycledPhoto?: File | null;
  onRecycledPhotoChange?: (file: File | null) => void;
  stockpilePhoto?: File | null;
  onStockpilePhotoChange?: (file: File | null) => void;
}

export function Step3WarehouseRecycling({
  formData,
  errors = {},
  onChange,
  disabled = false,
  recycledDate,
  onRecycledDateChange,
  qualityDocuments = [],
  onQualityDocumentsChange,
  recycledPhoto,
  onRecycledPhotoChange,
  stockpilePhoto,
  onStockpilePhotoChange,
}: Step3WarehouseRecyclingProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Nhập kho & Tái chế</h2>
        <p className="text-sm text-muted-foreground">Bước thứ 3 trên 4</p>
      </div>

      <div className="space-y-4">
        {/* Stockpiled */}
        <div className="grid gap-2">
          <Label htmlFor="stockpiled">Lưu kho?</Label>
          <Select
            value={
              formData.stockpiled === true
                ? "yes"
                : formData.stockpiled === false
                  ? "no"
                  : ""
            }
            onValueChange={(value) =>
              onChange("stockpiled", value === "yes" ? true : value === "no" ? false : null)
            }
            disabled={disabled}
          >
            <SelectTrigger id="stockpiled">
              <SelectValue placeholder="Dropdown" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Có</SelectItem>
              <SelectItem value="no">Không</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stockpile Volume and Photo (if stockpiled) */}
        {formData.stockpiled === true && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="stockpileVolumeKg">Khối lượng lưu kho (kg)</Label>
              <Input
                id="stockpileVolumeKg"
                type="number"
                value={formData.stockpileVolumeKg || ""}
                onChange={(e) =>
                  onChange(
                    "stockpileVolumeKg",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                placeholder="0"
                disabled={disabled}
                className={errors.stockpileVolumeKg ? "border-red-500" : ""}
              />
              {errors.stockpileVolumeKg && (
                <p className="text-sm text-red-500">{errors.stockpileVolumeKg}</p>
              )}
            </div>

            {/* Stockpile Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="stockpilePhoto">
                Ảnh nhập kho <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Tải lên ảnh nhập kho (JPEG, PNG, WebP)
              </p>
              <FileUpload
                id="stockpilePhoto"
                label=""
                maxSize={10}
                value={stockpilePhoto || null}
                onChange={(file) => onStockpilePhotoChange?.(file || null)}
                error={errors.stockpilePhoto}
                required
                disabled={disabled}
                category={FileType.STOCKPILE_PHOTO}
              />
              {errors.stockpilePhoto && (
                <p className="text-sm text-red-500">{errors.stockpilePhoto}</p>
              )}
            </div>
          </>
        )}

        {/* Recycling Date */}
        <div className="grid gap-2">
          <Label htmlFor="recycledDate">
            Ngày hoàn thành tái chế
            {/* Disabled required indicator for now */}
            {/* <span className="text-red-500">*</span> */}
          </Label>
          <DatePicker
            value={recycledDate}
            onChange={(date: Date | undefined) => {
              if (onRecycledDateChange && date) {
                onRecycledDateChange(date);
              }
              onChange(
                "recycledDate",
                date ? date.toISOString().split("T")[0] : null,
              );
            }}
            disabled={disabled}
          />
          {errors.recycledDate && (
            <p className="text-sm text-red-500">{errors.recycledDate}</p>
          )}
        </div>

        {/* Recycled Volume */}
        <div className="grid gap-2">
          <Label htmlFor="recycledVolumeKg">
            Khối lượng đã tái chế (kg){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="recycledVolumeKg"
            type="number"
            value={formData.recycledVolumeKg || ""}
            onChange={(e) =>
              onChange(
                "recycledVolumeKg",
                e.target.value ? parseFloat(e.target.value) : null,
              )
            }
            placeholder="0"
            disabled={disabled}
            className={errors.recycledVolumeKg ? "border-red-500" : ""}
          />
          {errors.recycledVolumeKg && (
            <p className="text-sm text-red-500">{errors.recycledVolumeKg}</p>
          )}
        </div>

        {/* Recycled Photo Upload */}
        <div className="space-y-2">
          <Label htmlFor="recycledPhoto">
            Ảnh sản phẩm đã tái chế <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Tải lên ảnh sản phẩm sau khi tái chế (JPEG, PNG, WebP)
          </p>
          <FileUpload
            id="recycledPhoto"
            label=""
            maxSize={10}
            value={recycledPhoto || null}
            onChange={(file) => onRecycledPhotoChange?.(file || null)}
            error={errors.recycledPhoto}
            required
            disabled={disabled}
            category={FileType.RECYCLED_PHOTO}
          />
          {errors.recycledPhoto && (
            <p className="text-sm text-red-500">{errors.recycledPhoto}</p>
          )}
        </div>

        {/* Quality Documents Upload */}
        <div className="space-y-2">
          <Label>Tải lên tài liệu chất lượng</Label>
          <DocumentUpload
            documents={qualityDocuments}
            onDocumentsChange={(files) => onQualityDocumentsChange?.(files)}
            documentTypes={[
              {
                value: "chat-luong-truoc-tai-che",
                label: "Chất lượng chất thải trước khi tái chế",
              },
              {
                value: "chat-luong-sau-tai-che",
                label: "Chất lượng sau khi tái chế",
              },
            ]}
            disabled={disabled}
            maxSizeMB={10}
            documentTypeToCategory={(docType) => {
              // Map quality document types to their respective categories
              if (docType === "chat-luong-truoc-tai-che") {
                return FileType.QUALITY_METRICS;
              }
              if (docType === "chat-luong-sau-tai-che") {
                return FileType.OUTPUT_QUALITY_METRICS;
              }
              // Default fallback
              return FileType.QUALITY_METRICS;
            }}
          />
        </div>
      </div>
    </div>
  );
}

