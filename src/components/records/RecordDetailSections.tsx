"use client";

import { CollectionRecordDetail } from "@/types/record";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordDetailSectionsProps {
  record: CollectionRecordDetail;
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
  const wasteOwner = record.wasteOwner || (record.wasteOwners && record.wasteOwners.length > 0 ? record.wasteOwners[0] : null);
  
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
            <p className="font-medium">
              {wasteOwner?.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Mã định danh (MST/CCCD)
            </p>
            <p className="font-medium">
              {wasteOwner?.businessCode || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Mã Chất thải Nguy hại (CTNH)
            </p>
            <p className="font-medium">
              {record.wasteSourceId || "-"}
            </p>
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
        {record.wasteSource?.name && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Nguồn phát sinh chất thải
            </p>
            <p className="font-medium">{record.wasteSource.name}</p>
          </div>
        )}
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
            <p className="text-sm text-muted-foreground mb-1">
              Ngày thu gom
            </p>
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
              {record.pickupLocation?.latitude && record.pickupLocation?.longitude
                ? `${record.pickupLocation.latitude.toFixed(6)}, ${record.pickupLocation.longitude.toFixed(6)}`
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StorageRecyclingSection({
  record,
}: RecordDetailSectionsProps) {
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

export function EvidenceSection({ record }: RecordDetailSectionsProps) {
  // TODO: Fetch actual files from record.files when backend provides this
  // For now, this is a placeholder
  const evidenceFiles: Array<{ name: string; type: string }> = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bằng chứng được tải lên</CardTitle>
      </CardHeader>
      <CardContent>
        {evidenceFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có tài liệu nào được tải lên
          </p>
        ) : (
          <div className="space-y-2">
            {evidenceFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Xem
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


