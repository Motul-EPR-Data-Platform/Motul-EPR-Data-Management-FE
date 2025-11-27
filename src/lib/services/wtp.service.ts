import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import { WtpProfile, UpdateWtpProfileDTO } from "@/types/auth";
import {
  PaginatedResponse,
  UserManagement,
  InvitationManagement,
  GetUsersFilters,
  GetInvitationsFilters,
} from "@/types/user";

export const WtpService = {
  /**
   * Get WTP profile by ID
   * GET /wtp/profile/:id
   */
  async getProfile(id: string): Promise<WtpProfile> {
    const { data } = await api.get(path.wtp(ENDPOINTS.WTP.PROFILE(id)));
    return data.data || data;
  },

  /**
   * Update WTP profile
   * PUT /wtp/profile/:id
   */
  async updateProfile(
    id: string,
    dto: UpdateWtpProfileDTO,
  ): Promise<WtpProfile> {
    const { data } = await api.put(path.wtp(ENDPOINTS.WTP.PROFILE(id)), dto);
    return data.data || data;
  },

  /**
   * Get all users for waste transfer admin
   * GET /wtp/users
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
      ? `${ENDPOINTS.WTP.USERS}?${queryString}`
      : ENDPOINTS.WTP.USERS;

    const { data } = await api.get(path.wtp(url));
    // Backend returns { message, data: { data: [...], pagination: {...} } }
    // Extract the nested data object
    return data.data || data;
  },

  /**
   * Get pending invitations for waste transfer admin
   * GET /wtp/pending-invitations
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
      ? `${ENDPOINTS.WTP.PENDING_INVITATIONS}?${queryString}`
      : ENDPOINTS.WTP.PENDING_INVITATIONS;

    const { data } = await api.get(path.wtp(url));
    // Backend returns { message, data: { data: [...], pagination: {...} } }
    // Extract the nested data object
    return data.data || data;
  },
};
