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
  { name: "Data Structures & Algorithms", pct: 65, gradient: "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 100%)", glow: "rgba(59,130,246,0.45)" },
  { name: "Operating Systems",            pct: 48, gradient: "linear-gradient(90deg, #6d28d9 0%, #a78bfa 100%)", glow: "rgba(139,92,246,0.45)" },
  { name: "Computer Networks",            pct: 72, gradient: "linear-gradient(90deg, #15803d 0%, #4ade80 100%)", glow: "rgba(74,222,128,0.4)"  },
  { name: "Database Systems",             pct: 34, gradient: "linear-gradient(90deg, #c2410c 0%, #fb923c 100%)", glow: "rgba(251,146,60,0.4)"  },
  { name: "OOP",                          pct: 80, gradient: "linear-gradient(90deg, #0e7490 0%, #22d3ee 100%)", glow: "rgba(34,211,238,0.4)"  },
  { name: "Theory of Computation",        pct: 29, gradient: "linear-gradient(90deg, #9d174d 0%, #f472b6 100%)", glow: "rgba(244,114,182,0.4)" },
];

function getMasteryLabel(pct: number) {
  if (pct >= 80) return { text: "Expert",       color: "#4ade80" };
  if (pct >= 60) return { text: "Advanced",     color: "#60a5fa" };
  if (pct >= 40) return { text: "Intermediate", color: "#f59e0b" };
  return            { text: "Beginner",     color: "#f87171" };
}

interface ProgressBarProps {
  pct: number;
  gradient: string;
  glow: string;
  delay?: number;
  height?: number;
}

function ProgressBar({ pct, gradient, glow, delay = 0, height = 10 }: ProgressBarProps) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 120 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="relative w-full overflow-hidden rounded-full"
      style={{ height, background: "#1a2540" }}>
      {/* Track inner shadow */}
      <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }} />

      {/* Fill */}
      <div
        className="absolute left-0 top-0 h-full rounded-full progress-shimmer overflow-hidden"
        style={{
          width: filled ? `${pct}%` : "0%",
          background: gradient,
          boxShadow: `0 0 10px ${glow}, 0 0 3px ${glow}`,
          transition: `width 0.9s cubic-bezier(0.34, 1.1, 0.64, 1)`,
          "--shimmer-delay": `${delay * 0.001}s`,
        } as React.CSSProperties}
      />

      {/* Glowing tip dot */}
      {filled && (
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `calc(${pct}% - 5px)`,
            width: 10,
            height: 10,
            background: "#fff",
            boxShadow: `0 0 8px 3px ${glow}`,
            transition: `left 0.9s cubic-bezier(0.34, 1.1, 0.64, 1)`,
          }}
        />
      )}
    </div>
  );
}

export default function ProgressScreen() {
  const [data, setData] = useState<Passport | null>(null);

  useEffect(() => {
    apiGet<Passport>("/passport").then(setData).catch(() => {
      setData({ topics: {}, total_questions: 45, streak: 12 });
    });
  }, []);

  const topics = Object.entries(data?.topics || {});

  return (
    <div className="p-8 min-h-full overflow-y-auto">
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
          { label: "Study Streak",    value: `${data?.streak ?? 12} days`, sub: "Personal best: 18", color: "#f97316" },
          { label: "Questions Done",  value: data?.total_questions ?? 45,  sub: "+12 this week",     color: "#2563eb" },
          { label: "Topics Explored", value: topics.length || 8,           sub: "Across 4 subjects",  color: "#7c3aed" },
          { label: "Avg. Accuracy",   value: "87%",                        sub: "+3% from last week", color: "#16a34a" },
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

      {/* ── Subject Mastery ── */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Subject Mastery</h3>
          <span className="text-[#8899b0] text-xs">{SUBJECTS_DATA.length} subjects tracked</span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {SUBJECTS_DATA.map(({ name, pct, gradient, glow }, i) => {
            const mastery = getMasteryLabel(pct);
            return (
              <div key={name} className="group">
                {/* Top row: name + mastery badge + % */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Colored dot matching gradient end */}
                    <span className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: gradient, boxShadow: `0 0 6px ${glow}` }} />
                    <span className="text-[#c8d3e0] text-sm truncate">{name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: mastery.color, background: `${mastery.color}18`, border: `1px solid ${mastery.color}35` }}>
                      {mastery.text}
                    </span>
                    <span className="text-white text-sm font-bold w-9 text-right">{pct}%</span>
                  </div>
                </div>

                {/* Bar */}
                <ProgressBar pct={pct} gradient={gradient} glow={glow} delay={i * 80} height={10} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Topic Mastery ── */}
      {topics.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Topic Mastery</h3>
            <span className="text-[#8899b0] text-xs">{topics.length} topics</span>
          </div>

          <div className="flex flex-col gap-4">
            {topics.map(([topic, score], i) => (
              <div key={topic}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[#c8d3e0] text-sm capitalize">{topic}</span>
                  <span className="text-white text-sm font-bold">{score}%</span>
                </div>
                <ProgressBar
                  pct={score}
                  gradient="linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%)"
                  glow="rgba(96,165,250,0.4)"
                  delay={i * 60}
                  height={8}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
