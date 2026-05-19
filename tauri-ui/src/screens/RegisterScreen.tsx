import { useState } from "react";
import { apiPost } from "../api";

interface Props {
  onLogin: () => void;
  onSuccess: (user: { email: string; name: string }) => void;
}

export default function RegisterScreen({ onLogin, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await apiPost<{ email: string; name: string }>("/auth/register", { name, email, password });
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass rounded-2xl p-10 w-full max-w-sm fade-in z-10">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/30">
            A
          </div>
          <h1 className="text-xl font-semibold text-white">Create Account</h1>
          <p className="text-sm text-slate-400">Join Aristotle AI</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {[
            { label: "Name", type: "text", val: name, set: setName, ph: "Your name" },
            { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
            { label: "Password", type: "password", val: password, set: setPassword, ph: "••••••••" },
          ].map(({ label, type, val, set, ph }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
              <input
                type={type} value={val} onChange={e => set(e.target.value)} required placeholder={ph}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
              />
            </div>
          ))}

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="mt-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl py-2.5 text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {loading ? "Creating…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <button onClick={onLogin} className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</button>
        </p>
      </div>
    </div>
  );
}
