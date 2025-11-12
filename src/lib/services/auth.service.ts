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
    const { data } = await api.post<AppUser>(
      path.auth(ENDPOINTS.AUTH.COMPLETE_PROFILE.RECYCLER_ADMIN),
      dto,
    );
    return data;
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
    const { data } = await api.post<AppUser>(
      path.auth(ENDPOINTS.AUTH.COMPLETE_PROFILE.WASTE_TRANSFER_ADMIN),
      dto,
    );
    return data;
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
    console.log(data);
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
    const { data } = await api.get<AppUser>(path.auth(ENDPOINTS.AUTH.ME));
    console.log("me", data);
    return data;
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
