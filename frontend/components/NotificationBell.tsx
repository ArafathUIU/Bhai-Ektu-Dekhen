"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, type NotificationItem } from "@/lib/api";

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => {
      api
        .notifications()
        .then((res) => {
          setItems(res.data.notifications.data);
          setUnread(res.data.unread_count);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAll = () => {
    api.markAllNotificationsRead().then(() => {
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    });
  };

  const markOne = (id: number) => {
    api.markNotificationRead(id).then(() => {
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
      );
    });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-1.5 text-gray-600 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="glass absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-semibold text-teal-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-slate-400">No notifications</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => markOne(n.id)}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-teal-50/50 ${
                  n.read_at ? "opacity-60" : ""
                }`}
              >
                <p className="font-medium text-slate-800">{n.title}</p>
                {n.message && <p className="text-xs text-slate-500">{n.message}</p>}
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  {n.type.replace(/_/g, " ")} · {new Date(n.created_at).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        <div className="border-t border-slate-200/70 px-3 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-semibold text-teal-600 hover:underline"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}