import { useEffect, useState } from "react";
import { apiGet } from "../api";

interface Passport { topics: Record<string, number>; total_questions: number; streak: number; }

const WEEKLY = [
  { day: "Mon", sessions: 3, quiz: 2 },
  { day: "Tue", sessions: 5, quiz: 4 },
  { day: "Wed", sessions: 2, quiz: 1 },
  { day: "Thu", sessions: 6, quiz: 5 },
  { day: "Fri", sessions: 4, quiz: 3 },
  { day: "Sat", sessions: 7, quiz: 6 },
  { day: "Sun", sessions: 3, quiz: 2 },
];

const SUBJECTS_DATA = [
  { name: "Data Structures & Algorithms", pct: 65, color: "#2563eb" },
  { name: "Operating Systems", pct: 48, color: "#7c3aed" },
  { name: "Computer Networks", pct: 72, color: "#16a34a" },
  { name: "Database Systems", pct: 34, color: "#ea580c" },
  { name: "OOP", pct: 80, color: "#0891b2" },
  { name: "Theory of Computation", pct: 29, color: "#be185d" },
];

export default function ProgressScreen() {
  const [data, setData] = useState<Passport | null>(null);

  useEffect(() => {
    apiGet<Passport>("/passport").then(setData).catch(() => {
      setData({ topics: {}, total_questions: 45, streak: 12 });
    });
  }, []);

  const topics = Object.entries(data?.topics || {});

  return (
    <div className="p-8 min-h-full">
      {/* header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress Analytics</h1>
          <p className="text-[#8899b0] text-sm mt-0.5">Track your learning journey</p>
        </div>
        <div className="flex gap-2">
          {["7 Days", "30 Days", "All Time"].map((p, i) => (
            <button key={p}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${i === 0 ? "bg-[#2563eb] text-white" : "bg-[#131c2e] border border-[#1e2a3e] text-[#8899b0] hover:text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Study Streak", value: `${data?.streak ?? 12} days`, sub: "Personal best: 18", color: "#f97316" },
          { label: "Questions Done", value: data?.total_questions ?? 45, sub: "+12 this week", color: "#2563eb" },
          { label: "Topics Explored", value: topics.length || 8, sub: "Across 4 subjects", color: "#7c3aed" },
          { label: "Avg. Accuracy", value: "87%", sub: "+3% from last week", color: "#16a34a" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card px-5 py-4">
            <div className="text-[#8899b0] text-xs mb-1">{label}</div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-xs" style={{ color }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* weekly chart */}
        <div className="col-span-2 card p-5">
          <h3 className="text-white font-semibold mb-4">Weekly Activity</h3>
          <div className="flex items-end gap-3 h-32">
            {WEEKLY.map(({ day, sessions, quiz }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5" style={{ height: "100px" }}>
                  <div style={{ flex: 1 }} />
                  <div className="w-full rounded-t-sm transition-all"
                    style={{ height: `${(sessions / 7) * 80}px`, background: "#2563eb" }} />
                  <div className="w-full rounded-t-sm transition-all"
                    style={{ height: `${(quiz / 6) * 50}px`, background: "#7c3aed" }} />
                </div>
                <span className="text-[#4a5568] text-[10px]">{day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]" /><span className="text-[#8899b0] text-xs">Study Sessions</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#7c3aed]" /><span className="text-[#8899b0] text-xs">Quizzes</span></div>
          </div>
        </div>

        {/* accuracy ring */}
        <div className="card p-5 flex flex-col items-center justify-center">
          <h3 className="text-white font-semibold mb-4 self-start">Overall Accuracy</h3>
          <div className="relative w-28 h-28 mb-3">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1e2a3e" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#2563eb" strokeWidth="3"
                strokeDasharray={`${87 * 0.9999} ${100 - 87}`} strokeDashoffset="0" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">87%</span>
            </div>
          </div>
          <p className="text-[#8899b0] text-xs text-center">Great job! You're above your weekly target of 80%</p>
        </div>
      </div>

      {/* subjects progress */}
      <div className="card p-5 mb-6">
        <h3 className="text-white font-semibold mb-4">Subject Mastery</h3>
        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
          {SUBJECTS_DATA.map(({ name, pct, color }) => (
            <div key={name}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[#c8d3e0] text-sm">{name}</span>
                <span className="text-white text-sm font-semibold">{pct}%</span>
              </div>
              <div className="w-full h-2 bg-[#1e2a3e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* topic mastery */}
      {topics.length > 0 && (
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4">Topic Mastery</h3>
          <div className="flex flex-col gap-3">
            {topics.map(([topic, score]) => (
              <div key={topic}>
                <div className="flex justify-between mb-1">
                  <span className="text-[#c8d3e0] text-sm capitalize">{topic}</span>
                  <span className="text-white text-sm font-semibold">{score}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1e2a3e] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563eb] transition-all duration-700" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
