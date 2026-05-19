import { useState } from "react";
import { streamBenchmark, apiPost, BenchmarkResult } from "../api";

interface Props {
  onDone: () => void;
}

const TIERS = [
  {
    id: "Q4_K_M",
    label: "Q4_K_M",
    name: "Fast",
    desc: "Recommended for most users. Compact model, quick responses, good quality.",
    ram: "8 GB RAM",
    ramMin: 0,
    color: "#16a34a",
    glow: "rgba(22,163,74,0.25)",
    border: "rgba(22,163,74,0.35)",
  },
  {
    id: "Q5_K_M",
    label: "Q5_K_M",
    name: "Balanced",
    desc: "Higher accuracy with moderate speed. Great for 12–16 GB systems.",
    ram: "12 GB RAM",
    ramMin: 12,
    color: "#2563eb",
    glow: "rgba(37,99,235,0.25)",
    border: "rgba(37,99,235,0.35)",
  },
  {
    id: "Q8_0",
    label: "Q8_0",
    name: "Best Quality",
    desc: "Maximum accuracy and richest responses. Requires a high-spec machine.",
    ram: "16 GB RAM",
    ramMin: 16,
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.25)",
    border: "rgba(124,58,237,0.35)",
  },
];

type Step = "intro" | "running" | "done";

export default function BenchmarkScreen({ onDone }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [pct, setPct] = useState(0);
  const [msg, setMsg] = useState("Initialising...");
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [selectedTier, setSelectedTier] = useState("Q4_K_M");

  function startBenchmark() {
    setStep("running");
    setPct(0);
    setMsg("Starting...");
    streamBenchmark(
      (p, m) => { setPct(p); setMsg(m); },
      (r) => { setResult(r); setSelectedTier(r.quantization_tier); setStep("done"); },
      () => { setMsg("Error running benchmark — using defaults."); setStep("done"); }
    );
  }

  async function confirm() {
    await apiPost("/benchmark/set-tier", { tier: selectedTier }).catch(() => {});
    onDone();
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #060c1a 0%, #0a1535 50%, #0d1f52 100%)" }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #2563eb 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6">

        {/* ── Intro step ── */}
        {step === "intro" && (
          <div className="fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center"
                style={{ boxShadow: "0 0 24px rgba(37,99,235,0.5)" }}>
                <CpuIcon />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Hardware Check</h1>
                <p className="text-[#8899b0] text-sm">One-time setup — takes under 5 seconds</p>
              </div>
            </div>

            <div className="card p-6 mb-6">
              <p className="text-[#c8d3e0] text-sm leading-relaxed mb-4">
                Aristotle will scan your system RAM and automatically pick the best AI model
                size for your hardware — giving you the fastest, most accurate responses possible.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "💾", label: "Detect RAM", desc: "Read system memory" },
                  { icon: "⚡", label: "Pick Model", desc: "Match to hardware" },
                  { icon: "✅", label: "Save Config", desc: "Store preferences" },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="text-white text-xs font-semibold">{label}</div>
                    <div className="text-[#8899b0] text-[10px] mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={startBenchmark}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", boxShadow: "0 8px 24px rgba(37,99,235,0.4)" }}>
              Run Hardware Check
            </button>

            <button onClick={onDone} className="w-full mt-3 py-2.5 text-[#8899b0] text-sm hover:text-white transition-colors">
              Skip and use defaults
            </button>
          </div>
        )}

        {/* ── Running step ── */}
        {step === "running" && (
          <div className="fade-in">
            <div className="card p-8 text-center">
              {/* Animated rings */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-[#2563eb]/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-[#2563eb] animate-spin" />
                <div className="absolute inset-3 rounded-full border-t-2 border-blue-400/60 animate-spin"
                  style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CpuIcon className="text-[#2563eb]" />
                </div>
              </div>

              <h2 className="text-white font-bold text-lg mb-1">Checking your system</h2>
              <p className="text-[#8899b0] text-sm mb-8">{msg}</p>

              {/* Progress bar */}
              <div className="relative w-full h-3 rounded-full mb-3 overflow-hidden"
                style={{ background: "#1e2a3e" }}>
                <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }} />
                <div className="h-full rounded-full progress-shimmer overflow-hidden transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%)",
                    boxShadow: "0 0 12px rgba(96,165,250,0.5)",
                  }} />
                {pct > 0 && (
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white transition-all duration-500"
                    style={{ left: `calc(${pct}% - 6px)`, boxShadow: "0 0 8px 3px rgba(96,165,250,0.6)" }} />
                )}
              </div>
              <p className="text-[#2563eb] font-semibold text-sm">{pct}%</p>
            </div>
          </div>
        )}

        {/* ── Done step ── */}
        {step === "done" && result && (
          <div className="fade-in">
            {/* Result banner */}
            <div className="card p-5 mb-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0"
                style={{ border: "1px solid rgba(74,222,128,0.3)" }}>
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Scan complete</p>
                <p className="text-[#8899b0] text-xs mt-0.5">
                  Detected <span className="text-white font-semibold">{result.ram_gb} GB RAM</span>
                  {" · "}Recommended tier: <span className="text-[#60a5fa] font-semibold">{result.quantization_tier}</span>
                </p>
              </div>
            </div>

            {/* Tier picker */}
            <p className="text-[#8899b0] text-xs font-semibold uppercase tracking-widest mb-3 px-1">
              Choose your model tier
            </p>
            <div className="flex flex-col gap-3 mb-6">
              {TIERS.map((t) => {
                const active = selectedTier === t.id;
                const recommended = result.quantization_tier === t.id;
                return (
                  <button key={t.id} onClick={() => setSelectedTier(t.id)}
                    className="w-full rounded-2xl p-4 text-left transition-all duration-200 hover:brightness-110"
                    style={{
                      background: active ? `${t.glow}` : "rgba(19,28,46,0.8)",
                      border: `1px solid ${active ? t.border : "rgba(255,255,255,0.07)"}`,
                      boxShadow: active ? `0 0 20px ${t.glow}` : "none",
                    }}>
                    <div className="flex items-start gap-3">
                      {/* Radio */}
                      <div className="w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center border-2 transition-colors"
                        style={{ borderColor: active ? t.color : "#2a3850" }}>
                        {active && <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm">{t.label}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ color: t.color, background: `${t.glow}`, border: `1px solid ${t.border}` }}>
                            {t.name}
                          </span>
                          {recommended && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-emerald-400"
                              style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                              Recommended for you
                            </span>
                          )}
                        </div>
                        <p className="text-[#8899b0] text-xs mt-1 leading-relaxed">{t.desc}</p>
                        <p className="text-xs font-medium mt-1.5" style={{ color: t.color }}>{t.ram}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button onClick={confirm}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", boxShadow: "0 8px 24px rgba(37,99,235,0.4)" }}>
              Confirm &amp; Continue
            </button>
          </div>
        )}

        {/* Done step without result (error path) */}
        {step === "done" && !result && (
          <div className="fade-in card p-8 text-center">
            <p className="text-[#8899b0] text-sm mb-2">{msg}</p>
            <p className="text-white/50 text-xs mb-6">Using default settings (Q4_K_M).</p>
            <button onClick={onDone}
              className="px-8 py-3 rounded-xl text-white font-semibold text-sm bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors">
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CpuIcon({ className = "w-5 h-5 text-white" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </svg>
  );
}
