"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Breakdown, PageHeader, Stat } from "@/components/ui";

type Analytics = {
  summary: {
    total_issues: number;
    open_issues: number;
    resolved_issues: number;
    avg_resolution_hours: number | null;
  };
  severity_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
  category_breakdown: {
    id: number;
    name: string;
    slug: string;
    issues_count: number;
  }[];
  report_trend_14d: { date: string; count: number }[];
};

type Hotspot = {
  latitude: number;
  longitude: number;
  issue_count: number;
  category_count: number;
  avg_severity: number;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("bek_token")}` };
    fetch("/api/v1/intelligence/analytics", { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Analytics unavailable"))))
      .then((res) => setAnalytics(res.data))
      .catch((e) => setError(e.message));
    fetch("/api/v1/intelligence/hotspots", { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Hotspots unavailable"))))
      .then((res) => setHotspots(res.data.hotspots))
      .catch((e) => setError((prev) => (prev ? `${prev}; ${e.message}` : e.message)));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <PageHeader title="Intelligence" subtitle="Analytics & hotspots for authority planning" />
        {error && <p className="mt-4 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
        {!analytics && !error && <p className="mt-4 text-slate-500">Loading...</p>}
        {analytics && (
          <>
            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Total Issues" value={analytics.summary.total_issues} />
              <Stat label="Open Issues" value={analytics.summary.open_issues} />
              <Stat label="Resolved" value={analytics.summary.resolved_issues} />
              <Stat
                label="Avg Resolution (h)"
                value={
                  analytics.summary.avg_resolution_hours !== null
                    ? String(analytics.summary.avg_resolution_hours)
                    : "—"
                }
              />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Breakdown title="By Status" data={analytics.status_breakdown} />
              <Breakdown title="By Severity" data={analytics.severity_breakdown} />
            </div>

            <h2 className="mt-8 text-lg font-semibold text-slate-900">By Category</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {analytics.category_breakdown.map((c) => (
                <div key={c.id} className="card p-3 text-sm">
                  <p className="font-semibold text-slate-700">{c.name}</p>
                  <p className="text-xs text-slate-400">
                    {c.issues_count} open issue{c.issues_count === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>

            <h2 className="mt-8 text-lg font-semibold text-slate-900">Reports — last 14 days</h2>
            <div className="card mt-3 flex h-32 items-end gap-1 p-3">
              {analytics.report_trend_14d.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 rounded-t bg-gradient-to-t from-teal-500 to-sky-400"
                  title={`${d.date}: ${d.count}`}
                  style={{ height: `${Math.max(8, (d.count / maxCount(analytics.report_trend_14d)) * 100)}%` }}
                />
              ))}
            </div>

            <h2 className="mt-8 text-lg font-semibold text-slate-900">Hotspots</h2>
            {hotspots.length === 0 && <p className="mt-3 text-sm text-slate-500">No hotspots detected.</p>}
            <ul className="mt-3 space-y-2">
              {hotspots.map((h) => (
                <li
                  key={`${h.latitude},${h.longitude}`}
                  className="card flex items-center justify-between p-3 text-sm"
                >
                  <span className="font-mono text-slate-700">
                    {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                  </span>
                  <span className="text-slate-400">
                    {h.issue_count} issues · {h.category_count} categories · sev {h.avg_severity}
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

function maxCount(trend: { date: string; count: number }[]) {
  return Math.max(...trend.map((d) => d.count), 1);
}