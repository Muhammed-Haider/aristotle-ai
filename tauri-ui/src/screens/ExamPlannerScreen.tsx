import { useState } from "react";

const EXAMS = [
  { name: "Physics Final", date: "Dec 28, 2024", days: 9, prep: 65, topics: 18, color: "#dc2626" },
  { name: "Mathematics Midterm", date: "Jan 4, 2025", days: 17, prep: 42, topics: 10, color: "#ea580c" },
  { name: "Chemistry Exam", date: "Jan 11, 2025", days: 24, prep: 28, topics: 24, color: "#2563eb" },
];

const TIMELINE: { week: string; tasks: string[] }[] = [
  { week: "This Week", tasks: ["Complete Quantum Mechanics", "Practice 20 problems", "Review formulas"] },
  { week: "Next Week", tasks: ["Thermodynamics review", "Past papers", "Mock exam"] },
  { week: "Week 3", tasks: ["Final revision", "Weak areas focus", "Quick reviews"] },
];

export default function ExamPlannerScreen() {
  const [open, setOpen] = useState(0);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [targetScore, setTargetScore] = useState("");

  return (
    <div className="p-8 min-h-full">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Exam Planner</h1>
        <p className="text-[#8899b0] text-sm mt-0.5">Schedule and track your exam preparation</p>
      </div>

      {/* exam cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {EXAMS.map(({ name, date, days, prep, topics, color }) => (
          <div key={name} className="card p-5" style={{ borderColor: color + "40" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-white font-semibold text-sm">{name}</div>
                <div className="text-[#8899b0] text-xs mt-0.5">{date}</div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ color }}>{days}</div>
                <div className="text-[#8899b0] text-xs">days remaining</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-[#8899b0] mb-1">
                <span>Preparation</span><span>{prep}%</span>
              </div>
              <div className="h-1.5 bg-[#1e2a3e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${prep}%`, background: color }} />
              </div>
            </div>
            <div className="text-[#4a5568] text-xs">{topics} topics completed</div>
          </div>
        ))}
      </div>

      {/* create goal + timeline */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* create exam goal */}
          <div className="card p-5 mb-5">
            <h3 className="text-white font-semibold mb-4">Create Exam Goal</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-[#8899b0] mb-1.5 block">Exam Name</label>
                <input value={examName} onChange={e => setExamName(e.target.value)}
                  placeholder="e.g. Biology Final" className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="text-xs text-[#8899b0] mb-1.5 block">Exam Date</label>
                <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                  className="input-field text-sm py-2" />
              </div>
              <div>
                <label className="text-xs text-[#8899b0] mb-1.5 block">Target Score</label>
                <input value={targetScore} onChange={e => setTargetScore(e.target.value)}
                  placeholder="e.g. 90%" className="input-field text-sm py-2" />
              </div>
            </div>
            <button className="btn-primary py-2 text-sm">Create Exam Goal</button>
          </div>

          {/* study plan timeline */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4">Study Plan Timeline</h3>
            <div className="flex flex-col gap-2">
              {TIMELINE.map(({ week, tasks }, i) => (
                <div key={week} className="border border-[#1e2a3e] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpen(open === i ? -1 : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#131c2e] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                      <span className="text-white text-sm font-medium">{week}</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8899b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`transition-transform ${open === i ? "rotate-180" : ""}`}>
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                  {open === i && (
                    <div className="px-4 pb-3 pt-1 flex flex-col gap-2 border-t border-[#1e2a3e]">
                      {tasks.map(t => (
                        <div key={t} className="flex items-center gap-2.5 text-[#c8d3e0] text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right sidebar */}
        <div className="w-56 shrink-0 flex flex-col gap-4">
          <div className="card p-4" style={{ background: "linear-gradient(135deg, #4c1d95, #2563eb)" }}>
            <h4 className="text-white font-semibold text-sm mb-3">Study Stats</h4>
            {[["Daily Goal", "2h 30m"], ["Topics", "17/20"], ["Days Active", "12/14"]].map(([l, v]) => (
              <div key={l} className="flex justify-between mb-2">
                <span className="text-white/70 text-xs">{l}</span>
                <span className="text-white text-xs font-semibold">{v}</span>
              </div>
            ))}
          </div>

          <div className="card p-4">
            <h4 className="text-white font-semibold text-sm mb-2">Recommendation</h4>
            <p className="text-[#8899b0] text-xs leading-relaxed">
              Physics exam in 9 days. Focus 40% of your daily time on Thermodynamics and Wave Motion.
            </p>
          </div>

          <div className="card p-4">
            <h4 className="text-white font-semibold text-sm mb-3">Quick Actions</h4>
            {["Practice Test", "Review Material", "Check Progress"].map(a => (
              <button key={a}
                className="w-full text-left text-xs text-[#8899b0] hover:text-white py-1.5 px-2 rounded hover:bg-[#1e2a3e] transition-colors">
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
