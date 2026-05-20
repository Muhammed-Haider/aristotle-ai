"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveUser, syncUserFromSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { pullUserData } from "@/lib/db";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "confirmation_failed") {
      setError("Email confirmation failed or expired. Please try again.");
    }
    if (searchParams.get("confirmed") === "true") {
      setError(""); // clear, user just confirmed
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) { setError(authErr.message); setLoading(false); return; }

      // Pull profile into localStorage
      const user = await syncUserFromSession();
      // Pull tracking data from DB into localStorage (background)
      pullUserData().catch(() => {});

      router.push(user?.subjects?.length ? "/dashboard" : "/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function tryDemo() {
    setLoading(true);
    try {
      // Sign in with the pre-created demo account
      const supabase = createClient();
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email:    "demo@aristotle.ai",
        password: "demo-aristotle-2024",
      });
      if (authErr) {
        // Fallback: use localStorage-only demo (no Supabase account created yet)
        saveUser({ email: "demo@aristotle.ai", name: "Alex", subjects: [], level: "Intermediate" });
        router.push("/onboarding");
        return;
      }
      await syncUserFromSession();
      router.push("/dashboard");
    } catch {
      saveUser({ email: "demo@aristotle.ai", name: "Alex", subjects: [], level: "Intermediate" });
      router.push("/onboarding");
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#080d18" }}>
      {/* left panel — branding */}
      <div className="hidden lg:flex w-[45%] flex-col items-center justify-center relative overflow-hidden px-14"
        style={{ background: "linear-gradient(160deg, #0f2057 0%, #080d18 60%)" }}>
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 50% at 40% 50%, rgba(37,99,235,0.25) 0%, transparent 70%)" }} />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#2563eb] flex items-center justify-center mx-auto mb-7 shadow-2xl"
            style={{ boxShadow: "0 0 60px rgba(37,99,235,0.5)" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 3c0 0-4 4-4 7a4 4 0 0 0 8 0c0-3-4-7-4-7z" fill="white"/>
              <circle cx="18" cy="5" r="1.5" fill="white" opacity="0.8"/>
              <path d="M6 17c0 0 3-2 6-2s6 2 6 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Aristotle</h1>
          <p className="text-[#8899b0] text-sm leading-relaxed max-w-xs">
            Learn with Reason. Your AI-powered study companion for smarter learning.
          </p>
          <div className="mt-10 space-y-3 text-left max-w-xs">
            {[
              { icon: "🎯", text: "Socratic method — guided questioning, not answers" },
              { icon: "⚡", text: "Real-time AI responses at 300 tokens/sec" },
              { icon: "📊", text: "Track mastery across every subject" },
            ].map(f => (
              <div key={f.text} className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">{f.icon}</span>
                <span className="text-[#8899b0] text-xs leading-relaxed">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-[#8899b0] text-sm">Sign in to continue your progress</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-[#8899b0] mb-1.5 font-medium">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#2a3a54] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] outline-none focus:border-[#2563eb] transition-colors"
                style={{ background: "#0c1a2e" }} />
            </div>
            <div>
              <label className="block text-xs text-[#8899b0] mb-1.5 font-medium">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#2a3a54] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] outline-none focus:border-[#2563eb] transition-colors"
                style={{ background: "#0c1a2e" }} />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#8899b0] cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#2563eb]" />
                Remember me
              </label>
              <button type="button" className="text-[#2563eb] hover:underline">Forgot password?</button>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#2563eb]/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[#8899b0] text-xs mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#2563eb] hover:underline font-semibold">Sign Up</Link>
          </p>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#1a2540]"/>
            <span className="text-[#4a5568] text-xs">or</span>
            <div className="flex-1 h-px bg-[#1a2540]"/>
          </div>
          <button onClick={tryDemo} disabled={loading}
            className="w-full py-2.5 rounded-xl border border-[#2a3a54] text-sm text-[#8899b0] hover:text-white hover:border-[#4a5568] transition-all disabled:opacity-50">
            Continue as Demo User
          </button>
          <p className="text-center mt-5">
            <Link href="/" className="text-[#4a5568] text-xs hover:text-[#8899b0] transition-colors flex items-center justify-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
