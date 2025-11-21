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
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileCompletionDialog({
  open,
  onOpenChange,
}: ProfileCompletionDialogProps) {
  const router = useRouter();
  const { organization } = useAuth();

  const handleCompleteProfile = () => {
    onOpenChange(false);
    if (organization === "recycler") {
      router.push("/recycler/business-info");
    } else if (organization === "wtp") {
      router.push("/wtp/account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <DialogTitle className="text-xl">
              Hoàn thiện hồ sơ tổ chức
            </DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base">
            Bạn cần hoàn thiện thông tin hồ sơ tổ chức trước khi có thể truy cập
            các tính năng khác của hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Vui lòng điền đầy đủ thông tin doanh nghiệp/tổ chức của bạn để tiếp
            tục sử dụng hệ thống. Sau khi hoàn tất, tài khoản của bạn sẽ được
            kích hoạt.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mr-2"
          >
            Để sau
          </Button>
          <Button onClick={handleCompleteProfile} className="min-w-[140px]">
            Hoàn thiện hồ sơ ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

