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
import { PendingInvite } from "@/types/user";
import { Mail, Clock, X, CheckCircle } from "lucide-react";

interface PendingInviteTableProps {
  invites: PendingInvite[];
  onResend: (invite: PendingInvite) => void;
  onCancel: (invite: PendingInvite) => void;
}

export function PendingInviteTable({
  invites,
  onResend,
  onCancel,
}: PendingInviteTableProps) {
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
    switch (status) {
      case "pending":
        return "info";
      case "expired":
        return "warning";
      case "accepted":
        return "success";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "expired":
        return "Hết hạn";
      case "accepted":
        return "Đã chấp nhận";
      default:
        return status;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Đơn vị</TableHead>
            <TableHead>Mời bởi</TableHead>
            <TableHead>Ngày mời</TableHead>
            <TableHead>Hết hạn</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                Không có lời mời nào
              </TableCell>
            </TableRow>
          ) : (
            invites.map((invite) => {
              const expired = isExpired(invite.expiresAt);
              const actualStatus = expired && invite.status === "pending" ? "expired" : invite.status;
              
              return (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {invite.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getRoleVariant(invite.role) as
                          | "motul-admin"
                          | "motul-user"
                          | "recycler-admin"
                          | "recycler-user"
                          | "wtp-admin"
                          | "wtp-user"
                          | "default"
                      }
                    >
                      {invite.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{invite.unit || "-"}</TableCell>
                  <TableCell>{invite.invitedBy}</TableCell>
                  <TableCell>{new Date(invite.invitedAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {new Date(invite.expiresAt).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(actualStatus) as any}>
                      {getStatusLabel(actualStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {actualStatus === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onResend(invite)}
                          className="h-8 w-8"
                          title="Gửi lại"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      {actualStatus !== "accepted" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onCancel(invite)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Hủy"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {actualStatus === "accepted" && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

