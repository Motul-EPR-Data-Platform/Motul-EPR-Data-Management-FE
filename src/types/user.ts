export type UserRole =
  | "Motul Admin"
  | "Motul User"
  | "Recycler Admin"
  | "Recycler User"
  | "WTP Admin"
  | "WTP User";

export type UserStatus = "Active" | "Inactive";

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

