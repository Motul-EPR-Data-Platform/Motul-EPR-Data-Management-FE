import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  IFile,
  IFileUploadInput,
  IFileUploadResponse,
  ICollectionRecordFiles,
  FileType,
} from "@/types/file-record";
import { validateFileType } from "@/lib/validations/file-record.validation";

export const FileRecordService = {
  /**
   * Upload single file to a collection record
   * POST /api/collection-records/:recordId/upload
   */
  async uploadFile(
    recordId: string,
    input: IFileUploadInput
  ): Promise<IFileUploadResponse> {
    // Validate file type based on category
    const validation = validateFileType(input.category, input.file);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid file type");
    }

    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("category", input.category);
    
    if (input.position !== undefined) {
      formData.append("position", input.position.toString());
    }
    
    if (input.metadata) {
      formData.append("metadata", JSON.stringify(input.metadata));
    }

    const { data } = await api.post(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.UPLOAD(recordId)),
      formData
    );
    
    return data.data || data;
  },

  /**
   * Upload multiple files to a collection record
   * POST /api/collection-records/:recordId/upload-multiple
   */
  async uploadMultipleFiles(
    recordId: string,
    files: File[],
    category: FileType
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
          `File ${index + 1} (${file.name}): ${validation.error}`
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

    // Debug: Log FormData contents (for development)
    if (process.env.NODE_ENV === "development") {
      console.log("Uploading files:", {
        recordId,
        category,
        fileCount: validFiles.length,
        fileNames: validFiles.map((f) => f.name),
      });
    }

    const { data } = await api.post(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.UPLOAD_MULTIPLE(recordId)),
      formData
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
    const { data } = await api.get(
      path.files(ENDPOINTS.FILES.DOWNLOAD(id))
    );
    return data.data?.signedUrl || data.signedUrl;
  },

  /**
   * Delete file
   * DELETE /api/files/:id
   */
  async deleteFile(id: string): Promise<void> {
    await api.delete(path.files(ENDPOINTS.FILES.BY_ID(id)));
  },

  /**
   * Get all files for a collection record
   * GET /api/collection-records/:recordId/files
   */
  async getRecordFiles(recordId: string): Promise<ICollectionRecordFiles> {
    const { data } = await api.get(
      path.collectionRecords(ENDPOINTS.COLLECTION_RECORDS.FILES(recordId))
    );
    return data.data || data;
  },
};

