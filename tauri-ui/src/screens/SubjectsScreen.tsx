import { useState } from "react";

interface Subject {
  name: string;
  topics: number;
  mastery: number;
  lastStudied: string;
  color: string;
  iconBg: string;
}

const SUBJECTS: Subject[] = [
  { name: "Physics", topics: 24, mastery: 65, lastStudied: "2 hours ago", color: "#2563eb", iconBg: "#1e3a6e" },
  { name: "Mathematics", topics: 32, mastery: 48, lastStudied: "Yesterday", color: "#7c3aed", iconBg: "#2e1065" },
  { name: "Chemistry", topics: 18, mastery: 72, lastStudied: "3 days ago", color: "#16a34a", iconBg: "#14532d" },
  { name: "Biology", topics: 28, mastery: 34, lastStudied: "1 week ago", color: "#ea580c", iconBg: "#431407" },
];

function MasteryBadge({ pct, color }: { pct: number; color: string }) {
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: color + "50", background: color + "15" }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
      </svg>
      {pct}% Mastery
    </span>
  );
}

export default function SubjectsScreen() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const filtered = SUBJECTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 min-h-full">
      {/* header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">My Subjects</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors">
          <span className="text-lg leading-none">+</span> Add Subject
        </button>
      </div>
      <p className="text-[#8899b0] text-sm mb-6">Manage your study topics and materials</p>

      {/* search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search subjects or topics…"
          className="input-field pl-9" />
      </div>

      {/* subject grid */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {filtered.map((s) => (
          <div key={s.name} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: s.iconBg }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10M7 12h10M7 17h6"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-semibold">{s.name}</div>
                  <div className="text-[#4a5568] text-xs">{s.topics} topics</div>
                </div>
              </div>
              <MasteryBadge pct={s.mastery} color={s.color} />
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#8899b0]">Overall Progress</span>
                <span className="text-white font-medium">{s.mastery}%</span>
              </div>
              <div className="h-1.5 bg-[#1e2a3e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.mastery}%`, background: s.color }} />
              </div>
              <div className="text-[#4a5568] text-xs mt-1.5">Last studied: {s.lastStudied}</div>
            </div>

            {/* expand topics */}
            <button
              onClick={() => setExpanded(expanded === s.name ? null : s.name)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[#1e2a3e] text-[#8899b0] text-xs hover:border-[#2a3f5f] transition-colors mb-3">
              View Topics (3)
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${expanded === s.name ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {expanded === s.name && (
              <div className="mb-3 px-3 py-2 bg-[#0d1117] rounded-lg border border-[#1e2a3e]">
                {["Topic 1", "Topic 2", "Topic 3"].map(t => (
                  <div key={t} className="flex items-center gap-2 py-1.5 text-[#c8d3e0] text-xs border-b border-[#1e2a3e] last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    {s.name} - {t}
                  </div>
                ))}
              </div>
            )}

            {/* insights */}
            <div className="bg-[#0d1117] rounded-lg p-3 mb-3">
              <div className="flex items-center gap-1.5 text-[#2563eb] text-xs font-medium mb-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
                </svg>
                Insights
              </div>
              <p className="text-[#8899b0] text-xs leading-relaxed">
                {s.mastery >= 70
                  ? `Excellent progress! You're performing well in ${s.name}. Keep up the consistent study habits.`
                  : s.mastery >= 50
                  ? `Good momentum! Focus on weaker topics to boost your mastery above 70%.`
                  : `You're building a foundation. Consider dedicating more time to ${s.name} this week.`}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-[#4a5568] text-[10px]">
                  Study Trend<br />
                  <span className="text-[#c8d3e0] font-medium">{s.mastery > 55 ? "Improving" : "Steady"}</span>
                </div>
                <div className="text-[#4a5568] text-[10px]">
                  Focus Areas<br />
                  <span className="text-[#c8d3e0] font-medium">{Math.max(0, Math.floor((80 - s.mastery) / 15))}</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-[#4a5568] mb-1">
                  <span>Week Goal</span><span>{Math.min(100, s.mastery + 15)}%</span>
                </div>
                <div className="h-1 bg-[#1e2a3e] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.mastery}%`, background: s.color }} />
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="grid grid-cols-3 gap-2">
              {["Learn", "Quiz", "Stats"].map(a => (
                <button key={a}
                  className="py-1.5 rounded-lg border border-[#1e2a3e] text-[#c8d3e0] text-xs hover:border-[#2563eb] hover:text-white transition-all">
                  {a}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* drop zone */}
      <div className="card p-10 flex flex-col items-center justify-center border-dashed">
        <div className="w-12 h-12 rounded-xl border border-[#1e2a3e] flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
        </div>
        <p className="text-[#c8d3e0] font-medium mb-1">Drop files to import notes</p>
        <p className="text-[#4a5568] text-sm mb-4">Support for PDF, DOCX, TXT, and Markdown files</p>
        <button className="btn-primary max-w-xs py-2 text-sm">Browse Files</button>
      </div>

      {/* add subject modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-4">Add New Subject</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Subject name" className="input-field mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => setShowAdd(false)} className="btn-primary flex-1">Add Subject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
