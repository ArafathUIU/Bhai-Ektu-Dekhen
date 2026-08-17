"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui";
import { api, type NotificationItem } from "@/lib/api";

const TYPE_STYLES: Record<string, string> = {
  REPORT_VERIFIED: "bg-teal-50 text-teal-700",
  REPORT_REJECTED: "bg-red-50 text-red-700",
  ISSUE_ASSIGNED: "bg-blue-50 text-blue-700",
  ISSUE_RESOLVED: "bg-green-50 text-green-700",
  ISSUE_REOPENED: "bg-amber-50 text-amber-700",
  POSSIBLE_DUPLICATE: "bg-purple-50 text-purple-700",
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api
      .notifications()
      .then((res) => setItems(res.data.notifications.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const markAll = () => {
    api.markAllNotificationsRead().then(() =>
      setItems((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))),
    );
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Notifications"
          subtitle="Updates on your reports, issues and assignments"
          action={
            items.some((n) => !n.read_at) ? (
              <button onClick={markAll} className="text-sm font-semibold text-teal-600 hover:underline">
                Mark all read
              </button>
            ) : undefined
          }
        />
        {loading && <p className="mt-6 text-slate-500">Loading...</p>}
        <ul className="mt-6 space-y-3">
          {items.map((n, i) => {
            const issueId = n.data?.issue_public_id as string | undefined;
            return (
              <li
                key={n.id}
                className={`animate-fade-up ${i < 5 ? `d-${i + 1}` : ""}`}
              >
                <div className={`card p-4 transition-all hover:shadow-soft ${n.read_at ? "opacity-70" : ""}`}>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      TYPE_STYLES[n.type] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {n.type.replace(/_/g, " ")}
                  </span>
                  {!n.read_at && <span className="h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-rose-500 to-red-500" />}
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{n.title}</p>
                {n.message && <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>}
                <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
                {issueId && (
                  <Link
                    href={`/issues/${issueId}`}
                    className="mt-2 inline-block text-xs font-semibold text-teal-600 hover:underline"
                  >
                    View issue →
                  </Link>
                )}
                </div>
              </li>
            );
          })}
          {!loading && items.length === 0 && <p className="text-slate-500">No notifications yet.</p>}
        </ul>
      </main>
    </>
  );
}