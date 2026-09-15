import { Check, FileText, MessageCircle } from "lucide-react";
import { Eyebrow, SectionLabel, Shell } from "../components/ui";

function StepMark({ n }: { n: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-2 w-2 items-center justify-center rounded-full bg-accent" />
      <span className="font-mono text-sm font-medium tracking-tight text-accent">
        {n}
      </span>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-line bg-paper py-20 md:py-28"
    >
      <Shell>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="02" label="How it works" />
            <h2 className="mt-6 max-w-[22ch] text-headline font-semibold text-ink">
              Three messages and you are set up.
            </h2>
          </div>
          <p className="max-w-[34ch] text-sm text-muted md:text-right">
            The whole setup happens inside a chat you already have open. No app
            to install.
          </p>
        </div>

        <div className="mt-16 border-t border-line">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="border-line py-8 md:border-r md:pr-8">
              <StepMark n="01" />
              <h3 className="mt-6 text-title font-semibold text-ink">
                Message the bot
              </h3>
              <p className="mt-3 max-w-[32ch] text-sm text-muted">
                Send hello to DueMate on WhatsApp. You start the conversation —
                always.
              </p>
              <div className="mt-7 flex justify-end">
                <div className="w-fit rounded-xl rounded-br-sm bg-wa-wash px-3.5 py-2 shadow-hair">
                  <span className="text-sm text-ink">hello</span>
                  <span className="ml-2 font-mono text-eyebrow text-faint">
                    09:01
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <MessageCircle strokeWidth={1.5} className="h-3.5 w-3.5 text-faint" />
                <Eyebrow>to DueMate · WhatsApp</Eyebrow>
              </div>
            </div>

            <div className="border-t border-line py-8 md:border-l-0 md:border-r md:border-t-0 md:px-8">
              <StepMark n="02" />
              <h3 className="mt-6 text-title font-semibold text-ink">
                Verify your number
              </h3>
              <p className="mt-3 max-w-[32ch] text-sm text-muted">
                Enter your number and the 6-digit code sent in the chat.
              </p>
              <div className="mt-7 flex gap-1.5">
                {["4", "9", "2", "1", "0", "7"].map((d, i) => (
                  <span
                    key={d + i}
                    className={
                      "flex h-11 w-9 items-center justify-center rounded-md border font-mono text-base text-ink " +
                      (i < 4
                        ? "border-line bg-paper-raise"
                        : "border-accent-wash bg-accent-wash text-accent")
                    }
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="mt-3">
                <Eyebrow>expires in 04:52</Eyebrow>
              </div>
            </div>

            <div className="border-t border-line py-8 md:border-t-0 md:pl-8">
              <StepMark n="03" />
              <h3 className="mt-6 text-title font-semibold text-ink">
                Add your semester
              </h3>
              <p className="mt-3 max-w-[32ch] text-sm text-muted">
                Upload a Riphah timetable PDF or paste a deadline from WhatsApp.
              </p>
              <div className="mt-7 flex items-center gap-3 rounded-xl border border-line bg-paper-raise px-3.5 py-3 shadow-hair">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-wash">
                  <FileText strokeWidth={1.5} className="h-4 w-4 text-accent" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-ink">
                    bscs-7b-fall-timetable.pdf
                  </p>
                  <p className="mt-0.5 font-mono text-eyebrow uppercase text-wa-deep">
                    Parsed · 5 days
                  </p>
                </div>
                <Check strokeWidth={2} className="h-4 w-4 text-wa-deep" />
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
