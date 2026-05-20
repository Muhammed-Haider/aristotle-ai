"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (u?.subjects?.length) router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1e2a3e]/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold">A</div>
          <span className="font-bold text-base">Aristotle</span>
          <span className="text-[#2563eb] text-xs font-medium hidden sm:block">Learn with Reason</span>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/login" className="px-4 py-2 text-sm text-[#8899b0] hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-5 py-2 text-sm bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl font-semibold transition-all shadow-lg shadow-[#2563eb]/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2563eb]/30 bg-[#2563eb]/10 text-[#3b82f6] text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse inline-block" />
          Powered by Gemini AI · Fully Offline Capable
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
          Learn Computer Science
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#7c3aed]">
            the Socratic Way
          </span>
        </h1>

        <p className="text-[#8899b0] text-lg max-w-lg mb-10 leading-relaxed">
          Don't just get answers. Build real understanding.
          Aristotle guides you through CS concepts by asking the right questions — like the greatest tutors always have.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-20">
          <Link href="/register"
            className="px-8 py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl font-semibold text-sm transition-all shadow-xl shadow-[#2563eb]/25 hover:shadow-[#2563eb]/40 hover:scale-105">
            Start Learning Free →
          </Link>
          <Link href="/login"
            className="px-8 py-3.5 border border-[#1e2a3e] hover:border-[#2563eb]/50 rounded-xl font-medium text-sm text-[#8899b0] hover:text-white transition-all">
            Login
          </Link>
        </div>

        {/* feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            { icon: "🎯", title: "Socratic Method", desc: "Guided questioning that forces you to think, not just memorize." },
            { icon: "⚡", title: "Gemini AI Powered", desc: "100+ tokens/sec streaming. Fast, fluent, like talking to an expert." },
            { icon: "📊", title: "Track Mastery", desc: "Monitor progress across DSA, OOP, OS, Networks and more." },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl border border-[#1e2a3e] bg-[#131c2e]/60 text-left hover:border-[#2563eb]/30 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-semibold text-sm mb-2 text-white">{f.title}</div>
              <div className="text-[#8899b0] text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
