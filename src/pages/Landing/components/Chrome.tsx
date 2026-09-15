import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { PrimaryCta, Shell } from "./ui";

export function Nav({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-50 bg-paper " +
        (scrolled ? "border-b border-line" : "border-b border-transparent")
      }
    >
      <Shell>
        <div className="flex h-16 items-center justify-between md:h-20">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
              <Calendar strokeWidth={1.75} className="h-4 w-4 text-paper" />
            </span>
            <span className="text-base font-semibold tracking-tight text-ink">
              DueMate
            </span>
          </a>

          <nav className="flex items-center gap-1 md:gap-2">
            <a
              href="#how-it-works"
              className="hidden rounded-full px-3 py-2 text-sm text-muted hover:text-ink sm:block"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="hidden rounded-full px-3 py-2 text-sm text-muted hover:text-ink sm:block"
            >
              FAQ
            </a>
            <span className="ml-2">
              <PrimaryCta onClick={onGetStarted}>Connect WhatsApp</PrimaryCta>
            </span>
          </nav>
        </div>
      </Shell>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-10">
      <Shell>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink">
              <Calendar strokeWidth={1.75} className="h-3.5 w-3.5 text-paper" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink">
              DueMate
            </span>
            <span className="ml-1 text-sm text-faint">
              Deadline reminders for university students
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#how-it-works" className="text-sm text-muted hover:text-ink">
              How it works
            </a>
            <a href="#faq" className="text-sm text-muted hover:text-ink">
              FAQ
            </a>
            <span className="font-mono text-eyebrow uppercase text-faint">
              Riphah · BSCS
            </span>
          </div>
        </div>
      </Shell>
    </footer>
  );
}
