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
import { CreateDraftDTO } from "@/types/record";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { DefinitionService } from "@/lib/services/definition.service";
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
  const [formData, setFormData] = useState<Partial<CreateDraftDTO>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<string | null>(null);

  // Additional form state
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [recycledDate, setRecycledDate] = useState<Date | undefined>();
  const [locationRefId, setLocationRefId] = useState<string>("");
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
  const [wasteSources, setWasteSources] = useState<
    Array<{ id: string; name: string }>
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
        setContractTypes(
          contractTypesRes.value.map((ct: any) => ({
            id: ct.id || ct.data?.code,
            name: ct.data?.name || ct.name,
            code: ct.data?.code || ct.code,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    }
  };

  const handleFieldChange = (field: keyof CreateDraftDTO, value: any) => {
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
      setAddress({});
      setEvidenceFiles([]);
      setQualityDocuments([]);
      setDraftId(null);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const draftData: CreateDraftDTO = {
        submissionMonth: format(collectionDate, "yyyy-MM"),
        collectedVolumeKg: formData.collectedVolumeKg || null,
        deliveryDate: collectionDate.toISOString().split("T")[0],
        stockpiled: formData.stockpiled || null,
        stockpileVolumeKg: formData.stockpileVolumeKg || null,
        recycledDate: recycledDate
          ? recycledDate.toISOString().split("T")[0]
          : null,
        recycledVolumeKg: formData.recycledVolumeKg || null,
        wasteOwnerId: formData.wasteOwnerId || null,
        contractTypeId: formData.contractTypeId || null,
        wasteSourceId: formData.wasteSourceId || null,
        pickupLocation: locationRefId ? { refId: locationRefId } : null,
        collectedPricePerKg: formData.collectedPricePerKg || null,
      };

      if (draftId) {
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
    const source = wasteSources.find((ws) => ws.id === formData.wasteSourceId);
    return source?.name;
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
              wasteSources={wasteSources}
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
              latitude={10.8231}
              longitude={106.6297}
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

