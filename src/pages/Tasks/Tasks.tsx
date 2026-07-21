import { useState } from "react";
import { tasksApi } from "../../api";
import type { Task, User } from "../../types";
import { RoundSpinner } from "../../components/ui/spinner";
import {
  analyzeWorkload,
  getWorkloadBadge,
  getTaskEmptyState,
  getTasksSubtitle,
} from "../../lib/insights";

interface TasksProps {
  user: User;
  tasks: Task[];
  loading: boolean;
  refreshTasks: () => Promise<void>;
  onNavigate?: (tab: string) => void;
  onAddTask?: () => void;
}

export function Tasks({ tasks, loading, refreshTasks, onNavigate, onAddTask }: TasksProps) {
  const [filter, setFilter] = useState<"all" | "assignments" | "quizzes" | "exams" | "completed">("all");

  // Data-driven insights
  const analysis = analyzeWorkload(tasks);
  const workloadBadge = getWorkloadBadge(analysis);
  const tasksSubtitle = getTasksSubtitle(analysis);

  const handleComplete = async (id: string) => {
    try {
      await tasksApi.complete(id);
      await refreshTasks();
    } catch (error) {
      console.error("Failed to complete task", error);
    }
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.status === "completed";
    if (filter === "assignments") return task.task_type === "assignment" && task.status !== "completed";
    if (filter === "quizzes") return task.task_type === "quiz" && task.status !== "completed";
    if (filter === "exams") return false; // mock 
    return task.status !== "completed"; // "all"
  });

  return (
    <>
      {/* Top AppBar (Desktop Only) */}
      <header className="hidden md:flex justify-between items-center w-full px-6 sticky top-0 z-40 py-4 bg-background-base">
        <div className="flex flex-col">
          <h1 className="text-[24px] font-bold text-on-surface">Tasks</h1>
          <p className="text-[14px] text-text-secondary">{tasksSubtitle}</p>
        </div>
        <button
          onClick={onAddTask}
          className="w-12 h-12 rounded-full flex items-center justify-center neumorphic-raised text-secondary active:scale-95 transition-transform"
          title="Add Task via AI"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            add
          </span>
        </button>
      </header>

      <main className="px-6 mt-6 max-w-[390px] md:max-w-5xl mx-auto md:flex md:gap-8 md:items-start space-y-8 md:space-y-0">
        {/* Left Column: Summary & Filters */}
        <div className="md:w-1/3 space-y-8 md:sticky md:top-24">
        {/* Summary Area */}
        <section className="neumorphic-raised rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[20px] font-bold text-on-surface">{tasks.length} Tasks</span>
            <div className={`px-3 py-1 rounded-full ${
              workloadBadge.variant === "success" ? "bg-emerald-100 text-emerald-700" :
              workloadBadge.variant === "info" ? "bg-blue-100 text-blue-700" :
              workloadBadge.variant === "warning" ? "bg-amber-100 text-amber-700" :
              "bg-rose-100 text-rose-700"
            }`}>
              <span className="text-[12px] font-semibold uppercase tracking-wider">
                {workloadBadge.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-[20px] font-bold text-secondary">{pendingTasks.length}</span>
              <span className="text-[14px] text-text-secondary">Due Soon</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-bold text-success">{completedCount}</span>
              <span className="text-[14px] text-text-secondary">Completed</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-bold text-danger">{analysis.overdueCount}</span>
              <span className="text-[14px] text-text-secondary">Overdue</span>
            </div>
          </div>
        </section>

        {/* Filter Chips */}
        <nav className="flex overflow-x-auto space-x-2 scrollbar-hide py-2 -mx-6 px-6 md:flex-col md:space-x-0 md:space-y-2 md:mx-0 md:px-0">
          {[
            { id: "all", label: "All Tasks", count: pendingTasks.length },
            { id: "assignments", label: "Assignments", count: tasks.filter(t => t.task_type === "assignment" && t.status !== "completed").length },
            { id: "quizzes", label: "Quizzes", count: tasks.filter(t => t.task_type === "quiz" && t.status !== "completed").length },
            { id: "completed", label: "Completed", count: completedCount },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setFilter(id as any)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                filter === id
                  ? "bg-blue-600 text-white shadow-md"
                  : "neu-raised-premium text-slate-700 hover:bg-slate-100/50"
              }`}
            >
              <span>{label}</span>
              <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                filter === id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </nav>

        </div>

        {/* Right Column: Task List */}
        <div className="md:w-2/3 space-y-6 w-full">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3">
              <RoundSpinner size="md" color="blue" />
              <span className="text-sm font-medium text-slate-600">Loading tasks...</span>
            </div>
          )}
          {!loading && filteredTasks.length === 0 && (
            <div className="neumorphic-raised rounded-[24px] p-8 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center neu-raised-premium">
                <span className="material-symbols-outlined text-blue-600 text-3xl">
                  {filter === "completed" ? "workspace_premium" : "done_all"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {getTaskEmptyState(filter, analysis).title}
              </h3>
              <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                {getTaskEmptyState(filter, analysis).description}
              </p>
            </div>
          )}

          {filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isHighPriority = task.status === "needs_review";

            return (
              <article
                key={task._id}
                className={`${
                  isCompleted ? "neumorphic-inset bg-opacity-50" : "neumorphic-raised"
                } rounded-[20px] p-5 space-y-4 ${
                  isHighPriority && !isCompleted ? "border-l-4 border-danger" : ""
                } ${!isHighPriority && !isCompleted ? "border-l-4 border-secondary" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className={isCompleted ? "opacity-60" : ""}>
                    <span
                      className={`text-[12px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isCompleted
                          ? "text-on-surface-variant bg-surface-container-high line-through"
                          : "text-secondary-container bg-highlight-soft"
                      }`}
                    >
                      {task.task_type}
                    </span>
                    <h3
                      className={`text-[20px] font-bold text-on-surface mt-1 capitalize ${
                        isCompleted ? "line-through" : ""
                      }`}
                    >
                      {task.parsed_title || "Untitled Task"}
                    </h3>
                    <div className="flex items-center text-text-secondary text-[14px] mt-1">
                      <span className="material-symbols-outlined text-[18px] mr-1">
                        {isCompleted ? "done_all" : "schedule"}
                      </span>
                      {task.parsed_due_date ? new Date(task.parsed_due_date).toLocaleDateString() : "No Date"}
                    </div>
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center text-success gap-1">
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span className="text-[14px] font-bold">Completed</span>
                    </div>
                  ) : (
                    <span
                      className={`text-[14px] font-bold ${
                        isHighPriority ? "text-danger" : "text-secondary"
                      }`}
                    >
                      {isHighPriority ? "Due Today" : "Due Soon"}
                    </span>
                  )}
                </div>

                {/* Original Message Feature */}
                {!isCompleted && task.raw_message && (
                  <div className="neumorphic-inset rounded-xl p-3 flex items-start gap-2">
                    <span
                      className="material-symbols-outlined text-text-secondary text-[16px] mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      chat_bubble
                    </span>
                    <p className="text-[14px] italic text-text-secondary">
                      Original message:{" "}
                      <span className="text-on-surface-variant font-medium">"{task.raw_message}"</span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                {!isCompleted && (
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleComplete(task._id)}
                      className="flex-1 bg-secondary text-white shadow-[4px_4px_10px_rgba(49,107,243,0.3)] py-3 rounded-xl text-[12px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      COMPLETE
                    </button>
                    <button 
                      onClick={() => onNavigate && onNavigate("assistant")}
                      className="px-4 neumorphic-raised text-secondary py-3 rounded-xl flex items-center justify-center group active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined group-hover:animate-pulse">
                        smart_toy
                      </span>
                      <span className="ml-2 text-[12px] font-semibold uppercase tracking-wider">
                        ASK AI
                      </span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}
