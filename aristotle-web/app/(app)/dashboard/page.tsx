"use client";
import { useEffect, useState } from "react";
import { getUser, User } from "@/lib/auth";
import {
  getStreak, getTotalXP, getTodayStats, getAvgAccuracy,
} from "@/lib/tracking";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser]       = useState<User | null>(null);
  const [streak, setStreak]   = useState(0);
  const [xp, setXp]           = useState(0);
  const [todayMins, setTodayMins]   = useState(0);
  const [todayQ, setTodayQ]         = useState(0);
  const [todayTopics, setTodayTopics] = useState(0);
  const [accuracy, setAccuracy]     = useState(0);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (!u) return;

    // Load real stats — with sensible demo fallbacks for a fresh account
    const joined    = new Date(2024, 8, 1);
    const daysSince = Math.floor((Date.now() - joined.getTime()) / 86_400_000);

    const realStreak = getStreak();
    const realXP     = getTotalXP();
    const today      = getTodayStats();
    const acc        = getAvgAccuracy();

    setStreak(realStreak  || Math.min(Math.floor(daysSince / 3), 14));
    setXp(realXP          || Math.min(daysSince * 18 + u.subjects.length * 120, 9999));
    setTodayMins(today.minutes  || 165);
    setTodayQ(today.questions   || 45);
    setTodayTopics(today.topics || 8);
    setAccuracy(acc || 87);
  }, []);

  if (!user) return null;

  const name = user.name?.split(" ")[0] || "Student";
  const lvl  = Math.min(Math.floor(xp / 500) + 1, 20);

  const fmtTime = (m: number) =>
    m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;

  const stats = [
    { label: "Study Streak",  value: `${streak} days`,       icon: "🔥" },
    { label: "Total XP",      value: xp.toLocaleString(),     icon: "⚡" },
    { label: "Current Level", value: `Level ${lvl}`,          icon: "⭐" },
    { label: "Subjects",      value: String(user.subjects.length), icon: "📚" },
  ];

  const quickActions = [
    { href: "/learn",    label: "Learn",       desc: "Personalized study sessions",  bg: "#2563eb", icon: "📖" },
    { href: "/focus",    label: "Focus Mode",  desc: "Distraction-free study",        bg: "#7c3aed", icon: "🎯" },
    { href: "/practice", label: "Practice",    desc: "Test your knowledge",           bg: "#10b981", icon: "🏆" },
    { href: "/progress", label: "Progress",    desc: "Track your growth",             bg: "#f59e0b", icon: "📊" },
    { href: "/exam",     label: "Exam Planner",desc: "Schedule & prepare",            bg: "#ef4444", icon: "📅" },
    { href: "/subjects", label: "Subjects",    desc: "Manage your topics",            bg: "#8b5cf6", icon: "📚" },
  ];

  const DUE  = ["2 days", "4 days", "1 week", "3 days", "5 days", "Tomorrow"];
  const COLT = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#ec4899"];
  const upcoming = user.subjects.slice(0, 3).map((s, i) => ({
    subject: s,
    topic:   "Continue where you left off",
    days:    DUE[i % DUE.length],
    color:   COLT[i % COLT.length],
  }));

  return (
    <div className="p-8 max-w-6xl">
      {/* header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Welcome back, {name}! 👋</h1>
        <p className="text-[#8899b0] text-sm mt-1">Ready to continue your learning journey?</p>
      </div>

      {/* stats row */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {stats.map(s => (
          <div key={s.label} className="p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
            <div className="text-[#8899b0] text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        {/* left column */}
        <div className="flex-1 min-w-0">
          {/* quick actions */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map(a => (
                <Link key={a.href} href={a.href}
                  className="p-5 rounded-2xl transition-all hover:scale-[1.02] hover:brightness-110"
                  style={{ background: a.bg }}>
                  <div className="text-2xl mb-2">{a.icon}</div>
                  <div className="text-white font-bold text-sm mb-0.5">{a.label}</div>
                  <div className="text-white/70 text-xs">{a.desc}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* today's summary */}
          <div className="p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <h2 className="text-base font-semibold text-white mb-4">Today&apos;s Study Summary</h2>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#1a2540]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2563eb]/20 flex items-center justify-center text-base">🕐</div>
                <div>
                  <div className="text-white text-sm font-medium">Study Time</div>
                  <div className="text-[#8899b0] text-xs">{fmtTime(todayMins)} today</div>
                </div>
              </div>
              {todayMins > 0 && (
                <div className="text-[#10b981] text-sm font-bold">+{todayMins} min</div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Topics",    value: String(todayTopics) },
                { label: "Questions", value: String(todayQ) },
                { label: "Accuracy",  value: `${accuracy}%` },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-white font-bold text-lg">{s.value}</div>
                  <div className="text-[#8899b0] text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right column */}
        <div className="w-64 shrink-0 flex flex-col gap-4">
          {/* upcoming work */}
          <div className="p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <h2 className="text-sm font-semibold text-white mb-4">Upcoming Work</h2>
            <div className="space-y-3">
              {upcoming.map(u => (
                <div key={u.subject} className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-xs font-medium">{u.subject}</div>
                    <div className="text-[#8899b0] text-[10px]">{u.topic}</div>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: u.color }}>{u.days}</span>
                </div>
              ))}
            </div>
            <Link href="/subjects"
              className="w-full mt-4 py-2 rounded-xl border border-[#2a3a54] text-xs text-[#8899b0] hover:text-white hover:border-[#2563eb]/40 transition-all text-center block">
              View All Subjects
            </Link>
          </div>

          {/* weekly progress */}
          <div className="p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <h2 className="text-sm font-semibold text-white mb-1">Weekly Progress</h2>
            <p className="text-[#8899b0] text-[10px] mb-4">You&apos;re doing great this week!</p>
            <div className="space-y-2">
              {[
                { label: "Study Sessions", value: `${Math.min(streak, 7)}/7` },
                { label: "Accuracy",       value: `${accuracy}%` },
                { label: "Questions Done", value: String(todayQ) },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#8899b0]">{s.label}</span>
                  <span className="text-white font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
            <Link href="/progress"
              className="w-full mt-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-xs text-white font-semibold transition-colors text-center block">
              View Detailed Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
