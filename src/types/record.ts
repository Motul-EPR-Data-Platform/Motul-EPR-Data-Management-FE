import { Location } from "./waste-owner";

export type RecordStatus = "draft" | "pending" | "approved" | "rejected";

export interface CollectionRecord {
  readonly id: string;
  recyclerId: string;
  createdBy: string;
  submissionMonth: string; // ISO date string (YYYY-MM)
  collectedVolumeKg?: number | null;
  deliveryDate?: string | null; // ISO date string
  vehiclePlate?: string | null;
  stockpiled?: boolean | null;
  stockpileVolumeKg?: number | null;
  recycledDate?: string | null; // ISO date string
  recycledVolumeKg?: number | null;
  wasteOwnerId?: string | null;
  contractTypeId?: string | null;
  wasteSourceId?: string | null;
  pickupLocationId?: string | null;
  collectedPricePerKg?: number | null;
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
  wasteOwner?: {
    id: string;
    name: string;
    businessCode: string;
    contactPerson: string;
    phone: string;
    email: string;
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
  pickupLocation?: Location | null;
  approval?: {
    id: string;
    approverId: string;
    eprId?: string | null;
    comment?: string | null;
    approvedAt: string;
  } | null;
  rejection?: {
    id: string;
    rejectorId: string;
    comment: string;
    rejectedAt: string;
  } | null;
}

export interface CreateDraftDTO {
  submissionMonth: string; // ISO date string (YYYY-MM)
  collectedVolumeKg?: number | null;
  deliveryDate?: string | null; // ISO date string
  vehiclePlate?: string | null;
  stockpiled?: boolean | null;
  stockpileVolumeKg?: number | null;
  recycledDate?: string | null; // ISO date string
  recycledVolumeKg?: number | null;
  wasteOwnerId?: string | null;
  contractTypeId?: string | null;
  wasteSourceId?: string | null;
  pickupLocation?: {
    refId: string;
  } | null;
  collectedPricePerKg?: number | null;
  expiresAt?: string | null; // ISO date string
}

export interface UpdateDraftDTO {
  submissionMonth?: string; // ISO date string (YYYY-MM)
  collectedVolumeKg?: number | null;
  deliveryDate?: string | null; // ISO date string
  vehiclePlate?: string | null;
  stockpiled?: boolean | null;
  stockpileVolumeKg?: number | null;
  recycledDate?: string | null; // ISO date string
  recycledVolumeKg?: number | null;
  wasteOwnerId?: string | null;
  contractTypeId?: string | null;
  wasteSourceId?: string | null;
  pickupLocation?: {
    refId: string;
  } | null;
  collectedPricePerKg?: number | null;
  expiresAt?: string | null; // ISO date string
}

export interface ApprovalDTO {
  eprId: string;
  comment?: string | null;
}

export interface RejectionDTO {
  comment: string;
}

export interface GetRecordsFilters {
  status?: RecordStatus;
  recyclerId?: string;
  submissionMonth?: string; // ISO date string (YYYY-MM)
}

export interface CollectionRecordResponse {
  success: boolean;
  message?: string;
  data: CollectionRecord | CollectionRecordDetail;
}

export interface CollectionRecordsListResponse {
  success: boolean;
  count: number;
  data: CollectionRecordDetail[];
}

