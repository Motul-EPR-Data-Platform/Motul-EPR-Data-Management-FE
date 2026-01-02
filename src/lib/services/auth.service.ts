import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  AppUser,
  AuthResponse,
  CompleteRecyclerAdminProfileDTO,
  CompleteWasteTransferAdminProfileDTO,
  ForgotPasswordDTO,
  LoginDTO,
  RegisterMotulDTO,
  RegisterWithInviteDTO,
  ResetPasswordDTO,
  SessionPayload,
  UpdatePasswordDTO,
} from "@/types/index";

// Session is now stored in HTTP-only cookies by the backend
// No need to persist tokens in localStorage

export const AuthService = {
  // -------- Public --------
  async registerMotul(dto: RegisterMotulDTO): Promise<AuthResponse> {
    const accessToken = dto.accessToken;
    const payload = { ...dto };
    delete payload.accessToken;

    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.MOTUL),
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    // Session is stored in HTTP-only cookies by backend
    return data;
  },

  async registerRecyclerAdmin(
    dto: RegisterWithInviteDTO,
  ): Promise<AuthResponse> {
    const accessToken = dto.accessToken; // the token you passed earlier
    const payload = { ...dto };
    delete payload.accessToken; // remove it from body

    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.RECYCLER_ADMIN),
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return data;
  },

  async completeRecyclerAdminProfile(
    dto: CompleteRecyclerAdminProfileDTO,
  ): Promise<AppUser> {
    const response = await api.post<{ data: AppUser }>(
      path.recycler(ENDPOINTS.RECYCLER.COMPLETE_PROFILE),
      { recyclerProfile: dto },
    );
    // Extract nested data if present, otherwise use response.data directly
    return (response.data as any).data || response.data;
  },

  async registerRecycler(dto: RegisterWithInviteDTO): Promise<AuthResponse> {
    const accessToken = dto.accessToken;
    const payload = { ...dto };
    delete payload.accessToken;

    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.RECYCLER),
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    // Session is stored in HTTP-only cookies by backend
    return data;
  },

  async registerWasteTransferAdmin(
    dto: RegisterWithInviteDTO,
  ): Promise<AuthResponse> {
    const accessToken = dto.accessToken;
    const payload = { ...dto };
    delete payload.accessToken;

    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.WASTE_TRANSFER_ADMIN),
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    // Session is stored in HTTP-only cookies by backend
    return data;
  },

  async completeWasteTransferAdminProfile(
    dto: CompleteWasteTransferAdminProfileDTO,
  ): Promise<AppUser> {
    const response = await api.post<{ data: AppUser }>(
      path.wtp(ENDPOINTS.WTP.COMPLETE_PROFILE),
      { wasteTransferPointProfile: dto },
    );
    // Extract nested data if present, otherwise use response.data directly
    return (response.data as any).data || response.data;
  },

  async registerWasteTransfer(
    dto: RegisterWithInviteDTO,
  ): Promise<AuthResponse> {
    const accessToken = dto.accessToken;
    const payload = { ...dto };
    delete payload.accessToken;

    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.WASTE_TRANSFER),
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    // Session is stored in HTTP-only cookies by backend
    return data;
  },

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.LOGIN),
      dto,
    );
    // Session is stored in HTTP-only cookies by backend
    return data;
  },

  async forgotPassword(dto: ForgotPasswordDTO): Promise<void> {
    await api.post<void>(path.auth(ENDPOINTS.AUTH.FORGOT_PASSWORD), dto);
  },

  async resetPassword(dto: ResetPasswordDTO): Promise<void> {
    await api.post<void>(path.auth(ENDPOINTS.AUTH.RESET_PASSWORD), dto);
  },

  // -------- Protected --------
  async logout(): Promise<void> {
    // Call logout API (may fail if token is invalid, but that's okay)
    // Don't clear tokens here - let AuthContext handle it
    // This ensures we can retry or handle errors properly
    await api.post<void>(path.auth(ENDPOINTS.AUTH.LOGOUT), {});
  },

  async me(): Promise<AppUser> {
    const response = await api.get<{ data: AppUser } | AppUser>(
      path.auth(ENDPOINTS.AUTH.ME),
    );

    // The API returns { data: AppUser }
    // Axios wraps it: axios response = { data: { data: AppUser } }
    // So we need: response.data.data
    // But if the API directly returns AppUser, we use response.data
    const apiResponse = response.data as any;
    const userData: AppUser = apiResponse?.data || apiResponse;

    if (!userData) {
      throw new Error("Invalid user data: user data is missing");
    }

    if (!userData.role) {
      throw new Error("Invalid user data: role is missing");
    }

    return userData;
  },

  async refresh(): Promise<SessionPayload> {
    // Refresh token is in HTTP-only cookie, backend reads it from cookie
    const { data } = await api.post<SessionPayload>(
      path.auth(ENDPOINTS.AUTH.REFRESH),
      {}, // No body needed - refresh token is in cookie
    );
    // New tokens are stored in HTTP-only cookies by backend
    return data;
  },

  async updatePassword(dto: UpdatePasswordDTO): Promise<void> {
    await api.post<void>(path.auth(ENDPOINTS.AUTH.UPDATE_PASSWORD), dto);
  },
};
