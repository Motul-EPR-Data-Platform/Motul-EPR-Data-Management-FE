"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { CollectionRecordDetail } from "@/types/record";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [approvalComment, setApprovalComment] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (!eprId.trim()) {
      toast.error("Vui lòng nhập EPR ID");
      return;
    }

    setIsLoading(true);
    try {
      await CollectionRecordService.approveRecord(record.id, {
        eprId,
        comment: approvalComment || null,
      });
      toast.success("Bản ghi đã được phê duyệt thành công");
      setShowApproveDialog(false);
      setEprId("");
      setApprovalComment("");
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
              Vui lòng nhập EPR ID để phê duyệt bản ghi này.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="eprId">
                EPR ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eprId"
                value={eprId}
                onChange={(e) => setEprId(e.target.value)}
                placeholder="Nhập EPR ID"
                disabled={isLoading}
              />
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading || !eprId.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Phê duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối bản ghi</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối bản ghi này.
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
                placeholder="Nhập lý do từ chối..."
                disabled={isLoading}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
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

