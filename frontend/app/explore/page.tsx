"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { api, type Issue } from "@/lib/api";

const IssueMap = dynamic(() => import("@/components/IssueMap").then((m) => m.IssueMap), {
  ssr: false,
  loading: () => <p className="p-4 text-gray-500">Loading map...</p>,
});

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
      </main>
    </>
  );
}
