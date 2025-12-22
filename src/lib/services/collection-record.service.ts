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
import { FileRecordService } from "./file-record.service";
import {
  IFileUploadInput,
  IFileUploadResponse,
  ICollectionRecordFiles,
  ICollectionRecordFilesWithPreview,
  FileType,
} from "@/types/file-record";

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
    console.log('Updating draft with payload:', JSON.stringify(dto, null, 2));
    console.log('hazCodeId in payload:', dto.hazCodeId);
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
      // Map frontend status to backend status
      // Backend uses "SUBMITTED" for records awaiting approval
      // Frontend uses "pending" or "submitted" internally
      let backendStatus: string = filters.status;
      if (filters.status === "pending" || filters.status === "submitted") {
        backendStatus = "SUBMITTED";
      } else if (filters.status === "approved") {
        backendStatus = "APPROVED";
      } else if (filters.status === "rejected") {
        backendStatus = "REJECTED";
      } else if (filters.status === "draft") {
        backendStatus = "DRAFT";
      }
      queryParams.append("status", backendStatus);
    }
    if (filters?.recyclerId) {
      queryParams.append("recyclerId", filters.recyclerId);
    }
    if (filters?.submissionMonth) {
      queryParams.append("submissionMonth", filters.submissionMonth);
    }
    if (filters?.page) {
      queryParams.append("page", filters.page.toString());
    }
    if (filters?.limit) {
      queryParams.append("limit", filters.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.COLLECTION_RECORDS.ROOT}?${queryString}`
      : ENDPOINTS.COLLECTION_RECORDS.ROOT;

    const { data } = await api.get(url);
    
    // Normalize backend status to frontend status
    if (data.data && Array.isArray(data.data)) {
      data.data = data.data.map((record: any) => {
        let normalizedStatus = record.status;
        // Normalize backend status values to frontend status values
        if (record.status === "SUBMITTED") {
          normalizedStatus = "pending";
        } else if (record.status === "APPROVED") {
          normalizedStatus = "approved";
        } else if (record.status === "REJECTED") {
          normalizedStatus = "rejected";
        } else if (record.status === "DRAFT") {
          normalizedStatus = "draft";
        }
        return { ...record, status: normalizedStatus };
      });
    }
    
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
    const record = data.data || data;
    
    // Normalize backend status to frontend status
    if (record.status === "SUBMITTED") {
      record.status = "pending";
    } else if (record.status === "APPROVED") {
      record.status = "approved";
    } else if (record.status === "REJECTED") {
      record.status = "rejected";
    } else if (record.status === "DRAFT") {
      record.status = "draft";
    }
    
    // Normalize approval decision values if present
    // Backend returns "approval" (singular) as an array, map it to "approvals" (plural) for consistency
    if ((record as any).approval && Array.isArray((record as any).approval)) {
      (record as any).approvals = (record as any).approval.map((approval: any) => ({
        ...approval,
        decision: approval.decision === "APPROVED" ? "APPROVED" : approval.decision === "REJECTED" ? "REJECTED" : approval.decision,
      }));
    } else if (record.approvals && Array.isArray(record.approvals)) {
      record.approvals = record.approvals.map((approval: any) => ({
        ...approval,
        decision: approval.decision === "APPROVED" ? "APPROVED" : approval.decision === "REJECTED" ? "REJECTED" : approval.decision,
      }));
    }
    
    return record;
  },

  /**
   * Approve record (admin only)
   * POST /api/collection-records/:id/approve
   * Content-Type: multipart/form-data
   */
  async approveRecord(
    id: string,
    dto: ApprovalDTO,
  ): Promise<CollectionRecordDetail> {
    if (!dto.file) {
      throw new Error("Acceptance document file is required");
    }

    const formData = new FormData();
    formData.append("eprId", dto.eprId);
    formData.append("acceptanceDate", dto.acceptanceDate);
    if (dto.comment) {
      formData.append("comment", dto.comment);
    }
    formData.append("file", dto.file);

    console.log("Uploading approval document:", {
      recordId: id,
      fileName: dto.file.name,
      fileSize: dto.file.size,
      fileType: dto.file.type,
      eprId: dto.eprId,
      acceptanceDate: dto.acceptanceDate,
    });

    const { data } = await api.post(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.APPROVE(id)),
      formData,
    );
    return data.data || data;
  },

  /**
   * Reject record (admin only)
   * POST /api/collection-records/:id/reject
   * Content-Type: application/json
   */
  async rejectRecord(
    id: string,
    dto: RejectionDTO,
  ): Promise<CollectionRecordDetail> {
    const { data } = await api.post(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.REJECT(id)),
      dto,
    );
    return data.data || data;
  },

  /**
   * Upload single file to a collection record
   * POST /api/files/:recordId/upload
   */
  async uploadFile(
    recordId: string,
    input: IFileUploadInput,
  ): Promise<IFileUploadResponse> {
    return FileRecordService.uploadFile(recordId, input);
  },

  /**
   * Upload multiple files to a collection record
   * POST /api/files/:recordId/upload-multiple
   */
  async uploadMultipleFiles(
    recordId: string,
    files: File[],
    category: FileType,
  ): Promise<IFileUploadResponse[]> {
    return FileRecordService.uploadMultipleFiles(recordId, files, category);
  },

  /**
   * Get all files for a collection record
   * GET /api/collection-records/:recordId/files
   */
  async getRecordFiles(recordId: string): Promise<ICollectionRecordFiles> {
    return FileRecordService.getRecordFiles(recordId);
  },

  /**
   * Get all files for a collection record with signed URLs for preview
   * GET /api/collection-records/:recordId/files/preview?expiresIn=3600
   */
  async getRecordFilesWithPreview(
    recordId: string,
    expiresIn: number = 3600,
  ): Promise<ICollectionRecordFilesWithPreview> {
    const { data } = await api.get(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.FILES_PREVIEW(recordId)),
      {
        params: {
          expiresIn,
        },
      },
    );
    return data.data || data;
  },

  /**
   * Delete a file from a collection record
   * DELETE /api/files/:fileId
   */
  async deleteFile(fileId: string): Promise<void> {
    return FileRecordService.deleteFile(fileId);
  },

  /**
   * Get signed URL for file download
   * GET /api/files/:fileId/download
   */
  async getFileDownloadUrl(fileId: string): Promise<string> {
    return FileRecordService.getDownloadUrl(fileId);
  },

  /**
   * Replace file at specific position
   * PUT /api/collection-records/:recordId/upload/:position
   */
  async replaceFileByPosition(
    recordId: string,
    category: FileType,
    position: number,
    file: File,
  ): Promise<IFileUploadResponse> {
    return FileRecordService.replaceFileByPosition(recordId, category, position, file);
  },
};

