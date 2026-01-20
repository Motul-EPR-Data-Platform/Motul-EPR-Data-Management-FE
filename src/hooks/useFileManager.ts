import { useState, useCallback } from "react";
import { IFile, IFileWithSignedUrl } from "@/types/file-record";
import { FileRecordService } from "@/lib/services/file-record.service";
import { toast } from "sonner";

interface FileWithPreview extends File {
  preview?: string;
}

export interface ManagedFile {
  id: string; // Unique ID (for new files, use temp ID; for uploaded, use server ID)
  file?: File; // File object (for new/pending uploads)
  fileData?: IFile | IFileWithSignedUrl; // Server file data (for existing files)
  status: "pending" | "uploading" | "uploaded" | "error" | "deleting";
  isReplacement?: boolean; // ✅ Track if this is a replacement of an existing file
  replacedFileId?: string; // ✅ ID of the file being replaced
  error?: string;
  position?: number;
  preview?: string; // For image previews
}

interface UseFileManagerReturn {
  files: ManagedFile[];
  fileIds: string[]; // IDs of successfully uploaded files
  isUploading: boolean;
  hasChanges: boolean;

  // Add files (for upload later or immediate upload)
  addFiles: (newFiles: File[]) => void;

  // Remove a file (delete if uploaded, or remove from pending list)
  removeFile: (fileId: string) => Promise<void>;

  // Replace a file
  replaceFile: (fileId: string, newFile: File) => void;

  // Reorder files
  reorderFiles: (fromIndex: number, toIndex: number) => void;

  // Get uploaded file IDs (for entity creation/update)
  getUploadedFileIds: () => string[];

  // ✅ Get files that need to be uploaded (new files, not replacements)
  getNewFiles: () => File[];

  // ✅ Get files that are replacements
  getReplacementFiles: () => Array<{ fileId: string; newFile: File }>;

  // Load existing files (when editing entity)
  loadExistingFiles: (existingFiles: IFileWithSignedUrl[]) => void;

  // Clear all files
  clearFiles: () => void;

  // Mark as saved (reset hasChanges)
  markAsSaved: () => void;
}

/**
 * Custom hook for managing files with local state and server operations
 *
 * Supports all entity types:
 * - Waste owner contract files
 * - Recycler profile files
 * - WTP profile files
 * - Collection record files
 *
 * @param maxFiles Maximum number of files allowed
 * @param autoGeneratePreview Whether to automatically generate preview URLs for images
 */
export function useFileManager(
  maxFiles: number = 3,
  autoGeneratePreview: boolean = true,
): UseFileManagerReturn {
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if any file is currently uploading
  const isUploading = files.some(
    (f) => f.status === "uploading" || f.status === "deleting",
  );

  // Get IDs of successfully uploaded files
  const fileIds = files
    .filter((f) => f.status === "uploaded" && f.fileData?.id)
    .map((f) => f.fileData!.id);

  /**
   * Add new files to the manager
   */
  const addFiles = useCallback(
    (newFiles: File[]) => {
      if (newFiles.length === 0) return;

      // Check if adding would exceed max
      const availableSlots = maxFiles - files.length;
      if (availableSlots <= 0) {
        toast.error(`Số lượng file tối đa là ${maxFiles}`);
        return;
      }

      const filesToAdd = newFiles.slice(0, availableSlots);
      if (filesToAdd.length < newFiles.length) {
        toast.warning(
          `Chỉ có thể thêm ${filesToAdd.length} file (tối đa ${maxFiles} file)`,
        );
      }

      const managedFiles: ManagedFile[] = filesToAdd.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        file,
        status: "pending" as const,
        position: files.length + index + 1,
        preview: autoGeneratePreview ? URL.createObjectURL(file) : undefined,
      }));

      setFiles((prev) => [...prev, ...managedFiles]);
      setHasChanges(true);
    },
    [files.length, maxFiles, autoGeneratePreview],
  );

  /**
   * Remove a file (delete from server if uploaded, or just remove from list)
   */
  const removeFile = useCallback(
    async (fileId: string) => {
      const fileToRemove = files.find((f) => f.id === fileId);
      if (!fileToRemove) return;

      // If file is uploaded to server, delete it
      if (fileToRemove.status === "uploaded" && fileToRemove.fileData?.id) {
        try {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: "deleting" as const } : f,
            ),
          );

          await FileRecordService.deleteFile(fileToRemove.fileData.id);

          // Remove from list after successful delete
          setFiles((prev) => {
            const filtered = prev.filter((f) => f.id !== fileId);
            // Renumber positions
            return filtered.map((f, index) => ({
              ...f,
              position: index + 1,
            }));
          });

          setHasChanges(true);
          toast.success("Xóa file thành công");
        } catch (error: any) {
          console.error("Error deleting file:", error);
          toast.error(error.message || "Không thể xóa file");
          // Revert status
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: "uploaded" as const } : f,
            ),
          );
        }
      } else {
        // Just remove from list (pending file)
        setFiles((prev) => {
          const filtered = prev.filter((f) => f.id !== fileId);
          // Renumber positions
          return filtered.map((f, index) => ({
            ...f,
            position: index + 1,
          }));
        });
        setHasChanges(true);
      }

      // Clean up preview URL
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
    },
    [files],
  );

  /**
   * Replace a file with a new one
   */
  const replaceFile = useCallback(
    (fileId: string, newFile: File) => {
      const fileToReplace = files.find((f) => f.id === fileId);
      if (!fileToReplace) return;

      // Clean up old preview (if it was a local File preview)
      if (fileToReplace.preview && fileToReplace.file) {
        URL.revokeObjectURL(fileToReplace.preview);
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                file: newFile,
                fileData: undefined, // Clear old fileData so new file is shown
                status: "pending" as const,
                isReplacement: true, // ✅ Mark as replacement
                replacedFileId: fileId, // ✅ Store the ID of the file being replaced
                preview: URL.createObjectURL(newFile), // Always generate preview for replaced file
              }
            : f,
        ),
      );
      setHasChanges(true);
    },
    [files],
  );

  /**
   * Reorder files by dragging
   */
  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const [removed] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, removed);

      // Renumber positions
      return newFiles.map((f, index) => ({
        ...f,
        position: index + 1,
      }));
    });
    setHasChanges(true);
  }, []);

  /**
   * Get uploaded file IDs (for creating/updating entity)
   */
  const getUploadedFileIds = useCallback(() => {
    return files
      .filter((f) => f.status === "uploaded" && f.fileData?.id)
      .map((f) => f.fileData!.id);
  }, [files]);

  /**
   * Get new files that need to be uploaded (not replacements)
   */
  const getNewFiles = useCallback(() => {
    return files
      .filter((f) => f.status === "pending" && f.file && !f.isReplacement)
      .map((f) => f.file!);
  }, [files]);

  /**
   * Get files that are replacements
   */
  const getReplacementFiles = useCallback(() => {
    return files
      .filter((f) => f.status === "pending" && f.file && f.isReplacement && f.replacedFileId)
      .map((f) => ({
        fileId: f.replacedFileId!,
        newFile: f.file!,
      }));
  }, [files]);

  /**
   * Load existing files from server (when editing)
   */
  const loadExistingFiles = useCallback(
    (existingFiles: IFileWithSignedUrl[]) => {
      // Clear any previous preview URLs first
      setFiles((prevFiles) => {
        prevFiles.forEach((f) => {
          if (f.preview && f.file) {
            URL.revokeObjectURL(f.preview);
          }
        });

        // Map new files
        return existingFiles.map((file, index) => ({
          id: file.id,
          fileData: file,
          status: "uploaded" as const,
          position: file.position || index + 1,
          preview: file.signedUrl,
        }));
      });
      setHasChanges(false);
    },
    [],
  );

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    // Clean up all preview URLs using functional update
    setFiles((prevFiles) => {
      prevFiles.forEach((f) => {
        if (f.preview && f.file) {
          URL.revokeObjectURL(f.preview);
        }
      });
      return [];
    });
    setHasChanges(false);
  }, []); // Empty deps - stable function

  /**
   * Mark current state as saved (reset hasChanges flag)
   */
  const markAsSaved = useCallback(() => {
    setHasChanges(false);
  }, []);

  return {
    files,
    fileIds,
    isUploading,
    hasChanges,
    addFiles,
    removeFile,
    replaceFile,
    reorderFiles,
    getUploadedFileIds,
    getNewFiles, // ✅ Added
    getReplacementFiles, // ✅ Added
    loadExistingFiles,
    clearFiles,
    markAsSaved,
  };
}

