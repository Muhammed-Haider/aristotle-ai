import { useState } from "react";
import { apiPost } from "../api";
import DashboardScreen from "./DashboardScreen";
import SubjectsScreen from "./SubjectsScreen";
import LearnScreen from "./LearnScreen";
import FocusModeScreen from "./FocusModeScreen";
import PracticeScreen from "./PracticeScreen";
import ProgressScreen from "./ProgressScreen";
import ExamPlannerScreen from "./ExamPlannerScreen";
import ProfileScreen from "./ProfileScreen";
import SettingsScreen from "./SettingsScreen";

type Tab = "dashboard" | "subjects" | "learn" | "focus" | "practice" | "progress" | "exam" | "profile" | "settings";

const NAV: Array<{ id: Tab; label: string; icon: React.JSX.Element }> = [
  { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { id: "subjects",  label: "My Subjects", icon: <BookIcon /> },
  { id: "learn",     label: "Learn", icon: <SparkleIcon /> },
  { id: "focus",     label: "Focus Mode", icon: <TargetIcon /> },
  { id: "practice",  label: "Practice", icon: <TrophyIcon /> },
  { id: "progress",  label: "Progress", icon: <ChartIcon /> },
  { id: "exam",      label: "Exam Planner", icon: <CalendarIcon /> },
  { id: "profile",   label: "Profile", icon: <PersonIcon /> },
];

interface Props {
  user: { email: string; name: string };
  onLogout: () => void;
  onBenchmark: () => void;
}

export default function AppShell({ user, onLogout, onBenchmark }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [focusMode, setFocusMode] = useState(false);

  async function handleLogout() {
    await apiPost("/auth/logout", {}).catch(() => {});
    onLogout();
  }

  if (focusMode) {
    return <FocusModeScreen onExit={() => setFocusMode(false)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d1117]">
      {/* sidebar */}
      <aside className="sidebar w-[220px] shrink-0 flex flex-col py-5 px-3">
        {/* brand */}
        <div className="px-3 mb-7">
          <div className="text-white font-bold text-base leading-tight">Aristotle</div>
          <div className="text-[#2563eb] text-xs font-medium">Learn with Reason</div>
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => id === "focus" ? setFocusMode(true) : setTab(id)}
              className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                tab === id && id !== "focus" ? "active" : ""
              }`}
            >
              <span className="w-4 h-4 shrink-0">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* bottom: settings */}
        <div className="border-t border-[#1e2a3e] pt-3 mt-4">
          <button
            onClick={() => setTab("settings")}
            className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all ${tab === "settings" ? "active" : ""}`}>
            <span className="w-4 h-4 shrink-0"><SettingsIcon /></span>
            Settings
          </button>
          <div className="flex items-center gap-2 mt-3 px-3">
            <div className="w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <span className="text-[#c8d3e0] text-xs truncate">{user.name || user.email}</span>
          </div>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {tab === "dashboard" && <DashboardScreen user={user} onNavigate={(t) => setTab(t as Tab)} onFocus={() => setFocusMode(true)} />}
        {tab === "subjects"  && <SubjectsScreen />}
        {tab === "learn"     && <LearnScreen user={user} />}
        {tab === "practice"  && <PracticeScreen />}
        {tab === "progress"  && <ProgressScreen />}
        {tab === "exam"      && <ExamPlannerScreen />}
        {tab === "profile"   && <ProfileScreen user={user} onLogout={handleLogout} />}
        {tab === "settings"  && <SettingsScreen onBenchmark={onBenchmark} />}
      </main>
    </div>
  );
}

function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function BookIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10M7 12h10M7 17h6"/></svg>;
}
function SparkleIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 3l1.9 5.8a1 1 0 0 0 .6.6L20.3 11.4l-5.8 1.9a1 1 0 0 0-.6.6L12 20.2l-1.9-5.8a1 1 0 0 0-.6-.6L3.7 12l5.8-1.9a1 1 0 0 0 .6-.6z"/></svg>;
}
function TargetIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
function TrophyIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>;
}
function ChartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>;
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
}
function PersonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function SettingsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
