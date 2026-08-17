"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui";
import { api, type User } from "@/lib/api";

type Stats = { reports_submitted: number; issues_supported: number; member_since: string };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .profile()
      .then((res) => {
        setUser(res.data.user);
        setStats(res.data.stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          <p className="text-slate-500">Loading...</p>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          <p className="text-slate-500">Please log in.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <PageHeader title="Profile" subtitle="Your account and community activity" />
        <div className="card card-accent p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-2xl font-bold text-white shadow-md shadow-teal-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-3 text-center">
              <dt className="text-xs font-semibold uppercase tracking-wide text-teal-700">Reports</dt>
              <dd className="mt-1 text-2xl font-extrabold text-teal-800">{stats?.reports_submitted ?? 0}</dd>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 p-3 text-center">
              <dt className="text-xs font-semibold uppercase tracking-wide text-sky-700">Issues supported</dt>
              <dd className="mt-1 text-2xl font-extrabold text-sky-800">{stats?.issues_supported ?? 0}</dd>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3 text-center">
              <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Member since</dt>
              <dd className="mt-1 text-lg font-bold text-emerald-800">{stats?.member_since ?? "—"}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/my-reports" className="btn-primary text-sm !px-4 !py-2">
              My Reports
            </Link>
            <Link href="/report" className="btn-secondary text-sm !px-4 !py-2">
              Report an Issue
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}