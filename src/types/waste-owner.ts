export type WasteOwnerType = "individual" | "business" | "organization";

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
  recyclerId: string;
  name: string;
  businessCode: string;
  contactPerson: string;
  phone: string;
  email: string;
  wasteOwnerType: WasteOwnerType;
  isActive: boolean;
  locationId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WasteOwnerWithLocation extends WasteOwner {
  location: Location;
}

export interface CreateWasteOwnerDTO {
  name: string;
  businessCode: string;
  contactPerson: string;
  phone: string;
  email: string;
  wasteOwnerType: WasteOwnerType;
  location: {
    refId: string;
  };
}

export interface UpdateWasteOwnerDTO {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  wasteOwnerType?: WasteOwnerType;
  location?: {
    refId: string;
  };
}

export interface GetWasteOwnersFilters {
  isActive?: boolean;
  wasteOwnerType?: WasteOwnerType;
}

export interface WasteOwnerResponse {
  success: boolean;
  message?: string;
  data: WasteOwner | WasteOwnerWithLocation;
}

export interface WasteOwnersListResponse {
  success: boolean;
  count: number;
  data: WasteOwnerWithLocation[];
}

