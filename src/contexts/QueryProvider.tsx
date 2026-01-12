import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryClient } from "../services/queryClient";
import { useAuth } from "./AuthContext";

/**
 * QueryProvider component that wraps the app with TanStack Query
 * and integrates with AuthContext to invalidate queries on auth changes.
 *
 * This ensures that:
 * - Queries are automatically invalidated when users sign in/out
 * - User-specific data is refreshed when auth state changes
 * - Query cache is cleared on sign out for security
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Invalidate all queries when auth state changes
    // This ensures user-specific data is refreshed
    queryClient.invalidateQueries();

    // If user signs out, clear the entire query cache for security
    if (!isAuthenticated && !user) {
      queryClient.clear();
    }
  }, [isAuthenticated, user]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
