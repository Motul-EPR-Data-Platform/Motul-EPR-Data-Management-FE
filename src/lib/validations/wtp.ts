import { z } from "zod";

// Date validation helper - accepts Date object or dd/mm/yyyy string
const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
const dateValidation = z
  .union([
    z.date(),
    z.string().regex(dateRegex, "Ngày phải có định dạng dd/mm/yyyy"),
  ])
  .optional();

// Phone number validation (Vietnamese format)
const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
const phoneValidation = z
  .string()
  .regex(phoneRegex, "Số điện thoại không hợp lệ")
  .optional();

// Email validation
const emailValidation = z.string().email("Email không hợp lệ").optional();

// Complete WTP admin profile schema
export const completeWtpAdminProfileSchema = z.object({
  // Legal company information
  waste_transfer_name: z
    .string()
    .min(1, "Tên điểm tiếp nhận chất thải là bắt buộc"),
  business_code: z.string().min(1, "Mã số kinh doanh là bắt buộc"),
  company_registration_address: z.string().min(1, "Địa chỉ đăng ký công ty là bắt buộc"),

  // Contact information
  phone: phoneValidation,
  contact_email: emailValidation,
  contact_person: z.string().optional(),
  contact_phone: phoneValidation,

  // Environmental permit (optional)
  env_permit_number: z.string().optional(),
  env_permit_issue_date: dateValidation,
  env_permit_expiry_date: dateValidation,
});

export type CompleteWtpAdminProfileFormData = z.infer<
  typeof completeWtpAdminProfileSchema
>;
