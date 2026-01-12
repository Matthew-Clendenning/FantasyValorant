/**
 * Input sanitization utilities
 * Prevents XSS and ensures data integrity
 */

/**
 * Sanitizes text input by removing potentially dangerous characters
 * and enforcing length limits
 * 
 * @param input - The input string to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeTextInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes and control characters (except newlines and tabs for multiline)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // Enforce length limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitizes username input
 * Only allows alphanumeric characters and underscores
 * 
 * @param username - The username to sanitize
 * @returns Sanitized username
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== "string") {
    return "";
  }

  // Remove all non-alphanumeric characters except underscores
  return username.replace(/[^a-zA-Z0-9_]/g, "");
}

/**
 * Sanitizes email input
 * Basic validation and sanitization
 * 
 * @param email - The email to sanitize
 * @returns Sanitized email (lowercased and trimmed)
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  // Trim and lowercase
  return email.trim().toLowerCase();
}

/**
 * Sanitizes league/team name input
 * Allows letters, numbers, spaces, and common punctuation
 * 
 * @param name - The name to sanitize
 * @returns Sanitized name
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  // Allow letters, numbers, spaces, hyphens, apostrophes, and underscores
  return name.replace(/[^a-zA-Z0-9\s\-'_]/g, "").trim();
}

/**
 * Sanitizes description/textarea input
 * Removes HTML tags and dangerous characters
 * 
 * @param description - The description to sanitize
 * @param maxLength - Maximum length (default: 500)
 * @returns Sanitized description
 */
export function sanitizeDescription(description: string, maxLength: number = 500): string {
  if (!description || typeof description !== "string") {
    return "";
  }

  // Remove HTML tags
  let sanitized = description.replace(/<[^>]*>/g, "");

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:/gi, "");

  // Trim and enforce length
  sanitized = sanitized.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}
