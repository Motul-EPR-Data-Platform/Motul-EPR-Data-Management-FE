"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BusinessInfoForm } from "@/components/recyclers/BusinessInfoForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { RouteGuard } from "@/components/rbac/RouteGuard";
import { RecyclerService } from "@/lib/services/recycler.service";
import { RecyclerProfile } from "@/types/auth";
import { Pencil, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/skeleton/DashboardSkeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RecyclerBusinessInfoPage() {
  const { userRole, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<RecyclerProfile | null>(null);

  // Check if user can edit organization info
  const canEditOrganizationInfo = usePermission("settings.edit");
  
  // Check if profile is inactive (doesn't exist or user is inactive)
  const isProfileInactive = !profile || !user?.isActive;

  useEffect(() => {
    loadProfile();
  }, [user?.recyclerId]);

  const loadProfile = async () => {
    if (!user?.recyclerId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const profileData = await RecyclerService.getProfile(user.recyclerId);
      setProfile(profileData);
    } catch (error: any) {
      // If profile doesn't exist (404), set profile to null
      if (error?.response?.status === 404) {
        setProfile(null);
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Không thể tải thông tin doanh nghiệp",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload profile to reset form
    loadProfile();
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
    // Reload profile after successful save
    loadProfile();
  };

  // Convert RecyclerProfile to form data format
  const convertProfileToFormData = (profile: RecyclerProfile) => {
    // Helper to parse date string to Date object
    const parseDate = (
      dateStr: string | Date | undefined,
    ): Date | undefined => {
      if (!dateStr) return undefined;
      if (dateStr instanceof Date) return dateStr;
      if (typeof dateStr !== "string") return undefined;

      // Handle ISO format
      if (dateStr.includes("T") || dateStr.includes("-")) {
        return new Date(dateStr);
      }

      // Handle dd/mm/yyyy format
      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        if (day && month && year) {
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }

      return undefined;
    };

    // Combine location fields into single address string (if location exists)
    const locationParts = [
      profile.location?.code,
      profile.location?.address,
      profile.location?.city,
    ].filter(Boolean);
    const companyRegistrationAddress = locationParts.join(", ") || "";

    return {
      vendor_name: profile.vendorName || "",
      tax_code: profile.taxCode || "",
      representative: profile.representative || "",
      company_registration_address: companyRegistrationAddress,
      business_reg_number: profile.businessRegNumber || "",
      business_reg_issue_date: parseDate(profile.businessRegIssueDate),
      phone: profile.phone || "",
      contact_email: profile.contactEmail || "",
      contact_point: profile.contactPoint || "",
      contact_phone: profile.contactPhone || "",
      google_map_link: profile.googleMapLink || "",
      env_permit_number: profile.envPermitNumber || "",
      env_permit_issue_date: parseDate(profile.envPermitIssueDate),
      env_permit_expiry_date: parseDate(profile.envPermitExpiryDate),
    };
  };

  if (isLoading) {
    return (
      <RouteGuard requiredPermission="settings.view">
        <PageLayout
          breadcrumbs={[{ label: "Thông tin doanh nghiệp" }]}
          title="Thông tin doanh nghiệp"
          subtitle="Thông tin pháp lý và liên hệ của đơn vị tái chế"
        >
          <DashboardSkeleton />
        </PageLayout>
      </RouteGuard>
    );
  }

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
                {canEditOrganizationInfo && !isEditing && (
                  <Button onClick={handleEdit} variant="default">
                    <Pencil className="h-4 w-4 mr-2" />
                    {isProfileInactive ? "Tạo Hồ Sơ" : "Chỉnh sửa"}
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

          {/* Info Banner for users without edit permission */}
          {!canEditOrganizationInfo && (
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
                      disabled={!canEditOrganizationInfo}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
              <BusinessInfoForm
                initialData={
                  profile ? convertProfileToFormData(profile) : undefined
                }
                isEditMode={isEditing}
                editable={isEditing && canEditOrganizationInfo}
                onSaveSuccess={handleSaveSuccess}
                profileId={user?.recyclerId}
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
