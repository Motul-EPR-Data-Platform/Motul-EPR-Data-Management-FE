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
    DEFINITIONS: {
      ROOT: "/definitions",
  
      // === Subcategories ===
      CATEGORIES: "/categories",
      WASTE_TYPES: "/waste-types",
      CONTRACT_TYPES: "/contract-types",
      EPR_ENTITIES: "/epr-entities",
      CUSTOM: "/custom",
  
      // === Common actions ===
      APPROVE: (id: string) => `/${id}/approve`,
      REJECT: (id: string) => `/${id}/reject`,
      ARCHIVE: (id: string) => `/${id}`,
    },
  } as const;
  
  // Helpers to compose full paths
  export const path = {
    auth: (p: string) => `${ENDPOINTS.AUTH.ROOT}${p}`,
    invitations: (p: string) => `${ENDPOINTS.INVITATIONS.ROOT}${p}`,
    definitions: (p: string) => `${ENDPOINTS.DEFINITIONS.ROOT}${p}`,
  };
  