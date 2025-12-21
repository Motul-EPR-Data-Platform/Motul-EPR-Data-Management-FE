"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { format } from "date-fns";
import { FileType } from "@/types/file-record";

const STEPS = [
  { number: 1, label: "Thông tin Chủ nguồn thải" },
  { number: 2, label: "Chi tiết Thu gom" },
  { number: 3, label: "Nhập kho & Tái chế" },
  { number: 4, label: "Xem lại & Gửi" },
];

export default function CreateCollectionRecordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateDraftFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(null);

  // Additional form state
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [recycledDate, setRecycledDate] = useState<Date | undefined>();
  const [locationRefId, setLocationRefId] = useState<string>("");
  const [latitude, setLatitude] = useState<number>(10.8231);
  const [longitude, setLongitude] = useState<number>(106.6297);
  const [fullAddress, setFullAddress] = useState<string>(""); // Full address string from location service
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

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [wasteOwnersRes, contractTypesRes, wasteTypesRes, hazTypesRes] = await Promise.allSettled([
        WasteOwnerService.getAllWasteOwners({ isActive: true }),
        DefinitionService.getActiveContractTypes(),
        DefinitionService.getActiveWasteTypes(),
        DefinitionService.getActiveHazTypes(),
      ]);

      if (wasteOwnersRes.status === "fulfilled") {
        setWasteOwners(
          wasteOwnersRes.value.data.map((wo) => ({
            id: wo.id,
            name: wo.name,
          })),
        );
      }

      if (contractTypesRes.status === "fulfilled") {
        // Debug: Log the raw response to see the structure
        console.log("Raw contract types response:", contractTypesRes.value);
        
        // Use the transformer utility which handles nested structure
        const transformedDefinitions = transformDefinitions(contractTypesRes.value);
        console.log("Transformed definitions:", transformedDefinitions);
        
        // Map to the format needed for the dropdown
        const transformed = transformedDefinitions.map((def) => {
          // The transformer extracts data into def.data
          // For contract types, data should have name and code
          const contractData = def.data;
          
          console.log("Definition:", def.id, "Data:", contractData, "Full def:", def);
          
          // Extract name and code
          const name = contractData?.name || contractData?.code || "";
          const code = contractData?.code || "";
          
          // If still no name, check the original raw data
          if (!name && contractTypesRes.value) {
            const original = contractTypesRes.value.find((ct: any) => String(ct.id) === String(def.id));
            if (original) {
              const originalName = original.definition_contract_type?.name || 
                                  original.data?.name || 
                                  original.name;
              const originalCode = original.definition_contract_type?.code || 
                                  original.data?.code || 
                                  original.code;
              
              return {
                id: def.id,
                name: originalName || originalCode || "Unknown",
                code: originalCode || "",
              };
            }
          }
          
          return {
            id: def.id, // Use the definition ID as the value
            name: name || "Unknown", // Should have name from nested data
            code: code,
          };
        });
        
        setContractTypes(transformed);
        console.log("Final contract types for dropdown:", transformed);
      }

      if (wasteTypesRes.status === "fulfilled") {
        // Transform waste types similar to contract types
        const transformedDefinitions = transformDefinitions(wasteTypesRes.value);
        
        const transformed = transformedDefinitions.map((def) => {
          const wasteTypeData = def.data as any; // Type assertion since data can be different types
          
          // Extract name, code, and hazCode from nested data
          const name = wasteTypeData?.name || wasteTypeData?.code || "";
          const code = wasteTypeData?.code || "";
          const hazCode = wasteTypeData?.hazCode || wasteTypeData?.haz_code || "";
          
          // Fallback to original data if needed
          if (!name && wasteTypesRes.value) {
            const original = wasteTypesRes.value.find((wt: any) => String(wt.id) === String(def.id));
            if (original) {
              const originalName = original.definition_waste_type?.name || 
                                  original.data?.name || 
                                  original.name;
              const originalCode = original.definition_waste_type?.code || 
                                  original.data?.code || 
                                  original.code;
              const originalHazCode = original.definition_waste_type?.haz_code || 
                                     original.data?.hazCode || 
                                     original.hazCode;
              
              return {
                id: def.id,
                name: originalName || originalCode || "Unknown",
                code: originalCode || "",
                hazCode: originalHazCode || "",
              };
            }
          }
          
          return {
            id: def.id, // Use the definition ID (UUID) as the value
            name: name || "Unknown",
            code: code,
            hazCode: hazCode,
          };
        });
        
        setWasteTypes(transformed);
        console.log("Final waste types for dropdown:", transformed);
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
              haz_code: hazTypeData?.hazCode || hazTypeData?.haz_code || hazTypeData?.code || "",
            };
          })
          .filter((hazType) => hazType.id && hazType.id.trim() !== ""); // Filter out any with empty IDs
        setHazTypes(transformed);
        console.log("Final HAZ types for dropdown:", transformed);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    }
  };

  const handleFieldChange = (field: keyof CreateDraftFormData, value: any) => {
    console.log("handleFieldChange:", { field, value, currentFormData: formData });
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      console.log("Updated formData:", updated);
      return updated;
    });
    // Clear error when user changes field
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
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
      // Disabled for now - allow bypassing date requirement
      // if (!recycledDate) {
      //   newErrors.recycledDate = "Ngày hoàn thành tái chế là bắt buộc";
      // }
      if (!formData.recycledVolumeKg || formData.recycledVolumeKg <= 0) {
        newErrors.recycledVolumeKg = "Khối lượng tái chế là bắt buộc";
      }
      if (!recycledPhoto) {
        newErrors.recycledPhoto = "Ảnh sản phẩm đã tái chế là bắt buộc";
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
      setDraftId(null);
    }
  };

  // Helper function to map document type to FileType
  const mapDocumentTypeToFileType = (docType: string): FileType => {
    // Map evidence document types to EVIDENCE_PHOTO
    if (["phieu-can", "bien-ban-giao-nhan", "bien-so-xe", "khac"].includes(docType)) {
      return FileType.EVIDENCE_PHOTO;
    }
    // Map quality document types
    if (docType === "chat-luong-truoc-tai-che") {
      return FileType.QUALITY_METRICS;
    }
    if (docType === "chat-luong-sau-tai-che") {
      return FileType.OUTPUT_QUALITY_METRICS;
    }
    // Default to evidence photo
    return FileType.EVIDENCE_PHOTO;
  };

  // Upload files for a record
  const uploadFilesForRecord = async (recordId: string) => {
    const uploadPromises: Promise<any>[] = [];

    // Upload evidence photos (from Step 2)
    if (evidenceFiles && evidenceFiles.length > 0) {
      // Group evidence files by type and upload them
      const evidencePhotos = evidenceFiles
        .filter((doc) => doc && doc.file && ["phieu-can", "bien-ban-giao-nhan", "bien-so-xe", "khac"].includes(doc.type))
        .map((doc) => doc.file)
        .filter((file): file is File => file instanceof File);
      
      if (evidencePhotos.length > 0) {
        console.log("Uploading evidence photos:", evidencePhotos.length, evidencePhotos.map(f => f.name));
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            evidencePhotos,
            FileType.EVIDENCE_PHOTO
          )
        );
      } else {
        console.warn("No valid evidence photos to upload");
      }
    }

    // Upload recycled photo (from Step 3) - Required
    if (recycledPhoto) {
      console.log("Uploading recycled photo:", recycledPhoto.name);
      uploadPromises.push(
        CollectionRecordService.uploadFile(recordId, {
          file: recycledPhoto,
          category: FileType.STOCKPILE_PHOTO,
        })
      );
    }

    // Upload quality documents (from Step 3)
    if (qualityDocuments && qualityDocuments.length > 0) {
      // Group by document type
      const qualityMetricsFiles = qualityDocuments
        .filter((doc) => doc && doc.file && doc.type === "chat-luong-truoc-tai-che")
        .map((doc) => doc.file)
        .filter((file): file is File => file instanceof File);
      
      const outputQualityMetricsFiles = qualityDocuments
        .filter((doc) => doc && doc.file && doc.type === "chat-luong-sau-tai-che")
        .map((doc) => doc.file)
        .filter((file): file is File => file instanceof File);

      if (qualityMetricsFiles.length > 0) {
        console.log("Uploading quality metrics files:", qualityMetricsFiles.length);
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            qualityMetricsFiles,
            FileType.QUALITY_METRICS
          )
        );
      }

      if (outputQualityMetricsFiles.length > 0) {
        console.log("Uploading output quality metrics files:", outputQualityMetricsFiles.length);
        uploadPromises.push(
          CollectionRecordService.uploadMultipleFiles(
            recordId,
            outputQualityMetricsFiles,
            FileType.OUTPUT_QUALITY_METRICS
          )
        );
      }
    }

    // Execute all uploads in parallel
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    } else {
      console.warn("No files to upload");
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // Helper function to convert Date to dd/mm/yyyy format
      const formatDateDDMMYYYY = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Transform form data to backend DTO format
      const draftData: CreateDraftDTO = {
        // Backend expects dates in dd/mm/yyyy format
        submissionMonth: formatDateDDMMYYYY(new Date(collectionDate.getFullYear(), collectionDate.getMonth(), 1)),
        collectedVolumeKg: formData.collectedVolumeKg || null,
        deliveryDate: formatDateDDMMYYYY(collectionDate),
        vehiclePlate: formData.vehiclePlate || null,
        stockpiled: formData.stockpiled ?? false,
        stockpileVolumeKg: formData.stockpileVolumeKg || null,
        recycledDate: recycledDate ? formatDateDDMMYYYY(recycledDate) : null,
        recycledVolumeKg: formData.recycledVolumeKg || null,
        // Backend expects array - convert single ID to array
        // Must be an array even if empty (backend RPC function expects array format)
        wasteOwnerIds: formData.wasteOwnerId ? [formData.wasteOwnerId] : [],
        contractTypeId: formData.contractTypeId || null,
        // Backend expects UUID for wasteSourceId (waste type ID)
        wasteSourceId: formData.wasteSourceId || null,
        // Explicitly set hazWasteId - use null if undefined, empty string, or null
        hazWasteId: (formData.hazCodeId && formData.hazCodeId.trim() !== "") ? formData.hazCodeId : null,
        pickupLocationId: locationRefId || null,
        collectedPricePerKg: formData.collectedPricePerKg || null,
      };

      console.log("Saving draft with hazWasteId:", {
        formDataHazCodeId: formData.hazCodeId,
        formDataHazCodeIdType: typeof formData.hazCodeId,
        hazWasteId: draftData.hazWasteId,
        fullFormData: JSON.stringify(formData, null, 2),
        fullDraftData: JSON.stringify(draftData, null, 2),
      });

      let currentDraftId = draftId;
      
      if (currentDraftId) {
        // For update, use the same DTO structure
        await CollectionRecordService.updateDraft(currentDraftId, draftData);
        toast.success("Đã cập nhật bản nháp");
      } else {
        const result = await CollectionRecordService.createDraft(draftData);
        currentDraftId = result.id;
        setDraftId(currentDraftId);
        toast.success("Đã lưu bản nháp");
      }

      // Upload files after draft is created/updated
      if (currentDraftId && (evidenceFiles.length > 0 || qualityDocuments.length > 0 || recycledPhoto)) {
        try {
          await uploadFilesForRecord(currentDraftId);
          toast.success("Đã tải lên tài liệu");
        } catch (fileError: any) {
          console.error("Error uploading files:", fileError);
          toast.error(
            fileError?.response?.data?.message ||
              fileError?.message ||
              "Đã lưu bản nháp nhưng không thể tải lên một số tài liệu"
          );
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu bản nháp",
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

    // Ensure vehicle plate is present before submitting
    if (!formData.vehiclePlate || formData.vehiclePlate.trim() === "") {
      toast.error("Biển số xe là bắt buộc. Vui lòng quay lại bước 2 để nhập biển số xe.");
      setCurrentStep(2);
      setErrors({ ...errors, vehiclePlate: "Biển số xe là bắt buộc" });
      return;
    }

    let currentDraftId = draftId;

    if (!currentDraftId) {
      // Save draft first
      setIsLoading(true);
      try {
        const formatDateDDMMYYYY = (date: Date): string => {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const draftData: CreateDraftDTO = {
          submissionMonth: formatDateDDMMYYYY(new Date(collectionDate.getFullYear(), collectionDate.getMonth(), 1)),
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
          hazWasteId: (formData.hazCodeId && formData.hazCodeId.trim() !== "") ? formData.hazCodeId : null,
          pickupLocationId: locationRefId || null,
          collectedPricePerKg: formData.collectedPricePerKg || null,
        };

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
    if (currentDraftId && (evidenceFiles.length > 0 || qualityDocuments.length > 0)) {
      try {
        await uploadFilesForRecord(currentDraftId);
      } catch (fileError: any) {
        console.error("Error uploading files:", fileError);
        toast.error(
          fileError?.response?.data?.message ||
            fileError?.message ||
            "Không thể tải lên một số tài liệu. Vui lòng thử lại."
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
  };

  const handleCancel = () => {
    if (confirm("Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ bị mất.")) {
      router.back();
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

  const completedSteps = Array.from(
    { length: currentStep - 1 },
    (_, i) => i + 1,
  );

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Bản ghi của tôi", href: "/recycler/my-records" },
        { label: "Tạo bản ghi mới" },
      ]}
      title="Tạo Bản ghi thu gom mới"
      subtitle=""
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
            />
          )}

          {currentStep === 4 && (
            <Step4ReviewSubmit
              formData={formData}
              onEditStep={setCurrentStep}
              wasteOwnerName={getSelectedWasteOwnerName()}
              contractTypeName={getSelectedContractTypeName()}
              wasteSourceName={getSelectedWasteSourceName()}
              collectionDate={collectionDate}
              address={address}
              recycledDate={recycledDate}
              evidenceFilesCount={evidenceFiles.length}
              qualityDocumentsCount={qualityDocuments.length}
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

