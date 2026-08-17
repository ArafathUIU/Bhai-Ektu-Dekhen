"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui";
import { api, type AiAnalysis, type Report } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: "bg-yellow-100 text-yellow-800",
  REPORTED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-green-100 text-green-800",
};

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .reports()
      .then((res) => setReports(res.data.reports.data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="My Reports"
          subtitle="Track your submissions and their AI analysis"
          action={
            <Link href="/report" className="btn-primary text-sm !px-4 !py-2">
              + New Report
            </Link>
          }
        />
        {loading && <p className="mt-6 text-slate-500">Loading...</p>}
        <ul className="mt-6 space-y-3">
          {reports.map((report, i) => (
            <li key={report.public_id} className={`animate-fade-up ${i < 5 ? `d-${i + 1}` : ""}`}>
              <div className="card card-accent p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
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
                {report.category?.name ?? "Unclassified"} ·{" "}
                {new Date(report.created_at).toLocaleString()}
              </p>
              {report.issue && (
                <Link
                  href={`/issues/${report.issue.public_id}`}
                  className="mt-2 inline-block text-xs font-semibold text-teal-600 hover:underline"
                >
                  View linked issue →
                </Link>
              )}
              {report.analyses && report.analyses.length > 0 && (
                <AnalysisCard analysis={report.analyses[0]} />
              )}
              </div>
            </li>
          ))}
          {!loading && reports.length === 0 && (
            <p className="text-slate-500">No reports yet.</p>
          )}
        </ul>
      </main>
    </>
  );
}

function AnalysisCard({ analysis }: { analysis: AiAnalysis }) {
  const confidence = analysis.confidence !== null ? Math.round(analysis.confidence * 100) : null;

  return (
    <div className="mt-3 rounded-xl bg-teal-50 p-3 text-xs text-teal-900">
      <p className="font-semibold">✨ AI Analysis</p>
      {analysis.status === "COMPLETED" && (
        <p className="mt-1">
          Category: <span className="font-medium">{analysis.predicted_category_slug?.replace(/_/g, " ")}</span>
          {confidence !== null && <span> · {confidence}% confident</span>}
          {analysis.severity_score !== null && (
            <span> · severity {Math.round(analysis.severity_score * 100)}%</span>
          )}
        </p>
      )}
      {analysis.status === "FAILED" && <p className="mt-1 text-red-700">Analysis failed.</p>}
      {analysis.status === "PENDING" && <p className="mt-1">Queued for analysis...</p>}
    </div>
  );
}
