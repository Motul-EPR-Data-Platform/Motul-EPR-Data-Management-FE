/**
 * @deprecated This hook is deprecated. Use `useAuth` from `@/contexts/AuthContext` instead.
 * This file is kept for backwards compatibility but should not be used in new code.
 *
 * The real authentication context is now in `src/contexts/AuthContext.tsx`
 * and properly stores the full user role (e.g., "Motul Admin") in localStorage.
 */
import { useAuth as useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  // Re-export from AuthContext to maintain backwards compatibility
  return useAuthContext();
}
