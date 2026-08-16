"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

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
    fetch("/api/v1/admin/dashboard", {
      headers: { Authorization: `Bearer ${localStorage.getItem("bek_token")}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Forbidden"))))
      .then((res) => setDash(res.data))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Authority Dashboard</h1>
        {error && <p className="mt-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {!dash && !error && <p className="mt-4 text-gray-500">Loading...</p>}
        {dash && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Total Issues" value={dash.total_issues} />
              <Stat label="Open Issues" value={dash.open_issues} />
              <Stat label="Resolved" value={dash.resolved_issues} />
              <Stat label="Pending Reports" value={dash.pending_reports} />
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Breakdown title="By Status" data={dash.by_status} />
              <Breakdown title="By Severity" data={dash.by_severity} />
            </div>
            <h2 className="mt-8 text-lg font-semibold text-gray-900">Recent Issues</h2>
            <ul className="mt-3 space-y-2">
              {dash.recent_issues.map((issue) => (
                <li
                  key={issue.public_id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm"
                >
                  <span>
                    <span className="font-mono text-gray-500">{issue.public_id}</span>{" "}
                    {issue.title}
                  </span>
                  <span className="text-gray-400">
                    {issue.status} · {issue.severity}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <ul className="mt-2 space-y-1 text-sm">
        {Object.entries(data).map(([k, v]) => (
          <li key={k} className="flex justify-between">
            <span className="text-gray-500">{k}</span>
            <span className="font-medium text-gray-900">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
