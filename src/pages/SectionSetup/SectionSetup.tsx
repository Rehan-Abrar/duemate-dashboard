import { useEffect, useMemo, useState } from "react";
import { timetableApi, authApi, ApiClientError } from "../../api";
import { parseSection, programLabel, semesterLabel } from "../../lib/section";
import type { User } from "../../types";
import { Spinner } from "../../components/ui/spinner";

interface SectionSetupProps {
  /** Official path completed — settings saved; receives the refreshed user. */
  onDone: (user: User) => void;
  /** No official timetable for the section → fall back to PDF upload. */
  onNeedUpload: () => void;
  /** Skip timetable setup for now (dashboard will prompt later). Onboarding only. */
  onSkip?: () => void;
  onBack: () => void;
  /** "change" reuses the official section picker inside the authenticated app. */
  mode?: "onboarding" | "change";
  currentSection?: string | null;
}

interface SectionInfo {
  university_id: string;
  academic_term: string;
}

function universityLabel(id: string): string {
  if (id === "riphah") return "Riphah International University";
  // Prettify slug-style ids for any future universities.
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function SectionSetup({
  onDone,
  onNeedUpload,
  onSkip,
  onBack,
  mode = "onboarding",
  currentSection = null,
}: SectionSetupProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // section -> {university_id, academic_term}
  const [sectionMap, setSectionMap] = useState<Map<string, SectionInfo>>(new Map());
  const [universities, setUniversities] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(currentSection);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await timetableApi.getOptions();
        if (cancelled) return;
        const map = new Map<string, SectionInfo>();
        const unis = new Set<string>();
        for (const uni of res.items || []) {
          unis.add(uni.university_id);
          for (const term of uni.terms || []) {
            for (const section of term.sections || []) {
              // First occurrence wins (currently-effective published version).
              if (!map.has(section)) {
                map.set(section, {
                  university_id: uni.university_id,
                  academic_term: term.academic_term,
                });
              }
            }
          }
        }
        setSectionMap(map);
        setUniversities([...unis]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiClientError
              ? err.message
              : "Couldn't load available timetables."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allSections = useMemo(
    () => [...sectionMap.keys()].sort(),
    [sectionMap]
  );
  const filtered = useMemo(
    () => allSections.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
    [allSections, search]
  );

  const meta = selected ? parseSection(selected) : null;
  const isChange = mode === "change";
  const uniLabel =
    universities.length === 1 ? universityLabel(universities[0]) : "Riphah International University";

  async function handleContinue() {
    if (!selected) return;
    const info = sectionMap.get(selected);
    if (!info) {
      onNeedUpload();
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await timetableApi.selectSection(selected, {
        universityId: info.university_id,
        academicTerm: info.academic_term,
      });
      const fresh = await authApi.verifySession();
      onDone(fresh);
    } catch (err) {
      setSaveError(
        err instanceof ApiClientError
          ? err.message
          : "Failed to save your section. Please try again."
      );
      setSaving(false);
    }
  }

  const noOfficial = !loading && allSections.length === 0;

  return (
    <div className="flex flex-col min-h-screen text-on-surface items-center justify-start overflow-x-hidden bg-background md:justify-center">
      {/* Header */}
      <header className="w-full h-16 flex items-center px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="min-w-11 min-h-11 active:scale-95 transition-transform flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-secondary text-[24px]">arrow_back</span>
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <span
            className="material-symbols-outlined text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <h1 className="font-headline-md text-[24px] leading-[1.3] font-bold text-secondary">DueMate</h1>
        </div>
        <span className="min-w-11" />
      </header>

      <main className="w-full max-w-md md:max-w-lg px-6 pb-8 flex flex-col items-center md:neumorphic-raised md:rounded-[32px] md:p-12 md:my-8">
        {/* Hero */}
        <section className="mt-6 flex flex-col items-center text-center w-full">
          <div className="w-20 h-20 rounded-3xl neumorphic-raised flex items-center justify-center mb-5">
            <span
              className="material-symbols-outlined text-secondary text-[42px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <h2 className="text-[28px] leading-[1.2] font-bold text-primary mb-2">
            {isChange ? "Change your section" : "Choose your section"}
          </h2>
          <p className="text-[15px] leading-[1.5] text-on-surface-variant max-w-[300px]">
            {isChange
              ? "Choose another section and we’ll load the latest published timetable automatically. No PDF upload needed."
              : "Choose your section and we’ll load the latest published timetable automatically. No PDF upload needed."}
          </p>
        </section>

        {/* University (locked to Riphah for now) */}
        <section className="w-full mt-8">
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">
            University
          </label>
          <div className="neumorphic-inset rounded-2xl px-5 h-14 flex items-center justify-between opacity-90">
            <span className="text-[16px] font-semibold text-primary">{uniLabel}</span>
            <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="w-full mt-10 flex flex-col items-center gap-3">
            <Spinner size="md" color="blue" />
            <span className="text-[13px] text-on-surface-variant">Loading available sections…</span>
          </div>
        )}

        {/* Load error */}
        {!loading && loadError && (
          <section className="w-full mt-8">
            <div className="neumorphic-inset rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-danger text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <p className="text-[13px] text-danger font-medium">{loadError}</p>
            </div>
            <button
              onClick={onNeedUpload}
              className="neumorphic-button-primary w-full h-14 mt-6 rounded-xl text-white font-bold text-[17px] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">upload_file</span>
              Upload your timetable instead
            </button>
          </section>
        )}

        {/* No official timetable published yet → upload fallback */}
        {noOfficial && !loadError && (
          <section className="w-full mt-8">
            <div className="neumorphic-inset rounded-2xl p-5 flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">info</span>
              <p className="text-[14px] text-on-surface-variant">
                No official timetable is published yet. You can upload your own timetable PDF and pick
                your section from it.
              </p>
            </div>
            <button
              onClick={onNeedUpload}
              className="neumorphic-button-primary w-full h-14 mt-6 rounded-xl text-white font-bold text-[17px] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">upload_file</span>
              Upload timetable PDF
            </button>
          </section>
        )}

        {/* Section picker */}
        {!loading && !loadError && allSections.length > 0 && (
          <>
            <section className="w-full mt-6">
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">
                Your section
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="neumorphic-inset w-full h-14 rounded-2xl px-5 flex items-center justify-between"
                  onClick={() => setIsOpen((v) => !v)}
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                >
                  <span className={`text-[16px] ${selected ? "text-secondary font-bold" : "text-on-surface-variant"}`}>
                    {selected ?? "Search or select your section…"}
                  </span>
                  <span
                    className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    expand_more
                  </span>
                </button>

                {isOpen && (
                  <div className="absolute top-16 left-0 w-full z-40 neumorphic-raised rounded-2xl overflow-hidden">
                    <div className="p-3 border-b border-white/20">
                      <input
                        className="w-full bg-transparent text-[14px] text-on-surface placeholder:text-outline/60 focus:outline-none"
                        placeholder="Type to filter…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <div className="p-2 space-y-1 max-h-52 overflow-y-auto">
                      {filtered.map((section) => (
                        <button
                          key={section}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-highlight-soft/50 text-[16px] transition-colors text-primary font-medium active:scale-[0.98]"
                          onClick={() => {
                            setSelected(section);
                            setIsOpen(false);
                            setSearch("");
                            setSaveError(null);
                          }}
                        >
                          {section}
                        </button>
                      ))}
                      {filtered.length === 0 && (
                        <p className="text-center text-[14px] text-on-surface-variant py-4">No sections found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Derived preview (program + semester from the section) */}
            {selected && meta && meta.program && (
              <section className="w-full mt-6">
                <div className="neumorphic-raised rounded-3xl p-6">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    We detected
                  </p>
                  <h3 className="text-[20px] font-bold text-primary">{programLabel(meta.program)}</h3>
                  <p className="text-[14px] text-secondary font-semibold mt-1">
                    {semesterLabel(meta.semester)} • Section {meta.sectionLetter}
                  </p>
                </div>
              </section>
            )}

            {saveError && (
              <section className="w-full mt-6">
                <div className="neumorphic-inset rounded-xl p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-danger text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  <p className="text-[13px] text-danger font-medium">{saveError}</p>
                </div>
              </section>
            )}

            <section className="w-full mt-8 flex flex-col gap-3">
              <button
                onClick={handleContinue}
                disabled={!selected || saving}
                className="neumorphic-button-primary w-full h-14 rounded-xl text-white font-bold text-[19px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Spinner size="sm" color="white" />
                    <span>Setting up…</span>
                  </>
                ) : (
                  <>
                    Continue
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
              {!isChange && (
              <button
                onClick={onNeedUpload}
                disabled={saving}
                className="w-full py-2 text-secondary text-[13px] font-semibold hover:underline text-center disabled:opacity-50"
              >
                My section isn’t listed? Upload your timetable instead.
              </button>
              )}
            </section>
          </>
        )}

        {/* Skip — onboarding only */}
        {!loading && !isChange && onSkip && (
          <button
            onClick={onSkip}
            disabled={saving}
            className="w-full py-2 mt-4 text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold hover:text-secondary transition-colors text-center disabled:opacity-50"
          >
            Skip for now
          </button>
        )}
      </main>
    </div>
  );
}

export default SectionSetup;
