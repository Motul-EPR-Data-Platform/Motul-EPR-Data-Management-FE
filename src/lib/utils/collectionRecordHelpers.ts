import { FileType } from "@/types/file-record";
import { CreateDraftFormData } from "@/types/record";

/**
 * Helper to map document type to FileType enum
 */
export const mapDocumentTypeToFileType = (docType: string): FileType => {
  if (
    ["phieu-can", "bien-ban-giao-nhan", "bien-so-xe", "khac"].includes(
      docType,
    )
  ) {
    return FileType.EVIDENCE_PHOTO;
  }
  if (docType === "chat-luong-truoc-tai-che") {
    return FileType.QUALITY_METRICS;
  }
  if (docType === "chat-luong-sau-tai-che") {
    return FileType.OUTPUT_QUALITY_METRICS;
  }
  return FileType.EVIDENCE_PHOTO;
};

/**
 * Helper to format date to dd/mm/yyyy format
 */
export const formatDateDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Helper to parse date from various formats (ISO or dd/mm/yyyy)
 */
export const parseDate = (
  dateString: string | null | undefined,
): Date | undefined => {
  if (!dateString) return undefined;
  try {
    // Try ISO format first
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    // Try dd/mm/yyyy format
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return undefined;
  } catch {
    return undefined;
  }
};

/**
 * Helper to generate file identifier for tracking
 */
export const getFileId = (file: File): string => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

/**
 * Helper to convert signed URL to File object
 */
export const urlToFile = async (
  url: string,
  fileName: string,
  mimeType: string,
): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
};

/**
 * Helper to get selected waste owner name
 */
export const getSelectedWasteOwnerName = (
  formData: Partial<CreateDraftFormData>,
  wasteOwners: Array<{ id: string; name: string }>,
): string | undefined => {
  const owner = wasteOwners.find((wo) => wo.id === formData.wasteOwnerId);
  return owner?.name;
};

/**
 * Helper to get selected contract type name
 */
export const getSelectedContractTypeName = (
  formData: Partial<CreateDraftFormData>,
  contractTypes: Array<{ id: string; name: string; code: string }>,
): string | undefined => {
  const type = contractTypes.find((ct) => ct.id === formData.contractTypeId);
  return type?.name;
};

/**
 * Helper to get selected waste source name
 */
export const getSelectedWasteSourceName = (
  formData: Partial<CreateDraftFormData>,
  wasteTypes: Array<{ id: string; name: string; code?: string; hazCode?: string }>,
): string | undefined => {
  const wasteType = wasteTypes.find((wt) => wt.id === formData.wasteSourceId);
  return wasteType?.name || undefined;
};

/**
 * Helper to get selected HAZ code name
 */
export const getSelectedHazCodeName = (
  formData: Partial<CreateDraftFormData>,
  hazTypes: Array<{ id: string; code: string; name?: string; haz_code?: string }>,
): string | undefined => {
  const hazType = hazTypes.find((ht) => ht.id === formData.hazWasteId);
  if (hazType) {
    const hazCode = hazType.haz_code || hazType.code || "";
    const displayName = hazType.name || hazType.code || "";
    return hazCode && hazCode !== displayName
      ? `${displayName} (${hazCode})`
      : displayName;
  }
  return undefined;
};

