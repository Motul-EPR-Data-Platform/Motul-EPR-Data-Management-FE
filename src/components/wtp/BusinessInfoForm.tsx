"use client";

import { parseDate, toDDMMYYYY } from "@/lib/utils/dateHelper";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  completeWtpAdminProfileSchema,
  type CompleteWtpAdminProfileFormData,
} from "@/lib/validations/wtp";
import { AuthService } from "@/lib/services/auth.service";
import { WtpService } from "@/lib/services/wtp.service";
import { CompleteWasteTransferAdminProfileDTO, UpdateWtpProfileDTO } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface BusinessInfoFormProps {
  initialData?: Partial<CompleteWtpAdminProfileFormData>;
  isEditMode?: boolean;
  editable?: boolean; // If false, all inputs are read-only
  onSaveSuccess?: () => void; // Callback when save is successful
  profileId?: string | null; // Profile ID for update operations
}

export function WtpBusinessInfoForm({
  initialData,
  isEditMode = false,
  editable = true,
  onSaveSuccess,
  profileId,
}: BusinessInfoFormProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If not editable, disable all form interactions
  const isFormDisabled = !editable || isLoading;

  // Convert initial data dates from string to Date objects
  const getInitialDate = (fieldName: keyof CompleteWtpAdminProfileFormData): Date | undefined => {
    if (!initialData) return undefined;
    const value = initialData[fieldName];
    return parseDate(value as string | Date | undefined);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CompleteWtpAdminProfileFormData>({
    resolver: zodResolver(completeWtpAdminProfileSchema),
    defaultValues: {
      waste_transfer_name: initialData?.waste_transfer_name || "",
      business_code: initialData?.business_code || "",
      phone: initialData?.phone || "",
      contact_email: initialData?.contact_email || "",
      contact_person: initialData?.contact_person || "",
      contact_phone: initialData?.contact_phone || "",
      env_permit_number: initialData?.env_permit_number || "",
      env_permit_issue_date: getInitialDate("env_permit_issue_date"),
      env_permit_expiry_date: getInitialDate("env_permit_expiry_date"),
    },
  });

  // Reset form when initialData changes (e.g., when profile is loaded)
  useEffect(() => {
    if (initialData) {
      reset({
        waste_transfer_name: initialData.waste_transfer_name || "",
        business_code: initialData.business_code || "",
        phone: initialData.phone || "",
        contact_email: initialData.contact_email || "",
        contact_person: initialData.contact_person || "",
        contact_phone: initialData.contact_phone || "",
        env_permit_number: initialData.env_permit_number || "",
        env_permit_issue_date: getInitialDate("env_permit_issue_date"),
        env_permit_expiry_date: getInitialDate("env_permit_expiry_date"),
      });
    }
  }, [initialData, reset]);

  // Watch date fields to get current values
  const envPermitIssueDate = watch("env_permit_issue_date");
  const envPermitExpiryDate = watch("env_permit_expiry_date");

  const onSubmit = async (data: CompleteWtpAdminProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formatedEnvPermitIssueDate =toDDMMYYYY(data.env_permit_issue_date instanceof Date);
      const formatedEnvPermitExpiryDate = toDDMMYYYY(data.env_permit_expiry_date instanceof Date);
      // If in edit mode and profileId exists, use update endpoint
      if (isEditMode && profileId) {
        const dto: UpdateWtpProfileDTO = {
          wasteTransferName: data.waste_transfer_name,
          phone: data.phone,
          businessCode: data.business_code,
          contactPerson: data.contact_person,
          contactPhone: data.contact_phone,
          contactEmail: data.contact_email,
          envPermitNumber: data.env_permit_number,
          envPermitIssueDate: formatedEnvPermitIssueDate,
          envPermitExpiryDate: formatedEnvPermitExpiryDate,
        };

        await WtpService.updateProfile(profileId, dto);
        setSuccess(true);

        // Call success callback if provided
        if (onSaveSuccess) {
          setTimeout(() => {
            onSaveSuccess();
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {

        // Initial profile completion - this shouldn't happen on business-info page
        // but keeping for compatibility
        const dto: CompleteWasteTransferAdminProfileDTO = {
          waste_transfer_name: data.waste_transfer_name,
          business_code: data.business_code,
          phone: data.phone,
          contact_person: data.contact_person,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          env_permit_number: data.env_permit_number,
          env_permit_issue_date: formatedEnvPermitIssueDate,
          env_permit_expiry_date: formatedEnvPermitExpiryDate,
          location: {
            address: "",
          },
        };

        await AuthService.completeWasteTransferAdminProfile(dto);
        await refreshUser();

        setSuccess(true);

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/wtp");
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Lỗi</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Thành công</p>
            <p className="text-sm text-green-700 mt-1">
              {isEditMode
                ? "Thông tin đã được cập nhật thành công."
                : "Thông tin đã được lưu thành công."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Waste Transfer Name */}
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="waste_transfer_name">
            Tên điểm tiếp nhận chất thải <span className="text-red-500">*</span>
          </Label>
          <Input
            id="waste_transfer_name"
            {...register("waste_transfer_name")}
            disabled={isFormDisabled}
            className={errors.waste_transfer_name ? "border-red-500" : ""}
          />
          {errors.waste_transfer_name && (
            <p className="text-sm text-red-500">
              {errors.waste_transfer_name.message}
            </p>
          )}
        </div>

        {/* Business Code */}
        <div className="grid gap-2">
          <Label htmlFor="business_code">
            Mã số kinh doanh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="business_code"
            {...register("business_code")}
            disabled={isFormDisabled}
            className={errors.business_code ? "border-red-500" : ""}
          />
          {errors.business_code && (
            <p className="text-sm text-red-500">
              {errors.business_code.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="grid gap-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            {...register("phone")}
            disabled={isFormDisabled}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Contact Person */}
        <div className="grid gap-2">
          <Label htmlFor="contact_person">Người liên hệ</Label>
          <Input
            id="contact_person"
            {...register("contact_person")}
            disabled={isFormDisabled}
          />
        </div>

        {/* Contact Phone */}
        <div className="grid gap-2">
          <Label htmlFor="contact_phone">Số điện thoại liên hệ</Label>
          <Input
            id="contact_phone"
            {...register("contact_phone")}
            disabled={isFormDisabled}
            className={errors.contact_phone ? "border-red-500" : ""}
          />
          {errors.contact_phone && (
            <p className="text-sm text-red-500">
              {errors.contact_phone.message}
            </p>
          )}
        </div>

        {/* Contact Email */}
        <div className="grid gap-2">
          <Label htmlFor="contact_email">Email liên hệ</Label>
          <Input
            id="contact_email"
            type="email"
            {...register("contact_email")}
            disabled={isFormDisabled}
            className={errors.contact_email ? "border-red-500" : ""}
          />
          {errors.contact_email && (
            <p className="text-sm text-red-500">
              {errors.contact_email.message}
            </p>
          )}
        </div>

        {/* Environmental Permit Number */}
        <div className="grid gap-2">
          <Label htmlFor="env_permit_number">Số giấy phép môi trường</Label>
          <Input
            id="env_permit_number"
            {...register("env_permit_number")}
            disabled={isFormDisabled}
          />
        </div>

        {/* Environmental Permit Issue Date */}
        <div className="grid gap-2">
          <Label htmlFor="env_permit_issue_date">Ngày cấp giấy phép môi trường</Label>
          <DatePicker
            value={envPermitIssueDate}
            onChange={(date) => setValue("env_permit_issue_date", date)}
            placeholder="Chọn ngày"
            disabled={isFormDisabled}
          />
        </div>

        {/* Environmental Permit Expiry Date */}
        <div className="grid gap-2">
          <Label htmlFor="env_permit_expiry_date">Ngày hết hạn giấy phép môi trường</Label>
          <DatePicker
            value={envPermitExpiryDate}
            onChange={(date) => setValue("env_permit_expiry_date", date)}
            placeholder="Chọn ngày"
            disabled={isFormDisabled}
          />
        </div>
      </div>

      {editable && (
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Đang lưu..."
              : isEditMode
                ? "Cập nhật thông tin"
                : "Lưu thông tin"}
          </Button>
        </div>
      )}
    </form>
  );
}

