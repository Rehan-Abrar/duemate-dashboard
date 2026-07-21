import { useState, useEffect } from "react";
import { timetableApi } from "../../api";
import type { Task, TimetableSlot, TimetableData } from "../../types";
import { RoundSpinner } from "../../components/ui/spinner";

interface DashboardProps {
  tasks: Task[];
  loading: boolean;
  onNavigate: (tab: "tasks" | "calendar" | "timetable" | "assistant" | "profile") => void;
}

function normalizeSlots(data: TimetableData): TimetableSlot[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const vals = Object.values(data);
    const flat: TimetableSlot[] = [];
    vals.forEach((v) => {
      if (Array.isArray(v)) flat.push(...v);
    });
    return flat;
  }
  return [];
}

export function Dashboard({ tasks, loading, onNavigate }: DashboardProps) {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(true);

  // Parse the user's name from localStorage if saved during ProfileSetup
  const savedName = localStorage.getItem("duemate_user_name") || "Student";

  useEffect(() => {
    async function loadTimetable() {
      try {
        const data = await timetableApi.get();
        const normalized = normalizeSlots(data);
        setSlots(normalized);
      } catch (err) {
        console.error("Failed to load timetable", err);
      } finally {
        setTimetableLoading(false);
      }
    }
    loadTimetable();
  }, []);

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const upcomingTasks = pendingTasks.slice(0, 3);

  // Filter slots for today's weekday
  const todayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon...
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayAbbr = DAYS[todayIndex];

  const DAY_MAP: Record<string, string[]> = {
    Sun: ["Sunday", "Sun", "sunday"],
    Mon: ["Monday", "Mon", "monday"],
    Tue: ["Tuesday", "Tue", "tuesday"],
    Wed: ["Wednesday", "Wed", "wednesday"],
    Thu: ["Thursday", "Thu", "thursday"],
    Fri: ["Friday", "Fri", "friday"],
    Sat: ["Saturday", "Sat", "saturday"],
  };

  const todaySlots = slots.filter((s) =>
    DAY_MAP[todayAbbr]?.some(
      (d) => s.day?.toLowerCase() === d.toLowerCase()
    )
  );


  return (
    <>
      {/* TopAppBar (Desktop Only) */}
      <header className="hidden md:flex w-full top-0 sticky z-40 bg-background-base items-center justify-between px-6 py-4 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]">
        <div className="flex items-center gap-3">
          <h1 className="text-[20px] leading-[1.4] font-bold text-primary tracking-tight">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {savedName} 👋
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full neumorphic-raised p-0.5 overflow-hidden cursor-pointer" onClick={() => onNavigate("profile")}>
          {/* Avatar Placeholder */}
          <div className="w-full h-full bg-secondary text-white flex items-center justify-center font-bold text-sm rounded-full">
            {savedName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="px-6 pt-8 max-w-md md:max-w-6xl mx-auto space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8">
        {/* Mobile Header Greeting */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dashboard</span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Hi, {savedName} 👋
            </h1>
          </div>
          <button 
            onClick={() => onNavigate("profile")}
            className="w-10 h-10 rounded-full neumorphic-raised p-0.5 overflow-hidden active:scale-95 transition-transform"
            aria-label="View profile"
          >
            <div className="w-full h-full bg-secondary text-white flex items-center justify-center font-bold text-sm rounded-full">
              {savedName.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>

        {/* Left Column (Desktop) */}
        <div className="md:col-span-8 space-y-6">
          {/* AI Greeting Card */}
          <section className="relative p-6 border border-white/40 rounded-[24px] bg-background-base shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB]/10 via-[#DCE8FF]/5 to-[#2563EB]/10 animate-pulse -z-10" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-blue-600 text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Semester Overview
                </h2>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  {loading ? "Checking your schedule..." : `Your semester is under control. You have ${pendingTasks.length} upcoming ${pendingTasks.length === 1 ? "deadline" : "deadlines"}.`}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 pt-4 border-t border-slate-300/40 grid grid-cols-3 gap-4 text-center">
              <div className="neu-inset-soft p-3 rounded-xl">
                <span className="text-xs font-semibold text-slate-500 block">Pending</span>
                <span className="text-xl font-bold text-slate-900">{pendingTasks.length}</span>
              </div>
              <div className="neu-inset-soft p-3 rounded-xl">
                <span className="text-xs font-semibold text-slate-500 block">Due Soon</span>
                <span className="text-xl font-bold text-amber-500">{pendingTasks.filter(t => t.parsed_due_date && new Date(t.parsed_due_date).getTime() - Date.now() < 3 * 86400000).length}</span>
              </div>
              <div className="neu-inset-soft p-3 rounded-xl">
                <span className="text-xs font-semibold text-slate-500 block">Completed</span>
                <span className="text-xl font-bold text-emerald-600">{tasks.filter(t => t.status === "completed").length}</span>
              </div>
            </div>
          </section>

          {/* Timetable Preview Card */}
          <section className="neu-raised-premium rounded-[24px] p-6 border-l-4 border-blue-600">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">calendar_today</span>
                <h2 className="text-lg font-bold text-slate-900">Today's Classes</h2>
              </div>
              <button onClick={() => onNavigate("timetable")} className="text-blue-600 text-xs font-semibold hover:underline transition-all flex items-center gap-1">
                View Timetable <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-4">
              {timetableLoading ? (
                <div className="flex items-center justify-center py-4 gap-2">
                  <RoundSpinner size="xs" color="blue" />
                  <span className="text-xs text-slate-500">Loading today's classes...</span>
                </div>
              ) : todaySlots.length === 0 ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm text-slate-500">
                    {slots.length === 0
                      ? "No timetable uploaded yet."
                      : "No classes scheduled for today. Enjoy your day!"}
                  </p>
                  {slots.length === 0 && (
                    <button
                      onClick={() => onNavigate("timetable")}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Upload Timetable
                    </button>
                  )}
                </div>
              ) : (
                todaySlots.map((slot, index) => (
                  <div key={index}>
                    {index > 0 && <div className="w-full h-px bg-slate-300/40 my-3"></div>}
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-blue-600 w-20 flex-shrink-0">{slot.time}</span>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-slate-900 block capitalize">{slot.course}</span>
                        <span className="text-xs text-slate-500">{slot.room ? `Room ${slot.room}` : "No Room Assigned"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column (Desktop) */}
        <div className="md:col-span-4 space-y-6">
          {/* Quick Actions Grid */}
          <section className="grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate("tasks")} className="neu-raised-premium rounded-2xl flex flex-col items-center justify-center py-4 gap-1.5 active:scale-95 transition-all hover:bg-slate-100/50 group">
              <span className="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform">assignment</span>
              <span className="text-xs font-semibold text-slate-700">Tasks</span>
            </button>
            <button onClick={() => onNavigate("calendar")} className="neu-raised-premium rounded-2xl flex flex-col items-center justify-center py-4 gap-1.5 active:scale-95 transition-all hover:bg-slate-100/50 group">
              <span className="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform">calendar_month</span>
              <span className="text-xs font-semibold text-slate-700">Calendar</span>
            </button>
            <button onClick={() => onNavigate("timetable")} className="neu-raised-premium rounded-2xl flex flex-col items-center justify-center py-4 gap-1.5 active:scale-95 transition-all hover:bg-slate-100/50 group">
              <span className="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform">view_timeline</span>
              <span className="text-xs font-semibold text-slate-700">Timetable</span>
            </button>
            <button onClick={() => onNavigate("assistant")} className="neu-raised-premium rounded-2xl flex flex-col items-center justify-center py-4 gap-1.5 active:scale-95 transition-all hover:bg-slate-100/50 group">
              <span
                className="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
              <span className="text-xs font-semibold text-slate-700">Ask AI</span>
            </button>
          </section>

          {/* Secondary Section: Upcoming Deadlines */}
          <section className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-base font-bold text-slate-900">Upcoming Deadlines</h2>
              <button onClick={() => onNavigate("tasks")} className="text-blue-600 text-xs font-semibold hover:underline transition-all">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {loading && (
                <div className="flex items-center justify-center py-6 gap-2">
                  <RoundSpinner size="sm" color="blue" />
                  <span className="text-xs text-slate-500 font-medium">Loading tasks...</span>
                </div>
              )}
              {!loading && upcomingTasks.length === 0 && (
                <p className="text-center text-slate-500 text-xs py-4">No upcoming tasks.</p>
              )}
              {upcomingTasks.map((task) => (
                <div 
                  key={task._id} 
                  onClick={() => onNavigate("tasks")} 
                  className="neu-raised-premium rounded-2xl p-3.5 flex items-center gap-3.5 cursor-pointer hover:bg-slate-100/50 hover:translate-x-0.5 hover:shadow-md transition-all active:scale-98"
                >
                  <div className="w-9 h-9 neu-inset-soft rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-blue-600 text-lg">
                      {task.task_type === "quiz" ? "quiz" : "assignment"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate capitalize">
                      {task.parsed_title || "Untitled Task"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {task.parsed_due_date ? new Date(task.parsed_due_date).toLocaleDateString() : "No date"}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                </div>
              ))}
            </div>
          </section>

          {/* Status Footer */}
          <div className="flex justify-center pt-4 md:pt-0">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 shadow-sm border border-white/60">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-[11px] font-bold text-success uppercase tracking-wider">
                WhatsApp Connected
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
