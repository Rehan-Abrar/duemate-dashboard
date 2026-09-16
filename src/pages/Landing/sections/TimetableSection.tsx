import { FileText, Layers, Repeat } from "lucide-react";
import { Eyebrow, SectionLabel, Shell } from "../components/ui";
import { TimetableMock } from "../components/ProductMocks";

const notes = [
  {
    icon: FileText,
    title: "Official timetable",
    body: "Use the latest timetable published for your section.",
  },
  {
    icon: Layers,
    title: "One clean week",
    body: "See classes, times, subjects, and rooms in one view.",
  },
  {
    icon: Repeat,
    title: "Changed section?",
    body: "Switch sections and your timetable updates automatically.",
  },
];

export default function TimetableSection() {
  return (
    <section className="border-t border-line bg-paper-deep py-20 md:py-28">
      <Shell>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <SectionLabel index="03" label="Timetable" />
            <h2 className="mt-6 text-headline font-semibold text-ink">
              Your timetable, without the PDF.
            </h2>
            <p className="mt-6 max-w-[40ch] text-lead text-muted">
              Choose your section to use the latest published timetable, or
              upload your own when one isn’t available. DueMate turns it into a
              simple weekly view of your classes, rooms, and times.
            </p>

            <ul className="mt-10 space-y-6">
              {notes.map((n) => {
                const Icon = n.icon;
                return (
                  <li key={n.title} className="flex gap-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-paper">
                      <Icon strokeWidth={1.5} className="h-4 w-4 text-accent" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-ink">
                        {n.title}
                      </p>
                      <p className="mt-1 max-w-[34ch] text-sm text-muted">
                        {n.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-10">
              <Eyebrow>Tap a day — it is the real view</Eyebrow>
            </p>
          </div>

          <div className="lg:col-span-8 lg:pl-4">
            <TimetableMock />
          </div>
        </div>
      </Shell>
    </section>
  );
}
