import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env file."
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
