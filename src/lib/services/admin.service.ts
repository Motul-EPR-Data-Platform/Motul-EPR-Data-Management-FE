import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  GetUsersFilters,
  GetInvitationsFilters,
  PaginatedResponse,
  UserManagement,
  InvitationManagement,
} from "@/types/user";

export const AdminService = {
  /**
   * Get all users with filters and pagination
   * Only accessible by motul_admin
   */
  async getUsers(filters?: GetUsersFilters): Promise<PaginatedResponse<UserManagement>> {
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
      ? `${ENDPOINTS.ADMIN.USERS}?${queryString}`
      : ENDPOINTS.ADMIN.USERS;

    const { data } = await api.get(path.admin(url));
    return data;
  },

  /**
   * Get all invitations with filters and pagination
   * Only accessible by motul_admin
   */
  async getInvitations(
    filters?: GetInvitationsFilters
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
      ? `${ENDPOINTS.ADMIN.INVITATIONS}?${queryString}`
      : ENDPOINTS.ADMIN.INVITATIONS;

    const { data } = await api.get(path.admin(url));
    return data;
  },
};

