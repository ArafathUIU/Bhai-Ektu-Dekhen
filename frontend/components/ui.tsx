export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function GradientStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "teal" | "blue" | "emerald" | "amber" | "red" | "violet";
}) {
  const accents: Record<string, string> = {
    teal: "from-teal-500 to-cyan-600",
    blue: "from-sky-500 to-indigo-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    red: "from-rose-500 to-red-600",
    violet: "from-violet-500 to-purple-600",
  };
  return (
    <div className="card animate-fade-up overflow-hidden p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p
        className={`mt-1 bg-gradient-to-r ${accents[accent ?? "teal"]} bg-clip-text text-3xl font-extrabold text-transparent`}
      >
        {value}
      </p>
    </div>
  );
}

export function GradientBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
      {children}
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="card animate-fade-up p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  return (
    <div className="card p-4">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {Object.entries(data).map(([k, v]) => (
          <li key={k}>
            <div className="flex justify-between">
              <span className="text-slate-500">{k}</span>
              <span className="font-semibold text-slate-900">{v}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500"
                style={{ width: `${total ? (v / total) * 100 : 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}