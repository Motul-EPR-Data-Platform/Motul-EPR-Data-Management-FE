import { z } from "zod";
import { step3ValidationSchema } from "./record";
import { CreateDraftFormData } from "@/types/record";

export interface ValidationContext {
  formData: Partial<CreateDraftFormData>;
  locationRefId: string;
  recycledPhoto: globalThis.File | null;
  stockpilePhoto: globalThis.File | null;
}

/**
 * Validate a specific step of the collection record form
 * @param step - The step number to validate (1-4)
 * @param context - The validation context with form data and files
 * @returns Object with isValid boolean and errors record
 */
export const validateStep = (
  step: number,
  context: ValidationContext,
): { isValid: boolean; errors: Record<string, string> } => {
  const { formData, locationRefId, recycledPhoto, stockpilePhoto } = context;
  const newErrors: Record<string, string> = {};

  if (step === 1) {
    if (!formData.wasteOwnerId) {
      newErrors.wasteOwnerId = "Vui lòng chọn Chủ nguồn thải";
    }
    if (!formData.wasteSourceId) {
      newErrors.wasteSourceId = "Vui lòng chọn Loại chất thải";
    }
  }

  if (step === 2) {
    if (!formData.collectedVolumeKg || formData.collectedVolumeKg <= 0) {
      newErrors.collectedVolumeKg = "Khối lượng thu gom là bắt buộc";
    }
    if (!locationRefId) {
      newErrors.locationRefId = "Địa chỉ thu gom là bắt buộc";
    }
    if (!formData.vehiclePlate || formData.vehiclePlate.trim() === "") {
      newErrors.vehiclePlate = "Biển số xe là bắt buộc";
    }
  }

  if (step === 3) {
    // Use Zod validation for Step 3
    try {
      const step3Data = {
        stockpiled: formData.stockpiled ?? false,
        stockpileVolumeKg: formData.stockpileVolumeKg ?? null,
        recycledVolumeKg: formData.recycledVolumeKg ?? 0,
        recycledPhoto: recycledPhoto,
        stockpilePhoto: stockpilePhoto ?? null,
      };

      step3ValidationSchema.parse(step3Data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (field) {
            newErrors[field] = issue.message;
          }
        });
      } else {
        // Fallback validation
        if (!formData.recycledVolumeKg || formData.recycledVolumeKg <= 0) {
          newErrors.recycledVolumeKg = "Khối lượng tái chế là bắt buộc";
        }
        if (!recycledPhoto) {
          newErrors.recycledPhoto = "Ảnh sản phẩm đã tái chế là bắt buộc";
        }
        if (formData.stockpiled === true) {
          if (
            !formData.stockpileVolumeKg ||
            formData.stockpileVolumeKg <= 0
          ) {
            newErrors.stockpileVolumeKg =
              "Khối lượng lưu kho là bắt buộc khi chọn lưu kho";
          }
          if (!stockpilePhoto) {
            newErrors.stockpilePhoto =
              "Ảnh nhập kho là bắt buộc khi chọn lưu kho";
          }
        }
      }
    }
  }

  return {
    isValid: Object.keys(newErrors).length === 0,
    errors: newErrors,
  };
};

