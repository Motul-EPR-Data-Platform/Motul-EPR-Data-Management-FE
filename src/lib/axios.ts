import axios, { AxiosError, AxiosInstance } from "axios";
import { API_BASE_URL, path, ENDPOINTS } from "@/constants/api";

// --------------------------------------------------
// Types & Constants
// --------------------------------------------------
interface RefreshState {
  isRefreshing: boolean;
  timestamp: number;
}

const REFRESH_STATE_KEY = "auth_refresh_state";
const REFRESH_TIMEOUT = 5000; // 5 seconds max for a refresh attempt

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
// Refresh lock + queue (with cross-tab coordination)
// --------------------------------------------------
let isRefreshing = false;
let queue: Array<() => void> = [];

/**
 * Set refresh state in both memory and localStorage for cross-tab coordination
 */
function setRefreshState(state: boolean) {
  isRefreshing = state;
  const refreshState: RefreshState = {
    isRefreshing: state,
    timestamp: Date.now(),
  };
  try {
    if (state) {
      localStorage.setItem(REFRESH_STATE_KEY, JSON.stringify(refreshState));
    } else {
      localStorage.removeItem(REFRESH_STATE_KEY);
    }
  } catch (e) {
    console.warn("Failed to update refresh state in localStorage", e);
  }
}

/**
 * Get current refresh state from localStorage (shared across tabs)
 */
function getRefreshState(): RefreshState | null {
  try {
    const stored = localStorage.getItem(REFRESH_STATE_KEY);
    if (!stored) return null;

    const state: RefreshState = JSON.parse(stored);

    // Clear stale refresh state (timeout protection)
    if (Date.now() - state.timestamp > REFRESH_TIMEOUT) {
      localStorage.removeItem(REFRESH_STATE_KEY);
      return null;
    }

    return state;
  } catch (e) {
    return null;
  }
}

/**
 * Wait for another tab's refresh operation to complete
 */
function waitForRefresh(): Promise<void> {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const state = getRefreshState();
      if (!state || !state.isRefreshing) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100); // Check every 100ms

    // Safety timeout
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, REFRESH_TIMEOUT);
  });
}

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
        setRefreshState(false); // Clear refresh state on failure
        return Promise.reject(error);
      }

      original._retry = true;

      // Check if ANY tab is currently refreshing (cross-tab coordination)
      const globalState = getRefreshState();
      if (globalState?.isRefreshing || isRefreshing) {
        // Another tab is refreshing - wait for it to complete
        await waitForRefresh();

        // Retry the original request (should now have fresh tokens in cookies)
        return api(original);
      }

      try {
        // Claim the refresh lock ACROSS ALL TABS
        setRefreshState(true);

        // Refresh session (refresh token read from cookie)
        await api.post(path.auth(ENDPOINTS.AUTH.REFRESH));

        flushQueue();
        return api(original);
      } catch (refreshError) {
        flushQueue();
        return Promise.reject(refreshError);
      } finally {
        setRefreshState(false);
      }
    }

    return Promise.reject(error);
  },
);

export { api };
