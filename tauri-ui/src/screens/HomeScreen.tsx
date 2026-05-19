interface Props {
  onLogin: () => void;
  onRegister: () => void;
  onDemo: () => void;
}

export default function HomeScreen({ onLogin, onRegister, onDemo }: Props) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060c1a 0%, #0a1535 50%, #0d1f52 100%)" }}>

      {/* bg glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #2563eb 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #6325eb 0%, transparent 70%)" }} />
      </div>

      {/* content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 fade-in">
        {/* icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#2563eb] flex items-center justify-center mb-6 shadow-xl"
          style={{ boxShadow: "0 0 40px rgba(37,99,235,0.5)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.14z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.14z"/>
          </svg>
        </div>

        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Aristotle</h1>
        <p className="text-[#2563eb] text-lg font-medium mb-8">Learn with Reason</p>

        {/* pills */}
        <div className="flex items-center gap-4 mb-10">
          {[
            { icon: "✦", label: "Adaptive Learning" },
            { icon: "◎", label: "Goal Tracking" },
            { icon: "◈", label: "AI Coaching" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm">
              <span className="text-white/50">{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* buttons */}
        <div className="flex items-center gap-3">
          <button onClick={onDemo}
            className="px-6 py-2.5 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all">
            Try Demo
          </button>
          <button onClick={onLogin}
            className="px-6 py-2.5 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all">
            Login
          </button>
          <button onClick={onRegister}
            className="px-6 py-2.5 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all">
            Register
          </button>
        </div>

        <p className="mt-12 text-white/30 text-xs">
          Transform your study sessions with AI-driven focus and insights
        </p>
      </div>
    </div>
  );
}
