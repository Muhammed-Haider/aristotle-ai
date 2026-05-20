"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUser, clearUser, User } from "@/lib/auth";
import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn",     label: "Learn"      },
  { href: "/practice",  label: "Practice"   },
  { href: "/progress",  label: "Progress"   },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const u = getUser();
    if (!u)                  { router.replace("/login");      return; }
    if (!u.subjects?.length) { router.replace("/onboarding"); return; }
    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      {/* sidebar */}
      <aside className="w-[220px] shrink-0 flex flex-col py-5 px-3 border-r border-[#1e2a3e]">
        {/* brand */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Aristotle</div>
            <div className="text-[#2563eb] text-[10px] font-medium mt-0.5">Learn with Reason</div>
          </div>
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#2563eb]/15 text-white border border-[#2563eb]/25"
                    : "text-[#8899b0] hover:text-white hover:bg-[#131c2e]"
                }`}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* user + logout */}
        <div className="border-t border-[#1e2a3e] pt-4 mt-4">
          <div className="flex items-center gap-2.5 px-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{user.name || user.email}</div>
              <div className="text-[#4a5568] text-[10px] truncate">{user.level}</div>
            </div>
          </div>
          <button
            onClick={() => { clearUser(); router.push("/"); }}
            className="w-full text-left px-3 py-2 text-xs text-[#4a5568] hover:text-[#8899b0] hover:bg-[#131c2e] rounded-lg transition-all">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
