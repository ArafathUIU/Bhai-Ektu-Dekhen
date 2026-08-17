"use client";

import { useEffect, useState } from "react";

type Summary = {
  total_issues: number;
  open_issues: number;
  resolved_issues: number;
  categories: number;
  citizens: number;
};

const STATS: { key: keyof Summary; label: string; icon: string; accent: string }[] = [
  { key: "total_issues", label: "Issues reported", icon: "📣", accent: "from-teal-500 to-cyan-600" },
  { key: "open_issues", label: "Open & in progress", icon: "🚧", accent: "from-amber-500 to-orange-600" },
  { key: "resolved_issues", label: "Resolved", icon: "✅", accent: "from-emerald-500 to-teal-600" },
  { key: "citizens", label: "Citizens involved", icon: "👥", accent: "from-sky-500 to-indigo-600" },
];

export function HomeStats() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/v1/summary")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
  }, []);

  return (
    <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS.map((s, i) => (
        <div key={s.key} className="card-dark animate-fade-up rounded-2xl p-5 text-center">
          <span className="animate-float inline-block text-2xl" style={{ animationDelay: `${i * 0.4}s` }}>
            {s.icon}
          </span>
          <p
            className={`mt-2 bg-gradient-to-r ${s.accent} bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl`}
          >
            {summary ? summary[s.key] : "—"}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-teal-50/70">{s.label}</p>
        </div>
      ))}
    </div>
  );
}