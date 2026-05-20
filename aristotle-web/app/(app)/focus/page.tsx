"use client";
import { useEffect, useRef, useState } from "react";

const DURATIONS = [
  { label: "25 min", value: 25 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

export default function FocusPage() {
  const [duration, setDuration]   = useState(25);
  const [seconds, setSeconds]     = useState(25 * 60);
  const [running, setRunning]     = useState(false);
  const [finished, setFinished]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = duration * 60;
  const pct   = Math.round((seconds / total) * 100);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  function reset() {
    setRunning(false);
    setFinished(false);
    setSeconds(duration * 60);
  }

  function changeDuration(val: number) {
    if (running) return;
    setDuration(val);
    setSeconds(val * 60);
    setFinished(false);
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col h-full">
      {/* top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#1a2540]">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8899b0" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
          <span className="text-white font-semibold">Focus Mode</span>
        </div>
        <button onClick={reset}
          className="text-[#8899b0] hover:text-white text-sm transition-colors">
          Exit Focus Mode
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
        {/* duration picker */}
        {!running && !finished && (
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <button key={d.value} onClick={() => changeDuration(d.value)}
                className={`px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
                  duration === d.value
                    ? "bg-[#2563eb] border-[#2563eb] text-white"
                    : "border-[#2a3a54] text-[#8899b0] hover:text-white hover:border-[#4a5568]"
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        )}

        {/* timer card */}
        <div className="w-full max-w-2xl p-12 rounded-3xl border border-[#1a2540] flex flex-col items-center gap-8"
          style={{ background: "#0c1a2e" }}>

          {finished ? (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
              <p className="text-[#8899b0] text-sm">Great work! You completed a {duration}-minute focus session.</p>
            </div>
          ) : (
            <>
              <p className="text-[#8899b0] text-sm">{running ? "Focus Session Active" : "Ready to Focus"}</p>
              <div className="text-7xl font-light text-white tracking-wider">
                {mins}:{secs}
              </div>
            </>
          )}

          {/* progress bar */}
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-[#8899b0] mb-2">
              <span>Progress</span>
              <span>{finished ? "100" : pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
              <div className="h-full bg-[#2563eb] rounded-full transition-all duration-1000"
                style={{ width: `${finished ? 100 : 100 - pct}%` }} />
            </div>
          </div>

          {/* controls */}
          <div className="flex gap-3">
            <button onClick={reset}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#2a3a54] text-sm text-[#8899b0] hover:text-white hover:border-[#4a5568] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/>
              </svg>
              Reset
            </button>
            <button onClick={() => setRunning(r => !r)} disabled={finished}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-sm font-semibold text-white transition-all shadow-lg shadow-[#2563eb]/20">
              {running ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  Pause
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  {finished ? "Done" : "Start"}
                </>
              )}
            </button>
            <button onClick={() => { setRunning(false); setSeconds(5 * 60); setFinished(false); }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#2a3a54] text-sm text-[#8899b0] hover:text-white hover:border-[#4a5568] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Break
            </button>
          </div>
        </div>

        {/* tips */}
        {!running && !finished && (
          <div className="flex gap-4 text-center max-w-2xl w-full">
            {[
              { icon: "📵", text: "Put your phone away" },
              { icon: "🎧", text: "Use ambient sounds" },
              { icon: "💧", text: "Stay hydrated" },
            ].map(t => (
              <div key={t.text} className="flex-1 p-4 rounded-xl border border-[#1a2540]" style={{ background: "#0c1a2e" }}>
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="text-[#8899b0] text-xs">{t.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
