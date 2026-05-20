"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUser, syncUserFromSession, signOut, User } from "@/lib/auth";
import Link from "next/link";

const NAV = [
  {
    href: "/dashboard", label: "Dashboard",
    icon: (a: boolean) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a ? "white" : "#8899b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/subjects", label: "My Subjects",
    icon: (a: boolean) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a ? "white" : "#8899b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    href: "/learn", label: "Learn",
    icon: (a: boolean) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a ? "white" : "#8899b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    href: "/focus", label: "Focus Mode",
    icon: (a: boolean) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a ? "white" : "#8899b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
  {
    href: "/practice", label: "Practice",
    icon: (a: boolean) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a ? "white" : "#8899b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
  },
  {
    href: "/progress", label: "Progress",
    icon: (a: boolean) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a ? "white" : "#8899b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    href: "/exam", label: "Exam Planner",
    icon: (a: boolean) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a ? "white" : "#8899b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: "/profile", label: "Profile",
    icon: (a: boolean) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={a ? "white" : "#8899b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function init() {
      // Try fast localStorage first for instant render
      const cached = getUser();
      if (cached?.subjects?.length) { setUser(cached); }

      // Then sync from Supabase session (keeps data fresh across devices)
      const fresh = await syncUserFromSession();
      if (!fresh) {
        // No valid session → middleware will redirect, but also guard here
        router.replace("/login");
        return;
      }
      if (!fresh.subjects?.length) { router.replace("/onboarding"); return; }
      setUser(fresh);
    }
    init();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080d18" }}>
        <div className="w-6 h-6 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080d18" }}>
      {/* sidebar */}
      <aside className="w-[200px] shrink-0 flex flex-col py-5 px-3 border-r border-[#1a2540]"
        style={{ background: "#0a1020" }}>

        {/* brand */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center shrink-0 shadow-lg shadow-[#2563eb]/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3c0 0-4 4-4 7a4 4 0 0 0 8 0c0-3-4-7-4-7z" fill="white"/>
              <circle cx="18" cy="5" r="1.5" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Aristotle</div>
            <div className="text-[#2563eb] text-[10px] font-medium mt-0.5">Learn with Reason</div>
          </div>
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#2563eb] text-white"
                    : "text-[#8899b0] hover:text-white hover:bg-[#0f1e36]"
                }`}>
                {icon(active)}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* user info at bottom */}
        <div className="border-t border-[#1a2540] pt-4 mt-2">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{user.name || user.email}</div>
              <div className="text-[#4a5568] text-[10px] truncate">{user.level}</div>
            </div>
          </div>
          <button onClick={async () => { await signOut(); router.push("/"); }}
            className="w-full text-left px-2 py-1.5 text-xs text-[#4a5568] hover:text-[#8899b0] hover:bg-[#0f1e36] rounded-lg transition-all">
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-[#1a2540] shrink-0" style={{ background: "#080d18" }}>
          <div className="flex items-center gap-2 text-[#4a5568] text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Aristotle</span>
            <span>/</span>
            <span className="text-[#8899b0] capitalize">{pathname.replace("/", "") || "home"}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* search */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1a2540] text-[#4a5568] text-xs" style={{ background: "#0c1a2e" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>Search…</span>
              <kbd className="px-1 py-0.5 rounded text-[9px] border border-[#2a3a54] text-[#4a5568]">⌘K</kbd>
            </div>
            {/* notification bell */}
            <button className="relative w-7 h-7 rounded-lg border border-[#1a2540] flex items-center justify-center text-[#4a5568] hover:text-white hover:border-[#2a3a54] transition-all" style={{ background: "#0c1a2e" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
            </button>
            {/* avatar */}
            <div className="w-7 h-7 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
