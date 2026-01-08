import AsyncStorage from "@react-native-async-storage/async-storage";

const WELCOME_KEY_PREFIX = "hasLoggedInBefore_";

/**
 * Check if a user has logged in before
 */
export async function hasUserLoggedInBefore(userId: string): Promise<boolean> {
  try {
    const key = `${WELCOME_KEY_PREFIX}${userId}`;
    const value = await AsyncStorage.getItem(key);
    return value === "true";
  } catch {
    return false;
  }
}

/**
 * Mark that a user has logged in (call after showing first welcome)
 */
export async function markUserAsLoggedIn(userId: string): Promise<void> {
  try {
    const key = `${WELCOME_KEY_PREFIX}${userId}`;
    await AsyncStorage.setItem(key, "true");
  } catch {
    // Silently fail - not critical
  }
}

/**
 * Clear login status (useful for testing or account deletion)
 */
export async function clearUserLoginStatus(userId: string): Promise<void> {
  try {
    const key = `${WELCOME_KEY_PREFIX}${userId}`;
    await AsyncStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}
