interface Props {
  onBack: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export default function TryDemoScreen({ onBack, onLogin, onRegister }: Props) {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-[#0d1117]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* back */}
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#8899b0] hover:text-white text-sm mb-8 transition-colors">
          <span>←</span> Back to Home
        </button>

        {/* hero */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#2563eb] flex items-center justify-center mx-auto mb-5 shadow-xl"
            style={{ boxShadow: "0 0 40px rgba(37,99,235,0.4)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 5.8a1 1 0 0 0 .6.6L20.3 11.4l-5.8 1.9a1 1 0 0 0-.6.6L12 20.2l-1.9-5.8a1 1 0 0 0-.6-.6L3.7 12l5.8-1.9a1 1 0 0 0 .6-.6z"/>
              <path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Aristotle</h1>
          <p className="text-[#8899b0]">Your AI-Powered Focused Study Assistant</p>
        </div>

        {/* how it works */}
        <div className="card p-5 mb-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-[#2563eb]">⚙</span> How It Works
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "1", t: "Add Subjects", d: "Choose from predefined subjects or create your own" },
              { n: "2", t: "Learn with AI", d: "Get personalized content adapted to your level" },
              { n: "3", t: "Practice Quizzes", d: "Test knowledge with AI-generated questions" },
              { n: "4", t: "Track Progress", d: "Monitor your growth with detailed analytics" },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex items-start gap-3 p-3 rounded-xl bg-[#0d1117] border border-[#1e2a3e]">
                <div className="w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold shrink-0">{n}</div>
                <div>
                  <div className="text-white text-sm font-medium">{t}</div>
                  <div className="text-[#4a5568] text-xs mt-0.5">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="card p-5 mb-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-[#2563eb]">?</span> Quick FAQs
          </h2>
          {[
            ["What is Aristotle?", "An AI-powered study assistant with timer, adaptive quizzes, and focus tools."],
            ["What's Focus Mode?", "A distraction-free environment with Pomodoro timer for focused study sessions."],
            ["Demo vs Full Account?", "Demo lets you explore features, but creating an account saves your progress across devices."],
          ].map(([q, a]) => (
            <div key={q} className="mb-3 pb-3 border-b border-[#1e2a3e] last:border-0 last:mb-0 last:pb-0">
              <div className="text-white text-sm font-medium mb-1">{q}</div>
              <div className="text-[#8899b0] text-xs">{a}</div>
            </div>
          ))}
        </div>

        {/* about */}
        <div className="card p-5 mb-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-[#2563eb]">ℹ</span> About
          </h2>
          <p className="text-[#8899b0] text-sm leading-relaxed mb-3">
            Named after the ancient Greek philosopher, Aristotle combines cutting-edge AI with proven educational methods to help you study smarter.
          </p>
          <div className="flex gap-3 flex-wrap">
            {["Adaptive Learning", "Smart Quizzes", "Progress Tracking"].map(f => (
              <span key={f} className="px-3 py-1 rounded-full bg-[#2563eb]/15 text-[#2563eb] text-xs border border-[#2563eb]/30">{f}</span>
            ))}
          </div>
        </div>

        {/* privacy */}
        <div className="card p-5 mb-8">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-[#2563eb]">🔒</span> Privacy & Security
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white text-sm font-medium mb-1">We Collect:</div>
              <p className="text-[#8899b0] text-xs leading-relaxed">Subjects, study materials, and learning progress to personalize your experience.</p>
            </div>
            <div>
              <div className="text-white text-sm font-medium mb-1">We Protect:</div>
              <p className="text-[#8899b0] text-xs leading-relaxed">End-to-end encryption, secure storage, and we never sell your data to third parties.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button onClick={onRegister} className="btn-primary max-w-xs mx-auto mb-3 text-base py-3">
            Explore Features →
          </button>
          <p className="text-[#4a5568] text-xs">
            Already have an account?{" "}
            <button onClick={onLogin} className="text-[#2563eb] hover:text-blue-400 transition-colors">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
