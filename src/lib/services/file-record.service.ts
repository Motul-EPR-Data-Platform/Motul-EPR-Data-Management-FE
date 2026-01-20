import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  IFile,
  IFileUploadInput,
  IFileUploadResponse,
  ICollectionRecordFiles,
  FileType,
  IReplaceFileInput,
  EntityType,
  IEntityIdentifier,
} from "@/types/file-record";
import { validateFileType } from "@/lib/validations/file-record.validation";

export const FileRecordService = {
  /**
   * Upload single file to a collection record
   * POST /api/collection-records/:recordId/upload
   * Note: Backend handles both single and multiple files on the same endpoint
   */
  async uploadFile(
    recordId: string,
    input: IFileUploadInput,
  ): Promise<IFileUploadResponse> {
    // Validate file type based on category
    const validation = validateFileType(input.category, input.file);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid file type");
    }

    const formData = new FormData();
    formData.append("files", input.file); // Use "files" field name (same as multiple)
    formData.append("category", input.category);

    if (input.position !== undefined) {
      formData.append("position", input.position.toString());
    }

    if (input.subType) {
      formData.append("subType", input.subType);
    }

    if (input.metadata) {
      formData.append("metadata", JSON.stringify(input.metadata));
    }

    const { data } = await api.post(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.UPLOAD(recordId)),
      formData,
    );

    return data.data || data;
  },

  /**
   * Upload multiple files to a collection record
   * POST /api/collection-records/:recordId/upload
   * Note: Uses the same endpoint as single upload, but with "files" field name (plural)
   */
  async uploadMultipleFiles(
    recordId: string,
    files: File[],
    category: FileType,
    subType?: string,
  ): Promise<IFileUploadResponse[]> {
    // Validate files array
    if (!files || files.length === 0) {
      throw new Error("No files provided for upload");
    }

    // Validate and filter files
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file, index) => {
      // Check if file is valid File instance
      if (!(file instanceof File) || file.size === 0) {
        validationErrors.push(`File ${index + 1} (${file.name}): Invalid file`);
        return;
      }

      // Validate file type based on category
      const validation = validateFileType(category, file);
      if (!validation.valid) {
        validationErrors.push(
          `File ${index + 1} (${file.name}): ${validation.error}`,
        );
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      const errorMessage =
        validationErrors.length > 0
          ? validationErrors.join("\n")
          : "No valid files provided for upload";
      throw new Error(errorMessage);
    }

    // Log validation warnings if some files were rejected
    if (validationErrors.length > 0 && process.env.NODE_ENV === "development") {
      console.warn("Some files were rejected:", validationErrors);
    }

    const formData = new FormData();

    // Append each file with the field name "files" (backend expects array)
    validFiles.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("category", category);

    // Add subType if provided (for categories that support it)
    if (subType) {
      formData.append("subType", subType);
    }

    // Debug: Log FormData contents (for development)
    if (process.env.NODE_ENV === "development") {
      console.log("Uploading files:", {
        recordId,
        category,
        subType,
        fileCount: validFiles.length,
        fileNames: validFiles.map((f) => f.name),
      });
    }

    const { data } = await api.post(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.UPLOAD(recordId)),
      formData,
    );

    return data.data || data;
  },

  /**
   * Get file metadata by ID
   * GET /api/files/:id
   */
  async getFileById(id: string): Promise<IFile> {
    const { data } = await api.get(path.files(ENDPOINTS.FILES.BY_ID(id)));
    return data.data || data;
  },

  /**
   * Get signed URL for file download
   * GET /api/files/:id/download
   */
  async getDownloadUrl(id: string): Promise<string> {
    const { data } = await api.get(path.files(ENDPOINTS.FILES.DOWNLOAD(id)));
    return data.data?.signedUrl || data.signedUrl;
  },

  /**
   * Delete file (supports all file types)
   * DELETE /api/files/:id
   *
   * ⚠️ Warning: This action is PERMANENT and cannot be undone!
   *
   * Backend automatically:
   * - Deletes file from storage
   * - Deletes file record from database
   * - Renumbers remaining files' positions
   */
  async deleteFile(id: string): Promise<void> {
    await api.delete(path.files(ENDPOINTS.FILES.DELETE(id)));
  },

  /**
   * Replace file by ID (preserves category, subType, position)
   * PUT /api/files/:fileId/replace
   *
   * Backend automatically:
   * - Deletes old file from storage
   * - Uploads new file
   * - Creates new record with same position
   * - Deletes old record
   */
  async replaceFileById(
    fileId: string,
    newFile: File,
  ): Promise<IFileUploadResponse> {
    const formData = new FormData();
    formData.append("file", newFile);

    const { data } = await api.put(
      path.files(`/${fileId}/replace`),
      formData,
    );

    return data.data || data;
  },

  /**
   * Get all files for a collection record
   * GET /api/collection-records/:recordId/files
   */
  async getRecordFiles(recordId: string): Promise<ICollectionRecordFiles> {
    const { data } = await api.get(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.FILES(recordId)),
    );
    return data.data || data;
  },

  /**
   * Replace file for a collection record
   * PUT /api/collection-records/:recordId/upload/:fileId
   * Backend automatically preserves category, subType, and position
   */
  async replaceRecordFile(
    recordId: string,
    fileId: string,
    file: File,
  ): Promise<IFileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.put(
      path.collectionRecords(
        ENDPOINTS.COLLECTION_RECORDS.REPLACE_FILE(recordId, fileId),
      ),
      formData,
    );

    return data.data || data;
  },

  /**
   * @deprecated Use replaceRecordFile or replaceFileById instead
   * Replace file at specific position (DEPRECATED)
   * This method is kept for backwards compatibility
   */
  async replaceFileByPosition(
    recordId: string,
    category: FileType,
    position: number,
    file: File,
  ): Promise<IFileUploadResponse> {
    console.warn(
      "replaceFileByPosition is deprecated. Use replaceRecordFile or replaceFileById instead.",
    );

    // Validate file type based on category
    const validation = validateFileType(category, file);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid file type");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const { data } = await api.put(
      path.collectionRecords(
        ENDPOINTS.COLLECTION_RECORDS.REPLACE_FILE(recordId, position.toString()),
      ),
      formData,
    );

    return data.data || data;
  },
};
