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
import { Badge } from "@/components/ui/badge";
import { WasteOwnerType } from "@/types/waste-owner";
import {
  getBusinessCodeLabel,
  getNameLabel,
  getWasteOwnerTypeLabel,
  getWasteOwnerTypeBadgeVariant,
} from "./wasteOwnerUtils";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { LocationService } from "@/lib/services/location.service";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import {
  CreateWasteOwnerValidationData,
  UpdateWasteOwnerValidationData,
} from "@/lib/validations/waste-owner";

interface WasteOwnerFormFieldsProps {
  // React Hook Form props
  register: UseFormRegister<
    CreateWasteOwnerValidationData | UpdateWasteOwnerValidationData
  >;
  setValue: UseFormSetValue<
    CreateWasteOwnerValidationData | UpdateWasteOwnerValidationData
  >;
  watch: UseFormWatch<
    CreateWasteOwnerValidationData | UpdateWasteOwnerValidationData
  >;

  // Form data (from watch)
  wasteOwnerType: WasteOwnerType;
  name: string;
  businessCode: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  locationRefId?: string;
  fullAddress?: string; // Full address string to display
  isActive?: boolean;

  // Form state
  disabled?: boolean;
  errors?: FieldErrors<
    CreateWasteOwnerValidationData | UpdateWasteOwnerValidationData
  >;
  showTypeSelector?: boolean;
  showActiveStatus?: boolean;

  // Location handlers (not in schema, handled separately)
  onLocationRefIdChange?: (value: string) => void;
  onFullAddressChange?: (value: string) => void;
}

export function WasteOwnerFormFields({
  register,
  setValue,
  watch,
  wasteOwnerType,
  name,
  businessCode,
  contactPerson,
  phone,
  email,
  locationRefId,
  fullAddress,
  isActive,
  disabled = false,
  errors = {},
  showTypeSelector = true,
  showActiveStatus = false,
  onLocationRefIdChange,
  onFullAddressChange,
}: WasteOwnerFormFieldsProps) {
  return (
    <div className="grid gap-4">
      {/* Type Selector */}
      {showTypeSelector ? (
        <div className="grid gap-2">
          <Label htmlFor="wasteOwnerType">Loại *</Label>
          <Select
            key={`waste-owner-type-${wasteOwnerType}`} // Force re-render when type changes
            value={wasteOwnerType || "business"}
            onValueChange={(value) =>
              setValue("wasteOwnerType", value as WasteOwnerType, {
                shouldValidate: true,
              })
            }
            required
            disabled={disabled}
          >
            <SelectTrigger
              id="wasteOwnerType"
              className={errors.wasteOwnerType ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Doanh nghiệp (DN)</SelectItem>
              <SelectItem value="individual">Cá nhân (CN)</SelectItem>
              <SelectItem value="organization">Hộ kinh doanh (HKD)</SelectItem>
            </SelectContent>
          </Select>
          {errors.wasteOwnerType && (
            <p className="text-sm text-red-500">
              {errors.wasteOwnerType.message}
            </p>
          )}
        </div>
      ) : (
        // Type Display (read-only)
        <div className="grid gap-2">
          <Label>Loại *</Label>
          <div>
            <Badge variant={getWasteOwnerTypeBadgeVariant(wasteOwnerType)}>
              {getWasteOwnerTypeLabel(wasteOwnerType)}
            </Badge>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div className="grid gap-2">
        <Label htmlFor="name">{getNameLabel(wasteOwnerType)}</Label>
        <Input
          id="name"
          placeholder="VD..."
          {...register("name")}
          required
          disabled={disabled}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Business Code / CCCD Field */}
      <div className="grid gap-2">
        <Label htmlFor="businessCode">
          {getBusinessCodeLabel(wasteOwnerType)}
        </Label>
        <Input
          id="businessCode"
          placeholder={
            wasteOwnerType === "individual" ? "001122334455" : "0123456789"
          }
          {...register("businessCode")}
          required={!disabled}
          disabled={disabled}
          className={errors.businessCode ? "border-red-500" : ""}
        />
        {errors.businessCode && (
          <p className="text-sm text-red-500">
            {errors.businessCode.message}
          </p>
        )}
      </div>

      {/* Location Field */}
      <div className="grid gap-2">
        <LocationAutocomplete
          value={fullAddress || ""}
          onSelect={async (result) => {
            onLocationRefIdChange?.(result.refId);
            // Fetch full location details to populate address
            try {
              const locationDetails = await LocationService.getLocationByRefId(
                result.refId,
              );
              // Store the full address string for display
              onFullAddressChange?.(locationDetails.address);
            } catch (error) {
              console.error("Failed to fetch location details:", error);
              // Still set the display address from the result
              onFullAddressChange?.(result.address);
            }
          }}
          label="Địa chỉ chi tiết"
          placeholder="Tìm hoặc chọn từ danh sách...."
          required={!disabled}
          disabled={disabled}
          error={(errors.location as any)?.refId?.message}
        />
        {/* Hidden input for form validation */}
        <input
          type="hidden"
          name="locationRefId"
          value={locationRefId || ""}
          required={!disabled}
        />
        {(errors.location as any) && (
          <p className="text-sm text-red-500">
            {(errors.location as any).refId?.message ||
              (errors.location as any).message}
          </p>
        )}
      </div>

      {/* Contact Person Field */}
      <div className="grid gap-2">
        <Label htmlFor="contactPerson">Người liên hệ *</Label>
        <Input
          id="contactPerson"
          {...register("contactPerson")}
          required
          disabled={disabled}
          className={errors.contactPerson ? "border-red-500" : ""}
        />
        {errors.contactPerson && (
          <p className="text-sm text-red-500">
            {errors.contactPerson.message}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div className="grid gap-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          {...register("phone")}
          disabled={disabled}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="grid gap-2">
        <Label htmlFor="email">Địa chỉ Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          disabled={disabled}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Active Status (for edit mode) */}
      {showActiveStatus && (
        <div className="grid gap-2">
          <Label htmlFor="isActive">Trạng thái</Label>
          <Select
            value={isActive ? "active" : "inactive"}
            onValueChange={(value) =>
              setValue("isActive" as any, value === "active", {
                shouldValidate: true,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="isActive"
              className={(errors as any).isActive ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
          {(errors as any).isActive && (
            <p className="text-sm text-red-500">
              {(errors as any).isActive.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
