import { useState, useEffect } from "react";
import { Dashboard } from "./Dashboard/Dashboard";
import { Tasks } from "./Tasks/Tasks";
import { Calendar } from "./Calendar/Calendar";
import { Assistant } from "./Assistant/Assistant";
import { Profile } from "./Profile/Profile";
import { UploadTimetable } from "./UploadTimetable/UploadTimetable";
import { PersonalTimetable } from "./Timetable/PersonalTimetable";
import { AddTaskModal } from "../components/AddTaskModal";
import { tasksApi, timetableApi } from "../api";
import type { User, Task } from "../types";
import { SectionSetup } from "./SectionSetup/SectionSetup";
import { AdminTimetable } from "./Admin/AdminTimetable";
import { AdminMessages } from "./Admin/AdminMessages";
import { AdminUsers } from "./Admin/AdminUsers";
import { canShowAdminModeUi, isAdminModeEnabled, clearAdminSession } from "../auth";

interface AppShellProps {
  onLogout: () => void;
  user: User;
  onUserUpdated?: (user: User) => void;
}

type Tab = "home" | "tasks" | "calendar" | "timetable" | "assistant" | "profile" | "admin-timetable" | "admin-users" | "admin-messages";
type ModalView = null | "upload-timetable" | "change-class" | "change-official-class";

export function AppShell({ onLogout, user, onUserUpdated }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [modalView, setModalView] = useState<ModalView>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initialise from user.settings so the section is restored after login
  const [timetableSection, setTimetableSection] = useState<string | null>(
    user?.settings?.timetable_section ?? null
  );
  const [availableSections, setAvailableSections] = useState<string[]>(
    user?.settings?.available_sections ?? []
  );
  const [officialSections, setOfficialSections] = useState<string[]>([]);
  const showAdminToggle = canShowAdminModeUi(user?.phone_number);
  const [adminMode, setAdminMode] = useState(
    () => canShowAdminModeUi(user?.phone_number) && isAdminModeEnabled()
  );
  const [inboxWaId, setInboxWaId] = useState<string | null>(null);

  useEffect(() => {
    if (!showAdminToggle) {
      setAdminMode(false);
      return;
    }
    setAdminMode(isAdminModeEnabled());
  }, [showAdminToggle]);

  // Keep section state in sync if user object changes (e.g. after refresh)
  useEffect(() => {
    const s = user?.settings?.timetable_section;
    if (s) setTimetableSection(s);
    const avail = user?.settings?.available_sections;
    if (avail && avail.length > 0) setAvailableSections(avail);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await timetableApi.getOptions();
        if (cancelled) return;
        const sections = new Set<string>();
        for (const uni of res.items || []) {
          for (const term of uni.terms || []) {
            for (const section of term.sections || []) {
              sections.add(section);
            }
          }
        }
        setOfficialSections([...sections].sort());
      } catch {
        if (!cancelled) setOfficialSections([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.settings?.university_id]);

  // Centralised Tasks state for instant synchronization across all dashboard panels
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const refreshTasks = async () => {
    try {
      const fetched = await tasksApi.getAll();
      setTasks(fetched);
    } catch (err) {
      console.error("Failed to load tasks in AppShell", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  function handleTimetableComplete(section: string) {
    setTimetableSection(section);
    setModalView(null);
    setActiveTab("timetable");
  }

  function handleOfficialClassChange(updatedUser: User) {
    onUserUpdated?.(updatedUser);
    const next = updatedUser?.settings?.timetable_section;
    if (next) setTimetableSection(next);
    setModalView(null);
    setActiveTab("timetable");
  }

  function handleNavigateTimetable() {
    setModalView("upload-timetable");
  }

  /** Official picker first; PDF class picker / upload only when no official timetable applies. */
  function handleChangeClass() {
    const hasOfficialIdentity = Boolean(user?.settings?.university_id);
    if (officialSections.length > 0 || hasOfficialIdentity) {
      setModalView("change-official-class");
    } else if (availableSections.length > 0) {
      setModalView("change-class");
    } else {
      setModalView("upload-timetable");
    }
  }

  function handleBackFromModal() {
    setModalView(null);
  }

  function goToTab(tab: Tab) {
    setModalView(null);
    setActiveTab(tab);
    setIsDrawerOpen(false);
  }

  function handleAdminModeChange(enabled: boolean) {
    if (!enabled) {
      clearAdminSession();
      setAdminMode(false);
      if (activeTab === "admin-timetable" || activeTab === "admin-users" || activeTab === "admin-messages") {
        setActiveTab("profile");
      }
      return;
    }
    setAdminMode(true);
  }

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen]);

  // ── Main App Shell ─────────────────────────────────────────────────
  return (
    <div className="h-dvh bg-background-base flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Navigation Sidebar — viewport-fixed; main pane scrolls independently */}
      <nav className="hidden md:flex flex-col w-64 h-full shrink-0 bg-surface-neumorphic shadow-[6px_0_12px_rgba(0,0,0,0.05)] py-8 px-4 z-50">
        <div className="flex items-center gap-3 mb-12 px-2 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">DueMate</span>
        </div>
        
        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
          <DesktopNavItem
            icon="home"
            label="Home"
            isActive={activeTab === "home" && !modalView}
            onClick={() => goToTab("home")}
          />
          <DesktopNavItem
            icon="assignment"
            label="Tasks"
            isActive={activeTab === "tasks" && !modalView}
            onClick={() => goToTab("tasks")}
          />
          <DesktopNavItem
            icon="calendar_month"
            label="Calendar"
            isActive={activeTab === "calendar" && !modalView}
            onClick={() => goToTab("calendar")}
          />
          <DesktopNavItem
            icon="view_timeline"
            label="Timetable"
            isActive={activeTab === "timetable" && !modalView}
            onClick={() => goToTab("timetable")}
          />
          <DesktopNavItem
            icon="smart_toy"
            label="Assistant"
            isActive={activeTab === "assistant" && !modalView}
            onClick={() => goToTab("assistant")}
          />
          {adminMode && (
            <div className="mt-6 pt-4 border-t border-white/40 space-y-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2">Admin</span>
              <DesktopNavItem
                icon="admin_panel_settings"
                label="Timetable Management"
                isActive={activeTab === "admin-timetable" && !modalView}
                onClick={() => goToTab("admin-timetable")}
              />
              <DesktopNavItem
                icon="group"
                label="Users"
                isActive={activeTab === "admin-users" && !modalView}
                onClick={() => goToTab("admin-users")}
              />
              <DesktopNavItem
                icon="forum"
                label="Messages & Contacts"
                isActive={activeTab === "admin-messages" && !modalView}
                onClick={() => {
                  setInboxWaId(null);
                  goToTab("admin-messages");
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 shrink-0">
          <DesktopNavItem
            icon="person"
            label="Profile"
            isActive={activeTab === "profile" && !modalView}
            onClick={() => goToTab("profile")}
          />
        </div>
      </nav>

      {/* Mobile Top App Bar */}
      <header className="md:hidden shrink-0 z-40 bg-background-base w-full h-16 flex items-center px-4 shadow-[0_4px_12px_rgba(209,217,230,0.4)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            className="min-w-11 min-h-11 flex items-center justify-center rounded-xl neumorphic-raised active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">menu</span>
          </button>
          <span className="text-[20px] font-bold text-primary tracking-tight">DueMate</span>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={!isDrawerOpen}
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#F6F4F0] shadow-[8px_0_32px_rgba(15,23,42,0.15)] border-r border-white/80 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full bg-[#F6F4F0]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">DueMate</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="min-w-11 min-h-11 flex items-center justify-center rounded-xl neu-raised-premium active:scale-95 transition-transform"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-slate-600" aria-hidden="true">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-4">Main</span>
              <DesktopNavItem
                icon="home"
                label="Home"
                isActive={activeTab === "home" && !modalView}
                onClick={() => goToTab("home")}
              />
              <DesktopNavItem
                icon="assignment"
                label="Tasks"
                isActive={activeTab === "tasks" && !modalView}
                onClick={() => goToTab("tasks")}
              />
              <DesktopNavItem
                icon="calendar_month"
                label="Calendar"
                isActive={activeTab === "calendar" && !modalView}
                onClick={() => goToTab("calendar")}
              />
              <DesktopNavItem
                icon="view_timeline"
                label="Timetable"
                isActive={activeTab === "timetable" && !modalView}
                onClick={() => goToTab("timetable")}
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-4">Productivity</span>
              <DesktopNavItem
                icon="smart_toy"
                label="Assistant"
                isActive={activeTab === "assistant" && !modalView}
                onClick={() => goToTab("assistant")}
              />
            </div>

            {adminMode && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-4">Admin</span>
              <DesktopNavItem
                icon="admin_panel_settings"
                label="Timetable Management"
                isActive={activeTab === "admin-timetable" && !modalView}
                onClick={() => goToTab("admin-timetable")}
              />
              <DesktopNavItem
                icon="group"
                label="Users"
                isActive={activeTab === "admin-users" && !modalView}
                onClick={() => goToTab("admin-users")}
              />
              <DesktopNavItem
                icon="forum"
                label="Messages & Contacts"
                isActive={activeTab === "admin-messages" && !modalView}
                onClick={() => {
                  setInboxWaId(null);
                  goToTab("admin-messages");
                }}
              />
            </div>
            )}

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-4">Account</span>
              <DesktopNavItem
                icon="person"
                label="Profile"
                isActive={activeTab === "profile" && !modalView}
                onClick={() => goToTab("profile")}
              />
            </div>
          </div>

          <div className="pt-6 mt-auto border-t border-white/40">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 text-danger hover:bg-white/40 rounded-xl px-4 py-3 active:scale-95 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-2xl">logout</span>
              <span className="font-bold text-sm uppercase tracking-wider">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      <main
        className={`flex-1 min-h-0 min-w-0 ${
          !modalView && activeTab === "assistant"
            ? "overflow-hidden flex flex-col"
            : "overflow-y-auto"
        }`}
      >
      {modalView === "upload-timetable" && (
        <UploadTimetable
          onComplete={handleTimetableComplete}
          onBack={handleBackFromModal}
        />
      )}
      {modalView === "change-official-class" && (
        <SectionSetup
          mode="change"
          currentSection={timetableSection}
          onBack={handleBackFromModal}
          onDone={handleOfficialClassChange}
          onNeedUpload={() => setModalView("upload-timetable")}
        />
      )}
      {modalView === "change-class" && (
        <UploadTimetable
          onComplete={handleTimetableComplete}
          onBack={handleBackFromModal}
          preloadedSections={availableSections}
        />
      )}
      {!modalView && activeTab === "home" && (
        <Dashboard
          key={timetableSection ?? "none"}
          tasks={tasks}
          loading={loadingTasks}
          onNavigate={(tab) => goToTab(tab as Tab)}
        />
      )}
      {!modalView && activeTab === "tasks" && (
        <Tasks 
          user={user} 
          tasks={tasks}
          loading={loadingTasks}
          refreshTasks={refreshTasks}
          onNavigate={(tab) => goToTab(tab as Tab)} 
          onAddTask={() => setIsAddTaskOpen(true)}
        />
      )}
      {!modalView && activeTab === "calendar" && (
        <Calendar 
          user={user} 
          tasks={tasks}
          loading={loadingTasks}
          onAddTask={() => setIsAddTaskOpen(true)}
          onUploadTimetable={handleNavigateTimetable}
          onNavigate={(tab) => goToTab(tab as Tab)}
        />
      )}
      {!modalView && activeTab === "timetable" && (
        <PersonalTimetable
          key={timetableSection ?? "none"}
          section={timetableSection}
          onUploadNew={() => setModalView("upload-timetable")}
          onAskAI={() => goToTab("assistant")}
        />
      )}
      {!modalView && activeTab === "assistant" && <Assistant />}
      {!modalView && activeTab === "admin-timetable" && adminMode && <AdminTimetable />}
      {!modalView && activeTab === "admin-users" && adminMode && (
        <AdminUsers
          onViewMessages={(waId) => {
            setInboxWaId(waId);
            goToTab("admin-messages");
          }}
        />
      )}
      {!modalView && activeTab === "admin-messages" && adminMode && (
        <AdminMessages initialWaId={inboxWaId} />
      )}
      {!modalView && activeTab === "profile" && (
        <Profile
          user={user}
          tasks={tasks}
          onLogout={onLogout}
          onNavigateTimetable={handleNavigateTimetable}
          availableSections={availableSections}
          hasOfficialSections={officialSections.length > 0}
          currentSection={timetableSection}
          onChangeSection={handleChangeClass}
          showAdminToggle={showAdminToggle}
          adminMode={adminMode}
          onAdminModeChange={handleAdminModeChange}
        />
      )}

      </main>

      {/* AI Task Extraction Modal - only mount when open */}
      {isAddTaskOpen && (
        <AddTaskModal
          isOpen={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
          onSuccess={refreshTasks}
        />
      )}
    </div>
  );
}


// Helper for Desktop Nav Items
function DesktopNavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  if (isActive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current="page"
        className="flex items-center gap-3.5 bg-blue-600/10 text-blue-600 font-semibold rounded-xl px-4 py-3 border-l-4 border-blue-600 transition-all duration-200 w-full text-left min-h-11"
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <span className="text-sm font-semibold tracking-normal">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl px-4 py-3 transition-all duration-200 w-full text-left group min-h-11"
    >
      <span className="material-symbols-outlined text-xl text-slate-500 group-hover:text-slate-900 transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>
        {icon}
      </span>
      <span className="text-sm font-medium tracking-normal transition-colors">{label}</span>
    </button>
  );
}
