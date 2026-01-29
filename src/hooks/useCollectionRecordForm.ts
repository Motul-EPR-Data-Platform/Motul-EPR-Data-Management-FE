import { useState, useEffect, useRef, useCallback } from "react";
import type { MutableRefObject, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { CreateDraftDTO, CreateDraftFormData } from "@/types/record";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { toast } from "sonner";
import { validateStep, ValidationContext } from "@/lib/validations/collectionRecordValidation";
import { validateRecordSubmission } from "@/lib/validations/record";
import { loadDropdownData, DropdownData } from "@/lib/utils/collectionRecordDataLoader";
import {
  getSelectedContractTypeName,
  getSelectedWasteSourceName,
  getSelectedHazCodeName,
} from "@/lib/utils/collectionRecordHelpers";
import {
  buildDraftDTO as buildDraftDTOUtil,
  buildPartialDraftDTO as buildPartialDraftDTOUtil,
  type OriginalFormData,
} from "@/lib/utils/collectionRecordDTOBuilder";
import {
  uploadFilesForRecordCreate,
  uploadFilesForRecordEdit,
  FileUploadTracking,
  OriginalFileRefs,
  OriginalFileIds,
} from "@/lib/utils/collectionRecordFileUpload";
import {
  handleSaveDraft as handleSaveDraftUtil,
  handleSubmitRecord as handleSubmitRecordUtil,
} from "@/lib/utils/collectionRecordHandlers";

export type FormMode = "create" | "edit";

export interface UseCollectionRecordFormOptions {
  mode: FormMode;
  recordId?: string | null; // For edit mode
  onRecordLoad?: (record: any) => void; // Callback when record is loaded (edit mode)
  confirm?: (message: string) => Promise<boolean>; // Optional confirm function for dialogs
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
  hazWasteCertificates: DocumentFile[];
  setHazWasteCertificates: (docs: DocumentFile[]) => void;
  recycledPhotos: DocumentFile[];
  setRecycledPhotos: (photos: DocumentFile[]) => void;
  stockpilePhotos: DocumentFile[];
  setStockpilePhotos: (photos: DocumentFile[]) => void;

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
  setOriginalFormData: (data: Partial<CreateDraftFormData>, collectionDate: Date, recycledDate: Date | undefined, locationRefId: string) => void;
}

export function useCollectionRecordForm(
  options: UseCollectionRecordFormOptions,
): UseCollectionRecordFormReturn {
  const { mode, recordId, onRecordLoad, confirm } = options;
  const router = useRouter();

  // Helper function to show confirmation
  const showConfirm = async (message: string): Promise<boolean> => {
    if (confirm) {
      return await confirm(message);
    }
    // Fallback to window.confirm if no confirm function provided
    return window.confirm(message);
  };

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
  const [hazWasteCertificates, setHazWasteCertificates] = useState<DocumentFile[]>([]);
  const [recycledPhotos, setRecycledPhotos] = useState<DocumentFile[]>([]);
  const [stockpilePhotos, setStockpilePhotos] = useState<DocumentFile[]>([]);

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
    hazWasteCertificates: new Set(),
    recycledPhotos: new Set(),
    stockpilePhotos: new Set(),
  });

  // Original file tracking (for edit mode)
  const originalFileIdsRef = useRef<OriginalFileIds>({
    evidencePhotos: new Set(),
    qualityMetrics: new Set(),
    outputQualityMetrics: new Set(),
    hazWasteCertificates: new Set(),
    recycledPhotos: new Set(),
    stockpilePhotos: new Set(),
  });

  const originalFileRefsRef = useRef<OriginalFileRefs>({
    recycledPhotos: [],
    stockpilePhotos: [],
  });

  // Original form data (for edit mode - to track changes)
  const originalFormDataRef = useRef<OriginalFormData | null>(null);

  // Function to set original form data (called when record is loaded in edit mode)
  const setOriginalFormData = useCallback((
    data: Partial<CreateDraftFormData>,
    collectionDateValue: Date,
    recycledDateValue: Date | undefined,
    locationRefIdValue: string,
  ) => {
    originalFormDataRef.current = {
      formData: { ...data },
      collectionDate: new Date(collectionDateValue),
      recycledDate: recycledDateValue ? new Date(recycledDateValue) : undefined,
      locationRefId: locationRefIdValue,
    };
  }, []);

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
      collectionDate,
      recycledPhotos,
      stockpilePhotos,
      hazWasteCertificates,
    };

    const result = validateStep(currentStep, context);
    setErrors(result.errors);
    return result.isValid;
  }, [currentStep, formData, locationRefId, collectionDate, recycledPhotos, stockpilePhotos, hazWasteCertificates]);

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

  const handleRedo = useCallback(async () => {
    const confirmed = await showConfirm("Bạn có chắc chắn muốn làm lại toàn bộ thông tin?");
    if (confirmed) {
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
        setHazWasteCertificates([]);
        setRecycledPhotos([]);
        setStockpilePhotos([]);
        setDraftId(null);
      } else if (mode === "edit" && onRecordLoad) {
        // Reload record data - this should be handled by the page component
        // The hook just resets the step
        setCurrentStep(1);
      }
    }
  }, [mode, onRecordLoad]);

  // Build DTO from form data (full DTO for create)
  const buildDraftDTO = useCallback((): CreateDraftDTO => {
    return buildDraftDTOUtil(formData, collectionDate, recycledDate, locationRefId);
  }, [formData, collectionDate, recycledDate, locationRefId]);

  // Save draft handler
  const handleSaveDraft = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleSaveDraftUtil({
        mode,
        draftId,
        formData,
        collectionDate,
        recycledDate,
        locationRefId,
        evidenceFiles,
        qualityDocuments,
        hazWasteCertificates,
        recycledPhotos,
        stockpilePhotos,
        originalFormData: originalFormDataRef.current,
        uploadedFilesRef,
        originalFileIdsRef,
        originalFileRefsRef,
        setDraftId,
        router,
      });
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
    mode,
    draftId,
    formData,
    collectionDate,
    recycledDate,
    locationRefId,
    evidenceFiles,
    qualityDocuments,
    hazWasteCertificates,
    recycledPhotos,
    stockpilePhotos,
    uploadedFilesRef,
    originalFileIdsRef,
    originalFileRefsRef,
    setDraftId,
    router,
  ]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    // Validate all fields using Zod (except wasteSourceId and stockpiled)
    const validationResult = validateRecordSubmission({
      formData,
      locationRefId,
      collectionDate,
      recycledDate,
      recycledPhotos,
      evidenceFiles,
      qualityDocuments,
      hazWasteCertificates,
    });

    if (!validationResult.success) {
      // Set errors and navigate to the appropriate step
      setErrors(validationResult.errors);

      // Navigate to the first step with errors
      if (validationResult.errors.wasteOwnerId || validationResult.errors.contractTypeId || validationResult.errors.wasteSourceId || validationResult.errors.hazWasteId || validationResult.errors.batchId) {
        setCurrentStep(1);
      } else if (validationResult.errors.collectedVolumeKg || validationResult.errors.vehiclePlate || validationResult.errors.locationRefId || validationResult.errors.collectionDate || validationResult.errors.collectedPricePerKg) {
        setCurrentStep(2);
      } else if (
        validationResult.errors.recycledVolumeKg ||
        validationResult.errors.recycledPhotos ||
        validationResult.errors.evidenceFiles ||
        validationResult.errors.recycledDate ||
        validationResult.errors.qualityDocuments ||
        validationResult.errors.hazWasteCertificates
      ) {
        setCurrentStep(3);
      } else {
        setCurrentStep(1);
      }

      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }

    // Validate all steps (legacy validation for step navigation)
    if (!validateCurrentStep()) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    try {
      await handleSubmitRecordUtil({
        mode,
        draftId,
        formData,
        collectionDate,
        recycledDate,
        locationRefId,
        evidenceFiles,
        qualityDocuments,
        hazWasteCertificates,
        recycledPhotos,
        stockpilePhotos,
        originalFormData: originalFormDataRef.current,
        uploadedFilesRef,
        originalFileIdsRef,
        originalFileRefsRef,
        setDraftId,
        router,
      });
    } catch (error: any) {
      // Error is already handled in handleSubmitRecordUtil
      if (error?.message === "Vehicle plate is required") {
        setCurrentStep(2);
        setErrors((prev) => ({ ...prev, vehiclePlate: "Biển số xe là bắt buộc" }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    locationRefId,
    collectionDate,
    recycledDate,
    recycledPhotos,
    evidenceFiles,
    qualityDocuments,
    validateCurrentStep,
    mode,
    draftId,
    formData,
    collectionDate,
    recycledDate,
    locationRefId,
    evidenceFiles,
    qualityDocuments,
    hazWasteCertificates,
    recycledPhotos,
    stockpilePhotos,
    uploadedFilesRef,
    originalFileIdsRef,
    originalFileRefsRef,
    setDraftId,
    router,
  ]);

  // Cancel handler
  const handleCancel = useCallback(async () => {
    const message =
      mode === "create"
        ? "Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ bị mất."
        : "Bạn có chắc chắn muốn hủy? Tất cả thay đổi chưa lưu sẽ bị mất.";
    const confirmed = await showConfirm(message);
    if (confirmed) {
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
    hazWasteCertificates,
    setHazWasteCertificates,
    recycledPhotos,
    setRecycledPhotos,
    stockpilePhotos,
    setStockpilePhotos,

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
    setOriginalFormData,
  };
}

