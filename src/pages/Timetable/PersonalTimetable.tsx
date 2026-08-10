import { useState, useEffect, useRef } from "react";
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

// Map day abbreviation → all possible API-returned day strings
const DAY_MAP: Record<string, string[]> = {
  Mon: ["Monday", "Mon", "monday"],
  Tue: ["Tuesday", "Tue", "tuesday"],
  Wed: ["Wednesday", "Wed", "wednesday"],
  Thu: ["Thursday", "Thu", "thursday"],
  Fri: ["Friday", "Fri", "friday"],
  Sat: ["Saturday", "Sat", "saturday"],
};

// Map JS getDay() (0=Sun) to DAYS index
const JS_DAY_TO_IDX: Record<number, number> = {
  0: 4, // Sun → show Fri (closest weekday)
  1: 0, // Mon
  2: 1, // Tue
  3: 2, // Wed
  4: 3, // Thu
  5: 4, // Fri
  6: 5, // Sat
};

// Map our DAYS abbreviation to JS weekday number (for date calculation)
const DAY_TO_JS: Record<string, number> = {
  Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function normalizeSlots(data: TimetableData): TimetableSlot[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const vals = Object.values(data);
    const flat: TimetableSlot[] = [];
    vals.forEach((v) => { if (Array.isArray(v)) flat.push(...v); });
    return flat;
  }
  return [];
}

/**
 * Parse a time string like "8:00", "11:30", "2:00 PM" into minutes since midnight.
 * Handles 24-hour format (no AM/PM) as the backend uses 24-hour times.
 * Times like "2:00" in a university schedule are afternoon (14:00) if < 8:00 or
 * explicitly afternoon based on context — but since we have no AM/PM, assume:
 *   ≥ 8 → as-is (8:00 = 08:00, 11:00 = 11:00, 14:00 = 14:00)
 *   < 8 → add 12 (2:00 → 14:00, 5:00 → 17:00)
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && h !== 12) { h += 12; }
  else if (ampm === "AM" && h === 12) { h = 0; }
  else if (!ampm && h < 7) { h += 12; } // heuristic: 2:00 → 14:00
  return h * 60 + m;
}

/**
 * Sort slots chronologically by start_time (falling back to time field).
 */
function sortSlots(slots: TimetableSlot[]): TimetableSlot[] {
  return [...slots].sort((a, b) => {
    const ta = parseTimeToMinutes(a.start_time ?? a.time?.split("-")[0] ?? "");
    const tb = parseTimeToMinutes(b.start_time ?? b.time?.split("-")[0] ?? "");
    return ta - tb;
  });
}

/**
 * Get the date for a given DAYS abbreviation relative to today (PKT).
 * E.g. if today is Saturday and user selects Mon, returns next Monday's date.
 */
function getDateForDay(dayAbbr: string): Date {
  const now = new Date();
  // Work in PKT (UTC+5): offset local time to PKT
  const pktOffsetMs = 5 * 60 * 60 * 1000;
  const localOffsetMs = now.getTimezoneOffset() * 60 * 1000; // negative for UTC+
  const pktNow = new Date(now.getTime() + localOffsetMs + pktOffsetMs);

  const todayJs = pktNow.getDay(); // 0=Sun
  const targetJs = DAY_TO_JS[dayAbbr];
  if (targetJs === undefined) return pktNow;

  let diff = targetJs - todayJs;
  // Always go to the nearest occurrence (past or future within ±3 days)
  if (diff < -3) diff += 7;
  if (diff > 3) diff -= 7;

  const result = new Date(pktNow);
  result.setDate(pktNow.getDate() + diff);
  return result;
}

/**
 * Get PKT current time in minutes since midnight.
 */
function getPKTMinutes(): number {
  const now = new Date();
  const pktOffsetMs = 5 * 60 * 60 * 1000;
  const localOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  const pkt = new Date(now.getTime() + localOffsetMs + pktOffsetMs);
  return pkt.getHours() * 60 + pkt.getMinutes();
}

/**
 * Get the current PKT day as a DAYS abbreviation (Mon, Tue, etc.).
 */
function getCurrentPKTDayAbbr(): string {
  const now = new Date();
  const pktOffsetMs = 5 * 60 * 60 * 1000;
  const localOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  const pkt = new Date(now.getTime() + localOffsetMs + pktOffsetMs);
  const jsDay = pkt.getDay();
  return DAYS[JS_DAY_TO_IDX[jsDay] ?? 0];
}

/**
 * Find the next upcoming class across ALL days based on current PKT day + time.
 * Scans today first (live class, then upcoming), then wraps to subsequent days.
 */
function getNextUpcomingClass(
  allSlots: TimetableSlot[],
  nowMinutes: number,
  currentDayAbbr: string
): { slot: TimetableSlot; slotDay: string; isLive: boolean } | null {
  const currentIdx = DAYS.indexOf(currentDayAbbr);
  if (currentIdx < 0) return null;

  // Check today: live class first, then upcoming
  const todaySlots = sortSlots(
    allSlots.filter((s) =>
      DAY_MAP[currentDayAbbr]?.some((d) => s.day?.toLowerCase() === d.toLowerCase())
    )
  );

  const liveToday = todaySlots.find((s) => {
    const start = parseTimeToMinutes(s.start_time ?? s.time?.split("-")[0] ?? "");
    const end = parseTimeToMinutes(s.end_time ?? s.time?.split("-")[1] ?? "");
    return start >= 0 && end > start && start <= nowMinutes && nowMinutes < end;
  });
  if (liveToday) return { slot: liveToday, slotDay: currentDayAbbr, isLive: true };

  const upcomingToday = todaySlots.find((s) => {
    const start = parseTimeToMinutes(s.start_time ?? s.time?.split("-")[0] ?? "");
    return start > nowMinutes;
  });
  if (upcomingToday) return { slot: upcomingToday, slotDay: currentDayAbbr, isLive: false };

  // All today's classes passed — scan subsequent days (wrap around)
  for (let i = 1; i < DAYS.length; i++) {
    const nextIdx = (currentIdx + i) % DAYS.length;
    const nextDay = DAYS[nextIdx];
    const nextDaySlots = sortSlots(
      allSlots.filter((s) =>
        DAY_MAP[nextDay]?.some((d) => s.day?.toLowerCase() === d.toLowerCase())
      )
    );
    if (nextDaySlots.length > 0) {
      return { slot: nextDaySlots[0], slotDay: nextDay, isLive: false };
    }
  }

  return null;
}

function formatTime12(t: string): string {
  const mins = parseTimeToMinutes(t);
  if (mins < 0) return t;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function programName(section: string): string {
  if (section.startsWith("BSCS")) return "BS Computer Science";
  if (section.startsWith("BSSE")) return "BS Software Engineering";
  if (section.startsWith("BSAI")) return "BS Artificial Intelligence";
  if (section.startsWith("BSDS")) return "BS Data Science";
  if (section.startsWith("BSIT")) return "BS Information Technology";
  if (section.startsWith("BSCY")) return "BS Cybersecurity";
  if (section.startsWith("BSCGV")) return "BS Computer Graphics & Vision";
  if (section.startsWith("BSCOMP")) return "BS Computer Science (Comp)";
  return "BS Program";
}

export function PersonalTimetable({ section, onUploadNew, onAskAI }: PersonalTimetableProps) {
  // Default to today's weekday in PKT
  const pktDayIdx = JS_DAY_TO_IDX[new Date().getDay()] ?? 0;
  const [selectedDay, setSelectedDay] = useState(DAYS[pktDayIdx]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setTick] = useState(0); // force re-render for live class detection

  useEffect(() => {
    async function load() {
      try {
        const data = await timetableApi.get();
        setSlots(normalizeSlots(data));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    // Refresh live class detection every 30 seconds
    timerRef.current = setInterval(() => setTick(t => t + 1), 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────
  const nowMinutes = getPKTMinutes();

  // Get slots for selected day, sorted by start time
  const selectedDaySlots = sortSlots(
    slots.filter((s) =>
      DAY_MAP[selectedDay]?.some((d) => s.day?.toLowerCase() === d.toLowerCase())
    )
  );

  // Live class: currently happening
  const liveClass = selectedDaySlots.find((s) => {
    const start = parseTimeToMinutes(s.start_time ?? s.time?.split("-")[0] ?? "");
    const endStr = s.end_time ?? s.time?.split("-")[1] ?? "";
    const end = parseTimeToMinutes(endStr);
    return start >= 0 && end > start && start <= nowMinutes && nowMinutes < end;
  });

  // Next class: starts after now (only if no live class or it's the next after live)
  const nextClass = selectedDaySlots.find((s) => {
    const start = parseTimeToMinutes(s.start_time ?? s.time?.split("-")[0] ?? "");
    return start > nowMinutes;
  });

  // Global next upcoming class: based on current PKT day + time, independent of selected day
  const currentPKTDay = getCurrentPKTDayAbbr();
  const upcomingInfo = getNextUpcomingClass(slots, nowMinutes, currentPKTDay);

  // Date for selected day
  const selectedDate = getDateForDay(selectedDay);
  const dateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Semester insight
  const maxDayCount = DAYS.map((d) =>
    slots.filter((s) => DAY_MAP[d]?.includes(s.day ?? "")).length
  );
  const busiestDayIndex = maxDayCount.indexOf(Math.max(...maxDayCount));
  const busiestDay = DAYS[busiestDayIndex];

  // Check if today is selected
  const isToday = selectedDay === DAYS[JS_DAY_TO_IDX[new Date().getDay()] ?? 0];
  const noMoreClassesToday = isToday && !liveClass && !nextClass && selectedDaySlots.length > 0;

  // ── Empty state (no section yet) ────────────────────────────────────────
  if (!section) {
    return (
      <div className="max-w-[390px] md:max-w-5xl mx-auto min-h-screen pb-32 md:pb-12 bg-background-base flex flex-col">
        <header className="hidden md:flex sticky top-0 z-50 w-full bg-background-base px-6 py-4 items-center justify-between shadow-[0_4px_12px_rgba(209,217,230,0.4)]">
          <div className="w-10 h-10" />
          <h1 className="text-[20px] font-bold text-primary">My Timetable</h1>
          <div className="w-10 h-10" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 neumorphic-raised rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-outline text-5xl">event_busy</span>
          </div>
          <h2 className="text-[24px] font-bold text-primary mb-2">No timetable uploaded yet.</h2>
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

  // ── Main view ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-[390px] md:max-w-5xl mx-auto min-h-screen pb-32 md:pb-12 bg-background-base">
      {/* Desktop header */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-background-base px-6 py-4 items-center justify-between shadow-[0_4px_12px_rgba(209,217,230,0.4)]">
        <div className="w-10 h-10" />
        <h1 className="text-[20px] font-bold text-primary">My Timetable</h1>
        <button className="neumorphic-button-secondary w-10 h-10 flex items-center justify-center rounded-2xl active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-secondary">calendar_month</span>
        </button>
      </header>

      <main className="mt-6 px-6 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8 md:items-start">
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="md:col-span-7 space-y-6">

          {/* Header card — section + dynamic date for selected day */}
          <section className="neumorphic-raised rounded-[20px] p-5 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-[24px] font-bold text-primary">{section}</h2>
                <p className="text-[16px] text-on-surface-variant">{programName(section)}</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-success/10 rounded-full">
                <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
                <span className="text-success font-semibold text-[10px]">Timetable Synced</span>
              </div>
            </div>
            {/* Fix #2: shows date for the SELECTED day, not always today */}
            <p className="text-[14px] text-outline">{dateLabel}</p>
          </section>

          {/* Next Class card — always based on current PKT day + time, independent of selected day */}
          {!loading && !error && upcomingInfo && (
            <section
              className={`rounded-[20px] p-5 border-l-4 ${
                upcomingInfo.isLive
                  ? "bg-success/5 border-success"
                  : "neumorphic-raised border-secondary"
              }`}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${
                  upcomingInfo.isLive ? "text-success" : "text-secondary"
                }`}
              >
                Next Class - {DAY_FULL[upcomingInfo.slotDay]}
              </p>
              <h3 className="text-[18px] font-bold text-primary mb-2">{upcomingInfo.slot.course}</h3>
              <div className="grid grid-cols-2 gap-y-1">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span className="text-[13px]">
                    {formatTime12(upcomingInfo.slot.start_time ?? upcomingInfo.slot.time?.split("-")[0] ?? "")}
                    {" – "}
                    {formatTime12(upcomingInfo.slot.end_time ?? upcomingInfo.slot.time?.split("-")[1] ?? "")}
                  </span>
                </div>
                {upcomingInfo.slot.room && (
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="text-[13px]">{upcomingInfo.slot.room}</span>
                  </div>
                )}
                {upcomingInfo.slot.teacher && (
                  <div className="flex items-center gap-1.5 text-on-surface-variant col-span-2">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span className="text-[13px]">{upcomingInfo.slot.teacher}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Day selector */}
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

          {/* No more classes empty state (today only, after all classes are done) */}
          {!loading && !error && isToday && noMoreClassesToday && (
            <section className="neumorphic-raised rounded-[20px] p-5 text-center text-on-surface-variant text-[14px]">
              <span className="material-symbols-outlined text-3xl mb-2 block text-outline">done_all</span>
              No more classes today. You're done!
            </section>
          )}

          {/* Fix #3: Day's classes section – sorted by time, live class highlighted green */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-primary">{DAY_FULL[selectedDay]}'s Classes</h2>
              <span className="text-[14px] text-outline">{selectedDaySlots.length} classes</span>
            </div>

            {loading && (
              <div className="neumorphic-raised rounded-[20px] p-6 text-center flex items-center justify-center gap-3">
                <RoundSpinner size="sm" color="blue" />
                <span className="text-sm font-medium text-slate-600">Loading timetable...</span>
              </div>
            )}

            {error && !loading && (
              <div className="neumorphic-raised rounded-[20px] p-6 text-center">
                <p className="text-[14px] text-on-surface-variant mb-3">Timetable data not available.</p>
                <button onClick={onUploadNew} className="text-secondary font-semibold text-[14px] underline">
                  Upload a timetable
                </button>
              </div>
            )}

            {!loading && !error && selectedDaySlots.length === 0 && (
              <div className="neumorphic-raised rounded-[20px] p-6 text-center text-on-surface-variant text-[14px]">
                No classes on {DAY_FULL[selectedDay]}. Enjoy your day!
              </div>
            )}

            {/* Render live class first (pinned at top), then rest in chrono order */}
            {(() => {
              if (loading || error) return null;
              // Put live class first if it exists, then the rest sorted
              const ordered: TimetableSlot[] = liveClass
                ? [liveClass, ...selectedDaySlots.filter((s) => s !== liveClass)]
                : selectedDaySlots;

              return ordered.map((slot, i) => {
                const isLive = slot === liveClass;
                const startMin = parseTimeToMinutes(slot.start_time ?? slot.time?.split("-")[0] ?? "");
                const isPast = !isLive && startMin >= 0 && startMin < nowMinutes && isToday;
                return (
                  <div
                    key={i}
                    className={`rounded-[20px] p-5 relative overflow-hidden transition-all ${
                      isLive
                        ? "bg-success/8 border border-success/30 shadow-[0_0_20px_rgba(34,197,94,0.12)]"
                        : "neumorphic-raised"
                    } ${isPast ? "opacity-50" : ""}`}
                  >
                    {isLive && (
                      <div className="absolute top-0 right-0 p-3">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-success/15 text-success rounded-full text-[10px] font-bold uppercase tracking-wide">
                          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                          Live Now
                        </span>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <div
                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl flex-shrink-0 ${
                          isLive ? "bg-success/10" : "neumorphic-inset"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[28px] ${
                            isLive ? "text-success" : "text-secondary"
                          }`}
                        >
                          auto_stories
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[18px] font-bold text-primary pr-16">{slot.course}</h4>
                        <div className="grid grid-cols-2 gap-y-1 mt-2">
                          <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            <span className="text-[13px]">
                              {formatTime12(slot.start_time ?? slot.time?.split("-")[0] ?? "")}
                              {" – "}
                              {formatTime12(slot.end_time ?? slot.time?.split("-")[1] ?? "")}
                            </span>
                          </div>
                          {slot.room && (
                            <div className="flex items-center gap-1.5 text-on-surface-variant">
                              <span className="material-symbols-outlined text-[16px]">location_on</span>
                              <span className="text-[13px]">{slot.room}</span>
                            </div>
                          )}
                          {slot.teacher && (
                            <div className="flex items-center gap-1.5 text-on-surface-variant col-span-2">
                              <span className="material-symbols-outlined text-[16px]">person</span>
                              <span className="text-[13px]">{slot.teacher}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </section>
        </div>

        {/* ── Right column ──────────────────────────────────────────────── */}
        <div className="md:col-span-5 space-y-6">

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
                  You have <strong className="text-secondary">{selectedDaySlots.length} classes</strong> on {DAY_FULL[selectedDay]}.{" "}
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
