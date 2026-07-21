import { useState, useEffect } from "react";
import { timetableApi } from "../../api";
import type { TimetableData, TimetableSlot } from "../../types";
import { RoundSpinner } from "../../components/ui/spinner";

interface PersonalTimetableProps {
  section?: string | null;
  onUploadNew: () => void;
  onAskAI: () => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

// Map day abbreviation to what the timetable API might return
const DAY_MAP: Record<string, string[]> = {
  Mon: ["Monday", "Mon", "monday"],
  Tue: ["Tuesday", "Tue", "tuesday"],
  Wed: ["Wednesday", "Wed", "wednesday"],
  Thu: ["Thursday", "Thu", "thursday"],
  Fri: ["Friday", "Fri", "friday"],
  Sat: ["Saturday", "Sat", "saturday"],
};

function normalizeSlots(data: TimetableData): TimetableSlot[] {
  if (Array.isArray(data)) return data;
  // If it's a Record, try to extract a usable array
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

export function PersonalTimetable({ section, onUploadNew, onAskAI }: PersonalTimetableProps) {
  const todayIndex = new Date().getDay(); // 0=Sun
  const defaultDay = DAYS[Math.min(Math.max(todayIndex - 1, 0), DAYS.length - 1)];
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // TODO: GET /api/student/timetable — uses the stored section from backend
        //       If the API returns full-department data, filter by the `section` prop here.
        const data = await timetableApi.get();
        const normalized = normalizeSlots(data);
        setSlots(normalized);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todaySlots = slots.filter((s) =>
    DAY_MAP[selectedDay]?.some(
      (d) => s.day?.toLowerCase() === d.toLowerCase()
    )
  );

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function parseTime(timeStr: string): number {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3]?.toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }

  const nextClass = todaySlots.find((s) => parseTime(s.time) > nowMinutes);
  const liveClass = todaySlots.find((s) => {
    const start = parseTime(s.time);
    return start <= nowMinutes && start + 60 > nowMinutes;
  });

  // Semester insight
  const maxDayCount = DAYS.map((d) =>
    slots.filter((s) => DAY_MAP[d]?.includes(s.day ?? "")).length
  );
  const busiestDayIndex = maxDayCount.indexOf(Math.max(...maxDayCount));
  const busiestDay = DAYS[busiestDayIndex];

  if (!section) {
    return (
      <div className="max-w-[390px] md:max-w-5xl mx-auto min-h-screen pb-32 md:pb-12 bg-background-base flex flex-col">
        {/* Top App Bar (Desktop Only) */}
        <header className="hidden md:flex sticky top-0 z-50 w-full bg-background-base px-6 py-4 items-center justify-between shadow-[0_4px_12px_rgba(209,217,230,0.4)]">
          <div className="w-10 h-10" />
          <h1 className="text-[20px] font-bold text-primary">My Timetable</h1>
          <button className="neumorphic-button-secondary w-10 h-10 flex items-center justify-center rounded-2xl active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-secondary">calendar_month</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 neumorphic-raised rounded-full flex items-center justify-center mb-6">
             <span className="material-symbols-outlined text-outline text-5xl">event_busy</span>
          </div>
          <h2 className="text-[24px] font-bold text-primary mb-2">No timetable has been uploaded yet.</h2>
          <p className="text-[14px] text-on-surface-variant mb-8 max-w-sm">
            Upload your university timetable to track your classes and get AI insights.
          </p>
          <button onClick={onUploadNew} className="neumorphic-button-primary px-8 h-14 rounded-xl font-bold text-[16px] text-white">
            Upload Timetable
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-[390px] md:max-w-5xl mx-auto min-h-screen pb-32 md:pb-12 bg-background-base">
      {/* Top App Bar (Desktop Only) */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-background-base px-6 py-4 items-center justify-between shadow-[0_4px_12px_rgba(209,217,230,0.4)]">
        <div className="w-10 h-10" />
        <h1 className="text-[20px] font-bold text-primary">My Timetable</h1>
        <button className="neumorphic-button-secondary w-10 h-10 flex items-center justify-center rounded-2xl active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-secondary">calendar_month</span>
        </button>
      </header>

      <main className="mt-6 px-6 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8 md:items-start">
        {/* Left Column (Desktop) */}
        <div className="md:col-span-7 space-y-6">
        {/* Header Class Card */}
        <section className="neumorphic-raised rounded-[20px] p-5 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-[24px] font-bold text-primary">{section}</h2>
              <p className="text-[16px] text-on-surface-variant">
                {section.startsWith("BSCS")
                  ? "BS Computer Science"
                  : section.startsWith("BSSE")
                  ? "BS Software Engineering"
                  : section.startsWith("BSAI")
                  ? "BS Artificial Intelligence"
                  : "BS Program"}
              </p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-success/10 rounded-full">
              <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
              <span className="text-success font-semibold text-[10px]">Timetable Synced</span>
            </div>
          </div>
          <p className="text-[14px] text-outline">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </section>

        {/* Day Selector */}
        <section className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-5 py-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap active:scale-95 transition-all ${
                selectedDay === d
                  ? "bg-secondary text-white shadow-[4px_4px_8px_rgba(0,81,213,0.3)]"
                  : "neumorphic-button-secondary text-on-surface-variant"
              }`}
            >
              {d}
            </button>
          ))}
        </section>

          {/* Next Class Card (Mobile Only Location, or just omit if moving to right column) */}


        {/* Today's Classes */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-primary">{DAY_FULL[selectedDay]}'s Classes</h2>
            <span className="text-[14px] text-outline">{todaySlots.length} classes</span>
          </div>

          {loading && (
            <div className="neumorphic-raised rounded-[20px] p-6 text-center text-on-surface-variant flex items-center justify-center gap-3">
              <RoundSpinner size="sm" color="blue" />
              <span className="text-sm font-medium text-slate-600">Loading timetable...</span>
            </div>
          )}

          {error && !loading && (
            <div className="neumorphic-raised rounded-[20px] p-6 text-center">
              {/* TODO: Connect GET /api/student/timetable when backend is ready */}
              <p className="text-[14px] text-on-surface-variant mb-3">
                Timetable data not available yet.
              </p>
              <button onClick={onUploadNew} className="text-secondary font-semibold text-[14px] underline">
                Upload a timetable
              </button>
            </div>
          )}

          {!loading && !error && todaySlots.length === 0 && (
            <div className="neumorphic-raised rounded-[20px] p-6 text-center text-on-surface-variant text-[14px]">
              No classes on {DAY_FULL[selectedDay]}. Enjoy your day!
            </div>
          )}

          {todaySlots.map((slot, i) => {
            const isLive = liveClass === slot;
            return (
              <div key={i} className="neumorphic-raised rounded-[20px] p-5 relative overflow-hidden">
                {isLive && (
                  <div className="absolute top-0 right-0 p-4">
                    <span
                      className="flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-semibold"
                      style={{ animation: "pulse 2s infinite" }}
                    >
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                      Live Now
                    </span>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 neumorphic-inset rounded-xl flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[28px]">auto_stories</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[20px] font-bold text-primary">{slot.course}</h4>
                    <div className="grid grid-cols-2 gap-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span className="text-[14px]">{slot.time}</span>
                      </div>
                      {slot.room && (
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          <span className="text-[14px]">{slot.room}</span>
                        </div>
                      )}
                      {slot.teacher && (
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          <span className="text-[14px]">{slot.teacher}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
        </div>

        {/* Right Column (Desktop) */}
        <div className="md:col-span-5 space-y-6">
        
        {/* Next Class Card */}
        {nextClass && (
          <section className="neumorphic-raised rounded-[20px] p-5 border-l-4 border-secondary flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-secondary text-[11px] font-semibold uppercase tracking-wider">Next Class</p>
              <h3 className="text-[20px] font-bold text-primary">{nextClass.course}</h3>
              <div className="flex items-center gap-2 text-outline">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span className="text-[14px]">{nextClass.time}</span>
              </div>
            </div>
            <button className="bg-secondary text-white px-4 py-2 rounded-2xl text-[11px] font-semibold active:scale-95 transition-all">
              Set Reminder
            </button>
          </section>
        )}

        {/* AI Insight */}
        <section className="neumorphic-raised rounded-[20px] p-5 border border-highlight-soft/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
            </div>
            <h3 className="text-[20px] font-bold text-secondary">Semester Insight</h3>
          </div>
          <p className="text-[16px] text-on-surface-variant leading-relaxed">
            {error || slots.length === 0 ? (
              "Upload your timetable to get AI-powered insights about your schedule."
            ) : (
              <>
                You have <strong className="text-secondary">{todaySlots.length} classes</strong> today.{" "}
                {busiestDay && (
                  <>
                    {DAY_FULL[busiestDay]} is your busiest day with{" "}
                    <strong className="text-secondary">{maxDayCount[busiestDayIndex]} lectures</strong>.
                  </>
                )}
              </>
            )}
          </p>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <h2 className="text-[20px] font-bold text-primary">Quick Actions</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { icon: "upload_file", label: "Upload New", action: onUploadNew },
              { icon: "psychology", label: "Ask AI", action: onAskAI },
              { icon: "share", label: "Share Schedule", action: () => {} },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="neumorphic-button-secondary p-4 min-w-[140px] rounded-[20px] flex flex-col items-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-secondary">{action.icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
