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
import {
  DocumentUpload,
  DocumentFile,
} from "@/components/records/DocumentUpload";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { LocationService } from "@/lib/services/location.service";
import { FileType } from "@/types/file-record";
//import { VietMap } from "@/components/ui/vietmap";

interface Step2CollectionDetailsProps {
  formData: Partial<CreateDraftFormData>;
  errors?: Record<string, string>;
  onChange: (field: keyof CreateDraftFormData, value: any) => void;
  disabled?: boolean;
  collectionDate: Date;
  onCollectionDateChange: (date: Date) => void;
  locationRefId?: string;
  onLocationRefIdChange: (refId: string) => void;
  fullAddress?: string; // Full address string to display
  address?: {
    houseNumber?: string;
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  };
  onAddressChange?: (address: any) => void;
  onFullAddressChange?: (address: string) => void;
  latitude?: number;
  longitude?: number;
  onLatitudeChange?: (lat: number) => void;
  onLongitudeChange?: (lng: number) => void;
  evidenceFiles?: DocumentFile[];
  onEvidenceFilesChange?: (files: DocumentFile[]) => void;
  hazTypes?: Array<{
    id: string;
    code: string;
    name?: string;
    haz_code?: string;
  }>;
}

export function Step2CollectionDetails({
  formData,
  errors = {},
  onChange,
  disabled = false,
  collectionDate,
  onCollectionDateChange,
  locationRefId,
  onLocationRefIdChange,
  fullAddress,
  address,
  onAddressChange,
  onFullAddressChange,
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  evidenceFiles = [],
  onEvidenceFilesChange,
  hazTypes = [],
}: Step2CollectionDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Chi tiết Thu gom</h2>
        <p className="text-sm text-muted-foreground">Bước thứ 2 trên 4</p>
      </div>

      <div className="space-y-6">
        {/* Collection Date */}
        <div className="grid gap-2">
          <Label htmlFor="deliveryDate">
            Ngày thu gom <span className="text-red-500">*</span>
          </Label>
          <DatePicker
            value={collectionDate}
            onChange={(date: Date | undefined) => {
              if (date) {
                onCollectionDateChange(date);
              }
            }}
            disabled={disabled}
          />
          <p className="text-xs text-red-500">
            Cảnh báo: Ngày này phải là ngày giao hàng chính xác, nếu không sẽ bị
            Motul từ chối
          </p>
        </div>

        {/* Weight */}
        <div className="grid gap-2">
          <Label htmlFor="collectedVolumeKg">
            Khối lượng (kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="collectedVolumeKg"
            type="number"
            value={formData.collectedVolumeKg || ""}
            onChange={(e) =>
              onChange(
                "collectedVolumeKg",
                e.target.value ? parseFloat(e.target.value) : null,
              )
            }
            placeholder="0"
            disabled={disabled}
            className={errors.collectedVolumeKg ? "border-red-500" : ""}
          />
          {errors.collectedVolumeKg && (
            <p className="text-sm text-red-500">{errors.collectedVolumeKg}</p>
          )}
        </div>

        {/* Vehicle Plate */}
        <div className="grid gap-2">
          <Label htmlFor="vehiclePlate">
            Biển số xe <span className="text-red-500">*</span>
          </Label>
          <Input
            id="vehiclePlate"
            type="text"
            value={formData.vehiclePlate || ""}
            onChange={(e) => onChange("vehiclePlate", e.target.value || null)}
            placeholder="Nhập biển số xe"
            disabled={disabled}
            className={errors.vehiclePlate ? "border-red-500" : ""}
          />
          {errors.vehiclePlate && (
            <p className="text-sm text-red-500">{errors.vehiclePlate}</p>
          )}
        </div>

        {/* HAZ Code */}
        <div className="grid gap-2">
          <Label htmlFor="hazWasteId">
            Mã HAZ <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.hazWasteId ? String(formData.hazWasteId) : "__none__"}
            onValueChange={(value) => {
              const newValue = value === "__none__" ? null : value;
              console.log("HAZ Code dropdown changed:", {
                selectedValue: value,
                newValue,
                currentFormDatahazWasteId: formData.hazWasteId,
              });
              onChange("hazWasteId", newValue);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id="hazWasteId"
              className={errors.hazWasteId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Chọn mã HAZ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Không chọn</SelectItem>
              {hazTypes
                .filter((hazType) => hazType.id && hazType.id.trim() !== "") // Filter out empty IDs
                .map((hazType) => {
                  const hazCode = hazType.haz_code || hazType.code || "";
                  const displayName =
                    hazType.name ||
                    hazType.code ||
                    hazType.haz_code ||
                    "Unknown";
                  const displayText =
                    hazCode && hazCode !== displayName
                      ? `${displayName} (${hazCode})`
                      : displayName;
                  return (
                    <SelectItem key={hazType.id} value={hazType.id}>
                      {displayText}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
          {errors.hazWasteId && (
            <p className="text-sm text-red-500">{errors.hazWasteId}</p>
          )}
        </div>

        {/* Collected Price Per Kg */}
        <div className="grid gap-2">
          <Label htmlFor="collectedPricePerKg">
            Giá thu gom (VNĐ/kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="collectedPricePerKg"
            type="number"
            step="0.01"
            min="0"
            value={formData.collectedPricePerKg || ""}
            onChange={(e) =>
              onChange(
                "collectedPricePerKg",
                e.target.value ? parseFloat(e.target.value) : null,
              )
            }
            placeholder="0.00"
            disabled={disabled}
            className={errors.collectedPricePerKg ? "border-red-500" : ""}
          />
          {errors.collectedPricePerKg && (
            <p className="text-sm text-red-500">{errors.collectedPricePerKg}</p>
          )}
        </div>

        {/* GPS Location & Detailed Collection Address - Two Column Layout */}
        <div className="space-y-4">
          <Label>Vị trí GPS & Địa chỉ thu gom chi tiết</Label>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Map & GPS Coordinates */}
            <div className="space-y-4">
              {/* Map - Temporarily disabled */}
              {/* <div className="space-y-2">
                <Label>Bản đồ</Label>
                {latitude !== undefined && longitude !== undefined ? (
                  <VietMap
                    latitude={latitude}
                    longitude={longitude}
                    zoom={15}
                    height="256px"
                    className="rounded-lg border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Chọn địa chỉ để hiển thị bản đồ
                    </p>
                  </div>
                )}
              </div> */}

              {/* Map placeholder - temporarily disabled */}
              <div className="space-y-2">
                <Label>Bản đồ</Label>
                <div className="w-full h-64 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Bản đồ tạm thời bị vô hiệu hóa
                  </p>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Vĩ độ</Label>
                  <Input
                    value={latitude?.toFixed(6) || "10.8231"}
                    disabled
                    className="font-mono text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Kinh độ</Label>
                  <Input
                    value={longitude?.toFixed(6) || "106.6297"}
                    disabled
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Address */}
            <div className="space-y-4">
              <Label>Địa chỉ thu gom chi tiết</Label>
              <LocationAutocomplete
                value={fullAddress || ""}
                onSelect={async (result) => {
                  onLocationRefIdChange(result.refId);
                  // Fetch full location details to populate address and coordinates
                  try {
                    const locationDetails =
                      await LocationService.getLocationByRefId(result.refId);
                    console.log("Fetched location details:", locationDetails);
                    // Store the full address string for backend and display
                    onFullAddressChange?.(locationDetails.address);
                    onAddressChange?.({
                      ...address,
                      province: locationDetails.city,
                      // Note: district and ward would need to be parsed from address or fetched separately
                    });
                    // Update GPS coordinates if available
                    if (locationDetails.latitude && locationDetails.longitude) {
                      onLatitudeChange?.(locationDetails.latitude);
                      onLongitudeChange?.(locationDetails.longitude);
                    }
                  } catch (error) {
                    console.error("Failed to fetch location details:", error);
                  }
                }}
                label="Số nhà, tên đường"
                placeholder="Tìm hoặc chọn từ danh sách...."
                required
                disabled={disabled}
                error={errors.locationRefId}
              />
            </div>
          </div>
        </div>

        {/* Evidence Upload */}
        <div className="space-y-2">
          <Label>
            Tải lên bằng chứng <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Tải lên bằng chứng gồm: Ảnh chụp đầu thải, Biển số xe, Biên bản giao
            nhận, Phiếu cân...
          </p>
          <DocumentUpload
            documents={evidenceFiles || []}
            onDocumentsChange={(files) => onEvidenceFilesChange?.(files)}
            documentTypes={[
              { value: "phieu-can", label: "Phiếu cân" },
              { value: "bien-ban-giao-nhan", label: "Biên bản giao nhận" },
              { value: "bien-so-xe", label: "Biển số xe" },
              { value: "khac", label: "Khác" },
            ]}
            disabled={disabled}
            maxSizeMB={10}
            category={FileType.EVIDENCE_PHOTO}
            documentTypeToCategory={(docType) => {
              // All evidence document types map to EVIDENCE_PHOTO
              if (
                [
                  "phieu-can",
                  "bien-ban-giao-nhan",
                  "bien-so-xe",
                  "khac",
                ].includes(docType)
              ) {
                return FileType.EVIDENCE_PHOTO;
              }
              return FileType.EVIDENCE_PHOTO;
            }}
          />
        </div>
      </div>
    </div>
  );
}
