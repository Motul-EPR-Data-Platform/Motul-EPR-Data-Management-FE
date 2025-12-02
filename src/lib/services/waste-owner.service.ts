import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  WasteOwnerWithLocation,
  CreateWasteOwnerDTO,
  UpdateWasteOwnerDTO,
  GetWasteOwnersFilters,
  WasteOwnerResponse,
  WasteOwnersListResponse,
} from "@/types/waste-owner";

export const WasteOwnerService = {
  /**
   * Create new waste owner with location
   * POST /api/waste-owners
   */
  async createWasteOwner(
    dto: CreateWasteOwnerDTO,
  ): Promise<WasteOwnerWithLocation> {
    const { data } = await api.post(
      path.wasteOwners(ENDPOINTS.WASTE_OWNERS.ROOT),
      dto,
    );
    return data.data || data;
  },

  /**
   * Get all waste owners (with optional filters)
   * GET /api/waste-owners
   */
  async getAllWasteOwners(
    filters?: GetWasteOwnersFilters,
  ): Promise<WasteOwnersListResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.isActive !== undefined) {
      queryParams.append("isActive", String(filters.isActive));
    }
    if (filters?.wasteOwnerType) {
      queryParams.append("wasteOwnerType", filters.wasteOwnerType);
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.WASTE_OWNERS.ROOT}?${queryString}`
      : ENDPOINTS.WASTE_OWNERS.ROOT;

    const { data } = await api.get(path.wasteOwners(url));
    return data;
  },

  /**
   * Get specific waste owner by ID
   * GET /api/waste-owners/:id
   */
  async getWasteOwnerById(id: string): Promise<WasteOwnerWithLocation> {
    const { data } = await api.get(
      path.wasteOwners(ENDPOINTS.WASTE_OWNERS.BY_ID(id)),
    );
    return data.data || data;
  },

  /**
   * Update waste owner
   * PATCH /api/waste-owners/:id
   */
  async updateWasteOwner(
    id: string,
    dto: UpdateWasteOwnerDTO,
  ): Promise<WasteOwnerWithLocation> {
    const { data } = await api.patch(
      path.wasteOwners(ENDPOINTS.WASTE_OWNERS.BY_ID(id)),
      dto,
    );
    return data.data || data;
  },

  /**
   * Delete waste owner (soft delete)
   * DELETE /api/waste-owners/:id
   */
  async deleteWasteOwner(id: string): Promise<void> {
    await api.delete(path.wasteOwners(ENDPOINTS.WASTE_OWNERS.BY_ID(id)));
  },
};

