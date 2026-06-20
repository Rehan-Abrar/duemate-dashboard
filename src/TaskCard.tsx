/**
 * TaskCard Component
 * 
 * Displays a single task with:
 * - Type icon (📚 assignment, 📝 quiz)
 * - Course badge
 * - Title
 * - Due date with countdown
 * - Quiz-specific info (material, duration, time)
 * - "Needs Review" and "Duplicate" indicators
 * - Action buttons
 * 
 * Mobile: Larger touch targets, swipeable
 * Desktop: Compact row with hover state
 */

import React, { useState } from "react";
import { theme, getDeadlineColor, getDeadlineText } from "./theme";
import type { Task, TaskStatus } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    boxShadow: theme.shadows.card,
    transition: theme.transitions.normal,
    position: "relative" as const,
    overflow: "hidden",
  },
  cardHover: {
    background: theme.colors.surfaceHover,
    transform: "translateY(-2px)",
    boxShadow: theme.shadows.elevated,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  typeIcon: {
    fontSize: "2rem",
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    flexWrap: "wrap" as const,
  },
  courseBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    background: `${theme.colors.accent}25`,
    color: theme.colors.accent,
    borderRadius: theme.radius.pill,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.pill,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    textTransform: "uppercase" as const,
  },
  assignmentBadge: {
    background: `${theme.taskColors.assignment}25`,
    color: theme.taskColors.assignment,
  },
  quizBadge: {
    background: `${theme.taskColors.quiz}25`,
    color: theme.taskColors.quiz,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    lineHeight: theme.lineHeights.tight,
    marginBottom: theme.spacing.sm,
  },
  titleCompleted: {
    textDecoration: "line-through",
    color: theme.colors.textMuted,
  },
  dueDate: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.sm,
  },
  deadlineBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
  },
  dueDateText: {
    color: theme.colors.textMuted,
  },
  quizDetails: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    background: theme.colors.surface,
    borderRadius: theme.radius.md,
  },
  quizDetailItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.xs,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
  },
  quizDetailIcon: {
    fontSize: theme.fontSizes.sm,
  },
  banners: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column" as const,
  },
  needsReviewBanner: {
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    background: theme.taskColors.needsReview,
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    textAlign: "center" as const,
    cursor: "pointer",
  },
  courseUnresolvedBanner: {
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    background: theme.colors.accent,
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    textAlign: "center" as const,
    cursor: "pointer",
  },
  duplicateBanner: {
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    background: theme.colors.textMuted,
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    textAlign: "center" as const,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.border}`,
  },
  actionButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing.xs,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.medium,
    borderRadius: theme.radius.md,
    border: "none",
    cursor: "pointer",
    transition: theme.transitions.fast,
    minHeight: "44px", // Touch target
  },
  primaryAction: {
    background: theme.colors.brand,
    color: theme.colors.textInverse,
  },
  secondaryAction: {
    background: theme.colors.surfaceHover,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
  },
  dangerAction: {
    background: `${theme.colors.danger}20`,
    color: theme.colors.danger,
  },
  successAction: {
    background: `${theme.colors.success}20`,
    color: theme.colors.success,
  },
  rawMessage: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    background: theme.colors.surface,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    maxHeight: "100px",
    overflow: "auto",
  },
  expandButton: {
    padding: 0,
    background: "none",
    border: "none",
    color: theme.colors.brand,
    fontSize: theme.fontSizes.xs,
    cursor: "pointer",
    marginTop: theme.spacing.xs,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onConfirm: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({
  task,
  onEdit,
  onConfirm,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showRawMessage, setShowRawMessage] = useState(false);
  
  const isCompleted = task.status === "completed";
  const dueDate = task.parsed_due_date ? new Date(task.parsed_due_date) : null;
  const deadlineColor = getDeadlineColor(dueDate);
  const deadlineText = getDeadlineText(dueDate);
  
  // Format due date — omit time when it's the "end of day" default
  const formatDueDate = (date: Date) => {
    if (task.has_explicit_time === false) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  
  const showCourseUnresolved = !!task.course_unresolved;
  // date_uncertain is the precise flag; needs_review is the legacy fallback
  const showDateReview = !!(task.date_uncertain ?? task.needs_review);
  
  // Calculate padding for banners
  const bannerPadding =
    (showCourseUnresolved ? 28 : 0) +
    (showDateReview ? 28 : 0) +
    (task.is_potential_duplicate ? 24 : 0);
  
  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered && !isCompleted ? styles.cardHover : {}),
        ...(isCompleted ? styles.cardCompleted : {}),
        paddingTop: `calc(${theme.spacing.lg} + ${bannerPadding}px)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Banners */}
      <div style={styles.banners}>
        {showCourseUnresolved && (
          <div
            style={styles.courseUnresolvedBanner}
            onClick={() => onEdit(task)}
            role="button"
            tabIndex={0}
          >
            ❓ Course not detected — tap to set
          </div>
        )}
        {showDateReview && (
          <div
            style={styles.needsReviewBanner}
            onClick={() => onEdit(task)}
            role="button"
            tabIndex={0}
          >
            ⚠️ Date uncertain — click to review/fix details
          </div>
        )}
        {task.is_potential_duplicate && (
          <div style={styles.duplicateBanner}>
            🔁 Possible duplicate — check your other tasks
          </div>
        )}
      </div>
      
      {/* Header */}
      <div style={styles.header}>
        {/* Type Icon */}
        <div style={styles.typeIcon}>
          {task.task_type === "quiz" ? "📝" : "📚"}
        </div>
        
        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Top Row: Badges */}
          <div style={styles.topRow}>
            {task.parsed_course && (
              <span style={styles.courseBadge}>{task.parsed_course}</span>
            )}
            <span
              style={{
                ...styles.typeBadge,
                ...(task.task_type === "quiz"
                  ? styles.quizBadge
                  : styles.assignmentBadge),
              }}
            >
              {task.task_type}
            </span>
          </div>
          
          {/* Title */}
          <h3
            style={{
              ...styles.title,
              ...(isCompleted ? styles.titleCompleted : {}),
            }}
          >
            {task.parsed_title || "Untitled Task"}
          </h3>
          
          {/* Due Date */}
          <div style={styles.dueDate}>
            {dueDate && !isCompleted && (
              <span
                style={{
                  ...styles.deadlineBadge,
                  background: `${deadlineColor}25`,
                  color: deadlineColor,
                }}
              >
                {deadlineText}
              </span>
            )}
            <span style={styles.dueDateText}>
              {dueDate
                ? formatDueDate(dueDate)
                : "No due date set"}
            </span>
          </div>
          
          {/* Quiz Details */}
          {task.task_type === "quiz" &&
            (task.quiz_material || task.quiz_duration || task.quiz_time) && (
              <div style={styles.quizDetails}>
                {task.quiz_material && (
                  <div style={styles.quizDetailItem}>
                    <span style={styles.quizDetailIcon}>📖</span>
                    {task.quiz_material}
                  </div>
                )}
                {task.quiz_duration && (
                  <div style={styles.quizDetailItem}>
                    <span style={styles.quizDetailIcon}>⏱️</span>
                    {task.quiz_duration}
                  </div>
                )}
                {task.quiz_time && (
                  <div style={styles.quizDetailItem}>
                    <span style={styles.quizDetailIcon}>🕐</span>
                    {task.quiz_time}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
      
      {/* Raw Message (Expandable) */}
      {showRawMessage && (
        <div style={styles.rawMessage}>{task.raw_message}</div>
      )}
      <button
        style={styles.expandButton}
        onClick={() => setShowRawMessage(!showRawMessage)}
        type="button"
      >
        {showRawMessage ? "Hide original message" : "Show original message"}
      </button>
      
      {/* Actions */}
      <div style={styles.actions}>
        {/* Edit Button */}
        <button
          style={{ ...styles.actionButton, ...styles.secondaryAction }}
          onClick={() => onEdit(task)}
          type="button"
        >
          ✏️ Edit
        </button>
        
        {/* Confirm Button (only for needs_review) */}
        {task.needs_review && (
          <button
            style={{ ...styles.actionButton, ...styles.primaryAction }}
            onClick={() => onConfirm(task._id)}
            type="button"
          >
            ✅ Confirm
          </button>
        )}
        
        {/* Toggle Complete */}
        {!task.needs_review && (
          <button
            style={{
              ...styles.actionButton,
              ...(isCompleted ? styles.secondaryAction : styles.successAction),
            }}
            onClick={() =>
              onStatusChange(
                task._id,
                isCompleted ? "pending" : "completed"
              )
            }
            type="button"
          >
            {isCompleted ? "↩️ Undo" : "✓ Done"}
          </button>
        )}
        
        {/* Delete Button */}
        {onDelete && (
          <button
            style={{ ...styles.actionButton, ...styles.dangerAction }}
            onClick={() => {
              if (window.confirm("Delete this task? This cannot be undone.")) {
                onDelete(task._id);
              }
            }}
            type="button"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
