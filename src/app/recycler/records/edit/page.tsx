"use client";

import { useEffect, useState } from "react";
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
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { DocumentFile } from "@/components/records/DocumentUpload";
import { toast } from "sonner";
import { useCollectionRecordForm } from "@/hooks/useCollectionRecordForm";
import { parseDate, urlToFile } from "@/lib/utils/collectionRecordHelpers";
import { ICollectionRecordFilesWithPreview } from "@/types/file-record";
import { BatchService } from "@/lib/services/batch.service";

const STEPS = [
  { number: 1, label: "Thông tin Chủ nguồn thải" },
  { number: 2, label: "Chi tiết Thu gom" },
  { number: 3, label: "Nhập kho & Tái chế" },
  { number: 4, label: "Xem lại & Gửi" },
];

export default function EditCollectionRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get("id");

  const {
    currentStep,
    setCurrentStep,
    isLoading,
    isLoadingRecord,
    setIsLoadingRecord,
    formData,
    setFormData,
    errors,
    draftId,
    setDraftId,
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
    originalFileIdsRef,
    originalFileRefsRef,
    setOriginalFormData,
  } = useCollectionRecordForm({ mode: "edit", recordId });

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

  // Load record data (edit mode only)
  useEffect(() => {
    if (!recordId) {
      toast.error("Không tìm thấy ID bản ghi");
      router.push("/recycler/my-records");
      return;
    }

    const loadRecordAndFiles = async () => {
      setIsLoadingRecord(true);
      try {
        const [recordRes, filesRes] = await Promise.allSettled([
          CollectionRecordService.getRecordById(recordId),
          CollectionRecordService.getRecordFilesWithPreview(recordId, 3600),
        ]);

        // Load and prefill record data
        if (recordRes.status === "fulfilled" && recordRes.value) {
          const record = recordRes.value;
          setDraftId(record.id);

          // Prefill form data from record
          const wasteOwnerId =
            record.wasteOwners && record.wasteOwners.length > 0
              ? record.wasteOwners[0].id
              : record.wasteOwnerId || null;

          const hazWasteId =
            (record as any).hazWasteId ||
            (record as any).hazWaste?.id ||
            null;

          const prefillData = {
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

          // Prefill dates
          let parsedCollectionDate = new Date();
          if (record.deliveryDate) {
            const parsedDate = parseDate(record.deliveryDate);
            if (parsedDate) {
              parsedCollectionDate = parsedDate;
              setCollectionDate(parsedDate);
            }
          }
          let parsedRecycledDate: Date | undefined = undefined;
          if (record.recycledDate) {
            const parsedDate = parseDate(record.recycledDate);
            if (parsedDate) {
              parsedRecycledDate = parsedDate;
              setRecycledDate(parsedDate);
            }
          }

          // Prefill location data
          let locationRefIdValue = "";
          if (record.pickupLocation) {
            setFullAddress(record.pickupLocation.address || "");
            if (
              record.pickupLocation.latitude &&
              record.pickupLocation.longitude
            ) {
              setLatitude(record.pickupLocation.latitude);
              setLongitude(record.pickupLocation.longitude);
            }
            if (record.pickupLocationId) {
              locationRefIdValue = record.pickupLocationId;
              setLocationRefId(record.pickupLocationId);
            }
          }

          // Store original form data for change tracking
          setOriginalFormData(prefillData, parsedCollectionDate, parsedRecycledDate, locationRefIdValue);

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
            const filesWithPreview = filesRes.value as ICollectionRecordFilesWithPreview;

            try {
              // Convert evidence photos to DocumentFile format
              if (filesWithPreview.evidencePhotos?.length > 0) {
                const evidenceDocs: DocumentFile[] = await Promise.all(
                  filesWithPreview.evidencePhotos.map(async (file) => {
                    const fileObj = await urlToFile(
                      file.signedUrl,
                      file.fileName,
                      file.mimeType,
                    );
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

              // Convert quality metrics files
              const qualityDocs: DocumentFile[] = [];

              // Output quality metrics
              if (filesWithPreview.outputQualityMetrics) {
                const fileObj = await urlToFile(
                  filesWithPreview.outputQualityMetrics.signedUrl,
                  filesWithPreview.outputQualityMetrics.fileName,
                  filesWithPreview.outputQualityMetrics.mimeType,
                );
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

              // Convert recycled photo
              if (filesWithPreview.recycledPhoto) {
                const fileObj = await urlToFile(
                  filesWithPreview.recycledPhoto.signedUrl,
                  filesWithPreview.recycledPhoto.fileName,
                  filesWithPreview.recycledPhoto.mimeType,
                );
                originalFileIdsRef.current.recycledPhoto =
                  filesWithPreview.recycledPhoto.id;
                originalFileRefsRef.current.recycledPhoto = fileObj;
                setRecycledPhoto(fileObj);
              }

              // Convert stockpile photo
              if (filesWithPreview.stockpilePhoto) {
                const fileObj = await urlToFile(
                  filesWithPreview.stockpilePhoto.signedUrl,
                  filesWithPreview.stockpilePhoto.fileName,
                  filesWithPreview.stockpilePhoto.mimeType,
                );
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
        }
      } catch (error: any) {
        console.error("Error loading record:", error);
        toast.error("Không thể tải dữ liệu");
        router.push("/recycler/my-records");
      } finally {
        setIsLoadingRecord(false);
      }
    };

    loadRecordAndFiles();
  }, [
    recordId,
    router,
    setDraftId,
    setFormData,
    setCollectionDate,
    setRecycledDate,
    setFullAddress,
    setLatitude,
    setLongitude,
    setLocationRefId,
    setEvidenceFiles,
    setQualityDocuments,
    setRecycledPhoto,
    setStockpilePhoto,
    originalFileIdsRef,
    originalFileRefsRef,
    setIsLoadingRecord,
  ]);

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
