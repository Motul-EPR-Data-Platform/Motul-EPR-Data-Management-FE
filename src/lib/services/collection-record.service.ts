import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  CollectionRecord,
  CollectionRecordDetail,
  CreateDraftDTO,
  UpdateDraftDTO,
  ApprovalDTO,
  RejectionDTO,
  GetRecordsFilters,
  CollectionRecordResponse,
  CollectionRecordsListResponse,
} from "@/types/record";

export const CollectionRecordService = {
  /**
   * Create new draft collection record
   * POST /api/collection-records/draft
   */
  async createDraft(dto: CreateDraftDTO): Promise<CollectionRecord> {
    // Backend expects dates in dd/mm/yyyy format (already formatted in DTO)
    // Ensure wasteOwnerIds is always an array (backend RPC function expects array)
    const payload = {
      ...dto,
      // Backend does: p_waste_owner_ids: data.wasteOwnerIds || null
      // So empty array [] stays as [], but backend RPC should handle it
      // When array has values like ["id1"], it should create junction records
      wasteOwnerIds: Array.isArray(dto.wasteOwnerIds) ? dto.wasteOwnerIds : [],
    };
    
    console.log('Creating draft with payload:', JSON.stringify(payload, null, 2));
    console.log('wasteOwnerIds value:', payload.wasteOwnerIds);
    console.log('wasteOwnerIds type:', typeof payload.wasteOwnerIds, Array.isArray(payload.wasteOwnerIds));
    
    const { data } = await api.post(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.DRAFT),
      payload,
    );
    return data.data || data;
  },

  /**
   * Update existing draft
   * PUT /api/collection-records/:id/draft
   */
  async updateDraft(
    id: string,
    dto: UpdateDraftDTO,
  ): Promise<CollectionRecord> {
    const { data } = await api.put(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.DRAFT_BY_ID(id)),
      dto,
    );
    return data.data || data;
  },

  /**
   * Submit draft record for approval
   * POST /api/collection-records/:id/submit
   */
  async submitRecord(id: string): Promise<CollectionRecord> {
    const { data } = await api.post(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.SUBMIT(id)),
    );
    return data.data || data;
  },

  /**
   * Get all collection records (with optional filters)
   * GET /api/collection-records
   */
  async getAllRecords(
    filters?: GetRecordsFilters,
  ): Promise<CollectionRecordsListResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.status) {
      queryParams.append("status", filters.status);
    }
    if (filters?.recyclerId) {
      queryParams.append("recyclerId", filters.recyclerId);
    }
    if (filters?.submissionMonth) {
      queryParams.append("submissionMonth", filters.submissionMonth);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.COLLECTION_RECORDS.ROOT}?${queryString}`
      : ENDPOINTS.COLLECTION_RECORDS.ROOT;

    const { data } = await api.get(url);
    return data;
  },

  /**
   * Get specific collection record by ID
   * GET /api/collection-records/:id
   */
  async getRecordById(id: string): Promise<CollectionRecordDetail> {
    const { data } = await api.get(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.BY_ID(id)),
    );
    return data.data || data;
  },

  /**
   * Approve record (admin only)
   * PATCH /api/collection-records/:id/approve
   */
  async approveRecord(
    id: string,
    dto: ApprovalDTO,
  ): Promise<CollectionRecordDetail> {
    const { data } = await api.patch(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.APPROVE(id)),
      dto,
    );
    return data.data || data;
  },

  /**
   * Reject record (admin only)
   * PATCH /api/collection-records/:id/reject
   */
  async rejectRecord(
    id: string,
    dto: RejectionDTO,
  ): Promise<CollectionRecordDetail> {
    const { data } = await api.patch(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.REJECT(id)),
      dto,
    );
    return data.data || data;
  },
};

