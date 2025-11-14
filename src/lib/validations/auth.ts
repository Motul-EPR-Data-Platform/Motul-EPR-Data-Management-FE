import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerInviteSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ và tên tối thiểu 2 ký tự")
      .max(120, "Họ và tên tối đa 120 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .max(128, "Mật khẩu tối đa 128 ký tự"),
    confirmPassword: z.string({}).min(1, "Xác nhận mật khẩu là bắt buộc"),
    accessToken: z.string().min(1, "Thiếu mã lời mời"),
    targetRole: z.enum([
      "motul_admin",
      "motul_reviewer",
      "recycler_admin",
      "recycler",
      "waste_transfer_admin",
      "waste_transfer",
    ]),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type RegisterInviteFormData = z.infer<typeof registerInviteSchema>;
