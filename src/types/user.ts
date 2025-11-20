import { Role } from "./auth";

export type UserRole =
  | "Motul Admin"
  | "Motul User"
  | "Recycler Admin"
  | "Recycler User"
  | "WTP Admin"
  | "WTP User";

export type UserStatus = "Active" | "Inactive";

// Legacy types for backward compatibility
export interface User {
  id: string;
  name: string;
  email: string;
  unit: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: UserRole;
  unit: string | null;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "expired" | "accepted";
}

// New types matching backend API
export interface UserManagement {
  readonly id: string;
  fullName: string;
  email: string;
  role: Role;
  belongsTo: string | null; // Name of recycler or waste transfer point
  belongsToId: string | null; // ID of recycler or waste transfer point
  isActive: boolean;
  createdAt: Date | string;
}

export interface InvitationManagement {
  readonly id: string;
  email: string;
  role: Role;
  belongsTo: string | null; // Name of recycler or waste transfer point
  invitedBy: string; // Full name of inviter
  invitedById: string; // ID of inviter
  invitationDate: Date | string;
  expiresAt: Date | string;
  status: "waiting" | "expired" | "accepted";
}

export interface GetUsersFilters {
  role?: Role;
  isActive?: boolean;
  search?: string; // Search by name or email
  page?: number;
  limit?: number;
}

export interface GetInvitationsFilters {
  role?: Role;
  status?: "waiting" | "expired" | "accepted";
  search?: string; // Search by email
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
