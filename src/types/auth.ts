// Mirror of backend DTOs (minimal client-side contracts)

export type Role =
  | "motul_admin"
  | "motul_reviewer"
  | "recycler_admin"
  | "recycler"
  | "waste_transfer_admin"
  | "waste_transfer";

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  recyclerId?: string | null;
  wasteTransferPointId?: string | null;
};

export type SessionPayload = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export type AuthResponse = {
  data: {
    user: AppUser;
    session?: SessionPayload;
  };
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type RegisterMotulDTO = {
  email: string;
  password: string;
  fullName: string;
  role: "motul_admin" | "motul_reviewer";
  accessToken: string;
};

export type RegisterWithInviteDTO = {
  email: string;
  password: string;
  fullName: string;
  accessToken: string;
};

export type CompleteRecyclerAdminProfileDTO = {
  vendorName: string;
  location: {
    code: string;
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  representative?: string;
  taxCode?: string;
  phone?: string;
  contactPoint?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessRegNumber?: string;
  businessRegIssueDate?: string; // dd/mm/yyyy format
  googleMapLink?: string;
  envPermitNumber?: string;
  envPermitIssueDate?: string; // dd/mm/yyyy format
  envPermitExpiryDate?: string; // dd/mm/yyyy format
};

export type CompleteWasteTransferAdminProfileDTO = {
  waste_transfer_name: string;
  location?: {
    code?: string;
    address: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  business_code: string;
  phone?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  recycler_id?: string;
  env_permit_number?: string;
  env_permit_issue_date?: string;
  env_permit_expiry_date?: string;
};

export type ForgotPasswordDTO = {
  email: string;
  captchaToken?: string;
};

export type ResetPasswordDTO = {
  token: string;
  newPassword: string;
};

export type UpdatePasswordDTO = {
  newPassword: string;
};

export type SendInvitationDTO = {
  email: string;
  role: Role; // the invited role
  metadata?: Record<string, unknown>; // e.g., recyclerId, wasteTransferPointId
};

// Recycler Profile Types
export type RecyclerProfile = {
  id: string;
  vendorName: string;
  googleMapLink?: string;
  representative?: string;
  taxCode?: string;
  phone?: string;
  contactPoint?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessRegNumber?: string;
  businessRegIssueDate?: Date | string;
  envPermitNumber?: string;
  envPermitIssueDate?: Date | string;
  envPermitExpiryDate?: Date | string;
  location?: {
    code?: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
};

export type UpdateRecyclerProfileDTO = {
  vendorName?: string;
  googleMapLink?: string;
  representative?: string;
  taxCode?: string;
  phone?: string;
  contactPoint?: string;
  contactPhone?: string;
  contactEmail?: string;
  businessRegNumber?: string;
  businessRegIssueDate?: Date | string;
  envPermitNumber?: string;
  envPermitIssueDate?: Date | string;
  envPermitExpiryDate?: Date | string;
};

// WTP Profile Types
export type WtpProfile = {
  id: string;
  wasteTransferName: string;
  phone?: string;
  businessCode?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  envPermitNumber?: string;
  envPermitIssueDate?: Date | string;
  envPermitExpiryDate?: Date | string;
};

export type UpdateWtpProfileDTO = {
  wasteTransferName?: string;
  phone?: string;
  businessCode?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  envPermitNumber?: string;
  envPermitIssueDate?: Date | string;
  envPermitExpiryDate?: Date | string;
};
