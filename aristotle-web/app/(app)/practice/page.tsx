"use client";
import { useState } from "react";

interface Quiz {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

const TOPICS = [
  "Data Structures",
  "Algorithms & Complexity",
  "Object-Oriented Programming",
  "Operating Systems",
  "Computer Networks",
  "Database Systems",
  "Theory of Computation",
  "Software Engineering",
];

export default function PracticePage() {
  const [topic, setTopic]           = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState("Standard");
  const [quiz, setQuiz]             = useState<Quiz | null>(null);
  const [selected, setSelected]     = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [score, setScore]           = useState({ correct: 0, total: 0 });

  async function generate() {
    setLoading(true);
    setError("");
    setSelected(null);
    setQuiz(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      if (!res.ok) throw new Error("Failed");
      setQuiz(await res.json());
    } catch {
      setError("Failed to generate question. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function pick(opt: string) {
    if (selected || !quiz) return;
    const letter = opt[0];
    setSelected(letter);
    setScore(prev => ({ correct: prev.correct + (letter === quiz.correct ? 1 : 0), total: prev.total + 1 }));
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Practice Quiz</h1>
        <p className="text-[#8899b0] text-sm">AI-generated questions · instant feedback · Gemini-powered</p>
      </div>

      {/* score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-[#131c2e] border border-[#1e2a3e]">
          <div className="text-center shrink-0">
            <div className="text-2xl font-bold text-white">{score.correct}/{score.total}</div>
            <div className="text-xs text-[#8899b0]">Score</div>
          </div>
          <div className="flex-1 h-2 bg-[#1e2a3e] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full transition-all duration-500"
              style={{ width: `${accuracy}%` }} />
          </div>
          <div className={`text-sm font-bold shrink-0 ${accuracy >= 70 ? "text-[#10b981]" : "text-[#f59e0b]"}`}>
            {accuracy}%
          </div>
        </div>
      )}

      {/* controls */}
      <div className="flex gap-3 mb-6">
        <select value={topic} onChange={e => setTopic(e.target.value)}
          className="flex-1 bg-[#131c2e] border border-[#1e2a3e] text-[#e2e8f0] text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#2563eb] cursor-pointer">
          {TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
          className="bg-[#131c2e] border border-[#1e2a3e] text-[#e2e8f0] text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#2563eb] cursor-pointer">
          {["Beginner", "Standard", "Advanced"].map(d => <option key={d}>{d}</option>)}
        </select>
        <button onClick={generate} disabled={loading}
          className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#2563eb]/20 whitespace-nowrap">
          {loading ? "Generating…" : quiz ? "Next →" : "Generate"}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</p>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8899b0] text-sm">Aristotle is crafting your question…</p>
        </div>
      )}

      {quiz && !loading && (
        <div className="fade-in space-y-4">
          {/* question card */}
          <div className="p-6 rounded-2xl bg-[#131c2e] border border-[#1e2a3e]">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-lg bg-[#2563eb]/15 border border-[#2563eb]/30 text-[#3b82f6] text-xs font-semibold">{difficulty}</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#1e2a3e] text-[#8899b0] text-xs">{topic}</span>
            </div>
            <p className="text-white font-medium leading-relaxed">{quiz.question}</p>
          </div>

          {/* options */}
          <div className="space-y-2.5">
            {quiz.options.map(opt => {
              const letter = opt[0];
              const isCorrect  = letter === quiz.correct;
              const isSelected = letter === selected;

              let cls = "bg-[#131c2e] border-[#1e2a3e] text-[#e2e8f0] hover:border-[#2563eb]/50 cursor-pointer";
              if (selected) {
                if (isCorrect)       cls = "bg-[#10b981]/10 border-[#10b981]/60 text-[#10b981] cursor-default";
                else if (isSelected) cls = "bg-red-500/10 border-red-500/50 text-red-400 cursor-default";
                else                 cls = "bg-[#131c2e] border-[#1e2a3e] text-[#4a5568] cursor-default";
              }

              return (
                <button key={opt} onClick={() => pick(opt)} disabled={!!selected}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* explanation */}
          {selected && (
            <div className={`p-5 rounded-2xl border fade-in ${
              selected === quiz.correct
                ? "bg-[#10b981]/10 border-[#10b981]/30"
                : "bg-red-500/10 border-red-500/30"
            }`}>
              <div className={`font-semibold text-sm mb-2 ${selected === quiz.correct ? "text-[#10b981]" : "text-red-400"}`}>
                {selected === quiz.correct ? "✓ Correct!" : "✗ Not quite — here's why:"}
              </div>
              <div className="text-xs text-[#c8d3e0] leading-relaxed">{quiz.explanation}</div>
            </div>
          )}

          {selected && (
            <button onClick={generate}
              className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-[#2563eb]/20">
              Next Question →
            </button>
          )}
        </div>
      )}

      {!quiz && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-[#8899b0] text-sm">Click Generate to get your first question</p>
          <p className="text-[#4a5568] text-xs mt-1">AI-generated · topic-specific · instant feedback</p>
        </div>
      )}
    </div>
  );
}
