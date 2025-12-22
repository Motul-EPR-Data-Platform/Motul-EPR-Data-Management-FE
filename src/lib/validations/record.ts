import { z } from "zod";

// File validation helper for image files
const imageFileValidation = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 10 * 1024 * 1024,
    "Kích thước file tối đa 10MB",
  )
  .refine((file) => {
    const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    return imageTypes.includes(file.type);
  }, "Chỉ chấp nhận file ảnh: JPEG, PNG, WebP");

// Step 3 validation schema
export const step3ValidationSchema = z
  .object({
    stockpiled: z.boolean(),
    stockpileVolumeKg: z.number().positive().nullable().optional(),
    recycledVolumeKg: z.number().positive("Khối lượng tái chế phải lớn hơn 0"),
    recycledPhoto: imageFileValidation,
    stockpilePhoto: imageFileValidation.nullable().optional(),
  })
  .refine(
    (data) => {
      // If stockpiled is true, stockpileVolumeKg is required
      if (data.stockpiled === true) {
        return (
          data.stockpileVolumeKg !== null &&
          data.stockpileVolumeKg !== undefined &&
          data.stockpileVolumeKg > 0
        );
      }
      return true;
    },
    {
      message: "Khối lượng lưu kho là bắt buộc khi chọn lưu kho",
      path: ["stockpileVolumeKg"],
    },
  )
  .refine(
    (data) => {
      // If stockpiled is true, stockpilePhoto is required
      if (data.stockpiled === true) {
        return (
          data.stockpilePhoto !== null && data.stockpilePhoto !== undefined
        );
      }
      return true;
    },
    {
      message: "Ảnh nhập kho là bắt buộc khi chọn lưu kho",
      path: ["stockpilePhoto"],
    },
  );

export type Step3ValidationData = z.infer<typeof step3ValidationSchema>;
