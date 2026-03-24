import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://duemate-backend-31qm.onrender.com";
const STORAGE_TOKEN_KEY = "duemate.session.token";
const STORAGE_THEME_KEY = "duemate.theme";

const THEME_META = {
  midnight: { label: "Black + Purple", icon: "Moon" },
  campus: { label: "White + Green", icon: "Leaf" },
};

function formatDateTime(value) {
  if (!value) {
    return "No due date";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }
  return date.toLocaleString();
}

function dueState(task) {
  const due = task?.parsed_due_date ? new Date(task.parsed_due_date) : null;
  if (!due || Number.isNaN(due.getTime())) {
    return "no_due";
  }
  const diffHours = (due.getTime() - Date.now()) / (1000 * 60 * 60);
  if (diffHours < 0) {
    return "past_due";
  }
  if (diffHours <= 24) {
    return "urgent";
  }
  if (diffHours <= 72) {
    return "soon";
  }
  return "upcoming";
}

function courseAccent(course) {
  const palette = ["#7c3aed", "#0ea5e9", "#16a34a", "#d97706", "#dc2626", "#0f766e", "#8b5cf6", "#0891b2"];
  const key = String(course || "UNSET");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

async function apiFetch(path, options = {}, token = "") {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  return response;
}

function TopBar({ token, onLogout, theme, onThemeChange }) {
  const location = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand-wrap">
          <div className="brand-dot" />
          <div>
            <p className="brand-title">DueMate</p>
            <p className="brand-sub">Student and Operations Console</p>
          </div>
        </div>

        <nav className="route-nav">
          <Link className={location.pathname.startsWith("/student") ? "active" : ""} to="/student/dashboard">
            Student
          </Link>
          <Link className={location.pathname.startsWith("/admin") ? "active" : ""} to="/admin">
            Admin
          </Link>
        </nav>

        <div className="topbar-actions">
          <select value={theme} onChange={(event) => onThemeChange(event.target.value)}>
            {Object.entries(THEME_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.icon} {meta.label}
              </option>
            ))}
          </select>

          {token ? (
            <button type="button" className="ghost-button" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <Link className="ghost-button link-button" to="/student/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function StudentLogin({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitAuth(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const response = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ phone_number: phoneNumber, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to continue");
      }

      const payload = await response.json();
      onAuthSuccess(payload);
    } catch (requestError) {
      setError(requestError.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="screen auth-screen">
      <section className="auth-panel card-float">
        <p className="eyebrow">Student Access</p>
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="muted">Use your WhatsApp number and password. One account per number.</p>

        <div className="mode-switch">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={submitAuth}>
          <label>
            WhatsApp Number
            <input
              type="tel"
              placeholder="923001234567"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="At least 8 characters"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

function StudentDashboard({ token, currentUser, onUnauthorized }) {
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [defaultCourses, setDefaultCourses] = useState([]);
  const [filters, setFilters] = useState({ window: "upcoming", type: "all", attention: "all" });
  const [editingTaskId, setEditingTaskId] = useState("");
  const [editDraft, setEditDraft] = useState({ parsed_title: "", parsed_course: "", parsed_due_date: "" });
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [busyTaskId, setBusyTaskId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudentData() {
    try {
      const [tasksRes, remindersRes, coursesRes] = await Promise.all([
        apiFetch("/api/student/tasks?limit=200", {}, token),
        apiFetch("/api/student/reminders", {}, token),
        apiFetch("/api/courses/default"),
      ]);

      if (tasksRes.status === 401 || remindersRes.status === 401) {
        onUnauthorized();
        return;
      }
      if (!tasksRes.ok) {
        throw new Error("Could not load tasks");
      }

      const tasksPayload = await tasksRes.json();
      const remindersPayload = remindersRes.ok ? await remindersRes.json() : { items: [] };
      const coursesPayload = coursesRes.ok ? await coursesRes.json() : { items: [] };

      setTasks(Array.isArray(tasksPayload.items) ? tasksPayload.items : []);
      setReminders(Array.isArray(remindersPayload.items) ? remindersPayload.items : []);
      setDefaultCourses(Array.isArray(coursesPayload.items) ? coursesPayload.items : []);
      setError("");
    } catch {
      setError("Unable to load your dashboard data right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadStudentData();
    const intervalId = setInterval(() => {
      if (active) {
        loadStudentData();
      }
    }, 15000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [token]);

  const visibleTasks = useMemo(() => {
    const now = Date.now();
    return tasks.filter((task) => {
      if (filters.type !== "all" && task.task_type !== filters.type) {
        return false;
      }
      if (filters.attention === "unresolved" && !task.course_unresolved) {
        return false;
      }
      if (filters.attention === "review" && !task.needs_review) {
        return false;
      }

      const due = task.parsed_due_date ? new Date(task.parsed_due_date).getTime() : null;
      if (filters.window === "past_due") {
        return due && due < now;
      }
      if (filters.window === "upcoming") {
        return !due || due >= now;
      }
      return true;
    });
  }, [tasks, filters]);

  const pinnedTasks = visibleTasks.filter((item) => item.course_unresolved || item.needs_review);
  const normalTasks = visibleTasks.filter((item) => !item.course_unresolved && !item.needs_review);

  async function updateTaskStatus(taskId, status) {
    setBusyTaskId(taskId);
    try {
      const response = await apiFetch(
        `/api/student/tasks/${taskId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        token,
      );
      if (!response.ok) {
        throw new Error();
      }
      await loadStudentData();
    } catch {
      setError("Task update failed.");
    } finally {
      setBusyTaskId("");
    }
  }

  async function confirmTask(taskId) {
    setBusyTaskId(taskId);
    try {
      const response = await apiFetch(`/api/student/tasks/${taskId}/confirm`, { method: "POST" }, token);
      if (!response.ok) {
        throw new Error();
      }
      await loadStudentData();
    } catch {
      setError("Task confirmation failed.");
    } finally {
      setBusyTaskId("");
    }
  }

  async function assignCourse(task) {
    const draft = assignmentDrafts[task._id] || {};
    if (!draft.course_code) {
      return;
    }
    setBusyTaskId(task._id);
    try {
      const response = await apiFetch(
        `/api/student/tasks/${task._id}/assign-course`,
        {
          method: "POST",
          body: JSON.stringify({
            course_code: draft.course_code,
            apply_to_source: Boolean(draft.apply_to_source),
          }),
        },
        token,
      );
      if (!response.ok) {
        throw new Error();
      }
      await loadStudentData();
    } catch {
      setError("Course assignment failed.");
    } finally {
      setBusyTaskId("");
    }
  }

  async function saveEdit(taskId) {
    setBusyTaskId(taskId);
    try {
      const response = await apiFetch(
        `/api/student/tasks/${taskId}`,
        {
          method: "PATCH",
          body: JSON.stringify(editDraft),
        },
        token,
      );
      if (!response.ok) {
        throw new Error();
      }
      setEditingTaskId("");
      await loadStudentData();
    } catch {
      setError("Could not save task edits.");
    } finally {
      setBusyTaskId("");
    }
  }

  return (
    <main className="screen student-screen">
      <section className="student-header card-float">
        <div>
          <p className="eyebrow">Student Dashboard</p>
          <h1>Your semester workbench</h1>
          <p className="muted">
            Logged in as {currentUser?.phone_number || "unknown"}. Unresolved and review-required tasks stay pinned on top.
          </p>
        </div>
        <div className="reminder-badges">
          <span>{reminders.length} due soon</span>
          <span>{tasks.filter((task) => task.course_unresolved).length} unresolved</span>
          <span>{tasks.filter((task) => task.needs_review).length} needs review</span>
        </div>
      </section>

      <section className="filter-bar card-float">
        <label>
          Time
          <select value={filters.window} onChange={(event) => setFilters((prev) => ({ ...prev, window: event.target.value }))}>
            <option value="upcoming">Upcoming</option>
            <option value="past_due">Past Due</option>
            <option value="all">All</option>
          </select>
        </label>
        <label>
          Type
          <select value={filters.type} onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}>
            <option value="all">All</option>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
          </select>
        </label>
        <label>
          Focus
          <select
            value={filters.attention}
            onChange={(event) => setFilters((prev) => ({ ...prev, attention: event.target.value }))}
          >
            <option value="all">All tasks</option>
            <option value="unresolved">Only unresolved</option>
            <option value="review">Only needs review</option>
          </select>
        </label>
      </section>

      {error ? <p className="error-text inline-error">{error}</p> : null}
      {loading ? <p className="muted">Loading your tasks...</p> : null}

      <section className="task-columns">
        <article className="task-group">
          <h2>Priority Queue</h2>
          {pinnedTasks.length === 0 ? <p className="muted">No unresolved or review tasks.</p> : null}
          {pinnedTasks.map((task) => {
            const currentDraft = assignmentDrafts[task._id] || {};
            const isForwardUnknown = task.source_key === "forwarded:unknown";
            return (
              <article key={task._id} className={`task-card ${dueState(task)}`}>
                <div className="task-card-head">
                  <span className="course-pill" style={{ backgroundColor: courseAccent(task.parsed_course) }}>
                    {task.parsed_course || "Unassigned"}
                  </span>
                  <span className="due-pill">{formatDateTime(task.parsed_due_date)}</span>
                </div>

                <h3>{task.parsed_title || "Untitled task"}</h3>
                <p className="task-meta">{task.task_type || "assignment"}</p>
                <p className="task-raw">{task.raw_message || "No source message available."}</p>

                <div className="attention-row">
                  {task.course_unresolved ? <span className="attention unresolved">Course unresolved</span> : null}
                  {task.needs_review ? <span className="attention review">Needs review</span> : null}
                </div>

                {task.course_unresolved ? (
                  <div className="assign-grid">
                    <select
                      value={currentDraft.course_code || ""}
                      onChange={(event) =>
                        setAssignmentDrafts((prev) => ({
                          ...prev,
                          [task._id]: {
                            ...(prev[task._id] || {}),
                            course_code: event.target.value,
                          },
                        }))
                      }
                    >
                      <option value="">Select course</option>
                      {defaultCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={Boolean(currentDraft.apply_to_source) && !isForwardUnknown}
                        disabled={isForwardUnknown}
                        onChange={(event) =>
                          setAssignmentDrafts((prev) => ({
                            ...prev,
                            [task._id]: {
                              ...(prev[task._id] || {}),
                              apply_to_source: event.target.checked,
                            },
                          }))
                        }
                      />
                      Apply mapping for future source messages
                    </label>

                    <button
                      type="button"
                      className="primary-button"
                      disabled={!currentDraft.course_code || busyTaskId === task._id}
                      onClick={() => assignCourse(task)}
                    >
                      {busyTaskId === task._id ? "Saving..." : "Assign course"}
                    </button>
                  </div>
                ) : null}

                <div className="quick-actions">
                  <button type="button" className="ghost-button" disabled={busyTaskId === task._id} onClick={() => confirmTask(task._id)}>
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    disabled={busyTaskId === task._id}
                    onClick={() => updateTaskStatus(task._id, "completed")}
                  >
                    Mark Complete
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setEditingTaskId(task._id);
                      setEditDraft({
                        parsed_title: task.parsed_title || "",
                        parsed_course: task.parsed_course || "",
                        parsed_due_date: task.parsed_due_date ? task.parsed_due_date.slice(0, 16) : "",
                      });
                    }}
                  >
                    Edit
                  </button>
                </div>

                {editingTaskId === task._id ? (
                  <div className="edit-grid">
                    <input
                      type="text"
                      value={editDraft.parsed_title}
                      onChange={(event) => setEditDraft((prev) => ({ ...prev, parsed_title: event.target.value }))}
                      placeholder="Task title"
                    />
                    <input
                      type="text"
                      value={editDraft.parsed_course}
                      onChange={(event) => setEditDraft((prev) => ({ ...prev, parsed_course: event.target.value }))}
                      placeholder="Course code"
                    />
                    <input
                      type="datetime-local"
                      value={editDraft.parsed_due_date}
                      onChange={(event) => setEditDraft((prev) => ({ ...prev, parsed_due_date: event.target.value }))}
                    />
                    <div className="quick-actions">
                      <button type="button" className="primary-button" onClick={() => saveEdit(task._id)}>
                        Save
                      </button>
                      <button type="button" className="ghost-button" onClick={() => setEditingTaskId("")}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </article>

        <article className="task-group">
          <h2>All Filtered Tasks</h2>
          {normalTasks.length === 0 ? <p className="muted">No tasks match the selected filters.</p> : null}
          {normalTasks.map((task) => (
            <article key={task._id} className={`task-card ${dueState(task)}`}>
              <div className="task-card-head">
                <span className="course-pill" style={{ backgroundColor: courseAccent(task.parsed_course) }}>
                  {task.parsed_course || "No course"}
                </span>
                <span className="due-pill">{formatDateTime(task.parsed_due_date)}</span>
              </div>
              <h3>{task.parsed_title || "Untitled task"}</h3>
              <p className="task-meta">{task.task_type || "assignment"} | {task.status || "pending"}</p>
              <div className="quick-actions">
                <button type="button" className="ghost-button" onClick={() => updateTaskStatus(task._id, "pending")}>
                  Reopen
                </button>
                <button type="button" className="ghost-button" onClick={() => updateTaskStatus(task._id, "completed")}>
                  Mark Complete
                </button>
              </div>
            </article>
          ))}
        </article>
      </section>
    </main>
  );
}

function AdminDashboard() {
  const [health, setHealth] = useState({ status: "loading" });
  const [messages, setMessages] = useState([]);
  const [delivery, setDelivery] = useState({ summary: [], recent_events: [] });
  const [unresolvedTasks, setUnresolvedTasks] = useState([]);
  const [defaultCourses, setDefaultCourses] = useState([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [assigningTaskId, setAssigningTaskId] = useState("");
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [healthRes, messagesRes, deliveryRes, unresolvedRes, coursesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/health`),
          fetch(`${API_BASE_URL}/api/messages/recent?limit=12`),
          fetch(`${API_BASE_URL}/api/delivery-status`),
          fetch(`${API_BASE_URL}/api/tasks?course_unresolved=true&limit=20`),
          fetch(`${API_BASE_URL}/api/courses/default`),
        ]);
        if (!active) {
          return;
        }
        setHealth(healthRes.ok ? await healthRes.json() : { status: "offline" });
        setMessages(messagesRes.ok ? (await messagesRes.json()).items || [] : []);
        setDelivery(deliveryRes.ok ? await deliveryRes.json() : { summary: [], recent_events: [] });
        const unresolved = unresolvedRes.ok ? (await unresolvedRes.json()).items || [] : [];
        setUnresolvedTasks(unresolved.filter((item) => item?.course_unresolved === true));
        setDefaultCourses(coursesRes.ok ? (await coursesRes.json()).items || [] : []);
      } catch {
        if (active) {
          setDataError("Admin stream unavailable.");
        }
      }
    }
    load();
    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  async function assignCourse(task) {
    const draft = assignmentDrafts[task._id] || {};
    if (!draft.course_code) {
      return;
    }
    setAssigningTaskId(task._id);
    try {
      const response = await apiFetch(`/api/tasks/${task._id}/assign-course`, {
        method: "POST",
        body: JSON.stringify({ course_code: draft.course_code, apply_to_source: Boolean(draft.apply_to_source) }),
      });
      if (!response.ok) {
        throw new Error();
      }
      setUnresolvedTasks((prev) => prev.filter((item) => item._id !== task._id));
    } catch {
      setDataError("Unable to assign course from admin queue.");
    } finally {
      setAssigningTaskId("");
    }
  }

  const summaryItems = Array.isArray(delivery.summary) ? delivery.summary : [];

  return (
    <main className="screen admin-screen">
      <section className="admin-layout">
        <article className="admin-card card-float">
          <h1>Admin Operations</h1>
          <p>Webhook health, delivery telemetry, and unresolved source queue.</p>
          <div className="status-row">
            <span>Backend</span>
            <span className={`badge ${health.status}`}>{health.status}</span>
          </div>
          <div className="chips">
            {summaryItems.map((item) => (
              <span key={`${item.status}-${item.count}`} className="chip">
                {item.status}: {item.count}
              </span>
            ))}
          </div>
          {dataError ? <p className="error-text">{dataError}</p> : null}
        </article>

        <article className="admin-card card-float">
          <h2>Unresolved Queue</h2>
          {unresolvedTasks.length === 0 ? <p className="muted">No unresolved tasks.</p> : null}
          {unresolvedTasks.map((task) => {
            const draft = assignmentDrafts[task._id] || {};
            const sourceKnown = task.source_key && task.source_key !== "forwarded:unknown";
            return (
              <div key={task._id} className="admin-resolve-item">
                <p className="resolve-title">{task.parsed_title || "Untitled"}</p>
                <p className="muted small">{task.source_key || "unknown source"}</p>
                <select
                  value={draft.course_code || ""}
                  onChange={(event) =>
                    setAssignmentDrafts((prev) => ({
                      ...prev,
                      [task._id]: {
                        ...(prev[task._id] || {}),
                        course_code: event.target.value,
                      },
                    }))
                  }
                >
                  <option value="">Select course</option>
                  {defaultCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.apply_to_source) && sourceKnown}
                    disabled={!sourceKnown}
                    onChange={(event) =>
                      setAssignmentDrafts((prev) => ({
                        ...prev,
                        [task._id]: {
                          ...(prev[task._id] || {}),
                          apply_to_source: event.target.checked,
                        },
                      }))
                    }
                  />
                  Apply to source
                </label>
                <button
                  type="button"
                  className="primary-button"
                  disabled={!draft.course_code || assigningTaskId === task._id}
                  onClick={() => assignCourse(task)}
                >
                  {assigningTaskId === task._id ? "Saving..." : "Assign"}
                </button>
              </div>
            );
          })}
        </article>

        <article className="admin-card card-float">
          <h2>Recent Messages</h2>
          <div className="admin-stream">
            {messages.map((message) => (
              <div key={message.message_id || `${message.from}-${message.timestamp}`} className="stream-row">
                <strong>{message.from || "unknown"}</strong>
                <p>{message.text || "(no text)"}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/student/login" replace />;
  }
  return children;
}

function AppRouter() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY) || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_THEME_KEY) || "midnight");

  useEffect(() => {
    if (!theme || !THEME_META[theme]) {
      setTheme("midnight");
      return;
    }
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    async function loadMe() {
      if (!token) {
        setCurrentUser(null);
        return;
      }
      const response = await apiFetch("/api/auth/me", {}, token);
      if (!active) {
        return;
      }
      if (response.ok) {
        const payload = await response.json();
        setCurrentUser(payload.user || null);
      } else {
        setToken("");
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_TOKEN_KEY);
      }
    }
    loadMe();
    return () => {
      active = false;
    };
  }, [token]);

  async function handleLogout() {
    if (token) {
      await apiFetch("/api/auth/logout", { method: "POST" }, token).catch(() => null);
    }
    setToken("");
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    navigate("/student/login", { replace: true });
  }

  function handleAuthSuccess(payload) {
    const nextToken = payload?.token || "";
    if (!nextToken) {
      return;
    }
    setToken(nextToken);
    setCurrentUser(payload.user || null);
    localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
    navigate("/student/dashboard", { replace: true });
  }

  return (
    <div className="app-shell">
      <TopBar token={token} onLogout={handleLogout} theme={theme} onThemeChange={setTheme} />

      <Routes>
        <Route path="/" element={<Navigate to={token ? "/student/dashboard" : "/student/login"} replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student/login" element={<StudentLogin onAuthSuccess={handleAuthSuccess} />} />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute token={token}>
              <StudentDashboard token={token} currentUser={currentUser} onUnauthorized={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
