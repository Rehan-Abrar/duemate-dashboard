import { Eyebrow, PrimaryCta, SecondaryCta, Shell } from "../components/ui";
import { HomeMock, ReminderChip } from "../components/ProductMocks";

function TrustLine({ children }: { children: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-1 rounded-full bg-accent" />
      <Eyebrow>{children}</Eyebrow>
    </span>
  );
}

export default function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_460px_at_72%_18%,rgba(37,73,232,0.08),transparent_72%)]" />

      <Shell>
        <div className="relative grid grid-cols-1 items-center gap-14 pb-20 pt-14 lg:grid-cols-12 lg:gap-8 lg:pb-32 lg:pt-24">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-raise px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-wa" />
              <Eyebrow>For Riphah University students</Eyebrow>
            </span>

            <h1 className="mt-7 text-display font-semibold text-ink">
              Never miss
              <br />
              a deadline on
              <br />{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">WhatsApp.</span>
                <span className="absolute bottom-1.5 left-0 h-1 w-full rounded-full bg-wa" />
              </span>
            </h1>

            <p className="mt-7 max-w-[52ch] text-lead text-muted">
              A WhatsApp deadline assistant for university students. Keep your
              timetable, quizzes, assignments, and reminders in one place —
              then get notified before something is due.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <PrimaryCta size="lg" onClick={onGetStarted}>Connect WhatsApp</PrimaryCta>
              <SecondaryCta size="lg" onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}>See how it works</SecondaryCta>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
              <TrustLine>You stay in control</TrustLine>
              <TrustLine>Academic reminders</TrustLine>
              <TrustLine>No marketing messages</TrustLine>
            </div>
          </div>

          <div className="relative lg:col-span-5 lg:pl-2">
            <div className="relative mx-auto max-w-[500px] lg:max-w-none lg:translate-x-4">
              <div className="absolute inset-0 translate-x-4 translate-y-5 rounded-3xl bg-cool-deep opacity-55" />
              <div className="relative">
                <HomeMock />
              </div>
              <div className="absolute -bottom-14 -left-6 hidden sm:block lg:-left-20">
                <ReminderChip />
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
