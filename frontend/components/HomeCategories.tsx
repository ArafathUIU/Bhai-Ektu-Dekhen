"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Category } from "@/lib/api";

const ICONS: Record<string, string> = {
  roads_infrastructure: "🛣️",
  garbage_waste: "🗑️",
  water_drainage: "🌊",
  electricity_lighting: "💡",
  traffic_transport: "🚦",
  public_safety: "🚨",
  health_sanitation: "🏥",
  education: "📚",
  parks_recreation: "🌳",
};

export function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.categories().then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-5xl">
      <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        What can you <span className="text-gradient-animated">report?</span>
      </h2>
      <p className="mt-2 text-center text-sm text-slate-500">
        Everything from potholes to broken streetlights — AI routes each report to the right team.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href="/explore"
            className="gradient-border animate-fade-up rounded-2xl p-4 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="animate-float inline-block text-2xl" style={{ animationDelay: `${i * 0.3}s` }}>
              {ICONS[c.slug] ?? "📍"}
            </span>
            <p className="mt-2 text-sm font-semibold text-slate-800">{c.name}</p>
            <p className="text-[11px] text-slate-400">{c.slug.replace(/_/g, " ")}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}