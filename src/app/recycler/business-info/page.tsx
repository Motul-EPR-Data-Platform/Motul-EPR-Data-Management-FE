"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BusinessInfoForm } from "@/components/recyclers/BusinessInfoForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/rbac/RouteGuard";
import { Pencil, FileText, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RecyclerBusinessInfoPage() {
  const { userRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Only Recycler Admin can edit
  const isAdmin = userRole === "Recycler Admin";

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <RouteGuard requiredPermission="settings.view">
      <PageLayout
        breadcrumbs={[{ label: "Thông tin doanh nghiệp" }]}
        title="Thông tin doanh nghiệp"
        subtitle="Thông tin pháp lý và liên hệ của đơn vị tái chế"
      >
        <div className="space-y-6">
          {/* Header with Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <CardTitle>Thông tin Đơn vị tái chế</CardTitle>
                </div>
                {isAdmin && !isEditing && (
                  <Button onClick={handleEdit} variant="default">
                    <Pencil className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>
              <CardDescription className="mt-2">
                Thông tin ban đầu để thu thập, hoàn thiện hồ sơ và xác nhận.
                Thông tin này là bắt buộc để Motul thực hiện trách nhiệm và tuân
                thủ các quy định pháp luật về EPR.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Info Banner for Non-Admins */}
          {!isAdmin && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Chế độ xem chỉ đọc
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Chỉ quản trị viên có quyền chỉnh sửa thông tin doanh
                      nghiệp.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Card className="rounded-lg border bg-card">
            <CardContent className="pt-6">
              {isEditing && (
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Chỉnh sửa thông tin
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={!isAdmin}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
              <BusinessInfoForm
                initialData={undefined}
                isEditMode={isEditing}
                editable={isEditing && isAdmin}
              />
            </CardContent>
          </Card>

          {/* Footer Notice */}
          {!isEditing && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý quan trọng:</strong> Bằng cách nhấp vào nút chấp
                  nhận, bạn xác nhận rằng tất cả thông tin được cung cấp là
                  chính xác và đầy đủ. Thông tin không chính xác có thể dẫn đến
                  việc hủy tài khoản của bạn.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
    </RouteGuard>
  );
}
