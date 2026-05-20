"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/auth";

const SUBJECTS = [
  "Data Structures & Algorithms",
  "Object-Oriented Programming",
  "Operating Systems",
  "Computer Networks",
  "Database Systems",
  "Artificial Intelligence",
  "Machine Learning",
  "Software Engineering",
  "Theory of Computation",
  "Computer Architecture",
  "Compiler Design",
  "Deep Learning",
];

const LEVELS = [
  { id: "Beginner",     desc: "Just starting out" },
  { id: "Intermediate", desc: "Some experience" },
  { id: "Advanced",     desc: "Highly proficient" },
  { id: "Expert",       desc: "Mastery level" },
];

const GOALS = [
  "Pass Exams", "Improve Grades", "Master Concepts", "Quick Review",
  "Competitive Exams", "Career Switch", "Personal Growth", "Teaching Others",
];

export default function OnboardingPage() {
  const [step, setStep]         = useState(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [level, setLevel]       = useState("Beginner");
  const [goals, setGoals]       = useState<string[]>([]);
  const [custom, setCustom]     = useState("");
  const router = useRouter();

  function toggleSubject(s: string) {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }
  function toggleGoal(g: string) {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }
  function addCustom() {
    if (custom.trim() && !subjects.includes(custom.trim())) {
      setSubjects(prev => [...prev, custom.trim()]);
      setCustom("");
    }
  }
  function finish() {
    updateUser({ subjects: subjects.length > 0 ? subjects : ["Computer Science"], level });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "#080d18" }}>
      {/* top header */}
      <div className="px-8 pt-8 shrink-0">
        <h2 className="text-xl font-bold mb-3">Let&apos;s personalize your experience</h2>
        <div className="w-full h-0.5 bg-[#1e2a3e] rounded-full mb-2">
          <div className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        <p className="text-[#8899b0] text-sm">Step {step} of 3</p>
      </div>

      {/* content */}
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        {step === 1 && (
          <div className="w-full max-w-3xl text-center fade-in">
            <h1 className="text-3xl font-bold mb-2">Which subjects are you studying?</h1>
            <p className="text-[#8899b0] text-sm mb-8">Select all that apply or add your own</p>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => toggleSubject(s)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    subjects.includes(s)
                      ? "bg-[#2563eb] border-[#2563eb] text-white"
                      : "bg-transparent border-[#2a3a54] text-[#c8d3e0] hover:border-[#2563eb]/60 hover:text-white"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 max-w-lg mx-auto">
              <input value={custom} onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom()}
                placeholder="+ Add Custom Subject"
                className="flex-1 bg-transparent border border-[#2a3a54] text-sm text-white placeholder-[#4a5568] px-4 py-3 rounded-xl outline-none focus:border-[#2563eb] transition-colors" />
              {custom.trim() && (
                <button onClick={addCustom}
                  className="px-4 py-3 bg-[#2563eb] rounded-xl text-sm font-medium hover:bg-[#1d4ed8] transition-colors">
                  Add
                </button>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-2xl text-center fade-in">
            <h1 className="text-3xl font-bold mb-2">What&apos;s your current level?</h1>
            <p className="text-[#8899b0] text-sm mb-8">Choose the level that best describes you</p>
            <div className="grid grid-cols-2 gap-4">
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  className={`p-8 rounded-2xl border text-left transition-all ${
                    level === l.id
                      ? "bg-[#2563eb] border-[#2563eb]"
                      : "bg-[#0c1524] border-[#2a3a54] hover:border-[#2563eb]/60"
                  }`}>
                  <div className="font-bold text-xl mb-1 text-white">{l.id}</div>
                  <div className={`text-sm ${level === l.id ? "text-[#bfdbfe]" : "text-[#8899b0]"}`}>{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-3xl text-center fade-in">
            <h1 className="text-3xl font-bold mb-2">What are your learning goals?</h1>
            <p className="text-[#8899b0] text-sm mb-8">Select all that apply</p>
            <div className="grid grid-cols-4 gap-3">
              {GOALS.map(g => (
                <button key={g} onClick={() => toggleGoal(g)}
                  className={`px-4 py-4 rounded-xl text-sm font-medium border transition-all ${
                    goals.includes(g)
                      ? "bg-[#2563eb] border-[#2563eb] text-white"
                      : "bg-transparent border-[#2a3a54] text-[#c8d3e0] hover:border-[#2563eb]/60 hover:text-white"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* bottom nav */}
      <div className="flex items-center justify-between px-8 pb-8 shrink-0">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 rounded-xl border border-[#2a3a54] text-sm text-[#8899b0] flex items-center gap-2 hover:text-white hover:border-[#4a5568] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            {step === 3 ? "Previous" : "Back"}
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && subjects.length === 0}
            className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-[#2563eb]/20">
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ) : (
          <button onClick={finish}
            className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-[#2563eb]/20">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
