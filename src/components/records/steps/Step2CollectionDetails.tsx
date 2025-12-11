"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { CreateDraftFormData } from "@/types/record";
import { DocumentUpload, DocumentFile } from "@/components/records/DocumentUpload";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { LocationService } from "@/lib/services/location.service";

interface Step2CollectionDetailsProps {
  formData: Partial<CreateDraftFormData>;
  errors?: Record<string, string>;
  onChange: (field: keyof CreateDraftFormData, value: any) => void;
  disabled?: boolean;
  collectionDate: Date;
  onCollectionDateChange: (date: Date) => void;
  locationRefId?: string;
  onLocationRefIdChange: (refId: string) => void;
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
  address,
  onAddressChange,
  onFullAddressChange,
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  evidenceFiles = [],
  onEvidenceFilesChange,
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
          <Label htmlFor="deliveryDate">Ngày thu gom</Label>
          <DatePicker
            value={collectionDate}
            onChange={(date: Date | undefined) => {
              if (date) {
                onCollectionDateChange(date);
              }
            }}
            disabled={true}
          />
          <p className="text-xs text-red-500">
            Ngày bị khóa để đảm bảo độ chính xác thông tin, không thể thay đổi
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

        {/* GPS Location & Detailed Collection Address - Two Column Layout */}
        <div className="space-y-4">
          <Label>Vị trí GPS & Địa chỉ thu gom chi tiết</Label>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Map & GPS Coordinates */}
            <div className="space-y-4">
              {/* Map */}
              <div className="space-y-2">
                <Label>Bản đồ</Label>
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 border-2 border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
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
              <div className="space-y-4">
                <LocationAutocomplete
                  value={locationRefId || ""}
                  onSelect={async (result) => {
                    onLocationRefIdChange(result.refId);
                    // Fetch full location details to populate address and coordinates
                    try {
                      const locationDetails = await LocationService.getLocationByRefId(result.refId);
                      // Store the full address string for backend
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
                <div className="grid gap-2">
                  <Label htmlFor="ward">
                    Phường/Xã <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ward"
                    value={address?.ward || ""}
                    onChange={(e) =>
                      onAddressChange?.({ ...address, ward: e.target.value })
                    }
                    placeholder="Phường .."
                    disabled={disabled}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="district">
                    Quận <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="district"
                    value={address?.district || ""}
                    onChange={(e) =>
                      onAddressChange?.({ ...address, district: e.target.value })
                    }
                    placeholder="Quận 1"
                    disabled={disabled}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="province">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="province"
                    value={address?.province || ""}
                    onChange={(e) =>
                      onAddressChange?.({ ...address, province: e.target.value })
                    }
                    placeholder="Thành phố .."
                    disabled={disabled}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Địa chỉ có ở để hiển thị
              </p>
            </div>
          </div>
        </div>

        {/* Evidence Upload */}
        <div className="space-y-2">
          <Label>Tải lên bằng chứng</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Tải lên bằng chứng gồm: Ảnh chụp đầu thải, Biển số xe, Biên bản
            giao nhận, Phiếu cân...
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
          />
        </div>
      </div>
    </div>
  );
}

