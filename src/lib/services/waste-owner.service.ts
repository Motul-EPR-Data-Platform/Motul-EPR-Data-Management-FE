import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  WasteOwnerWithLocation,
  CreateWasteOwnerDTO,
  UpdateWasteOwnerDTO,
  GetWasteOwnersFilters,
  WasteOwnerResponse,
  WasteOwnersPaginatedResponse,
  toBackendWasteOwnerType,
  fromBackendWasteOwnerType,
} from "@/types/waste-owner";
import { IPaginationParams } from "@/types/pagination";

export const WasteOwnerService = {
  /**
   * Create new waste owner with location
   * POST /api/waste-owners
   */
  async createWasteOwner(
    dto: CreateWasteOwnerDTO,
  ): Promise<WasteOwnerWithLocation> {
    // Convert frontend wasteOwnerType to backend enum value
    const backendDto: any = {
      ...dto,
      wasteOwnerType: toBackendWasteOwnerType(dto.wasteOwnerType),
      // Convert empty strings to null for optional fields
      contactPerson: dto.contactPerson || null,
      phone: dto.phone || null,
      email: dto.email || null,
    };

    // Check if location exists and has refId before accessing
    if (dto.location?.refId) {
      backendDto.location = {
        refId: dto.location.refId,
      };
    }

    const { data } = await api.post(
      path.wasteOwners(ENDPOINTS.WASTE_OWNERS.ROOT),
      backendDto,
    );
    // Convert backend response back to frontend format
    const result = data.data || data;
    if (result.wasteOwnerType) {
      result.wasteOwnerType = fromBackendWasteOwnerType(result.wasteOwnerType);
    }
    return result;
  },

  /**
   * Get all waste owners (with optional filters and pagination)
   * GET /api/waste-owners
   */
  async getAllWasteOwners(
    filters?: GetWasteOwnersFilters,
    pagination?: IPaginationParams,
    noCache?: boolean,
  ): Promise<WasteOwnersPaginatedResponse> {
    const queryParams = new URLSearchParams();

    // Add filter params
    if (filters?.isActive !== undefined) {
      queryParams.append("isActive", String(filters.isActive));
    }
    if (filters?.wasteOwnerType) {
      // Convert frontend type to backend type for query
      queryParams.append(
        "wasteOwnerType",
        toBackendWasteOwnerType(filters.wasteOwnerType),
      );
    }
    if (filters?.recyclerId) {
      queryParams.append("recyclerId", filters.recyclerId);
    }
    if (filters?.businessCode) {
      queryParams.append("businessCode", filters.businessCode);
    }
    if (filters?.phone) {
      queryParams.append("phone", filters.phone);
    }
    if (filters?.name) {
      queryParams.append("name", filters.name);
    }

    // Add pagination params
    if (pagination?.page !== undefined) {
      queryParams.append("page", String(pagination.page));
    }
    if (pagination?.limit !== undefined) {
      queryParams.append("limit", String(pagination.limit));
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.WASTE_OWNERS.ROOT}?${queryString}`
      : ENDPOINTS.WASTE_OWNERS.ROOT;

    const { data } = await api.get(path.wasteOwners(url), {
      ...(noCache && { noCache: true } as any),
    });

    // Convert backend types to frontend types
    if (data.data && Array.isArray(data.data)) {
      data.data = data.data.map((item: any) => ({
        ...item,
        wasteOwnerType: fromBackendWasteOwnerType(item.wasteOwnerType),
      }));
    }

    return {
      data: data.data || [],
      pagination: data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      success: data.success,
    };
  },

  /**
   * Get specific waste owner by ID
   * GET /api/waste-owners/:id
   */
  async getWasteOwnerById(id: string): Promise<WasteOwnerWithLocation> {
    const { data } = await api.get(
      path.wasteOwners(ENDPOINTS.WASTE_OWNERS.BY_ID(id)),
    );
    const result = data.data || data;
    // Convert backend type to frontend type
    if (result.wasteOwnerType) {
      result.wasteOwnerType = fromBackendWasteOwnerType(result.wasteOwnerType);
    }
    return result;
  },

  /**
   * Update waste owner
   * PATCH /api/waste-owners/:id
   */
  async updateWasteOwner(
    id: string,
    dto: UpdateWasteOwnerDTO,
  ): Promise<WasteOwnerWithLocation> {
    // Convert frontend wasteOwnerType to backend enum value if provided
    const backendDto: any = { ...dto };
    if (dto.wasteOwnerType) {
      backendDto.wasteOwnerType = toBackendWasteOwnerType(dto.wasteOwnerType);
    }
    if (dto.businessCode) {
      backendDto.businessCode = dto.businessCode;
    }
    // Convert empty strings to null for optional fields
    if (dto.contactPerson !== undefined) {
      backendDto.contactPerson = dto.contactPerson || null;
    }
    if (dto.phone !== undefined) {
      backendDto.phone = dto.phone || null;
    }
    if (dto.email !== undefined) {
      backendDto.email = dto.email || null;
    }
    const { data } = await api.patch(
      path.wasteOwners(ENDPOINTS.WASTE_OWNERS.BY_ID(id)),
      backendDto,
    );
    const result = data.data || data;
    // Convert backend type to frontend type
    if (result.wasteOwnerType) {
      result.wasteOwnerType = fromBackendWasteOwnerType(result.wasteOwnerType);
    }
    return result;
  },

  /**
   * Delete waste owner (soft delete)
   * DELETE /api/waste-owners/:id
   */
  async deleteWasteOwner(id: string): Promise<void> {
    await api.delete(path.wasteOwners(ENDPOINTS.WASTE_OWNERS.BY_ID(id)));
  },
};
