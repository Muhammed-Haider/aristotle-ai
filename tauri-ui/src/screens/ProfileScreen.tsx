import { useState } from "react";

interface Props {
  user: { email: string; name: string };
  onLogout: () => void;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${on ? "bg-[#2563eb]" : "bg-[#1e2a3e]"}`}
      style={{ width: "40px", height: "22px" }}>
      <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${on ? "left-5" : "left-0.5"}`}
        style={{ width: "18px", height: "18px", left: on ? "20px" : "2px" }} />
    </button>
  );
}

export default function ProfileScreen({ user, onLogout }: Props) {
  const [focusMode, setFocusMode] = useState(true);
  const [breakReminders, setBreakReminders] = useState(false);
  const [studyReminders, setStudyReminders] = useState(true);
  const [streakNotifs, setStreakNotifs] = useState(false);
  const [theme, setTheme] = useState("Dark Mode");
  const [language, setLanguage] = useState("English");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [showDelete, setShowDelete] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="p-8 min-h-full">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-[#8899b0] text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl flex flex-col gap-5">
        {/* profile card */}
        <div className="card p-5">
          <div className="flex items-start gap-4">
            {/* avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#2a3f5f] flex items-center justify-center text-white text-xl font-bold">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>

            {/* info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-[#8899b0] text-xs mb-0.5">Full Name</div>
                  <div className="text-white font-semibold">
                    {user.name && !user.name.includes("@") ? user.name : "Alex Johnson"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563eb]/20 text-[#2563eb] text-xs font-medium border border-[#2563eb]/30">
                    Registered User
                  </span>
                  <button className="text-[#4a5568] hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-[#8899b0] text-xs mb-2">Email Address</div>
              <input defaultValue={user.email} className="input-field text-sm py-2" readOnly />
            </div>

            {/* joined */}
            <div className="text-right text-xs text-[#4a5568] shrink-0">
              <div>Joined September</div>
              <div>Last login: 2 hrs ago</div>
            </div>
          </div>
        </div>

        {/* focus & notifications */}
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4">Focus & Notifications</h3>
          <div className="flex flex-col divide-y divide-[#1e2a3e]">
            {[
              { icon: "⚡", label: "Focus Mode", desc: "Enable distraction-free studying", on: focusMode, set: setFocusMode },
              { icon: "🔔", label: "Break Reminders", desc: "Get notified to take breaks", on: breakReminders, set: setBreakReminders },
              { icon: "🔔", label: "Study Reminders", desc: "Daily study session reminders", on: studyReminders, set: setStudyReminders },
              { icon: "🔥", label: "Streak Notifications", desc: "Celebrate your study streaks", on: streakNotifs, set: setStreakNotifs },
            ].map(({ icon, label, desc, on, set }) => (
              <div key={label} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-base">{icon}</span>
                  <div>
                    <div className="text-white text-sm">{label}</div>
                    <div className="text-[#4a5568] text-xs">{desc}</div>
                  </div>
                </div>
                <Toggle on={on} onChange={set} />
              </div>
            ))}
          </div>
        </div>

        {/* profile switcher */}
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-1">Profile Switcher</h3>
          <p className="text-[#8899b0] text-xs mb-4">Switch between multiple profiles or use guest mode</p>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#1e2a3e] bg-[#0d1117]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8899b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <div>
              <div className="text-white text-xs font-medium">Personal Account</div>
              <div className="text-[#4a5568] text-xs">{user.email}</div>
            </div>
          </div>
        </div>

        {/* preferences */}
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4">Preferences</h3>
          <div className="flex flex-col gap-4">
            {[
              { icon: "🌙", label: "Theme", val: theme, set: setTheme, opts: ["Dark Mode", "Light Mode", "System"] },
              { icon: "🌍", label: "Language", val: language, set: setLanguage, opts: ["English", "Urdu", "Arabic"] },
              { icon: "🎯", label: "Difficulty Preference", val: difficulty, set: setDifficulty, opts: ["Beginner", "Intermediate", "Advanced"] },
            ].map(({ icon, label, val, set, opts }) => (
              <div key={label}>
                <div className="flex items-center gap-2 text-[#8899b0] text-xs mb-1.5">
                  <span>{icon}</span> {label}
                </div>
                <select value={val} onChange={e => set(e.target.value)} className="input-field text-sm py-2">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <p className="text-[#4a5568] text-xs">This sets the default difficulty for quizzes and learning materials</p>
          </div>
        </div>

        {/* account actions */}
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4">Account Actions</h3>
          <div className="flex flex-col gap-2">
            <button onClick={() => setShowChangePass(true)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[#1e2a3e] text-[#c8d3e0] text-sm hover:border-[#2a3f5f] hover:text-white transition-all text-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              Change Password
            </button>
            <button onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[#1e2a3e] text-[#c8d3e0] text-sm hover:border-[#2a3f5f] hover:text-white transition-all text-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Log Out
            </button>
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[#1e2a3e] text-red-500 text-sm hover:border-red-500/40 hover:bg-red-500/5 transition-all text-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* delete modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-sm text-center">
            <div className="text-red-400 text-3xl mb-3">⚠️</div>
            <h3 className="text-white font-semibold mb-2">Delete Account?</h3>
            <p className="text-[#8899b0] text-sm mb-5">This action cannot be undone. All your data will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1">Cancel</button>
              <button className="flex-1 btn-primary" style={{ background: "#dc2626" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* change password modal */}
      {showChangePass && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-4">Change Password</h3>
            <div className="flex flex-col gap-3 mb-4">
              <input type="password" placeholder="Current password" className="input-field" />
              <input type="password" placeholder="New password" className="input-field" />
              <input type="password" placeholder="Confirm new password" className="input-field" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowChangePass(false)} className="btn-secondary flex-1">Cancel</button>
              <button className="btn-primary flex-1">Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
