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
import { CreateDraftDTO } from "@/types/record";

interface Step1WasteSourceInfoProps {
  formData: Partial<CreateDraftDTO>;
  errors?: Record<string, string>;
  onChange: (field: keyof CreateDraftDTO, value: any) => void;
  disabled?: boolean;
  wasteOwners?: Array<{ id: string; name: string }>;
  contractTypes?: Array<{ id: string; name: string; code: string }>;
  wasteSources?: Array<{ id: string; name: string }>;
}

export function Step1WasteSourceInfo({
  formData,
  errors = {},
  onChange,
  disabled = false,
  wasteOwners = [],
  contractTypes = [],
  wasteSources = [],
}: Step1WasteSourceInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          Thông tin Chủ nguồn thải
        </h2>
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
          <Label htmlFor="contractTypeId">Phân loại</Label>
          <Select
            value={formData.contractTypeId || ""}
            onValueChange={(value) =>
              onChange("contractTypeId", value || null)
            }
            disabled={disabled}
          >
            <SelectTrigger id="contractTypeId">
              <SelectValue placeholder="Dropdown: HĐXL, HĐLK, TG-CG" />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name} ({type.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hazardous Waste Code */}
        <div className="grid gap-2">
          <Label htmlFor="wasteSourceId">
            Mã chất thải nguy hại (Mã CTNH)
          </Label>
          <Select
            value={formData.wasteSourceId || ""}
            onValueChange={(value) =>
              onChange("wasteSourceId", value || null)
            }
            disabled={disabled}
          >
            <SelectTrigger id="wasteSourceId">
              <SelectValue placeholder="Dropdown" />
            </SelectTrigger>
            <SelectContent>
              {wasteSources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

