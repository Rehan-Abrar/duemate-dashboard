import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { SectionLabel, Shell } from "../components/ui";

const faqs = [
  {
    q: "Is this only for Riphah?",
    a: "The timetable system is currently built around Riphah University timetable formats and published sections. Students from other universities can still use WhatsApp deadline tracking where supported.",
  },
  {
    q: "Will you spam me?",
    a: "No. You message the bot first, and after you verify your number DueMate only sends deadline reminders. No marketing, no unsolicited messages.",
  },
  {
    q: "Does DueMate write my assignments?",
    a: "No. DueMate keeps track of what is due and reminds you in time. The work stays yours.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="border-t border-line bg-paper py-20 md:py-28">
      <Shell>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <SectionLabel index="06" label="FAQ" />
            <h2 className="mt-6 max-w-[16ch] text-headline font-semibold text-ink">
              Fair questions.
            </h2>
          </div>

          <div className="lg:col-span-8">
            <div className="border-t border-line">
              {faqs.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.q} className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="text-title font-semibold text-ink">
                        {f.q}
                      </span>
                      <span
                        className={
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border " +
                          (isOpen
                            ? "border-accent bg-accent"
                            : "border-line bg-paper-raise")
                        }
                      >
                        {isOpen ? (
                          <Minus strokeWidth={1.75} className="h-4 w-4 text-white" />
                        ) : (
                          <Plus strokeWidth={1.75} className="h-4 w-4 text-muted" />
                        )}
                      </span>
                    </button>
                    {isOpen ? (
                      <p className="max-w-[62ch] pb-7 text-lead text-muted">
                        {f.a}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
