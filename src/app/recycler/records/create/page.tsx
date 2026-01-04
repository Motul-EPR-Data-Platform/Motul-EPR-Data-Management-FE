"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProgressStepper } from "@/components/records/ProgressStepper";
import { FormNavigationButtons } from "@/components/records/FormNavigationButtons";
import { Step1WasteSourceInfo } from "@/components/records/steps/Step1WasteSourceInfo";
import { Step2CollectionDetails } from "@/components/records/steps/Step2CollectionDetails";
import { Step3WarehouseRecycling } from "@/components/records/steps/Step3WarehouseRecycling";
import { Step4ReviewSubmit } from "@/components/records/steps/Step4ReviewSubmit";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCollectionRecordForm } from "@/hooks/useCollectionRecordForm";
import { BatchService } from "@/lib/services/batch.service";

const STEPS = [
  { number: 1, label: "Thông tin Chủ nguồn thải" },
  { number: 2, label: "Chi tiết Thu gom" },
  { number: 3, label: "Nhập kho & Tái chế" },
  { number: 4, label: "Xem lại & Gửi" },
];

export default function CreateCollectionRecordPage() {
  const {
    currentStep,
    setCurrentStep,
    isLoading,
    formData,
    errors,
    collectionDate,
    setCollectionDate,
    recycledDate,
    setRecycledDate,
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
    evidenceFiles,
    setEvidenceFiles,
    qualityDocuments,
    setQualityDocuments,
    recycledPhoto,
    setRecycledPhoto,
    stockpilePhoto,
    setStockpilePhoto,
    dropdownData,
    handleFieldChange,
    handleNext,
    handleBack,
    handleRedo,
    handleSaveDraft,
    handleSubmit,
    handleCancel,
    getSelectedWasteOwnerName,
    getSelectedContractTypeName,
    getSelectedWasteSourceName,
    getSelectedHazCodeName,
  } = useCollectionRecordForm({ mode: "create" });

  const [batchName, setBatchName] = useState<string | undefined>();

  // Fetch batch name when batchId changes
  useEffect(() => {
    const fetchBatchName = async () => {
      if (formData.batchId) {
        try {
          const batchDetail = await BatchService.getBatchById(formData.batchId);
          setBatchName(batchDetail.batch.batchName);
        } catch (error) {
          console.error("Error fetching batch name:", error);
          setBatchName(undefined);
        }
      } else {
        setBatchName(undefined);
      }
    };
    fetchBatchName();
  }, [formData.batchId]);

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
              wasteOwners={dropdownData.wasteOwners}
              contractTypes={dropdownData.contractTypes}
              wasteTypes={dropdownData.wasteTypes}
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
              hazTypes={dropdownData.hazTypes}
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
              batchName={batchName}
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
