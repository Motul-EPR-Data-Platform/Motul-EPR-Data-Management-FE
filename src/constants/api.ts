export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

// Canonical endpoint map, mirroring backend routers
export const ENDPOINTS = {
  AUTH: {
    ROOT: "/auth",
    REGISTER: {
      MOTUL: "/register/motul",
      RECYCLER_ADMIN: "/register/recycler-admin",
      RECYCLER: "/register/recycler",
      WASTE_TRANSFER_ADMIN: "/register/waste-transfer-admin",
      WASTE_TRANSFER: "/register/waste-transfer",
    },
    COMPLETE_PROFILE: {
      RECYCLER_ADMIN: "/recycler-admin/complete-profile",
      WASTE_TRANSFER_ADMIN: "/waste-transfer-admin/complete-profile",
    },
    LOGIN: "/login",
    LOGOUT: "/logout",
    ME: "/me",
    REFRESH: "/refresh",
    UPDATE_PASSWORD: "/update-password",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },
  INVITATIONS: {
    ROOT: "/invitations",
    SEND: "/send",
  },
  ADMIN: {
    ROOT: "/admin",
    USERS: "/users",
    INVITATIONS: "/invitations",
  },
  RECYCLER: {
    ROOT: "/recycler-admin",
    PROFILE: (id: string) => `/profile/${id}`,
    USERS: "/users",
    PENDING_INVITATIONS: "/pending-invitations",
  },
  WTP: {
    ROOT: "/wtp-admin",
    PROFILE: (id: string) => `/profile/${id}`,
    USERS: "/users",
    PENDING_INVITATIONS: "/pending-invitations",
  },
  DEFINITIONS: {
    ROOT: "/definitions",

    // === Subcategories ===
    CATEGORIES: "/categories",
    WASTE_TYPES: "/waste-types",
    CONTRACT_TYPES: "/contract-types",
    EPR_ENTITIES: "/epr-entities",
    HAZ_TYPES: "/haz-types",
    CUSTOM: "/custom",
  },
  WASTE_OWNERS: {
    ROOT: "/waste-owners",
    BY_ID: (id: string) => `/waste-owners/${id}`,
  },
  COLLECTION_RECORDS: {
    ROOT: "/collection-records",
    DRAFT: "/draft",
    BY_ID: (id: string) => `/${id}`,
    DRAFT_BY_ID: (id: string) => `/${id}/draft`,
    SUBMIT: (id: string) => `/${id}/submit`,
    APPROVE: (id: string) => `/${id}/approve`,
    REJECT: (id: string) => `/${id}/reject`,
    REJECTION_DETAILS: (id: string) => `/${id}/rejection-details`,
    ADMIN_UPDATE: (id: string) => `/${id}/admin-update`,
    FILES: (id: string) => `/${id}/files`,
    FILES_PREVIEW: (id: string) => `/${id}/files/preview`,
    UPLOAD: (id: string) => `/${id}/upload`,
    UPLOAD_MULTIPLE: (id: string) => `/${id}/upload-multiple`,
    REPLACE_FILE: (id: string, position: number) => `/${id}/upload/${position}`,
  },
  LOCATIONS: {
    ROOT: "/location",
    AUTOCOMPLETE: "/autocomplete",
    BY_REF_ID: (refId: string) => `/${refId}`,
  },
  FILES: {
    ROOT: "/files",
    BY_ID: (id: string) => `/${id}`,
    DOWNLOAD: (id: string) => `/${id}/download`,
  },
} as const;

// Helpers to compose full paths
export const path = {
  auth: (p: string) => `${ENDPOINTS.AUTH.ROOT}${p}`,
  invitations: (p: string) => `${ENDPOINTS.INVITATIONS.ROOT}${p}`,
  admin: (p: string) => `${ENDPOINTS.ADMIN.ROOT}${p}`,
  definitions: (p: string) => `${ENDPOINTS.DEFINITIONS.ROOT}${p}`,
  recycler: (p: string) => `${ENDPOINTS.RECYCLER.ROOT}${p}`,
  wtp: (p: string) => `${ENDPOINTS.WTP.ROOT}${p}`,
  wasteOwners: (p: string) => p, // Waste owners endpoints are already full paths
  collectionRecords: (p: string) => `${ENDPOINTS.COLLECTION_RECORDS.ROOT}${p}`, // Prepend ROOT to collection records paths
  locations: (p: string) => p, // Location endpoints are already full paths
  files: (p: string) => `${ENDPOINTS.FILES.ROOT}${p}`, // Prepend ROOT to file paths
};
