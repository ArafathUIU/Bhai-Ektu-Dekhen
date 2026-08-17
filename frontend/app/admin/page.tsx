"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Breakdown, PageHeader, Stat } from "@/components/ui";
import { api } from "@/lib/api";

type Dashboard = {
  total_issues: number;
  open_issues: number;
  resolved_issues: number;
  pending_reports: number;
  by_status: Record<string, number>;
  by_severity: Record<string, number>;
  recent_issues: { public_id: string; title: string; status: string; severity: string }[];
};

export default function AdminPage() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dashboard()
      .then((res) => setDash(res.data))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <PageHeader title="Authority Dashboard" subtitle="Overview of civic issues and workloads" />
        {error && <p className="mt-4 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
        {!dash && !error && <p className="mt-4 text-slate-500">Loading...</p>}
        {dash && (
          <>
            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Total Issues" value={dash.total_issues} />
              <Stat label="Open Issues" value={dash.open_issues} />
              <Stat label="Resolved" value={dash.resolved_issues} />
              <Link
                href="/moderation"
                className="card block p-4 transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-soft"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Pending Reports
                </p>
                <p className="mt-1 bg-gradient-to-r from-teal-500 to-sky-600 bg-clip-text text-2xl font-extrabold text-transparent">
                  {dash.pending_reports}
                </p>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/moderation" className="btn-primary text-sm !px-4 !py-2">
                Open Moderation Queue
              </Link>
              <Link href="/assignments" className="btn-secondary text-sm !px-4 !py-2">
                Manage Assignments
              </Link>
              <Link href="/analytics" className="btn-secondary text-sm !px-4 !py-2">
                Analytics
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Breakdown title="By Status" data={dash.by_status} />
              <Breakdown title="By Severity" data={dash.by_severity} />
            </div>
            <h2 className="mt-8 text-lg font-semibold text-slate-900">Recent Issues</h2>
            <ul className="mt-3 space-y-2">
              {dash.recent_issues.map((issue, i) => (
                <li key={issue.public_id} className={`animate-fade-up ${i < 5 ? `d-${i + 1}` : ""}`}>
                  <Link
                    href={`/issues/${issue.public_id}`}
                    className="card flex items-center justify-between p-3 text-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-soft"
                  >
                    <span>
                      <span className="font-mono text-slate-400">{issue.public_id}</span>{" "}
                      <span className="font-medium text-slate-800">{issue.title}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      {issue.status} · {issue.severity}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}