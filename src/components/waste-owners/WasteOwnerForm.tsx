"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WasteOwnerFormFields } from "./WasteOwnerFormFields";
import { WasteOwnerLocationFields } from "./WasteOwnerLocationFields";
import {
  CreateWasteOwnerDTO,
  UpdateWasteOwnerDTO,
  WasteOwnerWithLocation,
  WasteOwnerType,
} from "@/types/waste-owner";

interface WasteOwnerFormProps {
  // Initial data (for edit/view mode)
  initialData?: WasteOwnerWithLocation | null;
  
  // Mode
  mode: "create" | "edit" | "view";
  
  // Form state
  isLoading?: boolean;
  errors?: Record<string, string>;
  
  // Handlers
  onSubmit?: (data: CreateWasteOwnerDTO | UpdateWasteOwnerDTO) => Promise<void>;
  onCancel?: () => void;
  
  // Submit button text
  submitButtonText?: string;
  showCancelButton?: boolean;
}

export function WasteOwnerForm({
  initialData,
  mode,
  isLoading = false,
  errors = {},
  onSubmit,
  onCancel,
  submitButtonText,
  showCancelButton = true,
}: WasteOwnerFormProps) {
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const [formData, setFormData] = useState<{
    wasteOwnerType: WasteOwnerType;
    name: string;
    businessCode: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    locationRefId?: string;
    fullAddress?: string; // Full address string for display
    isActive?: boolean;
  }>({
    wasteOwnerType: "business",
    name: "",
    businessCode: "",
    contactPerson: "",
    phone: "+84 ",
    email: "",
    locationRefId: "",
    fullAddress: "",
    isActive: true,
  });

  // Initialize form data from initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        wasteOwnerType: initialData.wasteOwnerType,
        name: initialData.name,
        businessCode: initialData.businessCode,
        contactPerson: initialData.contactPerson || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        locationRefId: initialData.location?.refId || "",
        fullAddress: initialData.location?.address || "",
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit || isViewMode) return;

    if (isCreateMode) {
      const createData: CreateWasteOwnerDTO = {
        name: formData.name,
        businessCode: formData.businessCode,
        contactPerson: formData.contactPerson || null,
        phone: formData.phone || null,
        email: formData.email || null,
        wasteOwnerType: formData.wasteOwnerType,
        // TODO: Make location required again after backend implementation is complete
        // Only include location if locationRefId is provided (temporary - location is optional)
        ...(formData.locationRefId && formData.locationRefId.trim()
          ? {
              location: {
                refId: formData.locationRefId,
              },
            }
          : {}),
      };
      await onSubmit(createData);
    } else if (isEditMode) {
      const updateData: UpdateWasteOwnerDTO = {
        name: formData.name,
        contactPerson: formData.contactPerson || null,
        phone: formData.phone || null,
        email: formData.email || null,
        wasteOwnerType: formData.wasteOwnerType,
        isActive: formData.isActive,
        location: formData.locationRefId
          ? { refId: formData.locationRefId }
          : undefined,
      };
      await onSubmit(updateData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">
          Thông tin cơ bản
        </h3>
        <WasteOwnerFormFields
          wasteOwnerType={formData.wasteOwnerType}
          name={formData.name}
          businessCode={formData.businessCode}
          contactPerson={formData.contactPerson || ""}
          phone={formData.phone || ""}
          email={formData.email || ""}
          locationRefId={formData.locationRefId || ''}
          fullAddress={formData.fullAddress || ''}
          isActive={formData.isActive}
          disabled={isViewMode || isLoading}
          errors={errors}
          showTypeSelector={!isViewMode}
          showActiveStatus={isEditMode}
          showId={isViewMode || isEditMode}
          id={initialData?.id}
          onTypeChange={(value) =>
            setFormData((prev) => ({ ...prev, wasteOwnerType: value }))
          }
          onNameChange={(value) =>
            setFormData((prev) => ({ ...prev, name: value }))
          }
          onBusinessCodeChange={(value) =>
            setFormData((prev) => ({ ...prev, businessCode: value }))
          }
          onContactPersonChange={(value) =>
            setFormData((prev) => ({ ...prev, contactPerson: value }))
          }
          onPhoneChange={(value) =>
            setFormData((prev) => ({ ...prev, phone: value }))
          }
          onEmailChange={(value) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
          onLocationRefIdChange={(value) =>
            setFormData((prev) => ({ ...prev, locationRefId: value }))
          }
          onFullAddressChange={(value) =>
            setFormData((prev) => ({ ...prev, fullAddress: value }))
          }
          onActiveChange={(value) =>
            setFormData((prev) => ({ ...prev, isActive: value }))
          }
        />
      </div>


      {/* Location Information Section (read-only, from API) */}
      {isViewMode && initialData?.location && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">
            Địa chỉ
          </h3>
          <WasteOwnerLocationFields location={initialData.location} disabled />
        </div>
      )}

      {/* Status Information (view mode only) */}
      {isViewMode && initialData && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">
            Trạng thái
          </h3>
          <div className="grid gap-4">
            {initialData.createdAt && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ngày tạo</label>
                <input
                  type="text"
                  value={new Date(initialData.createdAt).toLocaleDateString(
                    "vi-VN",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                  disabled
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      {!isViewMode && (
        <div className="flex justify-end gap-2 pt-4">
          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Hủy bỏ
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading
              ? "Đang lưu..."
              : submitButtonText || "Lưu Chủ nguồn thải"}
          </Button>
        </div>
      )}
    </form>
  );
}

