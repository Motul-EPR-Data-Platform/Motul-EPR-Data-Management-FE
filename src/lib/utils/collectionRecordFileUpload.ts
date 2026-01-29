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

  // Upload evidence photos (from Step 2) - group by subType and upload
  if (evidenceFiles && evidenceFiles.length > 0) {
    // Filter valid evidence files
    const validEvidenceFiles = evidenceFiles.filter(
      (doc) =>
        doc &&
        doc.file instanceof File &&
        ["phieu-can", "bien-ban-giao-nhan", "bien-so-xe", "khac"].includes(
          doc.type,
        ),
    );

    // Group files by subType
    const filesBySubType = validEvidenceFiles.reduce(
      (acc, doc) => {
        // Map frontend types to backend subTypes
        const subTypeMap: Record<string, string> = {
          "phieu-can": "weighing_slip",
          "bien-ban-giao-nhan": "delivery_receipt",
          "bien-so-xe": "vehicle_license_plate",
          "khac": "other",
        };
        const subType = subTypeMap[doc.type] || doc.type;

        if (!acc[subType]) {
          acc[subType] = [];
        }
        acc[subType].push({ file: doc.file, id: getFileId(doc.file) });
        return acc;
      },
      {} as Record<string, Array<{ file: File; id: string }>>,
    );

    // Upload each subType group separately
    for (const [subType, files] of Object.entries(filesBySubType)) {
      // Filter out already uploaded files
      const newFiles = files.filter(
        ({ id }) => !uploadedFilesRef.current.evidenceFiles.has(id),
      );

      if (newFiles.length > 0) {
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            newFiles.map((f) => f.file),
            FileType.EVIDENCE_PHOTO,
            subType,
          ).then(() => {
            // Mark as uploaded
            newFiles.forEach(({ id }) => {
              uploadedFilesRef.current.evidenceFiles.add(id);
            });
          }),
        );
      }
    }
  }

  // Upload stockpile photos (from Step 3) - group by subType and upload
  if (stockpilePhotos && stockpilePhotos.length > 0) {
    // Filter valid stockpile files
    const validStockpileFiles = stockpilePhotos.filter(
      (doc) => doc && doc.file instanceof File,
    );

    // Group files by subType - stockpile types are already in backend format
    const filesBySubType = validStockpileFiles.reduce(
      (acc, doc) => {
        const subType = doc.type || "other";
        if (!acc[subType]) {
          acc[subType] = [];
        }
        acc[subType].push({ file: doc.file, id: getFileId(doc.file) });
        return acc;
      },
      {} as Record<string, Array<{ file: File; id: string }>>,
    );

    // Upload each subType group separately
    for (const [subType, files] of Object.entries(filesBySubType)) {
      const newFiles = files.filter(
        ({ id }) => !uploadedFilesRef.current.stockpilePhotos.has(id),
      );

      if (newFiles.length > 0) {
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            newFiles.map((f) => f.file),
            FileType.STOCKPILE_PHOTO,
            subType,
          ).then(() => {
            newFiles.forEach(({ id }) => {
              uploadedFilesRef.current.stockpilePhotos.add(id);
            });
          }),
        );
      }
    }
  }

  // Upload recycled photos (from Step 3) - group by subType and upload
  if (recycledPhotos && recycledPhotos.length > 0) {
    // Filter valid recycled files
    const validRecycledFiles = recycledPhotos.filter(
      (doc) => doc && doc.file instanceof File,
    );

    // Group files by subType - recycled types are already in backend format
    const filesBySubType = validRecycledFiles.reduce(
      (acc, doc) => {
        const subType = doc.type || "other";
        if (!acc[subType]) {
          acc[subType] = [];
        }
        acc[subType].push({ file: doc.file, id: getFileId(doc.file) });
        return acc;
      },
      {} as Record<string, Array<{ file: File; id: string }>>,
    );

    // Upload each subType group separately
    for (const [subType, files] of Object.entries(filesBySubType)) {
      const newFiles = files.filter(
        ({ id }) => !uploadedFilesRef.current.recycledPhotos.has(id),
      );

      if (newFiles.length > 0) {
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            newFiles.map((f) => f.file),
            FileType.RECYCLED_PHOTO,
            subType,
          ).then(() => {
            newFiles.forEach(({ id }) => {
              uploadedFilesRef.current.recycledPhotos.add(id);
            });
          }),
        );
      }
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

  // Only upload evidence photos that are new (not in original set) - group by subType
  if (evidenceFiles && evidenceFiles.length > 0) {
    const newEvidenceFiles = evidenceFiles.filter(
      (doc) => doc.file instanceof File && isNewFileId(doc.id, originalFileIds),
    );

    // Group by subType
    const filesBySubType = newEvidenceFiles.reduce(
      (acc, doc) => {
        // Map frontend types to backend subTypes
        const subTypeMap: Record<string, string> = {
          "phieu-can": "weighing_slip",
          "bien-ban-giao-nhan": "delivery_receipt",
          "bien-so-xe": "vehicle_license_plate",
          "khac": "other",
        };
        const subType = subTypeMap[doc.type] || doc.type;

        if (!acc[subType]) {
          acc[subType] = [];
        }
        acc[subType].push(doc.file);
        return acc;
      },
      {} as Record<string, File[]>,
    );

    // Upload each subType group separately
    for (const [subType, files] of Object.entries(filesBySubType)) {
      if (files.length > 0) {
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            files,
            FileType.EVIDENCE_PHOTO,
            subType,
          ),
        );
      }
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

  // Upload stockpile photos only if they are new - group by subType
  if (stockpilePhotos && stockpilePhotos.length > 0) {
    const newStockpilePhotos = stockpilePhotos.filter(
      (doc) => doc.file instanceof File && isNewFileId(doc.id, originalFileIds),
    );

    // Group by subType
    const filesBySubType = newStockpilePhotos.reduce(
      (acc, doc) => {
        const subType = doc.type || "other";
        if (!acc[subType]) {
          acc[subType] = [];
        }
        acc[subType].push(doc.file);
        return acc;
      },
      {} as Record<string, File[]>,
    );

    // Upload each subType group separately
    for (const [subType, files] of Object.entries(filesBySubType)) {
      if (files.length > 0) {
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            files,
            FileType.STOCKPILE_PHOTO,
            subType,
          ),
        );
      }
    }
  }

  // Upload recycled photos only if they are new - group by subType
  if (recycledPhotos && recycledPhotos.length > 0) {
    const newRecycledPhotos = recycledPhotos.filter(
      (doc) => doc.file instanceof File && isNewFileId(doc.id, originalFileIds),
    );

    // Group by subType
    const filesBySubType = newRecycledPhotos.reduce(
      (acc, doc) => {
        const subType = doc.type || "other";
        if (!acc[subType]) {
          acc[subType] = [];
        }
        acc[subType].push(doc.file);
        return acc;
      },
      {} as Record<string, File[]>,
    );

    // Upload each subType group separately
    for (const [subType, files] of Object.entries(filesBySubType)) {
      if (files.length > 0) {
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            files,
            FileType.RECYCLED_PHOTO,
            subType,
          ),
        );
      }
    }
  }

  if (uploadPromises.length > 0) {
    await Promise.all(uploadPromises);
  }
};

