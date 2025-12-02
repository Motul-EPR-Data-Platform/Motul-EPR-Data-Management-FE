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
import { WasteOwnerWithLocation } from "@/types/waste-owner";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface WasteOwnerTableProps {
  wasteOwners: WasteOwnerWithLocation[];
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
      return "TC"; // Tổ chức
    default:
      return type;
  }
};

const getWasteOwnerTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
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
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tên Chủ nguồn thải</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Mã số thuế (MST)</TableHead>
            <TableHead>Số CCCD</TableHead>
            <TableHead>Người liên hệ</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wasteOwners.map((wasteOwner) => {
            // For individual type, businessCode is CCCD, for others it's MST
            const isIndividual = wasteOwner.wasteOwnerType === "individual";
            const mst = isIndividual ? "-" : wasteOwner.businessCode;
            const cccd = isIndividual ? wasteOwner.businessCode : "-";

            return (
              <TableRow key={wasteOwner.id}>
                <TableCell className="font-mono text-sm">{wasteOwner.id}</TableCell>
                <TableCell className="font-medium">
                  <div>
                    <div>{wasteOwner.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {wasteOwner.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getWasteOwnerTypeBadgeVariant(wasteOwner.wasteOwnerType)}>
                    {getWasteOwnerTypeLabel(wasteOwner.wasteOwnerType)}
                  </Badge>
                </TableCell>
                <TableCell>{mst}</TableCell>
                <TableCell>{cccd}</TableCell>
                <TableCell>{wasteOwner.contactPerson}</TableCell>
                <TableCell>{wasteOwner.phone}</TableCell>
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
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(wasteOwner)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
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
  );
}

