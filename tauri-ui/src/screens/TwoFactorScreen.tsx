import { useState, useRef, KeyboardEvent } from "react";
import { AuthLeft } from "./_AuthShared";

interface Props {
  mode: "login" | "register";
  email: string;
  onSuccess: (user: { email: string; name: string }) => void;
  onBack: () => void;
}

export default function TwoFactorScreen({ mode, email, onSuccess, onBack }: Props) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const r0 = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);
  const r4 = useRef<HTMLInputElement>(null);
  const r5 = useRef<HTMLInputElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];

  function handleChange(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) refs[i + 1].current?.focus();
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    onSuccess({ email, name: email.split("@")[0] });
  }

  const isLogin = mode === "login";

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <AuthLeft
        title="Welcome to Aristotle"
        subtitle="Learn with Reason. Your AI-powered study companion for smarter learning."
      />

      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] px-12 relative">
        <div className="w-full max-w-sm fade-in">
          <h2 className="text-2xl font-bold text-white text-center mb-1">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-[#8899b0] text-sm text-center mb-2">
            {isLogin ? "Sign in to continue your progress" : "Start your learning journey today"}
          </p>
          <p className="text-[#8899b0] text-sm text-center mb-6">We've sent a verification code to</p>

          <form onSubmit={submit}>
            <div className="mb-6">
              <label className="block text-sm text-[#c8d3e0] mb-3">Enter 6-Digit Code</label>
              <div className="flex gap-2 justify-center">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={refs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    className="otp-box"
                  />
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading || digits.some(d => !d)} className="btn-primary">
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
          </form>

          <div className="text-center mt-5 flex flex-col gap-1.5">
            <button onClick={onBack}
              className="flex items-center justify-center gap-1.5 text-sm text-[#8899b0] hover:text-white transition-colors mx-auto">
              <span>←</span> {isLogin ? "Back to Sign In" : "Back to Registration"}
            </button>
            <p className="text-sm text-[#8899b0]">
              Didn't receive the code?{" "}
              <button className="text-[#2563eb] hover:text-blue-400 transition-colors font-medium">Resend</button>
            </p>
          </div>
        </div>

        <button onClick={onBack}
          className="absolute bottom-6 left-8 flex items-center gap-1.5 text-sm text-[#8899b0] hover:text-white transition-colors">
          <span>←</span> Back to home
        </button>
      </div>
    </div>
  );
}
