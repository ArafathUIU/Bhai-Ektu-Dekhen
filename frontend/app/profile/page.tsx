"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
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
          <p className="text-gray-500">Loading...</p>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          <p className="text-gray-500">Please log in.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Reports</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">{stats?.reports_submitted ?? 0}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Issues supported</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">{stats?.issues_supported ?? 0}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <dt className="text-xs uppercase tracking-wide text-gray-500">Member since</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">{stats?.member_since ?? "—"}</dd>
            </div>
          </dl>
          <div className="mt-5 flex gap-3">
            <Link
              href="/my-reports"
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
            >
              My Reports
            </Link>
            <Link
              href="/report"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}