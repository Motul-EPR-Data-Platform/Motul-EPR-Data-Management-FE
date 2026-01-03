import { z } from "zod";

// Base schema for waste owner validation
const baseWasteOwnerSchema = z.object({
  name: z
    .string()
    .min(1, "Tên là bắt buộc")
    .trim(),
  businessCode: z
    .string()
    .min(1, "Mã số thuế / Số CCCD là bắt buộc")
    .trim(),
  contactPerson: z
    .string()
    .min(1, "Người liên hệ là bắt buộc")
    .trim()
    .nullable()
    .optional(),
  phone: z
    .string()
    .trim()
    .nullable()
    .optional(),
  email: z
    .union([
      z.string().email("Email không hợp lệ").trim(),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  wasteOwnerType: z.enum(["individual", "business", "organization"]),
  location: z
    .object({
      refId: z.string().min(1, "Địa chỉ là bắt buộc"),
    })
    .optional(),
});

// Create schema - all required fields with custom validation
export const createWasteOwnerSchema = baseWasteOwnerSchema
  .refine(
    (data) => {
      // contactPerson is required
      return data.contactPerson && data.contactPerson.trim().length > 0;
    },
    {
      message: "Người liên hệ là bắt buộc",
      path: ["contactPerson"],
    }
  )
  .superRefine((data, ctx) => {
    // Custom message for businessCode based on wasteOwnerType
    if (!data.businessCode || !data.businessCode.trim()) {
      const message =
        data.wasteOwnerType === "individual"
          ? "Số CCCD là bắt buộc"
          : "Mã số thuế là bắt buộc";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: ["businessCode"],
      });
    }
  });

// Update schema - all fields optional, but if provided must be valid
export const updateWasteOwnerSchema = z
  .object({
    name: z.string().trim().optional(),
    businessCode: z.string().trim().optional(),
    contactPerson: z.string().trim().nullable().optional(),
    phone: z.string().trim().nullable().optional(),
    email: z
      .union([
        z.string().email("Email không hợp lệ").trim(),
        z.literal(""),
        z.null(),
      ])
      .optional(),
    wasteOwnerType: z
      .enum(["individual", "business", "organization"])
      .optional(),
    isActive: z.boolean().optional(),
    location: z
      .object({
        refId: z.string().min(1, "Địa chỉ là bắt buộc"),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // If name is provided, it must not be empty
    if (data.name !== undefined && (!data.name || !data.name.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tên là bắt buộc",
        path: ["name"],
      });
    }
    // If businessCode is provided, it must not be empty
    if (
      data.businessCode !== undefined &&
      (!data.businessCode || !data.businessCode.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mã số thuế / Số CCCD là bắt buộc",
        path: ["businessCode"],
      });
    }
    // If contactPerson is provided (not null/undefined), it must not be empty
    if (
      data.contactPerson !== null &&
      data.contactPerson !== undefined &&
      (!data.contactPerson || !data.contactPerson.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Người liên hệ là bắt buộc",
        path: ["contactPerson"],
      });
    }
  });

// Type inference
export type CreateWasteOwnerValidationData = z.infer<
  typeof createWasteOwnerSchema
>;
export type UpdateWasteOwnerValidationData = z.infer<
  typeof updateWasteOwnerSchema
>;

// Validation helper functions
export function validateCreateWasteOwner(
  data: unknown
): {
  success: boolean;
  data?: CreateWasteOwnerValidationData;
  errors?: Record<string, string>;
} {
  const result = createWasteOwnerSchema.safeParse(data);

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

  return { success: true, data: result.data };
}

export function validateUpdateWasteOwner(
  data: unknown
): {
  success: boolean;
  data?: UpdateWasteOwnerValidationData;
  errors?: Record<string, string>;
} {
  const result = updateWasteOwnerSchema.safeParse(data);

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

  return { success: true, data: result.data };
}

