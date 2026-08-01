import type { Task, User } from "../../types";

interface ProfileProps {
  user: User;
  tasks: Task[];
  onLogout: () => void;
  onNavigateTimetable: () => void;
  availableSections?: string[];
  currentSection?: string | null;
  onChangeSection?: () => void;
}

export function Profile({ user, tasks, onLogout, onNavigateTimetable, availableSections = [], currentSection, onChangeSection }: ProfileProps) {
  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  // Read the name saved during ProfileSetup from localStorage
  const displayName = localStorage.getItem("duemate_user_name") || "Student";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-[390px] md:max-w-5xl mx-auto min-h-screen pb-32 md:pb-12 overflow-x-hidden bg-background-base">
      {/* Top App Bar (Desktop Only) */}
      <header className="hidden md:flex bg-background-base w-full top-0 sticky z-50 items-center justify-between px-6 h-16">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold text-primary">Profile</h1>
          <p className="text-[12px] text-on-surface-variant/70 leading-none">My DueMate</p>
        </div>
        <button className="active:scale-95 transition-transform duration-200 hover:opacity-80">
          <span className="material-symbols-outlined text-secondary text-[24px]">settings</span>
        </button>
      </header>

      <main className="px-6 pt-4 space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
        {/* Left Column */}
        <div className="space-y-8">
        {/* Profile Card */}
        <section className="neumorphic-raised rounded-[20px] p-5 flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full neumorphic-inset p-1">
            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-white text-3xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="space-y-1">
            {/* TODO: Replace displayName with user.name when backend adds the field */}
            <h2 className="text-[24px] font-bold text-on-surface">{displayName}</h2>
            <p className="text-[14px] text-on-surface-variant font-medium">Riphah International University</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 neumorphic-inset rounded-full">
            <span
              className="material-symbols-outlined text-success text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="text-[13px] font-semibold text-on-surface">WhatsApp Connected</span>
          </div>
        </section>

        {/* Academic Summary */}
        <section className="space-y-4">
          <h3 className="text-[20px] font-bold text-on-surface px-1">Academic Overview</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="neumorphic-raised rounded-xl p-3 flex flex-col items-center justify-center space-y-1">
              <span className="text-secondary font-bold text-lg">—</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Semester
              </span>
            </div>
            <div className="neumorphic-raised rounded-xl p-3 flex flex-col items-center justify-center space-y-1">
              <span className="text-secondary font-bold text-lg">{tasks.length}</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Tasks
              </span>
            </div>
            <div className="neumorphic-raised rounded-xl p-3 flex flex-col items-center justify-center space-y-1">
              <span className="text-danger font-bold text-lg">{pendingCount}</span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Pending
              </span>
            </div>
          </div>
        </section>

        {/* Timetable Card */}
        <section className="neumorphic-raised rounded-[20px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 neumorphic-inset rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">calendar_today</span>
              </div>
              <div>
                <h4 className="text-[18px] font-bold text-on-surface">Timetable Settings</h4>
                <p className="text-[12px] text-on-surface-variant">Manage your parsed schedule</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {/* Active section display */}
            <div className="flex justify-between items-center bg-highlight-soft px-4 py-3 rounded-xl">
              <span className="text-on-surface-variant font-medium text-sm">Active Class</span>
              {currentSection ? (
                <span className="text-secondary font-bold text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {currentSection}
                </span>
              ) : (
                <span className="text-on-surface-variant font-semibold text-sm">Not set</span>
              )}
            </div>

            {/* Change class — instant if sections already stored, re-upload otherwise */}
            <button
              onClick={onChangeSection ?? onNavigateTimetable}
              className="w-full py-3 neumorphic-button-secondary rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-secondary"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              {availableSections.length > 0 ? "Change Selected Class" : "Select Class"}
            </button>

            {/* Always allow full re-upload */}
            <button
              onClick={onNavigateTimetable}
              className="w-full py-3 neumorphic-button-primary rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              Upload New Timetable
            </button>
          </div>
        </section>

        {/* Account Card */}
        <section className="neumorphic-raised rounded-[20px] p-5 space-y-4">
          <h3 className="text-[18px] font-bold text-on-surface">Account</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/20">
              <span className="text-on-surface-variant font-medium">WhatsApp</span>
              <span className="text-success font-semibold text-sm">Connected</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/20">
              <span className="text-on-surface-variant font-medium">Phone Number</span>
              <span className="text-on-surface font-semibold text-sm">{user.phone_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-medium">Member Since</span>
              <span className="text-on-surface font-semibold text-sm">{memberSince}</span>
            </div>
          </div>
        </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
        {/* Preferences */}
        <section className="space-y-4">
          <div className="neumorphic-raised rounded-[20px] overflow-hidden">
            {[
              { icon: "notifications", label: "Notifications" },
              { icon: "alarm", label: "Reminder Preferences" },
              { icon: "light_mode", label: "Theme" },
              { icon: "language", label: "Language" },
            ].map((item, i, arr) => (
              <button
                key={item.label}
                className={`w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors active:scale-[0.98] ${
                  i < arr.length - 1 ? "border-b border-white/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">{item.icon}</span>
                  <span className="text-[16px] text-on-surface">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40">chevron_right</span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {[
            { icon: "help", label: "Help Center", href: "https://github.com/" },
            { icon: "verified_user", label: "Privacy Policy", href: "https://www.termsfeed.com/live/sample-privacy-policy" },
            { icon: "description", label: "Terms", href: "https://www.termsfeed.com/live/sample-terms-of-service" },
            { icon: "chat_bubble", label: "Support", href: `https://wa.me/${user.phone_number?.replace(/\D/g,"")}?text=Hi%20DueMate%20support%2C%20I%20need%20help` },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="neumorphic-raised p-4 rounded-xl flex flex-col items-center gap-2 hover:opacity-80 transition-opacity active:scale-95 text-center no-underline"
            >
              <span className="material-symbols-outlined text-secondary">{item.icon}</span>
              <span className="text-xs font-semibold text-on-surface">{item.label}</span>
            </a>
          ))}
        </section>

        {/* Log Out */}
        <section className="flex justify-center pt-4 pb-8">
          <button
            onClick={onLogout}
            className="text-danger font-bold text-[16px] hover:underline active:scale-95 transition-transform flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Log Out
          </button>
        </section>
        </div>
      </main>
    </div>
  );
}
