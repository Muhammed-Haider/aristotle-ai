"use client";
import { useEffect, useState } from "react";
import { getUser, User } from "@/lib/auth";
import Link from "next/link";

const MOCK_PCT = [72, 45, 88, 34, 61, 79, 52, 91, 38, 67, 83, 55];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setUser(getUser()); }, []);
  if (!user) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Questions Asked", value: "24",    icon: "💬", color: "from-[#2563eb] to-[#3b82f6]" },
    { label: "Study Streak",    value: "3 days", icon: "🔥", color: "from-[#f59e0b] to-[#f97316]" },
    { label: "Topics Active",   value: String(user.subjects.length), icon: "📚", color: "from-[#10b981] to-[#059669]" },
    { label: "Avg. Mastery",    value: "68%",   icon: "🎯", color: "from-[#8b5cf6] to-[#7c3aed]" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{greeting}, {user.name?.split(" ")[0] || "Student"} 👋</h1>
        <p className="text-[#8899b0] text-sm mt-1">Ready to learn something new today?</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-[#131c2e] border border-[#1e2a3e] hover:border-[#2563eb]/20 transition-colors">
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
            <div className="text-[#8899b0] text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* subjects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">My Subjects</h2>
          <Link href="/learn" className="text-xs text-[#2563eb] hover:underline">Start Learning →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {user.subjects.slice(0, 6).map((s, i) => {
            const pct = MOCK_PCT[i % MOCK_PCT.length];
            return (
              <div key={s} className="p-5 rounded-2xl bg-[#131c2e] border border-[#1e2a3e] hover:border-[#2563eb]/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm font-medium text-white leading-snug">{s}</div>
                  <span className="text-xs text-[#8899b0] shrink-0 ml-3 font-medium">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1e2a3e] rounded-full mb-3">
                  <div className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-full transition-all"
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-3">
                  <Link href="/learn" className="text-[10px] text-[#2563eb] hover:underline font-medium">Learn</Link>
                  <span className="text-[#2a3a54]">·</span>
                  <Link href="/practice" className="text-[10px] text-[#8899b0] hover:text-white transition-colors">Quiz</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* quick actions */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          {[
            { href: "/learn",    icon: "🤖", title: "Ask Aristotle",  desc: "Chat with AI tutor"    },
            { href: "/practice", icon: "📝", title: "Practice Quiz",  desc: "Test your knowledge"   },
            { href: "/progress", icon: "📈", title: "View Progress",  desc: "Track your mastery"    },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="flex-1 p-5 rounded-2xl border border-[#1e2a3e] hover:border-[#2563eb]/30 bg-[#131c2e] hover:bg-[#131c2e]/80 transition-all text-center group">
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="text-sm font-semibold text-white mb-1 group-hover:text-[#3b82f6] transition-colors">{a.title}</div>
              <div className="text-xs text-[#8899b0]">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
