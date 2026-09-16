import { useState } from "react";
import { ArrowDown, ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import { Eyebrow, SectionLabel, Shell } from "../components/ui";

type Key = "course" | "due" | "room" | null;

const maps: { key: Exclude<Key, null>; snippet: string; field: string }[] = [
  { key: "course", snippet: "Information Security", field: "Course" },
  { key: "due", snippet: "tomorrow", field: "Due" },
  { key: "room", snippet: "Classroom 8", field: "Room" },
];

export default function Transform() {
  const [hot, setHot] = useState<Key>("course");

  const phrase = (key: Exclude<Key, null>, text: string) => (
    <span
      className={
        "rounded-sm px-0.5 " +
        (hot === key ? "bg-accent-wash text-accent" : "text-ink")
      }
    >
      {text}
    </span>
  );

  const field = (key: Exclude<Key, null>, label: string, value: string) => (
    <div
      className={
        "flex items-baseline justify-between gap-4 rounded-md px-2 py-2 " +
        (hot === key ? "bg-accent-wash" : "bg-transparent")
      }
    >
      <span className="font-mono text-eyebrow uppercase text-muted">
        {label}
      </span>
      <span
        className={
          "text-sm font-medium tracking-tight " +
          (hot === key ? "text-accent" : "text-ink")
        }
      >
        {value}
      </span>
    </div>
  );

  return (
    <section className="border-t border-line bg-paper py-20 md:py-28">
      <Shell>
        <div>
          <SectionLabel index="04" label="WhatsApp → Deadline" />
          <h2 className="mt-6 max-w-[30ch] text-headline font-semibold text-ink">
            Turn a WhatsApp message into a deadline.
          </h2>
          <p className="mt-6 max-w-[52ch] text-lead text-muted">
            Paste a quiz, assignment, or submission message from your group.
            DueMate extracts the useful details and lets you confirm them before
            saving.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-wa" />
              <Eyebrow>Pasted from WhatsApp</Eyebrow>
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-line bg-wa-wash p-4 shadow-hair md:p-5">
              <p className="text-lead leading-relaxed tracking-tight text-ink">
                "Quiz {phrase("due", "tomorrow")} in{" "}
                {phrase("course", "Information Security")},{" "}
                {phrase("room", "Classroom 8")}."
              </p>
              <p className="mt-3 text-right font-mono text-eyebrow text-faint">
                CR · Talha — 22:14
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 lg:px-6">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Sparkles strokeWidth={1.5} className="h-3.5 w-3.5 text-accent" />
              <Eyebrow tone="accent">What DueMate reads</Eyebrow>
            </div>
            <ul className="divide-y divide-line">
              {maps.map((m) => (
                <li key={m.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setHot(m.key)}
                    onFocus={() => setHot(m.key)}
                    onClick={() => setHot(m.key)}
                    className="w-full py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span
                      className={
                        "inline-block rounded-md px-2 py-1 font-mono text-xs " +
                        (hot === m.key
                          ? "bg-accent text-white"
                          : "bg-paper-deep text-muted")
                      }
                    >
                      "{m.snippet}"
                    </span>
                    <span className="mt-2 flex items-center gap-3 pl-1">
                      <ArrowDown
                        strokeWidth={1.5}
                        className="h-3.5 w-3.5 shrink-0 text-faint"
                      />
                      <span className="h-px w-6 border-t border-dashed border-line" />
                      <span
                        className={
                          "font-mono text-eyebrow uppercase " +
                          (hot === m.key ? "text-accent" : "text-faint")
                        }
                      >
                        {m.field}
                      </span>
                      <span className="h-px flex-1 border-t border-dashed border-line" />
                      <ArrowRight
                        strokeWidth={1.5}
                        className="h-3.5 w-3.5 shrink-0 text-faint"
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="pt-3">
              <Eyebrow>Review it once. Then it’s tracked.</Eyebrow>
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <Eyebrow>Kept in DueMate</Eyebrow>
            </div>
            <div className="rounded-2xl bg-cool p-5 shadow-lift">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-due-wash shadow-neu-in">
                  <ClipboardList
                    strokeWidth={1.5}
                    className="h-4.5 w-4.5 text-due"
                  />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-eyebrow uppercase text-muted">
                    Quiz
                  </p>
                  <h3 className="mt-1 text-title font-semibold text-ink">
                    Information Security Quiz
                  </h3>
                  <p className="mt-1 font-mono text-xs text-due">Due soon</p>
                </div>
              </div>

              <div className="mt-5 space-y-1 border-t border-line-cool pt-3">
                {field("course", "Course", "Information Security")}
                {field("due", "Due", "Tomorrow · 09:00")}
                {field("room", "Room", "Classroom 8")}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-cool px-3 py-2.5 shadow-neu-in">
                <span className="h-1.5 w-1.5 rounded-full bg-wa" />
                <span className="font-mono text-eyebrow uppercase text-wa-deep">
                  Reminder scheduled · 6h before
                </span>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
