import { Eyebrow, PrimaryCta, SecondaryCta, Shell } from "../components/ui";

export default function FinalCta({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative overflow-hidden border-t border-line bg-paper-deep py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_120%,rgba(37,73,232,0.1),transparent_70%)]" />
      <Shell>
        <div className="relative mx-auto max-w-[880px] text-center">
          <Eyebrow>07 · Get started</Eyebrow>
          <h2 className="mt-6 text-display font-semibold text-ink">
            Ready to stop
            <br />
            missing university deadlines?
          </h2>
          <p className="mx-auto mt-7 max-w-[46ch] text-lead text-muted">
            Message DueMate, verify your number, then add your timetable.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <PrimaryCta size="lg" onClick={onGetStarted}>Connect WhatsApp</PrimaryCta>
            <SecondaryCta size="lg" onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}>See how it works</SecondaryCta>
          </div>
        </div>
      </Shell>
    </section>
  );
}
