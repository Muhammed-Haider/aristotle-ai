"use client";
import { useEffect, useState } from "react";
import { getUser, User } from "@/lib/auth";

interface Exam { name: string; date: string; daysLeft: number; color: string; prep: number; }

const WEEK_ITEMS = [
  { week: "This Week", items: ["Complete Quantum Mechanics", "Practice 20 problems", "Review formulas"] },
  { week: "Next Week",  items: ["Thermodynamics review", "Past papers", "Mock exam"] },
  { week: "Week 3",     items: ["Final revision", "Weak areas focus", "Quick reviews"] },
];

export default function ExamPage() {
  const [user, setUser]      = useState<User | null>(null);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [target, setTarget]  = useState("");
  const [exams, setExams]    = useState<Exam[]>([
    { name: "Physics Final",       date: "Dec 26, 2024", daysLeft: 9,  color: "#ef4444", prep: 65 },
    { name: "Mathematics Midterm", date: "Jan 5, 2025",  daysLeft: 17, color: "#f59e0b", prep: 42 },
    { name: "Chemistry Exam",      date: "Jan 12, 2025", daysLeft: 24, color: "#10b981", prep: 38 },
  ]);

  useEffect(() => { setUser(getUser()); }, []);
  if (!user) return null;

  function addExam() {
    if (!examName || !examDate) return;
    const today = new Date();
    const d     = new Date(examDate);
    const days  = Math.max(0, Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const color = days < 10 ? "#ef4444" : days < 20 ? "#f59e0b" : "#10b981";
    setExams(prev => [...prev, { name: examName, date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), daysLeft: days, color, prep: 0 }]);
    setExamName(""); setExamDate(""); setTarget("");
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Exam Planner</h1>
        <p className="text-[#8899b0] text-sm mt-1">Schedule and track your exam preparation</p>
      </div>

      {/* exam cards */}
      <div className="flex gap-4 mb-7">
        {exams.slice(0, 3).map(e => (
          <div key={e.name} className="flex-1 p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-semibold text-sm">{e.name}</div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8899b0" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="text-[#8899b0] text-xs mb-3">{e.date}</div>
            <div className="text-4xl font-bold mb-1" style={{ color: e.color }}>{e.daysLeft}</div>
            <div className="text-[#8899b0] text-xs mb-4">days remaining</div>
            <div className="text-[#8899b0] text-xs mb-1">Preparation: {e.prep}%</div>
            <div className="w-full h-1.5 bg-[#1a2540] rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full" style={{ width: `${e.prep}%`, background: e.color }} />
            </div>
            <div className="text-[#4a5568] text-[10px]">0 topics completed</div>
          </div>
        ))}
      </div>

      {/* create exam goal */}
      <div className="p-5 rounded-2xl border border-[#1a2540] mb-7" style={{ background: "#0c1a2e" }}>
        <h2 className="text-sm font-semibold text-white mb-4">Create Exam Goal</h2>
        <div className="flex gap-3">
          <input value={examName} onChange={e => setExamName(e.target.value)}
            placeholder="Exam Name"
            className="flex-1 border border-[#2a3a54] text-[#e2e8f0] text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#2563eb] placeholder-[#4a5568] transition-colors" style={{ background: "#091525" }} />
          <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
            className="border border-[#2a3a54] text-[#e2e8f0] text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#2563eb] transition-colors" style={{ background: "#091525" }} />
          <input value={target} onChange={e => setTarget(e.target.value)}
            placeholder="e.g. 90%"
            className="w-28 border border-[#2a3a54] text-[#e2e8f0] text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#2563eb] placeholder-[#4a5568] transition-colors" style={{ background: "#091525" }} />
        </div>
        <button onClick={addExam}
          className="w-full mt-3 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#2563eb]/20">
          Create Exam Goal
        </button>
      </div>

      <div className="flex gap-6">
        {/* study plan timeline */}
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-white mb-4">Study Plan Timeline</h2>
          <div className="space-y-3">
            {WEEK_ITEMS.map((w, wi) => (
              <div key={w.week} className="p-4 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold shrink-0">{wi + 1}</div>
                  <span className="text-white text-sm font-semibold">{w.week}</span>
                </div>
                <div className="space-y-1.5 pl-9">
                  {w.items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-[#8899b0]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2a3a54] shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right column */}
        <div className="w-56 shrink-0 space-y-4">
          {/* study stats */}
          <div className="p-4 rounded-2xl border border-[#1a2540]" style={{ background: "linear-gradient(135deg, #1e1050, #0c1a2e)" }}>
            <h3 className="text-xs font-semibold text-white mb-3">Study Stats</h3>
            <div className="space-y-2 text-xs">
              {[{ label: "Daily Goal", value: "2h 30m" }, { label: "Topics (2024)", value: "1709 topics" }, { label: "Days Active", value: "1314" }].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[#8899b0]">{s.label}</span>
                  <span className="text-white font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* recommendation */}
          <div className="p-4 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <h3 className="text-xs font-semibold text-white mb-2">Recommendation</h3>
            <p className="text-[#8899b0] text-xs leading-relaxed">
              Physics exam in 9 days. Focus 40% of your daily time on Wave Mechanics and Thermodynamics.
            </p>
          </div>

          {/* quick actions */}
          <div className="p-4 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <h3 className="text-xs font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              {["Practice Test", "Review Material", "Check Progress"].map(a => (
                <button key={a} className="w-full text-left text-xs text-[#8899b0] hover:text-white px-3 py-2 rounded-lg hover:bg-[#0f1e36] transition-colors">
                  → {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
