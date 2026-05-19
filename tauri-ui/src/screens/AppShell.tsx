import { useState } from "react";
import ChatScreen from "./ChatScreen";
import ProgressScreen from "./ProgressScreen";
import SettingsScreen from "./SettingsScreen";
import { apiPost } from "../api";

type Tab = "chat" | "progress" | "settings";

const NAV = [
  { id: "chat",     icon: "💬", label: "Chat" },
  { id: "progress", icon: "📊", label: "Progress" },
  { id: "settings", icon: "⚙️",  label: "Settings" },
] as const;

interface Props {
  user: { email: string; name: string };
  onLogout: () => void;
}

export default function AppShell({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("chat");

  async function handleLogout() {
    await apiPost("/auth/logout", {}).catch(() => {});
    onLogout();
  }

  return (
    <div className="flex h-screen w-screen bg-[#0a0f1e] overflow-hidden">
      {/* sidebar */}
      <aside className="w-[220px] flex flex-col py-6 px-3 border-r border-white/5 bg-[#0d1324] shrink-0">
        {/* brand */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/30">
            A
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Aristotle AI</span>
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                tab === id
                  ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* user */}
        <div className="border-t border-white/5 pt-4 px-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <span className="text-slate-300 text-xs truncate">{user.name || user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-slate-500 hover:text-red-400 transition-colors py-1.5 rounded-lg hover:bg-red-500/10 text-left px-2"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 overflow-hidden">
        {tab === "chat"     && <ChatScreen user={user} />}
        {tab === "progress" && <ProgressScreen />}
        {tab === "settings" && <SettingsScreen />}
      </main>
    </div>
  );
}
