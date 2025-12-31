import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  CollectionBatch,
  CreateBatchDTO,
  BatchDetailResponse,
  ActiveBatch,
  BatchType,
} from "@/types/batch";

/**
 * Transform snake_case object to camelCase
 */
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (typeof obj !== "object") {
    return obj;
  }
  const camelObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      camelObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return camelObj;
}

export const BatchService = {
  /**
   * Create a new batch
   * POST /api/batches
   */
  async createBatch(dto: CreateBatchDTO): Promise<CollectionBatch> {
    const { data } = await api.post(
      path.batches(""), // Use empty string since path.batches already prepends ROOT
      dto,
    );
    const result = data.data || data;
    return toCamelCase(result) as CollectionBatch;
  },

  /**
   * Close a batch
   * POST /api/batches/:id/close
   */
  async closeBatch(batchId: string): Promise<CollectionBatch> {
    const { data } = await api.post(
      path.batches(ENDPOINTS.BATCHES.CLOSE(batchId)),
    );
    const result = data.data || data;
    return toCamelCase(result) as CollectionBatch;
  },

  /**
   * Get all batches
   * GET /api/batches
   */
  async getAllBatches(): Promise<CollectionBatch[]> {
    const { data } = await api.get(path.batches("")); // Use empty string since path.batches already prepends ROOT
    const result = data.data || data;
    if (Array.isArray(result)) {
      return result.map((batch) => toCamelCase(batch)) as CollectionBatch[];
    }
    return [];
  },

  /**
   * Get batch by ID with details
   * GET /api/batches/:id
   */
  async getBatchById(batchId: string): Promise<BatchDetailResponse> {
    const { data } = await api.get(
      path.batches(ENDPOINTS.BATCHES.BY_ID(batchId)),
    );
    const result = data.data || data;
    return toCamelCase(result) as BatchDetailResponse;
  },

  /**
   * Get active batches for dropdown
   * GET /api/batches/active?batchType=port|factory
   */
  async getActiveBatchesForDropdown(
    batchType?: BatchType,
  ): Promise<ActiveBatch[]> {
    const queryParams = new URLSearchParams();
    if (batchType) {
      queryParams.append("batchType", batchType);
    }
    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.BATCHES.ACTIVE}?${queryString}`
      : ENDPOINTS.BATCHES.ACTIVE;

    const { data } = await api.get(path.batches(url));
    const result = data.data || data;
    if (Array.isArray(result)) {
      return result.map((batch) => toCamelCase(batch)) as ActiveBatch[];
    }
    return [];
  },
};

