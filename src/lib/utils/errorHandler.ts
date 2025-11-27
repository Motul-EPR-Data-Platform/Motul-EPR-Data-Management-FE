/**
 * Centralized error handling utilities
 * Uses route-based error mapping with base errors and overrides
 */

import {
  getErrorMessageForRoute,
  extractRouteFromError,
  type ErrorCode,
} from "@/constants/errorMessages";
import { ENDPOINTS, path } from "@/constants/api";

/**
 * Get error message for a specific route
 * @param route - API route (e.g., "/auth/login", "/admin/users")
 * @param error - Error object from API
 * @param overrideMessage - Optional message to override
 * @param defaultMessage - Optional default message if no mapping found
 * @returns User-friendly Vietnamese error message
 */
export function getErrorMessage(
  route: string,
  error: any,
  overrideMessage?: string | null,
  defaultMessage?: string,
): string {
  // If override message is provided, use it
  if (overrideMessage) return overrideMessage;

  // Get message from route-specific mapping
  const message = getErrorMessageForRoute(route, error);

  // If we got a generic error and default is provided, use default
  if (message.includes("Đã xảy ra lỗi") && defaultMessage) {
    return defaultMessage;
  }

  return message;
}

/**
 * Get error message by automatically detecting route from error
 * @param error - Error object from API
 * @param overrideMessage - Optional message to override
 * @param defaultMessage - Optional default message if no mapping found
 * @param defaultRoute - Default route if cannot be extracted from error
 * @returns User-friendly Vietnamese error message
 */
export function getErrorMessageAuto(
  error: any,
  overrideMessage?: string | null,
  defaultMessage?: string,
  defaultRoute: string = "",
): string {
  // If override message is provided, use it
  if (overrideMessage) return overrideMessage;

  // Try to extract route from error
  const route = extractRouteFromError(error, defaultRoute);

  // Get message using extracted or default route
  return getErrorMessage(route, error, null, defaultMessage);
}

/**
 * Helper function for toast.promise error handler
 * @param route - API route
 * @param error - Error object
 * @param overrideMessage - Optional override message
 * @param defaultMessage - Optional default message
 * @returns Error message string
 */
export function getToastErrorMessage(
  route: string,
  error: any,
  overrideMessage?: string | null,
  defaultMessage?: string,
): string {
  return getErrorMessage(route, error, overrideMessage, defaultMessage);
}

/**
 * Helper function for form error display
 * @param route - API route
 * @param error - Error object
 * @param overrideMessage - Optional override message
 * @param defaultMessage - Optional default message
 * @returns Error message string
 */
export function getFormErrorMessage(
  route: string,
  error: any,
  overrideMessage?: string | null,
  defaultMessage?: string,
): string {
  return getErrorMessage(route, error, overrideMessage, defaultMessage);
}

/**
 * Helper for authentication errors (backward compatibility)
 * @param error - Error object
 * @param overrideMessage - Optional override message
 * @returns Error message string
 */
export function getAuthErrorMessage(
  error: any,
  overrideMessage?: string | null,
): string {
  return getErrorMessage(path.auth(ENDPOINTS.AUTH.LOGIN), error, overrideMessage);
}

export type { ErrorCode } from "@/constants/errorMessages";

