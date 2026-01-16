import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { FileType } from "@/types/file-record";
import { getFileId, mapDocumentTypeToFileType } from "./collectionRecordHelpers";
import type { MutableRefObject } from "react";

export interface FileUploadTracking {
  evidenceFiles: Set<string>;
  qualityMetricsFiles: Set<string>;
  outputQualityMetricsFiles: Set<string>;
  recycledPhoto: string | null;
  stockpilePhoto: string | null;
}

export interface OriginalFileRefs {
  recycledPhoto: File | null;
  stockpilePhoto: File | null;
}

export interface OriginalFileIds {
  evidencePhotos: Set<string>;
  qualityMetrics: Set<string>;
  outputQualityMetrics: Set<string>;
  recycledPhoto: string | null;
  stockpilePhoto: string | null;
}

const EVIDENCE_SUBTYPES = new Set([
  "weighing_slip",
  "delivery_receipt",
  "vehicle_license_plate",
  "other",
]);

/**
 * Check if a file ID is new (not in original set) - for edit mode
 */
export const isNewFileId = (
  fileId: string,
  originalFileIds: OriginalFileIds,
): boolean => {
  return (
    !originalFileIds.evidencePhotos.has(fileId) &&
    !originalFileIds.qualityMetrics.has(fileId) &&
    !originalFileIds.outputQualityMetrics.has(fileId) &&
    originalFileIds.recycledPhoto !== fileId &&
    originalFileIds.stockpilePhoto !== fileId
  );
};

/**
 * Check if a single File is new (different from original) - for edit mode
 */
export const isNewSingleFile = (
  currentFile: File | null,
  originalFile: File | null,
): boolean => {
  if (!currentFile) {
    return false;
  }
  if (!originalFile) {
    return true;
  }
  // Compare file references - if they're different objects, it's a new file
  return currentFile !== originalFile;
};

/**
 * Upload files for a record (create mode - tracks by file ID)
 */
export const uploadFilesForRecordCreate = async (
  recordId: string,
  evidenceFiles: DocumentFile[],
  qualityDocuments: DocumentFile[],
  recycledPhoto: File | null,
  stockpilePhoto: File | null,
  uploadedFilesRef: MutableRefObject<FileUploadTracking>,
): Promise<void> => {
  const uploadPromises: Promise<any>[] = [];

  // Upload evidence photos (from Step 2) - only new/changed files
  if (evidenceFiles && evidenceFiles.length > 0) {
    const evidenceBySubType = new Map<string, File[]>();

    evidenceFiles.forEach((doc) => {
      if (!doc?.file || !(doc.file instanceof File)) return;
      if (!EVIDENCE_SUBTYPES.has(doc.type)) return;
      if (!evidenceBySubType.has(doc.type)) {
        evidenceBySubType.set(doc.type, []);
      }
      evidenceBySubType.get(doc.type)!.push(doc.file);
    });

    evidenceBySubType.forEach((files, subType) => {
      const newEvidencePhotos = files.filter((file) => {
        const fileId = getFileId(file);
        return !uploadedFilesRef.current.evidenceFiles.has(fileId);
      });

      if (newEvidencePhotos.length > 0) {
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            newEvidencePhotos,
            FileType.EVIDENCE_PHOTO,
            subType,
          ).then(() => {
            newEvidencePhotos.forEach((file) => {
              uploadedFilesRef.current.evidenceFiles.add(getFileId(file));
            });
          }),
        );
      }
    });
  }

  // Upload stockpile photo (from Step 3) - only if changed
  if (stockpilePhoto) {
    const fileId = getFileId(stockpilePhoto);
    if (uploadedFilesRef.current.stockpilePhoto !== fileId) {
      uploadPromises.push(
        CollectionRecordService.uploadFile(recordId, {
          file: stockpilePhoto,
          category: FileType.STOCKPILE_PHOTO,
        }).then(() => {
          uploadedFilesRef.current.stockpilePhoto = fileId;
        }),
      );
    }
  }

  // Upload recycled photo (from Step 3) - only if changed
  if (recycledPhoto) {
    const fileId = getFileId(recycledPhoto);
    if (uploadedFilesRef.current.recycledPhoto !== fileId) {
      uploadPromises.push(
        CollectionRecordService.uploadFile(recordId, {
          file: recycledPhoto,
          category: FileType.RECYCLED_PHOTO,
        }).then(() => {
          uploadedFilesRef.current.recycledPhoto = fileId;
        }),
      );
    }
  }

  // Upload quality documents (from Step 3) - only new/changed files
  if (qualityDocuments && qualityDocuments.length > 0) {
    const qualityMetricsFiles = qualityDocuments
      .filter(
        (doc) => doc && doc.file && doc.type === "chat-luong-truoc-tai-che",
      )
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    const outputQualityMetricsFiles = qualityDocuments
      .filter(
        (doc) => doc && doc.file && doc.type === "chat-luong-sau-tai-che",
      )
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    // Filter out already uploaded quality metrics files
    const newQualityMetricsFiles = qualityMetricsFiles.filter((file) => {
      const fileId = getFileId(file);
      return !uploadedFilesRef.current.qualityMetricsFiles.has(fileId);
    });

    if (newQualityMetricsFiles.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          newQualityMetricsFiles,
          FileType.QUALITY_METRICS,
        ).then(() => {
          // Mark as uploaded
          newQualityMetricsFiles.forEach((file) => {
            uploadedFilesRef.current.qualityMetricsFiles.add(getFileId(file));
          });
        }),
      );
    }

    // Filter out already uploaded output quality metrics files
    const newOutputQualityMetricsFiles = outputQualityMetricsFiles.filter(
      (file) => {
        const fileId = getFileId(file);
        return !uploadedFilesRef.current.outputQualityMetricsFiles.has(fileId);
      },
    );

    if (newOutputQualityMetricsFiles.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          newOutputQualityMetricsFiles,
          FileType.OUTPUT_QUALITY_METRICS,
        ).then(() => {
          // Mark as uploaded
          newOutputQualityMetricsFiles.forEach((file) => {
            uploadedFilesRef.current.outputQualityMetricsFiles.add(
              getFileId(file),
            );
          });
        }),
      );
    }
  }

  // Execute all uploads in parallel
  if (uploadPromises.length > 0) {
    await Promise.all(uploadPromises);
  }
};

/**
 * Upload files for a record (edit mode - tracks by original file IDs)
 */
export const uploadFilesForRecordEdit = async (
  recordId: string,
  evidenceFiles: DocumentFile[],
  qualityDocuments: DocumentFile[],
  recycledPhoto: File | null,
  stockpilePhoto: File | null,
  originalFileIds: OriginalFileIds,
  originalFileRefs: OriginalFileRefs,
): Promise<void> => {
  const uploadPromises: Promise<any>[] = [];

  // Only upload evidence photos that are new (not in original set)
  if (evidenceFiles && evidenceFiles.length > 0) {
    const newEvidenceFiles = evidenceFiles.filter((doc) =>
      isNewFileId(doc.id, originalFileIds),
    );

    const evidenceBySubType = new Map<string, File[]>();

    newEvidenceFiles.forEach((doc) => {
      if (!(doc.file instanceof File)) return;
      if (!EVIDENCE_SUBTYPES.has(doc.type)) return;
      if (!evidenceBySubType.has(doc.type)) {
        evidenceBySubType.set(doc.type, []);
      }
      evidenceBySubType.get(doc.type)!.push(doc.file);
    });

    evidenceBySubType.forEach((files, subType) => {
      if (files.length === 0) return;
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          files,
          FileType.EVIDENCE_PHOTO,
          subType,
        ),
      );
    });
  }

  // Only upload quality documents that are new
  if (qualityDocuments && qualityDocuments.length > 0) {
    for (const doc of qualityDocuments) {
      if (doc.file instanceof File && isNewFileId(doc.id, originalFileIds)) {
        const category = mapDocumentTypeToFileType(doc.type);
        uploadPromises.push(
          CollectionRecordService.uploadFile(recordId, {
            file: doc.file,
            category,
          }),
        );
      }
    }
  }

  // Upload stockpile photo only if it's new (different from original)
  if (
    stockpilePhoto instanceof File &&
    isNewSingleFile(stockpilePhoto, originalFileRefs.stockpilePhoto)
  ) {
    uploadPromises.push(
      CollectionRecordService.uploadFile(recordId, {
        file: stockpilePhoto,
        category: FileType.STOCKPILE_PHOTO,
      }),
    );
  }

  // Upload recycled photo only if it's new (different from original)
  if (
    recycledPhoto instanceof File &&
    isNewSingleFile(recycledPhoto, originalFileRefs.recycledPhoto)
  ) {
    uploadPromises.push(
      CollectionRecordService.uploadFile(recordId, {
        file: recycledPhoto,
        category: FileType.RECYCLED_PHOTO,
      }),
    );
  }

  if (uploadPromises.length > 0) {
    await Promise.all(uploadPromises);
  }
};

