/**
 * EditModal Component
 * 
 * Modal for editing task details:
 * - Shows raw message at top (read-only)
 * - Editable fields: course, title, due date
 * - For quizzes: material, duration, time
 * - Save and Confirm buttons
 */

import React, { useState, useEffect } from "react";
import { theme } from "./theme";
import type { Task, TaskUpdateInput } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.colors.overlay,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    zIndex: theme.zIndex.modal,
    animation: "fadeIn 200ms ease",
  },
  modal: {
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    background: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.modal,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    animation: "slideUp 250ms ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    margin: 0,
  },
  closeButton: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.colors.surfaceHover,
    border: "none",
    borderRadius: theme.radius.full,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.lg,
    cursor: "pointer",
    transition: theme.transitions.fast,
  },
  body: {
    flex: 1,
    overflow: "auto",
    padding: theme.spacing.lg,
  },
  rawMessageSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: theme.spacing.sm,
  },
  rawMessage: {
    padding: theme.spacing.md,
    background: theme.colors.surface,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.mono,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    maxHeight: "120px",
    overflow: "auto",
    border: `1px solid ${theme.colors.border}`,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: theme.spacing.md,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text,
  },
  input: {
    width: "100%",
    padding: `${theme.spacing.md} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    outline: "none",
    transition: theme.transitions.fast,
    boxSizing: "border-box" as const,
  },
  inputFocused: {
    borderColor: theme.colors.brand,
    boxShadow: theme.shadows.focus,
  },
  select: {
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 12px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px 16px",
    paddingRight: theme.spacing.xl,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing.md,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderTop: `1px solid ${theme.colors.border}`,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.medium,
    borderRadius: theme.radius.md,
    border: "none",
    cursor: "pointer",
    transition: theme.transitions.fast,
    minHeight: "44px",
  },
  primaryButton: {
    background: theme.colors.brand,
    color: theme.colors.textInverse,
  },
  secondaryButton: {
    background: theme.colors.surfaceHover,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
  },
  successButton: {
    background: theme.colors.success,
    color: theme.colors.textInverse,
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  confidenceIndicator: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    background: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  confidenceBar: {
    flex: 1,
    height: "4px",
    background: theme.colors.border,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    transition: theme.transitions.normal,
  },
  confidenceText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    minWidth: "60px",
    textAlign: "right" as const,
  },
};

// Course options
const COURSES = [
  "AI-Driven Software Development",
  "Parallel & Distributed Computing",
  "Technology Entrepreneurship",
  "Computer Networks",
  "Advanced DBMS",
  "Theory of Automata",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface EditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: TaskUpdateInput) => Promise<void>;
  onConfirm?: (taskId: string) => Promise<void>;
}

export function EditModal({
  task,
  isOpen,
  onClose,
  onSave,
  onConfirm,
}: EditModalProps) {
  const [formData, setFormData] = useState<TaskUpdateInput>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        parsed_course: task.parsed_course || undefined,
        parsed_title: task.parsed_title || undefined,
        parsed_due_date: task.parsed_due_date
          ? formatDateForInput(new Date(task.parsed_due_date))
          : undefined,
        quiz_material: task.quiz_material || undefined,
        quiz_duration: task.quiz_duration || undefined,
        quiz_time: task.quiz_time || undefined,
      });
    }
  }, [task]);
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen || !task) return null;
  
  // Format date for datetime-local input
  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  // Handle input change
  const handleChange = (field: keyof TaskUpdateInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };
  
  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Convert date input back to ISO string
      const updates = { ...formData };
      if (updates.parsed_due_date) {
        updates.parsed_due_date = new Date(updates.parsed_due_date).toISOString();
      }
      
      await onSave(task._id, updates);
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle confirm (save + mark as confirmed)
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const updates = { ...formData };
      if (updates.parsed_due_date) {
        updates.parsed_due_date = new Date(updates.parsed_due_date).toISOString();
      }
      
      await onSave(task._id, updates);
      if (onConfirm) {
        await onConfirm(task._id);
      }
      onClose();
    } catch (error) {
      console.error("Failed to confirm task:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return theme.colors.success;
    if (confidence >= 0.5) return theme.taskColors.needsReview;
    return theme.colors.danger;
  };
  
  return (
    <div
      style={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 id="edit-modal-title" style={styles.headerTitle}>
            Edit {task.task_type === "quiz" ? "Quiz" : "Assignment"}
          </h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>
        
        {/* Body */}
        <div style={styles.body}>
          {/* Parse Confidence */}
          <div style={styles.confidenceIndicator}>
            <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textMuted }}>
              AI Confidence:
            </span>
            <div style={styles.confidenceBar}>
              <div
                style={{
                  ...styles.confidenceFill,
                  width: `${task.parse_confidence * 100}%`,
                  background: getConfidenceColor(task.parse_confidence),
                }}
              />
            </div>
            <span style={styles.confidenceText}>
              {Math.round(task.parse_confidence * 100)}%
            </span>
          </div>
          
          {/* Raw Message */}
          <div style={styles.rawMessageSection}>
            <div style={styles.sectionLabel}>Original Message</div>
            <div style={styles.rawMessage}>{task.raw_message}</div>
          </div>
          
          {/* Form */}
          <div style={styles.form}>
            {/* Course */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="course">
                Course
              </label>
              <select
                id="course"
                value={formData.parsed_course || ""}
                onChange={(e) => handleChange("parsed_course", e.target.value)}
                onFocus={() => setFocusedInput("course")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...styles.select,
                  ...(focusedInput === "course" ? styles.inputFocused : {}),
                }}
              >
                <option value="">Select a course</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Title */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.parsed_title || ""}
                onChange={(e) => handleChange("parsed_title", e.target.value)}
                onFocus={() => setFocusedInput("title")}
                onBlur={() => setFocusedInput(null)}
                placeholder="e.g., Assignment 2, Quiz 3"
                style={{
                  ...styles.input,
                  ...(focusedInput === "title" ? styles.inputFocused : {}),
                }}
              />
            </div>
            
            {/* Due Date */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="dueDate">
                Due Date & Time
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                value={formData.parsed_due_date || ""}
                onChange={(e) => handleChange("parsed_due_date", e.target.value)}
                onFocus={() => setFocusedInput("dueDate")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...(focusedInput === "dueDate" ? styles.inputFocused : {}),
                }}
              />
            </div>
            
            {/* Quiz-specific fields */}
            {task.task_type === "quiz" && (
              <>
                {/* Material */}
                <div style={styles.inputGroup}>
                  <label style={styles.label} htmlFor="material">
                    Material to Study
                  </label>
                  <input
                    id="material"
                    type="text"
                    value={formData.quiz_material || ""}
                    onChange={(e) => handleChange("quiz_material", e.target.value)}
                    onFocus={() => setFocusedInput("material")}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="e.g., Chapters 3-4, Slides 10-20"
                    style={{
                      ...styles.input,
                      ...(focusedInput === "material" ? styles.inputFocused : {}),
                    }}
                  />
                </div>
                
                {/* Duration & Time Row */}
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label} htmlFor="duration">
                      Duration
                    </label>
                    <input
                      id="duration"
                      type="text"
                      value={formData.quiz_duration || ""}
                      onChange={(e) => handleChange("quiz_duration", e.target.value)}
                      onFocus={() => setFocusedInput("duration")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="e.g., 2 hours"
                      style={{
                        ...styles.input,
                        ...(focusedInput === "duration" ? styles.inputFocused : {}),
                      }}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label} htmlFor="time">
                      Start Time
                    </label>
                    <input
                      id="time"
                      type="time"
                      value={formData.quiz_time || ""}
                      onChange={(e) => handleChange("quiz_time", e.target.value)}
                      onFocus={() => setFocusedInput("time")}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        ...styles.input,
                        ...(focusedInput === "time" ? styles.inputFocused : {}),
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div style={styles.footer}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            type="button"
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          
          {task.needs_review && onConfirm && (
            <button
              type="button"
              style={{
                ...styles.button,
                ...styles.successButton,
                ...(isLoading ? styles.buttonDisabled : {}),
              }}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Confirming..." : "✓ Confirm"}
            </button>
          )}
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default EditModal;
