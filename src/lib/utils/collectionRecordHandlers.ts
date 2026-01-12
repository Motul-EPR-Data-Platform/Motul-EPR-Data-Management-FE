import { CreateDraftDTO, CreateDraftFormData } from "@/types/record";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { toast } from "sonner";
export type FormMode = "create" | "edit";
import {
  uploadFilesForRecordCreate,
  uploadFilesForRecordEdit,
  FileUploadTracking,
  OriginalFileRefs,
  OriginalFileIds,
} from "@/lib/utils/collectionRecordFileUpload";
import {
  buildDraftDTO,
  buildPartialDraftDTO,
  OriginalFormData,
} from "@/lib/utils/collectionRecordDTOBuilder";

interface SaveOrUpdateDraftOptions {
  mode: FormMode;
  draftId: string | null;
  formData: Partial<CreateDraftFormData>;
  collectionDate: Date;
  recycledDate: Date | undefined;
  locationRefId: string;
  originalFormData: OriginalFormData | null;
  setDraftId: (id: string | null) => void;
  showToasts?: boolean; // Whether to show success/info toasts
  checkForChanges?: boolean; // Whether to check for changes before updating (edit mode only)
  alwaysUpdate?: boolean; // Whether to always update even if no changes (for submit flow)
}

/**
 * Core helper function to save or update a draft
 * Returns the draft ID after save/update
 */
async function saveOrUpdateDraft(options: SaveOrUpdateDraftOptions): Promise<string> {
  const {
    mode,
    draftId,
    formData,
    collectionDate,
    recycledDate,
    locationRefId,
    originalFormData,
    setDraftId,
    showToasts = true,
    checkForChanges = true,
    alwaysUpdate = false,
  } = options;

  let currentDraftId = draftId;

  if (currentDraftId && mode === "edit") {
    // Update existing draft in edit mode - only send changed fields
    if (!originalFormData) {
      throw new Error("Original form data is required for edit mode");
    }
    const partialDraftData = buildPartialDraftDTO(
      formData,
      collectionDate,
      recycledDate,
      locationRefId,
      originalFormData,
    );

    // Check for changes if enabled, unless alwaysUpdate is true
    if (checkForChanges && !alwaysUpdate && Object.keys(partialDraftData).length === 0) {
      if (showToasts) {
        toast.info("Không có thay đổi nào để cập nhật");
      }
      return currentDraftId;
    }

    await CollectionRecordService.updateDraft(currentDraftId, partialDraftData as CreateDraftDTO);
    if (showToasts) {
      toast.success("Đã cập nhật bản nháp");
    }
  } else if (currentDraftId) {
    // Update existing draft (create mode but draft already exists)
    const draftData = buildDraftDTO(formData, collectionDate, recycledDate, locationRefId);
    await CollectionRecordService.updateDraft(currentDraftId, draftData);
    if (showToasts) {
      toast.success("Đã cập nhật bản nháp");
    }
  } else {
    // Create new draft
    const draftData = buildDraftDTO(formData, collectionDate, recycledDate, locationRefId);
    const result = await CollectionRecordService.createDraft(draftData);
    console.log("Draft created with ID:", result);
    currentDraftId = result.id;
    setDraftId(currentDraftId);
    if (showToasts) {
      toast.success("Đã lưu bản nháp");
    }
  }

  return currentDraftId;
}

interface SaveDraftParams {
  mode: FormMode;
  draftId: string | null;
  formData: Partial<CreateDraftFormData>;
  collectionDate: Date;
  recycledDate: Date | undefined;
  locationRefId: string;
  evidenceFiles: DocumentFile[];
  qualityDocuments: DocumentFile[];
  recycledPhoto: File | null;
  stockpilePhoto: File | null;
  originalFormData: OriginalFormData | null;
  uploadedFilesRef: React.MutableRefObject<FileUploadTracking>;
  originalFileIdsRef: React.MutableRefObject<OriginalFileIds>;
  originalFileRefsRef: React.MutableRefObject<OriginalFileRefs>;
  setDraftId: (id: string | null) => void;
  router: any;
}

export const handleSaveDraft = async (params: SaveDraftParams): Promise<string | null> => {
  const {
    mode,
    draftId,
    formData,
    collectionDate,
    recycledDate,
    locationRefId,
    evidenceFiles,
    qualityDocuments,
    recycledPhoto,
    stockpilePhoto,
    originalFormData,
    uploadedFilesRef,
    originalFileIdsRef,
    originalFileRefsRef,
    setDraftId,
    router,
  } = params;

  // Save/Update draft using shared helper
  const currentDraftId = await saveOrUpdateDraft({
    mode,
    draftId,
    formData,
    collectionDate,
    recycledDate,
    locationRefId,
    originalFormData,
    setDraftId,
    showToasts: true,
    checkForChanges: true,
    alwaysUpdate: false,
  });

  // Upload files after draft is created/updated
  if (
    currentDraftId &&
    (evidenceFiles.length > 0 ||
      qualityDocuments.length > 0 ||
      recycledPhoto ||
      stockpilePhoto)
  ) {
    try {
      if (mode === "create") {
        await uploadFilesForRecordCreate(
          currentDraftId,
          evidenceFiles,
          qualityDocuments,
          recycledPhoto,
          stockpilePhoto,
          uploadedFilesRef,
        );
      } else {
        await uploadFilesForRecordEdit(
          currentDraftId,
          evidenceFiles,
          qualityDocuments,
          recycledPhoto,
          stockpilePhoto,
          originalFileIdsRef.current,
          originalFileRefsRef.current,
        );
      }
      toast.success("Đã tải lên tài liệu");
    } catch (fileError: any) {
      console.error("Error uploading files:", fileError);
      toast.error(
        fileError?.response?.data?.message ||
          fileError?.message ||
          "Đã lưu bản nháp nhưng không thể tải lên một số tài liệu",
      );
    }
  }

  // Navigate back to records list after successful save
  router.push("/recycler/my-records");

  return currentDraftId;
};

interface SubmitRecordParams {
  mode: FormMode;
  draftId: string | null;
  formData: Partial<CreateDraftFormData>;
  collectionDate: Date;
  recycledDate: Date | undefined;
  locationRefId: string;
  evidenceFiles: DocumentFile[];
  qualityDocuments: DocumentFile[];
  recycledPhoto: File | null;
  stockpilePhoto: File | null;
  originalFormData: OriginalFormData | null;
  uploadedFilesRef: React.MutableRefObject<FileUploadTracking>;
  originalFileIdsRef: React.MutableRefObject<OriginalFileIds>;
  originalFileRefsRef: React.MutableRefObject<OriginalFileRefs>;
  setDraftId: (id: string | null) => void;
  router: any;
}

export const handleSubmitRecord = async (params: SubmitRecordParams): Promise<void> => {
  const {
    draftId,
    formData,
    collectionDate,
    recycledDate,
    locationRefId,
    evidenceFiles,
    qualityDocuments,
    recycledPhoto,
    stockpilePhoto,
    originalFormData,
    uploadedFilesRef,
    originalFileIdsRef,
    originalFileRefsRef,
    mode,
    setDraftId,
    router,
  } = params;

  // Ensure vehicle plate is present
  if (!formData.vehiclePlate || formData.vehiclePlate.trim() === "") {
    toast.error(
      "Biển số xe là bắt buộc. Vui lòng quay lại bước 2 để nhập biển số xe.",
    );
    throw new Error("Vehicle plate is required");
  }

  // STEP 1: Save/Update draft first - ensure draft is saved before submitting
  let currentDraftId: string;
  try {
    currentDraftId = await saveOrUpdateDraft({
      mode,
      draftId,
      formData,
      collectionDate,
      recycledDate,
      locationRefId,
      originalFormData,
      setDraftId,
      showToasts: false, // Don't show toasts during submit flow
      checkForChanges: false, // Always update for submit flow
      alwaysUpdate: true, // Ensure latest data is saved
    });
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Không thể lưu bản nháp",
    );
    throw error;
  }

  // STEP 2: Upload files after draft is saved/updated
  if (
    currentDraftId &&
    (evidenceFiles.length > 0 ||
      qualityDocuments.length > 0 ||
      recycledPhoto ||
      stockpilePhoto)
  ) {
    try {
      if (mode === "create") {
        await uploadFilesForRecordCreate(
          currentDraftId,
          evidenceFiles,
          qualityDocuments,
          recycledPhoto,
          stockpilePhoto,
          uploadedFilesRef,
        );
      } else {
        await uploadFilesForRecordEdit(
          currentDraftId,
          evidenceFiles,
          qualityDocuments,
          recycledPhoto,
          stockpilePhoto,
          originalFileIdsRef.current,
          originalFileRefsRef.current,
        );
      }
    } catch (fileError: any) {
      console.error("Error uploading files:", fileError);
      toast.error(
        fileError?.response?.data?.message ||
          fileError?.message ||
          "Không thể tải lên một số tài liệu. Vui lòng thử lại.",
      );
      throw fileError;
    }
  }

  // STEP 3: Submit the record (only after draft is saved and files are uploaded)
  try {
    await CollectionRecordService.submitRecord(currentDraftId!);
    toast.success("Đã gửi bản ghi để phê duyệt");
    router.push("/recycler/my-records");
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Không thể gửi bản ghi",
    );
    throw error;
  }
};

