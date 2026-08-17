"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { api, type IssueDetail, type Comment } from "@/lib/api";

const SEVERITY_STYLES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const STATUS_STYLES: Record<string, string> = {
  REPORTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-purple-100 text-purple-800",
  VERIFIED: "bg-teal-100 text-teal-800",
  ASSIGNED: "bg-indigo-100 text-indigo-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-200 text-gray-700",
  REOPENED: "bg-orange-100 text-orange-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function IssueDetailPage({ params }: { params: { publicId: string } }) {
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState("");
  const [supporting, setSupporting] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    api
      .issue(params.publicId)
      .then((res) => setIssue(res.data.issue))
      .catch((e) => setError(e.message));
    api
      .issueComments(params.publicId)
      .then((res) => setComments(res.data.comments))
      .catch((e) => setError(e.message));
  }, [params.publicId]);

  const support = () => {
    if (supporting) return;
    setSupporting(true);
    api
      .supportIssue(params.publicId)
      .then(() => setIssue((prev) => (prev ? { ...prev, supports_count: (prev.supports?.length ?? 0) + 1 } : prev)))
      .finally(() => setSupporting(false));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  const submitComment = () => {
    if (!newComment.trim() || !issue) return;
    api
      .issueComments(params.publicId)
      .then(() => {
        api.issueComments(params.publicId).then((res) => setComments(res.data.comments));
        setNewComment("");
      })
      .catch((e) => setError(e.message));
  };

  if (error) {
    return (
      <>
        <Navbar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {!issue && <p className="text-slate-500">Loading...</p>}
        {issue && (
          <>
            <div className="animate-fade-up flex items-center justify-between">
              <Link href="/explore" className="text-sm font-semibold text-teal-600 hover:underline">
                ← Back to map
              </Link>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  STATUS_STYLES[issue.status] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {issue.status}
              </span>
            </div>

            <h1 className="animate-fade-up d-1 mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {issue.title}
            </h1>
            <div className="animate-fade-up d-2 mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="font-mono">{issue.public_id}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  SEVERITY_STYLES[issue.severity] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {issue.severity}
              </span>
              <span className="rounded-full bg-gradient-to-r from-teal-50 to-sky-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                {issue.category?.name ?? "Unclassified"}
              </span>
              <span>· {issue.supports?.length ?? 0} supports</span>
            </div>

            {issue.description && (
              <p className="mt-4 text-slate-700">{issue.description}</p>
            )}

            <div className="mt-3 text-sm text-slate-500">
              {issue.aiAnalyses.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">AI confidence:</span>
                  <span className={issue.aiAnalyses[0].confidence !== null ? `text-teal-600 font-medium` : `text-slate-400`}>
                    {issue.aiAnalyses[0].confidence !== null ? `${Math.round(issue.aiAnalyses[0].confidence * 100)}%` : `Not analyzed`}
                  </span>
                </div>
              )}
              {issue.aiAnalyses.length > 0 && (
                <div className="mt-1">
                  <span className="font-medium">AI severity:</span>
                  <span className={issue.aiAnalyses[0].severity_score !== null ? `text-orange-600 font-medium` : `text-slate-400`}>
                    {issue.aiAnalyses[0].severity_score !== null ? `Score: ${issue.aiAnalyses[0].severity_score}` : `Not analyzed`}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={support}
              disabled={supporting}
              className="btn-primary mt-3"
            >
              {supporting ? "Supporting..." : "👍 I confirm this issue"}
            </button>

            <h2 className="mt-8 text-lg font-semibold text-slate-900">Status History</h2>
            <ol className="mt-3 space-y-3 border-l-2 border-teal-200 pl-4">
              {issue.statusHistory.map((h) => (
                <li key={h.id} className="relative text-sm">
                  <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-teal-500 bg-white" />
                  <p className="text-slate-800">
                    <span className="font-medium">{h.to_status.replace(/_/g, " ")}</span>
                    {h.from_status && <span className="text-slate-400"> (from {h.from_status.replace(/_/g, " ")})</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    {h.changed_by ? h.changed_by.name : "System"} · {new Date(h.created_at).toLocaleString()}
                    {h.reason && <span className="text-slate-500"> — {h.reason}</span>}
                  </p>
                </li>
              ))}
            </ol>

            <h2 className="mt-8 text-lg font-semibold text-slate-900">Comments ({comments.length})</h2>
            <ul className="mt-3 space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="p-3 rounded-lg bg-slate-50 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-brand-gradient p-1">
                      <span className="text-[10px] font-bold text-white">{c.user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{c.user.name}</p>
                      <p className="text-slate-500 mt-0.5">{c.body}</p>
                    </div>
                  </div>
                </li>
              ))}
              {comments.length === 0 && <p className="text-slate-500">No comments yet.</p>}
            </ul>

            {issue.reports?.length > 0 && (
              <h2 className="mt-8 text-lg font-semibold text-slate-900">Reports ({issue.reports?.length ?? 0})</h2>
              <ul className="mt-3 space-y-3">
                {issue.reports?.map((report) => (
                  <li key={report.id} className="card p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-400">{report.public_id}</span>
                      <span className="text-slate-400">{report.user?.name ?? "Anonymous"}</span>
                    </div>
                    {report.description && <p className="mt-1 text-slate-700">{report.description}</p>}
                    {report.media?.length > 0 && (
                      <img
                        src={`/storage/${report.media[0].url}`}
                        alt="Report photo"
                        className="mt-2 h-24 rounded-xl object-cover"
                      />
                    )}
                  </li>
                ))}
                {issue.reports?.length === 0 && <p className="text-slate-500">No reports linked.</p>}
              </ul>
            )}

            {/* Comment form */}
            <div className="mt-8 p-4 rounded-lg bg-white border border-slate-200/50">
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                rows={3}
                className="w-full rounded-lg border p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-3"
                disabled={!issue}
              />
              <div className="flex gap-2">
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || !issue || supporting}
                  className="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
                >
                  {supporting ? "Posting..." : "Post"}
                </button>
                <button
                  onClick={() => setNewComment("")}
                  className="text-sm text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}