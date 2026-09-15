import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  Eye,
  FlaskConical,
  ShieldAlert,
  Terminal,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * Shared product-surface atoms. Cool neumorphic language, carried
 * from the live DueMate dashboard. Only used inside mockups.
 * ------------------------------------------------------------------ */

export function WhatsAppConnectedPill({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-cool px-3 py-1.5 shadow-neu-in">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-wa opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-wa" />
      </span>
      <span className="font-mono text-eyebrow uppercase font-medium text-wa-deep">
        {compact ? "Connected" : "WhatsApp Connected"}
      </span>
    </span>
  );
}

export function AppChrome({
  label = "Home",
  right,
}: {
  label?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cool shadow-neu-sm">
          <Calendar strokeWidth={1.75} className="h-3.5 w-3.5 text-accent" />
        </span>
        <span className="text-xs font-semibold tracking-tight text-ink">
          DueMate
        </span>
        <span className="text-xs text-faint">·</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
      {right}
    </div>
  );
}

const subjectIcons = {
  vision: Eye,
  compiler: Terminal,
  lab: FlaskConical,
  security: ShieldAlert,
  book: BookOpen,
} as const;

type SubjectKey = keyof typeof subjectIcons;

function ClassRow({
  time,
  title,
  room,
  icon,
  tag,
}: {
  time: string;
  title: string;
  room: string;
  icon: SubjectKey;
  tag?: string;
}) {
  const Icon = subjectIcons[icon];
  return (
    <div className="flex items-center gap-4 rounded-xl bg-cool p-3 shadow-neu-sm transition-none">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cool shadow-neu-in">
        <Icon strokeWidth={1.5} className="h-4.5 w-4.5 text-accent" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold tracking-tight text-ink">
            {title}
          </p>
          {tag ? (
            <span className="rounded-sm bg-cool-deep px-1.5 py-0.5 font-mono text-eyebrow uppercase text-muted">
              {tag}
            </span>
          ) : null}
        </div>
        <p className="mt-1 flex items-center gap-2 font-mono text-xs text-muted">
          <span className="text-ink">{time}</span>
          <span className="h-1 w-1 rounded-full bg-line-cool" />
          <span>{room}</span>
        </p>
      </div>
    </div>
  );
}

export function DeadlineRow({
  title = "Information Security Quiz",
  state = "Due soon",
  type = "Quiz",
  raised = false,
}: {
  title?: string;
  state?: string;
  type?: string;
  raised?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center gap-4 rounded-xl bg-cool p-3 " +
        (raised ? "shadow-neu" : "shadow-neu-sm")
      }
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-due-wash shadow-neu-in">
        <ClipboardList strokeWidth={1.5} className="h-4.5 w-4.5 text-due" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold tracking-tight text-ink">
            {title}
          </p>
          <span className="rounded-sm bg-cool-deep px-1.5 py-0.5 font-mono text-eyebrow uppercase text-muted">
            {type}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-due">{state}</p>
      </div>
      <ChevronRight strokeWidth={1.5} className="h-4 w-4 text-faint" />
    </div>
  );
}

function SubHead({ children, count }: { children: string; count?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-eyebrow uppercase font-medium text-muted">
        {children}
      </span>
      {count ? (
        <span className="rounded-full bg-cool px-2 py-0.5 font-mono text-eyebrow text-accent shadow-neu-in">
          {count}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * DueMate · Home
 * ------------------------------------------------------------------ */

export function HomeMock() {
  return (
    <div className="w-full rounded-3xl bg-cool p-5 shadow-lift md:p-6">
      <AppChrome right={<WhatsAppConnectedPill />} />

      <div className="mt-6">
        <p className="font-mono text-eyebrow uppercase text-faint">
          Monday, 14 September
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Good morning
        </h3>
        <p className="mt-1.5 text-sm text-muted">
          Two classes today and one quiz coming up.
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        <SubHead count="2">Today's Classes</SubHead>
        <ClassRow
          time="8:00–10:00"
          title="Computer Vision"
          room="Classroom 1"
          icon="vision"
        />
        <ClassRow
          time="1:30–3:30"
          title="Compiler Construction"
          room="Classroom 1"
          icon="compiler"
        />
      </div>

      <div className="mt-6 space-y-2.5">
        <SubHead count="1">Deadlines</SubHead>
        <DeadlineRow />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * DueMate · Week — interactive day rail
 * ------------------------------------------------------------------ */

type Slot = { time: string; title: string; room: string; icon: SubjectKey; tag?: string };

const week: { day: string; short: string; slots: Slot[] }[] = [
  {
    day: "Monday",
    short: "Mon",
    slots: [
      { time: "8:00–10:00", title: "Computer Vision", room: "Classroom 1", icon: "vision" },
      {
        time: "10:30–1:00",
        title: "Compiler Construction Lab",
        room: "Computer Lab 2",
        icon: "lab",
        tag: "Lab",
      },
      { time: "1:30–3:30", title: "Compiler Construction", room: "Classroom 1", icon: "compiler" },
    ],
  },
  {
    day: "Tuesday",
    short: "Tue",
    slots: [
      { time: "9:00–11:00", title: "Information Security", room: "Classroom 8", icon: "security" },
      { time: "11:30–1:30", title: "Computer Vision Lab", room: "Computer Lab 1", icon: "lab", tag: "Lab" },
    ],
  },
  {
    day: "Wednesday",
    short: "Wed",
    slots: [
      {
        time: "8:00–11:00",
        title: "Information Security Lab",
        room: "Computer Lab 2",
        icon: "lab",
        tag: "Lab",
      },
      { time: "1:30–3:30", title: "Computer Vision", room: "Classroom 1", icon: "vision" },
    ],
  },
  {
    day: "Thursday",
    short: "Thu",
    slots: [
      { time: "10:30–12:30", title: "Compiler Construction", room: "Classroom 1", icon: "compiler" },
      { time: "1:30–3:30", title: "Information Security", room: "Classroom 8", icon: "security" },
    ],
  },
  { day: "Friday", short: "Fri", slots: [{ time: "9:00–11:00", title: "Computer Vision", room: "Classroom 1", icon: "vision" }] },
  { day: "Saturday", short: "Sat", slots: [] },
];

export function TimetableMock() {
  const [active, setActive] = useState(0);
  const current = week[active];

  return (
    <div className="w-full rounded-3xl bg-cool p-5 shadow-lift md:p-7">
      <AppChrome label="Week" right={<WhatsAppConnectedPill compact />} />

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
            BSCS-7B
          </h3>
          <p className="mt-1 text-sm text-muted">BS Computer Science · Fall</p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-cool px-3 py-1.5 shadow-neu-in sm:inline-flex">
          <Check strokeWidth={2} className="h-3 w-3 text-wa-deep" />
          <span className="font-mono text-eyebrow uppercase text-wa-deep">
            Timetable synced
          </span>
        </span>
      </div>

      <div className="mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {week.map((d, i) => {
          const isActive = i === active;
          return (
            <button
              key={d.short}
              type="button"
              onClick={() => setActive(i)}
              className={
                "shrink-0 rounded-lg px-4 py-2 font-mono text-xs uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
                (isActive
                  ? "bg-accent text-white shadow-neu-sm"
                  : "bg-cool text-muted shadow-neu-sm hover:text-ink")
              }
            >
              {d.short}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-eyebrow uppercase font-medium text-muted">
          {current.day}
        </span>
        <span className="rounded-full bg-cool px-2 py-0.5 font-mono text-eyebrow text-accent shadow-neu-in">
          {current.slots.length === 0
            ? "Free"
            : current.slots.length + (current.slots.length === 1 ? " class" : " classes")}
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {current.slots.length === 0 ? (
          <div className="rounded-xl bg-cool p-8 text-center shadow-neu-in">
            <p className="text-sm font-medium text-ink">No classes on Saturday</p>
            <p className="mt-1 text-xs text-muted">
              A good day to clear a deadline.
            </p>
          </div>
        ) : (
          current.slots.map((s) => <ClassRow key={s.title + s.time} {...s} />)
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * WhatsApp artefacts
 * ------------------------------------------------------------------ */

export function ChatBubble({
  children,
  time,
  from = "them",
  author,
  dim = false,
}: {
  children: React.ReactNode;
  time: string;
  from?: "them" | "me";
  author?: string;
  dim?: boolean;
}) {
  const mine = from === "me";
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          "max-w-[86%] rounded-xl px-3.5 py-2.5 shadow-hair " +
          (mine ? "bg-wa-wash" : "bg-paper-raise") +
          (dim ? " opacity-45" : "")
        }
      >
        {author && !mine ? (
          <p className="mb-1 text-xs font-semibold tracking-tight text-wa-deep">
            {author}
          </p>
        ) : null}
        <div className="text-sm leading-snug text-ink">{children}</div>
        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="font-mono text-eyebrow text-faint">{time}</span>
          {mine ? (
            <CheckCheck strokeWidth={2} className="h-3 w-3 text-wa-deep" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* Phone with the DueMate reminder thread */
export function PhoneMock() {
  return (
    <div className="w-[286px] shrink-0 rounded-3xl bg-cool p-2.5 shadow-float sm:w-[320px]">
      <div className="overflow-hidden rounded-2xl bg-paper-deep">
        {/* thread header */}
        <div className="flex items-center gap-3 bg-wa-deep px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <Calendar strokeWidth={1.75} className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">
              DueMate
            </p>
            <p className="font-mono text-eyebrow uppercase text-white/70">
              online
            </p>
          </div>
        </div>

        <div className="space-y-2.5 px-3 py-4">
          <div className="flex justify-center">
            <span className="rounded-md bg-white/70 px-2 py-0.5 font-mono text-eyebrow uppercase text-muted">
              Today
            </span>
          </div>

          <ChatBubble from="me" time="09:02">
            hello
          </ChatBubble>

          <div className="flex justify-start">
            <div className="max-w-[92%] rounded-xl bg-paper-raise px-3.5 py-3 shadow-hair">
              <p className="font-mono text-eyebrow uppercase font-medium text-due">
                Due today
              </p>
              <p className="mt-2 text-sm font-semibold leading-snug tracking-tight text-ink">
                Quiz: Information Security Quiz
              </p>
              <p className="mt-1 text-sm text-muted">Due in 6 hours</p>
              <div className="mt-3 border-t border-line pt-2.5">
                <span className="text-sm font-medium text-accent">
                  View details in DueMate
                </span>
              </div>
              <div className="mt-1.5 text-right">
                <span className="font-mono text-eyebrow text-faint">09:02</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small floating reminder card used in the hero composition */
export function ReminderChip() {
  return (
    <div className="w-[248px] rounded-xl bg-paper-raise p-3.5 shadow-float">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wa-wash">
          <Calendar strokeWidth={2} className="h-3 w-3 text-wa-deep" />
        </span>
        <span className="text-xs font-semibold tracking-tight text-ink">
          DueMate
        </span>
        <span className="ml-auto font-mono text-eyebrow uppercase text-faint">
          now
        </span>
      </div>
      <p className="mt-2.5 text-sm font-semibold leading-snug tracking-tight text-ink">
        Quiz: Information Security
      </p>
      <p className="mt-0.5 font-mono text-xs text-due">Due in 6 hours</p>
    </div>
  );
}
