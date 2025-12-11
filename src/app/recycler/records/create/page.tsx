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

  // Data for dropdowns
  const [wasteOwners, setWasteOwners] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [contractTypes, setContractTypes] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [wasteOwnersRes, contractTypesRes] = await Promise.allSettled([
        WasteOwnerService.getAllWasteOwners({ isActive: true }),
        DefinitionService.getActiveContractTypes(),
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
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    }
  };

  const handleFieldChange = (field: keyof CreateDraftFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    }

    if (step === 2) {
      if (!formData.collectedVolumeKg || formData.collectedVolumeKg <= 0) {
        newErrors.collectedVolumeKg = "Khối lượng thu gom là bắt buộc";
      }
      if (!locationRefId) {
        newErrors.locationRefId = "Địa chỉ thu gom là bắt buộc";
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
      setDraftId(null);
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
        stockpiled: formData.stockpiled || null,
        stockpileVolumeKg: formData.stockpileVolumeKg || null,
        recycledDate: recycledDate ? formatDateDDMMYYYY(recycledDate) : null,
        recycledVolumeKg: formData.recycledVolumeKg || null,
        // Backend expects array - convert single ID to array
        // Must be an array even if empty (backend RPC function expects array format)
        wasteOwnerIds: formData.wasteOwnerId ? [formData.wasteOwnerId] : [],
        contractTypeId: formData.contractTypeId || null,
        // Backend expects UUID for wasteSourceId, but we're using waste codes
        // Only send if it looks like a UUID, otherwise omit it
        wasteSourceId: formData.wasteSourceId && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(formData.wasteSourceId)
          ? formData.wasteSourceId 
          : undefined,
        // Backend expects address string, not refId
        pickupLocation: locationRefId && fullAddress
          ? { address: fullAddress }
          : locationRefId
            ? { address: locationRefId } // Fallback to refId if full address not available
            : undefined,
        collectedPricePerKg: formData.collectedPricePerKg || null,
      };

      if (draftId) {
        // For update, use the same DTO structure
        await CollectionRecordService.updateDraft(draftId, draftData);
        toast.success("Đã cập nhật bản nháp");
      } else {
        const result = await CollectionRecordService.createDraft(draftData);
        setDraftId(result.id);
        toast.success("Đã lưu bản nháp");
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

    if (!draftId) {
      // Save draft first
      await handleSaveDraft();
      if (!draftId) return;
    }

    setIsLoading(true);
    try {
      await CollectionRecordService.submitRecord(draftId!);
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
    // Hazardous waste codes are now hardcoded values
    return formData.wasteSourceId || undefined;
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

