import { BellRing, Ban, FileCheck2, HandHeart, PenOff } from "lucide-react";
import { Eyebrow, SectionLabel, Shell } from "../components/ui";
import { PhoneMock } from "../components/ProductMocks";

const principles = [
  {
    icon: HandHeart,
    title: "You stay in control",
    body: "You start the conversation, connect your number, and decide what DueMate tracks.",
  },
  {
    icon: Ban,
    title: "No marketing messages",
    body: "DueMate’s reminders are tied to the academic deadlines you add.",
  },
  {
    icon: BellRing,
    title: "Academic reminders",
    body: "Only the reminders you’ve asked DueMate to keep track of.",
  },
  {
    icon: PenOff,
    title: "Your work stays yours",
    body: "DueMate tracks deadlines. It doesn’t write assignments or complete academic work for you.",
  },
  {
    icon: FileCheck2,
    title: "Built for Riphah",
    body: "Timetable support is currently built around Riphah University formats.",
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
              Once you’ve connected and verified your number, DueMate sends
              deadline reminders to WhatsApp. You start the conversation —
              DueMate doesn’t message you out of the blue.
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
