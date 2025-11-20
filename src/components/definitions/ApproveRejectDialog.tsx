"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Definition } from "@/types/definition";
import { useState } from "react";

interface ApproveRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definition: Definition;
  type: "approve" | "reject";
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ApproveRejectDialog({
  open,
  onOpenChange,
  definition,
  type,
  onApprove,
  onReject,
}: ApproveRejectDialogProps) {
  const [rejectReason, setRejectReason] = useState("");

  const getDefinitionName = (definition: Definition): string => {
    const data = definition.data as any;
    return data?.name || data?.code || "N/A";
  };

  const handleSubmit = () => {
    if (type === "approve") {
      onApprove();
    } else {
      if (!rejectReason.trim()) {
        return; // Require reason for rejection
      }
      onReject(rejectReason);
      setRejectReason("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "approve" ? "Duyệt định nghĩa" : "Từ chối định nghĩa"}
          </DialogTitle>
          <DialogDescription>
            {type === "approve"
              ? `Bạn có chắc chắn muốn duyệt định nghĩa "${getDefinitionName(definition)}"?`
              : `Vui lòng nhập lý do từ chối định nghĩa "${getDefinitionName(definition)}"`}
          </DialogDescription>
        </DialogHeader>

        {type === "reject" && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Lý do từ chối *</Label>
              <Input
                id="reason"
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setRejectReason("");
            }}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant={type === "approve" ? "default" : "destructive"}
            onClick={handleSubmit}
            disabled={type === "reject" && !rejectReason.trim()}
          >
            {type === "approve" ? "Duyệt" : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

