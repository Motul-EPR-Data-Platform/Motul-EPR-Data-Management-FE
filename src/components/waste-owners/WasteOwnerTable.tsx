"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { WasteOwnerWithLocation } from "@/types/waste-owner";
import { IPaginationMeta } from "@/types/pagination";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface WasteOwnerTableProps {
  wasteOwners: WasteOwnerWithLocation[];
  pagination?: IPaginationMeta;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onView?: (wasteOwner: WasteOwnerWithLocation) => void;
  onEdit?: (wasteOwner: WasteOwnerWithLocation) => void;
  onDelete?: (wasteOwner: WasteOwnerWithLocation) => void;
}

const getWasteOwnerTypeLabel = (type: string): string => {
  switch (type) {
    case "individual":
      return "CN"; // Cá nhân
    case "business":
      return "DN"; // Doanh nghiệp
    case "organization":
      return "HKD"; // Hộ kinh doanh
    default:
      return type;
  }
};

const getWasteOwnerTypeBadgeVariant = (
  type: string,
): "default" | "secondary" | "outline" => {
  switch (type) {
    case "individual":
      return "outline";
    case "business":
      return "default";
    case "organization":
      return "secondary";
    default:
      return "outline";
  }
};

export function WasteOwnerTable({
  wasteOwners,
  pagination,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
}: WasteOwnerTableProps) {
  if (wasteOwners.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-center text-muted-foreground py-12">
          Không có dữ liệu chủ nguồn thải
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên Chủ nguồn thải</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Mã số thuế (MST) / Số CCCD</TableHead>
              <TableHead>Người liên hệ</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wasteOwners.map((wasteOwner, index) => {
              // For individual type, businessCode is CCCD, for others it's MST
              const isIndividual = wasteOwner.wasteOwnerType === "individual";
              const businessCode = wasteOwner.businessCode || "-";
              const isActive = wasteOwner.isActive ?? true;

              // Calculate global index for pagination
              const globalIndex = pagination
                ? (pagination.page - 1) * pagination.limit + index + 1
                : index + 1;

              return (
                <TableRow
                  key={wasteOwner.id}
                  className={!isActive ? "opacity-60 bg-muted/30" : ""}
                >
                  <TableCell className="text-center">{globalIndex}</TableCell>
                  <TableCell
                    className={`font-medium ${!isActive ? "text-muted-foreground" : ""}`}
                  >
                    <div>
                      <div>{wasteOwner.name}</div>
                      <div
                        className={`text-sm ${!isActive ? "text-muted-foreground/70" : "text-muted-foreground"}`}
                      >
                        {wasteOwner.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getWasteOwnerTypeBadgeVariant(
                        wasteOwner.wasteOwnerType,
                      )}
                      className={!isActive ? "opacity-60" : ""}
                    >
                      {getWasteOwnerTypeLabel(wasteOwner.wasteOwnerType)}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={!isActive ? "text-muted-foreground" : ""}
                  >
                    {businessCode}
                  </TableCell>
                  <TableCell
                    className={!isActive ? "text-muted-foreground" : ""}
                  >
                    {wasteOwner.contactPerson}
                  </TableCell>
                  <TableCell
                    className={!isActive ? "text-muted-foreground" : ""}
                  >
                    {wasteOwner.phone}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(wasteOwner)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(wasteOwner)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(wasteOwner)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
