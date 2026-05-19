interface Props {
  user: { email: string; name: string };
  onNavigate: (tab: string) => void;
  onFocus: () => void;
}

const STAT_CARDS = [
  { icon: "🔥", label: "Study Streak", value: "12 days" },
  { icon: "⚡", label: "Total XP", value: "2,450" },
  { icon: "⭐", label: "Current Level", value: "Level 8" },
  { icon: "🏆", label: "Badges", value: "15" },
];

const QUICK_ACTIONS = [
  { label: "Learn", desc: "AI-powered adaptive learning", icon: "🧠", bg: "#2563eb", tab: "learn" },
  { label: "Focus Mode", desc: "Distraction-free study", icon: "◎", bg: "#7c3aed", tab: "focus" },
  { label: "Practice", desc: "Test your knowledge", icon: "🏆", bg: "#16a34a", tab: "practice" },
  { label: "Progress", desc: "Track your growth", icon: "📊", bg: "#ea580c", tab: "progress" },
  { label: "Exam Plan", desc: "Schedule & prepare", icon: "📅", bg: "#dc2626", tab: "exam" },
  { label: "Subjects", desc: "Manage your topics", icon: "📚", bg: "#0891b2", tab: "subjects" },
];

const UPCOMING = [
  { subject: "DSA", topic: "Graph Algorithms", due: "2 days", urgent: true },
  { subject: "OS", topic: "Process Scheduling", due: "4 days", urgent: false },
  { subject: "Networks", topic: "TCP/IP Model", due: "1 week", urgent: false },
];

export default function DashboardScreen({ user, onNavigate, onFocus }: Props) {
  const name = user.name?.split("@")[0] || "Alex";

  return (
    <div className="p-8 min-h-full">
      {/* header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Welcome back, {name}! 👋</h1>
        <p className="text-[#8899b0] text-sm mt-0.5">Ready to continue your learning journey?</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ icon, label, value }) => (
          <div key={label} className="card px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{icon}</span>
              <span className="text-[#8899b0] text-xs">{label}</span>
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* left column */}
        <div className="flex-1 min-w-0">
          {/* quick actions */}
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {QUICK_ACTIONS.map(({ label, desc, icon, bg, tab }) => (
              <button
                key={label}
                onClick={() => tab === "focus" ? onFocus() : onNavigate(tab)}
                className="rounded-xl p-4 text-left transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: bg }}
              >
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-white font-semibold text-sm">{label}</div>
                <div className="text-white/70 text-xs mt-0.5">{desc}</div>
              </button>
            ))}
          </div>

          {/* today's study summary */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4">Today's Study Summary</h3>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#1e2a3e]">
              <div className="w-9 h-9 rounded-full bg-[#2563eb]/20 flex items-center justify-center">
                <span className="text-[#2563eb]">⏱</span>
              </div>
              <div>
                <div className="text-white font-medium text-sm">Study Time</div>
                <div className="text-[#8899b0] text-xs">2h 45m today</div>
              </div>
              <div className="ml-auto text-green-400 text-sm font-medium">+35 min</div>
              <div className="text-[#4a5568] text-xs">vs yesterday</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[["Topics", "8"], ["Questions", "45"], ["Accuracy", "87%"]].map(([l, v]) => (
                <div key={l}>
                  <div className="text-[#8899b0] text-xs mb-0.5">{l}</div>
                  <div className="text-white font-bold">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right column */}
        <div className="w-64 shrink-0 flex flex-col gap-4">
          {/* upcoming work */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4">Upcoming Work</h3>
            <div className="flex flex-col gap-3">
              {UPCOMING.map(({ subject, topic, due, urgent }) => (
                <div key={subject} className="flex items-start justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{subject}</div>
                    <div className="text-[#8899b0] text-xs">{topic}</div>
                  </div>
                  <span className={`text-xs font-medium ${urgent ? "text-red-400" : "text-[#8899b0]"}`}>{due}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate("subjects")}
              className="btn-secondary w-full mt-4 text-xs py-2">View All Subjects</button>
          </div>

          {/* weekly progress */}
          <div className="card p-5" style={{ background: "#162550" }}>
            <h3 className="text-white font-semibold mb-1">Weekly Progress</h3>
            <p className="text-[#8899b0] text-xs mb-4">You're doing great this week!</p>
            <div className="flex flex-col gap-2.5">
              {[["Study Sessions", "18/20"], ["Quiz Completed", "12/15"], ["Avg. Score", "85%"]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-[#8899b0] text-xs">{l}</span>
                  <span className="text-white text-sm font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate("progress")}
              className="w-full mt-4 py-2 rounded-lg bg-[#1e3a6e] text-[#8899b0] hover:text-white text-xs transition-colors">
              View Detailed Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
