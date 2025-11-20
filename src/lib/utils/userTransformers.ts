import {
  UserManagement,
  InvitationManagement,
  User,
  PendingInvite,
} from "@/types/user";
import { mapBackendRoleToFrontend } from "@/lib/rbac/roleMapper";

/**
 * Transform backend UserManagement to frontend User
 */
export function transformUser(backendUser: UserManagement): User {
  return {
    id: backendUser.id,
    name: backendUser.fullName,
    email: backendUser.email,
    unit: backendUser.belongsTo,
    role: mapBackendRoleToFrontend(backendUser.role),
    status: backendUser.isActive ? "Active" : "Inactive",
    createdAt:
      typeof backendUser.createdAt === "string"
        ? backendUser.createdAt
        : backendUser.createdAt.toISOString().split("T")[0],
  };
}

/**
 * Transform array of backend UserManagement to frontend User[]
 */
export function transformUsers(backendUsers: UserManagement[]): User[] {
  return backendUsers.map(transformUser);
}

/**
 * Transform backend InvitationManagement to frontend PendingInvite
 */
export function transformInvitation(
  backendInvitation: InvitationManagement
): PendingInvite {
  const invitationDate =
    typeof backendInvitation.invitationDate === "string"
      ? backendInvitation.invitationDate
      : backendInvitation.invitationDate.toISOString();

  const expiresAt =
    typeof backendInvitation.expiresAt === "string"
      ? backendInvitation.expiresAt
      : backendInvitation.expiresAt.toISOString();

  // Map status: "waiting" -> "pending", others stay the same
  const status =
    backendInvitation.status === "waiting"
      ? "pending"
      : backendInvitation.status;

  return {
    id: backendInvitation.id,
    email: backendInvitation.email,
    role: mapBackendRoleToFrontend(backendInvitation.role),
    unit: backendInvitation.belongsTo,
    invitedBy: backendInvitation.invitedBy,
    invitedAt: invitationDate,
    expiresAt: expiresAt,
    status: status as "pending" | "expired" | "accepted",
  };
}

/**
 * Transform array of backend InvitationManagement to frontend PendingInvite[]
 */
export function transformInvitations(
  backendInvitations: InvitationManagement[]
): PendingInvite[] {
  return backendInvitations.map(transformInvitation);
}

