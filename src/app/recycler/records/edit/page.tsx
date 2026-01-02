"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProgressStepper } from "@/components/records/ProgressStepper";
import { FormNavigationButtons } from "@/components/records/FormNavigationButtons";
import { Step1WasteSourceInfo } from "@/components/records/steps/Step1WasteSourceInfo";
import { Step2CollectionDetails } from "@/components/records/steps/Step2CollectionDetails";
import { Step3WarehouseRecycling } from "@/components/records/steps/Step3WarehouseRecycling";
import { Step4ReviewSubmit } from "@/components/records/steps/Step4ReviewSubmit";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CreateDraftDTO, CreateDraftFormData } from "@/types/record";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { DefinitionService } from "@/lib/services/definition.service";
import { transformDefinitions } from "@/lib/utils/definitionUtils/definitionTransformers";
import { toast } from "sonner";
import { FileType } from "@/types/file-record";
import { z } from "zod";
import { step3ValidationSchema } from "@/lib/validations/record";

const STEPS = [
  { number: 1, label: "Thông tin Chủ nguồn thải" },
  { number: 2, label: "Chi tiết Thu gom" },
  { number: 3, label: "Nhập kho & Tái chế" },
  { number: 4, label: "Xem lại & Gửi" },
];

// Helper to parse date from various formats
const parseDate = (dateString: string | null | undefined): Date | undefined => {
  if (!dateString) return undefined;
  try {
    // Try ISO format first
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    // Try dd/mm/yyyy format
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return undefined;
  } catch {
    return undefined;
  }
};

export default function EditCollectionRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(true);
  const [formData, setFormData] = useState<Partial<CreateDraftFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(null);

  // Additional form state
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [recycledDate, setRecycledDate] = useState<Date | undefined>();
  const [locationRefId, setLocationRefId] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(10.8231);
  const [longitude, setLongitude] = useState<number>(106.6297);
  const [fullAddress, setFullAddress] = useState<string>("");
  const [address, setAddress] = useState<{
    houseNumber?: string;
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  }>({});
  const [evidenceFiles, setEvidenceFiles] = useState<DocumentFile[]>([]);
  const [qualityDocuments, setQualityDocuments] = useState<DocumentFile[]>([]);
  const [recycledPhoto, setRecycledPhoto] = useState<File | null>(null);
  const [stockpilePhoto, setStockpilePhoto] = useState<File | null>(null);

  // Track original form data to determine which fields have changed
  const originalFormDataRef = useRef<Partial<CreateDraftFormData>>({});
  const originalDatesRef = useRef<{
    collectionDate: Date | null;
    recycledDate: Date | undefined;
  }>({
    collectionDate: null,
    recycledDate: undefined,
  });
  const originalLocationRef = useRef<{
    locationRefId: string;
  }>({
    locationRefId: "",
  });

  // Track original file IDs to determine if files are new or existing
  const originalFileIdsRef = useRef<{
    evidencePhotos: Set<string>;
    qualityMetrics: Set<string>;
    outputQualityMetrics: Set<string>;
    recycledPhoto: string | null;
    stockpilePhoto: string | null;
  }>({
    evidencePhotos: new Set(),
    qualityMetrics: new Set(),
    outputQualityMetrics: new Set(),
    recycledPhoto: null,
    stockpilePhoto: null,
  });

  // Track original File object references for single file uploads
  const originalFileRefsRef = useRef<{
    recycledPhoto: File | null;
    stockpilePhoto: File | null;
  }>({
    recycledPhoto: null,
    stockpilePhoto: null,
  });

  // Data for dropdowns
  const [wasteOwners, setWasteOwners] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [contractTypes, setContractTypes] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
  const [wasteTypes, setWasteTypes] = useState<
    Array<{ id: string; name: string; code?: string; hazCode?: string }>
  >([]);
  const [hazTypes, setHazTypes] = useState<
    Array<{ id: string; code: string; name?: string; haz_code?: string }>
  >([]);

  // Load record data and dropdown data
  useEffect(() => {
    if (recordId) {
      loadRecordAndDropdownData();
    } else {
      toast.error("Không tìm thấy ID bản ghi");
      router.push("/recycler/my-records");
    }
  }, [recordId]);

  // Helper function to convert signed URL to File object
  const urlToFile = async (
    url: string,
    fileName: string,
    mimeType: string,
  ): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: mimeType });
  };

  const loadRecordAndDropdownData = async () => {
    setIsLoadingRecord(true);
    try {
      // Load dropdown data and record data in parallel
      const [
        wasteOwnersRes,
        contractTypesRes,
        wasteTypesRes,
        hazTypesRes,
        recordRes,
        filesRes,
      ] = await Promise.allSettled([
        WasteOwnerService.getAllWasteOwners({ isActive: true }),
        DefinitionService.getActiveContractTypes(),
        DefinitionService.getActiveWasteTypes(),
        DefinitionService.getActiveHazTypes(),
        recordId
          ? CollectionRecordService.getRecordById(recordId)
          : Promise.resolve(null),
        recordId
          ? CollectionRecordService.getRecordFilesWithPreview(recordId, 3600)
          : Promise.resolve(null),
      ]);

      // Load dropdown data
      if (wasteOwnersRes.status === "fulfilled") {
        setWasteOwners(
          wasteOwnersRes.value.data.map((wo) => ({
            id: wo.id,
            name: wo.name,
          })),
        );
      }

      if (contractTypesRes.status === "fulfilled") {
        const transformedDefinitions = transformDefinitions(
          contractTypesRes.value,
        );
        const transformed = transformedDefinitions.map((def) => {
          const contractData = def.data as any;
          return {
            id: def.id,
            name: contractData?.name || "",
            code: contractData?.code || "",
          };
        });
        setContractTypes(transformed);
      }

      if (wasteTypesRes.status === "fulfilled") {
        const transformedDefinitions = transformDefinitions(
          wasteTypesRes.value,
        );
        const transformed = transformedDefinitions.map((def) => {
          const wasteTypeData = def.data as any;
          return {
            id: def.id,
            name: wasteTypeData?.name || "",
            code: wasteTypeData?.code || "",
            hazCode: wasteTypeData?.hazCode || null,
          };
        });
        setWasteTypes(transformed);
      }

      if (hazTypesRes.status === "fulfilled") {
        const transformedDefinitions = transformDefinitions(hazTypesRes.value);
        const transformed = transformedDefinitions
          .map((def) => {
            const hazTypeData = def.data as any;
            return {
              id: def.id,
              code: hazTypeData?.code || "",
              name: hazTypeData?.name || hazTypeData?.code || "",
              haz_code:
                hazTypeData?.hazCode ||
                hazTypeData?.haz_code ||
                hazTypeData?.code ||
                "",
            };
          })
          .filter((hazType) => hazType.id && hazType.id.trim() !== ""); // Filter out any with empty IDs
        setHazTypes(transformed);
      }

      // Load and prefill record data
      if (recordRes.status === "fulfilled" && recordRes.value) {
        const record = recordRes.value;
        setDraftId(record.id);

        // Prefill form data from record
        // Get waste owner ID from wasteOwners array or wasteOwnerId field
        const wasteOwnerId =
          record.wasteOwners && record.wasteOwners.length > 0
            ? record.wasteOwners[0].id
            : record.wasteOwnerId || null;

        // Get HAZ code ID from hazWasteId, hazWaste.id, or hazWasteId
        const hazWasteId =
          (record as any).hazWasteId ||
          (record as any).hazWaste?.id ||
          (record as any).hazWasteId ||
          null;

        const prefillData: Partial<CreateDraftFormData> = {
          batchId: (record as any).batchId || null,
          wasteOwnerId,
          contractTypeId: record.contractTypeId || null,
          wasteSourceId: record.wasteSourceId || null,
          hazWasteId,
          collectedVolumeKg: record.collectedVolumeKg || null,
          vehiclePlate: record.vehiclePlate || null,
          stockpiled: record.stockpiled || null,
          stockpileVolumeKg: record.stockpileVolumeKg || null,
          recycledVolumeKg: record.recycledVolumeKg || null,
          collectedPricePerKg: record.collectedPricePerKg || null,
        };
        setFormData(prefillData);
        // Store original form data for change detection
        originalFormDataRef.current = { ...prefillData };

        // Prefill dates
        if (record.deliveryDate) {
          const parsedDate = parseDate(record.deliveryDate);
          if (parsedDate) {
            setCollectionDate(parsedDate);
            originalDatesRef.current.collectionDate = parsedDate;
          }
        }
        if (record.recycledDate) {
          const parsedDate = parseDate(record.recycledDate);
          if (parsedDate) {
            setRecycledDate(parsedDate);
            originalDatesRef.current.recycledDate = parsedDate;
          }
        }

        // Prefill location data
        if (record.pickupLocation) {
          setFullAddress(record.pickupLocation.address || "");
          if (
            record.pickupLocation.latitude &&
            record.pickupLocation.longitude
          ) {
            setLatitude(record.pickupLocation.latitude);
            setLongitude(record.pickupLocation.longitude);
          }
          // Try to extract location refId if available
          if (record.pickupLocationId) {
            setLocationRefId(record.pickupLocationId);
            originalLocationRef.current.locationRefId = record.pickupLocationId;
          }
        }

        // Reset file tracking when loading new record
        originalFileIdsRef.current = {
          evidencePhotos: new Set(),
          qualityMetrics: new Set(),
          outputQualityMetrics: new Set(),
          recycledPhoto: null,
          stockpilePhoto: null,
        };
        originalFileRefsRef.current = {
          recycledPhoto: null,
          stockpilePhoto: null,
        };

        // Load and prefill files from preview API
        if (filesRes.status === "fulfilled" && filesRes.value) {
          const filesWithPreview = filesRes.value;

          try {
            // Convert evidence photos to DocumentFile format (Step 2)
            if (filesWithPreview.evidencePhotos?.length > 0) {
              const evidenceDocs: DocumentFile[] = await Promise.all(
                filesWithPreview.evidencePhotos.map(async (file) => {
                  const fileObj = await urlToFile(
                    file.signedUrl,
                    file.fileName,
                    file.mimeType,
                  );
                  // Track original file ID
                  originalFileIdsRef.current.evidencePhotos.add(file.id);
                  return {
                    id: file.id,
                    file: fileObj,
                    type: "evidence_photo",
                  };
                }),
              );
              setEvidenceFiles(evidenceDocs);
            }

            // Convert quality metrics files (Step 3)
            const qualityDocs: DocumentFile[] = [];

            // Output quality metrics
            if (filesWithPreview.outputQualityMetrics) {
              const fileObj = await urlToFile(
                filesWithPreview.outputQualityMetrics.signedUrl,
                filesWithPreview.outputQualityMetrics.fileName,
                filesWithPreview.outputQualityMetrics.mimeType,
              );
              // Track original file ID
              originalFileIdsRef.current.outputQualityMetrics.add(
                filesWithPreview.outputQualityMetrics.id,
              );
              qualityDocs.push({
                id: filesWithPreview.outputQualityMetrics.id,
                file: fileObj,
                type: "output_quality_metrics",
              });
            }

            // Quality metrics (before recycling)
            if (filesWithPreview.qualityMetrics) {
              const fileObj = await urlToFile(
                filesWithPreview.qualityMetrics.signedUrl,
                filesWithPreview.qualityMetrics.fileName,
                filesWithPreview.qualityMetrics.mimeType,
              );
              // Track original file ID
              originalFileIdsRef.current.qualityMetrics.add(
                filesWithPreview.qualityMetrics.id,
              );
              qualityDocs.push({
                id: filesWithPreview.qualityMetrics.id,
                file: fileObj,
                type: "quality_metrics",
              });
            }

            if (qualityDocs.length > 0) {
              setQualityDocuments(qualityDocs);
            }

            // Convert recycled photo (Step 3)
            if (filesWithPreview.recycledPhoto) {
              const fileObj = await urlToFile(
                filesWithPreview.recycledPhoto.signedUrl,
                filesWithPreview.recycledPhoto.fileName,
                filesWithPreview.recycledPhoto.mimeType,
              );
              // Track original file ID and file reference
              originalFileIdsRef.current.recycledPhoto =
                filesWithPreview.recycledPhoto.id;
              originalFileRefsRef.current.recycledPhoto = fileObj;
              setRecycledPhoto(fileObj);
            }

            // Convert stockpile photo (Step 3, if stockpiled)
            if (filesWithPreview.stockpilePhoto) {
              const fileObj = await urlToFile(
                filesWithPreview.stockpilePhoto.signedUrl,
                filesWithPreview.stockpilePhoto.fileName,
                filesWithPreview.stockpilePhoto.mimeType,
              );
              // Track original file ID and file reference
              originalFileIdsRef.current.stockpilePhoto =
                filesWithPreview.stockpilePhoto.id;
              originalFileRefsRef.current.stockpilePhoto = fileObj;
              setStockpilePhoto(fileObj);
            }
          } catch (fileError) {
            console.error("Error loading files:", fileError);
            toast.warning(
              "Không thể tải một số tệp đính kèm. Vui lòng tải lại nếu cần.",
            );
          }
        }
      } else if (recordRes.status === "rejected") {
        toast.error("Không thể tải thông tin bản ghi");
        router.push("/recycler/my-records");
      }
    } catch (error: any) {
      console.error("Error loading record:", error);
      toast.error("Không thể tải dữ liệu");
      router.push("/recycler/my-records");
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const handleFieldChange = (field: keyof CreateDraftFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCancel = () => {
    if (
      confirm("Bạn có chắc chắn muốn hủy? Tất cả thay đổi chưa lưu sẽ bị mất.")
    ) {
      router.push("/recycler/my-records");
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.wasteOwnerId) {
        newErrors.wasteOwnerId = "Vui lòng chọn Chủ nguồn thải";
      }
      if (!formData.wasteSourceId) {
        newErrors.wasteSourceId = "Vui lòng chọn Loại chất thải";
      }
    }

    if (step === 2) {
      if (!formData.collectedVolumeKg || formData.collectedVolumeKg <= 0) {
        newErrors.collectedVolumeKg = "Khối lượng thu gom là bắt buộc";
      }
      if (!locationRefId) {
        newErrors.locationRefId = "Địa chỉ thu gom là bắt buộc";
      }
      if (!formData.vehiclePlate || formData.vehiclePlate.trim() === "") {
        newErrors.vehiclePlate = "Biển số xe là bắt buộc";
      }
    }

    if (step === 3) {
      // Use Zod validation for Step 3
      try {
        const step3Data = {
          stockpiled: formData.stockpiled ?? false,
          stockpileVolumeKg: formData.stockpileVolumeKg ?? null,
          recycledVolumeKg: formData.recycledVolumeKg ?? 0,
          recycledPhoto: recycledPhoto,
          stockpilePhoto: stockpilePhoto ?? null,
        };

        step3ValidationSchema.parse(step3Data);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            if (field) {
              newErrors[field] = issue.message;
            }
          });
        } else {
          // Fallback validation
          if (!formData.recycledVolumeKg || formData.recycledVolumeKg <= 0) {
            newErrors.recycledVolumeKg = "Khối lượng tái chế là bắt buộc";
          }
          if (!recycledPhoto) {
            newErrors.recycledPhoto = "Ảnh sản phẩm đã tái chế là bắt buộc";
          }
          if (formData.stockpiled === true) {
            if (
              !formData.stockpileVolumeKg ||
              formData.stockpileVolumeKg <= 0
            ) {
              newErrors.stockpileVolumeKg =
                "Khối lượng lưu kho là bắt buộc khi chọn lưu kho";
            }
            if (!stockpilePhoto) {
              newErrors.stockpilePhoto =
                "Ảnh nhập kho là bắt buộc khi chọn lưu kho";
            }
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRedo = () => {
    if (confirm("Bạn có chắc chắn muốn làm lại toàn bộ thông tin?")) {
      // Reload record data
      if (recordId) {
        loadRecordAndDropdownData();
      }
    }
  };

  const mapDocumentTypeToFileType = (docType: string): FileType => {
    if (
      ["phieu-can", "bien-ban-giao-nhan", "bien-so-xe", "khac"].includes(
        docType,
      )
    ) {
      return FileType.EVIDENCE_PHOTO;
    }
    if (docType === "chat-luong-truoc-tai-che") {
      return FileType.QUALITY_METRICS;
    }
    if (docType === "chat-luong-sau-tai-che") {
      return FileType.OUTPUT_QUALITY_METRICS;
    }
    return FileType.EVIDENCE_PHOTO;
  };

  // Helper to check if a file ID is a new temporary ID (not from database)
  const isNewFileId = (fileId: string): boolean => {
    // New file IDs are generated as `${Date.now()}-${Math.random()}` which contain a dash and timestamp
    // Original file IDs from database are UUIDs
    // Check if it's NOT in any of the original file ID sets
    return (
      !originalFileIdsRef.current.evidencePhotos.has(fileId) &&
      !originalFileIdsRef.current.qualityMetrics.has(fileId) &&
      !originalFileIdsRef.current.outputQualityMetrics.has(fileId)
    );
  };

  // Helper to check if a single File is new (different from original)
  const isNewSingleFile = (
    currentFile: File | null,
    originalFile: File | null,
  ): boolean => {
    // If no current file, nothing to upload
    if (!currentFile) {
      return false;
    }
    // If no original file was tracked, this is a new file
    if (!originalFile) {
      return true;
    }
    // Compare file references - if they're different objects, it's a new file
    // File objects can't be directly compared for equality, but we can compare references
    return currentFile !== originalFile;
  };

  // Helper to check if a field value has changed from original
  const hasFieldChanged = <T,>(currentValue: T, originalValue: T): boolean => {
    // Handle null/undefined cases
    if (currentValue === null && originalValue === null) return false;
    if (currentValue === undefined && originalValue === undefined) return false;
    if (currentValue === null && originalValue === undefined) return false;
    if (currentValue === undefined && originalValue === null) return false;
    
    // Compare values
    return currentValue !== originalValue;
  };

  // Helper to check if date has changed
  const hasDateChanged = (currentDate: Date | undefined | null, originalDate: Date | undefined | null): boolean => {
    if (!currentDate && !originalDate) return false;
    if (!currentDate || !originalDate) return true;
    return currentDate.getTime() !== originalDate.getTime();
  };

  // Build payload with null for unchanged fields
  const buildDraftPayload = (): CreateDraftDTO => {
    const formatDateDDMMYYYY = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const original = originalFormDataRef.current;

    // For each field, send the new value if changed, otherwise null
    return {
      batchId: hasFieldChanged(formData.batchId, original.batchId)
        ? (formData.batchId || null)
        : null,
      submissionMonth: hasDateChanged(collectionDate, originalDatesRef.current.collectionDate)
        ? formatDateDDMMYYYY(new Date(collectionDate.getFullYear(), collectionDate.getMonth(), 1))
        : null,
      collectedVolumeKg: hasFieldChanged(formData.collectedVolumeKg, original.collectedVolumeKg)
        ? (formData.collectedVolumeKg || null)
        : null,
      deliveryDate: hasDateChanged(collectionDate, originalDatesRef.current.collectionDate)
        ? formatDateDDMMYYYY(collectionDate)
        : null,
      vehiclePlate: hasFieldChanged(formData.vehiclePlate, original.vehiclePlate)
        ? (formData.vehiclePlate || null)
        : null,
      stockpiled: hasFieldChanged(formData.stockpiled, original.stockpiled)
        ? (formData.stockpiled ?? false)
        : null,
      stockpileVolumeKg: hasFieldChanged(formData.stockpileVolumeKg, original.stockpileVolumeKg)
        ? (formData.stockpileVolumeKg || null)
        : null,
      recycledDate: hasDateChanged(recycledDate, originalDatesRef.current.recycledDate)
        ? (recycledDate ? formatDateDDMMYYYY(recycledDate) : null)
        : null,
      recycledVolumeKg: hasFieldChanged(formData.recycledVolumeKg, original.recycledVolumeKg)
        ? (formData.recycledVolumeKg || null)
        : null,
      wasteOwnerIds: hasFieldChanged(formData.wasteOwnerId, original.wasteOwnerId)
        ? (formData.wasteOwnerId ? [formData.wasteOwnerId] : [])
        : null,
      contractTypeId: hasFieldChanged(formData.contractTypeId, original.contractTypeId)
        ? (formData.contractTypeId || null)
        : null,
      wasteSourceId: hasFieldChanged(formData.wasteSourceId, original.wasteSourceId)
        ? (formData.wasteSourceId || null)
        : null,
      hazWasteId: hasFieldChanged(formData.hazWasteId, original.hazWasteId)
        ? (formData.hazWasteId || null)
        : null,
      pickupLocation: hasFieldChanged(locationRefId, originalLocationRef.current.locationRefId)
        ? (locationRefId ? { refId: locationRefId } : null)
        : null,
      collectedPricePerKg: hasFieldChanged(formData.collectedPricePerKg, original.collectedPricePerKg)
        ? (formData.collectedPricePerKg || null)
        : null,
    };
  };

  const uploadFilesForRecord = async (recordId: string) => {
    const uploadPromises: Promise<any>[] = [];

    // Only upload evidence photos that are new (not in original set)
    if (evidenceFiles && evidenceFiles.length > 0) {
      const newEvidenceFiles = evidenceFiles.filter((doc) =>
        isNewFileId(doc.id),
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
        if (doc.file instanceof File && isNewFileId(doc.id)) {
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
      isNewSingleFile(
        stockpilePhoto,
        originalFileRefsRef.current.stockpilePhoto,
      )
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
      isNewSingleFile(recycledPhoto, originalFileRefsRef.current.recycledPhoto)
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

  const handleSaveDraft = async () => {
    if (!draftId) {
      toast.error("Không tìm thấy ID bản ghi");
      return;
    }

    setIsLoading(true);
    try {
      // Build payload with null for unchanged fields
      const draftData = buildDraftPayload();

      await CollectionRecordService.updateDraft(draftId, draftData);
      toast.success("Đã cập nhật bản nháp");

      // Upload files after draft is updated
      if (
        evidenceFiles.length > 0 ||
        qualityDocuments.length > 0 ||
        recycledPhoto ||
        stockpilePhoto
      ) {
        try {
          await uploadFilesForRecord(draftId);
          toast.success("Đã tải lên tài liệu");
        } catch (fileError: any) {
          console.error("Error uploading files:", fileError);
          toast.error(
            "Đã cập nhật bản nháp nhưng không thể tải lên một số tài liệu",
          );
        }
      }

      // Navigate back to records list after successful save
      router.push("/recycler/my-records");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật bản nháp",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setCurrentStep(1);
      return;
    }

    if (!formData.vehiclePlate || formData.vehiclePlate.trim() === "") {
      toast.error(
        "Biển số xe là bắt buộc. Vui lòng quay lại bước 2 để nhập biển số xe.",
      );
      setCurrentStep(2);
      setErrors({ ...errors, vehiclePlate: "Biển số xe là bắt buộc" });
      return;
    }

    if (!draftId) {
      toast.error("Không tìm thấy ID bản ghi");
      return;
    }

    setIsLoading(true);
    try {
      // Build payload with null for unchanged fields
      const draftData = buildDraftPayload();

      // Update draft first
      await CollectionRecordService.updateDraft(draftId, draftData);

      // Upload files
      if (
        evidenceFiles.length > 0 ||
        qualityDocuments.length > 0 ||
        recycledPhoto ||
        stockpilePhoto
      ) {
        await uploadFilesForRecord(draftId);
      }

      // Submit the record
      await CollectionRecordService.submitRecord(draftId);
      toast.success("Bản ghi đã được gửi thành công");
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
  };

  const getSelectedWasteOwnerName = () => {
    const owner = wasteOwners.find((wo) => wo.id === formData.wasteOwnerId);
    return owner?.name;
  };

  const getSelectedContractTypeName = () => {
    const type = contractTypes.find((ct) => ct.id === formData.contractTypeId);
    return type?.name;
  };

  const getSelectedWasteSourceName = () => {
    const wasteType = wasteTypes.find((wt) => wt.id === formData.wasteSourceId);
    return wasteType?.name || undefined;
  };

  const getSelectedHazCodeName = () => {
    const hazType = hazTypes.find((ht) => ht.id === formData.hazWasteId);
    if (hazType) {
      const hazCode = hazType.haz_code || hazType.code || "";
      const displayName = hazType.name || hazType.code || "";
      return hazCode && hazCode !== displayName
        ? `${displayName} (${hazCode})`
        : displayName;
    }
    return undefined;
  };

  if (isLoadingRecord) {
    return (
      <PageLayout
        breadcrumbs={[
          { label: "Bản ghi của tôi", href: "/recycler/my-records" },
          { label: "Chỉnh sửa bản ghi" },
        ]}
        title="Chỉnh sửa Bản ghi"
        subtitle="Đang tải dữ liệu..."
      >
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground py-12">
            Đang tải dữ liệu...
          </p>
        </div>
      </PageLayout>
    );
  }

  const completedSteps = Array.from(
    { length: currentStep - 1 },
    (_, i) => i + 1,
  );

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Bản ghi của tôi", href: "/recycler/my-records" },
        { label: "Chỉnh sửa bản ghi" },
      ]}
      title="Chỉnh sửa Bản ghi thu gom"
      subtitle={`ID: ${draftId?.slice(0, 8)}...`}
    >
      <div className="space-y-6">
        {/* Header with Progress and Cancel */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <ProgressStepper
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="ml-4"
          >
            <X className="w-4 h-4 mr-2" />
            Hủy bỏ
          </Button>
        </div>

        {/* Main Form Content */}
        <div className="bg-white rounded-lg border p-6">
          {currentStep === 1 && (
            <Step1WasteSourceInfo
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
              wasteOwners={wasteOwners}
              contractTypes={contractTypes}
              wasteTypes={wasteTypes}
            />
          )}

          {currentStep === 2 && (
            <Step2CollectionDetails
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
              collectionDate={collectionDate}
              onCollectionDateChange={setCollectionDate}
              locationRefId={locationRefId}
              onLocationRefIdChange={setLocationRefId}
              fullAddress={fullAddress}
              address={address}
              onAddressChange={setAddress}
              latitude={latitude}
              longitude={longitude}
              onLatitudeChange={setLatitude}
              onLongitudeChange={setLongitude}
              onFullAddressChange={setFullAddress}
              evidenceFiles={evidenceFiles}
              onEvidenceFilesChange={setEvidenceFiles}
              hazTypes={hazTypes}
            />
          )}

          {currentStep === 3 && (
            <Step3WarehouseRecycling
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
              recycledDate={recycledDate}
              onRecycledDateChange={setRecycledDate}
              qualityDocuments={qualityDocuments}
              onQualityDocumentsChange={setQualityDocuments}
              recycledPhoto={recycledPhoto}
              onRecycledPhotoChange={setRecycledPhoto}
              stockpilePhoto={stockpilePhoto}
              onStockpilePhotoChange={setStockpilePhoto}
            />
          )}

          {currentStep === 4 && (
            <Step4ReviewSubmit
              formData={formData}
              onEditStep={setCurrentStep}
              wasteOwnerName={getSelectedWasteOwnerName()}
              contractTypeName={getSelectedContractTypeName()}
              wasteSourceName={getSelectedWasteSourceName()}
              hazCodeName={getSelectedHazCodeName()}
              collectionDate={collectionDate}
              fullAddress={fullAddress}
              latitude={latitude}
              longitude={longitude}
              recycledDate={recycledDate}
              evidenceFilesCount={evidenceFiles.length}
              qualityDocumentsCount={qualityDocuments.length}
              hasRecycledPhoto={!!recycledPhoto}
              hasStockpilePhoto={!!stockpilePhoto}
            />
          )}

          {/* Navigation Buttons */}
          <FormNavigationButtons
            currentStep={currentStep}
            totalSteps={4}
            onBack={handleBack}
            onRedo={handleRedo}
            onSaveDraft={handleSaveDraft}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isLastStep={currentStep === 4}
            isLoading={isLoading}
            canGoBack={currentStep > 1}
            canGoNext={true}
          />
        </div>
      </div>
    </PageLayout>
  );
}
