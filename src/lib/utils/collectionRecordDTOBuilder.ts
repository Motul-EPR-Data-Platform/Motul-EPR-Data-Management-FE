import { CreateDraftDTO, CreateDraftFormData } from "@/types/record";
import { formatDateDDMMYYYY } from "./collectionRecordHelpers";

/**
 * Helper to normalize null/undefined for comparison
 */
export const normalizeValue = (value: any): any => {
  return value === undefined || value === "" ? null : value;
};

/**
 * Build full DTO from form data (for create mode)
 */
export const buildDraftDTO = (
  formData: Partial<CreateDraftFormData>,
  collectionDate: Date,
  recycledDate: Date | undefined,
  locationRefId: string,
): CreateDraftDTO => {
  return {
    batchId: formData.batchId || null,
    submissionMonth: formatDateDDMMYYYY(
      new Date(collectionDate.getFullYear(), collectionDate.getMonth(), 1),
    ),
    collectedVolumeKg: formData.collectedVolumeKg || null,
    deliveryDate: formatDateDDMMYYYY(collectionDate),
    vehiclePlate: formData.vehiclePlate || null,
    stockpiled: formData.stockpiled ?? false,
    stockpileVolumeKg: formData.stockpileVolumeKg || null,
    recycledDate: recycledDate ? formatDateDDMMYYYY(recycledDate) : null,
    recycledVolumeKg: formData.recycledVolumeKg || null,
    wasteOwnerIds: formData.wasteOwnerId ? [formData.wasteOwnerId] : [],
    contractTypeId: formData.contractTypeId || null,
    wasteSourceId: formData.wasteSourceId || null,
    hazWasteId:
      formData.hazWasteId && formData.hazWasteId.trim() !== ""
        ? formData.hazWasteId
        : null,
    pickupLocation: locationRefId ? { refId: locationRefId } : null,
    collectedPricePerKg: formData.collectedPricePerKg || null,
  };
};

/**
 * Original form data structure for comparison
 */
export interface OriginalFormData {
  formData: Partial<CreateDraftFormData>;
  collectionDate: Date;
  recycledDate: Date | undefined;
  locationRefId: string;
}

/**
 * Build partial DTO with only changed fields (for edit mode)
 */
export const buildPartialDraftDTO = (
  formData: Partial<CreateDraftFormData>,
  collectionDate: Date,
  recycledDate: Date | undefined,
  locationRefId: string,
  original: OriginalFormData,
): Partial<CreateDraftDTO> => {
  const partialDTO: Partial<CreateDraftDTO> = {};

  // Compare each field and only include if changed
  // Normalize null/undefined for comparison
  const currentBatchId = normalizeValue(formData.batchId);
  const originalBatchId = normalizeValue(original.formData.batchId);
  if (currentBatchId !== originalBatchId) {
    partialDTO.batchId = formData.batchId || null;
  }

  // Compare collection date (deliveryDate)
  const currentDeliveryDate = formatDateDDMMYYYY(collectionDate);
  const originalDeliveryDate = formatDateDDMMYYYY(original.collectionDate);
  if (currentDeliveryDate !== originalDeliveryDate) {
    partialDTO.deliveryDate = currentDeliveryDate;
    partialDTO.submissionMonth = formatDateDDMMYYYY(
      new Date(collectionDate.getFullYear(), collectionDate.getMonth(), 1),
    );
  }

  const currentCollectedVolume = normalizeValue(formData.collectedVolumeKg);
  const originalCollectedVolume = normalizeValue(original.formData.collectedVolumeKg);
  if (currentCollectedVolume !== originalCollectedVolume) {
    partialDTO.collectedVolumeKg = formData.collectedVolumeKg || null;
  }

  const currentVehiclePlate = normalizeValue(formData.vehiclePlate);
  const originalVehiclePlate = normalizeValue(original.formData.vehiclePlate);
  if (currentVehiclePlate !== originalVehiclePlate) {
    partialDTO.vehiclePlate = formData.vehiclePlate || null;
  }

  // Boolean comparison (null/undefined should be treated as false)
  const currentStockpiled = formData.stockpiled ?? false;
  const originalStockpiled = original.formData.stockpiled ?? false;
  if (currentStockpiled !== originalStockpiled) {
    partialDTO.stockpiled = formData.stockpiled ?? false;
  }

  const currentStockpileVolume = normalizeValue(formData.stockpileVolumeKg);
  const originalStockpileVolume = normalizeValue(original.formData.stockpileVolumeKg);
  if (currentStockpileVolume !== originalStockpileVolume) {
    partialDTO.stockpileVolumeKg = formData.stockpileVolumeKg || null;
  }

  // Compare recycled date
  const currentRecycledDate = recycledDate ? formatDateDDMMYYYY(recycledDate) : null;
  const originalRecycledDate = original.recycledDate
    ? formatDateDDMMYYYY(original.recycledDate)
    : null;
  if (currentRecycledDate !== originalRecycledDate) {
    partialDTO.recycledDate = currentRecycledDate;
  }

  const currentRecycledVolume = normalizeValue(formData.recycledVolumeKg);
  const originalRecycledVolume = normalizeValue(original.formData.recycledVolumeKg);
  if (currentRecycledVolume !== originalRecycledVolume) {
    partialDTO.recycledVolumeKg = formData.recycledVolumeKg || null;
  }

  const currentWasteOwnerId = normalizeValue(formData.wasteOwnerId);
  const originalWasteOwnerId = normalizeValue(original.formData.wasteOwnerId);
  if (currentWasteOwnerId !== originalWasteOwnerId) {
    partialDTO.wasteOwnerIds = formData.wasteOwnerId ? [formData.wasteOwnerId] : [];
  }

  const currentContractTypeId = normalizeValue(formData.contractTypeId);
  const originalContractTypeId = normalizeValue(original.formData.contractTypeId);
  if (currentContractTypeId !== originalContractTypeId) {
    partialDTO.contractTypeId = formData.contractTypeId || null;
  }

  const currentWasteSourceId = normalizeValue(formData.wasteSourceId);
  const originalWasteSourceId = normalizeValue(original.formData.wasteSourceId);
  if (currentWasteSourceId !== originalWasteSourceId) {
    partialDTO.wasteSourceId = formData.wasteSourceId || null;
  }

  const currentHazWasteId =
    formData.hazWasteId && formData.hazWasteId.trim() !== ""
      ? formData.hazWasteId
      : null;
  const originalHazWasteId =
    original.formData.hazWasteId && original.formData.hazWasteId.trim() !== ""
      ? original.formData.hazWasteId
      : null;
  if (currentHazWasteId !== originalHazWasteId) {
    partialDTO.hazWasteId = currentHazWasteId;
  }

  // Compare location refId
  const currentLocationRefId = normalizeValue(locationRefId);
  const originalLocationRefId = normalizeValue(original.locationRefId);
  if (currentLocationRefId !== originalLocationRefId) {
    partialDTO.pickupLocation = locationRefId ? { refId: locationRefId } : null;
  }

  const currentPricePerKg = normalizeValue(formData.collectedPricePerKg);
  const originalPricePerKg = normalizeValue(original.formData.collectedPricePerKg);
  if (currentPricePerKg !== originalPricePerKg) {
    partialDTO.collectedPricePerKg = formData.collectedPricePerKg || null;
  }

  return partialDTO;
};

