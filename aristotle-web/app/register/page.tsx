"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "@/lib/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);

    await new Promise(r => setTimeout(r, 700));

    saveUser({ email, name, subjects: [], level: "Standard" });
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">A</div>
          <h1 className="text-xl font-bold text-white">Create your account</h1>
          <p className="text-[#8899b0] text-sm mt-1">Start your Socratic learning journey</p>
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
                className="w-full bg-[#131c2e] border border-[#1e2a3e] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5568] outline-none focus:border-[#2563eb] transition-colors" />
            </div>
          ))}

          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#2563eb]/20">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[#8899b0] text-xs mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#2563eb] hover:underline font-medium">Sign in</Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-[#4a5568] text-xs hover:text-[#8899b0] transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
