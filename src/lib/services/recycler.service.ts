import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import { RecyclerProfile, UpdateRecyclerProfileDTO } from "@/types/auth";
import {
  PaginatedResponse,
  UserManagement,
  InvitationManagement,
  GetUsersFilters,
  GetInvitationsFilters,
} from "@/types/user";

export const RecyclerService = {
  /**
   * Get recycler profile by ID
   * GET /recycler/profile/:id
   */
  async getProfile(id: string): Promise<RecyclerProfile> {
    const { data } = await api.get(
      path.recycler(ENDPOINTS.RECYCLER.PROFILE(id)),
    );
    return data.data || data;
  },

  /**
   * Update recycler profile
   * PUT /recycler/profile/:id
   */
  async updateProfile(
    id: string,
    dto: UpdateRecyclerProfileDTO,
  ): Promise<RecyclerProfile> {
    const { data } = await api.put(
      path.recycler(ENDPOINTS.RECYCLER.PROFILE(id)),
      dto,
    );
    return data.data || data;
  },

  /**
   * Get all users for recycler admin
   * GET /recycler/users
   */
  async getUsers(
    filters?: GetUsersFilters,
  ): Promise<PaginatedResponse<UserManagement>> {
    const queryParams = new URLSearchParams();

    if (filters?.role) {
      queryParams.append("role", filters.role);
    }
    if (filters?.isActive !== undefined) {
      queryParams.append("isActive", String(filters.isActive));
    }
    if (filters?.search) {
      queryParams.append("search", filters.search);
    }
    if (filters?.page) {
      queryParams.append("page", String(filters.page));
    }
    if (filters?.limit) {
      queryParams.append("limit", String(filters.limit));
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.RECYCLER.USERS}?${queryString}`
      : ENDPOINTS.RECYCLER.USERS;

    const { data } = await api.get(path.recycler(url));
    // Backend returns { message, data: { data: [...], pagination: {...} } }
    // Extract the nested data object
    return data.data || data;
  },

  /**
   * Get pending invitations for recycler admin
   * GET /recycler/pending-invitations
   */
  async getPendingInvitations(
    filters?: GetInvitationsFilters,
  ): Promise<PaginatedResponse<InvitationManagement>> {
    const queryParams = new URLSearchParams();

    if (filters?.role) {
      queryParams.append("role", filters.role);
    }
    if (filters?.status) {
      queryParams.append("status", filters.status);
    }
    if (filters?.search) {
      queryParams.append("search", filters.search);
    }
    if (filters?.page) {
      queryParams.append("page", String(filters.page));
    }
    if (filters?.limit) {
      queryParams.append("limit", String(filters.limit));
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.RECYCLER.PENDING_INVITATIONS}?${queryString}`
      : ENDPOINTS.RECYCLER.PENDING_INVITATIONS;

    const { data } = await api.get(path.recycler(url));
    // Backend returns { message, data: { data: [...], pagination: {...} } }
    // Extract the nested data object
    return data.data || data;
  },
};
