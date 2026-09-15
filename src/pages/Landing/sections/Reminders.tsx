import { BellRing, Ban, FileCheck2, HandHeart, PenOff } from "lucide-react";
import { Eyebrow, SectionLabel, Shell } from "../components/ui";
import { PhoneMock } from "../components/ProductMocks";

const principles = [
  {
    icon: HandHeart,
    title: "You message the bot first",
    body: "The conversation starts with your hello — never ours.",
  },
  {
    icon: Ban,
    title: "No unsolicited messages",
    body: "Nothing arrives before you verify your number.",
  },
  {
    icon: BellRing,
    title: "Reminders only",
    body: "Deadline nudges. No marketing, no chatter.",
  },
  {
    icon: PenOff,
    title: "DueMate does not write assignments",
    body: "It keeps track of them. The work stays yours.",
  },
  {
    icon: FileCheck2,
    title: "Built for Riphah PDFs",
    body: "Timetable import currently supports Riphah University exports.",
  },
];

export default function Reminders() {
  return (
    <section className="bg-ink py-20 md:py-28">
      <Shell>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="flex justify-center lg:col-span-5 lg:justify-start">
            <PhoneMock />
          </div>

          <div className="lg:col-span-7 lg:pl-6">
            <SectionLabel index="05" label="WhatsApp reminders" tone="onink" />
            <h2 className="mt-6 max-w-[26ch] text-headline font-semibold text-onink">
              Reminders land where you already are.
            </h2>
            <p className="mt-6 max-w-[52ch] text-lead text-onink-muted">
              After you verify, DueMate can send deadline alerts to your WhatsApp
              number. You start the conversation with hello. We do not message
              you first.
            </p>

            <div className="mt-12">
              <Eyebrow tone="onink">The boundaries, plainly</Eyebrow>
              <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-ink-line sm:grid-cols-2">
                {principles.map((p) => {
                  const Icon = p.icon;
                  return (
                    <li
                      key={p.title}
                      className="flex gap-3.5 bg-ink-raise p-5"
                    >
                      <Icon
                        strokeWidth={1.5}
                        className="mt-0.5 h-4.5 w-4.5 shrink-0 text-wa"
                      />
                      <div>
                        <p className="text-sm font-semibold tracking-tight text-onink">
                          {p.title}
                        </p>
                        <p className="mt-1 text-sm text-onink-muted">{p.body}</p>
                      </div>
                    </li>
                  );
                })}
                <li className="hidden bg-ink-raise p-5 sm:block" />
              </ul>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
