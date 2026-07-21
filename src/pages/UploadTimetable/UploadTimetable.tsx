import { useState, useRef, useEffect } from "react";

type TimetableFlowStep = "upload" | "processing" | "choose-class" | "imported";

interface UploadTimetableProps {
  onComplete: (section: string) => void;
  onBack: () => void;
}

// ─── Step 1: Upload ───────────────────────────────────────────────────────────
function UploadStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <>
      {/* Header */}
      <header className="w-full top-0 sticky z-50 bg-background-base shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="active:scale-95 transition-transform flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[24px]">arrow_back</span>
          </button>
          <span
            className="material-symbols-outlined text-secondary text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span className="text-[20px] font-bold text-secondary">Upload Timetable</span>
        </div>
      </header>

      <main className="px-6 pt-8 pb-32 space-y-8">
        {/* Hero */}
        <section className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto neumorphic-raised rounded-3xl flex items-center justify-center">
            <span
              className="material-symbols-outlined text-secondary text-[48px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              upload_file
            </span>
          </div>
          <h2 className="text-[32px] font-bold text-primary">Import your timetable</h2>
          <p className="text-[16px] text-on-surface-variant max-w-[300px] mx-auto">
            Upload your Riphah University PDF timetable. DueMate will extract your class schedule automatically.
          </p>
        </section>

        {/* Drop Zone */}
        <section>
          <div
            className={`neumorphic-inset rounded-[20px] p-8 flex flex-col items-center text-center border-2 border-dashed transition-all cursor-pointer ${
              dragOver ? "border-secondary bg-highlight-soft/30" : "border-outline/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {selectedFile ? (
              <>
                <span
                  className="material-symbols-outlined text-success text-[48px] mb-3"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <p className="text-[16px] font-bold text-on-surface">{selectedFile.name}</p>
                <p className="text-[14px] text-on-surface-variant mt-1">
                  {(selectedFile.size / 1024).toFixed(0)} KB • PDF
                </p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-outline/50 text-[56px] mb-3">cloud_upload</span>
                <p className="text-[16px] font-bold text-on-surface">Drop your PDF here</p>
                <p className="text-[14px] text-on-surface-variant mt-1">or tap to browse files</p>
                <span className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-secondary bg-highlight-soft px-3 py-1 rounded-full">
                  PDF only
                </span>
              </>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="neumorphic-raised rounded-[20px] p-5 space-y-3">
          <h3 className="text-[16px] font-bold text-primary">How it works</h3>
          {[
            { icon: "upload_file", text: "Upload your official Riphah timetable PDF" },
            { icon: "smart_toy", text: "Our AI extracts and parses all schedules" },
            { icon: "person", text: "You select your specific class section" },
            { icon: "check_circle", text: "DueMate personalizes your schedule" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-highlight-soft flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary text-[16px]">{step.icon}</span>
              </div>
              <p className="text-[14px] text-on-surface-variant">{step.text}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Bottom CTA */}
      <div className="fixed md:absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] md:max-w-full p-6 bg-background-base shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:rounded-b-[32px]">
        <button
          disabled={!selectedFile}
          onClick={onNext}
          className="w-full h-14 bg-secondary text-white rounded-2xl font-bold text-[18px] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[4px_4px_10px_rgba(0,81,213,0.3)]"
        >
          Process Timetable
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </>
  );
}

// ─── Step 2: AI Processing ────────────────────────────────────────────────────
function ProcessingStep({ onNext }: { onNext: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Reading PDF structure...",
    "Extracting timetable data...",
    "Identifying class sections...",
    "Parsing lecture slots...",
    "Done! Found 4 class sections.",
  ];

  // Auto-advance through steps
  useEffect(() => {
    let i = 0;
    let timeoutId: any;
    const interval = setInterval(() => {
      i++;
      setStep(i);
      if (i >= steps.length - 1) {
        clearInterval(interval);
        timeoutId = setTimeout(onNext, 1000);
      }
    }, 900);
    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onNext, steps.length]);

  return (
    <>
      <header className="w-full top-0 sticky z-50 bg-background-base flex items-center px-6 h-16">
        <span className="text-[20px] font-bold text-secondary">Processing...</span>
      </header>

      <main className="px-6 flex flex-col items-center justify-center min-h-[70vh] space-y-10">
        {/* Animated AI Orb */}
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center"
            style={{
              boxShadow: "0 0 40px rgba(0, 81, 213, 0.5), 0 0 80px rgba(0, 81, 213, 0.2)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          >
            <span
              className="material-symbols-outlined text-white text-[52px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="w-full space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                i <= step ? "opacity-100" : "opacity-20"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px] flex-shrink-0"
                style={{
                  fontVariationSettings: i <= step ? "'FILL' 1" : "'FILL' 0",
                  color: i === steps.length - 1 && i <= step ? "#10B981" : "#0051d5",
                }}
              >
                {i < step ? "check_circle" : i === step ? "radio_button_checked" : "radio_button_unchecked"}
              </span>
              <span className={`text-[14px] font-medium ${i <= step ? "text-on-surface" : "text-on-surface-variant"}`}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

// ─── Step 3: Choose Class ─────────────────────────────────────────────────────
function ChooseClassStep({ onNext }: { onNext: (section: string) => void }) {
  // TODO: Replace mock sections with data from backend timetable parsing API
  //       when GET /api/student/timetable/sections (or similar) is implemented.
  const MOCK_SECTIONS = ["BSCS-6A", "BSCS-6B", "BSSE-6", "BSAI-4", "BSCS-6C", "BSSE-7"];

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = MOCK_SECTIONS.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  function getProgramName(section: string) {
    if (section.startsWith("BSCS")) return "BS Computer Science";
    if (section.startsWith("BSSE")) return "BS Software Engineering";
    if (section.startsWith("BSAI")) return "BS Artificial Intelligence";
    return "BS Program";
  }

  return (
    <>
      <header className="w-full top-0 sticky z-50 bg-background-base shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-bold text-primary">Choose Your Class</h1>
        </div>
      </header>

      <main className="flex-1 px-6 pt-8 pb-40 space-y-8 max-w-[390px] mx-auto w-full">
        {/* Success Banner */}
        <section>
          <div className="neumorphic-raised rounded-3xl p-6 text-center">
            <div className="w-16 h-16 bg-highlight-soft rounded-2xl mx-auto flex items-center justify-center mb-4 neumorphic-raised">
              <span
                className="material-symbols-outlined text-secondary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-primary mb-2">Timetable Successfully Processed</h2>
            <p className="text-[14px] text-on-surface-variant">
              We found {MOCK_SECTIONS.length} classes in your timetable. Select yours to personalize DueMate.
            </p>
          </div>
        </section>

        {/* Search + Dropdown */}
        <section>
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant mb-3 ml-2">
            Select your class
          </label>
          <div className="relative">
            <div
              className="neumorphic-inset w-full h-14 rounded-2xl px-5 flex items-center justify-between cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={`text-[16px] ${selected ? "text-secondary font-bold" : "text-on-surface-variant"}`}>
                {selected ?? "Search or select class..."}
              </span>
              <span
                className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                expand_more
              </span>
            </div>

            {isOpen && (
              <div className="absolute top-16 left-0 w-full z-40 neumorphic-raised rounded-2xl overflow-hidden">
                {/* Search within dropdown */}
                <div className="p-3 border-b border-white/20">
                  <input
                    className="w-full bg-transparent text-[14px] text-on-surface placeholder:text-outline/60 focus:outline-none"
                    placeholder="Type to filter..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
                <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                  {filtered.map((section) => (
                    <button
                      key={section}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-highlight-soft/50 text-[16px] transition-colors text-primary font-medium active:scale-[0.98]"
                      onClick={() => {
                        setSelected(section);
                        setIsOpen(false);
                        setSearch("");
                      }}
                    >
                      {section}
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-center text-[14px] text-on-surface-variant py-4">No classes found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Preview Card */}
        {selected && (
          <section>
            <div className="neumorphic-raised rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 blur-3xl rounded-full" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[20px] font-bold text-primary">{getProgramName(selected)}</h3>
                  <p className="text-[14px] text-secondary font-semibold">Section {selected.split("-").pop()}</p>
                </div>
                <div className="w-12 h-12 neumorphic-raised rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">analytics</span>
                </div>
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                You can change your class later from Profile.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Bottom CTA */}
      <div className="fixed md:absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] md:max-w-full p-6 bg-background-base md:rounded-b-[32px]">
        <button
          disabled={!selected}
          onClick={() => selected && onNext(selected)}
          className="w-full h-16 bg-secondary text-white rounded-2xl font-bold text-[18px] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[6px_6px_12px_rgba(0,81,213,0.3)]"
        >
          Continue
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </>
  );
}

// ─── Step 4: Imported Confirmation ───────────────────────────────────────────
function ImportedStep({ section, onDone }: { section: string; onDone: () => void }) {
  return (
    <>
      <header className="w-full top-0 sticky z-50 bg-background-base flex items-center justify-center px-6 h-16">
        <span className="text-[20px] font-bold text-secondary">Timetable Ready!</span>
      </header>

      <main className="px-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
        {/* Success Icon */}
        <div className="w-32 h-32 neumorphic-raised rounded-full flex items-center justify-center">
          <span
            className="material-symbols-outlined text-success text-[64px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-[32px] font-bold text-primary">You're all set!</h2>
          <p className="text-[16px] text-on-surface-variant max-w-[280px] mx-auto">
            Your timetable for <strong className="text-secondary">{section}</strong> has been imported. DueMate will
            now track your classes and deadlines.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="w-full space-y-3">
          {[
            { icon: "calendar_today", text: "Today's classes will show on your dashboard" },
            { icon: "smart_toy", text: "AI insights based on your schedule" },
            { icon: "notifications", text: "Smart reminders before each class" },
          ].map((f) => (
            <div key={f.text} className="neumorphic-raised rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-highlight-soft rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary text-[20px]">{f.icon}</span>
              </div>
              <p className="text-[14px] text-on-surface-variant text-left">{f.text}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed md:absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] md:max-w-full p-6 bg-background-base md:rounded-b-[32px]">
        <button
          onClick={onDone}
          className="w-full h-14 bg-secondary text-white rounded-2xl font-bold text-[18px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[4px_4px_10px_rgba(0,81,213,0.3)]"
        >
          View My Timetable
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </>
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────
export function UploadTimetable({ onComplete, onBack }: UploadTimetableProps) {
  const [step, setStep] = useState<TimetableFlowStep>("upload");
  const [selectedSection, setSelectedSection] = useState<string>("");

  return (
    <div className="max-w-[390px] md:max-w-2xl mx-auto min-h-screen md:min-h-0 bg-background-base md:my-12 md:neumorphic-raised md:rounded-[32px] relative flex flex-col">
      {step === "upload" && <UploadStep onNext={() => setStep("processing")} onBack={onBack} />}
      {step === "processing" && <ProcessingStep onNext={() => setStep("choose-class")} />}
      {step === "choose-class" && (
        <ChooseClassStep
          onNext={(section) => {
            setSelectedSection(section);
            setStep("imported");
          }}
        />
      )}
      {step === "imported" && (
        <ImportedStep section={selectedSection} onDone={() => onComplete(selectedSection)} />
      )}
    </div>
  );
}
