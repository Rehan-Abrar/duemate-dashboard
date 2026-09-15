import { useState } from "react";
import type { Task, User } from "../../types";
import { Spinner } from "../../components/ui/spinner";
import { adminTimetableApi, ApiClientError } from "../../api";

interface ProfileProps {
  user: User;
  tasks: Task[];
  onLogout: () => void;
  onNavigateTimetable: () => void;
  availableSections?: string[];
  hasOfficialSections?: boolean;
  currentSection?: string | null;
  onChangeSection?: () => void;
  showAdminToggle?: boolean;
  adminMode?: boolean;
  onAdminModeChange?: (enabled: boolean) => void;
}

export function Profile({
  user,
  tasks,
  onLogout,
  onNavigateTimetable,
  availableSections = [],
  hasOfficialSections = false,
  currentSection,
  onChangeSection,
  showAdminToggle = false,
  adminMode = false,
  onAdminModeChange,
}: ProfileProps) {
  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  // Read the name saved during ProfileSetup from localStorage
  const displayName = localStorage.getItem("duemate_user_name") || "Student";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const [unlocking, setUnlocking] = useState(false);
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen pb-12 bg-background-base">
      <header className="hidden md:flex bg-background-base w-full top-0 sticky z-50 items-center px-6 h-16">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold text-primary">Profile</h1>
          <p className="text-[12px] text-on-surface-variant/70 leading-none">My DueMate</p>
        </div>
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
              {availableSections.length > 0 || hasOfficialSections || Boolean(user?.settings?.university_id) ? "Change Selected Class" : "Select Class"}
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

        {showAdminToggle && (
          <section className="neumorphic-raised rounded-[20px] p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[18px] font-bold text-on-surface">Admin Mode</h3>
                <p className="text-[12px] text-on-surface-variant mt-1">
                  Unlock Timetable Management. Backend admin login is still required.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={adminMode}
                disabled={adminBusy}
                onClick={() => {
                  if (adminMode) {
                    setUnlocking(false);
                    setAdminPassword("");
                    setAdminError(null);
                    onAdminModeChange?.(false);
                    return;
                  }
                  if (unlocking) {
                    setUnlocking(false);
                    setAdminError(null);
                    return;
                  }
                  setUnlocking(true);
                  setAdminError(null);
                }}
                className={`relative w-14 h-8 rounded-full shrink-0 transition-colors ${
                  adminMode ? "bg-secondary" : "bg-outline/40"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    adminMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
                <span className="sr-only">{adminMode ? "On" : "Off"}</span>
              </button>
            </div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">
              {adminMode ? "ON" : "OFF"}
            </p>

            {unlocking && !adminMode && (
              <form
                className="space-y-3 pt-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAdminBusy(true);
                  setAdminError(null);
                  try {
                    await adminTimetableApi.login(adminUser.trim(), adminPassword);
                    setUnlocking(false);
                    setAdminPassword("");
                    onAdminModeChange?.(true);
                  } catch (err) {
                    setAdminError(
                      err instanceof ApiClientError
                        ? err.message
                        : "Admin login failed."
                    );
                  } finally {
                    setAdminBusy(false);
                  }
                }}
              >
                <input
                  type="text"
                  autoComplete="username"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="Admin username"
                  className="w-full h-12 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin password"
                  className="w-full h-12 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {adminError && (
                  <p className="text-[13px] text-danger font-medium">{adminError}</p>
                )}
                <button
                  type="submit"
                  disabled={adminBusy || !adminUser.trim() || !adminPassword}
                  className="w-full h-12 bg-secondary text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {adminBusy ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Signing in…
                    </>
                  ) : (
                    "Enable Admin Mode"
                  )}
                </button>
              </form>
            )}
          </section>
        )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
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
