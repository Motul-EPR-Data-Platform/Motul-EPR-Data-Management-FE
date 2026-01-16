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
    UPLOAD_TEMP_FILE: "/profile/upload-temp-file",
    COMPLETE_PROFILE: "/complete-profile",
    REPLACE_PROFILE_FILE: (profileId: string) => `/profiles/${profileId}`,
    PROFILE_FILES: (id: string) => `/profile/${id}/files`,
    PROFILE_FILES_PREVIEW: (id: string) => `/profile/${id}/files/preview`,
  },
  WTP: {
    ROOT: "/wtp-admin",
    PROFILE: (id: string) => `/profile/${id}`,
    USERS: "/users",
    COMPLETE_PROFILE: "/complete-profile",
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
    UPLOAD: "/waste-owners/upload",
  },
  COLLECTION_RECORDS: {
    ROOT: "/collection-records",
    DRAFT: "/draft",
    BY_ID: (id: string) => `/${id}`,
    DRAFT_BY_ID: (id: string) => `/${id}/draft`,
    DELETE_DRAFT: (id: string) => `/${id}/draft`,
    SUBMIT: (id: string) => `/${id}/submit`,
    APPROVE: (id: string) => `/${id}/approve`,
    REJECT: (id: string) => `/${id}/reject`,
    REJECTION_DETAILS: (id: string) => `/${id}/rejection-details`,
    ADMIN_UPDATE: (id: string) => `/${id}/admin-update`,
    FILES: (id: string) => `/${id}/files`,
    FILES_PREVIEW: (id: string) => `/${id}/files/preview`,
    UPLOAD: (id: string) => `/${id}/upload`,
    REPLACE_FILE: (id: string, fileId: string) => `/${id}/upload/${fileId}`,
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
  BATCHES: {
    ROOT: "/batches",
    BY_ID: (id: string) => `/${id}`,
    CLOSE: (id: string) => `/${id}/close`,
    REOPEN: (id: string) => `/${id}/reopen`,
    ACTIVE: "/active",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
    COLLECTION_STATS: "/collection-stats",
    INITIAL: "/initial",
    COLLECTION_BY_OWNER: "/collection-by-owner",
    SOURCE_DISTRIBUTION: "/source-distribution",
    WASTE_TYPE_TRENDS: "/waste-type-trends",
  },
  ANALYTICS: {
    ROOT: "/analytics",
    BATCH_ANALYSIS: "/batch-analysis",
    PRICE_FS_ANALYSIS: "/price-fs-analysis",
    PRICE_ZONES: "/price-zones",
  },
  EXPORTS: {
    ROOT: "/export",
    RECORDS: "/records",
    DRAFT: "/records/draft",
    SUBMITTED: "/records/submitted",
    APPROVED: "/records/approved",
    BY_BATCH: (batchId: string) => `/records/batch/${batchId}`,
    BY_WASTE_OWNER: (wasteOwnerId: string) =>
      `/records/waste-owner/${wasteOwnerId}`,
    DATE_RANGE: "/records/date-range",
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
  batches: (p: string) => `${ENDPOINTS.BATCHES.ROOT}${p}`, // Prepend ROOT to batch paths
  dashboard: (p: string) => `${ENDPOINTS.DASHBOARD.ROOT}${p}`, // Prepend ROOT to dashboard paths
  analytics: (p: string) => `${ENDPOINTS.ANALYTICS.ROOT}${p}`, // Prepend ROOT to analytics paths
  exports: (p: string) => `${ENDPOINTS.EXPORTS.ROOT}${p}`, // Prepend ROOT to export paths
};
