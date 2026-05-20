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
  "Theory of Computation",
  "Compiler Design",
  "Software Engineering",
  "Computer Architecture",
  "Artificial Intelligence",
  "Discrete Mathematics",
  "Computer Graphics",
];

const LEVELS = [
  { id: "Beginner",     desc: "Just starting out" },
  { id: "Intermediate", desc: "Some experience" },
  { id: "Advanced",     desc: "Highly proficient" },
  { id: "Expert",       desc: "Mastery level" },
];

export default function OnboardingPage() {
  const [step, setStep]                   = useState(1);
  const [selected, setSelected]           = useState<string[]>([]);
  const [level, setLevel]                 = useState("Intermediate");
  const router = useRouter();

  function toggle(s: string) {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function next() {
    if (step === 1 && selected.length > 0) { setStep(2); return; }
    if (step === 2) {
      updateUser({ subjects: selected, level });
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-[#8899b0] mb-2">
            <span>Let's personalise your experience</span>
            <span>Step {step} of 2</span>
          </div>
          <div className="w-full h-1 bg-[#1e2a3e] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] rounded-full transition-all duration-500"
              style={{ width: `${step * 50}%` }} />
          </div>
        </div>

        {step === 1 && (
          <div className="fade-in">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Which subjects are you studying?</h1>
            <p className="text-[#8899b0] text-sm text-center mb-8">Select all that apply</p>
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => toggle(s)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    selected.includes(s)
                      ? "bg-[#2563eb] border-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20"
                      : "bg-[#131c2e] border-[#1e2a3e] text-[#8899b0] hover:border-[#2563eb]/40 hover:text-white"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            {selected.length > 0 && (
              <p className="text-center text-[#2563eb] text-xs mb-4">{selected.length} selected</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h1 className="text-3xl font-bold text-center text-white mb-2">What's your current level?</h1>
            <p className="text-[#8899b0] text-sm text-center mb-8">Choose the level that best describes you</p>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  className={`p-6 rounded-2xl border text-left transition-all ${
                    level === l.id
                      ? "bg-[#2563eb]/15 border-[#2563eb] shadow-lg shadow-[#2563eb]/10"
                      : "bg-[#131c2e] border-[#1e2a3e] hover:border-[#2563eb]/40"
                  }`}>
                  <div className={`font-semibold text-base mb-1 ${level === l.id ? "text-white" : "text-[#c8d3e0]"}`}>{l.id}</div>
                  <div className="text-xs text-[#8899b0]">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {step > 1
            ? <button onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 rounded-xl border border-[#1e2a3e] text-sm text-[#8899b0] hover:text-white transition-colors">
                ← Back
              </button>
            : <div />
          }
          <button onClick={next} disabled={step === 1 && selected.length === 0}
            className="px-7 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-40 text-sm font-semibold transition-all shadow-lg shadow-[#2563eb]/20">
            {step === 2 ? "Start Learning →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
