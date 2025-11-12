import { Permission } from "./permissions";
import { usePermission, useRole } from "@/hooks/usePermission";

export type TabConfig = {
  key: string;
  label: string;
  visible: (permissions: Record<string, boolean>) => boolean;
  permissions?: Permission[];
};

export type ActionConfig = {
  key: string;
  label: string;
  visible: (permissions: Record<string, boolean>) => boolean;
  enabled: (permissions: Record<string, boolean>) => boolean;
  handler: (context: any) => void | Promise<void>;
  permissions?: Permission[];
};

/**
 * User Management Tabs Configuration
 * Defines which tabs are visible based on user permissions
 */
export const userManagementTabs: TabConfig[] = [
  {
    key: "users",
    label: "Người dùng",
    visible: (perms) => perms.canViewUsers || false,
    permissions: ["users.view"],
  },
  {
    key: "pending",
    label: "Lời mời đang chờ",
    visible: (perms) => perms.canViewInvitationsTab || false,
    permissions: ["users.viewInvitations"],
  },
];

/**
 * User Management Actions Configuration
 * Defines which actions are available based on user permissions
 */
export const userManagementActions: ActionConfig[] = [
  {
    key: "addUser",
    label: "Thêm Người dùng mới",
    visible: (perms) => perms.canInvite || false,
    enabled: (perms) => perms.canInvite || false,
    handler: async (context) => {
      context.setIsAddUserDialogOpen(true);
    },
    permissions: ["users.invite", "users.inviteAll", "users.inviteOwnOrg"],
  },
  {
    key: "editUser",
    label: "Chỉnh sửa",
    visible: (perms) => perms.canEditUser || false,
    enabled: (perms) => perms.canEditUser || false,
    handler: async (context) => {
      // Edit handler
    },
    permissions: ["users.edit"],
  },
  {
    key: "deleteUser",
    label: "Xóa",
    visible: (perms) => perms.canDeleteUser || false,
    enabled: (perms) => perms.canDeleteUser || false,
    handler: async (context) => {
      // Delete handler
    },
    permissions: ["users.delete"],
  },
  {
    key: "resendInvite",
    label: "Gửi lại",
    visible: (perms) => perms.canViewInvitations || false,
    enabled: (perms) => perms.canViewInvitations || false,
    handler: async (context) => {
      // Resend handler
    },
    permissions: ["users.viewInvitations"],
  },
  {
    key: "cancelInvite",
    label: "Hủy",
    visible: (perms) => perms.canViewInvitations || false,
    enabled: (perms) => perms.canViewInvitations || false,
    handler: async (context) => {
      // Cancel handler
    },
    permissions: ["users.viewInvitations"],
  },
];

/**
 * Hook to get user management permissions
 */
export function useUserManagementPermissions() {
  const { permissions } = useRole();
  
  const canViewUsers = usePermission("users.view");
  const canInviteAll = usePermission("users.inviteAll");
  const canInviteOwnOrg = usePermission("users.inviteOwnOrg");
  const canInvite = canInviteAll || canInviteOwnOrg || usePermission("users.invite");
  const canEditUser = usePermission("users.edit");
  const canDeleteUser = usePermission("users.delete");
  const canViewInvitations = usePermission("users.viewInvitations");
  const canViewInvitationsTab = canViewInvitations;

  return {
    canViewUsers,
    canInviteAll,
    canInviteOwnOrg,
    canInvite,
    canEditUser,
    canDeleteUser,
    canViewInvitations,
    canViewInvitationsTab,
    permissions,
  };
}

/**
 * Get visible tabs based on permissions
 */
export function getVisibleTabs(permissions: Record<string, boolean>): TabConfig[] {
  return userManagementTabs.filter((tab) => tab.visible(permissions));
}

/**
 * Get visible actions based on permissions
 */
export function getVisibleActions(permissions: Record<string, boolean>): ActionConfig[] {
  return userManagementActions.filter((action) => action.visible(permissions));
}

