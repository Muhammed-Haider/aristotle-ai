"use client";
import { useEffect, useState } from "react";
import { getUser, saveUser, signOut, User } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser]       = useState<User | null>(null);
  const [name, setName]       = useState("");
  const [saved, setSaved]     = useState(false);
  const [lang, setLang]       = useState("English");
  const [diff, setDiff]       = useState("Intermediate");
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (u) { setUser(u); setName(u.name || ""); setDiff(u.level || "Intermediate"); }
  }, []);

  if (!user) return null;

  const initials = (user.name || user.email || "U").slice(0, 2).toUpperCase();

  function saveProfile() {
    saveUser({ ...user!, name, level: diff });
    setUser({ ...user!, name, level: diff });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function logout() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-[#8899b0] text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* profile card */}
      <div className="p-6 rounded-2xl border border-[#1a2540] mb-5" style={{ background: "#0c1a2e" }}>
        <div className="flex items-start gap-5">
          {/* avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#2a3a54] flex items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center border-2 border-[#0c1a2e] cursor-pointer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>

          {/* fields */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-white font-bold text-lg">{user.name || "No name set"}</div>
                <div className="px-2 py-0.5 rounded-full bg-[#2563eb]/20 text-[#3b82f6] text-xs font-medium inline-block mt-1">
                  Registered User
                </div>
              </div>
              <div className="text-right text-xs text-[#4a5568]">
                <div>Joined September</div>
                <div>Last login: 2h ago</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-[#8899b0] mb-1.5">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-[#2a3a54] text-white text-sm px-3 py-2 rounded-lg outline-none focus:border-[#2563eb] transition-colors" style={{ background: "#091525" }} />
            </div>
            <div>
              <label className="block text-xs text-[#8899b0] mb-1.5">Email Address</label>
              <input value={user.email} readOnly
                className="w-full border border-[#1a2540] text-[#8899b0] text-sm px-3 py-2 rounded-lg outline-none cursor-default" style={{ background: "#091525" }} />
            </div>
          </div>
        </div>
      </div>

      {/* focus & notifications */}
      <div className="p-6 rounded-2xl border border-[#1a2540] mb-5" style={{ background: "#0c1a2e" }}>
        <h2 className="text-sm font-semibold text-white mb-5">Focus &amp; Notifications</h2>
        <div className="space-y-4">
          {[
            { icon: "⚡", label: "Focus Mode",          desc: "Enable distraction-free studying" },
            { icon: "🔔", label: "Break Reminders",     desc: "Get notified to take breaks" },
            { icon: "📅", label: "Study Reminders",     desc: "Daily study session reminders" },
            { icon: "🏆", label: "Streak Notifications",desc: "Celebrate your study streaks" },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between pb-4 border-b border-[#1a2540] last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">{n.icon}</span>
                <div>
                  <div className="text-white text-sm font-medium">{n.label}</div>
                  <div className="text-[#8899b0] text-xs">{n.desc}</div>
                </div>
              </div>
              <div className="w-11 h-6 rounded-full bg-[#2563eb]/30 flex items-center px-0.5 cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-[#2563eb] shadow" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* profile switcher */}
      <div className="p-6 rounded-2xl border border-[#1a2540] mb-5" style={{ background: "#0c1a2e" }}>
        <h2 className="text-sm font-semibold text-white mb-2">Profile Switcher</h2>
        <p className="text-[#8899b0] text-xs mb-4">Switch between multiple profiles or use guest mode</p>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2a3a54]" style={{ background: "#091525" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8899b0" strokeWidth="2" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <div>
            <div className="text-white text-xs font-medium">Personal Account</div>
            <div className="text-[#4a5568] text-[10px]">{user.email}</div>
          </div>
        </div>
      </div>

      {/* preferences */}
      <div className="p-6 rounded-2xl border border-[#1a2540] mb-5" style={{ background: "#0c1a2e" }}>
        <h2 className="text-sm font-semibold text-white mb-5">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-xs text-[#8899b0] mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              Theme
            </label>
            <select className="w-full border border-[#2a3a54] text-[#e2e8f0] text-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer" style={{ background: "#091525" }}>
              <option>Dark Mode</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs text-[#8899b0] mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Language
            </label>
            <select value={lang} onChange={e => setLang(e.target.value)}
              className="w-full border border-[#2a3a54] text-[#e2e8f0] text-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer" style={{ background: "#091525" }}>
              <option>English</option>
              <option>Urdu</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs text-[#8899b0] mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              Difficulty Preference
            </label>
            <select value={diff} onChange={e => setDiff(e.target.value)}
              className="w-full border border-[#2a3a54] text-[#e2e8f0] text-sm px-3 py-2.5 rounded-xl outline-none cursor-pointer" style={{ background: "#091525" }}>
              {["Beginner", "Intermediate", "Advanced", "Expert"].map(d => <option key={d}>{d}</option>)}
            </select>
            <p className="text-[#4a5568] text-[10px] mt-1.5">This sets the default difficulty for quizzes and learning materials</p>
          </div>
        </div>
      </div>

      {/* account actions */}
      <div className="p-6 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
        <h2 className="text-sm font-semibold text-white mb-4">Account Actions</h2>
        <div className="space-y-2">
          <button onClick={saveProfile}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2a3a54] text-sm text-[#e2e8f0] hover:border-[#2563eb]/60 hover:text-white transition-all text-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2a3a54] text-sm text-[#e2e8f0] hover:border-[#4a5568] hover:text-white transition-all text-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log Out
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 text-sm text-red-400 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
