/**
 * DueMate Auth Utilities
 * 
 * Client-side authentication state management.
 * Handles token storage, retrieval, and session validation.
 */

import type { AuthVerifyResponse, User } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  ACCESS_TOKEN: "duemate_access_token",
  REFRESH_TOKEN: "duemate_refresh_token",
  USER: "duemate_user",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current auth tokens from localStorage.
 */
export function getAuthTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  };
}

/**
 * Store auth tokens in localStorage.
 */
export function setAuthTokens(
  accessToken: string,
  refreshToken: string
): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

/**
 * Clear all auth data from localStorage.
 */
export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get cached user from localStorage.
 */
export function getCachedUser(): User | null {
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

/**
 * Cache user in localStorage.
 */
export function setCachedUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if user is currently authenticated.
 * This only checks if tokens exist, not if they're valid.
 */
export function isAuthenticated(): boolean {
  const { accessToken } = getAuthTokens();
  return !!accessToken;
}

/**
 * Process successful login response.
 */
export function handleLoginSuccess(response: AuthVerifyResponse): void {
  setAuthTokens(response.access_token, response.refresh_token);
  setCachedUser(response.user);
}

/**
 * Handle logout by clearing all auth state.
 */
export function handleLogout(): void {
  clearAuth();
}

// ─────────────────────────────────────────────────────────────────────────────
// PHONE NUMBER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize phone number to E.164 format.
 * Assumes Pakistan country code (+92) if not provided.
 */
export function normalizePhoneNumber(phone: string): string {
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // Keep explicit international input (e.g., +923001234567).
  if (raw.startsWith("+")) {
    return `+${digits}`;
  }

  // Support 00-prefixed international numbers.
  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }

  // Don't duplicate Pakistan country code if user types 92... without +.
  if (digits.startsWith("92")) {
    return `+${digits}`;
  }

  // Local Pakistani format (03xx...) -> +92...
  if (digits.startsWith("0")) {
    return `+92${digits.slice(1)}`;
  }

  // Fallback: treat as a local Pakistan number without trunk prefix.
  return `+92${digits}`;
}

/**
 * Format phone number for display.
 */
export function formatPhoneNumber(phone: string): string {
  // Remove the +92 prefix for display
  if (phone.startsWith("+92")) {
    const local = "0" + phone.slice(3);
    // Format as 0xxx-xxxxxxx
    if (local.length === 11) {
      return `${local.slice(0, 4)}-${local.slice(4)}`;
    }
    return local;
  }
  return phone;
}

/**
 * Validate phone number format.
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // E.164 format: + followed by 10-15 digits
  return /^\+\d{10,15}$/.test(normalized);
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN VALIDATION & SILENT REFRESH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a JWT token is expired.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check if exp exists and if it's expired (with 30 second buffer)
    return payload.exp * 1000 < Date.now() + 30000;
  } catch {
    return true;
  }
}

/**
 * Get a valid access token, attempting silent refresh if needed.
 * Returns null if user needs to re-authenticate.
 */
export async function getValidToken(): Promise<string | null> {
  const { accessToken, refreshToken } = getAuthTokens();
  
  // Access token exists and not expired — use it
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }
  
  // Refresh token is opaque (not JWT). If it's missing, user must login.
  if (!refreshToken) {
    clearAuth();
    return null;
  }
  
  // Try silent refresh
  try {
    const apiUrl = (
      import.meta.env.VITE_API_URL || "https://duemate-backend-31qm.onrender.com"
    ).replace(/\/$/, "");
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      clearAuth();
      return null;
    }
    
    const data = await response.json();
    const newAccessToken = data.access_token;
    
    // Update access token in storage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
    
    return newAccessToken;
  } catch (error) {
    console.error("Silent refresh failed:", error);
    clearAuth();
    return null;
  }
}
