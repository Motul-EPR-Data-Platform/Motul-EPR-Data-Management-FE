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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const loadUsers = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    };

    loadUsers();
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

  const handleAddUser = async (email: string, role?: UserRole) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Default role if not provided
    const userRole: UserRole = role || "Motul User";

    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: email.split("@")[0],
      email,
      unit: null,
      role: userRole,
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers([...users, newUser]);
  };

  // All roles available for Motul Admin
  const allRoles: UserRole[] = [
    "Motul Admin",
    "Motul User",
    "Recycler Admin",
    "Recycler User",
    "WTP Admin",
    "WTP User",
  ];

  const handleEdit = (user: User) => {
    console.log("Edit user:", user);
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

  return (
    <PageLayout
      breadcrumbs={[{ label: "Quản lý người dùng" }]}
      title="Quản lý người dùng"
      subtitle="Manage user accounts and permissions"
    >

      {/* Filter Section */}
      <div className="rounded-lg border bg-white p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Tất cả người dùng</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý người dùng từ tất cả các tổ chức (Motul, Recycler, WTP)
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
              <SelectItem value="Motul Admin">Motul Admin</SelectItem>
              <SelectItem value="Motul User">Motul User</SelectItem>
              <SelectItem value="Recycler Admin">Recycler Admin</SelectItem>
              <SelectItem value="Recycler User">Recycler User</SelectItem>
              <SelectItem value="WTP Admin">WTP Admin</SelectItem>
              <SelectItem value="WTP User">WTP User</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setIsAddUserDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm Người dùng mới
          </Button>
        </div>
      </div>

      {/* User Table */}
      <UserManagementTable
        users={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add User Dialog */}
      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        onAddUser={handleAddUser}
        availableRoles={allRoles}
      />
    </PageLayout>
  );
}

