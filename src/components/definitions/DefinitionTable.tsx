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
import { Definition } from "@/types/definition";
import { Archive } from "lucide-react";

interface DefinitionTableProps {
  definitions: Definition[];
  categoryKey: string;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  showActions?: boolean;
}

export function DefinitionTable({
  definitions,
  categoryKey,
  onEdit,
  onArchive,
  showActions = false,
}: DefinitionTableProps) {
  const getDefinitionName = (definition: Definition): string => {
    const data = definition.data as any;
    return data?.name || "N/A";
  };

  const getDefinitionCode = (definition: Definition): string => {
    const data = definition.data as any;
    return data?.code || "N/A";
  };

  const getDefinitionDescription = (definition: Definition): string => {
    const data = definition.data as any;
    return data?.description || "-";
  };

  // Get additional fields based on category
  const getAdditionalFields = (definition: Definition): Record<string, any> => {
    const data = definition.data as any;
    const baseFields = ["code", "name", "description"];
    const additional: Record<string, any> = {};
    
    // Handle null/undefined data
    if (!data || typeof data !== "object") {
      return additional;
    }
    
    Object.keys(data).forEach((key) => {
      if (!baseFields.includes(key) && data[key] !== null && data[key] !== undefined) {
        additional[key] = data[key];
      }
    });
    
    return additional;
  };

  if (definitions.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-center text-muted-foreground py-12">
          Không có định nghĩa nào trong danh mục này
        </p>
      </div>
    );
  }

  const sampleDefinition = definitions[0];
  const additionalFields = getAdditionalFields(sampleDefinition);
  const hasAdditionalFields = Object.keys(additionalFields).length > 0;

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Mô tả</TableHead>
            {hasAdditionalFields &&
              Object.keys(additionalFields).map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            {showActions && <TableHead>Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {definitions.map((definition) => {
            const additional = getAdditionalFields(definition);
            return (
              <TableRow key={definition.id}>
                <TableCell className="font-mono text-sm">
                  {getDefinitionCode(definition)}
                </TableCell>
                <TableCell className="font-medium">
                  {getDefinitionName(definition)}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {getDefinitionDescription(definition)}
                </TableCell>
                {hasAdditionalFields &&
                  Object.keys(additionalFields).map((key) => (
                    <TableCell key={key}>
                      {additional[key] !== null && additional[key] !== undefined
                        ? String(additional[key])
                        : "-"}
                    </TableCell>
                  ))}
                <TableCell>
                  <Badge
                    variant={
                      definition.status === "approved"
                        ? "default"
                        : definition.status === "pending"
                        ? "default"
                        : definition.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {definition.status === "pending"
                      ? "Chờ duyệt"
                      : definition.status === "approved"
                      ? "Đã duyệt"
                      : definition.status === "rejected"
                      ? "Đã từ chối"
                      : "Đã lưu trữ"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(definition.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {onArchive && definition.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onArchive(definition.id)}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Lưu trữ
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

