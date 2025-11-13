import { api, tokenStore } from "@/lib/axios";
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

function persistSession(session?: SessionPayload) {
  if (!session) return;
  tokenStore.set(session);
}

export const AuthService = {
  // -------- Public --------
  async registerMotul(dto: RegisterMotulDTO): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.MOTUL),
      dto,
    );
    persistSession(data.data.session);
    return data;
    },

  async registerRecyclerAdmin(dto: RegisterWithInviteDTO): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.RECYCLER_ADMIN),
      dto,
    );
    persistSession(data.data.session);
    return data;
  },

  async completeRecyclerAdminProfile(dto: CompleteRecyclerAdminProfileDTO): Promise<AppUser> {
    const response = await api.post<{ data: AppUser }>(
      path.auth(ENDPOINTS.AUTH.COMPLETE_PROFILE.RECYCLER_ADMIN),
      dto,
    );
    // Extract nested data if present, otherwise use response.data directly
    return (response.data as any).data || response.data;
  },

  async registerRecycler(dto: RegisterWithInviteDTO): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.RECYCLER),
      dto,
    );
    persistSession(data.data.session);
    return data;
  },

  async registerWasteTransferAdmin(dto: RegisterWithInviteDTO): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.WASTE_TRANSFER_ADMIN),
      dto,
    );
    persistSession(data.data.session);
    return data;
  },

  async completeWasteTransferAdminProfile(
    dto: CompleteWasteTransferAdminProfileDTO,
  ): Promise<AppUser> {
    const response = await api.post<{ data: AppUser }>(
      path.auth(ENDPOINTS.AUTH.COMPLETE_PROFILE.WASTE_TRANSFER_ADMIN),
      dto,
    );
    // Extract nested data if present, otherwise use response.data directly
    return (response.data as any).data || response.data;
  },

  async registerWasteTransfer(dto: RegisterWithInviteDTO): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.REGISTER.WASTE_TRANSFER),
      dto,
    );
    persistSession(data.data.session);
    return data;
  },

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      path.auth(ENDPOINTS.AUTH.LOGIN),
      dto,
    );
    persistSession(data.data.session);
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
    const response = await api.get<{ data: AppUser } | AppUser>(path.auth(ENDPOINTS.AUTH.ME));
    
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
    const tokens = tokenStore.get();
    if (!tokens?.refresh_token) throw new Error("Missing refresh token");
    const { data } = await api.post<SessionPayload>(
      path.auth(ENDPOINTS.AUTH.REFRESH),
      { refreshToken: tokens.refresh_token },
    );
    tokenStore.set(data);
    return data;
  },

  async updatePassword(dto: UpdatePasswordDTO): Promise<void> {
    await api.post<void>(path.auth(ENDPOINTS.AUTH.UPDATE_PASSWORD), dto);
  },
};
