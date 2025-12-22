// File category enum
export enum FileType {
  EVIDENCE_PHOTO = 'evidence_photo',
  STOCKPILE_PHOTO = 'stockpile_photo',
  RECYCLED_PHOTO = 'recycled_photo',
  ACCEPTANCE_DOC = 'acceptance_doc',
  OUTPUT_QUALITY_METRICS = 'output_quality_metrics',
  QUALITY_METRICS = 'quality_metrics',
  APPROVAL_DOC = 'approval_doc', // Approval certificate/document
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
}

// File upload input
export interface IFileUploadInput {
  file: File;
  category: FileType;
  recordId?: string;
  position?: number;
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
  stockpiledFlag: boolean;
}): IFileValidationResult => {
  const missing: string[] = [];
  
  // Evidence photos are always required (at least 1)
  if (!params.evidencePhotos || params.evidencePhotos.length === 0) {
    missing.push('evidence_photo');
  }
  
  // Recycled photo is always required
  if (!params.recycledPhoto) {
    missing.push('recycled_photo');
  }
  
  // Stockpile photo is required only if stockpiled flag is true
  if (params.stockpiledFlag && !params.stockpilePhoto) {
    missing.push('stockpile_photo');
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
};

