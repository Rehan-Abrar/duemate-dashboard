import { Eyebrow, PrimaryCta, SecondaryCta, Shell } from "../components/ui";
import { DeadlineRow } from "../components/ProductMocks";

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
            missing deadlines?
          </h2>
          <p className="mx-auto mt-7 max-w-[46ch] text-lead text-muted">
            Message the DueMate bot, verify your number, then add your semester.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <PrimaryCta size="lg" onClick={onGetStarted}>Connect WhatsApp</PrimaryCta>
            <SecondaryCta size="lg" onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}>See how it works</SecondaryCta>
          </div>

          <div className="mx-auto mt-16 max-w-[440px]">
            <div className="rounded-2xl bg-cool p-3 shadow-lift">
              <DeadlineRow state="Due in 6 hours · reminder sent" />
            </div>
            <p className="mt-4">
              <Eyebrow>Nothing buried. Nothing forgotten.</Eyebrow>
            </p>
          </div>
        </div>
      </Shell>
    </section>
  );
}
