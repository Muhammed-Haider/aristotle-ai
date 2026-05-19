import { useState } from "react";
import { AuthLeft } from "./_AuthShared";

interface Props {
  onBack: () => void;
  onSent: () => void;
  onHome: () => void;
}

export default function ForgotPasswordScreen({ onBack, onSent, onHome }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    onSent();
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <AuthLeft
        title="Need Help?"
        subtitle="Don't worry! We'll send you a secure link to reset your password and get you back to learning"
      />

      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] px-12 relative">
        <div className="w-full max-w-sm fade-in">
          {/* mail icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl border border-[#2563eb]/40 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-1">Forgot Password</h2>
          <p className="text-[#8899b0] text-sm text-center mb-8 leading-relaxed">
            Enter your email and we'll send you instructions to reset your password
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-[#c8d3e0] mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" className="input-field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-1">
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-sm text-[#8899b0] mt-5">
            Remember your password?{" "}
            <button onClick={onBack} className="text-[#2563eb] hover:text-blue-400 transition-colors font-medium">
              Back to Sign In
            </button>
          </p>
        </div>

        <button onClick={onHome}
          className="absolute bottom-6 left-8 flex items-center gap-1.5 text-sm text-[#8899b0] hover:text-white transition-colors">
          <span>←</span> Back to home
        </button>
      </div>
    </div>
  );
}
