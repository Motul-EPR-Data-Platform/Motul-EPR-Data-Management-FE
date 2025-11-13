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
import { useUserManagementPermissions, getVisibleTabs } from "@/lib/rbac/userManagementConfig";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/contexts/AuthContext";
import { getAvailableRolesForInvitation } from "@/lib/rbac/permissions";
import { toast } from "sonner"
import { InvitationService } from "@/lib/services/invitation.service";
import { mapFrontendRoleToBackend } from "@/lib/rbac/roleMapper";
// Mock data - replace with API call
// Motul Admin can manage all users from all organizations
const mockUsers: User[] = [
  // Motul Users
  {
    id: "USR-001",
    name: "Motul Admin",
    email: "admin@motul.com",
    unit: null,
    role: "Motul Admin",
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: "USR-002",
    name: "John Doe",
    email: "john@motul.com",
    unit: "Motul Vietnam",
    role: "Motul User",
    status: "Active",
    createdAt: "2024-02-20",
  },
  {
    id: "USR-003",
    name: "Jane Smith",
    email: "jane@motul.com",
    unit: "Motul Vietnam",
    role: "Motul User",
    status: "Active",
    createdAt: "2024-03-10",
  },
  // Recycler Users
  {
    id: "USR-004",
    name: "Recycler Admin",
    email: "admin@recycler.com",
    unit: "CTY",
    role: "Recycler Admin",
    status: "Active",
    createdAt: "2024-03-15",
  },
  {
    id: "USR-005",
    name: "Recycler User",
    email: "user@recycler.com",
    unit: "CTY2",
    role: "Recycler User",
    status: "Active",
    createdAt: "2024-04-01",
  },
  // WTP Users
  {
    id: "USR-006",
    name: "WTP Admin",
    email: "admin@wtp.com",
    unit: "CTY3",
    role: "WTP Admin",
    status: "Active",
    createdAt: "2024-04-05",
  },
  {
    id: "USR-007",
    name: "WTP User",
    email: "user@wtp.com",
    unit: "CTY4",
    role: "WTP User",
    status: "Inactive",
    createdAt: "2024-04-10",
  },
];

// Mock data for pending invites
const mockPendingInvites: PendingInvite[] = [
  {
    id: "INV-001",
    email: "newuser@motul.com",
    role: "Motul User",
    unit: "Motul Vietnam",
    invitedBy: "Motul Admin",
    invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "INV-002",
    email: "recycler@example.com",
    role: "Recycler User",
    unit: "CTY5",
    invitedBy: "Motul Admin",
    invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "INV-003",
    email: "wtpuser@example.com",
    role: "WTP User",
    unit: "CTY6",
    invitedBy: "Motul Admin",
    invitedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "accepted",
  },
];

export default function UsersPage() {
  const { userRole } = useAuth();
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

  // Get permissions
  const permissions = useUserManagementPermissions();
  const canEditUser = usePermission("users.edit");
  const canDeleteUser = usePermission("users.delete");
  
  // Get visible tabs based on permissions
  const visibleTabs = getVisibleTabs(permissions);
  
  // Get available roles for invitation based on current user's role
  // Motul Admin can only invite other admins
  const availableRoles = getAvailableRolesForInvitation(userRole);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setPendingInvites(mockPendingInvites);
      setFilteredInvites(mockPendingInvites);
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, selectedRole, users]);

  useEffect(() => {
    let filtered = pendingInvites;

    // Filter by search query
    if (inviteSearchQuery) {
      filtered = filtered.filter(
        (invite) =>
          invite.email.toLowerCase().includes(inviteSearchQuery.toLowerCase()) ||
          invite.id.toLowerCase().includes(inviteSearchQuery.toLowerCase()) ||
          invite.invitedBy.toLowerCase().includes(inviteSearchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (selectedInviteRole !== "all") {
      filtered = filtered.filter((invite) => invite.role === selectedInviteRole);
    }

    setFilteredInvites(filtered);
  }, [inviteSearchQuery, selectedInviteRole, pendingInvites]);

  const handleAddUser = async (email: string, role?: UserRole) => {
    const userRole: UserRole =
      role || (availableRoles.length > 0 ? availableRoles[0] : "Motul Admin");

  
    await toast.promise(
      InvitationService.send({ email, role: mapFrontendRoleToBackend(userRole) }),
      {
        loading: `Đang gửi lời mời tới ${email}...`,
        success: () => {
          // optimistic UI update
          setPendingInvites((prev) => [
            ...prev,
            {
              id: `INV-${String(prev.length + 1).padStart(3, "0")}`,
              email,
              role: userRole,
              unit: null,
              invitedBy: "Motul Admin",
              invitedAt: new Date().toISOString(),
              expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              status: "pending",
            },
          ]);
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update the invite with new expiration date
    const updatedInvites = pendingInvites.map((inv) =>
      inv.id === invite.id
        ? {
            ...inv,
            invitedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending" as const,
          }
        : inv
    );

    setPendingInvites(updatedInvites);
  };

  const handleCancelInvite = async (invite: PendingInvite) => {
    if (confirm(`Bạn có chắc chắn muốn hủy lời mời cho ${invite.email}?`)) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPendingInvites(pendingInvites.filter((inv) => inv.id !== invite.id));
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

  // Check permission - users page requires users.view permission
  const canViewUsers = usePermission("users.view");
  
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
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Quản lý người dùng</h2>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "users"
                    ? "Quản lý người dùng từ tất cả các tổ chức (Motul, Recycler, WTP)"
                    : "Quản lý lời mời đang chờ xử lý"}
                </p>
              </div>
              {permissions.canInvite && (
                <Button
                  onClick={() => setIsAddUserDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Người dùng mới
                </Button>
              )}
            </div>

            <TabsList>
              {visibleTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

          {/* Users Tab Content */}
          <TabsContent value="users" className="space-y-4 mt-4">
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
                  <SelectItem value="Motul Admin">Motul Admin</SelectItem>
                  <SelectItem value="Motul User">Motul User</SelectItem>
                  <SelectItem value="Recycler Admin">Recycler Admin</SelectItem>
                  <SelectItem value="Recycler User">Recycler User</SelectItem>
                  <SelectItem value="WTP Admin">WTP Admin</SelectItem>
                  <SelectItem value="WTP User">WTP User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Table */}
            <UserManagementTable
              users={filteredUsers}
              onEdit={canEditUser ? handleEdit : undefined}
              onDelete={canDeleteUser ? handleDelete : undefined}
            />
          </TabsContent>

          {/* Pending Invites Tab Content */}
          {permissions.canViewInvitationsTab && (
            <TabsContent value="pending" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm lời mời..."
                  className="pl-10"
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                />
              </div>

              <Select value={selectedInviteRole} onValueChange={setSelectedInviteRole}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tất cả vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="Motul Admin">Motul Admin</SelectItem>
                  <SelectItem value="Motul User">Motul User</SelectItem>
                  <SelectItem value="Recycler Admin">Recycler Admin</SelectItem>
                  <SelectItem value="Recycler User">Recycler User</SelectItem>
                  <SelectItem value="WTP Admin">WTP Admin</SelectItem>
                  <SelectItem value="WTP User">WTP User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pending Invite Table */}
            <PendingInviteTable
              invites={filteredInvites}
              onResend={handleResendInvite}
              onCancel={handleCancelInvite}
            />
            </TabsContent>
          )}
        </div>
      </Tabs>

      {/* Add User Dialog */}
      {permissions.canInvite && (
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

