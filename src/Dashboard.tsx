/**
 * Dashboard Page
 * 
 * Main task management view:
 * - Overdue tasks pinned at top
 * - "Needs Review" tasks pinned second
 * - Remaining tasks sorted by due date
 * - Empty states for each section
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { theme } from "./theme";
import { TaskCard } from "./TaskCard";
import { EditModal } from "./EditModal";
import { Filters } from "./Filters";
import { tasksApi, ApiClientError } from "./api";
import { getCachedUser, handleLogout } from "./auth";
import type {
  Task,
  TaskFilters,
  TaskStatus,
  TaskUpdateInput,
  User,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: theme.colors.surface,
    fontFamily: theme.fonts.body,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
    background: theme.colors.surfaceElevated,
    borderBottom: `1px solid ${theme.colors.border}`,
    position: "sticky" as const,
    top: 0,
    zIndex: theme.zIndex.sticky,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  logoIcon: {
    fontSize: "1.75rem",
  },
  logoText: {
    fontSize: theme.fontSizes["2xl"],
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.brand,
  },
  userMenu: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  userName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  logoutButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textMuted,
    background: "transparent",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    cursor: "pointer",
    transition: theme.transitions.fast,
  },
  main: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  sectionBadge: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    borderRadius: theme.radius.pill,
  },
  overdueBadge: {
    background: `${theme.taskColors.overdue}25`,
    color: theme.taskColors.overdue,
  },
  reviewBadge: {
    background: `${theme.taskColors.needsReview}25`,
    color: theme.taskColors.needsReview,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing["2xl"],
    background: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    textAlign: "center" as const,
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    maxWidth: "300px",
    lineHeight: theme.lineHeights.relaxed,
  },
  loading: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing["3xl"],
    color: theme.colors.textMuted,
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: `3px solid ${theme.colors.border}`,
    borderTopColor: theme.colors.brand,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: theme.spacing.md,
  },
  error: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: theme.spacing.xl,
    background: `${theme.colors.danger}15`,
    borderRadius: theme.radius.lg,
    textAlign: "center" as const,
  },
  errorIcon: {
    fontSize: "2.5rem",
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textInverse,
    background: theme.colors.brand,
    border: "none",
    borderRadius: theme.radius.md,
    cursor: "pointer",
  },
  refreshButton: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.brand,
    background: "transparent",
    border: `1px solid ${theme.colors.brand}`,
    borderRadius: theme.radius.md,
    cursor: "pointer",
    transition: theme.transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function isOverdue(task: Task): boolean {
  if (!task.parsed_due_date || task.status === "completed") return false;
  return new Date(task.parsed_due_date) < new Date();
}

function isDueToday(task: Task): boolean {
  if (!task.parsed_due_date || task.status === "completed") return false;
  const due = new Date(task.parsed_due_date);
  const today = new Date();
  return (
    due.getDate() === today.getDate() &&
    due.getMonth() === today.getMonth() &&
    due.getFullYear() === today.getFullYear()
  );
}

function isDueThisWeek(task: Task): boolean {
  if (!task.parsed_due_date || task.status === "completed") return false;
  const due = new Date(task.parsed_due_date);
  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  return due >= today && due <= weekFromNow;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    type: "all",
    status: "all",
    sort: "due_asc",
  });
  
  const user: User | null = getCachedUser();
  
  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to load tasks. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // Compute task counts
  const taskCounts = useMemo(() => {
    return {
      all: tasks.length,
      assignments: tasks.filter((t) => t.task_type === "assignment").length,
      quizzes: tasks.filter((t) => t.task_type === "quiz").length,
      needsReview: tasks.filter((t) => t.needs_review).length,
      overdue: tasks.filter(isOverdue).length,
      dueToday: tasks.filter(isDueToday).length,
      thisWeek: tasks.filter(isDueThisWeek).length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);
  
  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    // Filter by type
    if (filters.type !== "all") {
      result = result.filter((t) => t.task_type === filters.type);
    }
    
    // Filter by status
    switch (filters.status) {
      case "needs_review":
        result = result.filter((t) => t.needs_review);
        break;
      case "overdue":
        result = result.filter(isOverdue);
        break;
      case "due_today":
        result = result.filter(isDueToday);
        break;
      case "this_week":
        result = result.filter(isDueThisWeek);
        break;
      case "completed":
        result = result.filter((t) => t.status === "completed");
        break;
    }
    
    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case "due_asc":
          if (!a.parsed_due_date) return 1;
          if (!b.parsed_due_date) return -1;
          return new Date(a.parsed_due_date).getTime() - new Date(b.parsed_due_date).getTime();
        case "due_desc":
          if (!a.parsed_due_date) return 1;
          if (!b.parsed_due_date) return -1;
          return new Date(b.parsed_due_date).getTime() - new Date(a.parsed_due_date).getTime();
        case "created_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    
    return result;
  }, [tasks, filters]);
  
  // Separate tasks into sections
  const overdueTasks = useMemo(
    () => filteredTasks.filter(isOverdue),
    [filteredTasks]
  );
  
  const needsReviewTasks = useMemo(
    () => filteredTasks.filter((t) => t.needs_review && !isOverdue(t)),
    [filteredTasks]
  );
  
  const upcomingTasks = useMemo(
    () => filteredTasks.filter((t) => !t.needs_review && !isOverdue(t) && t.status !== "completed"),
    [filteredTasks]
  );
  
  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "completed"),
    [filteredTasks]
  );
  
  // Handle filter change
  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  
  // Handle task edit
  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };
  
  // Handle task save
  const handleSave = async (taskId: string, updates: TaskUpdateInput) => {
    const updated = await tasksApi.update(taskId, updates);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? updated : t))
    );
  };
  
  // Handle task confirm
  const handleConfirm = async (taskId: string) => {
    const confirmed = await tasksApi.confirm(taskId);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? confirmed : t))
    );
  };
  
  // Handle status change
  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const updated = await tasksApi.update(taskId, { status });
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? updated : t))
    );
  };
  
  // Handle task delete
  const handleDelete = async (taskId: string) => {
    await tasksApi.delete(taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };
  
  // Handle logout
  const handleLogoutClick = () => {
    handleLogout();
    onLogout();
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📚</span>
          <span style={styles.logoText}>DueMate</span>
        </div>
        
        <div style={styles.userMenu}>
          {user && (
            <span style={styles.userName}>{user.phone_number}</span>
          )}
          <button
            style={styles.logoutButton}
            onClick={handleLogoutClick}
            type="button"
          >
            Log Out
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={styles.main}>
        {/* Filters */}
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          taskCounts={taskCounts}
        />
        
        {/* Loading State */}
        {isLoading && (
          <div style={styles.loading}>
            <div style={styles.loadingSpinner} />
            <span>Loading your tasks...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && !isLoading && (
          <div style={styles.error}>
            <div style={styles.errorIcon}>😕</div>
            <div style={styles.errorTitle}>Unable to load tasks</div>
            <div style={styles.errorMessage}>{error}</div>
            <button
              style={styles.retryButton}
              onClick={fetchTasks}
              type="button"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Tasks */}
        {!isLoading && !error && (
          <>
            {/* Refresh Button */}
            <div style={{ ...styles.sectionHeader, marginBottom: theme.spacing.lg }}>
              <span style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textMuted }}>
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
              </span>
              <button
                style={styles.refreshButton}
                onClick={fetchTasks}
                type="button"
              >
                ↻ Refresh
              </button>
            </div>
            
            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>
                    🚨 Overdue
                    <span style={{ ...styles.sectionBadge, ...styles.overdueBadge }}>
                      {overdueTasks.length}
                    </span>
                  </h2>
                </div>
                {overdueTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEdit}
                    onConfirm={handleConfirm}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
            
            {/* Needs Review Section */}
            {needsReviewTasks.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>
                    ⚠️ Needs Review
                    <span style={{ ...styles.sectionBadge, ...styles.reviewBadge }}>
                      {needsReviewTasks.length}
                    </span>
                  </h2>
                </div>
                {needsReviewTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEdit}
                    onConfirm={handleConfirm}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
            
            {/* Upcoming Section */}
            {upcomingTasks.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>📅 Upcoming</h2>
                </div>
                {upcomingTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEdit}
                    onConfirm={handleConfirm}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
            
            {/* Completed Section */}
            {filters.status === "completed" && completedTasks.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>✅ Completed</h2>
                </div>
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEdit}
                    onConfirm={handleConfirm}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {filteredTasks.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <div style={styles.emptyTitle}>
                  {filters.status === "all" && filters.type === "all"
                    ? "No tasks yet"
                    : "No matching tasks"}
                </div>
                <div style={styles.emptyDescription}>
                  {filters.status === "all" && filters.type === "all"
                    ? "Forward an assignment or quiz message to your DueMate bot on WhatsApp to get started."
                    : "Try adjusting your filters to see more tasks."}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Edit Modal */}
      <EditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSave}
        onConfirm={handleConfirm}
      />
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
