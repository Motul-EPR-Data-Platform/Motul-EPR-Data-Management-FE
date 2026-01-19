"use client";

import { Button } from "@/components/ui/button";
import { CreateDraftFormData } from "@/types/record";
import { ChevronDown, ChevronUp, Edit } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Step4ReviewSubmitProps {
  formData: Partial<CreateDraftFormData>;
  onEditStep: (step: number) => void;
  wasteOwnerName?: string;
  contractTypeName?: string;
  wasteSourceName?: string;
  hazCodeName?: string;
  batchName?: string; // Batch name
  collectionDate?: Date;
  fullAddress?: string; // Full address string from location service
  latitude?: number;
  longitude?: number;
  recycledDate?: Date;
  evidenceFilesCount?: number;
  qualityDocumentsCount?: number;
  hasRecycledPhoto?: boolean;
  hasStockpilePhoto?: boolean;
}

interface ReviewSectionProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

function ReviewSection({ title, children, onEdit }: ReviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-red-600 hover:text-red-700"
            >
              <Edit className="w-4 h-4 mr-1" />
              Chỉnh sửa
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      {isExpanded && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

function ReviewField({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">
        {value !== null && value !== undefined ? String(value) : "Not provided"}
      </span>
    </div>
  );
}

export function Step4ReviewSubmit({
  formData,
  onEditStep,
  wasteOwnerName,
  contractTypeName,
  wasteSourceName,
  hazCodeName,
  batchName,
  collectionDate,
  fullAddress,
  latitude,
  longitude,
  recycledDate,
  evidenceFilesCount = 0,
  qualityDocumentsCount = 0,
  hasRecycledPhoto = false,
  hasStockpilePhoto = false,
}: Step4ReviewSubmitProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Xem lại & Gửi</h2>
        <p className="text-sm text-muted-foreground">Bước thứ 4 trên 4</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Vui lòng lại toàn bộ thông tin một cách cẩn thận trước khi gửi. Bạn có
          thể quay lại các bước trước để chỉnh sửa.
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {/* Step 1 Review */}
        <ReviewSection
          title="Thông tin Chủ nguồn thải"
          onEdit={() => onEditStep(1)}
        >
          {batchName && <ReviewField label="Lô hàng" value={batchName} />}
          <ReviewField label="Tên Chủ nguồn thải" value={wasteOwnerName} />
          <ReviewField label="Loại chất thải" value={wasteSourceName} />
          <ReviewField label="Phân loại hợp đồng" value={contractTypeName} />
          {hazCodeName && <ReviewField label="Mã HAZ" value={hazCodeName} />}
        </ReviewSection>

        {/* Step 2 Review */}
        <ReviewSection title="Chi tiết Thu gom" onEdit={() => onEditStep(2)}>
          <ReviewField
            label="Ngày thu gom"
            value={
              collectionDate ? format(collectionDate, "dd/MM/yyyy") : undefined
            }
          />
          <ReviewField
            label="Khối lượng thu gom (kg)"
            value={formData.collectedVolumeKg}
          />
          {formData.collectedPricePerKg && (
            <ReviewField
              label="Giá thu gom (VNĐ/kg)"
              value={formData.collectedPricePerKg.toLocaleString("vi-VN")}
            />
          )}
          <ReviewField label="Biển số xe" value={formData.vehiclePlate} />
          {fullAddress && (
            <ReviewField label="Địa chỉ thu gom" value={fullAddress} />
          )}
          {latitude !== undefined && longitude !== undefined && (
            <ReviewField
              label="Tọa độ GPS"
              value={`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
            />
          )}
          <ReviewField
            label="Bằng chứng đã tải lên"
            value={`${evidenceFilesCount} file(s)`}
          />
        </ReviewSection>

        {/* Step 3 Review */}
        <ReviewSection title="Nhập kho & Tái chế" onEdit={() => onEditStep(3)}>
          <ReviewField
            label="Lưu kho?"
            value={
              formData.stockpiled === true
                ? "Có"
                : formData.stockpiled === false
                  ? "Không"
                  : undefined
            }
          />
          {formData.stockpiled === true && (
            <>
              <ReviewField
                label="Ngày lưu kho"
                value={
                  formData.stockInDate
                    ? format(new Date(formData.stockInDate), "dd/MM/yyyy")
                    : undefined
                }
              />
              <ReviewField
                label="Khối lượng lưu kho (kg)"
                value={formData.stockpileVolumeKg}
              />
              <ReviewField
                label="Ảnh nhập kho"
                value={hasStockpilePhoto ? "Đã tải lên" : "Chưa tải lên"}
              />
            </>
          )}
          <ReviewField
            label="Ngày hoàn thành tái chế"
            value={
              recycledDate ? format(recycledDate, "dd/MM/yyyy") : undefined
            }
          />
          <ReviewField
            label="Khối lượng đã tái chế (kg)"
            value={formData.recycledVolumeKg}
          />
          <ReviewField
            label="Ảnh sản phẩm đã tái chế"
            value={hasRecycledPhoto ? "Đã tải lên" : "Chưa tải lên"}
          />
          {qualityDocumentsCount > 0 && (
            <ReviewField
              label="Tài liệu chất lượng"
              value={`${qualityDocumentsCount} file(s)`}
            />
          )}
        </ReviewSection>
      </div>
    </div>
  );
}
