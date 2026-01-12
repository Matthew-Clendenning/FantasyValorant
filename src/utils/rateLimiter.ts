/**
 * Client-side rate limiter for authentication attempts
 * Prevents brute force attacks by limiting attempt frequency
 */

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil: number | null;
}

// Store rate limit state in memory (resets on app restart)
const rateLimitStore = new Map<string, RateLimitState>();

// Configuration
const MAX_ATTEMPTS = 5; // Max attempts before lockout
const WINDOW_MS = 60 * 1000; // 1 minute window
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minute lockout after max attempts

/**
 * Check if an action is rate limited
 * @param key - Unique identifier for the rate limit (e.g., "login", "signup")
 * @returns Object with isLimited flag and optional waitTime in seconds
 */
export function checkRateLimit(key: string): {
  isLimited: boolean;
  waitTimeSeconds?: number;
  attemptsRemaining?: number;
} {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  // No previous attempts
  if (!state) {
    return { isLimited: false, attemptsRemaining: MAX_ATTEMPTS };
  }

  // Check if currently locked out
  if (state.lockedUntil && now < state.lockedUntil) {
    const waitTimeSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    return { isLimited: true, waitTimeSeconds };
  }

  // Reset if lockout expired
  if (state.lockedUntil && now >= state.lockedUntil) {
    rateLimitStore.delete(key);
    return { isLimited: false, attemptsRemaining: MAX_ATTEMPTS };
  }

  // Check if window has expired (reset attempts)
  if (now - state.firstAttemptTime > WINDOW_MS) {
    rateLimitStore.delete(key);
    return { isLimited: false, attemptsRemaining: MAX_ATTEMPTS };
  }

  // Within window, check attempts
  const attemptsRemaining = MAX_ATTEMPTS - state.attempts;
  return { isLimited: false, attemptsRemaining };
}

/**
 * Record an authentication attempt
 * @param key - Unique identifier for the rate limit
 * @returns Object with isLimited flag if limit was just reached
 */
export function recordAttempt(key: string): {
  isLimited: boolean;
  waitTimeSeconds?: number;
} {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  // First attempt
  if (!state) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttemptTime: now,
      lockedUntil: null,
    });
    return { isLimited: false };
  }

  // Window expired, start fresh
  if (now - state.firstAttemptTime > WINDOW_MS) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttemptTime: now,
      lockedUntil: null,
    });
    return { isLimited: false };
  }

  // Increment attempts
  state.attempts += 1;

  // Check if max attempts reached
  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_MS;
    const waitTimeSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return { isLimited: true, waitTimeSeconds };
  }

  return { isLimited: false };
}

/**
 * Clear rate limit for a key (e.g., after successful login)
 * @param key - Unique identifier for the rate limit
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Format wait time for display
 * @param seconds - Wait time in seconds
 * @returns Human-readable string
 */
export function formatWaitTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}
