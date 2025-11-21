"use client";

import { useState, useEffect } from "react";
import { User, UserRole } from "@/types/user";
import { UserManagementTable } from "@/components/users/UserManagementTable";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { UserManagementSkeleton } from "@/components/skeleton/UserManagementSkeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/contexts/AuthContext";
import { getAvailableRolesForInvitation } from "@/lib/rbac/permissions";
import { InvitationService } from "@/lib/services/invitation.service";
import { mapFrontendRoleToBackend } from "@/lib/rbac/roleMapper";
import { toast } from "sonner";


export default function WTPUsersPage() {
  const { userRole, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // Get available roles for invitation based on current user's role
  // WTP Admin can only invite WTP User (members)
  const availableRoles = getAvailableRolesForInvitation(userRole);

  useEffect(() => {
    // TODO: Implement API call for wtp users
    // WTP Admin should have an endpoint to get users in their organization
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        // Placeholder - will be implemented when backend endpoint is available
        setUsers([]);
        setFilteredUsers([]);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Không thể tải danh sách người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, selectedRole, users]);

  const handleAddUser = async (email: string, role?: UserRole) => {
    // Default role: use first available role if not provided
    // WTP Admin can only invite WTP User
    const invitedRole: UserRole =
      role || (availableRoles.length > 0 ? availableRoles[0] : "WTP User");

    await toast.promise(
      InvitationService.send({
        email,
        role: mapFrontendRoleToBackend(invitedRole),
        metadata: {
          wasteTransferPointId: user?.wasteTransferPointId || null,
        },
      }),
      {
        loading: `Đang gửi lời mời tới ${email}...`,
        success: `Đã gửi lời mời tới ${email}`,
        error: (err) =>
          err?.response?.data?.message ||
          err?.message ||
          "Không thể gửi lời mời. Vui lòng thử lại.",
      }
    );
  };

  const handleEdit = (user: User) => {
    // TODO: Implement edit functionality
  };

  const handleDelete = (user: User) => {
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.name}?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  // Check permission - users page requires users.view permission
  const canViewUsers = usePermission("users.view");
  const canInvite =
    usePermission("users.invite") || usePermission("users.inviteOwnOrg");
  const canEditUser = usePermission("users.edit");
  const canDeleteUser = usePermission("users.delete");

  if (isLoading) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Quản lý người dùng" }]}
        title="Quản lý người dùng"
        subtitle="Manage user accounts and permissions"
      >
        <UserManagementSkeleton />
      </PageLayout>
    );
  }

  if (!canViewUsers) {
    return (
      <PageLayout
        breadcrumbs={[{ label: "Quản lý người dùng" }]}
        title="Quản lý người dùng"
        subtitle="Access Denied"
      >
        <div className="rounded-lg border bg-card p-6">
          <p className="text-center text-muted-foreground py-12">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[{ label: "Quản lý người dùng" }]}
      title="Quản lý người dùng"
      subtitle="Manage user accounts and permissions"
    >
      {/* Filter Section */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Tất cả người dùng</h2>
          <p className="text-sm text-muted-foreground">
            Người dùng trong tổ chức WTP
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="WTP Admin">WTP Admin</SelectItem>
              <SelectItem value="WTP User">WTP User</SelectItem>
            </SelectContent>
          </Select>

          {canInvite && (
            <Button
              onClick={() => setIsAddUserDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Người dùng mới
            </Button>
          )}
        </div>
      </div>

      {/* User Table */}
      <UserManagementTable
        users={filteredUsers}
        onEdit={canEditUser ? handleEdit : undefined}
        onDelete={canDeleteUser ? handleDelete : undefined}
      />

      {/* Add User Dialog */}
      {canInvite && (
        <AddUserDialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
          onAddUser={handleAddUser}
          availableRoles={availableRoles}
        />
      )}
    </PageLayout>
  );
}
