"use client";

import { useState, useEffect } from "react";
import { User, UserRole, PendingInvite } from "@/types/user";
import { UserManagementTable } from "@/components/users/UserManagementTable";
import { PendingInviteTable } from "@/components/users/PendingInviteTable";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/contexts/AuthContext";
import { getAvailableRolesForInvitation } from "@/lib/rbac/permissions";
import { InvitationService } from "@/lib/services/invitation.service";
import { WtpService } from "@/lib/services/wtp.service";
import { mapFrontendRoleToBackend } from "@/lib/rbac/roleMapper";
import {
  transformUsers,
  transformInvitations,
} from "@/lib/utils/userTransformers";
import { toast } from "sonner";

export default function WTPUsersPage() {
  const { userRole, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [filteredInvites, setFilteredInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedInviteRole, setSelectedInviteRole] = useState<string>("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // Get available roles for invitation based on current user's role
  // WTP Admin can only invite WTP User (members)
  const availableRoles = getAvailableRolesForInvitation(userRole);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, invitationsResponse] = await Promise.allSettled([
        WtpService.getUsers(),
        WtpService.getPendingInvitations(),
      ]);

      // Handle users
      if (usersResponse.status === "fulfilled") {
        const transformedUsers = transformUsers(usersResponse.value.data);
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } else {
        toast.error("Không thể tải danh sách người dùng");
      }

      // Handle invitations
      if (invitationsResponse.status === "fulfilled") {
        const transformedInvitations = transformInvitations(
          invitationsResponse.value.data,
        );
        setPendingInvites(transformedInvitations);
        setFilteredInvites(transformedInvitations);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    let filtered = pendingInvites;

    if (inviteSearchQuery) {
      filtered = filtered.filter(
        (invite) =>
          invite.email
            .toLowerCase()
            .includes(inviteSearchQuery.toLowerCase()) ||
          invite.invitedBy
            .toLowerCase()
            .includes(inviteSearchQuery.toLowerCase()),
      );
    }

    if (selectedInviteRole !== "all") {
      filtered = filtered.filter(
        (invite) => invite.role === selectedInviteRole,
      );
    }

    setFilteredInvites(filtered);
  }, [inviteSearchQuery, selectedInviteRole, pendingInvites]);

  const handleAddUser = async (email: string, role?: UserRole) => {
    // Default role: use first available role if not provided
    // WTP Admin can only invite WTP User
    const invitedRole: UserRole =
      role || (availableRoles.length > 0 ? availableRoles[0] : "WTP User");

    const backendRole = mapFrontendRoleToBackend(invitedRole);
    
    // Backend requires wasteTransferPointId at top level for waste_transfer role
    // Backend will override with inviter's wasteTransferPointId, but validation requires the field
    const payload: any = {
      email,
      role: backendRole,
    };
    
    if (backendRole === "waste_transfer") {
      // Send any value to pass validation - backend will use inviter's wasteTransferPointId anyway
      payload.wasteTransferPointId = user?.wasteTransferPointId || user?.id || "";
    }

    await toast.promise(
      InvitationService.send(payload),
      {
        loading: `Đang gửi lời mời tới ${email}...`,
        success: () => {
          loadData(); // Reload data from API
          setActiveTab("pending");
          return `Đã gửi lời mời tới ${email}`;
        },
        error: (err) =>
          err?.response?.data?.message ||
          err?.message ||
          "Không thể gửi lời mời. Vui lòng thử lại.",
      },
    );
  };

  const handleResendInvite = async (invite: PendingInvite) => {
    // TODO: Implement resend invitation API endpoint
    toast.info("Chức năng gửi lại lời mời sẽ được triển khai sớm");
    loadData();
  };

  const handleCancelInvite = async (invite: PendingInvite) => {
    if (confirm(`Bạn có chắc chắn muốn hủy lời mời cho ${invite.email}?`)) {
      // TODO: Implement cancel invitation API endpoint
      toast.info("Chức năng hủy lời mời sẽ được triển khai sớm");
      loadData();
    }
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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="pending">Lời mời đang chờ</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
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

          <UserManagementTable
            users={filteredUsers}
            onEdit={canEditUser ? handleEdit : undefined}
            onDelete={canDeleteUser ? handleDelete : undefined}
          />
        </TabsContent>

        {/* Pending Invites Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Lời mời đang chờ</h2>
              <p className="text-sm text-muted-foreground">
                Các lời mời chưa được chấp nhận
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  className="pl-10"
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={selectedInviteRole}
                onValueChange={setSelectedInviteRole}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tất cả vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="WTP Admin">WTP Admin</SelectItem>
                  <SelectItem value="WTP User">WTP User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <PendingInviteTable
            invites={filteredInvites}
            onResend={handleResendInvite}
            onCancel={handleCancelInvite}
          />
        </TabsContent>
      </Tabs>

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
