"use client";

import { CollectionRecordDetail } from "@/types/record";
import { ICollectionRecordFilesWithPreview } from "@/types/file-record";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Download, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordDetailSectionsProps {
  record: CollectionRecordDetail;
  filesWithPreview?: ICollectionRecordFilesWithPreview | null;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return format(new Date(year, month, day), "dd/MM/yyyy");
      }
      return dateString;
    }
    return format(date, "dd/MM/yyyy");
  } catch {
    return dateString || "-";
  }
};

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return format(date, "dd/MM/yyyy - HH:mm");
  } catch {
    return dateString || "-";
  }
};

export function WasteSourceInfoSection({ record }: RecordDetailSectionsProps) {
  // Handle both wasteOwner (singular) and wasteOwners (array) from backend
  const wasteOwner =
    record.wasteOwner ||
    (record.wasteOwners && record.wasteOwners.length > 0
      ? record.wasteOwners[0]
      : null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin Chủ nguồn thải</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Tên Chủ nguồn thải
            </p>
            <p className="font-medium">{wasteOwner?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Mã định danh (MST/CCCD)
            </p>
            <p className="font-medium">{wasteOwner?.businessCode || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Mã Chất thải Nguy hại (CTNH)
            </p>
            <p className="font-medium">{record.hazWaste?.code || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Phân loại (theo Hợp đồng)
            </p>
            <p className="font-medium">
              {record.contractType?.code || record.contractType?.name || "-"}
              {record.contractType?.name &&
                record.contractType?.code !== record.contractType?.name && (
                  <span className="text-muted-foreground ml-2">
                    ({record.contractType.name})
                  </span>
                )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CollectionDetailsSection({
  record,
}: RecordDetailSectionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi tiết thu gom</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Ngày thu gom</p>
            <p className="font-medium">{formatDate(record.deliveryDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Số lượng</p>
            <p className="font-medium">
              {record.collectedVolumeKg
                ? `${record.collectedVolumeKg.toLocaleString("vi-VN")} kg`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Giá thu gom (VNĐ/kg)
            </p>
            <p className="font-medium">
              {record.collectedPricePerKg
                ? `${record.collectedPricePerKg.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VNĐ/kg`
                : "-"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground mb-1">
              Địa chỉ chi tiết
            </p>
            <p className="font-medium">
              {record.pickupLocation?.address || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Biển số xe thu gom
            </p>
            <p className="font-medium">{record.vehiclePlate || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Vị trí thu gom (GPS)
            </p>
            <p className="font-medium">
              {record.pickupLocation?.latitude &&
              record.pickupLocation?.longitude
                ? `${record.pickupLocation.latitude.toFixed(6)}, ${record.pickupLocation.longitude.toFixed(6)}`
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StorageRecyclingSection({ record }: RecordDetailSectionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lưu kho & Tái chế</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Trạng thái lưu kho
            </p>
            <p className="font-medium">
              {record.stockpiled ? "Đã nhập kho" : "Chưa nhập kho"}
            </p>
          </div>
          {record.stockpiled && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Khối lượng nhập kho (kg)
              </p>
              <p className="font-medium">
                {record.stockpileVolumeKg
                  ? `${record.stockpileVolumeKg.toLocaleString("vi-VN")} kg`
                  : "-"}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Ngày hoàn thành tái chế
            </p>
            <p className="font-medium">{formatDate(record.recycledDate)}</p>
          </div>
          {record.stockpiled && record.deliveryDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Ngày nhập kho
              </p>
              <p className="font-medium">
                {formatDateTime(record.deliveryDate)}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Khối lượng đã tái chế (kg)
            </p>
            <p className="font-medium">
              {record.recycledVolumeKg
                ? `${record.recycledVolumeKg.toLocaleString("vi-VN")} kg`
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EvidenceSection({
  record,
  filesWithPreview,
}: RecordDetailSectionsProps) {
  const evidenceFiles = filesWithPreview?.evidencePhotos || [];
  const stockpilePhoto = filesWithPreview?.stockpilePhoto;
  const recycledPhoto = filesWithPreview?.recycledPhoto;
  const acceptanceDoc = filesWithPreview?.acceptanceDoc;
  const outputQualityMetrics = filesWithPreview?.outputQualityMetrics;
  const qualityMetrics = filesWithPreview?.qualityMetrics;

  const isImageFile = (mimeType: string): boolean => {
    return mimeType.startsWith("image/");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handlePreview = (signedUrl: string, fileName: string) => {
    window.open(signedUrl, "_blank");
  };

  const hasAnyFiles =
    evidenceFiles.length > 0 ||
    stockpilePhoto ||
    recycledPhoto ||
    acceptanceDoc ||
    outputQualityMetrics ||
    qualityMetrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tài liệu đính kèm</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyFiles ? (
          <p className="text-sm text-muted-foreground">
            Chưa có tài liệu nào được tải lên
          </p>
        ) : (
          <div className="space-y-4">
            {/* Evidence Photos */}
            {evidenceFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Ảnh bằng chứng ({evidenceFiles.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {evidenceFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {isImageFile(file.mimeType) ? (
                        <div className="relative">
                          <img
                            src={file.signedUrl}
                            alt={file.fileName}
                            className="w-full h-32 object-cover cursor-pointer"
                            onClick={() =>
                              handlePreview(file.signedUrl, file.fileName)
                            }
                          />
                          <div className="p-2">
                            <p
                              className="text-xs font-medium truncate"
                              title={file.fileName}
                            >
                              {file.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <p
                              className="text-xs font-medium truncate flex-1"
                              title={file.fileName}
                            >
                              {file.fileName}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {formatFileSize(file.fileSize)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              handlePreview(file.signedUrl, file.fileName)
                            }
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Xem
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stockpile Photo */}
            {stockpilePhoto && (
              <div>
                <p className="text-sm font-medium mb-2">Ảnh kho bãi</p>
                <div className="border rounded-md overflow-hidden hover:shadow-md transition-shadow max-w-md">
                  {isImageFile(stockpilePhoto.mimeType) ? (
                    <div className="relative">
                      <img
                        src={stockpilePhoto.signedUrl}
                        alt={stockpilePhoto.fileName}
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() =>
                          handlePreview(
                            stockpilePhoto.signedUrl,
                            stockpilePhoto.fileName,
                          )
                        }
                      />
                      <div className="p-2">
                        <p
                          className="text-xs font-medium truncate"
                          title={stockpilePhoto.fileName}
                        >
                          {stockpilePhoto.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(stockpilePhoto.fileSize)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <p
                          className="text-xs font-medium truncate flex-1"
                          title={stockpilePhoto.fileName}
                        >
                          {stockpilePhoto.fileName}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatFileSize(stockpilePhoto.fileSize)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          handlePreview(
                            stockpilePhoto.signedUrl,
                            stockpilePhoto.fileName,
                          )
                        }
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Xem
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recycled Photo */}
            {recycledPhoto && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Ảnh sản phẩm đã tái chế
                </p>
                <div className="border rounded-md overflow-hidden hover:shadow-md transition-shadow max-w-md">
                  {isImageFile(recycledPhoto.mimeType) ? (
                    <div className="relative">
                      <img
                        src={recycledPhoto.signedUrl}
                        alt={recycledPhoto.fileName}
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() =>
                          handlePreview(
                            recycledPhoto.signedUrl,
                            recycledPhoto.fileName,
                          )
                        }
                      />
                      <div className="p-2">
                        <p
                          className="text-xs font-medium truncate"
                          title={recycledPhoto.fileName}
                        >
                          {recycledPhoto.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(recycledPhoto.fileSize)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <p
                          className="text-xs font-medium truncate flex-1"
                          title={recycledPhoto.fileName}
                        >
                          {recycledPhoto.fileName}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatFileSize(recycledPhoto.fileSize)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          handlePreview(
                            recycledPhoto.signedUrl,
                            recycledPhoto.fileName,
                          )
                        }
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Xem
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acceptance Doc */}
            {acceptanceDoc && (
              <div>
                <p className="text-sm font-medium mb-2">Tài liệu chấp nhận</p>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {acceptanceDoc.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(acceptanceDoc.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handlePreview(
                        acceptanceDoc.signedUrl,
                        acceptanceDoc.fileName,
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Xem
                  </Button>
                </div>
              </div>
            )}

            {/* Quality Metrics */}
            {outputQualityMetrics && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Chất lượng sau tái chế
                </p>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {outputQualityMetrics.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(outputQualityMetrics.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handlePreview(
                        outputQualityMetrics.signedUrl,
                        outputQualityMetrics.fileName,
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Xem
                  </Button>
                </div>
              </div>
            )}

            {/* Quality Metrics (Before) */}
            {qualityMetrics && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Chất lượng trước tái chế
                </p>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {qualityMetrics.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(qualityMetrics.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handlePreview(
                        qualityMetrics.signedUrl,
                        qualityMetrics.fileName,
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Xem
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
