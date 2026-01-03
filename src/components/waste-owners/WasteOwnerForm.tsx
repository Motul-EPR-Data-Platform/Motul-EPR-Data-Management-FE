"use client";

import { useEffect } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { WasteOwnerFormFields } from "./WasteOwnerFormFields";
import { WasteOwnerLocationFields } from "./WasteOwnerLocationFields";
import {
  CreateWasteOwnerDTO,
  UpdateWasteOwnerDTO,
  WasteOwnerWithLocation,
  WasteOwnerType,
} from "@/types/waste-owner";
import {
  createWasteOwnerSchema,
  updateWasteOwnerSchema,
  type CreateWasteOwnerValidationData,
  type UpdateWasteOwnerValidationData,
} from "@/lib/validations/waste-owner";

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
  errors: externalErrors = {},
  onSubmit,
  onCancel,
  submitButtonText,
  showCancelButton = true,
}: WasteOwnerFormProps) {
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Determine which schema to use based on mode
  const schema = isCreateMode
    ? createWasteOwnerSchema
    : updateWasteOwnerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setValue,
    watch,
    reset,
  } = useForm<CreateWasteOwnerValidationData | UpdateWasteOwnerValidationData>(
    {
      resolver: zodResolver(schema),
      defaultValues: {
        wasteOwnerType: initialData?.wasteOwnerType || "business",
        name: initialData?.name || "",
        businessCode: initialData?.businessCode || "",
        contactPerson: initialData?.contactPerson || "",
        phone: initialData?.phone || "+84 ",
        email: initialData?.email || "",
        ...(isEditMode && { isActive: initialData?.isActive ?? true }),
      },
    },
  );

  // Watch form values
  const wasteOwnerType = (watch("wasteOwnerType") ||
    "business") as WasteOwnerType;
  const name = watch("name") || "";
  const businessCode = watch("businessCode") || "";
  const contactPerson = watch("contactPerson");
  const phone = watch("phone");
  const email = watch("email");
  const isActive =
    isEditMode && "isActive" in watch()
      ? (watch("isActive" as any) as boolean | undefined)
      : undefined;
  const [locationRefId, setLocationRefId] = React.useState<string>("");
  const [fullAddress, setFullAddress] = React.useState<string>("");

  // Initialize form data from initialData
  useEffect(() => {
    if (initialData) {
      reset({
        wasteOwnerType: initialData.wasteOwnerType || "business",
        name: initialData.name,
        businessCode: initialData.businessCode,
        contactPerson: initialData.contactPerson || "",
        phone: initialData.phone || "+84 ",
        email: initialData.email || "",
        ...(isEditMode && { isActive: initialData.isActive }),
      });
      setLocationRefId(initialData.location?.refId || "");
      setFullAddress(initialData.location?.address || "");
    } else if (isCreateMode) {
      // Reset to defaults for create mode
      reset({
        wasteOwnerType: "business",
        name: "",
        businessCode: "",
        contactPerson: "",
        phone: "+84 ",
        email: "",
      });
      setLocationRefId("");
      setFullAddress("");
    }
  }, [initialData, isCreateMode, isEditMode, reset]);

  // Merge form errors with external errors
  const errors = { ...formErrors, ...externalErrors };

  const onSubmitForm = async (
    data: CreateWasteOwnerValidationData | UpdateWasteOwnerValidationData,
  ) => {
    if (!onSubmit || isViewMode) return;

    if (isCreateMode && "name" in data && "businessCode" in data) {
      const createData = data as CreateWasteOwnerValidationData;
      const submitData: CreateWasteOwnerDTO = {
        name: createData.name,
        businessCode: createData.businessCode,
        contactPerson: createData.contactPerson || null,
        phone: createData.phone || null,
        email: createData.email || null,
        wasteOwnerType: createData.wasteOwnerType,
        // Only include location if locationRefId is provided
        ...(locationRefId && locationRefId.trim()
          ? {
              location: {
                refId: locationRefId,
              },
            }
          : {}),
      };
      await onSubmit(submitData);
    } else if (isEditMode) {
      const updateData: UpdateWasteOwnerDTO = {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.businessCode !== undefined && {
          businessCode: data.businessCode,
        }),
        ...(data.contactPerson !== undefined && {
          contactPerson: data.contactPerson || null,
        }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.wasteOwnerType !== undefined && {
          wasteOwnerType: data.wasteOwnerType,
        }),
        ...("isActive" in data &&
          data.isActive !== undefined && { isActive: data.isActive }),
        ...(locationRefId && { location: { refId: locationRefId } }),
      };
      await onSubmit(updateData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">
          Thông tin cơ bản
        </h3>
        <WasteOwnerFormFields
          register={register}
          setValue={setValue}
          watch={watch}
          wasteOwnerType={wasteOwnerType}
          name={name}
          businessCode={businessCode}
          contactPerson={contactPerson || ""}
          phone={phone || ""}
          email={email || ""}
          locationRefId={locationRefId}
          fullAddress={fullAddress}
          isActive={isActive}
          disabled={isViewMode || isLoading}
          errors={errors}
          showTypeSelector={!isViewMode}
          showActiveStatus={isEditMode}
          showId={isViewMode || isEditMode}
          id={initialData?.id}
          onLocationRefIdChange={(value) => setLocationRefId(value)}
          onFullAddressChange={(value) => setFullAddress(value)}
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
