import { useState, useEffect } from "react";
import { Dashboard } from "./Dashboard/Dashboard";
import { Tasks } from "./Tasks/Tasks";
import { Calendar } from "./Calendar/Calendar";
import { Assistant } from "./Assistant/Assistant";
import { Profile } from "./Profile/Profile";
import { UploadTimetable } from "./UploadTimetable/UploadTimetable";
import { PersonalTimetable } from "./Timetable/PersonalTimetable";
import { AddTaskModal } from "../components/AddTaskModal";
import { tasksApi } from "../api";
import type { User, Task } from "../types";

interface AppShellProps {
  onLogout: () => void;
  user: User;
}

type Tab = "home" | "tasks" | "calendar" | "timetable" | "assistant" | "profile";
type ModalView = null | "upload-timetable";

export function AppShell({ onLogout, user }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [modalView, setModalView] = useState<ModalView>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [timetableSection, setTimetableSection] = useState<string | null>(null);

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

  function handleNavigateTimetable() {
    setModalView("upload-timetable");
  }

  function handleBackFromModal() {
    setModalView(null);
  }

  // ── Fullscreen modal views (not part of bottom nav) ────────────────
  if (modalView === "upload-timetable") {
    return (
      <UploadTimetable
        onComplete={handleTimetableComplete}
        onBack={handleBackFromModal}
      />
    );
  }



  // ── Main App Shell with Bottom Navigation ──────────────────────────
  return (
    <div className="min-h-screen bg-background-base flex flex-col md:flex-row overflow-x-hidden">
      {/* Desktop Navigation Sidebar */}
      <nav className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-surface-neumorphic shadow-[6px_0_12px_rgba(0,0,0,0.05)] py-8 px-4 z-50">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">DueMate</span>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          <DesktopNavItem
            icon="home"
            label="Home"
            isActive={activeTab === "home"}
            onClick={() => setActiveTab("home")}
          />
          <DesktopNavItem
            icon="assignment"
            label="Tasks"
            isActive={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
          />
          <DesktopNavItem
            icon="calendar_month"
            label="Calendar"
            isActive={activeTab === "calendar"}
            onClick={() => setActiveTab("calendar")}
          />
          <DesktopNavItem
            icon="view_timeline"
            label="Timetable"
            isActive={activeTab === "timetable"}
            onClick={() => setActiveTab("timetable")}
          />
          <DesktopNavItem
            icon="smart_toy"
            label="Assistant"
            isActive={activeTab === "assistant"}
            onClick={() => setActiveTab("assistant")}
          />
        </div>

        <div className="mt-auto">
          <DesktopNavItem
            icon="person"
            label="Profile"
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </div>
      </nav>

      {/* Mobile Top App Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-background-base w-full h-16 flex items-center justify-between px-4 shadow-[0_4px_12px_rgba(209,217,230,0.4)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl neumorphic-raised active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <span className="text-[20px] font-bold text-primary tracking-tight">DueMate</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl neumorphic-raised active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-secondary">notifications</span>
        </button>
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
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#EAF0F8] shadow-[8px_0_32px_rgba(15,23,42,0.15)] border-r border-white/80 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full bg-[#EAF0F8]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">DueMate</span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl neu-raised-premium active:scale-95 transition-transform"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-slate-600">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-4">Main</span>
              <DesktopNavItem
                icon="home"
                label="Dashboard"
                isActive={activeTab === "home"}
                onClick={() => {
                  setActiveTab("home");
                  setIsDrawerOpen(false);
                }}
              />
              <DesktopNavItem
                icon="assignment"
                label="Tasks"
                isActive={activeTab === "tasks"}
                onClick={() => {
                  setActiveTab("tasks");
                  setIsDrawerOpen(false);
                }}
              />
              <DesktopNavItem
                icon="calendar_month"
                label="Calendar"
                isActive={activeTab === "calendar"}
                onClick={() => {
                  setActiveTab("calendar");
                  setIsDrawerOpen(false);
                }}
              />
              <DesktopNavItem
                icon="view_timeline"
                label="Timetable"
                isActive={activeTab === "timetable"}
                onClick={() => {
                  setActiveTab("timetable");
                  setIsDrawerOpen(false);
                }}
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-4">Productivity</span>
              <DesktopNavItem
                icon="smart_toy"
                label="AI Assistant"
                isActive={activeTab === "assistant"}
                onClick={() => {
                  setActiveTab("assistant");
                  setIsDrawerOpen(false);
                }}
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-4">Account</span>
              <DesktopNavItem
                icon="person"
                label="Profile"
                isActive={activeTab === "profile"}
                onClick={() => {
                  setActiveTab("profile");
                  setIsDrawerOpen(false);
                }}
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
      <main className="flex-1 min-h-screen">
      {activeTab === "home" && (
        <Dashboard
          tasks={tasks}
          loading={loadingTasks}
          onNavigate={(tab) => {
            if (tab === "calendar") setActiveTab("calendar");
            else if (tab === "tasks") setActiveTab("tasks");
            else if (tab === "assistant") setActiveTab("assistant");
            else if (tab === "profile") setActiveTab("profile");
            else if (tab === "timetable") setActiveTab("timetable");
          }}
        />
      )}
      {activeTab === "tasks" && (
        <Tasks 
          user={user} 
          tasks={tasks}
          loading={loadingTasks}
          refreshTasks={refreshTasks}
          onNavigate={(tab) => setActiveTab(tab as any)} 
          onAddTask={() => setIsAddTaskOpen(true)}
        />
      )}
      {activeTab === "calendar" && (
        <Calendar 
          user={user} 
          tasks={tasks}
          loading={loadingTasks}
          onAddTask={() => setIsAddTaskOpen(true)}
          onNavigate={(tab) => setActiveTab(tab as any)}
        />
      )}
      {activeTab === "timetable" && (
        <PersonalTimetable
          section={timetableSection}
          onUploadNew={() => setModalView("upload-timetable")}
          onAskAI={() => setActiveTab("assistant")}
        />
      )}
      {activeTab === "assistant" && <Assistant />}
      {activeTab === "profile" && (
        <Profile
          user={user}
          tasks={tasks}
          onLogout={onLogout}
          onNavigateTimetable={handleNavigateTimetable}
        />
      )}

      </main>

      {/* AI Task Extraction Modal */}
      <AddTaskModal 
        isOpen={isAddTaskOpen} 
        onClose={() => setIsAddTaskOpen(false)} 
        onSuccess={refreshTasks} 
      />
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
        onClick={onClick}
        className="flex items-center gap-3.5 bg-blue-600/10 text-blue-600 font-semibold rounded-xl px-4 py-3 border-l-4 border-blue-600 transition-all duration-200 w-full text-left"
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
      onClick={onClick}
      className="flex items-center gap-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl px-4 py-3 transition-all duration-200 w-full text-left group"
    >
      <span className="material-symbols-outlined text-xl text-slate-500 group-hover:text-slate-900 transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>
        {icon}
      </span>
      <span className="text-sm font-medium tracking-normal transition-colors">{label}</span>
    </button>
  );
}
