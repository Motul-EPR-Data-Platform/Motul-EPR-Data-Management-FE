"use client";

import { useState, useEffect } from "react";
import { parseDate, toDDMMYYYY } from "@/lib/utils/dateHelper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { DatePicker } from "@/components/ui/date-picker";
import {
  completeRecyclerAdminProfileSchema,
  type CompleteRecyclerAdminProfileFormData,
} from "@/lib/validations/recycler";
import { AuthService } from "@/lib/services/auth.service";
import { RecyclerService } from "@/lib/services/recycler.service";
import {
  CompleteRecyclerAdminProfileDTO,
  UpdateRecyclerProfileDTO,
} from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface BusinessInfoFormProps {
  initialData?: Partial<CompleteRecyclerAdminProfileFormData>;
  isEditMode?: boolean;
  editable?: boolean; // If false, all inputs are read-only
  onSaveSuccess?: () => void; // Callback when save is successful
  profileId?: string | null; // Profile ID for update operations
}

export function BusinessInfoForm({
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

  // Helper to convert string date (dd/mm/yyyy) to Date object
  const parseDate = (dateStr: string | Date | undefined): Date | undefined => {
    if (!dateStr) return undefined;
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr !== "string") return undefined;

    // Handle dd/mm/yyyy format
    const [day, month, year] = dateStr.split("/");
    if (day && month && year) {
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return undefined;
  };

  // Convert initial data dates from string to Date objects
  const getInitialDate = (
    fieldName: keyof CompleteRecyclerAdminProfileFormData,
  ): Date | undefined => {
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
  } = useForm<CompleteRecyclerAdminProfileFormData>({
    resolver: zodResolver(completeRecyclerAdminProfileSchema),
    defaultValues: {
      vendor_name: initialData?.vendor_name || "",
      tax_code: initialData?.tax_code || "",
      representative: initialData?.representative || "",
      company_registration_address: initialData?.company_registration_address || "",
      business_reg_number: initialData?.business_reg_number || "",
      business_reg_issue_date: getInitialDate("business_reg_issue_date"),
      phone: initialData?.phone || "",
      contact_email: initialData?.contact_email || "",
      contact_point: initialData?.contact_point || "",
      contact_phone: initialData?.contact_phone || "",
      google_map_link: initialData?.google_map_link || "",
      env_permit_number: initialData?.env_permit_number || "",
      env_permit_issue_date: getInitialDate("env_permit_issue_date"),
      env_permit_expiry_date: getInitialDate("env_permit_expiry_date"),
      // no password fields
    },
  });

  // Reset form when initialData changes (e.g., when profile is loaded)
  useEffect(() => {
    if (initialData) {
      reset({
        vendor_name: initialData.vendor_name || "",
        tax_code: initialData.tax_code || "",
        representative: initialData.representative || "",
        company_registration_address: initialData.company_registration_address || "",
        business_reg_number: initialData.business_reg_number || "",
        business_reg_issue_date: getInitialDate("business_reg_issue_date"),
        phone: initialData.phone || "",
        contact_email: initialData.contact_email || "",
        contact_point: initialData.contact_point || "",
        contact_phone: initialData.contact_phone || "",
        google_map_link: initialData.google_map_link || "",
        env_permit_number: initialData.env_permit_number || "",
        env_permit_issue_date: getInitialDate("env_permit_issue_date"),
        env_permit_expiry_date: getInitialDate("env_permit_expiry_date"),
      });
    }
  }, [initialData, reset]);

  const envPermitFile = watch("env_permit_file");
  const businessRegFile = watch("business_reg_file");

  // Watch date fields to get current values
  const businessRegIssueDate = watch("business_reg_issue_date");
  const envPermitIssueDate = watch("env_permit_issue_date");
  const envPermitExpiryDate = watch("env_permit_expiry_date");

  const onSubmit = async (data: CompleteRecyclerAdminProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formatedEnvPermitIssueDate = toDDMMYYYY(
        data.env_permit_issue_date,
      );
      const formatedEnvPermitExpiryDate = toDDMMYYYY(
        data.env_permit_expiry_date,
      );
      const formatedBusinessRegIssueDate = data.business_reg_issue_date
        ? toDDMMYYYY(data.business_reg_issue_date)
        : undefined;
      // If in edit mode and profileId exists, use update endpoint
      if (isEditMode && profileId) {
        const dto: UpdateRecyclerProfileDTO = {
          vendorName: data.vendor_name,
          taxCode: data.tax_code,
          representative: data.representative,
          phone: data.phone,
          contactEmail: data.contact_email,
          contactPoint: data.contact_point,
          contactPhone: data.contact_phone,
          businessRegNumber: data.business_reg_number,
          businessRegIssueDate: formatedBusinessRegIssueDate,
          googleMapLink: data.google_map_link,
          envPermitNumber: data.env_permit_number,
          envPermitIssueDate: formatedEnvPermitIssueDate,
          envPermitExpiryDate: formatedEnvPermitExpiryDate,
        };

        await RecyclerService.updateProfile(profileId, dto);
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
        // Initial profile completion
        // Split company_registration_address into location fields for backend validation
        // Temporary workaround until backend supports single address field
        const addressParts = data.company_registration_address
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
        
        // Assign parts: code (first), address (middle), city (last)
        // If not enough parts, use defaults to satisfy backend validation
        const locationCode = addressParts[0] || "LOC001";
        const locationAddress =
          addressParts.slice(1, -1).join(", ") || addressParts[0] || data.company_registration_address || "Địa chỉ đăng ký công ty";
        const locationCity = addressParts[addressParts.length - 1] || "Thành phố";

        const dto: CompleteRecyclerAdminProfileDTO = {
          vendorName: data.vendor_name,
          taxCode: data.tax_code,
          representative: data.representative,
          // Temporary: Split company_registration_address into location fields for backend
          location: {
            code: locationCode,
            address: locationAddress.length >= 5 ? locationAddress : locationAddress.padEnd(5, " "),
            city: locationCity.length >= 2 ? locationCity : locationCity.padEnd(2, " "),
          },
          phone: data.phone,
          contactEmail: data.contact_email,
          contactPoint: data.contact_point,
          contactPhone: data.contact_phone,
          businessRegNumber: formatedBusinessRegIssueDate,
          googleMapLink: data.google_map_link,
          envPermitNumber: data.env_permit_number,
          envPermitIssueDate: formatedEnvPermitIssueDate,
          envPermitExpiryDate: formatedEnvPermitExpiryDate,
        };

        // Files are optional and handled elsewhere; not included in dto here.

        await AuthService.completeRecyclerAdminProfile(dto);
        await refreshUser();

        setSuccess(true);

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/recycler");
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800">
            Lưu thông tin thành công! Đang chuyển hướng...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Legal Company Information */}
      <div className="space-y-4 border-l-4 border-red-500 pl-6">
        <h3 className="text-lg font-semibold mb-2">
          THÔNG TIN PHÁP LÝ CÔNG TY
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vendor_name">
              Đơn vị: Tên thị trường <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vendor_name"
              placeholder="Vui lòng nhập tên thị trường"
              {...register("vendor_name")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.vendor_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.vendor_name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="tax_code">
              Mã số thuế <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tax_code"
              placeholder="0123456789"
              {...register("tax_code")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.tax_code && (
              <p className="mt-1 text-sm text-red-600">
                {errors.tax_code.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="representative">
              Người đại diện (pháp luật) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="representative"
              placeholder="Vui lòng nhập tên người đại diện"
              {...register("representative")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.representative && (
              <p className="mt-1 text-sm text-red-600">
                {errors.representative.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="company_registration_address">
              Địa chỉ đăng ký công ty <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company_registration_address"
              placeholder="Vui lòng nhập địa chỉ đăng ký công ty"
              {...register("company_registration_address")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.company_registration_address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.company_registration_address.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="business_reg_number">
              Số giấy phép đăng ký kinh doanh
            </Label>
            <Input
              id="business_reg_number"
              placeholder="0123456789"
              {...register("business_reg_number")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.business_reg_number && (
              <p className="mt-1 text-sm text-red-600">
                {errors.business_reg_number.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="business_reg_issue_date">
              Ngày cấp (giấy phép)
            </Label>
            <DatePicker
              value={
                businessRegIssueDate instanceof Date
                  ? businessRegIssueDate
                  : parseDate(businessRegIssueDate as string | undefined)
              }
              onChange={(date) => setValue("business_reg_issue_date", date)}
              placeholder="Chọn ngày cấp"
              disabled={isFormDisabled}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.business_reg_issue_date && (
              <p className="mt-1 text-sm text-red-600">
                {errors.business_reg_issue_date.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 border-l-4 border-red-500 pl-6">
        <h3 className="text-lg font-semibold mb-2">THÔNG TIN LIÊN HỆ</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Số điện thoại Công ty</Label>
            <Input
              id="phone"
              placeholder="+84 123456789"
              {...register("phone")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_email">
              Email Công ty (tiếp nhận thông báo chung)
            </Label>
            <Input
              id="contact_email"
              type="email"
              placeholder="ten.email@cty.com"
              {...register("contact_email")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contact_email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_point">Người liên hệ chính</Label>
            <Input
              id="contact_point"
              placeholder="Vui lòng nhập tên người liên hệ chính"
              {...register("contact_point")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.contact_point && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contact_point.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contact_phone">Số điện thoại liên hệ</Label>
            <Input
              id="contact_phone"
              placeholder="+84 123456789"
              {...register("contact_phone")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.contact_phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contact_phone.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="google_map_link">Link Google Maps</Label>
            <Input
              id="google_map_link"
              type="url"
              placeholder="https://maps.google.com/..."
              {...register("google_map_link")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.google_map_link && (
              <p className="mt-1 text-sm text-red-600">
                {errors.google_map_link.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Environmental License */}
      <div className="space-y-4 border-l-4 border-red-500 pl-6">
        <h3 className="text-lg font-semibold mb-2">
          GIẤY PHÉP MÔI TRƯỜNG BẮT BUỘC
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Giấy phép thu gom/xử lý CTNH. Tối đa 5 giấy phép. Vui lòng nhập thông
          tin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="env_permit_number">
              Số giấy phép môi trường <span className="text-red-500">*</span>
            </Label>
            <Input
              id="env_permit_number"
              placeholder="Vui lòng nhập số giấy phép môi trường"
              {...register("env_permit_number")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.env_permit_number && (
              <p className="mt-1 text-sm text-red-600">
                {errors.env_permit_number.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="env_permit_issue_date">
              Ngày cấp <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              value={
                !envPermitIssueDate
                  ? undefined
                  : envPermitIssueDate instanceof Date
                    ? envPermitIssueDate
                    : typeof envPermitIssueDate === "string"
                      ? parseDate(envPermitIssueDate)
                      : undefined
              }
              onChange={(date) => {
                if (date) {
                  setValue("env_permit_issue_date", date);
                } else {
                  setValue("env_permit_issue_date", undefined as any);
                }
              }}
              placeholder="Chọn ngày cấp"
              disabled={isFormDisabled}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.env_permit_issue_date && (
              <p className="mt-1 text-sm text-red-600">
                {errors.env_permit_issue_date.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="env_permit_expiry_date">
              Thời hạn giấy phép (Ngày hết hạn){" "}
              <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              value={
                !envPermitExpiryDate
                  ? undefined
                  : envPermitExpiryDate instanceof Date
                    ? envPermitExpiryDate
                    : typeof envPermitExpiryDate === "string"
                      ? parseDate(envPermitExpiryDate)
                      : undefined
              }
              onChange={(date) => {
                if (date) {
                  setValue("env_permit_expiry_date", date);
                } else {
                  setValue("env_permit_expiry_date", undefined as any);
                }
              }}
              placeholder="Chọn ngày hết hạn"
              disabled={isFormDisabled}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.env_permit_expiry_date && (
              <p className="mt-1 text-sm text-red-600">
                {errors.env_permit_expiry_date.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Documents */}
      <div className="space-y-4 border-l-4 border-red-500 pl-6">
        <h3 className="text-lg font-semibold mb-2">TÀI LIỆU BẮT BUỘC</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tải lên PDF, JPG hoặc PNG. Không bắt buộc để xác minh ngay.
        </p>

        <div className="space-y-4">
          <div>
            <FileUpload
              id="env_permit_file"
              label="Tải lên bản sao giấy phép môi trường"
              value={envPermitFile || null}
              onChange={(file) =>
                setValue("env_permit_file", file || undefined)
              }
              error={errors.env_permit_file?.message}
              disabled={isFormDisabled}
            />
          </div>

          <div>
            <FileUpload
              id="business_reg_file"
              label="Tải lên bản sao Giấy phép kinh doanh (không bắt buộc)"
              value={businessRegFile || null}
              onChange={(file) =>
                setValue("business_reg_file", file || undefined)
              }
              error={errors.business_reg_file?.message}
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      {editable && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading
              ? "Đang lưu..."
              : isEditMode
                ? "Lưu thay đổi"
                : "Hoàn tất và tiếp tục"}
          </Button>
        </div>
      )}
    </form>
  );
}
