"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/user";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (email: string, role?: UserRole) => void;
  availableRoles?: UserRole[]; // If provided, show role selector
  defaultRole?: UserRole; // Default role if no selector
}

export function AddUserDialog({
  open,
  onOpenChange,
  onAddUser,
  availableRoles,
  defaultRole,
}: AddUserDialogProps) {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(
    defaultRole
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (availableRoles && availableRoles.length > 0 && !selectedRole) return;

    setIsLoading(true);
    try {
      await onAddUser(email, selectedRole || defaultRole);
      setEmail("");
      setSelectedRole(defaultRole);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Người dùng mới</DialogTitle>
          <DialogDescription>
            Nhập email của người dùng để thêm vào hệ thống
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {availableRoles && availableRoles.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? "Đang thêm..." : "Thêm người dùng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

