"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { api, type Report } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: "bg-yellow-100 text-yellow-800",
  REPORTED: "bg-blue-100 text-blue-800",
};

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    api
      .moderationQueue()
      .then((res) => setReports(res.data.reports.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = (report: Report, action: "verify" | "reject") => {
    setBusy(report.id);
    const p = action === "verify" ? api.verifyReport(report.public_id) : api.rejectReport(report.public_id, "Rejected by moderator");
    p.then(() => setReports((prev) => prev.filter((r) => r.id !== report.id)))
      .catch((e) => setError(e.message))
      .finally(() => setBusy(null));
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
        <p className="mt-1 text-sm text-gray-500">Verify or reject pending reports.</p>
        {error && <p className="mt-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {loading && <p className="mt-6 text-gray-500">Loading...</p>}
        <ul className="mt-6 space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-500">{report.public_id}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[report.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{report.description ?? "No description"}</p>
              <p className="mt-1 text-xs text-gray-400">
                {report.category?.name ?? "Unclassified"} · by {report.user?.name ?? "Anonymous"} ·{" "}
                {new Date(report.created_at).toLocaleString()}
              </p>
              {report.analyses?.[0] && report.analyses[0].status === "COMPLETED" && (
                <p className="mt-1 text-xs text-teal-700">
                  AI: {report.analyses[0].predicted_category_slug?.replace(/_/g, " ")} ·{" "}
                  {report.analyses[0].confidence !== null
                    ? `${Math.round(report.analyses[0].confidence * 100)}%`
                    : "n/a"}{" "}
                  confidence · severity{" "}
                  {report.analyses[0].severity_score !== null
                    ? `${Math.round(report.analyses[0].severity_score * 100)}%`
                    : "n/a"}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => act(report, "verify")}
                  disabled={busy === report.id}
                  className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500 disabled:opacity-50"
                >
                  ✓ Verify
                </button>
                <button
                  onClick={() => act(report, "reject")}
                  disabled={busy === report.id}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            </li>
          ))}
          {!loading && reports.length === 0 && <p className="text-gray-500">Queue is clear.</p>}
        </ul>
      </main>
    </>
  );
}