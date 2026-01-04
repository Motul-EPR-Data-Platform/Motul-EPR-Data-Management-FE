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

  let currentDraftId = draftId;

  if (currentDraftId && mode === "edit") {
    // Update existing draft - only send changed fields
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
    // Only update if there are changes
    if (Object.keys(partialDraftData).length > 0) {
      await CollectionRecordService.updateDraft(currentDraftId, partialDraftData as CreateDraftDTO);
      toast.success("Đã cập nhật bản nháp");
    } else {
      toast.info("Không có thay đổi nào để cập nhật");
    }
  } else if (currentDraftId) {
    // Update existing draft (create mode but draft already exists)
    const draftData = buildDraftDTO(formData, collectionDate, recycledDate, locationRefId);
    await CollectionRecordService.updateDraft(currentDraftId, draftData);
    toast.success("Đã cập nhật bản nháp");
  } else {
    // Create new draft
    const draftData = buildDraftDTO(formData, collectionDate, recycledDate, locationRefId);
    const result = await CollectionRecordService.createDraft(draftData);
    currentDraftId = result.id;
    setDraftId(currentDraftId);
    toast.success("Đã lưu bản nháp");
  }

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

  let currentDraftId = draftId;

  // Create draft if it doesn't exist
  if (!currentDraftId) {
    try {
      const draftData = buildDraftDTO(formData, collectionDate, recycledDate, locationRefId);
      const result = await CollectionRecordService.createDraft(draftData);
      currentDraftId = result.id;
      setDraftId(currentDraftId);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tạo bản nháp",
      );
      throw error;
    }
  }

  // Upload files before submitting
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

  // Submit the record
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

