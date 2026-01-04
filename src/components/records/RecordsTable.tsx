"use client";

import { CollectionRecordDetail, RecordStatus } from "@/types/record";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { IPaginationMeta } from "@/types/pagination";
import { Eye, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface RecordsTableProps {
  records: CollectionRecordDetail[];
  isLoading?: boolean;
  onView?: (record: CollectionRecordDetail) => void;
  onEdit?: (record: CollectionRecordDetail) => void;
  pagination?: IPaginationMeta;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
      return "success"; // Green
    case "pending":
      return "warning"; // Orange/Yellow
    case "rejected":
      return "destructive"; // Red
    case "draft":
      return "outline"; // Grey
    default:
      return "outline";
  }
};

const getStatusLabel = (status: RecordStatus): string => {
  switch (status) {
    case "approved":
      return "Đã được phê duyệt";
    case "pending":
      return "Đang chờ duyệt";
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
    // Handle both ISO format and dd/mm/yyyy format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If not a valid date, try parsing as dd/mm/yyyy
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
    return dateString;
  }
};

export function RecordsTable({
  records,
  isLoading = false,
  onView,
  onEdit,
  pagination,
  onPageChange,
  onPageSizeChange,
}: RecordsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-muted-foreground">
          Không có bản ghi nào được tìm thấy
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã hồ sơ</TableHead>
            <TableHead>Ngày nộp</TableHead>
            <TableHead>Ngày thu gom</TableHead>
            <TableHead>Phân loại</TableHead>
            <TableHead>Số lượng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-mono text-sm">
                {record.recordName || record.id.slice(0, 8) + "..."}
              </TableCell>
              <TableCell>
                {formatDate(record.submittedAt || record.createdAt)}
              </TableCell>
              <TableCell>{formatDate(record.deliveryDate)}</TableCell>
              <TableCell>
                {record.contractType?.name || record.contractType?.code || "-"}
              </TableCell>
              <TableCell>
                {record.collectedVolumeKg
                  ? `${record.collectedVolumeKg.toLocaleString("vi-VN")} kg`
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(record.status)}>
                  {getStatusLabel(record.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {onView ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(record)}
                      className="h-8 w-8"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // Navigate using query params for static export compatibility
                        window.location.href = `/recycler/records/view?id=${record.id}`;
                      }}
                      className="h-8 w-8"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {record.status === "draft" && onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(record)}
                      className="h-8 w-8"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
