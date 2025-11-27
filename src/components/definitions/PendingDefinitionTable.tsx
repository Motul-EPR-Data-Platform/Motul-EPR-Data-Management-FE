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
import { CheckCircle2, XCircle } from "lucide-react";
import { ApproveRejectDialog } from "./ApproveRejectDialog";
import { useState } from "react";

interface PendingDefinitionTableProps {
  definitions: Definition[];
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  isMotulAdmin?: boolean;
}

export function PendingDefinitionTable({
  definitions,
  onApprove,
  onReject,
  isMotulAdmin = false,
}: PendingDefinitionTableProps) {
  const [selectedDefinition, setSelectedDefinition] =
    useState<Definition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject">("approve");

  const handleApprove = (definition: Definition) => {
    setSelectedDefinition(definition);
    setDialogType("approve");
    setDialogOpen(true);
  };

  const handleReject = (definition: Definition) => {
    setSelectedDefinition(definition);
    setDialogType("reject");
    setDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    if (selectedDefinition && onApprove) {
      onApprove(selectedDefinition.id);
    }
    setDialogOpen(false);
    setSelectedDefinition(null);
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedDefinition && onReject) {
      onReject(selectedDefinition.id, reason);
    }
    setDialogOpen(false);
    setSelectedDefinition(null);
  };

  const getDefinitionName = (definition: Definition): string => {
    const data = definition.data as any;
    return data?.name || data?.code || "N/A";
  };

  const getDefinitionCode = (definition: Definition): string => {
    const data = definition.data as any;
    return data?.code || "N/A";
  };

  if (definitions.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-center text-muted-foreground py-12">
          Không có yêu cầu chờ duyệt nào
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Người yêu cầu</TableHead>
              <TableHead>Ngày yêu cầu</TableHead>
              <TableHead>Trạng thái</TableHead>
              {isMotulAdmin && <TableHead>Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {definitions.map((definition) => (
              <TableRow key={definition.id}>
                <TableCell className="font-mono text-sm">
                  {getDefinitionCode(definition)}
                </TableCell>
                <TableCell className="font-medium">
                  {getDefinitionName(definition)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{definition.category}</Badge>
                </TableCell>
                <TableCell>{definition.createdBy}</TableCell>
                <TableCell>
                  {new Date(definition.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      definition.status === "pending"
                        ? "default"
                        : definition.status === "approved"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {definition.status === "pending"
                      ? "Chờ duyệt"
                      : definition.status === "approved"
                        ? "Đã duyệt"
                        : "Đã từ chối"}
                  </Badge>
                </TableCell>
                {isMotulAdmin && definition.status === "pending" && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApprove(definition)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleReject(definition)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedDefinition && (
        <ApproveRejectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          definition={selectedDefinition}
          type={dialogType}
          onApprove={handleApproveConfirm}
          onReject={handleRejectConfirm}
        />
      )}
    </>
  );
}
