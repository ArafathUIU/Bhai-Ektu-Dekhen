"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { api, type Issue } from "@/lib/api";

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

export default function ExplorePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .issues()
      .then((res) => setIssues(res.data.issues.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Explore Issues</h1>
        <p className="mt-1 text-sm text-gray-500">{issues.length} open issues</p>
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
