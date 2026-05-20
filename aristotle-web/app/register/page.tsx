"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, subjects: [], level: "Beginner" },
          // After confirming email, Supabase redirects here
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (authErr) { setError(authErr.message); setLoading(false); return; }

      if (data.session) {
        // Email confirmation is disabled — session exists immediately
        saveUser({ id: data.user?.id, email, name, subjects: [], level: "Beginner" });
        router.push("/onboarding");
      } else {
        // Email confirmation required — show check-your-email screen
        setEmailSent(true);
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  /* ── Email sent screen ── */
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080d18" }}>
        <div className="w-full max-w-sm text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/30 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-[#8899b0] text-sm leading-relaxed mb-2">
            We sent a confirmation link to
          </p>
          <p className="text-white font-semibold text-sm mb-6">{email}</p>
          <p className="text-[#8899b0] text-xs leading-relaxed mb-8">
            Click the link in the email to activate your account and start learning.
            Check your spam folder if you don&apos;t see it.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => { setEmailSent(false); setPassword(""); }}
              className="w-full py-2.5 rounded-xl border border-[#2a3a54] text-sm text-[#8899b0] hover:text-white hover:border-[#4a5568] transition-all">
              Use a different email
            </button>
            <Link href="/login"
              className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-sm font-semibold text-white transition-all text-center block">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Registration form ── */
  return (
    <div className="min-h-screen flex" style={{ background: "#080d18" }}>
      {/* left panel */}
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
          <h1 className="text-3xl font-bold text-white mb-2">Join Aristotle</h1>
          <p className="text-[#8899b0] text-sm leading-relaxed max-w-xs">
            Start your Socratic learning journey. Free forever.
          </p>
          <div className="mt-10 space-y-4 max-w-xs">
            {[
              { step: "1", text: "Create your account" },
              { step: "2", text: "Confirm your email" },
              { step: "3", text: "Pick subjects & start learning" },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-3 text-left">
                <div className="w-7 h-7 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/40 flex items-center justify-center text-[#3b82f6] text-xs font-bold shrink-0">
                  {s.step}
                </div>
                <span className="text-[#8899b0] text-sm">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-[#8899b0] text-sm">Your study companion is waiting</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { label: "Full Name", type: "text",     val: name,     set: setName,     ph: "Your name" },
              { label: "Email",     type: "email",    val: email,    set: setEmail,    ph: "you@example.com" },
              { label: "Password",  type: "password", val: password, set: setPassword, ph: "Min. 6 characters" },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-[#8899b0] mb-1.5 font-medium">{f.label}</label>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  className="w-full border border-[#2a3a54] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] outline-none focus:border-[#2563eb] transition-colors"
                  style={{ background: "#0c1a2e" }} />
              </div>
            ))}

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#2563eb]/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Creating account…
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-[#8899b0] text-xs mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2563eb] hover:underline font-semibold">Sign in</Link>
          </p>
          <p className="text-center mt-4">
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
