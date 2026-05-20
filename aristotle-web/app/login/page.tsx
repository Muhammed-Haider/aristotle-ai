"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    setLoading(true);

    await new Promise(r => setTimeout(r, 600));

    const existing = getUser();
    if (existing && existing.email === email) {
      router.push(existing.subjects?.length ? "/dashboard" : "/onboarding");
    } else {
      setError("No account found. Please register first.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">A</div>
          <h1 className="text-xl font-bold text-white">Welcome back</h1>
          <p className="text-[#8899b0] text-sm mt-1">Sign in to continue learning</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {[
            { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
            { label: "Password", type: "password", val: password, set: setPassword, ph: "••••••••" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs text-[#8899b0] mb-1.5 font-medium">{f.label}</label>
              <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                className="w-full bg-[#131c2e] border border-[#1e2a3e] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] outline-none focus:border-[#2563eb] transition-colors" />
            </div>
          ))}

          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#2563eb]/20">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[#8899b0] text-xs mt-6">
          No account?{" "}
          <Link href="/register" className="text-[#2563eb] hover:underline font-medium">Register free</Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-[#4a5568] text-xs hover:text-[#8899b0] transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
