"use client";
import { useEffect, useState } from "react";
import { getUser, User } from "@/lib/auth";

const MOCK_PCT = [72, 45, 88, 34, 61, 79, 52, 91, 38, 67, 83, 55];
const MOCK_QS  = [24, 12, 31,  8, 19, 27, 14, 33, 10, 22, 28, 16];
const WEEKLY   = [35, 60, 45, 80, 65, 90, 78];
const DAYS     = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(getUser()); }, []);
  if (!user) return null;

  const masteries = user.subjects.map((s, i) => ({
    subject: s,
    pct: MOCK_PCT[i % MOCK_PCT.length],
    questions: MOCK_QS[i % MOCK_QS.length],
  }));

  const totalQ   = masteries.reduce((a, m) => a + m.questions, 0);
  const avgMastery = Math.round(masteries.reduce((a, m) => a + m.pct, 0) / Math.max(masteries.length, 1));
  const maxWeekly = Math.max(...WEEKLY);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Your Progress</h1>
        <p className="text-[#8899b0] text-sm">Track your learning journey across all subjects</p>
      </div>

      {/* summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Questions",  value: String(totalQ),      icon: "💬", sub: "across all sessions" },
          { label: "Average Mastery",  value: `${avgMastery}%`,    icon: "🎯", sub: "across all subjects"  },
          { label: "Study Streak",     value: "3 days 🔥",         icon: "📅", sub: "keep it up!"          },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-[#131c2e] border border-[#1e2a3e]">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
            <div className="text-[#8899b0] text-xs">{s.label}</div>
            <div className="text-[#4a5568] text-[10px] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* weekly chart */}
      <div className="p-6 rounded-2xl bg-[#131c2e] border border-[#1e2a3e] mb-6">
        <h2 className="text-sm font-semibold text-white mb-5">Weekly Activity</h2>
        <div className="flex items-end gap-3" style={{ height: "96px" }}>
          {WEEKLY.map((val, i) => (
            <div key={DAYS[i]} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-md transition-all"
                style={{
                  height: `${(val / maxWeekly) * 72}px`,
                  background: i === 6 ? "linear-gradient(to top, #2563eb, #3b82f6)" : "linear-gradient(to top, #1e2a3e, #2a3a54)",
                }} />
              <span className="text-[10px] text-[#8899b0]">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* subject mastery */}
      <div className="p-6 rounded-2xl bg-[#131c2e] border border-[#1e2a3e]">
        <h2 className="text-sm font-semibold text-white mb-6">Subject Mastery</h2>
        <div className="space-y-5">
          {masteries.map(({ subject, pct, questions }) => {
            const barColor = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#2563eb";
            return (
              <div key={subject}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#e2e8f0] font-medium">{subject}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#8899b0]">{questions} questions</span>
                    <span className="text-sm font-bold text-white w-10 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#1e2a3e] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
