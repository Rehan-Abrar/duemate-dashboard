/**
 * DueMate API Client
 * 
 * Centralised API client for all backend communication.
 * 
 * Features:
 * - Automatic JWT attachment to requests
 * - Token refresh on 401 responses
 * - Human-friendly error mapping
 * - TypeScript type safety
 */

import type {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  AuthStartRequest,
  AuthStartResponse,
  AuthVerifyRequest,
  AuthVerifyResponse,
  AuthRefreshResponse,
  ApiError,
  User,
  SuccessResponse,
  CourseMapping,
  PushSubscription,
} from "./types";
import { getAuthTokens, setAuthTokens, clearAuth } from "./auth";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Human-friendly error messages for API error codes
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  unauthorized: "Please sign in to continue.",
  token_expired: "Your session has expired. Please sign in again.",
  otp_expired: "That code has expired. Request a new one and try again.",
  otp_invalid: "That code doesn't match. Double-check and try again.",
  otp_rate_limited: "Too many attempts. Please wait a few minutes.",
  
  // Task errors
  task_not_found: "That task couldn't be found. It may have been deleted.",
  parse_failed: "We couldn't read the message details. Please fill them in manually.",
  
  // Rate limiting
  too_many_requests: "You're making requests too quickly. Please wait a moment.",
  
  // Generic
  internal_error: "Something went wrong. Please try again.",
  network_error: "Unable to connect. Check your internet connection.",
};

// ─────────────────────────────────────────────────────────────────────────────
// HTTP CLIENT
// ─────────────────────────────────────────────────────────────────────────────

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  skipAuth?: boolean;
}

/**
 * Make an authenticated API request.
 * Handles token refresh automatically on 401 responses.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const { method, body, skipAuth = false } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (!skipAuth) {
    const { accessToken } = getAuthTokens();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }
  
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network error (server down, CORS, etc.)
    console.error("Network error:", err);
    throw new ApiClientError(
      "network_error",
      ERROR_MESSAGES.network_error
    );
  }
  
  // Handle token refresh on 401
  if (response.status === 401 && !skipAuth) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry with new token
      const { accessToken } = getAuthTokens();
      headers["Authorization"] = `Bearer ${accessToken}`;
      
      const retryResponse = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      return handleResponse<T>(retryResponse);
    } else {
      // Refresh failed, clear auth and throw
      clearAuth();
      throw new ApiClientError("unauthorized", "Please sign in again.");
    }
  }
  
  return handleResponse<T>(response);
}

/**
 * Handle API response, throwing friendly errors on failure.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiClientError(
        "network_error",
        ERROR_MESSAGES.network_error
      );
    }
    
    const friendlyMessage = 
      ERROR_MESSAGES[errorData.error] || 
      errorData.message || 
      ERROR_MESSAGES.internal_error;
    
    throw new ApiClientError(errorData.error, friendlyMessage, errorData.details);
  }
  
  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

/**
 * Attempt to refresh the access token using the refresh token.
 */
async function attemptTokenRefresh(): Promise<boolean> {
  const { refreshToken } = getAuthTokens();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) return false;
    
    const data: AuthRefreshResponse = await response.json();
    setAuthTokens(data.access_token, refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
  
  /**
   * Get retry delay for rate limit errors.
   */
  get retryAfterSeconds(): number | null {
    if (this.code === "too_many_requests" && this.details?.retry_after_seconds) {
      return this.details.retry_after_seconds as number;
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Request OTP to be sent via WhatsApp.
   */
  async start(data: AuthStartRequest): Promise<AuthStartResponse> {
    return apiRequest("/api/auth/start", {
      method: "POST",
      body: data,
      skipAuth: true,
    });
  },
  
  /**
   * Verify OTP and get access tokens.
   */
  async verify(data: AuthVerifyRequest): Promise<AuthVerifyResponse> {
    return apiRequest("/api/auth/verify", {
      method: "POST",
      body: data,
      skipAuth: true,
    });
  },
  
  /**
   * Refresh access token using refresh token.
   */
  async refresh(refreshToken: string): Promise<AuthRefreshResponse> {
    return apiRequest("/api/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      skipAuth: true,
    });
  },
  
  /**
   * Log out and invalidate refresh token.
   */
  async logout(): Promise<void> {
    const { refreshToken } = getAuthTokens();
    if (refreshToken) {
      try {
        await apiRequest("/api/auth/logout", {
          method: "POST",
          body: { refresh_token: refreshToken },
        });
      } catch {
        // Local logout should still proceed even if server-side revoke fails.
      }
    }
    clearAuth();
  },
  
  /**
   * Verify current session is valid.
   */
  async verifySession(): Promise<User> {
    return apiRequest("/api/user/verify", { method: "GET" });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TASKS API
// ─────────────────────────────────────────────────────────────────────────────

export const tasksApi = {
  /**
   * Get all tasks for the current user.
   */
  async getAll(): Promise<Task[]> {
    const response = await apiRequest<{ items: Task[] }>("/api/student/tasks", {
      method: "GET",
    });
    return response.items || [];
  },
  
  /**
   * Get a single task by ID.
   */
  async getById(id: string): Promise<Task> {
    const tasks = await this.getAll();
    const task = tasks.find((t) => t._id === id);
    if (!task) {
      throw new ApiClientError("task_not_found", ERROR_MESSAGES.task_not_found);
    }
    return task;
  },
  
  /**
   * Create a new task manually.
   */
  async create(data: TaskCreateInput): Promise<Task> {
    return apiRequest("/api/tasks", {
      method: "POST",
      body: data,
    });
  },
  
  /**
   * Update an existing task.
   */
  async update(id: string, data: TaskUpdateInput): Promise<Task> {
    const response = await apiRequest<{ item: Task }>(`/api/student/tasks/${id}`, {
      method: "PATCH",
      body: data,
    });
    return response.item;
  },
  
  /**
   * Confirm a task that was flagged for review.
   */
  async confirm(id: string): Promise<Task> {
    const response = await apiRequest<{ item: Task }>(`/api/student/tasks/${id}/confirm`, {
      method: "POST",
    });
    return response.item;
  },
  
  /**
   * Delete a task.
   */
  async delete(id: string): Promise<void> {
    await apiRequest(`/api/student/tasks/${id}`, { method: "DELETE" });
  },
  
  /**
   * Mark a task as completed.
   */
  async complete(id: string): Promise<Task> {
    return this.update(id, { status: "completed" });
  },
  
  /**
   * Mark a task as pending.
   */
  async uncomplete(id: string): Promise<Task> {
    return this.update(id, { status: "pending" });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// USER API
// ─────────────────────────────────────────────────────────────────────────────

export const userApi = {
  /**
   * Get current user profile.
   */
  async getProfile(): Promise<User> {
    return apiRequest("/api/user/profile", { method: "GET" });
  },
  
  /**
   * Update user settings.
   */
  async updateSettings(settings: Partial<User["settings"]>): Promise<User> {
    return apiRequest("/api/user/settings", {
      method: "PATCH",
      body: settings,
    });
  },
  
  /**
   * Register push subscription for web notifications.
   */
  async registerPush(subscription: PushSubscription): Promise<SuccessResponse> {
    return apiRequest("/api/user/push-subscription", {
      method: "POST",
      body: subscription,
    });
  },
  
  /**
   * Remove push subscription.
   */
  async unregisterPush(): Promise<SuccessResponse> {
    return apiRequest("/api/user/push-subscription", {
      method: "DELETE",
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COURSE MAPPINGS API
// ─────────────────────────────────────────────────────────────────────────────

export const courseMappingsApi = {
  /**
   * Get all course code mappings.
   */
  async getAll(): Promise<CourseMapping[]> {
    return apiRequest("/api/course-mappings", { method: "GET" });
  },
  
  /**
   * Add a new course code mapping.
   */
  async add(
    sourceKey: string, 
    canonicalCourse: string
  ): Promise<CourseMapping> {
    return apiRequest("/api/course-mappings", {
      method: "POST",
      body: { source_key: sourceKey, canonical_course: canonicalCourse },
    });
  },
  
  /**
   * Delete a course code mapping.
   */
  async delete(sourceKey: string): Promise<void> {
    return apiRequest(`/api/course-mappings/${encodeURIComponent(sourceKey)}`, {
      method: "DELETE",
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export default {
  auth: authApi,
  tasks: tasksApi,
  user: userApi,
  courseMappings: courseMappingsApi,
};
