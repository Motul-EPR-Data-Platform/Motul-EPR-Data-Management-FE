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
import { getBusinessCodeLabel, getNameLabel, getWasteOwnerTypeLabel, getWasteOwnerTypeBadgeVariant } from "./wasteOwnerUtils";

interface WasteOwnerFormFieldsProps {
  // Form data
  wasteOwnerType: WasteOwnerType;
  name: string;
  businessCode: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  locationRefId?: string;
  isActive?: boolean;
  
  // Form state
  disabled?: boolean;
  errors?: Record<string, string>;
  showTypeSelector?: boolean;
  showActiveStatus?: boolean;
  showId?: boolean;
  id?: string;
  
  // Handlers
  onTypeChange?: (value: WasteOwnerType) => void;
  onNameChange?: (value: string) => void;
  onBusinessCodeChange?: (value: string) => void;
  onContactPersonChange?: (value: string) => void;
  onPhoneChange?: (value: string) => void;
  onEmailChange?: (value: string) => void;
  onLocationRefIdChange?: (value: string) => void;
  onActiveChange?: (value: boolean) => void;
}

export function WasteOwnerFormFields({
  wasteOwnerType,
  name,
  businessCode,
  contactPerson,
  phone,
  email,
  locationRefId,
  isActive,
  disabled = false,
  errors = {},
  showTypeSelector = true,
  showActiveStatus = false,
  showId = false,
  id,
  onTypeChange,
  onNameChange,
  onBusinessCodeChange,
  onContactPersonChange,
  onPhoneChange,
  onEmailChange,
  onLocationRefIdChange,
  onActiveChange,
}: WasteOwnerFormFieldsProps) {
  return (
    <div className="grid gap-4">
      {/* ID Field (for view/edit mode) */}
      {showId && id && (
        <div className="grid gap-2">
          <Label>ID</Label>
          <Input value={id} disabled className="font-mono" />
        </div>
      )}

      {/* Type Selector */}
      {showTypeSelector && onTypeChange ? (
        <div className="grid gap-2">
          <Label htmlFor="wasteOwnerType">Loại *</Label>
          <Select
            value={wasteOwnerType}
            onValueChange={(value) => onTypeChange(value as WasteOwnerType)}
            required
            disabled={disabled}
          >
            <SelectTrigger id="wasteOwnerType">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Doanh nghiệp (DN)</SelectItem>
              <SelectItem value="individual">Cá nhân (CN)</SelectItem>
              <SelectItem value="organization">Tổ chức (TC)</SelectItem>
            </SelectContent>
          </Select>
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
          value={name}
          onChange={(e) => onNameChange?.(e.target.value)}
          required
          disabled={disabled}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Business Code / CCCD Field */}
      <div className="grid gap-2">
        <Label htmlFor="businessCode">{getBusinessCodeLabel(wasteOwnerType)}</Label>
        <Input
          id="businessCode"
          placeholder={
            wasteOwnerType === "individual" ? "001122334455" : "0123456789"
          }
          value={businessCode}
          onChange={(e) => onBusinessCodeChange?.(e.target.value)}
          required={!disabled}
          disabled={disabled}
          className={errors.businessCode ? "border-red-500" : ""}
        />
        {errors.businessCode && (
          <p className="text-sm text-red-500">{errors.businessCode}</p>
        )}
      </div>

      {/* Location Field */}
      <div className="grid gap-2">
        {/* TODO: Make location required again after backend implementation is complete */}
        <Label htmlFor="locationRefId">Địa chỉ chi tiết</Label>
        <Input
          id="locationRefId"
          placeholder="Số nhà, tên đường, Phường/Xã, Tỉnh/Thành phố..."
          value={locationRefId || ""}
          onChange={(e) => onLocationRefIdChange?.(e.target.value)}
          disabled={disabled}
          className={errors.locationRefId ? "border-red-500" : ""}
        />
        {errors.locationRefId && (
          <p className="text-sm text-red-500">{errors.locationRefId}</p>
        )}
      </div>

      {/* Contact Person Field */}
      <div className="grid gap-2">
        <Label htmlFor="contactPerson">Người liên hệ *</Label>
        <Input
          id="contactPerson"
          value={contactPerson || ""}
          onChange={(e) => onContactPersonChange?.(e.target.value)}
          required
          disabled={disabled}
          className={errors.contactPerson ? "border-red-500" : ""}
        />
        {errors.contactPerson && (
          <p className="text-sm text-red-500">{errors.contactPerson}</p>
        )}
      </div>

      {/* Phone Field */}
      <div className="grid gap-2">
        <Label htmlFor="phone">Số điện thoại *</Label>
        <Input
          id="phone"
          value={phone || ""}
          onChange={(e) => onPhoneChange?.(e.target.value)}
          required
          disabled={disabled}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      {/* Email Field */}
      <div className="grid gap-2">
        <Label htmlFor="email">Địa chỉ Email *</Label>
        <Input
          id="email"
          type="email"
          value={email || ""}
          onChange={(e) => onEmailChange?.(e.target.value)}
          required
          disabled={disabled}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Active Status (for edit mode) */}
      {showActiveStatus && onActiveChange && (
        <div className="grid gap-2">
          <Label htmlFor="isActive">Trạng thái</Label>
          <Select
            value={isActive ? "active" : "inactive"}
            onValueChange={(value) => onActiveChange(value === "active")}
            disabled={disabled}
          >
            <SelectTrigger id="isActive">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

