"use client";

import { format } from "date-fns";
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
import {
  DocumentUpload,
  DocumentFile,
} from "@/components/records/DocumentUpload";
import { FileType, RecycledPhotoSubType } from "@/types/file-record";
import { parseDate } from "@/lib/utils/collectionRecordHelpers";
import type { ChangeEvent } from "react";

interface Step3WarehouseRecyclingProps {
  formData: Partial<CreateDraftFormData>;
  errors?: Record<string, string>;
  onChange: (field: keyof CreateDraftFormData, value: any) => void;
  disabled?: boolean;
  recycledDate?: Date;
  onRecycledDateChange?: (date: Date) => void;
  qualityDocuments?: DocumentFile[];
  onQualityDocumentsChange?: (files: DocumentFile[]) => void;
  hazWasteCertificates?: DocumentFile[];
  onHazWasteCertificatesChange?: (files: DocumentFile[]) => void;
  recycledPhotos?: DocumentFile[];
  onRecycledPhotosChange?: (files: DocumentFile[]) => void;
  stockpilePhotos?: DocumentFile[];
  onStockpilePhotosChange?: (files: DocumentFile[]) => void;
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
  hazWasteCertificates = [],
  onHazWasteCertificatesChange,
  recycledPhotos = [],
  onRecycledPhotosChange,
  stockpilePhotos = [],
  onStockpilePhotosChange,
}: Step3WarehouseRecyclingProps) {
  const handleHazCertChange = (files: DocumentFile[]) => {
    if (files.length > 3) {
      alert("Chỉ được tải tối đa 3 chứng nhận CTNH");
      return;
    }
    onHazWasteCertificatesChange?.(files);
  };

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
              onChange(
                "stockpiled",
                value === "yes" ? true : value === "no" ? false : null,
              )
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
            {/* Stock In Date */}
            <div className="grid gap-2">
              <Label htmlFor="stockInDate">
                Ngày lưu kho <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={parseDate(formData.stockInDate || undefined)}
                onChange={(date: Date | undefined) => {
                  onChange(
                    "stockInDate",
                    date ? format(date, "yyyy-MM-dd") : null,
                  );
                }}
                disabled={disabled}
              />
              {errors.stockInDate && (
                <p className="text-sm text-red-500">{errors.stockInDate}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stockpileVolumeKg">Khối lượng lưu kho (kg)</Label>
              <Input
                id="stockpileVolumeKg"
                type="number"
                value={formData.stockpileVolumeKg || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                <p className="text-sm text-red-500">
                  {errors.stockpileVolumeKg}
                </p>
              )}
            </div>

            {/* Stockpile Photo Upload */}
            <div className="space-y-2">
              <Label>
                Tài liệu nhập kho <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Tải lên tài liệu nhập kho: Phiếu cân, Ảnh nhập kho, Phiếu nhập kho, Phiếu xuất kho...
              </p>
              <DocumentUpload
                documents={stockpilePhotos}
                onDocumentsChange={(files) => onStockpilePhotosChange?.(files)}
                documentTypes={[
                  { value: "weighing_slip", label: "Phiếu cân" },
                  { value: "warehouse_entry_photo", label: "Ảnh nhập kho" },
                  { value: "warehouse_receipt", label: "Phiếu nhập kho" },
                  { value: "warehouse_issue_slip", label: "Phiếu xuất kho" },
                  { value: "other", label: "Khác" },
                ]}
                disabled={disabled}
                maxSizeMB={10}
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
            Ngày hoàn thành tái chế <span className="text-red-500">*</span>
          </Label>
          <DatePicker
            value={recycledDate}
            onChange={(date: Date | undefined) => {
              if (onRecycledDateChange && date) {
                onRecycledDateChange(date);
              }
              onChange(
                "recycledDate",
                date ? format(date, "yyyy-MM-dd") : null,
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
            Khối lượng đã tái chế (kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="recycledVolumeKg"
            type="number"
            value={formData.recycledVolumeKg || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
          <Label>
            Ảnh sản phẩm đã tái chế <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Tải lên ảnh sản phẩm sau khi tái chế: Biên bản kết quả, Ảnh dầu thành phẩm, Ảnh bùn thải...
          </p>
          <DocumentUpload
            documents={recycledPhotos}
            onDocumentsChange={(files) => onRecycledPhotosChange?.(files)}
            documentTypes={[
              { value: RecycledPhotoSubType.RESULT_REPORT, label: "Biên bản kết quả" },
              { value: RecycledPhotoSubType.SEMI_FINISHED_PRODUCT, label: "Ảnh dầu thành phẩm" },
              { value: RecycledPhotoSubType.SLUDGE_WASTE, label: "Ảnh bùn thải" },
              { value: RecycledPhotoSubType.OTHER, label: "Khác" },
            ]}
            disabled={disabled}
            maxSizeMB={10}
            category={FileType.RECYCLED_PHOTO}
          />
          {errors.recycledPhotos && (
            <p className="text-sm text-red-500">{errors.recycledPhotos}</p>
          )}
        </div>

        {/* Quality Documents Upload */}
        <div className="space-y-2">
          <Label>
            Tải lên tài liệu chất lượng <span className="text-red-500">*</span>
          </Label>
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

        {/* Haz Waste Certificates Upload */}
        <div className="space-y-2">
          <Label>
            Chứng nhận CTNH <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Tải lên chứng nhận CTNH (PDF hoặc PNG, tối đa 3 file)
          </p>
          <DocumentUpload
            documents={hazWasteCertificates}
            onDocumentsChange={handleHazCertChange}
            documentTypes={[
              { value: "haz_waste_certificate", label: "Chứng nhận CTNH" },
            ]}
            disabled={disabled}
            maxSizeMB={10}
            category={FileType.HAZ_WASTE_CERTIFICATE}
          />
          {errors.hazWasteCertificates && (
            <p className="text-sm text-red-500">
              {errors.hazWasteCertificates}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
