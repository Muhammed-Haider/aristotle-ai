import { useState, useEffect } from "react";

const QUESTIONS = [
  {
    q: "What is the De Broglie wavelength formula?",
    opts: ["λ = h/p", "λ = h×p", "λ = p/h", "λ = h/mv²"],
    answer: 0,
  },
  {
    q: "Which principle states that you cannot simultaneously know both the exact position and momentum of a particle?",
    opts: ["Pauli Exclusion Principle", "Heisenberg Uncertainty Principle", "Schrödinger Equation", "Bohr Model"],
    answer: 1,
  },
  {
    q: "What does wave-particle duality state?",
    opts: [
      "Matter can only behave as a wave",
      "Light can only behave as a particle",
      "Quantum objects exhibit both wave and particle properties",
      "Waves and particles are distinct phenomena",
    ],
    answer: 2,
  },
];

export default function PracticeScreen() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setTimeLeft(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const pct = Math.round(((current + 1) / QUESTIONS.length) * 100);

  function selectOption(i: number) {
    if (submitted) return;
    setSelected(i);
    const next = [...answers]; next[current] = i; setAnswers(next);
  }

  function goNext() {
    if (current < QUESTIONS.length - 1) { setCurrent(current + 1); setSelected(answers[current + 1]); }
  }
  function goPrev() {
    if (current > 0) { setCurrent(current - 1); setSelected(answers[current - 1]); }
  }

  const score = submitted ? answers.filter((a, i) => a === QUESTIONS[i].answer).length : 0;

  return (
    <div className="p-8 min-h-full">
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Practice Quiz</h1>
          <p className="text-[#8899b0] text-sm mt-0.5">Physics - Quantum Mechanics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#131c2e] border border-[#1e2a3e] px-4 py-2 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8899b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-white font-mono font-semibold">{mins}:{secs}</span>
          </div>
          <button onClick={() => setSubmitted(true)}
            className="flex items-center gap-2 bg-[#131c2e] border border-[#1e2a3e] px-4 py-2 rounded-lg text-white text-sm hover:border-[#2563eb] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
            </svg>
            Submit
          </button>
        </div>
      </div>

      {submitted ? (
        <div className="card p-8 text-center max-w-lg mx-auto mt-8">
          <div className="text-5xl mb-4">{score === QUESTIONS.length ? "🎉" : score >= 2 ? "👍" : "📚"}</div>
          <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
          <p className="text-[#8899b0] mb-6">You scored {score} out of {QUESTIONS.length}</p>
          <div className="text-4xl font-bold text-[#2563eb] mb-6">{Math.round((score / QUESTIONS.length) * 100)}%</div>
          <button onClick={() => { setSubmitted(false); setCurrent(0); setSelected(null); setAnswers(Array(QUESTIONS.length).fill(null)); setTimeLeft(600); }}
            className="btn-primary max-w-xs mx-auto">Try Again</button>
        </div>
      ) : (
        <>
          {/* progress */}
          <div className="card p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#8899b0] text-sm">Question {current + 1} of {QUESTIONS.length}</span>
              <span className="text-[#8899b0] text-sm text-right">
                <span className="text-white font-semibold">{pct}%</span> Complete
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#1e2a3e] rounded-full">
              <div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* question */}
          <div className="card p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#2563eb] text-white text-xs font-medium">Multiple Choice</span>
              <span className="px-3 py-1 rounded-full border border-[#1e2a3e] text-[#8899b0] text-xs">5 points</span>
            </div>
            <h2 className="text-white text-lg font-semibold mb-6">{QUESTIONS[current].q}</h2>
            <div className="flex flex-col gap-3">
              {QUESTIONS[current].opts.map((opt, i) => (
                <button key={i} onClick={() => selectOption(i)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    selected === i
                      ? "border-[#2563eb] bg-[#2563eb]/10 text-white"
                      : "border-[#1e2a3e] text-[#c8d3e0] hover:border-[#2a3f5f] hover:bg-[#131c2e]"
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${selected === i ? "border-[#2563eb]" : "border-[#2a3f5f]"}`}>
                    {selected === i && <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* navigation */}
          <div className="flex items-center justify-between">
            <button onClick={goPrev} disabled={current === 0}
              className="px-5 py-2.5 rounded-lg border border-[#1e2a3e] text-[#8899b0] text-sm hover:text-white hover:border-[#2a3f5f] transition-colors disabled:opacity-30">
              Previous
            </button>
            <div className="flex gap-2">
              {QUESTIONS.map((_, i) => (
                <button key={i} onClick={() => { setCurrent(i); setSelected(answers[i]); }}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    i === current ? "bg-[#2563eb] text-white" : answers[i] !== null ? "bg-[#1e2a3e] text-white" : "bg-[#131c2e] text-[#8899b0] border border-[#1e2a3e]"
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={goNext} disabled={current === QUESTIONS.length - 1}
              className="px-5 py-2.5 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-30">
              Next Question
            </button>
          </div>

          {/* help */}
          <div className="card p-4 mt-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] shrink-0 flex items-center justify-center text-white text-sm">💡</div>
            <div>
              <div className="text-white text-sm font-medium">Need help?</div>
              <div className="text-[#8899b0] text-xs mt-0.5">If you're stuck, you can skip this question and come back to it later. All questions will be explained in the feedback section.</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
