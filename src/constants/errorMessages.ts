/**
 * Error message mapping organized by routes
 * Similar structure to API endpoints, with base errors and route-specific overrides
 * Uses constants from api.ts to avoid hardcoded routes
 */

import { ENDPOINTS, path } from "@/constants/api";

export type ErrorCode = string | number;
export type StatusCode = number;

export interface ErrorMessageMap {
  codes?: Record<string, string>; // Error code -> message mapping
  statusCodes?: Record<number, string>; // HTTP status code -> message mapping
}

/**
 * Base error messages shared across all routes
 */
export const BASE_ERROR_MESSAGES: ErrorMessageMap = {
  codes: {
    // Generic error codes
    GENERIC_ERROR: "Đã xảy ra lỗi. Vui lòng thử lại",
    UNKNOWN_ERROR: "Lỗi không xác định",
    NETWORK_ERROR: "Lỗi kết nối. Vui lòng kiểm tra kết nối mạng",
    SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau",
  },
  statusCodes: {
    // Common HTTP status codes
    400: "Yêu cầu không hợp lệ",
    401: "Không có quyền truy cập",
    403: "Bạn không có quyền thực hiện thao tác này",
    404: "Không tìm thấy dữ liệu",
    409: "Dữ liệu đã tồn tại",
    422: "Dữ liệu không hợp lệ",
    429: "Quá nhiều yêu cầu. Vui lòng thử lại sau",
    500: "Lỗi máy chủ. Vui lòng thử lại sau",
    502: "Lỗi kết nối đến máy chủ",
    503: "Máy chủ đang bảo trì. Vui lòng thử lại sau",
  },
};

/**
 * Route-specific error messages
 * Can extend from base and override specific messages
 * Uses constants from api.ts to ensure consistency
 */
export const ROUTE_ERROR_MESSAGES: Record<string, ErrorMessageMap> = {
  // ============================================
  // AUTH Routes
  // ============================================
  [path.auth(ENDPOINTS.AUTH.LOGIN)]: {
    codes: {
      "1001": "Email hoặc mật khẩu không chính xác",
      "1002": "Tài khoản chưa được kích hoạt",
      "1003": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
      "1004": "Mật khẩu không hợp lệ",
      "1006": "Token không hợp lệ hoặc đã hết hạn",
    },
    statusCodes: {
      400: "Tên đăng nhập hoặc mật khẩu không đúng",
      401: "Tên đăng nhập hoặc mật khẩu không đúng",
      429: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau",
    },
  },

  [path.auth(ENDPOINTS.AUTH.REGISTER.MOTUL)]: {
    codes: {
      "1005": "Email đã được sử dụng",
      "1006": "Token không hợp lệ hoặc đã hết hạn",
    },
    statusCodes: {
      400: "Thông tin đăng ký không hợp lệ",
      409: "Email đã được sử dụng",
    },
  },

  [path.auth(ENDPOINTS.AUTH.REGISTER.RECYCLER_ADMIN)]: {
    codes: {
      "1005": "Email đã được sử dụng",
      "1006": "Token không hợp lệ hoặc đã hết hạn",
    },
    statusCodes: {
      400: "Thông tin đăng ký không hợp lệ",
      409: "Email đã được sử dụng",
    },
  },

  [path.auth(ENDPOINTS.AUTH.REGISTER.RECYCLER)]: {
    codes: {
      "1005": "Email đã được sử dụng",
      "1006": "Token không hợp lệ hoặc đã hết hạn",
    },
    statusCodes: {
      400: "Thông tin đăng ký không hợp lệ",
      409: "Email đã được sử dụng",
    },
  },

  [path.auth(ENDPOINTS.AUTH.REGISTER.WASTE_TRANSFER_ADMIN)]: {
    codes: {
      "1005": "Email đã được sử dụng",
      "1006": "Token không hợp lệ hoặc đã hết hạn",
    },
    statusCodes: {
      400: "Thông tin đăng ký không hợp lệ",
      409: "Email đã được sử dụng",
    },
  },

  [path.auth(ENDPOINTS.AUTH.REGISTER.WASTE_TRANSFER)]: {
    codes: {
      "1005": "Email đã được sử dụng",
      "1006": "Token không hợp lệ hoặc đã hết hạn",
    },
    statusCodes: {
      400: "Thông tin đăng ký không hợp lệ",
      409: "Email đã được sử dụng",
    },
  },

  [path.auth(ENDPOINTS.AUTH.UPDATE_PASSWORD)]: {
    codes: {
      "1004": "Mật khẩu không hợp lệ",
      "1007": "Mật khẩu cũ không chính xác",
    },
    statusCodes: {
      400: "Mật khẩu không hợp lệ",
      401: "Mật khẩu cũ không chính xác",
    },
  },

  [path.auth(ENDPOINTS.AUTH.FORGOT_PASSWORD)]: {
    codes: {
      "1001": "Email không tồn tại trong hệ thống",
    },
    statusCodes: {
      404: "Email không tồn tại trong hệ thống",
    },
  },

  [path.auth(ENDPOINTS.AUTH.RESET_PASSWORD)]: {
    codes: {
      "1006": "Token không hợp lệ hoặc đã hết hạn",
      "1004": "Mật khẩu không hợp lệ",
    },
    statusCodes: {
      400: "Token không hợp lệ hoặc đã hết hạn",
    },
  },

  // ============================================
  // USER MANAGEMENT Routes
  // ============================================
  [path.admin(ENDPOINTS.ADMIN.USERS)]: {
    codes: {
      "2001": "Không thể tải danh sách người dùng",
      "2002": "Không thể tạo người dùng mới",
      "2003": "Không thể cập nhật thông tin người dùng",
      "2004": "Không thể xóa người dùng",
    },
    statusCodes: {
      404: "Không tìm thấy người dùng",
      409: "Email đã được sử dụng",
    },
  },

  [path.recycler(ENDPOINTS.RECYCLER.USERS)]: {
    codes: {
      "2001": "Không thể tải danh sách người dùng",
      "2002": "Không thể tạo người dùng mới",
      "2003": "Không thể cập nhật thông tin người dùng",
      "2004": "Không thể xóa người dùng",
    },
    statusCodes: {
      404: "Không tìm thấy người dùng",
      409: "Email đã được sử dụng",
    },
  },

  [path.wtp(ENDPOINTS.WTP.USERS)]: {
    codes: {
      "2001": "Không thể tải danh sách người dùng",
      "2002": "Không thể tạo người dùng mới",
      "2003": "Không thể cập nhật thông tin người dùng",
      "2004": "Không thể xóa người dùng",
    },
    statusCodes: {
      404: "Không tìm thấy người dùng",
      409: "Email đã được sử dụng",
    },
  },

  [path.invitations(ENDPOINTS.INVITATIONS.SEND)]: {
    codes: {
      "2005": "Không thể gửi lời mời",
      "2006": "Email đã được mời",
    },
    statusCodes: {
      400: "Thông tin lời mời không hợp lệ",
      409: "Email đã được mời",
    },
  },

  [path.admin(ENDPOINTS.ADMIN.INVITATIONS)]: {
    codes: {
      "2007": "Không thể tải danh sách lời mời đang chờ",
    },
    statusCodes: {
      404: "Không tìm thấy lời mời",
    },
  },

  [path.recycler(ENDPOINTS.RECYCLER.PENDING_INVITATIONS)]: {
    codes: {
      "2007": "Không thể tải danh sách lời mời đang chờ",
    },
    statusCodes: {
      404: "Không tìm thấy lời mời",
    },
  },

  [path.wtp(ENDPOINTS.WTP.PENDING_INVITATIONS)]: {
    codes: {
      "2007": "Không thể tải danh sách lời mời đang chờ",
    },
    statusCodes: {
      404: "Không tìm thấy lời mời",
    },
  },

  // ============================================
  // DEFINITIONS Routes
  // ============================================
  [path.definitions("")]: {
    codes: {
      "3000": "Lỗi định nghĩa không xác định",
      "3001": "Không thể tải danh mục",
      "3002": "Không thể tải định nghĩa",
    },
    statusCodes: {
      404: "Không tìm thấy định nghĩa",
    },
  },

  [path.definitions(ENDPOINTS.DEFINITIONS.CATEGORIES)]: {
    codes: {
      "3001": "Không thể tải danh mục",
      "3006": "Không thể tạo danh mục mới",
      "3007": "Không thể cập nhật danh mục",
      "3008": "Danh mục không tồn tại",
    },
    statusCodes: {
      404: "Không tìm thấy danh mục",
      409: "Danh mục đã tồn tại",
    },
  },

  [path.definitions(ENDPOINTS.DEFINITIONS.WASTE_TYPES)]: {
    codes: {
      "3002": "Không thể tải định nghĩa",
      "3003": "Không thể tạo định nghĩa mới",
      "3004": "Không thể cập nhật định nghĩa",
      "3005": "Không thể xóa định nghĩa",
    },
    statusCodes: {
      404: "Không tìm thấy định nghĩa",
      409: "Định nghĩa đã tồn tại",
    },
  },

  [path.definitions(ENDPOINTS.DEFINITIONS.CONTRACT_TYPES)]: {
    codes: {
      "3002": "Không thể tải định nghĩa",
      "3003": "Không thể tạo định nghĩa mới",
      "3004": "Không thể cập nhật định nghĩa",
      "3005": "Không thể xóa định nghĩa",
    },
    statusCodes: {
      404: "Không tìm thấy định nghĩa",
      409: "Định nghĩa đã tồn tại",
    },
  },

  [path.definitions(ENDPOINTS.DEFINITIONS.EPR_ENTITIES)]: {
    codes: {
      "3002": "Không thể tải định nghĩa",
      "3003": "Không thể tạo định nghĩa mới",
      "3004": "Không thể cập nhật định nghĩa",
      "3005": "Không thể xóa định nghĩa",
    },
    statusCodes: {
      404: "Không tìm thấy định nghĩa",
      409: "Định nghĩa đã tồn tại",
    },
  },

  [path.definitions(ENDPOINTS.DEFINITIONS.CUSTOM)]: {
    codes: {
      "3002": "Không thể tải định nghĩa",
      "3003": "Không thể tạo định nghĩa mới",
      "3004": "Không thể cập nhật định nghĩa",
      "3005": "Không thể xóa định nghĩa",
    },
    statusCodes: {
      404: "Không tìm thấy định nghĩa",
      409: "Định nghĩa đã tồn tại",
    },
  },

  // ============================================
  // PROFILE Routes
  // ============================================
  // Note: Profile routes use dynamic IDs, so we use base path pattern
  [`${ENDPOINTS.RECYCLER.ROOT}/profile`]: {
    codes: {
      "4000": "Lỗi hồ sơ không xác định",
      "4001": "Không thể tải thông tin doanh nghiệp",
      "4002": "Không thể cập nhật thông tin doanh nghiệp",
      "4003": "Vui lòng hoàn thiện thông tin doanh nghiệp",
      "4004": "Thông tin doanh nghiệp không hợp lệ",
    },
    statusCodes: {
      404: "Không tìm thấy hồ sơ",
      422: "Thông tin doanh nghiệp không hợp lệ",
    },
  },

  [path.recycler(ENDPOINTS.RECYCLER.COMPLETE_PROFILE)]: {
    codes: {
      "4003": "Vui lòng hoàn thiện thông tin doanh nghiệp",
      "4004": "Thông tin doanh nghiệp không hợp lệ",
    },
    statusCodes: {
      400: "Thông tin doanh nghiệp không hợp lệ",
      422: "Thông tin doanh nghiệp không hợp lệ",
    },
  },

  // Note: Profile routes use dynamic IDs, so we use base path pattern
  [`${ENDPOINTS.WTP.ROOT}/profile`]: {
    codes: {
      "4000": "Lỗi hồ sơ không xác định",
      "4001": "Không thể tải thông tin doanh nghiệp",
      "4002": "Không thể cập nhật thông tin doanh nghiệp",
      "4003": "Vui lòng hoàn thiện thông tin doanh nghiệp",
      "4004": "Thông tin doanh nghiệp không hợp lệ",
    },
    statusCodes: {
      404: "Không tìm thấy hồ sơ",
      422: "Thông tin doanh nghiệp không hợp lệ",
    },
  },

  [path.wtp(ENDPOINTS.WTP.COMPLETE_PROFILE)]: {
    codes: {
      "4003": "Vui lòng hoàn thiện thông tin doanh nghiệp",
      "4004": "Thông tin doanh nghiệp không hợp lệ",
    },
    statusCodes: {
      400: "Thông tin doanh nghiệp không hợp lệ",
      422: "Thông tin doanh nghiệp không hợp lệ",
    },
  },
};

/**
 * Get error message for a specific route
 * @param route - API route (e.g., "/auth/login")
 * @param error - Error object from API
 * @param overrideMessage - Optional message to override
 * @returns User-friendly Vietnamese error message
 */
export function getErrorMessageForRoute(
  route: string,
  error: any,
  overrideMessage?: string | null,
): string {
  // If override message is provided, use it
  if (overrideMessage) return overrideMessage;

  // Check for backend message first (highest priority)
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Get route-specific error map
  const routeErrors = ROUTE_ERROR_MESSAGES[route] || {};

  // Merge base and route-specific errors (route-specific takes precedence)
  const mergedCodes = {
    ...BASE_ERROR_MESSAGES.codes,
    ...routeErrors.codes,
  };

  const mergedStatusCodes = {
    ...BASE_ERROR_MESSAGES.statusCodes,
    ...routeErrors.statusCodes,
  };

  // Check for error code in response
  const errorCode =
    error?.response?.data?.code || error?.response?.data?.errorCode;
  if (errorCode && mergedCodes[String(errorCode)]) {
    return mergedCodes[String(errorCode)];
  }

  // Check for HTTP status code
  const statusCode = error?.response?.status;
  if (statusCode && mergedStatusCodes[statusCode]) {
    return mergedStatusCodes[statusCode];
  }

  // Check for network errors
  if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
    return (
      mergedCodes.NETWORK_ERROR ||
      "Kết nối quá thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại"
    );
  }

  if (
    error?.code === "ERR_NETWORK" ||
    error?.message?.includes("Network Error")
  ) {
    return (
      mergedCodes.NETWORK_ERROR ||
      "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại"
    );
  }

  // Check for generic error message
  if (error?.message) {
    return error.message;
  }

  // Default fallback
  return mergedCodes.GENERIC_ERROR || "Đã xảy ra lỗi. Vui lòng thử lại";
}

/**
 * Extract route from error object or URL
 * @param error - Error object (may contain config.url or request.url)
 * @param defaultRoute - Default route if cannot be extracted
 * @returns Route string
 */
export function extractRouteFromError(
  error: any,
  defaultRoute: string = "",
): string {
  // Try to extract from axios error config
  if (error?.config?.url) {
    const url = error.config.url;
    // Remove base URL and query params
    const route = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
    return route;
  }

  // Try to extract from request
  if (error?.request?.responseURL) {
    const url = error.request.responseURL;
    const route = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
    return route;
  }

  return defaultRoute;
}
