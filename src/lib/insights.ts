/**
 * DueMate Dynamic Insights Engine
 *
 * Generates context-aware, data-driven messages based on the user's
 * actual task and workload state. Every message adapts to real data.
 *
 * Workload levels:
 * - Low (relaxed): 0–2 pending, no overdue → reassuring, relaxed wording
 * - Moderate (normal): 3–5 pending, few overdue → planning suggestions
 * - High (busy): 6+ pending or 3+ overdue → urgent/prioritise wording
 * - Critical (intense): 10+ pending or 5+ overdue → strong urgency
 */

import type { Task } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// WORKLOAD ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export type WorkloadLevel = "low" | "moderate" | "high" | "critical";

export interface WorkloadAnalysis {
  level: WorkloadLevel;
  pendingCount: number;
  overdueCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  completedCount: number;
  completionRate: number; // 0–100
  totalTasks: number;
  hasUrgentTasks: boolean;
  nextDeadline: Date | null;
  nextDeadlineCourse: string | null;
  nextDeadlineTitle: string | null;
}

export function analyzeWorkload(tasks: Task[]): WorkloadAnalysis {
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const overdue = pendingTasks.filter((t) => {
    if (!t.parsed_due_date) return false;
    return new Date(t.parsed_due_date) < now;
  });

  const dueToday = pendingTasks.filter((t) => {
    if (!t.parsed_due_date) return false;
    const d = new Date(t.parsed_due_date);
    return d <= todayEnd && d >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const dueThisWeek = pendingTasks.filter((t) => {
    if (!t.parsed_due_date) return false;
    const d = new Date(t.parsed_due_date);
    return d >= now && d <= weekEnd;
  });

  // Find the next upcoming deadline
  const sortedPending = [...pendingTasks]
    .filter((t) => t.parsed_due_date)
    .sort((a, b) => new Date(a.parsed_due_date!).getTime() - new Date(b.parsed_due_date!).getTime());

  const nextTask = sortedPending[0] ?? null;
  const nextDeadline = nextTask?.parsed_due_date ? new Date(nextTask.parsed_due_date) : null;

  // Determine workload level
  let level: WorkloadLevel;
  if (pendingTasks.length >= 10 || overdue.length >= 5) {
    level = "critical";
  } else if (pendingTasks.length >= 6 || overdue.length >= 3) {
    level = "high";
  } else if (pendingTasks.length >= 3 || overdue.length >= 1) {
    level = "moderate";
  } else {
    level = "low";
  }

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return {
    level,
    pendingCount: pendingTasks.length,
    overdueCount: overdue.length,
    dueTodayCount: dueToday.length,
    dueThisWeekCount: dueThisWeek.length,
    completedCount: completedTasks.length,
    completionRate,
    totalTasks,
    hasUrgentTasks: overdue.length > 0 || dueToday.length > 0,
    nextDeadline,
    nextDeadlineCourse: nextTask?.parsed_course ?? null,
    nextDeadlineTitle: nextTask?.parsed_title ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHT GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate the AI greeting card headline and body for the Dashboard.
 * Returns { title, subtitle, mood } where mood informs icon/colour choice.
 */
export function getDashboardGreeting(
  analysis: WorkloadAnalysis,
  userName: string,
): { title: string; body: string; mood: "relaxed" | "focused" | "urgent" | "intense" } {
  const { level, pendingCount, overdueCount, dueTodayCount, completionRate } = analysis;

  // ── Title ───────────────────────────────────────────────────────────
  let title: string;
  let mood: "relaxed" | "focused" | "urgent" | "intense";

  if (level === "low") {
    if (completionRate >= 100) {
      title = "All Done! 🎉";
      mood = "relaxed";
    } else if (pendingCount === 0) {
      title = "Nothing Due 🎉";
      mood = "relaxed";
    } else {
      title = "Light Week Ahead ☀️";
      mood = "relaxed";
    }
  } else if (level === "moderate") {
    title = "Steady Pace 📋";
    mood = "focused";
  } else if (level === "high") {
    if (overdueCount > 0) {
      title = "Catch-up Time ⚠️";
      mood = "urgent";
    } else {
      title = "Busy Week Ahead 🔔";
      mood = "urgent";
    }
  } else {
    title = "Intense Schedule 🚨";
    mood = "intense";
  }

  // ── Body ────────────────────────────────────────────────────────────
  let body: string;

  if (level === "low") {
    if (pendingCount === 0 && overdueCount === 0) {
      if (completionRate >= 100) {
        body = `You've completed everything, ${userName}! Enjoy your free time — you've earned it. 🎉`;
      } else {
        body = `No upcoming deadlines. Your semester is looking clear, ${userName}. Great planning!`;
      }
    } else {
      body = `Just ${pendingCount} ${pendingCount === 1 ? "task" : "tasks"} to keep an eye on. Your semester is under control.`;
    }
  } else if (level === "moderate") {
    const parts: string[] = [];
    parts.push(`You have ${pendingCount} pending ${pendingCount === 1 ? "task" : "tasks"}.`);
    if (dueTodayCount > 0) {
      parts.push(`${dueTodayCount} ${dueTodayCount === 1 ? "is" : "are"} due today.`);
    }
    if (overdueCount > 0) {
      parts.push(`${overdueCount} ${overdueCount === 1 ? "task is" : "tasks are"} overdue.`);
    }
    if (dueTodayCount === 0 && overdueCount === 0) {
      parts.push("I recommend starting your next assignment early to stay ahead.");
    }
    body = parts.join(" ");
  } else if (level === "high") {
    const parts: string[] = [];
    parts.push(`You have ${pendingCount} pending ${pendingCount === 1 ? "task" : "tasks"}.`);
    if (overdueCount > 0) {
      parts.push(`${overdueCount} ${overdueCount === 1 ? "is" : "are"} overdue — prioritise those first.`);
    }
    if (dueTodayCount > 0) {
      parts.push(`Don't forget the ${dueTodayCount} ${dueTodayCount === 1 ? "task" : "tasks"} due today!`);
    }
    parts.push("Try focusing on the most urgent items first.");
    body = parts.join(" ");
  } else {
    const parts: string[] = [];
    parts.push(`You have ${pendingCount} pending ${pendingCount === 1 ? "task" : "tasks"} — that's a lot on your plate.`);
    if (overdueCount >= 5) {
      parts.push(`With ${overdueCount} overdue, it's time to buckle down.`);
    } else if (overdueCount > 0) {
      parts.push(`Start with the ${overdueCount} overdue ${overdueCount === 1 ? "task" : "tasks"} first.`);
    }
    if (dueTodayCount > 0) {
      parts.push(`The ${dueTodayCount} ${dueTodayCount === 1 ? "task" : "tasks"} due today need immediate attention.`);
    }
    parts.push("Let me know if you need help prioritising.");
    body = parts.join(" ");
  }

  return { title, body, mood };
}

/**
 * Generate the "Due Soon" metric label on the dashboard.
 * More descriptive than just "Due Soon".
 */
export function getDueSoonLabel(analysis: WorkloadAnalysis): {
  label: string;
  count: number;
  urgency: "low" | "medium" | "high";
} {
  const { dueTodayCount, dueThisWeekCount, overdueCount } = analysis;

  // Count tasks that are due within 3 days
  const now = new Date();
  const threeDays = new Date(now);
  threeDays.setDate(now.getDate() + 3);

  // We don't have a pre-computed 3-day count, so calculate it
  // Actually we can approximate: use the dueThisWeek and dueToday data
  const totalUrgent = dueTodayCount + overdueCount;

  if (totalUrgent >= 5) {
    return { label: "Overdue / Due Today", count: totalUrgent, urgency: "high" };
  } else if (totalUrgent >= 1) {
    return { label: "Overdue / Due Today", count: totalUrgent, urgency: "medium" };
  } else if (dueThisWeekCount > 0) {
    return { label: "Due This Week", count: dueThisWeekCount, urgency: "low" };
  } else {
    return { label: "Due Soon", count: 0, urgency: "low" };
  }
}

/**
 * Generate the AI insight card content for the Calendar page.
 */
export function getCalendarInsight(analysis: WorkloadAnalysis): {
  headline: string;
  body: string;
} {
  const { level, pendingCount, nextDeadline, nextDeadlineTitle, dueTodayCount, dueThisWeekCount } = analysis;

  let headline: string;
  switch (level) {
    case "low":
      headline = "All Clear 🌟";
      break;
    case "moderate":
      headline = "Steady Week 📋";
      break;
    case "high":
      headline = "Busy Week Ahead 🔔";
      break;
    case "critical":
      headline = "Heavy Load 🚨";
      break;
  }

  const parts: string[] = [];
  if (pendingCount === 0) {
    parts.push("No pending tasks. Your schedule is completely clear!");
  } else {
    parts.push(
      `You have ${pendingCount} pending ${pendingCount === 1 ? "task" : "tasks"}.`,
    );
    if (dueTodayCount > 1) {
      parts.push(`That's ${dueTodayCount} due today — pace yourself.`);
    } else if (dueTodayCount === 1) {
      parts.push("One task due today — you've got this.");
    }
    if (dueThisWeekCount > 0 && dueTodayCount === 0) {
      parts.push(`${dueThisWeekCount} ${dueThisWeekCount === 1 ? "task is" : "tasks are"} due this week.`);
    }
    if (nextDeadline && !dueTodayCount) {
      const diffDays = Math.ceil((nextDeadline.getTime() - Date.now()) / 86400000);
      if (diffDays > 0 && diffDays <= 14) {
        parts.push(
          `Your next deadline${nextDeadlineTitle ? ` (${nextDeadlineTitle})` : ""} is in ${diffDays} ${diffDays === 1 ? "day" : "days"}.`,
        );
      }
    }
    if (level === "high" || level === "critical") {
      parts.push("I recommend starting your next assignment today.");
    } else if (level === "moderate") {
      parts.push("Try tackling tasks one at a time to stay on track.");
    }
  }

  return { headline, body: parts.join(" ") };
}

/**
 * Generate the workload badge label for the Tasks page.
 * Replaces the hardcoded "Weekly Focus" badge.
 */
export function getWorkloadBadge(analysis: WorkloadAnalysis): {
  label: string;
  variant: "success" | "info" | "warning" | "danger";
} {
  const { level, pendingCount } = analysis;

  if (level === "low" || pendingCount === 0) {
    return { label: "All Clear", variant: "success" };
  } else if (level === "moderate") {
    return { label: "Steady Focus", variant: "info" };
  } else if (level === "high") {
    return { label: "Busy Week", variant: "warning" };
  } else {
    return { label: "High Priority", variant: "danger" };
  }
}

/**
 * Generate contextual empty state messages for the Tasks page.
 * Takes into account the active filter and overall workload.
 */
export function getTaskEmptyState(
  filter: string,
  analysis: WorkloadAnalysis,
): { title: string; description: string } {
  const { pendingCount, completedCount } = analysis;

  switch (filter) {
    case "completed":
      if (completedCount === 0) {
        return {
          title: "No completed tasks yet",
          description:
            "Finish your pending tasks and check them off to build your completion streak! Every task you complete brings you one step closer.",
        };
      }
      return {
        title: `Great work — ${completedCount} completed!`,
        description:
          "You've been productive! Keep the momentum going by tackling your remaining tasks.",
      };
    case "assignments":
      if (pendingCount === 0) {
        return {
          title: "No pending assignments",
          description:
            "Good job keeping your schedule clean! All assignments are taken care of.",
        };
      }
      return {
        title: "No assignments in this view",
        description:
          "Try checking the 'All Tasks' filter to see your other pending items.",
      };
    case "quizzes":
      if (pendingCount === 0) {
        return {
          title: "No upcoming quizzes",
          description:
            "No quizzes on your radar right now. Keep up with your review sessions!",
        };
      }
      return {
        title: "No quizzes in this view",
        description:
          "All quizzes cleared! Try the 'All Tasks' filter to see your broader list.",
      };
    default:
      // "all" filter
      if (pendingCount === 0 && completedCount === 0) {
        return {
          title: "Welcome to DueMate!",
          description:
            "Forward an assignment or quiz message to your DueMate bot on WhatsApp to get started. Or add a task manually using the + button.",
        };
      }
      if (pendingCount === 0 && completedCount > 0) {
        return {
          title: "All caught up! 🎉",
          description:
            "You have no pending tasks. Enjoy your free time! If something new comes up, DueMate is here to help.",
        };
      }
      return {
        title: "No matching tasks",
        description:
          "Try adjusting your filters to see more tasks.",
      };
  }
}

/**
 * Generates a personalised "time-of-day" greeting label.
 */
export function getTimeGreeting(userName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${userName}`;
  if (hour < 18) return `Good afternoon, ${userName}`;
  return `Good evening, ${userName}`;
}

/**
 * Generate the "tasks overview" summary line for the Tasks header subtitle.
 */
export function getTasksSubtitle(analysis: WorkloadAnalysis): string {
  const { pendingCount, dueTodayCount, level } = analysis;

  if (pendingCount === 0) return "All caught up — nothing pending!";
  if (level === "critical") return `${pendingCount} tasks need urgent attention`;
  if (dueTodayCount > 0) return `${pendingCount} pending — ${dueTodayCount} due today`;
  if (level === "high") return `${pendingCount} pending — stay focused`;
  return `Keep track of your academic work`;
}
