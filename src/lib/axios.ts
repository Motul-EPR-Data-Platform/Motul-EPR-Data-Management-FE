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
  withCredentials: true, // Enable cookies for HTTP-only auth tokens
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

// Request interceptor - cookies are sent automatically with withCredentials: true
// No need to manually attach Authorization header
api.interceptors.request.use(async (config) => {
  // Cookies are automatically included with withCredentials: true
  
  // For FormData, remove Content-Type header to let browser set it with boundary
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete (config.headers as any)["Content-Type"];
    }
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

      if (isRefreshing) {
        // Queue the request to retry after refresh completes
        return new Promise((resolve, reject) => {
          queue(() => {
            // Retry original request (cookies will be automatically included)
            resolve(api(original));
          });
        });
      }

      try {
        isRefreshing = true;
        // Refresh token is in HTTP-only cookie, so we don't need to send it in body
        // Backend should read refresh token from cookie
        const resp = await axios.post(
          `${API_BASE_URL}${path.auth(ENDPOINTS.AUTH.REFRESH)}`,
          {},
          {
            withCredentials: true, // Include cookies
            headers: { "Content-Type": "application/json" },
          },
        );

        flush(); // Wake queued requests
        // Retry original request (cookies will be automatically included)
        return api(original);
      } catch (e) {
        // Refresh failed - clear any local state and redirect to login
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
