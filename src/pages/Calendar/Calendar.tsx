import { useState, useEffect, useRef } from "react";
import type { Task, User } from "../../types";
import { RoundSpinner } from "../../components/ui/spinner";

interface CalendarProps {
  user: User;
  tasks: Task[];
  loading: boolean;
  onAddTask?: () => void;
  onNavigate?: (tab: string) => void;
}

export function Calendar({ tasks: allTasks, loading, onAddTask }: CalendarProps) {
  const pendingTasks = allTasks.filter(t => t.status !== "completed");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);


  // Generate timeline dates from 30 days ago to 90 days in the future
  const getTimelineDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = -30; i <= 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const timelineDates = getTimelineDates();

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // Center selected date on mount or when selectedDate changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedDate, loading]);

  const getDeadlineUrgency = (date: Date) => {
    const dayTasks = tasks.filter(t => t.parsed_due_date && isSameDay(new Date(t.parsed_due_date), date));
    if (dayTasks.length === 0) return null;
    if (dayTasks.length === 1) return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]";
    if (dayTasks.length === 2) return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";
    return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
  };

  // Sort tasks by date
  const tasks = pendingTasks;
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.parsed_due_date ? new Date(a.parsed_due_date).getTime() : Infinity;
    const dateB = b.parsed_due_date ? new Date(b.parsed_due_date).getTime() : Infinity;
    return dateA - dateB;
  });

  const filteredTasks = selectedDate
    ? sortedTasks.filter(task => {
        if (!task.parsed_due_date) return false;
        return isSameDay(new Date(task.parsed_due_date), selectedDate);
      })
    : sortedTasks;

  return (
    <>
      {/* Top App Bar (Desktop Only) */}
      <header className="hidden md:flex bg-background-base shadow-[4px_4px_10px_rgba(163,177,198,0.6),-4px_-4px_10px_rgba(255,255,255,0.8)] w-full sticky top-0 items-center justify-between px-6 py-4 z-40">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-secondary text-[24px]"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            auto_awesome
          </span>
          <span className="text-[24px] font-bold text-secondary">
            DueMate
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="bg-secondary text-white px-4 py-2 rounded-xl flex items-center gap-2 neumorphic-raised active:scale-95 transition-all"
          title="Add Task via AI"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="text-[12px] font-semibold uppercase tracking-wider">Add Event</span>
        </button>
      </header>

      <main className="px-6 pb-32 max-w-[390px] md:max-w-5xl mx-auto">
        {/* Page Header */}
        <section className="mt-8 mb-4 md:mb-8">
          <h1 className="text-[32px] font-bold text-primary">Calendar</h1>
          <p className="text-text-secondary text-[16px]">Your semester timeline</p>
        </section>

        <div className="md:grid md:grid-cols-12 md:gap-8 flex flex-col">
          {/* Left Column (Desktop) */}
          <div className="md:col-span-7 order-2 md:order-1 space-y-8 mt-8 md:mt-0">

          {/* Date Selector */}
          <section className="mb-8">
            <div 
              ref={scrollContainerRef}
              onWheel={(e) => {
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollLeft += e.deltaY;
                }
              }}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-hide select-none cursor-grab active:cursor-grabbing"
            >
              {timelineDates.map((dateObj, index) => {
                const day = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                const num = dateObj.getDate();
                const isSelected = selectedDate ? isSameDay(dateObj, selectedDate) : false;
                const isToday = isSameDay(dateObj, new Date());
                const urgencyClass = getDeadlineUrgency(dateObj);

                const prevDate = index > 0 ? timelineDates[index - 1] : null;
                const showMonthLabel = !prevDate || prevDate.getMonth() !== dateObj.getMonth();
                const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });
                const yearName = dateObj.getFullYear();

                return (
                  <div key={dateObj.toISOString()} className="flex items-center gap-4 flex-shrink-0">
                    {showMonthLabel && (
                      <div className="flex flex-col items-center justify-center px-4 py-2 border-r border-slate-300/40 text-center select-none mr-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 leading-none">{yearName}</span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1.5 leading-none">{monthName}</span>
                      </div>
                    )}
                    <button
                      data-selected={isSelected}
                      onClick={() => setSelectedDate(isSelected ? null : dateObj)}
                      className={`flex flex-col items-center justify-center w-16 h-[96px] rounded-2xl cursor-pointer transition-all active:scale-95 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-background-base neumorphic-raised hover:bg-slate-100/50"
                      }`}
                    >
                      {isToday && (
                        <span className={`text-[8px] font-extrabold uppercase tracking-widest mb-1 ${
                          isSelected ? "text-white" : "text-blue-600"
                        }`}>
                          Today
                        </span>
                      )}
                      <span
                        className={`text-[12px] font-semibold uppercase tracking-wider ${
                          isSelected ? "text-white/80" : "text-outline"
                        }`}
                      >
                        {day}
                      </span>
                      <span className="text-[20px] font-bold leading-none mt-1">{num}</span>
                      
                      {/* Urgency indicator dot */}
                      {urgencyClass && (
                        <div className={`w-1.5 h-1.5 rounded-full ${urgencyClass} mt-1.5`} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            {selectedDate && (
              <div className="flex justify-between items-center px-1 mt-2">
                <span className="text-xs font-semibold text-slate-500">
                  Showing deadlines for {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Show All
                </button>
              </div>
            )}
          </section>

          {/* Agenda View */}
          <section className="flex flex-col gap-4">
            {loading && (
              <div className="flex items-center justify-center py-12 gap-3">
                <RoundSpinner size="md" color="blue" />
                <span className="text-sm font-medium text-slate-600">Loading agenda...</span>
              </div>
            )}
            {!loading && filteredTasks.length === 0 && (
              <div className="neumorphic-raised rounded-[24px] p-8 text-center max-w-md mx-auto space-y-4 my-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center neu-raised-premium">
                  <span className="material-symbols-outlined text-blue-600 text-3xl">event_available</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No tasks due</h3>
                <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                  {selectedDate
                    ? `No upcoming deadlines on ${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}.`
                    : "No upcoming events found on your schedule."}
                </p>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-md mt-2"
                  >
                    Show All Upcoming Tasks
                  </button>
                )}
              </div>
            )}

            {filteredTasks.map((task) => {
              const isHighPriority = task.status === "needs_review";
              const dateObj = task.parsed_due_date ? new Date(task.parsed_due_date) : null;
              const dateStr = dateObj
                ? `${dateObj.toLocaleDateString("en-US", { weekday: "long" })}, ${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "No Date";
              const timeStr = dateObj
                ? dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                : "All Day";

              return (
                <div key={task._id} className="flex flex-col gap-3 mt-2">
                  <h3 className="text-[12px] font-semibold text-outline uppercase tracking-widest pl-2">
                    {dateStr}
                  </h3>
                  <div className="bg-background-base p-6 rounded-[20px] neumorphic-raised flex items-center justify-between group cursor-pointer hover:translate-y-[-2px] transition-transform">
                    <div className="flex gap-4 items-start">
                      <div
                        className={`p-3 rounded-xl ${
                          isHighPriority ? "bg-orange-100 text-warning" : "bg-highlight-soft text-secondary"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {task.task_type === "quiz" ? "quiz" : "assignment"}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`text-[12px] font-semibold uppercase tracking-wider block mb-1 ${
                            isHighPriority ? "text-warning" : "text-secondary"
                          }`}
                        >
                          {task.parsed_course || "Course"}
                        </span>
                        <h4 className="text-[20px] font-bold text-on-surface capitalize">
                          {task.parsed_title || "Untitled Task"}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="material-symbols-outlined text-[16px] text-outline">
                            schedule
                          </span>
                          <span className="text-[14px] text-outline">{timeStr}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        isHighPriority
                          ? "bg-warning/20 text-warning"
                          : "bg-secondary-fixed-dim text-on-secondary-fixed-variant"
                      }`}
                    >
                      {isHighPriority ? "DUE SOON" : "UPCOMING"}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          </div>

          {/* Right Column (Desktop) */}
          <div className="md:col-span-5 order-1 md:order-2 space-y-8">
            {/* AI Insight Card */}
            <section>
              <div className="bg-highlight-soft p-6 rounded-[20px] neumorphic-raised relative overflow-hidden flex flex-col gap-2 border border-white/40">
                <div className="flex items-center gap-2 text-secondary">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                  <span className="text-[20px] font-bold">Busy week ahead</span>
                </div>
                <p className="text-on-surface-variant text-[16px] max-w-[90%]">
                  You have {tasks.length} pending tasks. I recommend starting your next assignment today.
                </p>
                <div className="absolute -right-4 -top-4 opacity-10">
                  <span className="material-symbols-outlined text-[120px]">auto_awesome</span>
                </div>
              </div>
            </section>

        {/* Feature Card: Import Timetable */}
        <section className="mt-8">
          <div className="bg-background-base p-6 rounded-[24px] neumorphic-raised border border-white/50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-surface-container-low rounded-xl neumorphic-inset flex items-center justify-center">
                <span className="material-symbols-outlined text-[64px] text-outline/30">
                  upload_file
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-[24px] font-bold text-primary mb-2">Import your timetable</h3>
                <p className="text-[16px] text-on-surface-variant mb-6">
                  Sync your entire university schedule in seconds. We support PDF, CSV, and direct portal imports.
                </p>
                <button className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-xl neumorphic-raised hover:bg-primary/90 transition-all active:scale-95 text-[12px] font-semibold uppercase tracking-wider">
                  UPLOAD TIMETABLE
                </button>
              </div>
            </div>
          </div>
        </section>
          </div>
        </div>
      </main>
    </>
  );
}
