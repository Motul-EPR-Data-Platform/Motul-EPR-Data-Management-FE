import { z } from "zod";
import { CreateDraftFormData } from "@/types/record";

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

const hazWasteCertificateValidation = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 10 * 1024 * 1024,
    "Kích thước file tối đa 10MB",
  )
  .refine((file) => {
    const allowedTypes = ["application/pdf", "image/png"];
    return allowedTypes.includes(file.type);
  }, "Chỉ chấp nhận file PDF hoặc PNG");

// Step 3 validation schema
export const step3ValidationSchema = z
  .object({
    stockpiled: z.boolean(),
    stockpileVolumeKg: z.number().positive().nullable().optional(),
    stockInDate: z.string().nullable().optional(),
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
      // If stockpiled is true, stockInDate is required
      if (data.stockpiled === true) {
        return Boolean(data.stockInDate && data.stockInDate.trim() !== "");
      }
      return true;
    },
    {
      message: "Ngày lưu kho là bắt buộc khi chọn lưu kho",
      path: ["stockInDate"],
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

// Comprehensive record submission validation schema
// Validates all fields EXCEPT: stockpiled (Lưu kho)
export const recordSubmissionSchema = z
  .object({
    // Form data fields - all required except stockpiled
    wasteOwnerId: z
      .string()
      .min(1, "Chủ nguồn thải là bắt buộc"),
    contractTypeId: z
      .string()
      .min(1, "Loại hợp đồng là bắt buộc"),
    wasteSourceId: z
      .string()
      .min(1, "Loại chất thải là bắt buộc"),
    hazWasteId: z
      .string()
      .min(1, "Mã HAZ là bắt buộc"),
    collectedVolumeKg: z
      .number()
      .positive("Khối lượng thu gom phải lớn hơn 0"),
    vehiclePlate: z
      .string()
      .min(1, "Biển số xe là bắt buộc")
      .trim(),
    recycledVolumeKg: z
      .number()
      .positive("Khối lượng tái chế phải lớn hơn 0"),
    collectedPricePerKg: z
      .number()
      .min(0, "Giá thu gom không được âm"),
    batchId: z
      .string()
      .min(1, "Lô hàng là bắt buộc"),

    // Location - required
    locationRefId: z
      .string()
      .min(1, "Địa chỉ thu gom là bắt buộc"),

    // Dates - required
    collectionDate: z.date(),
    recycledDate: z.date(),

    // Files - required
    recycledPhoto: z
      .instanceof(File, { message: "Ảnh sản phẩm đã tái chế là bắt buộc" })
      .refine(
        (file) => file.size <= 10 * 1024 * 1024,
        "Kích thước file tối đa 10MB",
      )
      .refine((file) => {
        const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        return imageTypes.includes(file.type);
      }, "Chỉ chấp nhận file ảnh: JPEG, PNG, WebP"),
    evidenceFiles: z
      .array(
        z.object({
          id: z.string(),
          file: z.instanceof(File),
          type: z.string(),
        })
      )
      .min(1, "Cần ít nhất 1 ảnh bằng chứng")
      .refine(
        (files) => files.every((doc) => doc.file.size <= 10 * 1024 * 1024),
        "Kích thước file tối đa 10MB",
      ),
    qualityDocuments: z
      .array(
        z.object({
          id: z.string(),
          file: z.instanceof(File),
          type: z.string(),
        })
      )
      .min(1, "Cần ít nhất 1 tài liệu chất lượng")
      .refine(
        (files) => files.every((doc) => doc.file.size <= 10 * 1024 * 1024),
        "Kích thước file tối đa 10MB",
      ),
    hazWasteCertificates: z
      .array(
        z.object({
          id: z.string(),
          file: hazWasteCertificateValidation,
          type: z.string(),
        }),
      )
      .min(1, "Cần ít nhất 1 chứng nhận CTNH"),
  });

export type RecordSubmissionValidationData = z.infer<typeof recordSubmissionSchema>;

/**
 * Validate record submission data using Zod
 * Validates all fields EXCEPT: stockpiled (Lưu kho)
 * @param data - The data to validate
 * @returns Object with success boolean and errors record
 */
export function validateRecordSubmission(data: {
  formData: Partial<CreateDraftFormData>;
  locationRefId: string;
  collectionDate: Date;
  recycledDate: Date | undefined;
  recycledPhoto: File | null;
  evidenceFiles: Array<{ id: string; file: File; type: string }>;
  qualityDocuments?: Array<{ id: string; file: File; type: string }>;
  hazWasteCertificates?: Array<{ id: string; file: File; type: string }>;
}): {
  success: boolean;
  errors: Record<string, string>;
} {
  const {
    formData,
    locationRefId,
    collectionDate,
    recycledDate,
    recycledPhoto,
    evidenceFiles,
    qualityDocuments,
    hazWasteCertificates,
  } = data;

  // Check collectionDate first
  if (!collectionDate || !(collectionDate instanceof Date) || isNaN(collectionDate.getTime())) {
    return {
      success: false,
      errors: { collectionDate: "Ngày thu gom là bắt buộc" },
    };
  }

  // Check recycledDate
  if (!recycledDate || !(recycledDate instanceof Date) || isNaN(recycledDate.getTime())) {
    return {
      success: false,
      errors: { recycledDate: "Ngày hoàn thành tái chế là bắt buộc" },
    };
  }

  // Check recycledPhoto first
  if (!recycledPhoto) {
    return {
      success: false,
      errors: { recycledPhoto: "Ảnh sản phẩm đã tái chế là bắt buộc" },
    };
  }

  // Check qualityDocuments
  if (!qualityDocuments || qualityDocuments.length === 0) {
    return {
      success: false,
      errors: { qualityDocuments: "Cần ít nhất 1 tài liệu chất lượng" },
    };
  }

  if (!hazWasteCertificates || hazWasteCertificates.length === 0) {
    return {
      success: false,
      errors: { hazWasteCertificates: "Cần ít nhất 1 chứng nhận CTNH" },
    };
  }

  const validationData = {
    wasteOwnerId: formData.wasteOwnerId || "",
    contractTypeId: formData.contractTypeId || "",
    wasteSourceId: formData.wasteSourceId || "",
    hazWasteId: formData.hazWasteId || "",
    collectedVolumeKg: formData.collectedVolumeKg ?? 0,
    vehiclePlate: formData.vehiclePlate || "",
    recycledVolumeKg: formData.recycledVolumeKg ?? 0,
    collectedPricePerKg: formData.collectedPricePerKg ?? 0,
    batchId: formData.batchId || "",
    locationRefId: locationRefId || "",
    collectionDate,
    recycledDate,
    recycledPhoto,
    evidenceFiles: evidenceFiles || [],
    qualityDocuments: qualityDocuments || [],
    hazWasteCertificates: hazWasteCertificates || [],
  };

  const result = recordSubmissionSchema.safeParse(validationData);

  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (path) {
        errors[path] = issue.message;
      }
    });
    return { success: false, errors };
  }

  return { success: true, errors: {} };
}
