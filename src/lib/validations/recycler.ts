import { z } from "zod";

// Date validation helper (dd/mm/yyyy format)
const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
const dateValidation = z.string().regex(dateRegex, "Ngày phải có định dạng dd/mm/yyyy");

// Phone number validation (Vietnamese format)
const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
const phoneValidation = z.string().regex(phoneRegex, "Số điện thoại không hợp lệ").optional();

// Email validation
const emailValidation = z.string().email("Email không hợp lệ").optional();

// File upload validation
const fileValidation = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => !file || file.size <= 10 * 1024 * 1024,
    "Kích thước file tối đa 10MB"
  )
  .refine(
    (file) =>
      !file ||
      ["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(
        file.type
      ),
    "Chỉ chấp nhận file PDF, JPG, PNG"
  );

// Location schema
const locationSchema = z.object({
  code: z.string().optional(),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Environmental permit schema
// const envPermitSchema = z.object({
//   env_permit_number: z.string().min(1, "Số giấy phép môi trường là bắt buộc"),
//   env_permit_issue_date: z.string().regex(dateRegex, "Ngày cấp phải có định dạng dd/mm/yyyy"),
//   env_permit_expiry_date: z.string().regex(dateRegex, "Ngày hết hạn phải có định dạng dd/mm/yyyy"),
//   env_permit_file: fileValidation,
// });

// Complete recycler admin profile schema
export const completeRecyclerAdminProfileSchema = z
  .object({
    // Legal company information
    vendor_name: z.string().min(1, "Tên thị trường là bắt buộc"),
    tax_code: z.string().min(1, "Mã số thuế là bắt buộc"),
    representative: z.string().min(1, "Người đại diện pháp luật là bắt buộc"),
    location: locationSchema,
    business_reg_number: z.string().optional(),
    business_reg_issue_date: dateValidation.optional(),
    business_reg_file: fileValidation,
    
    // Contact information
    phone: phoneValidation,
    contact_email: emailValidation,
    contact_point: z.string().optional(),
    contact_phone: phoneValidation,
    google_map_link: z.string().url("URL Google Maps không hợp lệ").optional(),
    
    // Environmental permit (mandatory)
    env_permit_number: z.string().min(1, "Số giấy phép môi trường là bắt buộc"),
    env_permit_issue_date: z.string().regex(dateRegex, "Ngày cấp phải có định dạng dd/mm/yyyy"),
    env_permit_expiry_date: z.string().regex(dateRegex, "Ngày hết hạn phải có định dạng dd/mm/yyyy"),
    env_permit_file: fileValidation,
    
  })

export type CompleteRecyclerAdminProfileFormData = z.infer<
  typeof completeRecyclerAdminProfileSchema
>;

