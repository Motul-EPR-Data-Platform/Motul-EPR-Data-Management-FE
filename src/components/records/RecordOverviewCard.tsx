"use client";

import { CollectionRecordDetail, RecordStatus } from "@/types/record";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface RecordOverviewCardProps {
  record: CollectionRecordDetail;
}

const getStatusBadgeVariant = (
  status: RecordStatus,
):
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning" => {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "destructive";
    case "draft":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: RecordStatus): string => {
  switch (status) {
    case "approved":
      return "Đã được phê duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Bị từ chối";
    case "draft":
      return "Bản nháp";
    default:
      return status;
  }
};

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
        return format(new Date(year, month, day), "yyyy-MM-dd");
      }
      return dateString;
    }
    return format(date, "yyyy-MM-dd");
  } catch {
    return dateString || "-";
  }
};

export function RecordOverviewCard({ record }: RecordOverviewCardProps) {
  // Handle both wasteOwner (singular) and wasteOwners (array) from backend
  const wasteOwner =
    record.wasteOwner ||
    (record.wasteOwners && record.wasteOwners.length > 0
      ? record.wasteOwners[0]
      : null);
  const recyclerName = record.recycler?.vendorName;

  return (
    <Card className="border-red-500">
      <CardHeader>
        <CardTitle>Tổng quan bản ghi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">ID</p>
          <p className="font-medium font-mono">{record.id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Ngày nộp</p>
          <p className="font-medium">
            {formatDate(record.submittedAt || record.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Đơn vị tái chế</p>
          <p className="font-medium">
            {recyclerName || "N/A"}
            {wasteOwner && "email" in wasteOwner && wasteOwner.email && (
              <span className="text-muted-foreground text-sm ml-2">
                ({wasteOwner.email})
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
          <Badge variant={getStatusBadgeVariant(record.status)}>
            {getStatusLabel(record.status)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
