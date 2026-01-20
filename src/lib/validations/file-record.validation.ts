import { FileType } from "@/types/file-record";

// Allowed MIME types for document categories
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

// Allowed MIME types for image categories
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Allowed MIME types for documents AND images (for waste owner contracts)
export const ALLOWED_DOCUMENT_AND_IMAGE_TYPES = [
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_IMAGE_TYPES,
];

// File extensions mapping (for fallback validation)
export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const ALLOWED_DOCUMENT_AND_IMAGE_EXTENSIONS = [
  ...ALLOWED_DOCUMENT_EXTENSIONS,
  ...ALLOWED_IMAGE_EXTENSIONS,
];

/**
 * Get allowed MIME types for a file category
 */
export function getAllowedMimeTypes(category: FileType): string[] {
  // Waste owner contracts accept both documents and images
  if (category === FileType.WASTE_OWNER_CONTRACT) {
    return ALLOWED_DOCUMENT_AND_IMAGE_TYPES;
  }

  // Document-only types
  if (
    category === FileType.ACCEPTANCE_DOC ||
    category === FileType.APPROVAL_DOC ||
    category === FileType.OUTPUT_QUALITY_METRICS ||
    category === FileType.QUALITY_METRICS ||
    category === FileType.BUSINESS_REG_FILE ||
    category === FileType.ENVIRONMENTAL_PERMIT_FILE ||
    category === FileType.WTP_CONFIRMATION_LETTER ||
    category === FileType.RECYCLING_SERVICE_AGREEMENT
  ) {
    return ALLOWED_DOCUMENT_TYPES;
  }

  // Image-only types
  if (
    category === FileType.EVIDENCE_PHOTO ||
    category === FileType.STOCKPILE_PHOTO ||
    category === FileType.RECYCLED_PHOTO
  ) {
    return ALLOWED_IMAGE_TYPES;
  }

  // Default to documents if category is unknown
  return ALLOWED_DOCUMENT_TYPES;
}

/**
 * Get allowed file extensions for a file category
 */
export function getAllowedExtensions(category: FileType): string[] {
  // Waste owner contracts accept both documents and images
  if (category === FileType.WASTE_OWNER_CONTRACT) {
    return ALLOWED_DOCUMENT_AND_IMAGE_EXTENSIONS;
  }

  // Document-only types
  if (
    category === FileType.ACCEPTANCE_DOC ||
    category === FileType.APPROVAL_DOC ||
    category === FileType.OUTPUT_QUALITY_METRICS ||
    category === FileType.QUALITY_METRICS ||
    category === FileType.BUSINESS_REG_FILE ||
    category === FileType.ENVIRONMENTAL_PERMIT_FILE ||
    category === FileType.WTP_CONFIRMATION_LETTER ||
    category === FileType.RECYCLING_SERVICE_AGREEMENT
  ) {
    return ALLOWED_DOCUMENT_EXTENSIONS;
  }

  // Image-only types
  if (
    category === FileType.EVIDENCE_PHOTO ||
    category === FileType.STOCKPILE_PHOTO ||
    category === FileType.RECYCLED_PHOTO
  ) {
    return ALLOWED_IMAGE_EXTENSIONS;
  }

  // Default to documents if category is unknown
  return ALLOWED_DOCUMENT_EXTENSIONS;
}

/**
 * Validate file type based on category
 * @param category - File category
 * @param file - File object to validate
 * @returns Object with valid boolean and error message
 */
export function validateFileType(
  category: FileType,
  file: File,
): { valid: boolean; error?: string } {
  const allowedTypes = getAllowedMimeTypes(category);
  const allowedExtensions = getAllowedExtensions(category);

  // Check MIME type first
  if (!allowedTypes.includes(file.type)) {
    // Fallback: check file extension if MIME type doesn't match
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext),
    );

    if (!hasValidExtension) {
      // Waste owner contracts accept both
      if (category === FileType.WASTE_OWNER_CONTRACT) {
        return {
          valid: false,
          error: `File không hợp lệ. Chỉ chấp nhận file PDF, Word, hoặc ảnh (JPEG, PNG, WebP)`,
        };
      }

      const isDocumentType =
        category === FileType.ACCEPTANCE_DOC ||
        category === FileType.APPROVAL_DOC ||
        category === FileType.OUTPUT_QUALITY_METRICS ||
        category === FileType.QUALITY_METRICS ||
        category === FileType.BUSINESS_REG_FILE ||
        category === FileType.ENVIRONMENTAL_PERMIT_FILE ||
        category === FileType.WTP_CONFIRMATION_LETTER ||
        category === FileType.RECYCLING_SERVICE_AGREEMENT;

      const typeLabel = isDocumentType
        ? "PDF hoặc Word"
        : "JPEG, PNG hoặc WebP";

      return {
        valid: false,
        error: `File không hợp lệ. Chỉ chấp nhận file ${typeLabel} cho loại ${category}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get human-readable file type description for a category
 */
export function getFileTypeDescription(category: FileType): string {
  // Waste owner contracts accept both documents and images
  if (category === FileType.WASTE_OWNER_CONTRACT) {
    return "PDF, DOC, DOCX, JPEG, PNG, WebP";
  }

  // Document-only types
  if (
    category === FileType.ACCEPTANCE_DOC ||
    category === FileType.APPROVAL_DOC ||
    category === FileType.OUTPUT_QUALITY_METRICS ||
    category === FileType.QUALITY_METRICS ||
    category === FileType.BUSINESS_REG_FILE ||
    category === FileType.ENVIRONMENTAL_PERMIT_FILE ||
    category === FileType.WTP_CONFIRMATION_LETTER ||
    category === FileType.RECYCLING_SERVICE_AGREEMENT
  ) {
    return "PDF, DOC, DOCX";
  }

  // Image-only types
  if (
    category === FileType.EVIDENCE_PHOTO ||
    category === FileType.STOCKPILE_PHOTO ||
    category === FileType.RECYCLED_PHOTO
  ) {
    return "JPEG, PNG, WebP";
  }

  return "PDF, DOC, DOCX";
}
