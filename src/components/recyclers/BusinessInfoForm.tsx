"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import {
  completeRecyclerAdminProfileSchema,
  type CompleteRecyclerAdminProfileFormData,
} from "@/lib/validations/recycler";
import { AuthService } from "@/lib/services/auth.service";
import { CompleteRecyclerAdminProfileDTO } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// dd/mm/yyyy -> yyyy-mm-dd
function convertDateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

interface BusinessInfoFormProps {
  initialData?: Partial<CompleteRecyclerAdminProfileFormData>;
  isEditMode?: boolean;
  editable?: boolean; // If false, all inputs are read-only
}

export function BusinessInfoForm({
  initialData,
  isEditMode = false,
  editable = true,
}: BusinessInfoFormProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // If not editable, disable all form interactions
  const isFormDisabled = !editable || isLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CompleteRecyclerAdminProfileFormData>({
    resolver: zodResolver(completeRecyclerAdminProfileSchema),
    defaultValues: initialData || {
      vendor_name: "",
      tax_code: "",
      representative: "",
      location: {
        address: "",
        city: "",
      },
      business_reg_number: "",
      business_reg_issue_date: "",
      phone: "",
      contact_email: "",
      contact_point: "",
      contact_phone: "",
      google_map_link: "",
      env_permit_number: "",
      env_permit_issue_date: "",
      env_permit_expiry_date: "",
      // no password fields
    },
  });

  const envPermitFile = watch("env_permit_file");
  const businessRegFile = watch("business_reg_file");

  const onSubmit = async (data: CompleteRecyclerAdminProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const dto: CompleteRecyclerAdminProfileDTO = {
        vendor_name: data.vendor_name,
        tax_code: data.tax_code,
        representative: data.representative,
        location: {
          address: data.location.address,
          city: data.location.city,
          code: data.location.code,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        },
        phone: data.phone,
        contact_email: data.contact_email,
        contact_point: data.contact_point,
        contact_phone: data.contact_phone,
        google_map_link: data.google_map_link,
        business_reg_number: data.business_reg_number,
        env_permit_number: data.env_permit_number,
        env_permit_issue_date: data.env_permit_issue_date
          ? convertDateToISO(data.env_permit_issue_date)
          : undefined,
        env_permit_expiry_date: data.env_permit_expiry_date
          ? convertDateToISO(data.env_permit_expiry_date)
          : undefined,
        // Note: business_reg_issue_date is not in the DTO, so we skip it
      };

      // Files are optional and handled elsewhere; not included in dto here.

      await AuthService.completeRecyclerAdminProfile(dto);
      await refreshUser();

      setSuccess(true);
      
      // If in edit mode, reload page after showing success message
      // This will exit edit mode and show updated data
      if (isEditMode) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // If not in edit mode, redirect to dashboard
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
        <h3 className="text-lg font-semibold mb-2">THÔNG TIN PHÁP LÝ CÔNG TY</h3>

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
            <Label htmlFor="location.address">
              Địa chỉ trụ sở chính <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location.address"
              placeholder="Vui lòng nhập địa chỉ trụ sở chính"
              {...register("location.address")}
              disabled={isFormDisabled}
              readOnly={!editable}
              className={!editable ? "bg-muted cursor-not-allowed" : ""}
            />
            {errors.location?.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.location.address.message}
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
            <Label htmlFor="business_reg_issue_date">Ngày cấp (giấy phép)</Label>
            <Input
              id="business_reg_issue_date"
              placeholder="dd/mm/yyyy"
              {...register("business_reg_issue_date")}
              disabled={isFormDisabled}
              readOnly={!editable}
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
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
          Giấy phép thu gom/xử lý CTNH. Tối đa 5 giấy phép. Vui lòng nhập thông tin.
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
            <Input
              id="env_permit_issue_date"
              placeholder="dd/mm/yyyy"
              {...register("env_permit_issue_date")}
              disabled={isFormDisabled}
              readOnly={!editable}
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
            <Input
              id="env_permit_expiry_date"
              placeholder="dd/mm/yyyy"
              {...register("env_permit_expiry_date")}
              disabled={isFormDisabled}
              readOnly={!editable}
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
              onChange={(file) => setValue("env_permit_file", file || undefined)}
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
            {isLoading ? "Đang lưu..." : isEditMode ? "Lưu thay đổi" : "Hoàn tất và tiếp tục"}
          </Button>
        </div>
      )}
    </form>
  );
}
