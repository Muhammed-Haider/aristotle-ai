import { useState, useEffect, useRef } from "react";

interface Props {
  onExit: () => void;
}

const FOCUS_MINS = 25;

export default function FocusModeScreen({ onExit }: Props) {
  const [seconds, setSeconds] = useState(FOCUS_MINS * 60);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = onBreak ? 5 * 60 : FOCUS_MINS * 60;
  const pct = Math.round((seconds / total) * 100);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(v => {
          if (v <= 1) { setRunning(false); return 0; }
          return v - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function reset() {
    setRunning(false);
    setOnBreak(false);
    setSeconds(FOCUS_MINS * 60);
  }

  function startBreak() {
    setOnBreak(true);
    setSeconds(5 * 60);
    setRunning(true);
  }

  const statusLabel = running
    ? onBreak ? "On Break" : "Focusing…"
    : seconds === total ? "Ready to Focus" : "Paused";

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0d1117]">
      {/* top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#1e2a3e]">
        <div className="flex items-center gap-2 text-[#8899b0]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
          <span className="text-sm font-medium text-white">Focus Mode</span>
        </div>
        <button onClick={onExit} className="text-[#8899b0] hover:text-white text-sm transition-colors">
          Exit Focus Mode
        </button>
      </div>

      {/* timer card */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-2xl card p-12 flex flex-col items-center">
          <p className="text-[#8899b0] text-sm mb-4">{statusLabel}</p>
          <div className="text-7xl font-thin text-white tracking-widest mb-10 font-mono">
            {mins}:{secs}
          </div>

          {/* progress bar */}
          <div className="w-full mb-2">
            <div className="flex justify-between text-xs text-[#8899b0] mb-2">
              <span>Progress</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-[#1e2a3e] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#2563eb] transition-all duration-1000"
                style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* controls */}
          <div className="flex items-center gap-3 mt-8">
            <button onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e2a3e] text-[#8899b0] hover:text-white text-sm font-medium transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
              Reset
            </button>

            <button onClick={() => setRunning(v => !v)}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-all">
              {running ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/>
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="6 3 20 12 6 21 6 3"/>
                  </svg>
                  {seconds === total ? "Start" : "Resume"}
                </>
              )}
            </button>

            <button onClick={startBreak}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e2a3e] text-[#8899b0] hover:text-white text-sm font-medium transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
              </svg>
              Break
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
