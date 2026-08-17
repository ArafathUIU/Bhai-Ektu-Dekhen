"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui";
import { api, type Assignment } from "@/lib/api";

const ASSIGNMENT_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .adminAssignments()
      .then((res) => setAssignments(res.data.assignments.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const update = (id: number, status: string) => {
    api.updateAssignmentStatus(id, status).then((res) => {
      setAssignments((prev) => prev.map((a) => (a.id === id ? res.data.assignment : a)));
    });
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <PageHeader title="Assignments" subtitle="Track which team handles which issue." />
        {error && <p className="mt-4 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
        {loading && <p className="mt-6 text-slate-500">Loading...</p>}
        <ul className="mt-6 space-y-3">
          {assignments.map((a) => (
            <li key={a.id} className="card p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/issues/${a.issue.public_id}`}
                    className="font-mono text-sm font-semibold text-teal-600 hover:underline"
                  >
                    {a.issue.public_id}
                  </Link>
                  <span className="ml-2 text-sm text-slate-700">{a.issue.title}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    STATUS_STYLES[a.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Team: <span className="font-medium text-slate-700">{a.team?.name ?? "Unassigned"}</span> · Priority:{" "}
                <span className="font-medium text-slate-700">{a.priority}</span> · Assigned to {a.assigned_by?.name} on{" "}
                {new Date(a.assigned_at).toLocaleDateString()}
                {a.deadline && <> · Due {new Date(a.deadline).toLocaleDateString()}</>}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ASSIGNMENT_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => update(a.id, s)}
                    disabled={a.status === s}
                    className={
                      a.status === s
                        ? "rounded-lg bg-brand-gradient px-3 py-1 text-xs font-semibold text-white"
                        : "rounded-lg border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-teal-400 hover:text-teal-700"
                    }
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </li>
          ))}
          {!loading && assignments.length === 0 && <p className="text-slate-500">No assignments yet.</p>}
        </ul>
      </main>
    </>
  );
}