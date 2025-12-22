"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateDraftFormData } from "@/types/record";

interface Step1WasteSourceInfoProps {
  formData: Partial<CreateDraftFormData>;
  errors?: Record<string, string>;
  onChange: (field: keyof CreateDraftFormData, value: any) => void;
  disabled?: boolean;
  wasteOwners?: Array<{ id: string; name: string }>;
  contractTypes?: Array<{ id: string; name: string; code: string }>;
  wasteTypes?: Array<{
    id: string;
    name: string;
    code?: string;
    hazCode?: string;
  }>;
}

export function Step1WasteSourceInfo({
  formData,
  errors = {},
  onChange,
  disabled = false,
  wasteOwners = [],
  contractTypes = [],
  wasteTypes = [],
}: Step1WasteSourceInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Thông tin Chủ nguồn thải</h2>
        <p className="text-sm text-muted-foreground">Bước thứ 1 trên 4</p>
      </div>

      <div className="space-y-4">
        {/* Waste Owner Selection */}
        <div className="grid gap-2">
          <Label htmlFor="wasteOwnerId">
            Tên Chủ nguồn thải <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.wasteOwnerId || ""}
            onValueChange={(value) => onChange("wasteOwnerId", value || null)}
            disabled={disabled}
          >
            <SelectTrigger
              id="wasteOwnerId"
              className={errors.wasteOwnerId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Tìm hoặc chọn từ danh sách...." />
            </SelectTrigger>
            <SelectContent>
              {wasteOwners.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.wasteOwnerId && (
            <p className="text-sm text-red-500">{errors.wasteOwnerId}</p>
          )}
        </div>

        {/* Classification (Contract Type) */}
        <div className="grid gap-2">
          <Label htmlFor="contractTypeId">Phân loại hợp đồng</Label>
          <Select
            value={formData.contractTypeId || ""}
            onValueChange={(value) => onChange("contractTypeId", value || null)}
            disabled={disabled}
          >
            <SelectTrigger id="contractTypeId">
              <SelectValue placeholder="Tìm hoặc chọn từ danh sách...." />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.length > 0 ? (
                contractTypes.map((type) => {
                  // Ensure we have a display name - prefer name, then code, never show ID
                  const displayName = type.name || type.code || "Unknown";
                  const displayCode =
                    type.code && type.name && type.code !== type.name
                      ? ` (${type.code})`
                      : "";

                  return (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {displayName}
                      {displayCode}
                    </SelectItem>
                  );
                })
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                  Không có dữ liệu
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Waste Type Category (Waste Source) */}
        <div className="grid gap-2">
          <Label htmlFor="wasteSourceId">
            Loại chất thải (Nguồn thải) <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.wasteSourceId || ""}
            onValueChange={(value) => onChange("wasteSourceId", value || null)}
            disabled={disabled}
          >
            <SelectTrigger
              id="wasteSourceId"
              className={errors.wasteSourceId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Tìm hoặc chọn từ danh sách...." />
            </SelectTrigger>
            <SelectContent>
              {wasteTypes.length > 0 ? (
                wasteTypes.map((wasteType) => {
                  // Display name with code and hazCode if available
                  const displayName = wasteType.name || "Unknown";
                  const codePart = wasteType.code ? ` (${wasteType.code})` : "";
                  const hazCodePart = wasteType.hazCode
                    ? ` - ${wasteType.hazCode}`
                    : "";

                  return (
                    <SelectItem key={wasteType.id} value={wasteType.id}>
                      {displayName}
                      {codePart}
                      {hazCodePart}
                    </SelectItem>
                  );
                })
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                  Không có dữ liệu
                </div>
              )}
            </SelectContent>
          </Select>
          {errors.wasteSourceId && (
            <p className="text-sm text-red-500">{errors.wasteSourceId}</p>
          )}
        </div>

        {/* Waste Generation Source */}
        <div className="grid gap-2">
          <Label htmlFor="wasteGenerationSource">
            Nguồn phát sinh chất thải
          </Label>
          <Select disabled={disabled}>
            <SelectTrigger id="wasteGenerationSource">
              <SelectValue placeholder="Drop down" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Sản xuất</SelectItem>
              <SelectItem value="service">Dịch vụ</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
