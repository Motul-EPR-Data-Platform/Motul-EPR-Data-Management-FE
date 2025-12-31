import { RecordStatus } from "./record";

export enum BatchType {
  PORT = "port",
  FACTORY = "factory",
}

export enum BatchStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export interface CollectionBatch {
  readonly id: string;
  batchName: string;
  batchType: BatchType;
  recyclerId: string;
  createdBy: string;
  status: BatchStatus;
  closedAt: Date | string | null;
  closedBy: string | null;
  description: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateBatchDTO {
  batchType: BatchType;
  recyclerId: string;
  description?: string;
  createdBy: string;
}

export interface BatchDetailResponse {
  batch: CollectionBatch & {
    createdByName: string;
    closedByName: string | null;
  };
  records: Array<{
    id: string;
    stockpileVolumeKg: number;
    collectedVolumeKg: number;
    status: RecordStatus;
  }>;
}

export interface ActiveBatch {
  id: string;
  batchName: string;
  batchType: BatchType;
}
