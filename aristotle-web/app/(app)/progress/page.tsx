"use client";
import { useEffect, useState } from "react";
import { getUser, isDemoUser, User } from "@/lib/auth";
import {
  getMasteryForSubject, getTotalQuestions, getStreak,
  getWeeklyMinutes, getDayLogs,
} from "@/lib/tracking";

// Seeded fallbacks so the page never looks empty for a brand-new user
const MASTERY_FB = [72, 45, 88, 34, 61, 79, 52, 91, 38, 67, 83, 55];
const QCOUNT_FB  = [24, 12, 31,  8, 19, 27, 14, 33, 10, 22, 28, 16];
const COLORS     = ["#2563eb", "#8b5cf6", "#10b981", "#ef4444", "#f59e0b", "#06b6d4"];
const DAYS       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProgressPage() {
  const [user, setUser]       = useState<User | null>(null);
  const [weekly, setWeekly]   = useState<number[]>([35, 60, 45, 80, 65, 90, 78]);
  const [subjects, setSubjects] = useState<
    { subject: string; mastery: number; questions: number; color: string }[]
  >([]);
  const [totalQ, setTotalQ]         = useState(0);
  const [avgMastery, setAvgMastery] = useState(0);
  const [streak, setStreak]         = useState(0);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (!u) return;

    const demo = isDemoUser(u);
    const seed = u.email.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

    const subs = u.subjects.map((s, i) => {
      const realMastery = getMasteryForSubject(s);
      return {
        subject:   s,
        mastery:   realMastery ?? (demo ? MASTERY_FB[(seed + i * 7) % MASTERY_FB.length] : 0),
        questions: demo ? QCOUNT_FB[(seed + i * 3) % QCOUNT_FB.length] : 0,
        color:     COLORS[i % COLORS.length],
      };
    });
    setSubjects(subs);

    const realTotal = getTotalQuestions();
    setTotalQ(realTotal || (demo ? subs.reduce((a, s) => a + s.questions, 0) : 0));
    setAvgMastery(Math.round(subs.reduce((a, s) => a + s.mastery, 0) / Math.max(subs.length, 1)));
    setStreak(getStreak() || (demo ? 14 : 0));

    const wm = getWeeklyMinutes();
    const hasRealData = wm.some(m => m > 0);
    if (hasRealData) {
      setWeekly(wm);
    } else if (demo) {
      setWeekly([35, 60, 45, 80, 65, 90, 78]);
    } else {
      setWeekly([0, 0, 0, 0, 0, 0, 0]);
    }
  }, []);

  if (!user) return null;
  const demo = isDemoUser(user);

  const maxWeekly = Math.max(...weekly, 1);

  // Get day logs for question count per day in the weekly view
  const logs = getDayLogs();
  const weeklyQuestions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return logs.find(l => l.date === d.toISOString().slice(0, 10))?.questions ?? 0;
  });
  const totalWeeklyQ = weeklyQuestions.reduce((a, v) => a + v, 0);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Your Progress</h1>
        <p className="text-[#8899b0] text-sm mt-1">Track your learning journey across all subjects</p>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Questions",  value: String(totalQ),     icon: "💬", sub: "across all sessions" },
          { label: "Average Mastery",  value: `${avgMastery}%`,   icon: "🎯", sub: "across all subjects"  },
          { label: "Study Streak",     value: `${streak} days 🔥`, icon: "📅", sub: "keep it up!" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
            <div className="text-[#8899b0] text-xs">{s.label}</div>
            <div className="text-[#4a5568] text-[10px] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* weekly chart */}
      <div className="p-6 rounded-2xl border border-[#1a2540] mb-5" style={{ background: "#0c1a2e" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Weekly Activity</h2>
          {totalWeeklyQ > 0 && (
            <span className="text-xs text-[#8899b0]">{totalWeeklyQ} questions this week</span>
          )}
        </div>
        <div className="flex items-end gap-3" style={{ height: "96px" }}>
          {weekly.map((val, i) => (
            <div key={DAYS[i]} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${(val / maxWeekly) * 72}px`,
                  background: i === 6
                    ? "linear-gradient(to top, #2563eb, #3b82f6)"
                    : "linear-gradient(to top, #1a2540, #2a3a54)",
                }} />
              <span className="text-[10px] text-[#8899b0]">{DAYS[i]}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#4a5568] mt-3">
          {weekly.some(m => m > 0)
            ? "Minutes studied per day this week"
            : demo
            ? "Study sessions will appear here"
            : "Complete your first study session to see activity"}
        </p>
      </div>

      {/* subject mastery bars */}
      <div className="p-6 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-white">Subject Mastery</h2>
          <span className="text-[10px] text-[#4a5568]">
            {subjects.some(s => getMasteryForSubject(s.subject) !== null)
              ? "Based on your practice results"
              : demo
              ? "Take quizzes to update mastery"
              : "Complete practice quizzes to see your mastery"}
          </span>
        </div>
        <div className="space-y-5">
          {subjects.map(({ subject, mastery, questions, color }) => {
            const isReal = getMasteryForSubject(subject) !== null;
            return (
              <div key={subject}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#e2e8f0] font-medium">{subject}</span>
                    {isReal && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10b981]/20 text-[#10b981]">live</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#8899b0]">{questions} questions</span>
                    <span className="text-sm font-bold text-white w-10 text-right">{mastery}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#1a2540] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${mastery}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
