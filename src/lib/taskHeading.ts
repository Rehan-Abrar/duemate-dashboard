const GENERIC_TITLES = new Set([
  "assignment",
  "quiz",
  "task",
  "deadline",
  "exam",
  "project",
  "homework",
  "hw",
  "report",
  "untitled task",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export type TaskHeadingSource = {
  parsed_title?: string | null;
  parsed_course?: string | null;
  task_type?: string | null;
  raw_message?: string | null;
};

function headingKind(taskType?: string | null, blob = ""): string {
  const hay = blob.toLowerCase();
  if (/\bprojects?\b/.test(hay)) return "Project";
  if (/\bexams?\b|\bmidterms?\b|\bfinals?\b/.test(hay)) return "Exam";
  if (/\bquiz(?:zes)?\b|\bmcqs?\b/.test(hay) || taskType === "quiz") return "Quiz";
  if (taskType === "exam") return "Exam";
  if (taskType) {
    return taskType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return "Task";
}

/** Display heading from stored course + type. Does not invent deadlines. */
export function taskHeading(task: TaskHeadingSource): string {
  const existing = (task.parsed_title || "").trim();
  const course = (task.parsed_course || "").trim();
  const blob = `${existing} ${task.raw_message || ""}`;
  const generic = !existing || GENERIC_TITLES.has(existing.toLowerCase());
  const sameAsCourse = course && existing.toLowerCase() === course.toLowerCase();
  if (existing && !generic && !sameAsCourse) {
    return existing;
  }
  const kind = headingKind(task.task_type, blob);
  if (course) return `${course} ${kind}`;
  return kind;
}
