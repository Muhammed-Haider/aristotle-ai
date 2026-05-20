"use client";
import { useState, useEffect, useRef } from "react";
import { recordPractice, recordMistake } from "@/lib/tracking";
import { pushPracticeResult, pushMistake } from "@/lib/db";

interface Quiz {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

type Phase = "setup" | "quiz" | "results";

const TOPICS = [
  "Data Structures",
  "Algorithms & Complexity",
  "Object-Oriented Programming",
  "Operating Systems",
  "Computer Networks",
  "Database Systems",
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning & Neural Networks",
  "Natural Language Processing",
  "Computer Vision",
  "Software Engineering",
  "Theory of Computation",
  "Compiler Design",
];

const Q_OPTIONS = [3, 5, 7, 10];

export default function PracticePage() {
  const [phase, setPhase]           = useState<Phase>("setup");
  const [topic, setTopic]           = useState(TOPICS[0]);
  const [difficulty, setDifficulty] = useState("Standard");
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions]   = useState<Quiz[]>([]);
  const [answers, setAnswers]       = useState<(string | null)[]>([]);
  const [current, setCurrent]       = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [timeLeft, setTimeLeft]     = useState(600);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedRef = useRef(false);

  // Record results once when quiz finishes
  useEffect(() => {
    if (phase !== "results" || questions.length === 0 || recordedRef.current) return;
    recordedRef.current = true;
    const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
    const scoreVal = Math.round((correctCount / questions.length) * 100);
    recordPractice(topic, scoreVal, questions.length, correctCount);
    // Push to Supabase DB in the background (fire-and-forget)
    pushPracticeResult(topic, scoreVal, questions.length, correctCount).catch(() => {});
    questions.forEach((q, i) => {
      if (answers[i] !== null && answers[i] !== q.correct) {
        const correctOpt = q.options.find(o => o[0] === q.correct) ?? q.correct;
        const userOpt    = q.options.find(o => o[0] === answers[i]) ?? answers[i] ?? "skipped";
        recordMistake(topic, q.question.slice(0, 100), userOpt, correctOpt);
        pushMistake(topic, q.question.slice(0, 100), userOpt, correctOpt).catch(() => {});
      }
    });
  }, [phase, questions, answers, topic]);

  useEffect(() => {
    if (phase === "quiz") {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); setPhase("results"); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  async function startQuiz() {
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers(Array(questionCount).fill(null));
    setCurrent(0);
    setTimeLeft(questionCount * 120);
    recordedRef.current = false;

    try {
      const results = await Promise.all(
        Array.from({ length: questionCount }, () =>
          fetch("/api/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, difficulty }),
          }).then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
        )
      );
      setQuestions(results);
      setLoading(false);
      setPhase("quiz");
    } catch {
      setError("Failed to generate questions. Please try again.");
      setLoading(false);
    }
  }

  function pick(letter: string) {
    if (answers[current] !== null) return;
    const next = [...answers];
    next[current] = letter;
    setAnswers(next);
  }

  function submit() {
    clearInterval(timerRef.current!);
    setPhase("results");
  }

  function restart() {
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const correct   = questions.filter((q, i) => answers[i] === q.correct).length;
  const incorrect = questions.filter((q, i) => answers[i] !== null && answers[i] !== q.correct).length;
  const score     = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const answered  = answers.filter(a => a !== null).length;

  /* ──────────────── SETUP ──────────────── */
  if (phase === "setup") {
    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Practice Quiz</h1>
          <p className="text-[#8899b0] text-sm mt-1">Adaptive practice questions with instant feedback</p>
        </div>

        <div className="p-6 rounded-2xl border border-[#1a2540] mb-6" style={{ background: "#0c1a2e" }}>
          {/* topic */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#8899b0] uppercase tracking-wider mb-2">Topic</label>
            <select value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full border border-[#1a2540] text-[#e2e8f0] text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#2563eb] cursor-pointer transition-colors" style={{ background: "#091525" }}>
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* difficulty */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#8899b0] uppercase tracking-wider mb-2">Difficulty</label>
            <div className="flex gap-2">
              {["Beginner", "Standard", "Advanced"].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    difficulty === d ? "bg-[#2563eb] border-[#2563eb] text-white" : "border-[#2a3a54] text-[#8899b0] hover:text-white hover:border-[#4a5568]"
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* number of questions */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#8899b0] uppercase tracking-wider mb-2">
              Number of Questions
            </label>
            <div className="flex gap-2">
              {Q_OPTIONS.map(n => (
                <button key={n} onClick={() => setQuestionCount(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    questionCount === n ? "bg-[#2563eb] border-[#2563eb] text-white" : "border-[#2a3a54] text-[#8899b0] hover:text-white hover:border-[#4a5568]"
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* info */}
          <div className="p-4 rounded-xl border border-[#1a2540] text-xs text-[#8899b0]" style={{ background: "#091525" }}>
            <div className="flex items-center gap-2 mb-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              <span className="text-white font-medium">Quiz info</span>
            </div>
            {questionCount} questions · {Math.round(questionCount * 2)} minute timer · Multiple choice · Instant feedback after each answer
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 px-4 py-3 rounded-xl border border-red-500/20" style={{ background: "rgba(239,68,68,0.1)" }}>
            {error}
          </p>
        )}

        <button onClick={startQuiz} disabled={loading}
          className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#2563eb]/20">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Preparing your quiz…
            </span>
          ) : `Start Quiz — ${questionCount} Questions →`}
        </button>
      </div>
    );
  }

  /* ──────────────── QUIZ ──────────────── */
  if (phase === "quiz") {
    const q = questions[current];
    const ans = answers[current];
    const progressPct = Math.round((answered / questions.length) * 100);

    return (
      <div className="flex flex-col h-full">
        {/* header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-[#1a2540] shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white">Practice Quiz</h1>
            <p className="text-[#8899b0] text-sm">{topic}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8899b0" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="text-white font-mono text-sm font-bold">{mins}:{secs}</span>
            </div>
            <button onClick={submit}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-[#2a3a54] text-sm font-semibold text-[#e2e8f0] hover:border-[#2563eb]/60 transition-all">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              Submit
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* progress bar */}
          <div className="p-4 rounded-2xl border border-[#1a2540] mb-5" style={{ background: "#0c1a2e" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#8899b0] text-sm">Question {current + 1} of {questions.length}</span>
              <span className="text-[#8899b0] text-sm">{progressPct}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
              <div className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* question */}
          <div className="p-6 rounded-2xl border border-[#1a2540] mb-5" style={{ background: "#0c1a2e" }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-lg bg-[#2563eb] text-white text-xs font-semibold">Multiple Choice</span>
              <span className="px-3 py-1 rounded-lg border border-[#2a3a54] text-[#8899b0] text-xs">5 points</span>
            </div>
            <p className="text-white text-base font-medium leading-relaxed">{q.question}</p>
          </div>

          {/* options */}
          <div className="space-y-3 mb-6">
            {q.options.map(opt => {
              const letter = opt[0];
              const isCorrect  = ans !== null && letter === q.correct;
              const isSelected = letter === ans;
              const isWrong    = ans !== null && isSelected && !isCorrect;

              let cls = "border-[#2a3a54] text-[#e2e8f0] hover:border-[#4a5568] cursor-pointer";
              if (isCorrect)      cls = "border-[#10b981] text-[#10b981] bg-[#10b981]/10 cursor-default";
              else if (isWrong)   cls = "border-red-500 text-red-400 bg-red-500/10 cursor-default";
              else if (ans !== null) cls = "border-[#1a2540] text-[#4a5568] cursor-default";

              return (
                <button key={opt} onClick={() => pick(letter)} disabled={ans !== null}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left text-sm transition-all ${cls}`}
                  style={{ background: isCorrect || isWrong ? undefined : "#0c1a2e" }}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isCorrect ? "border-[#10b981] bg-[#10b981]" : isWrong ? "border-red-500" : "border-[#4a5568]"
                  }`}>
                    {isCorrect && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {isWrong   && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* explanation */}
          {ans !== null && (
            <div className={`p-5 rounded-2xl border mb-5 fade-in ${
              ans === q.correct ? "border-[#10b981]/30 bg-[#10b981]/5" : "border-red-500/30 bg-red-500/5"
            }`}>
              <div className={`font-semibold text-sm mb-1.5 ${ans === q.correct ? "text-[#10b981]" : "text-red-400"}`}>
                {ans === q.correct ? "✓ Correct!" : "✗ Incorrect"}
              </div>
              <p className="text-[#c8d3e0] text-xs leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
              className="px-5 py-2.5 rounded-xl border border-[#2a3a54] text-sm text-[#8899b0] hover:text-white disabled:opacity-30 transition-all">
              Previous
            </button>

            {/* page numbers */}
            <div className="flex gap-1.5">
              {Array.from({ length: questions.length }).map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    i === current
                      ? "bg-[#2563eb] text-white"
                      : answers[i] !== null
                      ? "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30"
                      : "border border-[#2a3a54] text-[#8899b0] hover:text-white"
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>

            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)}
                className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-sm font-semibold transition-all shadow-lg shadow-[#2563eb]/20">
                Next Question
              </button>
            ) : (
              <button onClick={submit}
                className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-sm font-semibold transition-all shadow-lg shadow-[#2563eb]/20">
                Submit Quiz
              </button>
            )}
          </div>

          {/* need help */}
          <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <div className="w-7 h-7 rounded-lg bg-[#2563eb]/20 flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div className="text-white text-xs font-semibold mb-0.5">Need help?</div>
              <div className="text-[#8899b0] text-xs">If you&apos;re stuck, skip the question and come back. All answers are explained in the feedback section.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────── RESULTS ──────────────── */
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* gradient header */}
      <div className="flex items-center justify-between px-8 py-7 shrink-0"
        style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Quiz Complete! 🎉</h1>
          <p className="text-white/70 text-sm mt-1">{topic} · {difficulty} · {questions.length} questions</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white">{score}%</div>
          <div className="text-white/70 text-sm">Your Score</div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-4xl">
        {/* stats */}
        <div className="flex gap-3 mb-7">
          {[
            { label: "Total Questions", value: String(questions.length), icon: "📝", color: "#3b82f6" },
            { label: "Correct",         value: String(correct),           icon: "✓",  color: "#10b981" },
            { label: "Incorrect",       value: String(incorrect),         icon: "✗",  color: "#ef4444" },
            { label: "Accuracy",        value: `${score}%`,               icon: "🎯", color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} className="flex-1 p-4 rounded-2xl border border-[#1a2540] text-center" style={{ background: "#0c1a2e" }}>
              <div className="text-xl font-bold mb-0.5" style={{ color: s.color }}>{s.icon} {s.value}</div>
              <div className="text-[#8899b0] text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* question review */}
        <h2 className="text-base font-semibold text-white mb-4">Question Review</h2>
        <div className="space-y-4 mb-7">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const isRight = userAns === q.correct;
            return (
              <div key={i} className="p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isRight ? "bg-[#10b981]/20 text-[#10b981]" : "bg-red-500/20 text-red-400"}`}>
                    {i + 1}
                  </span>
                  <span className={`text-xs font-semibold ${isRight ? "text-[#10b981]" : "text-red-400"}`}>
                    {isRight ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                </div>
                <p className="text-white text-sm font-medium mb-3">{q.question}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                    <div className="text-xs text-[#8899b0] mb-1">Your Answer</div>
                    <div className="text-red-400 text-xs font-medium">
                      {userAns ? q.options.find(o => o[0] === userAns) || userAns : "Not answered"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5">
                    <div className="text-xs text-[#8899b0] mb-1">Correct Answer</div>
                    <div className="text-[#10b981] text-xs font-medium">{q.options.find(o => o[0] === q.correct)}</div>
                  </div>
                </div>
                <div className="text-[#8899b0] text-xs leading-relaxed border-t border-[#1a2540] pt-3">
                  <span className="text-white font-medium">Explanation: </span>{q.explanation}
                </div>
              </div>
            );
          })}
        </div>

        {/* suggestions */}
        <div className="grid grid-cols-2 gap-4 mb-7">
          <div className="p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <h3 className="text-sm font-semibold text-white mb-3">Areas to Improve</h3>
            <div className="space-y-2">
              {questions.filter((_, i) => answers[i] !== questions[i]?.correct).slice(0, 3).map((q, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-[#8899b0] truncate">{q.question.slice(0, 40)}…</span>
                  <span className="text-red-400 ml-2 shrink-0">Review</span>
                </div>
              ))}
              {correct === questions.length && <p className="text-[#10b981] text-xs">🎉 All correct!</p>}
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
            <h3 className="text-sm font-semibold text-white mb-3">Suggestions</h3>
            <div className="space-y-1.5 text-xs text-[#8899b0]">
              <p>• Practice more problems on {topic}</p>
              <p>• Review explanations for incorrect answers</p>
              <p>• {score >= 80 ? "Try a higher difficulty next time" : "Revisit core concepts before retrying"}</p>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-3">
          <button onClick={restart}
            className="flex-1 py-3 rounded-xl border border-[#2a3a54] text-sm font-semibold text-[#e2e8f0] hover:border-[#2563eb]/60 hover:text-white transition-all">
            Try Another Quiz
          </button>
          <button onClick={restart}
            className="flex-1 py-3 rounded-xl border border-[#2a3a54] text-sm font-semibold text-[#e2e8f0] hover:border-[#2563eb]/60 hover:text-white transition-all">
            Review Material
          </button>
          <a href="/dashboard"
            className="flex-1 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-sm font-semibold text-white transition-all text-center">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
