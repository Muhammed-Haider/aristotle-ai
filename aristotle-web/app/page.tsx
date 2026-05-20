"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, saveUser } from "@/lib/auth";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (u?.subjects?.length) router.replace("/dashboard");
    else if (u) router.replace("/onboarding");
  }, [router]);

  function tryDemo() {
    saveUser({ email: "demo@aristotle.ai", name: "Alex", subjects: [], level: "Intermediate" });
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #080d18 50%, #0a1628 100%)" }}>

      {/* background image overlay */}
      <div className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(37,99,235,0.4) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* logo icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#2563eb] flex items-center justify-center mb-5 shadow-2xl"
          style={{ boxShadow: "0 0 60px rgba(37,99,235,0.5)" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C12 3 8 7 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 7 12 3 12 3Z" fill="white"/>
            <circle cx="18" cy="5" r="1.5" fill="white" opacity="0.8"/>
            <path d="M6 17C6 17 9 15 12 15C15 15 18 17 18 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 20C4 20 7.5 18 12 18C16.5 18 20 20 20 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </div>

        <h1 className="text-5xl font-bold mb-2 tracking-tight">Aristotle</h1>
        <p className="text-[#3b82f6] font-semibold text-lg mb-10">Learn with Reason</p>

        {/* features */}
        <div className="flex items-center gap-8 mb-12 text-sm text-[#8899b0]">
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2l2.5 7H22l-6 4.5 2.3 7-6.3-4.5L5.7 21.5 8 14.5 2 10h7.5z"/>
            </svg>
            Adaptive Learning
          </div>
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Goal Tracking
          </div>
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z"/>
              <path d="M12 8v4m0 4h.01"/>
            </svg>
            Socratic Tutoring
          </div>
        </div>

        {/* buttons */}
        <div className="flex gap-3">
          <button onClick={tryDemo}
            className="px-7 py-2.5 rounded-xl border border-[#2a3a54] text-sm font-medium text-white hover:border-[#2563eb]/60 hover:bg-[#2563eb]/10 transition-all">
            Try Demo
          </button>
          <Link href="/login"
            className="px-7 py-2.5 rounded-xl border border-[#2a3a54] text-sm font-medium text-[#8899b0] hover:text-white hover:border-[#2563eb]/60 transition-all">
            Login
          </Link>
          <Link href="/register"
            className="px-7 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-sm font-semibold transition-all shadow-lg shadow-[#2563eb]/30">
            Register
          </Link>
        </div>

        <p className="text-[#4a5568] text-xs mt-14">
          Transform your study sessions with AI-driven focus and insights
        </p>
      </div>
    </div>
  );
}
