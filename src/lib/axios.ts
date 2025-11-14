import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL, path, ENDPOINTS } from "@/constants/api";

// Token storage keys
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const EXPIRES_AT_KEY = "expires_at";

export type TokenBundle = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
};

const tokenStore = {
  get(): TokenBundle | null {
    try {
      const access_token = localStorage.getItem(ACCESS_KEY);
      const refresh_token = localStorage.getItem(REFRESH_KEY);
      const expires_at = Number(localStorage.getItem(EXPIRES_AT_KEY) ?? 0);
      if (!access_token || !refresh_token || !expires_at) return null;
      return { access_token, refresh_token, expires_at };
    } catch {
      return null;
    }
  },
  set(tokens: TokenBundle) {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    localStorage.setItem(EXPIRES_AT_KEY, String(tokens.expires_at));
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  },
};

// Create instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// Simple refresh lock
let isRefreshing = false;
let queued: Array<(t?: string) => void> = [];

function queue(cb: (t?: string) => void) {
  queued.push(cb);
}
function flush(newAccess?: string) {
  queued.forEach((fn) => fn(newAccess));
  queued = [];
}

// Attach Authorization
api.interceptors.request.use(async (config) => {
  const t = tokenStore.get();
  if (!t) return config;

  // Add bearer if not present
  if (!config.headers?.Authorization) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${t.access_token}`;
  }
  return config;
});

// Handle 401 and auto-refresh
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config!;
    const status = error.response?.status;

    // Only refresh for 401 once per request
    if (status === 401 && !original._retry) {
      original._retry = true;

      const current = tokenStore.get();
      if (!current?.refresh_token) {
        tokenStore.clear();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue((newAccess) => {
            if (newAccess)
              original.headers = {
                ...original.headers,
                Authorization: `Bearer ${newAccess}`,
              };
            resolve(api(original));
          });
        });
      }

      try {
        isRefreshing = true;
        const resp = await axios.post(
          `${API_BASE_URL}${path.auth(ENDPOINTS.AUTH.REFRESH)}`,
          { refreshToken: current.refresh_token },
          { headers: { "Content-Type": "application/json" } },
        );

        const { access_token, refresh_token, expires_at } =
          resp.data as TokenBundle;
        tokenStore.set({ access_token, refresh_token, expires_at });

        flush(access_token);
        return api({
          ...original,
          headers: {
            ...original.headers,
            Authorization: `Bearer ${access_token}`,
          },
        });
      } catch (e) {
        tokenStore.clear();
        flush(); // wake waiters with failure
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export { api, tokenStore };
