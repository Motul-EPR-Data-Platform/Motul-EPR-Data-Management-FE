// Entity types for file operations
export enum EntityType {
  COLLECTION_RECORD = "collection_record",
  RECYCLER_PROFILE = "recycler_profile",
  WASTE_TRANSFER_PROFILE = "waste_transfer_profile",
}

// Entity identifier for file operations
export interface IEntityIdentifier {
  type: EntityType;
  id: string;
}

// File category enum - Combined for both records and profiles
export enum FileType {
  // For collection records
  EVIDENCE_PHOTO = "evidence_photo",
  STOCKPILE_PHOTO = "stockpile_photo",
  RECYCLED_PHOTO = "recycled_photo",
  ACCEPTANCE_DOC = "acceptance_doc",
  OUTPUT_QUALITY_METRICS = "output_quality_metrics",
  QUALITY_METRICS = "quality_metrics",
  APPROVAL_DOC = "approval_doc", // Approval certificate/document
  HAZ_WASTE_CERTIFICATE = "haz_waste_certificate",
  // For recycler profile creation
  ENVIRONMENTAL_PERMIT_FILE = "environmental_permit_file",
  BUSINESS_REG_FILE = "business_reg_file",
  // For waste transfer point profile creation
  WTP_CONFIRMATION_LETTER = "wtp_confirmation_letter",
  RECYCLING_SERVICE_AGREEMENT = "recycling_service_agreement",
  // For waste owner contracts
  WASTE_OWNER_CONTRACT = "waste_owner_contract",
}

// File metadata interface
export interface IFile {
  readonly id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  s3Key: string;
  uploadedBy: string;
  uploadedAt: string; // ISO date string
  metadata?: Record<string, any> | null;
  category: FileType;
  position?: number; // For ordering multiple files
  recordId?: string | null; // Link to collection record
  recyclerProfileId?: string | null; // Link to recycler profile
  wtpProfileId?: string | null; // Link to WTP profile
  wasteOwnerId?: string | null; // Link to waste owner
}

// File upload input
export interface IFileUploadInput {
  file: File;
  category: FileType;
  recordId?: string;
  position?: number;
  subType?: string; // For categories that support sub-types
  metadata?: Record<string, any>;
}

// File upload response
export interface IFileUploadResponse {
  file: IFile;
}

// Collection record files structure
export interface ICollectionRecordFiles {
  evidencePhotos: IFile[];
  stockpilePhoto: IFile | null;
  recycledPhoto: IFile | null;
  acceptanceDoc: IFile | null;
  approvalDoc: IFile | null; // Approval certificate/document
  outputQualityMetrics: IFile | null;
  qualityMetrics: IFile | null;
  hazWasteCertificates: IFile[];
}

// File with signed URL for preview
export interface IFileWithSignedUrl extends IFile {
  signedUrl: string;
}

// Collection record files with signed URLs for preview
export interface ICollectionRecordFilesWithPreview {
  evidencePhotos: IFileWithSignedUrl[];
  stockpilePhoto: IFileWithSignedUrl | null;
  recycledPhoto: IFileWithSignedUrl | null;
  acceptanceDoc: IFileWithSignedUrl | null;
  outputQualityMetrics: IFileWithSignedUrl | null;
  qualityMetrics: IFileWithSignedUrl | null;
  hazWasteCertificates: IFileWithSignedUrl[];
}

// Recycler profile files with signed URLs for preview
export interface IRecyclerProfileFilesWithPreview {
  businessRegFile: IFileWithSignedUrl | null;
  environmentalPermitFile: IFileWithSignedUrl | null;
}

// Waste owner contract files with signed URLs for preview
export interface IWasteOwnerFilesWithPreview {
  wasteOwnerContract: IFileWithSignedUrl[];
}

// File upload response with multiple files
export interface IMultipleFileUploadResponse {
  success: boolean;
  message: string;
  data: IFile[];
  fileIds: string[];
  count: number;
}

// Replace file input interface
export interface IReplaceFileInput {
  fileId: string;
  newFile: File;
  uploadedBy: string;
}

// File validation result
export interface IFileValidationResult {
  valid: boolean;
  missing: string[];
}

// Validate required files for record submission
export const validateRequiredFiles = (params: {
  evidencePhotos: IFile[];
  recycledPhoto: IFile | null;
  stockpilePhoto: IFile | null;
  hazWasteCertificates: IFile[];
  stockpiledFlag: boolean;
}): IFileValidationResult => {
  const missing: string[] = [];

  // Evidence photos are always required (at least 1)
  if (!params.evidencePhotos || params.evidencePhotos.length === 0) {
    missing.push("evidence_photo");
  }

  // Recycled photo is always required
  if (!params.recycledPhoto) {
    missing.push("recycled_photo");
  }

  // Stockpile photo is required only if stockpiled flag is true
  if (params.stockpiledFlag && !params.stockpilePhoto) {
    missing.push("stockpile_photo");
  }

  if (!params.hazWasteCertificates || params.hazWasteCertificates.length === 0) {
    missing.push("haz_waste_certificate");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};
