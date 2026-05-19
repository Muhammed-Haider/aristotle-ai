import { useState } from "react";
import { apiPost } from "../api";
import { AuthLeft } from "./_AuthShared";

interface Props {
  onRegister: () => void;
  onForgot: () => void;
  onHome: () => void;
  onSuccess: (user: { email: string; name: string }) => void;
}

export default function LoginScreen({ onRegister, onForgot, onHome, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await apiPost<{ email: string; name: string }>("/auth/login", { email, password });
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <AuthLeft
        title="Welcome to Aristotle"
        subtitle="Learn with Reason. Your AI-powered study companion for smarter learning."
      />

      {/* right */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] px-12 relative">
        <div className="w-full max-w-sm fade-in">
          <h2 className="text-2xl font-bold text-white text-center mb-1">Welcome Back</h2>
          <p className="text-[#8899b0] text-sm text-center mb-8">Sign in to continue your progress</p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-[#c8d3e0] mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-[#c8d3e0] mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" className="input-field" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#8899b0] cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-[#2563eb] rounded" />
                Remember me
              </label>
              <button type="button" onClick={onForgot} className="text-[#2563eb] hover:text-blue-400 transition-colors">
                Forgot password?
              </button>
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-1">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#8899b0] mt-5">
            Don't have an account?{" "}
            <button onClick={onRegister} className="text-[#2563eb] hover:text-blue-400 transition-colors font-medium">
              Sign Up
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
