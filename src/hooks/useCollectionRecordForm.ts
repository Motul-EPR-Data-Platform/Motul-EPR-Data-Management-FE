import { useState, useEffect, useRef, useCallback } from "react";
import type { MutableRefObject, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { CreateDraftDTO, CreateDraftFormData } from "@/types/record";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { toast } from "sonner";
import { validateStep, ValidationContext } from "@/lib/validations/collectionRecordValidation";
import { loadDropdownData, DropdownData } from "@/lib/utils/collectionRecordDataLoader";
import {
  formatDateDDMMYYYY,
  getSelectedContractTypeName,
  getSelectedWasteSourceName,
  getSelectedHazCodeName,
} from "@/lib/utils/collectionRecordHelpers";
import {
  uploadFilesForRecordCreate,
  uploadFilesForRecordEdit,
  FileUploadTracking,
  OriginalFileRefs,
  OriginalFileIds,
} from "@/lib/utils/collectionRecordFileUpload";

export type FormMode = "create" | "edit";

export interface UseCollectionRecordFormOptions {
  mode: FormMode;
  recordId?: string | null; // For edit mode
  onRecordLoad?: (record: any) => void; // Callback when record is loaded (edit mode)
}

export interface UseCollectionRecordFormReturn {
  // Form state
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isLoading: boolean;
  isLoadingRecord: boolean; // Only for edit mode
  formData: Partial<CreateDraftFormData>;
  setFormData: Dispatch<SetStateAction<Partial<CreateDraftFormData>>>;
  errors: Record<string, string>;
  draftId: string | null;
  setDraftId: (id: string | null) => void;

  // Date state
  collectionDate: Date;
  setCollectionDate: (date: Date) => void;
  recycledDate: Date | undefined;
  setRecycledDate: (date: Date | undefined) => void;

  // Location state
  locationRefId: string;
  setLocationRefId: (refId: string) => void;
  fullAddress: string;
  setFullAddress: (address: string) => void;
  address: {
    houseNumber?: string;
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  };
  setAddress: (address: any) => void;
  latitude: number;
  setLatitude: (lat: number) => void;
  longitude: number;
  setLongitude: (lng: number) => void;

  // File state
  evidenceFiles: DocumentFile[];
  setEvidenceFiles: (files: DocumentFile[]) => void;
  qualityDocuments: DocumentFile[];
  setQualityDocuments: (docs: DocumentFile[]) => void;
  recycledPhoto: File | null;
  setRecycledPhoto: (photo: File | null) => void;
  stockpilePhoto: File | null;
  setStockpilePhoto: (photo: File | null) => void;

  // Dropdown data
  dropdownData: DropdownData;
  isLoadingDropdowns: boolean;

  // Handlers
  handleFieldChange: (field: keyof CreateDraftFormData, value: any) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleRedo: () => void;
  handleSaveDraft: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;

  // Helper getters
  getSelectedWasteOwnerName: () => string | undefined;
  getSelectedContractTypeName: () => string | undefined;
  getSelectedWasteSourceName: () => string | undefined;
  getSelectedHazCodeName: () => string | undefined;

  // Internal refs (for edit mode file tracking)
  originalFileIdsRef: React.MutableRefObject<OriginalFileIds>;
  originalFileRefsRef: React.MutableRefObject<OriginalFileRefs>;
  setIsLoadingRecord: (loading: boolean) => void;
}

export function useCollectionRecordForm(
  options: UseCollectionRecordFormOptions,
): UseCollectionRecordFormReturn {
  const { mode, recordId, onRecordLoad } = options;
  const router = useRouter();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(mode === "edit");
  const [formData, setFormData] = useState<Partial<CreateDraftFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(null);

  // Date state
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [recycledDate, setRecycledDate] = useState<Date | undefined>();

  // Location state
  const [locationRefId, setLocationRefId] = useState<string>("");
  const [fullAddress, setFullAddress] = useState<string>("");
  const [address, setAddress] = useState<{
    houseNumber?: string;
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  }>({});
  const [latitude, setLatitude] = useState<number>(10.8231);
  const [longitude, setLongitude] = useState<number>(106.6297);

  // File state
  const [evidenceFiles, setEvidenceFiles] = useState<DocumentFile[]>([]);
  const [qualityDocuments, setQualityDocuments] = useState<DocumentFile[]>([]);
  const [recycledPhoto, setRecycledPhoto] = useState<File | null>(null);
  const [stockpilePhoto, setStockpilePhoto] = useState<File | null>(null);

  // Dropdown data
  const [dropdownData, setDropdownData] = useState<DropdownData>({
    contractTypes: [],
    wasteTypes: [],
    hazTypes: [],
  });
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  // Selected names (fetched separately)
  const [selectedWasteOwnerName, setSelectedWasteOwnerName] = useState<string | undefined>();

  // File tracking refs (for create mode)
  const uploadedFilesRef = useRef<FileUploadTracking>({
    evidenceFiles: new Set(),
    qualityMetricsFiles: new Set(),
    outputQualityMetricsFiles: new Set(),
    recycledPhoto: null,
    stockpilePhoto: null,
  });

  // Original file tracking (for edit mode)
  const originalFileIdsRef = useRef<OriginalFileIds>({
    evidencePhotos: new Set(),
    qualityMetrics: new Set(),
    outputQualityMetrics: new Set(),
    recycledPhoto: null,
    stockpilePhoto: null,
  });

  const originalFileRefsRef = useRef<OriginalFileRefs>({
    recycledPhoto: null,
    stockpilePhoto: null,
  });

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingDropdowns(true);
      try {
        const data = await loadDropdownData();
        setDropdownData(data);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    loadData();
  }, []);

  // Fetch waste owner name when wasteOwnerId changes
  useEffect(() => {
    const fetchWasteOwnerName = async () => {
      if (formData.wasteOwnerId) {
        try {
          const wasteOwner = await WasteOwnerService.getWasteOwnerById(formData.wasteOwnerId);
          setSelectedWasteOwnerName(wasteOwner.name);
        } catch (error) {
          console.error("Error fetching waste owner name:", error);
          setSelectedWasteOwnerName(undefined);
        }
      } else {
        setSelectedWasteOwnerName(undefined);
      }
    };
    fetchWasteOwnerName();
  }, [formData.wasteOwnerId]);

  // Load record data (edit mode only)
  useEffect(() => {
    if (mode === "edit" && recordId) {
      // This will be handled by the page component
      // The hook just provides the state management
    }
  }, [mode, recordId]);

  // Field change handler
  const handleFieldChange = useCallback(
    (field: keyof CreateDraftFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user changes field
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors],
  );

  // Validation
  const validateCurrentStep = useCallback((): boolean => {
    const context: ValidationContext = {
      formData,
      locationRefId,
      recycledPhoto,
      stockpilePhoto,
    };

    const result = validateStep(currentStep, context);
    setErrors(result.errors);
    return result.isValid;
  }, [currentStep, formData, locationRefId, recycledPhoto, stockpilePhoto]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateCurrentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleRedo = useCallback(() => {
    if (confirm("Bạn có chắc chắn muốn làm lại toàn bộ thông tin?")) {
      if (mode === "create") {
        setFormData({});
        setErrors({});
        setCurrentStep(1);
        setCollectionDate(new Date());
        setRecycledDate(undefined);
        setLocationRefId("");
        setFullAddress("");
        setAddress({});
        setEvidenceFiles([]);
        setQualityDocuments([]);
        setRecycledPhoto(null);
        setStockpilePhoto(null);
        setDraftId(null);
      } else if (mode === "edit" && onRecordLoad) {
        // Reload record data - this should be handled by the page component
        // The hook just resets the step
        setCurrentStep(1);
      }
    }
  }, [mode, onRecordLoad]);

  // Build DTO from form data
  const buildDraftDTO = useCallback((): CreateDraftDTO => {
    return {
      batchId: formData.batchId || null,
      submissionMonth: formatDateDDMMYYYY(
        new Date(collectionDate.getFullYear(), collectionDate.getMonth(), 1),
      ),
      collectedVolumeKg: formData.collectedVolumeKg || null,
      deliveryDate: formatDateDDMMYYYY(collectionDate),
      vehiclePlate: formData.vehiclePlate || null,
      stockpiled: formData.stockpiled ?? false,
      stockpileVolumeKg: formData.stockpileVolumeKg || null,
      recycledDate: recycledDate ? formatDateDDMMYYYY(recycledDate) : null,
      recycledVolumeKg: formData.recycledVolumeKg || null,
      wasteOwnerIds: formData.wasteOwnerId ? [formData.wasteOwnerId] : [],
      contractTypeId: formData.contractTypeId || null,
      wasteSourceId: formData.wasteSourceId || null,
      hazWasteId:
        formData.hazWasteId && formData.hazWasteId.trim() !== ""
          ? formData.hazWasteId
          : null,
      pickupLocation: locationRefId ? { refId: locationRefId } : null,
      collectedPricePerKg: formData.collectedPricePerKg || null,
    };
  }, [formData, collectionDate, recycledDate, locationRefId]);

  // Save draft handler
  const handleSaveDraft = useCallback(async () => {
    setIsLoading(true);
    try {
      const draftData = buildDraftDTO();
      let currentDraftId = draftId;

      if (currentDraftId) {
        // Update existing draft
        await CollectionRecordService.updateDraft(currentDraftId, draftData);
        toast.success("Đã cập nhật bản nháp");
      } else {
        // Create new draft
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
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu bản nháp",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    buildDraftDTO,
    draftId,
    evidenceFiles,
    qualityDocuments,
    recycledPhoto,
    stockpilePhoto,
    mode,
    router,
  ]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    // Validate all steps
    if (!validateCurrentStep()) {
      setCurrentStep(1);
      return;
    }

    // Ensure vehicle plate is present
    if (!formData.vehiclePlate || formData.vehiclePlate.trim() === "") {
      toast.error(
        "Biển số xe là bắt buộc. Vui lòng quay lại bước 2 để nhập biển số xe.",
      );
      setCurrentStep(2);
      setErrors((prev) => ({ ...prev, vehiclePlate: "Biển số xe là bắt buộc" }));
      return;
    }

    let currentDraftId = draftId;

    // Create draft if it doesn't exist
    if (!currentDraftId) {
      setIsLoading(true);
      try {
        const draftData = buildDraftDTO();
        const result = await CollectionRecordService.createDraft(draftData);
        currentDraftId = result.id;
        setDraftId(currentDraftId);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể tạo bản nháp",
        );
        setIsLoading(false);
        return;
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
        setIsLoading(false);
        return;
      }
    }

    // Submit the record
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [
    validateCurrentStep,
    formData.vehiclePlate,
    draftId,
    buildDraftDTO,
    evidenceFiles,
    qualityDocuments,
    recycledPhoto,
    stockpilePhoto,
    mode,
    router,
  ]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    const message =
      mode === "create"
        ? "Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ bị mất."
        : "Bạn có chắc chắn muốn hủy? Tất cả thay đổi chưa lưu sẽ bị mất.";
    if (confirm(message)) {
      if (mode === "edit") {
        router.push("/recycler/my-records");
      } else {
        router.back();
      }
    }
  }, [mode, router]);

  // Helper getters
  const getSelectedWasteOwnerNameMemo = useCallback(() => {
    return selectedWasteOwnerName;
  }, [selectedWasteOwnerName]);

  const getSelectedContractTypeNameMemo = useCallback(() => {
    return getSelectedContractTypeName(formData, dropdownData.contractTypes);
  }, [formData, dropdownData.contractTypes]);

  const getSelectedWasteSourceNameMemo = useCallback(() => {
    return getSelectedWasteSourceName(formData, dropdownData.wasteTypes);
  }, [formData, dropdownData.wasteTypes]);

  const getSelectedHazCodeNameMemo = useCallback(() => {
    return getSelectedHazCodeName(formData, dropdownData.hazTypes);
  }, [formData, dropdownData.hazTypes]);

  return {
    // Form state
    currentStep,
    setCurrentStep,
    isLoading,
    isLoadingRecord,
    formData,
    setFormData,
    errors,
    draftId,
    setDraftId,

    // Date state
    collectionDate,
    setCollectionDate,
    recycledDate,
    setRecycledDate,

    // Location state
    locationRefId,
    setLocationRefId,
    fullAddress,
    setFullAddress,
    address,
    setAddress,
    latitude,
    setLatitude,
    longitude,
    setLongitude,

    // File state
    evidenceFiles,
    setEvidenceFiles,
    qualityDocuments,
    setQualityDocuments,
    recycledPhoto,
    setRecycledPhoto,
    stockpilePhoto,
    setStockpilePhoto,

    // Dropdown data
    dropdownData,
    isLoadingDropdowns,

    // Handlers
    handleFieldChange,
    handleNext,
    handleBack,
    handleRedo,
    handleSaveDraft,
    handleSubmit,
    handleCancel,

    // Helper getters
    getSelectedWasteOwnerName: getSelectedWasteOwnerNameMemo,
    getSelectedContractTypeName: getSelectedContractTypeNameMemo,
    getSelectedWasteSourceName: getSelectedWasteSourceNameMemo,
    getSelectedHazCodeName: getSelectedHazCodeNameMemo,

    // Internal refs (for edit mode)
    originalFileIdsRef: originalFileIdsRef as MutableRefObject<OriginalFileIds>,
    originalFileRefsRef: originalFileRefsRef as MutableRefObject<OriginalFileRefs>,
    setIsLoadingRecord,
  };
}

