import { Location } from "./waste-owner";
import { ICollectionRecordFiles } from "./file-record";

export type RecordStatus =
  | "draft"
  | "pending"
  | "submitted"
  | "approved"
  | "rejected"
  | "EDITED_BY_RECYCLER";

export interface CollectionRecord {
  readonly id: string;
  recordName?: string | null; // Record name/identifier (e.g., "DN-170204-20251201")
  batchId: string; // Batch ID
  recyclerId: string;
  createdBy: string;
  submissionMonth: string; // ISO date string (YYYY-MM)
  collectedVolumeKg?: number | null;
  deliveryDate?: string | null; // ISO date string
  vehiclePlate?: string | null;
  stockpiled?: boolean | null;
  stockpileVolumeKg?: number | null;
  stockInDate?: string | null; // ISO date string (ngày lưu kho)
  recycledDate?: string | null; // ISO date string
  recycledVolumeKg?: number | null;
  wasteOwnerId?: string | null;
  hazWasteId?: string | null;
  contractTypeId?: string | null;
  wasteSourceId?: string | null;
  pickupLocationId?: string | null;
  collectedPricePerKg?: number | null;
  eprId?: string | null; // EPR entity ID (set when approved)
  acceptanceDate?: string | null; // ISO date string (set when approved)
  status: RecordStatus;
  expiresAt?: string | null; // ISO date string
  submittedAt?: string | null; // ISO date string
  approvedAt?: string | null; // ISO date string
  rejectedAt?: string | null; // ISO date string
  approvedBy?: string | null;
  rejectedBy?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CollectionRecordDetail extends CollectionRecord {
  batch?: {
    batchName: string;
    batchType: string;
  } | null;
  wasteOwner?: {
    id: string;
    name: string;
    businessCode: string;
    contactPerson?: string;
    wasteOwnerType?: string;
    phone?: string;
    email?: string;
  } | null;
  wasteOwners?: Array<{
    id: string;
    name: string;
    businessCode: string;
    wasteOwnerType?: string;
  }>;
  recycler?: {
    id: string;
    vendorName: string;
  } | null;
  contractType?: {
    id: string;
    name: string;
    code: string;
  } | null;
  wasteSource?: {
    id: string;
    name: string;
  } | null;
  hazWaste?: {
    id: string;
    code: string;
  } | null;
  eprEntity?: {
    id: string;
    code: string;
    name: string;
    region?: string | null;
    description?: string | null;
    producerContact?: string | null;
  } | null;
  pickupLocation?: Location | null;
  approval?: {
    id: string;
    approverId: string;
    eprId?: string | null;
    comment?: string | null;
    approvedAt: string;
  } | null;
  approvals?: Array<{
    id: string;
    comment?: string | null;
    hazWasteDocNumber?: string | null;
    approver: {
      id: string;
      fullName: string;
    };
    decision: "APPROVED" | "REJECTED";
    decidedAt: string;
  }>;
  rejection?: {
    id: string;
    rejectorId: string;
    comment: string;
    rejectedAt: string;
  } | null;
  files?: ICollectionRecordFiles;
}

// Frontend form data structure (for internal use)
export interface CreateDraftFormData {
  batchId?: string | null; // Batch ID
  submissionMonth: string; // ISO date string (YYYY-MM)
  collectedVolumeKg?: number | null;
  deliveryDate?: string | null; // ISO date string
  vehiclePlate?: string | null;
  stockpiled?: boolean | null;
  stockpileVolumeKg?: number | null;
  stockInDate?: string | null; // ISO date string (YYYY-MM-DD)
  recycledDate?: string | null; // ISO date string
  recycledVolumeKg?: number | null;
  wasteOwnerId?: string | null; // Single ID from form
  contractTypeId?: string | null;
  wasteSourceId?: string | null;
  hazWasteId?: string | null; // HAZ code definition ID
  pickupLocationId?: string | null; // refId from location autocomplete - this value should be mapped to pickupLocation: { refId: string } in DTO
  collectedPricePerKg?: number | null;
  expiresAt?: string | null; // ISO date string
}

// Backend DTO structure (matches ICreateDraftInput)
export interface CreateDraftDTO {
  batchId?: string | null; // Batch ID
  submissionMonth?: string; // Date string in dd/mm/yyyy format
  collectedVolumeKg?: number | null;
  deliveryDate?: string | null; // Date string in dd/mm/yyyy format
  vehiclePlate?: string | null;
  stockpiled?: boolean | null;
  stockpileVolumeKg?: number | null;
  stockInDate?: string | null; // Date string in dd/mm/yyyy format
  recycledDate?: string | null; // Date string in dd/mm/yyyy format
  recycledVolumeKg?: number | null;
  wasteOwnerIds?: string[]; // Backend expects array - optional, but should be included when waste owners are selected
  contractTypeId?: string | null;
  wasteSourceId?: string | null;
  hazWasteId?: string | null; // HAZ code definition ID
  pickupLocation?: { refId: string } | null; // Backend expects object with refId property
  collectedPricePerKg?: number | null;
  expiresAt?: string | null; // Date string in dd/mm/yyyy format
}

// Backend DTO structure for update (matches IUpdateDraftInput)
export interface UpdateDraftDTO {
  batchId?: string | null; // Batch ID
  submissionMonth?: string; // ISO date string (YYYY-MM)
  collectedVolumeKg?: number | null;
  deliveryDate?: string | null; // ISO date string
  vehiclePlate?: string | null;
  stockpiled?: boolean | null;
  stockpileVolumeKg?: number | null;
  stockInDate?: string | null; // Date string in dd/mm/yyyy format
  recycledDate?: string | null; // ISO date string
  recycledVolumeKg?: number | null;
  wasteOwnerIds?: string[]; // Backend expects array
  contractTypeId?: string | null;
  hazWasteId?: string | null; // HAZ code definition ID
  wasteSourceId?: string | null;
  pickupLocation?: { refId: string } | null; // Backend expects object with refId property
  collectedPricePerKg?: number | null;
  expiresAt?: string | null; // ISO date string
}

export interface ApprovalDTO {
  eprId: string;
  acceptanceDate: string; // Date in "dd/mm/yyyy" format
  comment?: string | null;
  file?: File; // Acceptance document (PDF/Word) - required
  hazWasteDocNumber: string; // Hazardous waste document number (required)
}

export interface RejectionDTO {
  comment: string;
}

export interface GetRecordsFilters {
  status?: RecordStatus | "SUBMITTED"; // Backend uses "SUBMITTED", frontend uses "submitted" or "pending"
  recyclerId?: string;
  submissionMonth?: string; // ISO date string (YYYY-MM)
  batchId?: string;
  startDate?: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string (YYYY-MM-DD)
  sortBy?: "deliveryDate"; // Sorting field
  sortOrder?: "asc" | "desc"; // Sorting order
  wasteOwnerName?: string;
  vehiclePlate?: string;
  recordName?: string;
  page?: number;
  limit?: number;
}

export interface CollectionRecordResponse {
  success: boolean;
  message?: string;
  data: CollectionRecord | CollectionRecordDetail;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CollectionRecordsListResponse {
  success: boolean;
  count?: number; // Legacy field, use pagination.total instead
  data: CollectionRecordDetail[];
  pagination?: PaginationInfo;
}
