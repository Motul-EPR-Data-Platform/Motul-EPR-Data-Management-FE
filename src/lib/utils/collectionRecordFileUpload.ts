import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { FileType } from "@/types/file-record";
import { getFileId, mapDocumentTypeToFileType } from "./collectionRecordHelpers";
import type { MutableRefObject } from "react";

export interface FileUploadTracking {
  evidenceFiles: Set<string>;
  qualityMetricsFiles: Set<string>;
  outputQualityMetricsFiles: Set<string>;
  hazWasteCertificates: Set<string>;
  recycledPhotos: Set<string>;
  stockpilePhotos: Set<string>;
}

export interface OriginalFileRefs {
  recycledPhotos: DocumentFile[];
  stockpilePhotos: DocumentFile[];
}

export interface OriginalFileIds {
  evidencePhotos: Set<string>;
  qualityMetrics: Set<string>;
  outputQualityMetrics: Set<string>;
  hazWasteCertificates: Set<string>;
  recycledPhotos: Set<string>;
  stockpilePhotos: Set<string>;
}

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
    !originalFileIds.hazWasteCertificates.has(fileId) &&
    !originalFileIds.recycledPhotos.has(fileId) &&
    !originalFileIds.stockpilePhotos.has(fileId)
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
  hazWasteCertificates: DocumentFile[],
  recycledPhotos: DocumentFile[],
  stockpilePhotos: DocumentFile[],
  uploadedFilesRef: MutableRefObject<FileUploadTracking>,
): Promise<void> => {
  const uploadPromises: Promise<any>[] = [];

  // Upload evidence photos (from Step 2) - only new/changed files
  if (evidenceFiles && evidenceFiles.length > 0) {
    const evidencePhotos = evidenceFiles
      .filter(
        (doc) =>
          doc &&
          doc.file &&
          ["phieu-can", "bien-ban-giao-nhan", "bien-so-xe", "khac"].includes(
            doc.type,
          ),
      )
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    // Filter out already uploaded files
    const newEvidencePhotos = evidencePhotos.filter((file) => {
      const fileId = getFileId(file);
      return !uploadedFilesRef.current.evidenceFiles.has(fileId);
    });

    if (newEvidencePhotos.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          newEvidencePhotos,
          FileType.EVIDENCE_PHOTO,
        ).then(() => {
          // Mark as uploaded
          newEvidencePhotos.forEach((file) => {
            uploadedFilesRef.current.evidenceFiles.add(getFileId(file));
          });
        }),
      );
    }
  }

  // Upload stockpile photos (from Step 3) - only new/changed files
  if (stockpilePhotos && stockpilePhotos.length > 0) {
    const stockpileFiles = stockpilePhotos
      .filter((doc) => doc && doc.file)
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    const newStockpileFiles = stockpileFiles.filter((file) => {
      const fileId = getFileId(file);
      return !uploadedFilesRef.current.stockpilePhotos.has(fileId);
    });

    if (newStockpileFiles.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          newStockpileFiles,
          FileType.STOCKPILE_PHOTO,
        ).then(() => {
          newStockpileFiles.forEach((file) => {
            uploadedFilesRef.current.stockpilePhotos.add(getFileId(file));
          });
        }),
      );
    }
  }

  // Upload recycled photos (from Step 3) - only new/changed files
  if (recycledPhotos && recycledPhotos.length > 0) {
    const recycledFiles = recycledPhotos
      .filter((doc) => doc && doc.file)
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    const newRecycledFiles = recycledFiles.filter((file) => {
      const fileId = getFileId(file);
      return !uploadedFilesRef.current.recycledPhotos.has(fileId);
    });

    if (newRecycledFiles.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          newRecycledFiles,
          FileType.RECYCLED_PHOTO,
        ).then(() => {
          newRecycledFiles.forEach((file) => {
            uploadedFilesRef.current.recycledPhotos.add(getFileId(file));
          });
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

  // Upload haz waste certificates (from Step 3) - only new/changed files
  if (hazWasteCertificates && hazWasteCertificates.length > 0) {
    const certFiles = hazWasteCertificates
      .filter((doc) => doc && doc.file && doc.type === "haz_waste_certificate")
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    const newCertFiles = certFiles.filter((file) => {
      const fileId = getFileId(file);
      return !uploadedFilesRef.current.hazWasteCertificates.has(fileId);
    });

    if (newCertFiles.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          newCertFiles,
          FileType.HAZ_WASTE_CERTIFICATE,
        ).then(() => {
          newCertFiles.forEach((file) => {
            uploadedFilesRef.current.hazWasteCertificates.add(getFileId(file));
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
  hazWasteCertificates: DocumentFile[],
  recycledPhotos: DocumentFile[],
  stockpilePhotos: DocumentFile[],
  originalFileIds: OriginalFileIds,
  originalFileRefs: OriginalFileRefs,
): Promise<void> => {
  const uploadPromises: Promise<any>[] = [];

  // Only upload evidence photos that are new (not in original set)
  if (evidenceFiles && evidenceFiles.length > 0) {
    const newEvidenceFiles = evidenceFiles.filter((doc) =>
      isNewFileId(doc.id, originalFileIds),
    );
    const filesToUpload = newEvidenceFiles
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    if (filesToUpload.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          filesToUpload,
          FileType.EVIDENCE_PHOTO,
        ),
      );
    }
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

  // Only upload haz waste certificates that are new
  if (hazWasteCertificates && hazWasteCertificates.length > 0) {
    const newCerts = hazWasteCertificates.filter((doc) =>
      isNewFileId(doc.id, originalFileIds),
    );
    const filesToUpload = newCerts
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    if (filesToUpload.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          filesToUpload,
          FileType.HAZ_WASTE_CERTIFICATE,
        ),
      );
    }
  }

  // Upload stockpile photos only if they are new
  if (stockpilePhotos && stockpilePhotos.length > 0) {
    const newStockpilePhotos = stockpilePhotos.filter((doc) =>
      isNewFileId(doc.id, originalFileIds),
    );
    const filesToUpload = newStockpilePhotos
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    if (filesToUpload.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          filesToUpload,
          FileType.STOCKPILE_PHOTO,
        ),
      );
    }
  }

  // Upload recycled photos only if they are new
  if (recycledPhotos && recycledPhotos.length > 0) {
    const newRecycledPhotos = recycledPhotos.filter((doc) =>
      isNewFileId(doc.id, originalFileIds),
    );
    const filesToUpload = newRecycledPhotos
      .map((doc) => doc.file)
      .filter((file): file is File => file instanceof File);

    if (filesToUpload.length > 0) {
      uploadPromises.push(
        CollectionRecordService.uploadMultipleFiles(
          recordId,
          filesToUpload,
          FileType.RECYCLED_PHOTO,
        ),
      );
    }
  }

  if (uploadPromises.length > 0) {
    await Promise.all(uploadPromises);
  }
};

