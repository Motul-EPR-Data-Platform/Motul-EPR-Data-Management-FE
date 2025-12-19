"use client";

import { useState, useEffect } from "react";
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
import { CreateDraftDTO, CreateDraftFormData, CollectionRecordDetail } from "@/types/record";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { DefinitionService } from "@/lib/services/definition.service";
import { transformDefinitions } from "@/lib/utils/definitionUtils/definitionTransformers";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import { FileType } from "@/types/file-record";

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

  const loadRecordAndDropdownData = async () => {
    setIsLoadingRecord(true);
    try {
      // Load dropdown data and record data in parallel
      const [wasteOwnersRes, contractTypesRes, wasteTypesRes, hazTypesRes, recordRes] = await Promise.allSettled([
        WasteOwnerService.getAllWasteOwners({ isActive: true }),
        DefinitionService.getActiveContractTypes(),
        DefinitionService.getActiveWasteTypes(),
        DefinitionService.getActiveHazTypes(),
        recordId ? CollectionRecordService.getRecordById(recordId) : Promise.resolve(null),
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
        const transformedDefinitions = transformDefinitions(contractTypesRes.value);
        const transformed = transformedDefinitions.map((def) => {
          const contractData = def.data as any;
          return {
            id: def.id,
            name: contractData?.name || def.name || "Unknown",
            code: contractData?.code || "",
          };
        });
        setContractTypes(transformed);
      }

      if (wasteTypesRes.status === "fulfilled") {
        const transformedDefinitions = transformDefinitions(wasteTypesRes.value);
        const transformed = transformedDefinitions.map((def) => {
          const wasteTypeData = def.data as any;
          return {
            id: def.id,
            name: wasteTypeData?.name || def.name || "Unknown",
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
              haz_code: hazTypeData?.hazCode || hazTypeData?.haz_code || hazTypeData?.code || "",
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
          (record.wasteOwners && record.wasteOwners.length > 0) 
            ? record.wasteOwners[0].id 
            : record.wasteOwnerId || null;

        const prefillData: Partial<CreateDraftFormData> = {
          wasteOwnerId,
          contractTypeId: record.contractTypeId || null,
          wasteSourceId: record.wasteSourceId || null,
          hazCodeId: (record as any).hazCodeId || null,
          collectedVolumeKg: record.collectedVolumeKg || null,
          vehiclePlate: record.vehiclePlate || null,
          stockpiled: record.stockpiled || null,
          stockpileVolumeKg: record.stockpileVolumeKg || null,
          recycledVolumeKg: record.recycledVolumeKg || null,
          collectedPricePerKg: record.collectedPricePerKg || null,
        };
        setFormData(prefillData);

        // Prefill dates
        if (record.deliveryDate) {
          const parsedDate = parseDate(record.deliveryDate);
          if (parsedDate) {
            setCollectionDate(parsedDate);
          }
        }
        if (record.recycledDate) {
          const parsedDate = parseDate(record.recycledDate);
          if (parsedDate) {
            setRecycledDate(parsedDate);
          }
        }

        // Prefill location data
        if (record.pickupLocation) {
          setFullAddress(record.pickupLocation.address || "");
          if (record.pickupLocation.latitude && record.pickupLocation.longitude) {
            setLatitude(record.pickupLocation.latitude);
            setLongitude(record.pickupLocation.longitude);
          }
          // Try to extract location refId if available
          if (record.pickupLocationId) {
            setLocationRefId(record.pickupLocationId);
          }
        }

        // Load files if available
        if (record.files) {
          // Convert evidence photos to DocumentFile format
          if (record.files.evidencePhotos && record.files.evidencePhotos.length > 0) {
            // Note: We can't convert IFile to DocumentFile directly, so we'll need to handle this
            // For now, files will need to be re-uploaded if editing
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
    if (confirm("Bạn có chắc chắn muốn hủy? Tất cả thay đổi chưa lưu sẽ bị mất.")) {
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
      // Reload record data
      if (recordId) {
        loadRecordAndDropdownData();
      }
    }
  };

  const mapDocumentTypeToFileType = (docType: string): FileType => {
    if (["phieu-can", "bien-ban-giao-nhan", "bien-so-xe", "khac"].includes(docType)) {
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

  const uploadFilesForRecord = async (recordId: string) => {
    const uploadPromises: Promise<any>[] = [];

    if (evidenceFiles && evidenceFiles.length > 0) {
      const filesToUpload = evidenceFiles
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

    if (qualityDocuments && qualityDocuments.length > 0) {
      for (const doc of qualityDocuments) {
        if (doc.file instanceof File) {
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

    if (recycledPhoto instanceof File) {
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
        stockpiled: formData.stockpiled || null,
        stockpileVolumeKg: formData.stockpileVolumeKg || null,
        recycledDate: recycledDate ? formatDateDDMMYYYY(recycledDate) : null,
        recycledVolumeKg: formData.recycledVolumeKg || null,
        wasteOwnerIds: formData.wasteOwnerId ? [formData.wasteOwnerId] : [],
        contractTypeId: formData.contractTypeId || null,
        wasteSourceId: formData.wasteSourceId || null,
        hazCodeId: formData.hazCodeId || null,
        pickupLocation: locationRefId && fullAddress
          ? { address: fullAddress }
          : locationRefId
            ? { address: locationRefId }
            : undefined,
        collectedPricePerKg: formData.collectedPricePerKg || null,
      };

      await CollectionRecordService.updateDraft(draftId, draftData);
      toast.success("Đã cập nhật bản nháp");

      // Upload files after draft is updated
      if (evidenceFiles.length > 0 || qualityDocuments.length > 0 || recycledPhoto) {
        try {
          await uploadFilesForRecord(draftId);
          toast.success("Đã tải lên tài liệu");
        } catch (fileError: any) {
          console.error("Error uploading files:", fileError);
          toast.error("Đã cập nhật bản nháp nhưng không thể tải lên một số tài liệu");
        }
      }
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
      toast.error("Biển số xe là bắt buộc. Vui lòng quay lại bước 2 để nhập biển số xe.");
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
        stockpiled: formData.stockpiled || null,
        stockpileVolumeKg: formData.stockpileVolumeKg || null,
        recycledDate: recycledDate ? formatDateDDMMYYYY(recycledDate) : null,
        recycledVolumeKg: formData.recycledVolumeKg || null,
        wasteOwnerIds: formData.wasteOwnerId ? [formData.wasteOwnerId] : [],
        contractTypeId: formData.contractTypeId || null,
        wasteSourceId: formData.wasteSourceId || null,
        hazCodeId: formData.hazCodeId || null,
        pickupLocation: locationRefId && fullAddress
          ? { address: fullAddress }
          : locationRefId
            ? { address: locationRefId }
            : undefined,
        collectedPricePerKg: formData.collectedPricePerKg || null,
      };

      // Update draft first
      await CollectionRecordService.updateDraft(draftId, draftData);

      // Upload files
      if (evidenceFiles.length > 0 || qualityDocuments.length > 0 || recycledPhoto) {
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
          <p className="text-center text-muted-foreground py-12">Đang tải dữ liệu...</p>
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

