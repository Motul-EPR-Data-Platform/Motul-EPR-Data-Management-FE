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

// File extensions mapping (for fallback validation)
export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Get allowed MIME types for a file category
 */
export function getAllowedMimeTypes(category: FileType): string[] {
  // Document types
  if (
    category === FileType.ACCEPTANCE_DOC ||
    category === FileType.APPROVAL_DOC ||
    category === FileType.OUTPUT_QUALITY_METRICS ||
    category === FileType.QUALITY_METRICS
  ) {
    return ALLOWED_DOCUMENT_TYPES;
  }

  // Image types
  if (
    category === FileType.EVIDENCE_PHOTO ||
    category === FileType.STOCKPILE_PHOTO ||
    category === FileType.RECYCLED_PHOTO
  ) {
    return ALLOWED_IMAGE_TYPES;
  }

  // Default to images if category is unknown
  return ALLOWED_IMAGE_TYPES;
}

/**
 * Get allowed file extensions for a file category
 */
export function getAllowedExtensions(category: FileType): string[] {
  // Document types
  if (
    category === FileType.ACCEPTANCE_DOC ||
    category === FileType.APPROVAL_DOC ||
    category === FileType.OUTPUT_QUALITY_METRICS ||
    category === FileType.QUALITY_METRICS
  ) {
    return ALLOWED_DOCUMENT_EXTENSIONS;
  }

  // Image types
  if (
    category === FileType.EVIDENCE_PHOTO ||
    category === FileType.STOCKPILE_PHOTO ||
    category === FileType.RECYCLED_PHOTO
  ) {
    return ALLOWED_IMAGE_EXTENSIONS;
  }

  // Default to images if category is unknown
  return ALLOWED_IMAGE_EXTENSIONS;
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
      const typeLabel =
        category === FileType.ACCEPTANCE_DOC ||
        category === FileType.APPROVAL_DOC ||
        category === FileType.OUTPUT_QUALITY_METRICS ||
        category === FileType.QUALITY_METRICS
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
  if (
    category === FileType.ACCEPTANCE_DOC ||
    category === FileType.APPROVAL_DOC ||
    category === FileType.OUTPUT_QUALITY_METRICS ||
    category === FileType.QUALITY_METRICS
  ) {
    return "PDF, DOC, DOCX";
  }

  if (
    category === FileType.EVIDENCE_PHOTO ||
    category === FileType.STOCKPILE_PHOTO ||
    category === FileType.RECYCLED_PHOTO
  ) {
    return "JPEG, PNG, WebP";
  }

  return "JPEG, PNG, WebP";
}
