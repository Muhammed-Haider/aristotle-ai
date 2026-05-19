import { useEffect, useState } from "react";
import { apiGet } from "../api";

interface Passport { topics: Record<string, number>; total_questions: number; streak: number; }

export default function ProgressScreen() {
  const [data, setData] = useState<Passport | null>(null);

  useEffect(() => {
    apiGet<Passport>("/passport").then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading…</div>
  );

  const topics = Object.entries(data.topics || {});

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <h2 className="text-white font-semibold text-lg mb-1">Mastery Passport</h2>
      <p className="text-slate-400 text-sm mb-8">Your learning progress across CS topics</p>

      {/* stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Questions Answered", val: data.total_questions ?? 0, color: "from-blue-500 to-blue-600" },
          { label: "Topics Explored",    val: topics.length,              color: "from-violet-500 to-violet-600" },
          { label: "Day Streak",         val: data.streak ?? 0,           color: "from-emerald-500 to-emerald-600" },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass rounded-2xl p-5 flex flex-col gap-1">
            <span className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{val}</span>
            <span className="text-slate-400 text-xs">{label}</span>
          </div>
        ))}
      </div>

      {/* topics */}
      <h3 className="text-slate-300 text-sm font-semibold mb-4 uppercase tracking-wider">Topics</h3>
      {topics.length === 0 ? (
        <p className="text-slate-500 text-sm">No topics yet — start chatting to build your passport!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {topics.map(([topic, score]) => (
            <div key={topic} className="glass rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-slate-200 text-sm font-medium capitalize">{topic}</span>
                <span className="text-slate-400 text-xs">{score}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
