"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { NotificationBell } from "@/components/NotificationBell";

const NAV_LINK =
  "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white/70 hover:text-teal-700";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/60 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-base font-bold text-white shadow-md shadow-teal-500/30">
            👀
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-gradient">Bhai Ektu</span>
            <span className="text-slate-900"> Dekhen</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href="/explore" className={NAV_LINK}>
            Explore
          </Link>
          {user ? (
            <>
              <Link href="/my-reports" className={NAV_LINK}>
                My Reports
              </Link>
              <NotificationBell />
              {user.role?.slug === "admin" && (
                <>
                  <Link href="/admin" className={NAV_LINK}>
                    Dashboard
                  </Link>
                  <Link href="/assignments" className={NAV_LINK}>
                    Assignments
                  </Link>
                  <Link href="/moderation" className={NAV_LINK}>
                    Moderation
                  </Link>
                  <Link href="/analytics" className={NAV_LINK}>
                    Analytics
                  </Link>
                </>
              )}
              <Link href="/profile" className="ml-1 rounded-full bg-white/80 py-1.5 pl-1.5 pr-3 text-slate-600 transition-colors hover:text-teal-700">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-[11px] font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name}
              </Link>
              <button onClick={() => logout()} className="ml-1 rounded-lg px-3 py-1.5 font-medium text-rose-600 transition-colors hover:bg-rose-50">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={NAV_LINK}>
                Login
              </Link>
              <Link href="/register" className="btn-primary ml-1 !py-1.5 !px-4 text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}