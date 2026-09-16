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
  TimetableData,
  TimetableOptionsResponse,
  TimetableAvailableResponse,
  AssistantChatResponse,
  AdminLoginResponse,
  AdminTimetableUploadResponse,
  AdminTimetableReviewResponse,
  AdminTimetableVersion,
  AdminInboxSummary,
  AdminInboxContactsResponse,
  AdminInboxMessagesResponse,
  AdminUsersSummary,
  AdminUsersResponse,
  AdminUserDetail,
} from "./types";
import { getAuthTokens, setAuthTokens, clearAuth, getAdminToken, setAdminSession } from "./auth";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://duemate-backend-31qm.onrender.com"
).replace(/\/$/, "");

// Human-friendly error messages for API error codes
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  unauthorized: "Please sign in to continue.",
  token_expired: "Your session has expired. Please sign in again.",
  otp_expired: "That code has expired. Request a new one and try again.",
  otp_invalid: "That code doesn't match. Double-check and try again.",
  otp_rate_limited: "Too many attempts. Please wait a few minutes.",
  whatsapp_window_closed: "Please message the DueMate bot on WhatsApp first, then request a code again.",
  
  // Task errors
  task_not_found: "That task couldn't be found. It may have been deleted.",
  parse_failed: "We couldn't read the message details. Please check the message contains a clear assignment or quiz announcement.",
  duplicate_task: "This task has already been saved to your list.",
  
  // Rate limiting
  too_many_requests: "You're making requests too quickly. Please wait a moment.",
  
  // Generic
  internal_error: "Something went wrong. Please try again.",
  network_error: "Unable to connect. Check your internet connection.",

  // Timetable errors
  no_file: "No file was provided. Please select a PDF.",
  empty_file: "The selected file appears to be empty.",
  file_too_large: "The PDF is too large. Maximum size is 20 MB.",
  invalid_pdf: "This file could not be opened as a PDF.",
  unsupported_layout: "This PDF doesn't look like a supported Riphah timetable. Please upload the official grid-format timetable PDF.",
  no_sections_found: "No class sections were found in this PDF.",
  timetable_parse_failed: "We couldn't parse the timetable. Please check it is a supported Riphah grid-format PDF.",
  no_timetable_uploaded: "No timetable uploaded yet. Please upload a PDF first.",
  invalid_section: "That section was not found in your timetable.",
  invalid_credentials: "Admin username or password is incorrect.",
  forbidden: "Admin access denied.",
  missing_token: "Admin session expired. Turn Admin Mode on again.",
  already_published: "This timetable version is already published.",
  parse_invalid: "This version has no detected sections and cannot be published.",
  missing_fields: "University and academic term are required.",
  database_unavailable: "The database is temporarily unavailable. Try again shortly.",
  not_found: "That record could not be found.",
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
      const statusHint =
        response.status === 404
          ? "This admin API is not available on the server yet."
          : response.status >= 500
            ? "The server had a problem handling this request."
            : `Request failed (${response.status}).`;
      throw new ApiClientError(`http_${response.status}`, statusHint);
    }
    
    const friendlyMessage = 
      ERROR_MESSAGES[errorData.error] || 
      errorData.message ||
      errorData.detail ||
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
   * Extract a task from a raw text message using AI extraction.
   */
  async extract(message: string): Promise<Task> {
    const response = await apiRequest<{ item: Task }>("/api/student/tasks/extract", {
      method: "POST",
      body: { message },
    });
    return response.item;
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
// TIMETABLE API
// ─────────────────────────────────────────────────────────────────────────────

export const timetableApi = {
  /**
   * Fetch the authenticated user's active timetable (selected section only).
   * Returns an empty array if no timetable has been uploaded/selected.
   */
  async get(): Promise<TimetableData> {
    return apiRequest<TimetableData>("/api/student/timetable", {
      method: "GET",
    });
  },

  /**
   * Upload a timetable PDF and parse all sections.
   * Uses raw fetch (not apiRequest) because multipart/form-data must not
   * have Content-Type set manually — the browser sets it with the boundary.
   */
  async upload(file: File): Promise<{ sections: string[] }> {
    const { accessToken } = getAuthTokens();
    const form = new FormData();
    form.append("file", file);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/student/timetable/upload`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: form,
      });
    } catch {
      throw new ApiClientError("network_error", ERROR_MESSAGES.network_error);
    }

    return handleResponse<{ sections: string[] }>(response);
  },

  /**
   * List universities / terms / sections available from published official
   * (admin-managed) timetables. Used by onboarding to offer a section without
   * requiring the student to upload a PDF.
   */
  async getOptions(): Promise<TimetableOptionsResponse> {
    return apiRequest<TimetableOptionsResponse>("/api/timetable/options", {
      method: "GET",
    });
  },

  /**
   * Check whether a published + effective official timetable covers a section.
   */
  async checkAvailable(
    section: string,
    opts?: { universityId?: string; term?: string }
  ): Promise<TimetableAvailableResponse> {
    const params = new URLSearchParams({ section });
    if (opts?.universityId) params.set("university_id", opts.universityId);
    if (opts?.term) params.set("term", opts.term);
    return apiRequest<TimetableAvailableResponse>(
      `/api/timetable/available?${params.toString()}`,
      { method: "GET" }
    );
  },

  /**
   * Select the user's active section.
   * Official path: published timetable covering the section (no PDF required).
   * Self-upload fallback: a previously uploaded PDF.
   */
  async selectSection(
    section: string,
    opts?: { universityId?: string; academicTerm?: string }
  ): Promise<{ section: string; slots: number; source?: string }> {
    const body: Record<string, string> = { section };
    if (opts?.universityId) body.university_id = opts.universityId;
    if (opts?.academicTerm) body.academic_term = opts.academicTerm;
    return apiRequest<{ section: string; slots: number; source?: string }>(
      "/api/student/timetable/select",
      { method: "POST", body }
    );
  },

  /**
   * Download the timetable as a PNG image.
   * Returns a Blob containing the image data.
   */
  async downloadImage(): Promise<Blob> {
    const { accessToken } = getAuthTokens();
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/student/timetable/image`, {
        method: "GET",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch {
      throw new ApiClientError("network_error", ERROR_MESSAGES.network_error);
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiClientError(
        data.error || "unknown_error",
        data.detail || ERROR_MESSAGES.unknown_error
      );
    }

    return response.blob();
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AI ASSISTANT API
// ─────────────────────────────────────────────────────────────────────────────

export const assistantApi = {
  /**
   * Send a message to the AI academic assistant.
   */
  async chat(message: string): Promise<AssistantChatResponse> {
    return apiRequest<AssistantChatResponse>("/api/student/assistant/chat", {
      method: "POST",
      body: { message },
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN TIMETABLE API (uses the admin JWT, never the student token)
// ─────────────────────────────────────────────────────────────────────────────

async function adminRequest<T>(
  endpoint: string,
  options: { method: "GET" | "POST"; body?: unknown } = { method: "GET" }
): Promise<T> {
  const token = getAdminToken();
  if (!token) {
    throw new ApiClientError("missing_token", ERROR_MESSAGES.missing_token);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiClientError("network_error", ERROR_MESSAGES.network_error);
  }

  return handleResponse<T>(response);
}

export const adminTimetableApi = {
  async login(username: string, password: string): Promise<AdminLoginResponse> {
    const result = await apiRequest<AdminLoginResponse>("/api/admin/login", {
      method: "POST",
      body: { username, password },
      skipAuth: true,
    });
    setAdminSession(result.token, result.expires_at);
    return result;
  },

  async upload(
    file: File,
    universityId: string,
    academicTerm: string
  ): Promise<AdminTimetableUploadResponse> {
    const token = getAdminToken();
    if (!token) {
      throw new ApiClientError("missing_token", ERROR_MESSAGES.missing_token);
    }
    const form = new FormData();
    form.append("file", file);
    form.append("university_id", universityId);
    form.append("academic_term", academicTerm);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/admin/timetable/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
    } catch {
      throw new ApiClientError("network_error", ERROR_MESSAGES.network_error);
    }
    return handleResponse<AdminTimetableUploadResponse>(response);
  },

  async versions(timetableId?: string): Promise<{ items: AdminTimetableVersion[]; count: number }> {
    const qs = timetableId ? `?timetable_id=${encodeURIComponent(timetableId)}` : "";
    return adminRequest(`/api/admin/timetable/versions${qs}`);
  },

  async review(versionId: string): Promise<AdminTimetableReviewResponse> {
    return adminRequest(`/api/admin/timetable/${encodeURIComponent(versionId)}/review`);
  },

  async publish(
    versionId: string,
    effectiveFrom?: string
  ): Promise<{ version_id: string; version: number; status: string; effective_from: string }> {
    return adminRequest(`/api/admin/timetable/${encodeURIComponent(versionId)}/publish`, {
      method: "POST",
      body: effectiveFrom ? { effective_from: effectiveFrom } : {},
    });
  },

  async rollback(
    versionId: string
  ): Promise<{ version_id: string; version: number; status: string; effective_from: string }> {
    return adminRequest(`/api/admin/timetable/${encodeURIComponent(versionId)}/rollback`, {
      method: "POST",
      body: {},
    });
  },
};

export const adminUsersApi = {
  async summary(): Promise<AdminUsersSummary> {
    return adminRequest("/api/admin/users/summary");
  },

  async list(params: {
    q?: string;
    university?: string;
    program?: string;
    semester?: string;
    section?: string;
    timetable_source?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<AdminUsersResponse> {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.university) qs.set("university", params.university);
    if (params.program) qs.set("program", params.program);
    if (params.semester) qs.set("semester", params.semester);
    if (params.section) qs.set("section", params.section);
    if (params.timetable_source) qs.set("timetable_source", params.timetable_source);
    if (params.sort) qs.set("sort", params.sort);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return adminRequest(`/api/admin/users${suffix}`);
  },

  async detail(userId: string): Promise<AdminUserDetail> {
    return adminRequest(`/api/admin/users/${encodeURIComponent(userId)}`);
  },
};

export const adminInboxApi = {
  async summary(): Promise<AdminInboxSummary> {
    return adminRequest("/api/admin/inbox/summary");
  },

  async contacts(params: {
    q?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<AdminInboxContactsResponse> {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return adminRequest(`/api/admin/inbox/contacts${suffix}`);
  },

  async messages(
    waId: string,
    params: {
      q?: string;
      since?: string;
      until?: string;
      sort?: "newest" | "oldest";
      page?: number;
      limit?: number;
    } = {}
  ): Promise<AdminInboxMessagesResponse> {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.since) qs.set("since", params.since);
    if (params.until) qs.set("until", params.until);
    if (params.sort) qs.set("sort", params.sort);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return adminRequest(
      `/api/admin/inbox/contacts/${encodeURIComponent(waId)}/messages${suffix}`
    );
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
  timetable: timetableApi,
  assistant: assistantApi,
  adminTimetable: adminTimetableApi,
  adminInbox: adminInboxApi,
  adminUsers: adminUsersApi,
};
