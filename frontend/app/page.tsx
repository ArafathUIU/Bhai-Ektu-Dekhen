import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { HomeStats } from "@/components/HomeStats";
import { HomeCategories } from "@/components/HomeCategories";

const STEPS = [
  {
    step: "01",
    icon: "📸",
    title: "Snap & pin",
    body: "Take a photo, describe the problem and drop a pin on the exact location. GPS auto-fills your position.",
  },
  {
    step: "02",
    icon: "🤖",
    title: "AI + community check",
    body: "Our AI classifies the category, scores severity and flags duplicates. Neighbours verify and support the issue.",
  },
  {
    step: "03",
    icon: "🏛️",
    title: "Authorities act",
    body: "Teams get ranked priorities and hotspots. You get notified when your issue is assigned and resolved.",
  },
];

const FOOTER_LINKS = [
  { label: "Explore Map", href: "/explore" },
  { label: "Report an Issue", href: "/report" },
  { label: "My Reports", href: "/my-reports" },
  { label: "Analytics", href: "/analytics" },
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

        <HomeStats />

        <section className="mx-auto mt-16 max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How it <span className="text-gradient-animated">works</span>
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className={`card-dark animate-fade-up d-${i + 1} p-6`}
              >
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-white/10">
                  {s.step}
                </span>
                <span className="animate-float inline-block text-3xl" style={{ animationDelay: `${i * 0.6}s` }}>
                  {s.icon}
                </span>
                <h3 className="mt-3 text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-teal-50/75">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <HomeCategories />

        <section className="animate-fade-up d-2 mx-auto mt-16 max-w-5xl">
          <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-8 text-center text-white shadow-xl shadow-teal-500/30 sm:p-12">
            <div className="blob blob-1 !opacity-30" />
            <div className="blob blob-2 !opacity-30" />
            <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl">
              See a problem? Let us know.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm text-teal-50 sm:text-base">
              Every report is a step toward a cleaner, safer neighbourhood. Your voice + our AI =
              issues actually get fixed.
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/report"
                className="rounded-xl bg-white px-7 py-3 text-base font-bold text-teal-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                📸 Start Reporting
              </Link>
              <Link
                href="/register"
                className="glass-dark rounded-xl px-7 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </section>

        <footer className="mx-auto mt-16 max-w-5xl border-t border-slate-200/70 pt-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
            <div className="max-w-xs">
              <div className="flex items-center gap-2">
                <Logo size={28} />
                <span className="font-bold tracking-tight text-slate-900">
                  <span className="text-gradient">Bhai Ektu</span> Dekhen
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Community-powered civic issue reporting, tracking and resolution for Bangladesh.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Platform</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {FOOTER_LINKS.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-slate-500 transition-colors hover:text-teal-600">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">For authorities</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link href="/login" className="text-slate-500 transition-colors hover:text-teal-600">
                      Team sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/analytics" className="text-slate-500 transition-colors hover:text-teal-600">
                      Intelligence & hotspots
                    </Link>
                  </li>
                  <li>
                    <Link href="/moderation" className="text-slate-500 transition-colors hover:text-teal-600">
                      Moderation
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-slate-200/70 pt-4 text-center text-xs text-slate-400">
            Bhai Ektu Dekhen · Map tiles &copy; OpenStreetMap contributors
          </p>
        </footer>
      </main>
    </>
  );
}