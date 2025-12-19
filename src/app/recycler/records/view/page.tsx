"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CollectionRecordService } from "@/lib/services/collection-record.service";
import { CollectionRecordDetail } from "@/types/record";
import { ICollectionRecordFilesWithPreview } from "@/types/file-record";
import { toast } from "sonner";
import {
  WasteSourceInfoSection,
  CollectionDetailsSection,
  StorageRecyclingSection,
  EvidenceSection,
} from "@/components/records/RecordDetailSections";
import { ApprovalDecisionSection } from "@/components/records/ApprovalDecisionSection";
import { RecordOverviewCard } from "@/components/records/RecordOverviewCard";
import { RecordApprovalActions } from "@/components/records/RecordApprovalActions";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const getStatusBadgeVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "destructive";
    case "draft":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "approved":
      return "Đã được phê duyệt";
    case "pending":
      return "Chờ duyệt";
    case "rejected":
      return "Bị từ chối";
    case "draft":
      return "Bản nháp";
    default:
      return status;
  }
};

export default function RecordDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userRole } = useAuth();
  const recordId = searchParams.get("id");
  const [record, setRecord] = useState<CollectionRecordDetail | null>(null);
  const [filesWithPreview, setFilesWithPreview] = useState<ICollectionRecordFilesWithPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = userRole === "Motul Admin" || userRole === "MOTUL_ADMIN";

  useEffect(() => {
    if (recordId) {
      loadRecord();
    } else {
      toast.error("Không tìm thấy ID bản ghi");
      router.push("/recycler/my-records");
    }
  }, [recordId]);

  const loadRecord = async () => {
    if (!recordId) return;
    
    setIsLoading(true);
    try {
      const [recordData, filesData] = await Promise.all([
        CollectionRecordService.getRecordById(recordId),
        CollectionRecordService.getRecordFilesWithPreview(recordId, 3600).catch((err) => {
          console.warn("Failed to load files with preview:", err);
          return null;
        }),
      ]);
      setRecord(recordData);
      setFilesWithPreview(filesData);
    } catch (error: any) {
      console.error("Error loading record:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải thông tin bản ghi",
      );
      router.push("/recycler/my-records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalChange = () => {
    // Reload record after approval/rejection
    loadRecord();
  };

  if (isLoading) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Bản ghi của tôi" }, { label: "Chi tiết bản ghi" }]}
        title="Chi tiết bản ghi"
        subtitle="Đang tải..."
      >
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground py-12">Đang tải...</p>
        </div>
      </PageLayout>
    );
  }

  if (!record) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Bản ghi của tôi" }, { label: "Chi tiết bản ghi" }]}
        title="Chi tiết bản ghi"
        subtitle="Không tìm thấy bản ghi"
      >
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground py-12">
            Không tìm thấy bản ghi
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => router.push("/recycler/my-records")}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Bản ghi của tôi", href: "/recycler/my-records" },
        { label: "Chi tiết bản ghi" },
      ]}
      title={`Xem xét Bản ghi: ${record.id}`}
      subtitle={`Được nộp bởi ${record.wasteOwner?.name || (record.wasteOwners && record.wasteOwners.length > 0 ? record.wasteOwners[0].name : "N/A")}`}
    >
      <div className="space-y-6">
        {/* Back Button and Status Badge */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/recycler/my-records")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
          <Badge variant={getStatusBadgeVariant(record.status)}>
            {getStatusLabel(record.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Right Side on desktop, appears first on mobile */}
          <div className="lg:order-2 space-y-6">
            <RecordOverviewCard record={record} />
            {/* Approval/Rejection Decision Section */}
            <ApprovalDecisionSection record={record} />
            {/* Only show approval actions for admin users */}
            {isAdmin && (
              <RecordApprovalActions
                record={record}
                onApprovalChange={handleApprovalChange}
              />
            )}
                  </div>

          {/* Main Content - Left Side on desktop, appears second on mobile */}
          <div className="lg:col-span-2 lg:order-1 space-y-6">
            <WasteSourceInfoSection record={record} />
            <CollectionDetailsSection record={record} />
            <StorageRecyclingSection record={record} />
            <EvidenceSection record={record} filesWithPreview={filesWithPreview} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

