"use client";

import { CollectionRecordDetail } from "@/types/record";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Download, CheckCircle2, XCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { useState } from "react";
import { toast } from "sonner";

interface ApprovalDecisionSectionProps {
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

export function ApprovalDecisionSection({
  record,
}: ApprovalDecisionSectionProps) {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Get the latest approval decision (approved or rejected)
  // Backend returns "approval" (singular) as an array, but we also support "approvals" (plural)
  const approvalData = (record as any).approval || record.approvals || [];
  const approvals = Array.isArray(approvalData) ? approvalData : [];

  const latestApproval =
    approvals.length > 0 ? approvals[approvals.length - 1] : null;

  // Check status (handle both normalized and non-normalized)
  const normalizedStatus = record.status?.toLowerCase();
  const isApproved =
    latestApproval?.decision === "APPROVED" || normalizedStatus === "approved";
  const isRejected =
    latestApproval?.decision === "REJECTED" || normalizedStatus === "rejected";

  // Get approval document from files
  const approvalDoc = record.files?.approvalDoc;

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    setDownloadingFile(fileId);
    try {
      const downloadUrl =
        await CollectionRecordService.getFileDownloadUrl(fileId);
      // Open in new tab
      window.open(downloadUrl, "_blank");
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error("Không thể tải xuống tài liệu");
    } finally {
      setDownloadingFile(null);
    }
  };

  // If no approval data but record is approved/rejected, show a message
  if (!latestApproval) {
    // Check if record status indicates it was approved/rejected but no approval data
    // Handle both normalized and non-normalized statuses
    const status = record.status?.toLowerCase();
    if (
      status === "approved" ||
      status === "rejected" ||
      record.status === "APPROVED" ||
      record.status === "REJECTED"
    ) {
      const isApprovedStatus =
        status === "approved" || record.status === "APPROVED";
      return (
        <Card
          className={
            isApprovedStatus
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 ${isApprovedStatus ? "text-green-900" : "text-red-900"}`}
            >
              {isApprovedStatus ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {isApprovedStatus ? "Quyết định Phê duyệt" : "Quyết định Từ chối"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isApprovedStatus
                ? "Bản ghi đã được phê duyệt. Thông tin chi tiết sẽ được hiển thị khi có dữ liệu."
                : "Bản ghi đã bị từ chối. Thông tin chi tiết sẽ được hiển thị khi có dữ liệu."}
            </p>
            {((record as any).eprEntity || record.eprId) && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-1">EPR Entity</p>
                <p className="font-medium">
                  {(record as any).eprEntity?.name ||
                    (record as any).eprEntity?.code ||
                    record.eprId ||
                    "-"}
                </p>
              </div>
            )}
            {record.acceptanceDate && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-1">
                  Ngày chấp thuận
                </p>
                <p className="font-medium">
                  {formatDate(record.acceptanceDate)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  if (isApproved) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-5 w-5" />
            Quyết định Phê duyệt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Người phê duyệt
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {latestApproval.approver.fullName}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Ngày phê duyệt
              </p>
              <p className="font-medium">
                {formatDateTime(latestApproval.decidedAt)}
              </p>
            </div>
            {((record as any).eprEntity || record.eprId) && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">EPR Entity</p>
                <p className="font-medium">
                  {(record as any).eprEntity?.name ||
                    (record as any).eprEntity?.code ||
                    record.eprId ||
                    "-"}
                </p>
              </div>
            )}
            {record.acceptanceDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Ngày chấp thuận
                </p>
                <p className="font-medium">
                  {formatDate(record.acceptanceDate)}
                </p>
              </div>
            )}
            {latestApproval.hazWasteDocNumber && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Số giấy tờ chất thải nguy hại
                </p>
                <p className="font-medium">
                  {latestApproval.hazWasteDocNumber}
                </p>
              </div>
            )}
          </div>
          {latestApproval.comment && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
              <p className="font-medium text-sm">{latestApproval.comment}</p>
            </div>
          )}
          {approvalDoc && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Tài liệu chấp thuận
              </p>
              <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">
                      {approvalDoc.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(approvalDoc.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleDownloadFile(approvalDoc.id, approvalDoc.fileName)
                  }
                  disabled={downloadingFile === approvalDoc.id}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingFile === approvalDoc.id
                    ? "Đang tải..."
                    : "Tải xuống"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isRejected) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <XCircle className="h-5 w-5" />
            Quyết định Từ chối
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Người từ chối
              </p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {latestApproval.approver.fullName}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ngày từ chối</p>
              <p className="font-medium">
                {formatDateTime(latestApproval.decidedAt)}
              </p>
            </div>
          </div>
          {latestApproval.comment && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Lý do từ chối
              </p>
              <p className="font-medium text-sm text-red-800 bg-red-100 p-3 rounded-md">
                {latestApproval.comment}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
