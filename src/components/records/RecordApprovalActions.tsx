"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { CollectionRecordDetail } from "@/types/record";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { FileType } from "@/types/file-record";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DefinitionService } from "@/lib/services/definition.service";
import { transformDefinitions } from "@/lib/utils/definitionUtils/definitionTransformers";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface RecordApprovalActionsProps {
  record: CollectionRecordDetail;
  onApprovalChange?: () => void;
}

export function RecordApprovalActions({
  record,
  onApprovalChange,
}: RecordApprovalActionsProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [eprId, setEprId] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState<Date | undefined>(new Date());
  const [approvalComment, setApprovalComment] = useState("");
  const [approvalDocument, setApprovalDocument] = useState<File | null>(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eprEntities, setEprEntities] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
  const [loadingEprEntities, setLoadingEprEntities] = useState(false);

  // Load EPR entities on mount
  useEffect(() => {
    loadEprEntities();
  }, []);

  const loadEprEntities = async () => {
    setLoadingEprEntities(true);
    try {
      const response = await DefinitionService.getActiveEprEntities();
      const transformed = transformDefinitions(response);
      const entities = transformed.map((def) => {
        const eprData = def.data as any;
        return {
          id: def.id,
          name: eprData?.name || eprData?.code || "Unknown",
          code: eprData?.code || "",
        };
      });
      setEprEntities(entities);
    } catch (error: any) {
      console.error("Error loading EPR entities:", error);
      toast.error("Không thể tải danh sách EPR entities");
    } finally {
      setLoadingEprEntities(false);
    }
  };

  const handleApprove = async () => {
    if (!eprId) {
      toast.error("Vui lòng chọn EPR Entity");
      return;
    }

    if (!acceptanceDate) {
      toast.error("Vui lòng chọn ngày chấp thuận");
      return;
    }

    if (!approvalDocument) {
      toast.error("Vui lòng tải lên tài liệu chấp thuận");
      return;
    }

    setIsLoading(true);
    try {
      // Format date as dd/mm/yyyy
      const formattedDate = format(acceptanceDate, "dd/MM/yyyy");

      // Verify file is present
      if (!approvalDocument) {
        toast.error("Vui lòng tải lên tài liệu chấp thuận");
        setIsLoading(false);
        return;
      }

      console.log("Approving record with file:", {
        recordId: record.id,
        eprId,
        acceptanceDate: formattedDate,
        fileName: approvalDocument.name,
        fileSize: approvalDocument.size,
        fileType: approvalDocument.type,
      });

      // Approve the record with all required fields including file
      await CollectionRecordService.approveRecord(record.id, {
        eprId,
        acceptanceDate: formattedDate,
        comment: approvalComment || null,
        file: approvalDocument,
      });

      toast.success("Bản ghi đã được phê duyệt thành công");
      setShowApproveDialog(false);
      setEprId("");
      setAcceptanceDate(new Date());
      setApprovalComment("");
      setApprovalDocument(null);
      onApprovalChange?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể phê duyệt bản ghi",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseApproveDialog = () => {
    setShowApproveDialog(false);
    setEprId("");
    setAcceptanceDate(new Date());
    setApprovalComment("");
    setApprovalDocument(null);
  };

  const handleReject = async () => {
    if (!rejectionComment.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setIsLoading(true);
    try {
      await CollectionRecordService.rejectRecord(record.id, {
        comment: rejectionComment,
      });
      toast.success("Bản ghi đã bị từ chối");
      setShowRejectDialog(false);
      setRejectionComment("");
      onApprovalChange?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể từ chối bản ghi",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for pending records
  if (record.status !== "pending") {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Xét duyệt bản ghi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => setShowApproveDialog(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Phê duyệt
          </Button>
          <Button
            onClick={() => setShowRejectDialog(true)}
            variant="destructive"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Từ chối
          </Button>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phê duyệt bản ghi</DialogTitle>
            <DialogDescription>
              Vui lòng chọn EPR Entity để phê duyệt bản ghi này.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="eprId">
                EPR Entity <span className="text-red-500">*</span>
              </Label>
              <Select
                value={eprId}
                onValueChange={setEprId}
                disabled={isLoading || loadingEprEntities}
              >
                <SelectTrigger id="eprId" className={!eprId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn EPR Entity..." />
                </SelectTrigger>
                <SelectContent>
                  {eprEntities.length > 0 ? (
                    eprEntities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name} {entity.code && `(${entity.code})`}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                      {loadingEprEntities ? "Đang tải..." : "Không có dữ liệu"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {!eprId && (
                <p className="text-xs text-red-500">Vui lòng chọn EPR Entity</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="acceptanceDate">
                Ngày chấp thuận <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={acceptanceDate}
                onChange={setAcceptanceDate}
                disabled={isLoading}
                placeholder="Chọn ngày chấp thuận"
              />
              {!acceptanceDate && (
                <p className="text-xs text-red-500">Vui lòng chọn ngày chấp thuận</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="approvalComment">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="approvalComment"
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Nhập ghi chú..."
                disabled={isLoading}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="approvalDocument">
                Tài liệu chấp thuận (Giấy chứng nhận) <span className="text-red-500">*</span>
              </Label>
              <FileUpload
                id="approvalDocument"
                value={approvalDocument}
                onChange={setApprovalDocument}
                accept=".pdf,.doc,.docx"
                maxSize={10}
                disabled={isLoading}
                category={FileType.APPROVAL_DOC}
                required
              />
              {!approvalDocument && (
                <p className="text-xs text-red-500">Vui lòng tải lên tài liệu chấp thuận</p>
              )}
              <p className="text-xs text-muted-foreground">
                Chấp nhận file: PDF, DOC, DOCX (tối đa 10MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseApproveDialog}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading || !eprId || !acceptanceDate || !approvalDocument}
              className="bg-green-600 hover:bg-green-700"
            >
              Phê duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối bản ghi</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối bản ghi này. Lý do từ chối là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectionComment">
                Lý do từ chối <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectionComment"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Nhập lý do từ chối chi tiết..."
                disabled={isLoading}
                rows={5}
                required
                className={!rejectionComment.trim() && rejectionComment.length > 0 ? "border-red-500" : ""}
              />
              {!rejectionComment.trim() && (
                <p className="text-xs text-red-500">
                  Lý do từ chối là bắt buộc
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionComment("");
              }}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              disabled={isLoading || !rejectionComment.trim()}
            >
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

