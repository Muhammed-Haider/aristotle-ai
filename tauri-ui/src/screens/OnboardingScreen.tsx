interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0d1117] relative overflow-hidden">
      {/* bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #2563eb 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-8 fade-in">
        {/* sparkle icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#2563eb] flex items-center justify-center mb-8 shadow-2xl"
          style={{ boxShadow: "0 0 60px rgba(37,99,235,0.5)" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.9 5.8a1 1 0 0 0 .6.6L20.3 11.4l-5.8 1.9a1 1 0 0 0-.6.6L12 20.2l-1.9-5.8a1 1 0 0 0-.6-.6L3.7 12l5.8-1.9a1 1 0 0 0 .6-.6z"/>
            <path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Aristotle!</h1>
        <p className="text-[#8899b0] text-lg leading-relaxed max-w-md mb-3">
          Your AI-powered study companion is ready. Learn with reason, grow with purpose.
        </p>
        <p className="text-[#4a5568] text-sm mb-10">Let's set up your study space in just a few steps</p>

        <button onClick={onDone}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2563eb] text-white font-semibold text-base hover:bg-[#1d4ed8] transition-all shadow-lg"
          style={{ boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}>
          Get Started <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
}
