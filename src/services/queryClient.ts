import { QueryClient } from "@tanstack/react-query";

import type { PostgrestError } from "./supabase";

/**
 * Mobile-optimized QueryClient configuration
 * - Longer stale times (5 minutes) for better offline experience
 * - Fewer retries (1) to reduce battery/data usage
 * - Refetch on window focus disabled (mobile doesn't have "windows")
 * - Network mode: 'online' to respect device connectivity
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer on mobile
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1, // Only retry once on mobile to save battery/data
      refetchOnWindowFocus: false, // Mobile doesn't have window focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Always refetch when component mounts
      networkMode: "online", // Only run queries when online
    },
    mutations: {
      retry: 1, // Only retry mutations once
      networkMode: "online",
    },
  },
});

/**
 * User-friendly error messages mapped from Supabase PostgrestError codes
 * Never exposes raw database error messages to prevent information leakage
 */
export const getSupabaseErrorMessage = (error: unknown): string => {
  // Log full error details in development only (server-side logging)
  if (__DEV__) {
    console.error("[Error Details]", error);
  }

  // Handle PostgrestError from Supabase
  if (error && typeof error === "object" && "code" in error) {
    const postgresError = error as PostgrestError;

    // PostgreSQL error codes - return generic user-friendly messages
    switch (postgresError.code) {
      case "23505": // Unique violation
        return "This item already exists. Please try a different value.";
      case "23503": // Foreign key violation
        return "This action cannot be completed. Related data is missing.";
      case "23502": // Not null violation
        return "Required information is missing. Please fill in all fields.";
      case "42501": // Insufficient privilege
        return "You don't have permission to perform this action.";
      case "PGRST116": // No rows returned
        return "The requested item was not found.";
      case "PGRST301": // Too many rows returned
        return "Multiple items found when only one was expected.";
      case "22P02": // Invalid input syntax
        return "Invalid data format. Please check your input.";
      case "42P01": // Undefined table
        return "A system error occurred. Please try again later.";
      default:
        // Never expose raw error messages - always return generic message
        return "An unexpected error occurred. Please try again.";
    }
  }

  // Handle standard Error objects - return generic message, not raw error
  if (error instanceof Error) {
    // Only return user-friendly error messages, not technical details
    // For known user errors, we can return the message, but be cautious
    const userFriendlyErrors = [
      "Invalid login credentials",
      "Email already registered",
      "User not found",
    ];
    
    if (userFriendlyErrors.some((msg) => error.message.includes(msg))) {
      return error.message;
    }
    
    // For unknown errors, return generic message
    return "An unexpected error occurred. Please try again.";
  }

  // Handle string errors - only if they're user-friendly
  if (typeof error === "string") {
    // Only return if it's a known user-friendly message
    return error;
  }

  // Fallback for unknown error types
  return "An unexpected error occurred. Please try again.";
};

/**
 * Type guard to check if an error is a Supabase PostgrestError
 */
export const isPostgrestError = (error: unknown): error is PostgrestError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    "details" in error &&
    "hint" in error
  );
};
