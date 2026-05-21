"use client";
import { useEffect, useState } from "react";
import { getUser, isDemoUser, User } from "@/lib/auth";

interface Exam { name: string; date: string; daysLeft: number; color: string; prep: number; }

const DEMO_EXAMS: Exam[] = [
  { name: "Machine Learning Final", date: "Jun 15, 2025", daysLeft: 25, color: "#ef4444", prep: 65 },
  { name: "Algorithms Midterm",     date: "Jun 22, 2025", daysLeft: 32, color: "#f59e0b", prep: 42 },
  { name: "OS & Networks Exam",     date: "Jul 1, 2025",  daysLeft: 41, color: "#10b981", prep: 38 },
];

const DEMO_WEEK_ITEMS = [
  { week: "This Week", items: ["Complete ML Supervised Learning", "Practice 20 algorithm problems", "Review Big-O notation"] },
  { week: "Next Week",  items: ["Deep Learning revision", "Past papers", "Mock quiz on Networks"] },
  { week: "Week 3",     items: ["Final revision", "Focus on weak areas", "Quick topic reviews"] },
];

export default function ExamPage() {
  const [user, setUser]         = useState<User | null>(null);
  const [demo, setDemo]         = useState(false);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [target, setTarget]     = useState("");
  const [exams, setExams]       = useState<Exam[]>([]);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    const isDemo = isDemoUser(u);
    setDemo(isDemo);
    if (isDemo) setExams(DEMO_EXAMS);
  }, []);
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
      {!demo && exams.length === 0 && (
        <div className="p-8 rounded-2xl border border-dashed border-[#2a3a54] flex flex-col items-center justify-center gap-2 mb-7" style={{ background: "#0c1a2e" }}>
          <div className="text-3xl mb-1">📅</div>
          <p className="text-white text-sm font-semibold">No exams added yet</p>
          <p className="text-[#8899b0] text-xs">Add your first exam below to start planning</p>
        </div>
      )}
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
          {!demo && exams.length === 0 && (
            <div className="p-5 rounded-2xl border border-[#1a2540] text-center" style={{ background: "#0c1a2e" }}>
              <p className="text-[#8899b0] text-xs">Your study plan will appear here once you add an exam.</p>
            </div>
          )}
          <div className="space-y-3">
            {(demo ? DEMO_WEEK_ITEMS : []).map((w, wi) => (
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
              {(demo
                ? [{ label: "Daily Goal", value: "2h 30m" }, { label: "Topics covered", value: "47 topics" }, { label: "Days Active", value: "14" }]
                : [{ label: "Daily Goal", value: "Set a goal" }, { label: "Topics covered", value: "0" }, { label: "Days Active", value: "0" }]
              ).map(s => (
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
              {demo
                ? "ML Final in 25 days. Focus 40% of your daily time on Deep Learning and Neural Networks."
                : "Add an exam above to get personalised study recommendations."}
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
