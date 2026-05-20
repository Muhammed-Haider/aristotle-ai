"use client";
import { useEffect, useState } from "react";
import { getUser, User } from "@/lib/auth";
import Link from "next/link";

const COLORS = ["#2563eb", "#8b5cf6", "#10b981", "#ef4444", "#f59e0b", "#06b6d4", "#ec4899", "#84cc16"];
const MASTERY = [65, 48, 72, 34, 81, 57, 43, 66, 29, 78, 55, 39];
const TOPICS  = [24, 32, 18, 28, 15, 21, 19, 26, 14, 30, 22, 17];
const TIMES   = ["2 hours ago", "Yesterday", "3 days ago", "1 week ago", "Just now", "5 hours ago", "2 days ago", "Yesterday", "4 days ago", "3 hours ago", "1 day ago", "6 days ago"];
const INSIGHTS = [
  "Good momentum! Focus on weaker topics to boost mastery above 70%.",
  "You're building a foundation. Consider dedicating more time this week.",
  "Excellent progress! Keep up the consistent study habits.",
  "You're building a foundation. Consider dedicating more time to this subject.",
  "Outstanding! You're close to mastery. Review edge cases.",
  "Steady improvement. Focus on practice problems to solidify concepts.",
];

export default function SubjectsPage() {
  const [user, setUser]   = useState<User | null>(null);
  const [search, setSearch] = useState("");
  useEffect(() => { setUser(getUser()); }, []);
  if (!user) return null;

  const filtered = user.subjects.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-5xl">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Subjects</h1>
          <p className="text-[#8899b0] text-sm mt-1">Manage your study topics and materials</p>
        </div>
        <Link href="/onboarding"
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#2563eb]/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Subject
        </Link>
      </div>

      {/* search */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#1a2540] mb-6" style={{ background: "#0c1a2e" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search subjects or topics..."
          className="flex-1 bg-transparent text-sm text-white placeholder-[#4a5568] outline-none" />
      </div>

      {/* subjects grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {filtered.map((subject, i) => {
          const color   = COLORS[i % COLORS.length];
          const mastery = MASTERY[i % MASTERY.length];
          const topics  = TOPICS[i % TOPICS.length];
          const time    = TIMES[i % TIMES.length];
          const insight = INSIGHTS[i % INSIGHTS.length];
          const trend   = mastery >= 60 ? "Improving" : "Steady";

          return (
            <div key={subject} className="p-5 rounded-2xl border border-[#1a2540] flex flex-col gap-3" style={{ background: "#0c1a2e" }}>
              {/* top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{subject}</div>
                    <div className="text-[#8899b0] text-xs">{topics} topics</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border"
                  style={{ color, borderColor: color + "40", background: color + "15" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z"/><path d="M12 8v4l3 3"/></svg>
                  {mastery}% Mastery
                </span>
              </div>

              {/* progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#8899b0]">Overall Progress</span>
                  <span className="text-white font-semibold">{mastery}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${mastery}%`, background: color }} />
                </div>
                <div className="text-[#4a5568] text-[10px] mt-1.5">Last studied: {time}</div>
              </div>

              {/* insights */}
              <div className="p-3 rounded-xl border border-[#1a2540]" style={{ background: "#091525" }}>
                <div className="flex items-center gap-1.5 text-[#3b82f6] text-xs font-semibold mb-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  Insights
                </div>
                <p className="text-[#8899b0] text-xs leading-relaxed">{insight}</p>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-[#8899b0]">
                    <span className="text-[#10b981]">↗</span> Study Trend
                    <span className="text-white font-medium ml-1">{trend}</span>
                  </div>
                </div>
              </div>

              {/* action buttons */}
              <div className="flex gap-2">
                <Link href="/learn"
                  className="flex-1 py-2 rounded-xl border border-[#2a3a54] text-xs font-medium text-[#e2e8f0] hover:border-[#2563eb]/60 hover:text-[#3b82f6] transition-all text-center">
                  Learn
                </Link>
                <Link href="/practice"
                  className="flex-1 py-2 rounded-xl border border-[#2a3a54] text-xs font-medium text-[#e2e8f0] hover:border-[#2563eb]/60 hover:text-[#3b82f6] transition-all text-center">
                  Quiz
                </Link>
                <button className="flex-1 py-2 rounded-xl border border-[#2a3a54] text-xs font-medium text-[#e2e8f0] hover:border-[#2563eb]/60 hover:text-[#3b82f6] transition-all text-center">
                  Stats
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* drop zone */}
      <div className="p-10 rounded-2xl border border-dashed border-[#2a3a54] flex flex-col items-center justify-center gap-3"
        style={{ background: "#0c1a2e" }}>
        <div className="w-12 h-12 rounded-xl border border-[#2a3a54] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white text-sm font-medium">Drop files to import notes</p>
          <p className="text-[#8899b0] text-xs mt-1">Support for PDF, DOCX, TXT, and Markdown files</p>
        </div>
        <button className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl text-sm font-semibold transition-colors">
          Browse Files
        </button>
      </div>
    </div>
  );
}
