"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { api, type Category, type Issue } from "@/lib/api";

const IssueMap = dynamic(() => import("@/components/IssueMap").then((m) => m.IssueMap), {
  ssr: false,
  loading: () => <p className="p-4 text-gray-500">Loading map...</p>,
});

const SEVERITY_STYLES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const SEVERITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS_OPTIONS = ["REPORTED", "UNDER_REVIEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REOPENED"];

const selectClass =
  "rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-teal-500 focus:outline-none";

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
      <main className="flex flex-1 flex-col px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Explore Issues</h1>
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
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {loading ? "Loading..." : `${issues.length} issue${issues.length === 1 ? "" : "s"}`}
        </p>
        <div className="mt-4 h-[60vh] w-full overflow-hidden rounded-lg border border-gray-200">
          {!loading && <IssueMap issues={issues} />}
        </div>
        <h2 className="mt-6 text-lg font-semibold text-gray-900">All Issues</h2>
        <ul className="mt-3 space-y-2">
          {issues.map((issue) => (
            <li key={issue.public_id}>
              <Link
                href={`/issues/${issue.public_id}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm hover:border-teal-400"
              >
                <span className="text-gray-800">
                  <span className="font-mono text-gray-400">{issue.public_id}</span>{" "}
                  {issue.title}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      SEVERITY_STYLES[issue.severity] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="text-xs text-gray-400">{issue.status}</span>
                </span>
              </Link>
            </li>
          ))}
          {!loading && issues.length === 0 && <p className="text-gray-500">No issues found.</p>}
        </ul>
      </main>
    </>
  );
}
