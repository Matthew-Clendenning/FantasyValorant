import { createClient, PostgrestError } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { Database } from "../types/database";

// Re-export common types for convenience
export type Tables = Database["public"]["Tables"];
export type TableName = keyof Tables;

// Re-export PostgrestError for use in error handling
export type { PostgrestError };

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env file."
  );
}

// Security: Enforce HTTPS for all Supabase connections
if (!supabaseUrl.startsWith("https://")) {
  throw new Error(
    "Security violation: Supabase URL must use HTTPS. HTTP connections are not allowed."
  );
}

/**
 * Check if we're in a browser environment (not SSR/Node.js)
 */
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

/**
 * Secure storage adapter for Supabase auth tokens.
 * Uses expo-secure-store on native platforms and localStorage on web.
 * Falls back to in-memory storage during SSR.
 */
const memoryStorage = new Map<string, string>();

const secureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      if (isBrowser) {
        return localStorage.getItem(key);
      }
      // SSR fallback - return from memory
      return memoryStorage.get(key) ?? null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (isBrowser) {
        localStorage.setItem(key, value);
      } else {
        // SSR fallback - store in memory
        memoryStorage.set(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (isBrowser) {
        localStorage.removeItem(key);
      } else {
        // SSR fallback - remove from memory
        memoryStorage.delete(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * Supabase client configured with:
 * - Secure token storage (expo-secure-store on native, localStorage on web)
 * - Auto token refresh
 * - Persistent sessions
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Type-safe database operations
 *
 * These helpers handle the type casting required due to manual Database type definitions.
 * When types are auto-generated via `npx supabase gen types typescript`, these can be simplified.
 */
export const db = {
  /**
   * Insert a row into a table with proper typing
   */
  insert: <T extends TableName>(
    table: T,
    data: Tables[T]["Insert"]
  ) => {
    return supabase.from(table).insert(data as never);
  },

  /**
   * Insert a row and return the inserted data
   */
  insertAndReturn: async <T extends TableName>(
    table: T,
    data: Tables[T]["Insert"]
  ): Promise<{ data: Tables[T]["Row"] | null; error: PostgrestError | null }> => {
    const result = await supabase.from(table).insert(data as never).select().single();
    return result as { data: Tables[T]["Row"] | null; error: PostgrestError | null };
  },

  /**
   * Insert a row and return specific columns
   */
  insertAndSelect: async <T extends TableName>(
    table: T,
    data: Tables[T]["Insert"],
    columns: string
  ): Promise<{ data: Partial<Tables[T]["Row"]> | null; error: PostgrestError | null }> => {
    const result = await supabase.from(table).insert(data as never).select(columns).single();
    return result as { data: Partial<Tables[T]["Row"]> | null; error: PostgrestError | null };
  },

  /**
   * Update rows in a table with proper typing
   */
  update: <T extends TableName>(
    table: T,
    data: Tables[T]["Update"]
  ) => {
    return supabase.from(table).update(data as never);
  },

  /**
   * Select from a table (pass-through for typed queries)
   */
  from: <T extends TableName>(table: T) => {
    return supabase.from(table);
  },
};
