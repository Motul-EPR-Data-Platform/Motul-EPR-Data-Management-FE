import { IPaginationParams, IPaginatedResponse } from "./pagination";

// Frontend uses lowercase, backend uses enum values
// Map: "business" -> "company", "organization" -> "organizational", "individual" -> "individual"
export type WasteOwnerType = "individual" | "business" | "organization";

// Backend enum values
export type BackendWasteOwnerType = "individual" | "company" | "organizational";

// Helper to convert frontend type to backend type
export function toBackendWasteOwnerType(
  type: WasteOwnerType,
): BackendWasteOwnerType {
  const mapping: Record<WasteOwnerType, BackendWasteOwnerType> = {
    business: "company",
    organization: "organizational",
    individual: "individual",
  };
  return mapping[type];
}

// Helper to convert backend type to frontend type
export function fromBackendWasteOwnerType(
  type: BackendWasteOwnerType | string,
): WasteOwnerType {
  const mapping: Record<string, WasteOwnerType> = {
    company: "business",
    organizational: "organization",
    individual: "individual",
  };
  return mapping[type] || "business";
}

export interface Location {
  id?: string;
  refId: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
}

export interface WasteOwner {
  readonly id: string;
  recyclerId?: string | null;
  name: string;
  businessCode: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  wasteOwnerType: WasteOwnerType;
  isActive: boolean;
  locationId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface WasteOwnerWithLocation extends WasteOwner {
  location: Location;
}

export interface CreateWasteOwnerDTO {
  name: string;
  businessCode: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  wasteOwnerType: WasteOwnerType;
  // TODO: Make location required again after backend implementation is complete
  location?: {
    refId: string;
  };
  files?: {
    wasteOwnerContractIds: string[];
  };
}

export interface UpdateWasteOwnerDTO {
  name?: string;
  businessCode?: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
  wasteOwnerType?: WasteOwnerType;
  location?: {
    refId: string;
  };
  files?: {
    wasteOwnerContractIds: string[];
  };
}

export interface GetWasteOwnersFilters {
  isActive?: boolean;
  wasteOwnerType?: WasteOwnerType;
  recyclerId?: string;
  businessCode?: string;
  phone?: string;
  name?: string;
}

export interface WasteOwnerResponse {
  success: boolean;
  message?: string;
  data: WasteOwner | WasteOwnerWithLocation;
}

export interface WasteOwnersListResponse {
  success: boolean;
  data: WasteOwnerWithLocation[];
  pagination: IPaginationParams & { total: number };
}

export interface WasteOwnersPaginatedResponse extends IPaginatedResponse<WasteOwnerWithLocation> {
  success?: boolean;
}
