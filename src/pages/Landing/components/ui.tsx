import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function Eyebrow({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "onink";
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent"
      : tone === "onink"
        ? "text-onink-muted"
        : "text-faint";
  return (
    <span className={"font-mono text-eyebrow uppercase font-medium " + toneClass}>
      {children}
    </span>
  );
}

export function PrimaryCta({
  children = "Connect WhatsApp",
  size = "md",
  onInk = false,
  onClick,
}: {
  children?: ReactNode;
  size?: "md" | "lg";
  onInk?: boolean;
  onClick?: () => void;
}) {
  const pad = size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm";
  const skin = onInk
    ? "bg-onink text-ink hover:bg-white"
    : "bg-accent text-white shadow-cta hover:bg-accent-deep";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group inline-flex items-center gap-2 rounded-full font-medium tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper " +
        pad +
        " " +
        skin
      }
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className="absolute h-2 w-2 rounded-full bg-wa opacity-70" />
        <span className="h-1 w-1 rounded-full bg-wa" />
      </span>
      {children}
    </button>
  );
}

export function SecondaryCta({
  children,
  size = "md",
  onInk = false,
  onClick,
}: {
  children: ReactNode;
  size?: "md" | "lg";
  onInk?: boolean;
  onClick?: () => void;
}) {
  const pad = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm";
  const skin = onInk
    ? "border-ink-line text-onink hover:border-onink-muted"
    : "border-line bg-paper-raise text-fg hover:border-fg";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group inline-flex items-center gap-2 rounded-full border font-medium tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
        pad +
        " " +
        skin
      }
    >
      {children}
      <ArrowRight strokeWidth={1.5} className="h-4 w-4 opacity-60" />
    </button>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">{children}</div>
  );
}

export function SectionLabel({
  index,
  label,
  tone = "muted",
}: {
  index: string;
  label: string;
  tone?: "muted" | "onink";
}) {
  const line = tone === "onink" ? "bg-ink-line" : "bg-line";
  return (
    <div className="flex items-center gap-3">
      <Eyebrow tone={tone === "onink" ? "onink" : "muted"}>{index}</Eyebrow>
      <span className={"h-px w-8 " + line} />
      <Eyebrow tone={tone === "onink" ? "onink" : "muted"}>{label}</Eyebrow>
    </div>
  );
}
