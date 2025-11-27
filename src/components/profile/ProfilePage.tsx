"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/lib/services/auth.service";
import { UpdatePasswordDTO } from "@/types/auth";
import { toast } from "sonner";
import { Save, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { mapBackendRoleToFrontend } from "@/lib/rbac/roleMapper";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Password update schema
const passwordUpdateSchema = z.object({
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
  path: ["confirmPassword"],
});

type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;

export function ProfilePage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordUpdateFormData>({
    resolver: zodResolver(passwordUpdateSchema),
  });

  const onSubmitPassword = async (data: PasswordUpdateFormData) => {
    setIsSaving(true);
    try {
      const dto: UpdatePasswordDTO = {
        newPassword: data.newPassword,
      };
      
      await toast.promise(
        AuthService.updatePassword(dto),
        {
          loading: "Đang cập nhật mật khẩu...",
          success: "Cập nhật mật khẩu thành công",
          error: (err) => err?.response?.data?.message || "Không thể cập nhật mật khẩu",
        }
      );
      
      // Reset form
      reset();
      setShowPasswordForm(false);
    } catch (error) {
      // Error handled by toast
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-center text-muted-foreground py-12">
          Không tìm thấy thông tin người dùng
        </p>
      </div>
    );
  }

  const userRole = mapBackendRoleToFrontend(user.role);

  return (
    <div className="space-y-6">
      {/* User Information Section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-6">Thông tin tài khoản</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label className="text-muted-foreground">Họ và tên</Label>
            <Input value={user.fullName || ""} disabled className="bg-muted" />
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground">Email</Label>
            <Input value={user.email || ""} disabled className="bg-muted" />
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground">Vai trò</Label>
            <div>
              <Badge variant="default">{userRole}</Badge>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-muted-foreground">Trạng thái</Label>
            <div>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Hoạt động" : "Không hoạt động"}
              </Badge>
            </div>
          </div>

          {user.recyclerId && (
            <div className="grid gap-2">
              <Label className="text-muted-foreground">ID Nhà cung cấp</Label>
              <Input value={user.recyclerId} disabled className="bg-muted font-mono text-sm" />
            </div>
          )}

          {user.wasteTransferPointId && (
            <div className="grid gap-2">
              <Label className="text-muted-foreground">ID Điểm tiếp nhận</Label>
              <Input value={user.wasteTransferPointId} disabled className="bg-muted font-mono text-sm" />
            </div>
          )}
        </div>
      </div>

      {/* Password Update Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Cập nhật mật khẩu của bạn để bảo mật tài khoản
            </p>
          </div>
          {!showPasswordForm && (
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Đổi mật khẩu
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    {...register("newPassword")}
                    className={errors.newPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false);
                  reset();
                }}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Đang lưu..." : "Cập nhật mật khẩu"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
