"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Pencil, Trash2 } from "lucide-react";

interface UserManagementTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserManagementTable({
  users,
  onEdit,
  onDelete,
}: UserManagementTableProps) {
  const getRoleVariant = (role: string) => {
    switch (role) {
      case "Motul Admin":
        return "motul-admin";
      case "Motul User":
        return "motul-user";
      case "Recycler Admin":
        return "recycler-admin";
      case "Recycler User":
        return "recycler-user";
      case "WTP Admin":
        return "wtp-admin";
      case "WTP User":
        return "wtp-user";
      default:
        return "default";
    }
  };

  const getStatusVariant = (status: string) => {
    if (status === "Active") return "success";
    return "outline";
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Đơn vị</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.unit || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      getRoleVariant(user.role) as
                        | "motul-admin"
                        | "motul-user"
                        | "recycler-admin"
                        | "recycler-user"
                        | "wtp-admin"
                        | "wtp-user"
                        | "default"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(user.status) as any}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

