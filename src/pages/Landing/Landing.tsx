import { useEffect, useRef } from "react";

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 768 && phoneRef.current) {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
        phoneRef.current.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={s.page}>
      {/* ── Background blobs ───────────────────────────── */}
      <div style={s.blobWrap} aria-hidden>
        <div style={{ ...s.blob, width: 500, height: 500, top: -96, left: -96, background: "#2563EB" }} />
        <div style={{ ...s.blob, width: 600, height: 600, bottom: 0, right: -96, background: "#0F172A" }} />
      </div>

      {/* ── Nav ───────────────────────────────────────── */}
      <nav style={s.nav}>
        <div className="neu-raised-premium" style={s.navBrand}>
          <span className="material-symbols-outlined" style={{ color: "#2563EB", fontSize: 22 }}>auto_awesome</span>
          <span style={s.navTitle}>DueMate</span>
        </div>
        <button onClick={onGetStarted} className="neumorphic-button-primary" style={s.navCta}>
          Get Started
        </button>
      </nav>

      {/* ── Main ──────────────────────────────────────── */}
      <main className="w-full max-w-[480px] md:max-w-6xl mx-auto pt-28 pb-20 px-6 relative z-10">

        {/* Hero */}
        <section className="text-center md:text-left md:grid md:grid-cols-2 md:items-center md:gap-12 mb-16">
          <div>
          <div style={s.badge}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#2563EB" }}>auto_awesome</span>
            <span>2026 Academic OS</span>
          </div>

          <h1 style={s.heroHeading}>
            The AI that <br />
            <span style={{ color: "#2563EB", fontStyle: "italic" }}>Finishes</span> the work.
          </h1>

          <p style={s.heroSub} className="md:px-0">
            Your syllabus, your schedule, your WhatsApp. DueMate is the ghost-writer for your productivity.
          </p>
          </div>

          {/* Phone Mockup */}
          <div style={{ perspective: "1200px", marginTop: 48, marginBottom: 80, position: "relative" }}>
            <div
              ref={phoneRef}
              className="neu-raised-premium"
              style={s.phoneMockup}
            >
              {/* Internal preview */}
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
                  <div className="neu-inset-soft" style={{ width: 40, height: 40, borderRadius: "50%" }} />
                  <div className="neu-flat" style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="neu-flat animate-ai-pulse" style={{ padding: 20, borderRadius: 24, textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span className="material-symbols-outlined" style={{ color: "#2563EB", fontSize: 18 }}>neurology</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", textTransform: "uppercase" }}>Active Intelligence</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>Scanning syllabus.pdf...</p>
                    <div style={{ width: "100%", height: 6, background: "rgba(15,23,42,0.05)", borderRadius: 9999, marginTop: 12, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "66%", background: "#2563EB", borderRadius: 9999 }} />
                    </div>
                  </div>
                  <div className="neu-inset-soft" style={{ padding: 16, borderRadius: 16, opacity: 0.6, textAlign: "left" }}>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>Calculus III Quiz</p>
                    <p style={{ fontSize: 10 }}>Due Friday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification — right */}
            <div className="glass-notif animate-float" style={s.notifRight}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 20, height: 20, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg style={{ width: 12, height: 12, fill: "white" }} viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700 }}>DUE AI</span>
                <span style={{ marginLeft: "auto", fontSize: 8, opacity: 0.5 }}>Just now</span>
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.4, fontWeight: 500, color: "rgba(15,23,42,0.8)", marginTop: 4 }}>
                "I've added the Discrete Math quiz to your calendar. Ready to review?"
              </p>
            </div>

            {/* Floating notification — left */}
            <div className="glass-notif animate-float" style={{ ...s.notifLeft, animationDelay: "-2s" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", marginBottom: 4 }}>New Task Found</p>
              <p style={{ fontSize: 12, fontWeight: 600 }}>Macroeconomics Essay</p>
              <p style={{ fontSize: 9, opacity: 0.6 }}>Source: Canvas Announcement</p>
            </div>
          </div>
        </section>

        {/* ── AI Magic Pipeline ──────────────────────── */}
        <section className="mt-32 flex flex-col gap-16 relative md:grid md:grid-cols-3 md:gap-8">
          <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-blue-600/30 via-blue-600 to-transparent md:hidden" />
          <div className="text-center md:col-span-3 mb-12 md:mb-0">
            <h2 style={s.sectionHeading}>The AI Magic Pipeline</h2>
            <p style={s.sectionSub}>How we turn chaos into clarity</p>
          </div>

          {[
            { icon: "cloud_upload", title: "Deep Intake", desc: "Drop a PDF syllabus or forward an email. Our AI doesn't just read words; it understands intent and creates a context map of your entire semester.", pulse: false },
            { icon: "psychology", title: "Intelligent Extraction", desc: "DueMate isolates deadlines, grade weights, and exam formats. It cross-references with your current commitments to spot conflicts before they happen.", pulse: true },
            { icon: "chat_bubble", title: "Proactive Dialogue", desc: "We don't wait for you to check an app. We nudge you on WhatsApp with actionable summaries and \"study now\" recommendations based on your habits.", pulse: false },
          ].map(({ icon, title, desc, pulse }) => (
            <div key={title} className="relative pl-16 md:pl-0 text-left md:text-center flex flex-col md:items-center">
              <div className="absolute left-3 md:relative md:left-auto md:top-auto top-6 w-6 h-6 rounded-full bg-[#EAF0F8] border-4 border-blue-600 z-10 shadow-[0_0_15px_rgba(37,99,235,0.4)] md:mb-6" />
              <div className={`neu-raised-premium${pulse ? " animate-ai-pulse" : ""} p-6 rounded-[24px] w-full`}>
                <div className="neu-inset-soft w-12 h-12 rounded-2xl flex items-center justify-center mb-4 md:mx-auto">
                  <span className="material-symbols-outlined" style={{ color: "#2563EB" }}>{icon}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">{title}</h3>
                <p className="text-sm text-slate-900/60 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── The Intelligent Friend ─────────────────── */}
        <section className="mt-28 mb-24">
          <div className="text-center mb-12 px-4">
            <h2 style={{ ...s.sectionHeading, fontSize: 28 }}>The Intelligent Friend</h2>
            <p style={{ ...s.sectionSub, marginTop: 8 }}>More than a tracker. A companion that lives where you do.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-2">
            {/* Dashboard card */}
            <div className="neu-raised-premium p-6 rounded-[28px] text-left flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
              <div>
                <p style={s.mockupLabel}>Your Dashboard</p>
                <h4 className="font-bold text-slate-900 text-base mb-4">Academic Overview</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="neu-inset-soft p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Calculus III Assignment</span>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Due Today</span>
                  </div>
                  <div className="neu-inset-soft p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Physics Lab Report</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full">2 Days Left</span>
                  </div>
                  <div className="neu-inset-soft p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Data Structures Quiz</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-600/10 px-2 py-0.5 rounded-full">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat card */}
            <div className="rounded-[28px] p-6 text-left flex flex-col justify-between bg-[#0F172A] border-t-4 border-blue-600 shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-blue-500 text-xl">smart_toy</span>
                  <span className="text-xs font-bold text-white tracking-wider">DUE AI BOT</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-sm">
                    <p className="text-xs text-slate-200 leading-relaxed">I noticed you have a Quiz tomorrow. Want me to generate some flashcards?</p>
                  </div>
                  <div className="bg-blue-600/30 p-3 rounded-2xl rounded-tr-sm ml-auto max-w-[85%] text-right border border-blue-400/20">
                    <p className="text-xs text-blue-100 font-medium">Yes please, focus on Chapter 4.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">WhatsApp Active</span>
                <span className="text-[10px] font-bold text-blue-400">Response &lt; 2s</span>
              </div>
            </div>

            {/* Sync card */}
            <div className="neu-raised-premium p-6 rounded-[28px] text-left flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="neu-inset-soft w-10 h-10 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-blue-600">calendar_today</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Semester Sync</h4>
                <p className="text-xs text-slate-500 mb-6">Automatic schedule &amp; deadline integration</p>
                <div className="space-y-2">
                  {[["Syncing Grades", "Live"], ["WhatsApp Bridge", "Active"], ["Calendar Feed", "Connected"]].map(([label, status]) => (
                    <div key={label} className="neu-flat flex justify-between items-center px-3 py-2 rounded-xl">
                      <span className="text-xs font-medium text-slate-700">{label}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────── */}
        <section style={{ marginTop: 80 }}>
          <div className="neu-raised-premium" style={s.ctaCard}>
            <div className="neu-inset-soft animate-ai-pulse" style={s.ctaIcon}>
              <span className="material-symbols-outlined" style={{ color: "#2563EB", fontSize: 30 }}>bolt</span>
            </div>
            <h2 style={{ ...s.sectionHeading, fontSize: 28, marginBottom: 16 }}>Stop Chasing Deadlines.</h2>
            <p style={{ ...s.cardDesc, marginBottom: 40, margin: "0 auto 40px" }} className="max-w-[280px] md:max-w-md">
              Join 12,000+ students letting AI do the heavy lifting this semester.
            </p>
            <button onClick={onGetStarted} className="neumorphic-button-primary md:w-auto md:px-12 md:mx-auto" style={s.ctaButton}>
              Experience the Future
            </button>
            <p style={{ marginTop: 24, fontSize: 11, fontWeight: 700, color: "rgba(37,99,235,0.6)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              Launched in 2026 • Built for Students
            </p>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────── */}
        <footer style={s.footer}>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24, opacity: 0.3 }}>
            <span className="material-symbols-outlined">brand_family</span>
            <span className="material-symbols-outlined">security</span>
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(15,23,42,0.3)", textTransform: "uppercase", letterSpacing: "0.2em" }}>
            © 2026 DUEMATE LABS. ALL RIGHTS RESERVED.
          </p>
        </footer>
      </main>
    </div>
  );
}

// ── Inline style objects ──────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#EAF0F8",
    color: "#0F172A",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  blobWrap: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: 0.06,
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "0 24px",
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(234,240,248,0.6)",
    backdropFilter: "blur(12px)",
  },
  navBrand: {
    padding: "8px 16px",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navTitle: {
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: "-0.02em",
    color: "#0F172A",
  },
  navCta: {
    padding: "10px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    transition: "transform 0.15s ease, opacity 0.15s ease",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 16px",
    borderRadius: 9999,
    background: "rgba(37,99,235,0.08)",
    border: "1px solid rgba(37,99,235,0.2)",
    color: "#2563EB",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 24,
  },
  heroHeading: {
    fontSize: 42,
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    color: "#0F172A",
    marginBottom: 16,
  },
  heroSub: {
    color: "rgba(15,23,42,0.6)",
    fontSize: 17,
    fontWeight: 500,
    padding: "0 16px",
    marginBottom: 40,
    lineHeight: 1.6,
  },
  phoneMockup: {
    margin: "0 auto",
    width: 280,
    height: 570,
    borderRadius: 56,
    border: "10px solid #0F172A",
    overflow: "hidden",
    transform: "rotateY(-15deg) rotateX(10deg) rotateZ(2deg)",
    transition: "transform 0.5s ease",
    position: "relative",
    zIndex: 2,
  },
  notifRight: {
    position: "absolute",
    right: -32,
    top: "25%",
    width: 220,
    padding: 16,
    borderRadius: 16,
    zIndex: 3,
    borderLeft: "4px solid #22c55e",
    textAlign: "left",
  },
  notifLeft: {
    position: "absolute",
    left: -16,
    bottom: "20%",
    width: 180,
    padding: 12,
    borderRadius: 16,
    zIndex: 1,
    textAlign: "left",
  },
  friendSection: {
    marginTop: 160,
    marginBottom: 128,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0F172A",
    letterSpacing: "-0.02em",
  },
  sectionSub: {
    fontSize: 14,
    color: "rgba(15,23,42,0.5)",
    fontWeight: 500,
  },
  mockupRow: {
    position: "relative",
    height: 440,
    margin: "0 -24px",
  },
  mockupCard: {
    position: "absolute",
    left: "50%",
    top: 0,
    transform: "translateX(-50%)",
    width: 220,
    height: 380,
    borderRadius: 36,
    overflow: "hidden",
    padding: 24,
    textAlign: "left",
  },
  mockupLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#2563EB",
    marginBottom: 16,
  },
  ctaCard: {
    padding: 48,
    borderRadius: 48,
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 32px",
  },
  ctaButton: {
    width: "100%",
    padding: "20px 0",
    borderRadius: 16,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    display: "block",
    transition: "transform 0.15s ease",
  },
  footer: {
    marginTop: 80,
    textAlign: "center",
    paddingBottom: 40,
  },
};
