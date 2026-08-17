import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const FEATURES = [
  {
    icon: "📸",
    title: "Report with evidence",
    body: "Attach a photo and pin the exact spot on the map. Your report is analyzed by AI for category, severity and duplicates.",
  },
  {
    icon: "🗺️",
    title: "Explore & track",
    body: "Browse open issues on an interactive map. Support issues that matter to you and watch them move through the pipeline.",
  },
  {
    icon: "🏛️",
    title: "Authorities take action",
    body: "Teams get ranked priorities, hotspots and analytics so resources go where they are needed most.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16">
        <section className="relative mx-auto mt-10 max-w-3xl pb-4 pt-10 text-center sm:mt-16">
          <span className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-teal-700 shadow-soft">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
            Community-powered civic platform
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            <span className="text-gradient">আপনার এলাকার সমস্যা</span>
            <br />
            <span className="text-slate-900">জানান। আমরা দেখব।</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
            Report civic issues with photos and geolocation. AI + geospatial intelligence + community
            validation help authorities prioritize and resolve them.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/report" className="btn-primary text-base !px-7 !py-3">
              📸 Report an Issue
            </Link>
            <Link href="/explore" className="btn-secondary text-base !px-7 !py-3">
              🗺️ Explore Issues
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="gradient-border rounded-2xl p-5 shadow-soft">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.body}</p>
            </div>
          ))}
        </section>

        <footer className="mx-auto mt-16 max-w-5xl border-t border-slate-200/70 pt-6 text-center text-xs text-slate-400">
          Bhai Ektu Dekhen · OpenStreetMap tiles &copy; OpenStreetMap contributors
        </footer>
      </main>
    </>
  );
}