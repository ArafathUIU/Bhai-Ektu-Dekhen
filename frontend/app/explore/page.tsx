"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui";
import { api, type Category, type Issue } from "@/lib/api";

const IssueMap = dynamic(() => import("@/components/IssueMap").then((m) => m.IssueMap), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

const SEVERITY_STYLES: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-rose-100 text-rose-800",
};

const SEVERITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS_OPTIONS = ["REPORTED", "UNDER_REVIEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REOPENED"];

const selectClass =
  "rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

export default function ExplorePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");

  useEffect(() => {
    api.categories().then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .issues({ category, status, severity })
      .then((res) => setIssues(res.data.issues.data))
      .finally(() => setLoading(false));
  }, [category, status, severity]);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <PageHeader
          title="Explore Issues"
          subtitle={loading ? "Loading..." : `${issues.length} issue${issues.length === 1 ? "" : "s"} matching`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={selectClass}>
                <option value="">All severities</option>
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          }
        />
        <div className="card h-[60vh] w-full overflow-hidden !rounded-2xl">
          {!loading && <IssueMap issues={issues} />}
        </div>
        <h2 className="mt-8 text-lg font-semibold text-slate-900">All Issues</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {issues.map((issue, i) => (
            <li key={issue.public_id} className={`animate-fade-up ${i < 5 ? `d-${i + 1}` : ""}`}>
              <Link
                href={`/issues/${issue.public_id}`}
                className="card flex items-center justify-between gap-3 p-4 text-sm transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="min-w-0 text-slate-800">
                  <span className="font-mono text-xs text-slate-400">{issue.public_id}</span>{" "}
                  <span className="font-medium">{issue.title}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      SEVERITY_STYLES[issue.severity] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="text-xs text-slate-400">{issue.status}</span>
                </span>
              </Link>
            </li>
          ))}
          {!loading && issues.length === 0 && (
            <p className="col-span-full text-center text-slate-500">No issues found.</p>
          )}
        </ul>
      </main>
    </>
  );
}