import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL, path, ENDPOINTS } from "@/constants/api";

// --------------------------------------------------
// Axios instance
// --------------------------------------------------
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, //
  headers: {
    "Content-Type": "application/json",
  },
});

// --------------------------------------------------
// Refresh lock + queue
// --------------------------------------------------
let isRefreshing = false;
let queue: Array<() => void> = [];

function flushQueue() {
  queue.forEach((cb) => cb());
  queue = [];
}

// --------------------------------------------------
// Request interceptor
// --------------------------------------------------
api.interceptors.request.use((config) => {
  // Let browser set boundary for FormData
  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
  }

  // Add cache-busting query parameter if noCache option is set
  // This avoids CORS preflight issues that custom headers might cause
  if ((config as any).noCache && config.url) {
    // Handle both absolute and relative URLs
    const separator = config.url.includes("?") ? "&" : "?";
    config.url = `${config.url}${separator}_nocache=${Date.now()}`;
  }

  return config;
});

// --------------------------------------------------
// Response interceptor (401 → refresh → retry)
// --------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as any;

    if (error.response?.status === 401 && !original?._retry) {
      // Don't retry if this is already the refresh endpoint (prevent infinite loop)
      if (original?.url?.includes(ENDPOINTS.AUTH.REFRESH)) {
        return Promise.reject(error);
      }

      original._retry = true;

      if (isRefreshing) {
        // Wait until refresh finishes, then retry
        return new Promise((resolve) => {
          queue.push(() => resolve(api(original)));
        });
      }

      try {
        isRefreshing = true;

        // Refresh session (refresh token read from cookie)
        await api.post(path.auth(ENDPOINTS.AUTH.REFRESH));

        flushQueue();
        return api(original);
      } catch (refreshError) {
        flushQueue();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export { api };
