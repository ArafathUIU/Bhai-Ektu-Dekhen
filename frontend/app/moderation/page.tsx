"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui";
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
        <PageHeader
          title="Moderation Queue"
          subtitle="Verify or reject pending reports. AI hints shown when available."
        />
        {error && <p className="mt-4 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
        {loading && <p className="mt-6 text-slate-500">Loading...</p>}
        <ul className="mt-6 space-y-3">
          {reports.map((report, i) => (
            <li key={report.id} className={`animate-fade-up ${i < 5 ? `d-${i + 1}` : ""}`}>
              <div className="card p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-slate-400">{report.public_id}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    STATUS_STYLES[report.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{report.description ?? "No description"}</p>
              <p className="mt-1 text-xs text-slate-400">
                {report.category?.name ?? "Unclassified"} · by {report.user?.name ?? "Anonymous"} ·{" "}
                {new Date(report.created_at).toLocaleString()}
              </p>
              {report.analyses?.[0] && report.analyses[0].status === "COMPLETED" && (
                <p className="mt-1 text-xs text-teal-700">
                  ✨ AI: {report.analyses[0].predicted_category_slug?.replace(/_/g, " ")} ·{" "}
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
                  className="btn-primary !px-3 !py-1.5 text-xs"
                >
                  ✓ Verify
                </button>
                <button
                  onClick={() => act(report, "reject")}
                  disabled={busy === report.id}
                  className="btn-danger !px-3 !py-1.5 text-xs"
                >
                  ✕ Reject
                </button>
              </div>
              </div>
            </li>
          ))}
          {!loading && reports.length === 0 && <p className="text-slate-500">Queue is clear. 🎉</p>}
        </ul>
      </main>
    </>
  );
}