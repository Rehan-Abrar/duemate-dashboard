/**
 * DueMate TypeScript Type Definitions
 * 
 * These types mirror the MongoDB schema and API contracts.
 * Keep in sync with backend models.
 */

// ─────────────────────────────────────────────────────────────────────────────
// USER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  phone_number: string;
  user_id: string;
  push_subscription_object?: PushSubscription | null;
  created_at: string;
  settings: UserSettings;
}

export interface UserSettings {
  reminder_hours_before: number;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type TaskType = "assignment" | "quiz";
export type TaskStatus = "pending" | "completed" | "needs_review";

export interface Task {
  _id: string;
  user_id: string;
  task_type: TaskType;
  raw_message: string;
  fingerprint: string;
  is_potential_duplicate: boolean;
  parsed_course: string | null;
  parsed_title: string | null;
  parsed_due_date: string | null;
  quiz_material: string | null;
  quiz_duration: string | null;
  quiz_time: string | null;
  parse_confidence: number;
  needs_review: boolean;
  course_unresolved?: boolean;
  date_uncertain?: boolean;
  has_explicit_time?: boolean;
  status: TaskStatus;
  created_at: string;
  corrected_at: string | null;
  groq_raw_response?: Record<string, unknown>;
}

export interface TaskCreateInput {
  raw_message: string;
  task_type?: TaskType;
  parsed_course?: string;
  parsed_title?: string;
  parsed_due_date?: string;
  quiz_material?: string;
  quiz_duration?: string;
  quiz_time?: string;
}

export interface TaskUpdateInput {
  parsed_course?: string;
  parsed_title?: string;
  parsed_due_date?: string;
  quiz_material?: string;
  quiz_duration?: string;
  quiz_time?: string;
  status?: TaskStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER & SORT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type FilterType = "all" | "assignment" | "quiz";
export type FilterStatus = 
  | "all" 
  | "needs_review" 
  | "overdue" 
  | "due_today" 
  | "this_week" 
  | "completed";
export type SortOption = "due_asc" | "due_desc" | "created_desc";

export interface TaskFilters {
  type: FilterType;
  status: FilterStatus;
  sort: SortOption;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthStartRequest {
  phone_number: string;
}

export interface AuthStartResponse {
  message: string;
  phone_number: string;
  expires_in_seconds: number;
}

export interface AuthVerifyRequest {
  phone_number: string;
  otp: string;
}

export interface AuthVerifyResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthRefreshRequest {
  refresh_token: string;
}

export interface AuthRefreshResponse {
  access_token: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// API ERROR TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface RateLimitError extends ApiError {
  error: "too_many_requests";
  details: {
    retry_after_seconds: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ParseStats {
  total_parses: number;
  groq_success_rate: number;
  fallback_rate: number;
  average_confidence: number;
  confidence_histogram: Record<string, number>;
}

export interface UserStats {
  total_users: number;
  active_last_7_days: number;
}

export interface TaskStats {
  total_tasks: number;
  by_type: {
    assignment: number;
    quiz: number;
  };
  by_status: {
    pending: number;
    completed: number;
    needs_review: number;
  };
  overdue: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PROP TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onConfirm: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export interface EditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: TaskUpdateInput) => Promise<void>;
}

export interface FiltersProps {
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  taskCounts: {
    all: number;
    assignments: number;
    quizzes: number;
    needsReview: number;
    overdue: number;
    dueToday: number;
  };
}

export interface LoginPageProps {
  onLoginSuccess: (response: AuthVerifyResponse) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API response wrapper for paginated results.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Generic API response for success messages.
 */
export interface SuccessResponse {
  message: string;
}

/**
 * Course code mapping entry.
 */
export interface CourseMapping {
  source_key: string;
  canonical_course: string;
  created_at: string;
}
