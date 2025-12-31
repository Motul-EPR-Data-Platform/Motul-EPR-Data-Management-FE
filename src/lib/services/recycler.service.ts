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
import {
  FileType,
  IFileUploadResponse,
  IRecyclerProfileFilesWithPreview,
} from "@/types/file-record";

export const RecyclerService = {
  /**
   * Upload temporary file before profile creation
   * POST /recycler-admin/profile/upload-temp-file
   */
  async uploadTemporaryFile(
    file: File,
    category: FileType,
  ): Promise<IFileUploadResponse & { fileId: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const { data } = await api.post(
      path.recycler(ENDPOINTS.RECYCLER.UPLOAD_TEMP_FILE),
      formData,
    );
    return data.data || data;
  },

  /**
   * Replace profile file (update existing file)
   * PUT /recycler-admin/profiles/:profileId
   */
  async replaceProfileFile(
    profileId: string,
    file: File,
    category: FileType,
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const { data } = await api.put(
      path.recycler(ENDPOINTS.RECYCLER.REPLACE_PROFILE_FILE(profileId)),
      formData,
    );
    return data.data || data;
  },
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
   * PATCH /recycler-admin/profile/:id
   */
  async updateProfile(
    id: string,
    dto: UpdateRecyclerProfileDTO,
  ): Promise<RecyclerProfile> {
    const { data } = await api.patch(
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

  /**
   * Get recycler profile files with preview URLs (signed URLs)
   * GET /recycler-admin/profile/:id/files/preview
   */
  async getProfileFilesWithPreview(
    profileId: string,
  ): Promise<IRecyclerProfileFilesWithPreview> {
    const { data } = await api.get(
      path.recycler(ENDPOINTS.RECYCLER.PROFILE_FILES_PREVIEW(profileId)),
    );
    return data.data || data;
  },
};
