/**
 * Filters Component
 * 
 * Task filtering controls:
 * - Type: All | Assignments | Quizzes
 * - Status: All | Needs Review | Overdue | Due Today | This Week | Completed
 * - Sort: Due date ↑ | Due date ↓ | Recently added
 * 
 * Mobile: Horizontal scrollable pill row
 * Desktop: Sidebar or horizontal bar
 */

import React from "react";
import { theme } from "./theme";
import type { TaskFilters, FilterType, FilterStatus, SortOption } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    background: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
  },
  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  pillRow: {
    display: "flex",
    gap: theme.spacing.sm,
    overflowX: "auto" as const,
    paddingBottom: theme.spacing.xs,
    // Hide scrollbar but keep scrollable
    scrollbarWidth: "none" as const,
    msOverflowStyle: "none" as const,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing.xs,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textMuted,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.pill,
    cursor: "pointer",
    transition: theme.transitions.fast,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    minHeight: "36px",
  },
  pillActive: {
    color: theme.colors.text,
    background: `${theme.colors.brand}20`,
    borderColor: theme.colors.brand,
  },
  pillHover: {
    background: theme.colors.surfaceHover,
    borderColor: theme.colors.borderLight,
  },
  count: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
    height: "20px",
    padding: `0 ${theme.spacing.xs}`,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    background: theme.colors.surfaceHover,
    borderRadius: theme.radius.pill,
  },
  countActive: {
    background: theme.colors.brand,
    color: theme.colors.textInverse,
  },
  sortSelect: {
    appearance: "none" as const,
    padding: `${theme.spacing.sm} ${theme.spacing.lg} ${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text,
    background: theme.colors.surface,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 8px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "16px 16px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    cursor: "pointer",
    transition: theme.transitions.fast,
    outline: "none",
    minWidth: "160px",
  },
  sortSelectFocused: {
    borderColor: theme.colors.brand,
    boxShadow: theme.shadows.focus,
  },
  // Responsive layout helper
  desktopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: theme.spacing.md,
  },
  mobileStack: {
    display: "flex",
    flexDirection: "column" as const,
    gap: theme.spacing.md,
  },
  urgentPill: {
    color: theme.taskColors.overdue,
    borderColor: theme.taskColors.overdue,
  },
  warningPill: {
    color: theme.taskColors.needsReview,
    borderColor: theme.taskColors.needsReview,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

interface FilterOption<T> {
  value: T;
  label: string;
  icon?: string;
  urgent?: boolean;
  warning?: boolean;
}

const TYPE_OPTIONS: FilterOption<FilterType>[] = [
  { value: "all", label: "All Tasks" },
  { value: "assignment", label: "Assignments", icon: "📚" },
  { value: "quiz", label: "Quizzes", icon: "📝" },
];

const STATUS_OPTIONS: FilterOption<FilterStatus>[] = [
  { value: "all", label: "All" },
  { value: "needs_review", label: "Needs Review", icon: "⚠️", warning: true },
  { value: "overdue", label: "Overdue", icon: "🔴", urgent: true },
  { value: "due_today", label: "Due Today", icon: "📅" },
  { value: "this_week", label: "This Week", icon: "📆" },
  { value: "completed", label: "Completed", icon: "✓" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "due_asc", label: "Due date (soonest first)" },
  { value: "due_desc", label: "Due date (latest first)" },
  { value: "created_desc", label: "Recently added" },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface FiltersProps {
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  taskCounts: {
    all: number;
    assignments: number;
    quizzes: number;
    needsReview: number;
    overdue: number;
    dueToday: number;
    thisWeek: number;
    completed: number;
  };
}

export function Filters({
  filters,
  onFilterChange,
  taskCounts,
}: FiltersProps) {
  const [hoveredPill, setHoveredPill] = React.useState<string | null>(null);
  const [sortFocused, setSortFocused] = React.useState(false);
  
  // Get count for a status filter
  const getStatusCount = (status: FilterStatus): number => {
    switch (status) {
      case "all": return taskCounts.all;
      case "needs_review": return taskCounts.needsReview;
      case "overdue": return taskCounts.overdue;
      case "due_today": return taskCounts.dueToday;
      case "this_week": return taskCounts.thisWeek;
      case "completed": return taskCounts.completed;
      default: return 0;
    }
  };
  
  // Get count for a type filter
  const getTypeCount = (type: FilterType): number => {
    switch (type) {
      case "all": return taskCounts.all;
      case "assignment": return taskCounts.assignments;
      case "quiz": return taskCounts.quizzes;
      default: return 0;
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Type Filter */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Type</div>
        <div style={styles.pillRow}>
          {TYPE_OPTIONS.map((option) => {
            const isActive = filters.type === option.value;
            const isHovered = hoveredPill === `type-${option.value}`;
            const count = getTypeCount(option.value);
            
            return (
              <button
                key={option.value}
                type="button"
                style={{
                  ...styles.pill,
                  ...(isActive ? styles.pillActive : {}),
                  ...(isHovered && !isActive ? styles.pillHover : {}),
                }}
                onClick={() => onFilterChange({ type: option.value })}
                onMouseEnter={() => setHoveredPill(`type-${option.value}`)}
                onMouseLeave={() => setHoveredPill(null)}
              >
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
                <span
                  style={{
                    ...styles.count,
                    ...(isActive ? styles.countActive : {}),
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Status Filter */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Status</div>
        <div style={styles.pillRow}>
          {STATUS_OPTIONS.map((option) => {
            const isActive = filters.status === option.value;
            const isHovered = hoveredPill === `status-${option.value}`;
            const count = getStatusCount(option.value);
            
            return (
              <button
                key={option.value}
                type="button"
                style={{
                  ...styles.pill,
                  ...(isActive ? styles.pillActive : {}),
                  ...(isHovered && !isActive ? styles.pillHover : {}),
                  ...(option.urgent && !isActive ? styles.urgentPill : {}),
                  ...(option.warning && !isActive ? styles.warningPill : {}),
                }}
                onClick={() => onFilterChange({ status: option.value })}
                onMouseEnter={() => setHoveredPill(`status-${option.value}`)}
                onMouseLeave={() => setHoveredPill(null)}
              >
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
                {count > 0 && (
                  <span
                    style={{
                      ...styles.count,
                      ...(isActive ? styles.countActive : {}),
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Sort */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Sort By</div>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange({ sort: e.target.value as SortOption })}
          onFocus={() => setSortFocused(true)}
          onBlur={() => setSortFocused(false)}
          style={{
            ...styles.sortSelect,
            ...(sortFocused ? styles.sortSelectFocused : {}),
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Hide scrollbar CSS */}
      <style>{`
        .filters-pill-row::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Filters;
