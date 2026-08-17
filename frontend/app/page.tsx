import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";

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
        <section className="relative mx-auto mt-10 max-w-3xl pb-4 pt-8 text-center sm:mt-16">
          <div className="animate-fade-up animate-float mx-auto flex w-fit items-center gap-3 rounded-full glass px-5 py-2 shadow-soft">
            <Logo size={26} />
            <span className="text-xs font-semibold text-teal-700">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-teal-500" />
              Community-powered civic platform
            </span>
          </div>
          <h1 className="animate-fade-up d-1 mt-7 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            <span className="text-gradient-animated">আপনার এলাকার সমস্যা</span>
            <br />
            <span className="text-slate-900">জানান। আমরা দেখব।</span>
          </h1>
          <p className="animate-fade-up d-2 mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
            Report civic issues with photos and geolocation. AI + geospatial intelligence + community
            validation help authorities prioritize and resolve them.
          </p>
          <div className="animate-fade-up d-3 mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/report" className="btn-primary btn-shine text-base !px-7 !py-3">
              📸 Report an Issue
            </Link>
            <Link href="/explore" className="btn-secondary text-base !px-7 !py-3">
              🗺️ Explore Issues
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`gradient-border animate-fade-up d-${i + 2} rounded-2xl p-5 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}
            >
              <span className="inline-block animate-float" style={{ animationDelay: `${i * 0.7}s` }}>
                {f.icon}
              </span>
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