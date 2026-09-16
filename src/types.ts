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
  timetable_section?: string | null;
  available_sections?: string[];
  /** Academic identity — used to resolve the official (admin-published) timetable. */
  university_id?: string | null;
  academic_term?: string | null;
  program?: string | null;
  semester?: number | null;
}

// ── Official timetable discovery (onboarding) ──────────────────────────────────

export interface TimetableTermOption {
  academic_term: string;
  sections: string[];
}

export interface TimetableUniversityOption {
  university_id: string;
  terms: TimetableTermOption[];
}

export interface TimetableOptionsResponse {
  items: TimetableUniversityOption[];
  count: number;
}

export interface TimetableAvailableResponse {
  available: boolean;
  timetable_id?: string;
  version?: number;
  university_id?: string;
  academic_term?: string;
}

export interface TimetableDiff {
  added: string[];
  removed: string[];
  changed: string[];
  counts: { added: number; removed: number; changed: number };
}

export interface AdminTimetableVersion {
  version_id: string;
  timetable_id: string;
  university_id: string;
  academic_term: string;
  version: number;
  status: "draft" | "published" | string;
  effective_from?: string | null;
  effective_to?: string | null;
  detected_sections: string[];
  uploaded_at?: string | null;
  uploaded_by?: string | null;
}

export interface AdminTimetableUploadResponse {
  version_id: string;
  timetable_id: string;
  version: number;
  status: string;
  detected_sections: string[];
  diff: TimetableDiff;
}

export interface AdminTimetableReviewResponse {
  version_id: string;
  timetable_id: string;
  version: number;
  status: string;
  detected_sections: string[];
  diff: TimetableDiff;
  slot_counts: Record<string, number>;
}

export interface AdminLoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  user: {
    user_id: string;
    username: string;
    is_admin: boolean;
  };
}

export interface AdminInboxSummary {
  total_contacts: number;
  total_messages: number;
  recent_contacts: number;
  messages_today: number;
  recent_days: number;
}

export interface AdminInboxContact {
  wa_id: string;
  profile_name: string | null;
  last_seen: string | null;
  updated_at: string | null;
  message_count: number;
  latest_text: string;
  latest_at: string | null;
}

export interface AdminInboxContactsResponse {
  items: AdminInboxContact[];
  count: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminInboxMessage {
  message_id: string;
  from: string;
  from_name: string | null;
  to?: string | null;
  text: string;
  type: string;
  timestamp: string | null;
  received_at: string | null;
  delivery_status?: string | null;
}

export interface AdminUsersSummary {
  total_users: number;
  active_users: number;
  official_timetable: number;
  self_uploaded_timetable: number;
  no_timetable: number;
  recent_days: number;
}

export type AdminTimetableSource = "official" | "self_upload" | "none";

export interface AdminUserRow {
  user_id: string;
  phone_number: string | null;
  wa_id: string | null;
  profile_name: string | null;
  university: string | null;
  program: string | null;
  semester: string | number | null;
  section: string | null;
  academic_term: string | null;
  timetable_source: AdminTimetableSource;
  last_seen: string | null;
  created_at: string | null;
  updated_at: string | null;
  message_count: number;
  task_count: number;
}

export interface AdminUsersResponse {
  items: AdminUserRow[];
  count: number;
  page: number;
  limit: number;
  pages: number;
  sort: string;
}

export interface AdminUserDetail extends AdminUserRow {
  settings: Record<string, unknown>;
  contact: {
    wa_id: string | null;
    profile_name: string | null;
    last_seen: string | null;
    linked: boolean;
  };
  timetable: {
    source: string | null;
    section: string | null;
    academic_term: string | null;
    version: number | null;
    has_timetable: boolean;
    status: string | null;
  };
  recent_tasks: Array<{
    id: string;
    title: string | null;
    course: string | null;
    due_date: string | null;
    task_type: string | null;
    status: string | null;
  }>;
}

export interface AdminInboxMessagesResponse {
  contact: {
    wa_id: string;
    profile_name: string | null;
    last_seen: string | null;
    updated_at: string | null;
    message_count: number;
  };
  items: AdminInboxMessage[];
  count: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminAiProviderCount {
  provider: string | null;
  credential_slot: string | null;
  model: string | null;
  label: string;
  count: number;
}

export interface AdminAiSummary {
  requests: number;
  successful: number;
  failed: number;
  avg_latency_ms: number | null;
  fallbacks: number;
  providers: AdminAiProviderCount[];
  since: string | null;
  until: string | null;
}

export interface AdminAiCallRow {
  call_id: string;
  created_at: string | null;
  user_id: string | null;
  profile_name: string | null;
  wa_id: string | null;
  channel: string | null;
  stage: string;
  caller: string | null;
  intent: string | null;
  action: string | null;
  query_type: string | null;
  task_type: string | null;
  model: string | null;
  provider: string | null;
  credential_slot: string | null;
  provider_label: string;
  used_fallback: boolean;
  fallback_reason: string | null;
  fallback_attempts?: number;
  error_type?: string | null;
  success: boolean;
  latency_ms: number | null;
  prompt_version: string | null;
  parse_method: string | null;
  request_id: string | null;
}

export interface AdminAiCallsResponse {
  items: AdminAiCallRow[];
  count: number;
  page: number;
  limit: number;
  pages: number;
  since: string | null;
  until: string | null;
}

export interface AdminAiCallDetail extends AdminAiCallRow {
  error: string | null;
  confidence: number | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  user_message_len: number;
  system_prompt_hash: string | null;
  related: AdminAiCallRow[];
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
  message?: string;
  detail?: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// TIMETABLE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TimetableSlot {
  day: string;
  time: string;
  start_time?: string;
  end_time?: string;
  course: string;
  room?: string;
  teacher?: string;
  section?: string;
}

/**
 * The timetable JSON structure returned by GET /api/student/timetable.
 * The exact shape depends on the backend RAG data; this is a flexible wrapper.
 */
export type TimetableData = Record<string, unknown> | TimetableSlot[];

// ─────────────────────────────────────────────────────────────────────────────
// AI ASSISTANT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AssistantChatResponse {
  reply: string;
  intent: string;
}
