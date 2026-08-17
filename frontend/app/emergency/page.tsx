"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/ui";
import { api, type EmergencyNumbers, type EmergencyResult, type EmergencyStation } from "@/lib/api";

const EmergencyMap = dynamic(() => import("@/components/EmergencyMap").then((m) => m.EmergencyMap), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];

function directionsUrl(s: EmergencyStation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`;
}

function telHref(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

function StationList({ title, icon, stations, accent }: { title: string; icon: string; stations: EmergencyStation[]; accent: string }) {
  if (stations.length === 0) return null;
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
        <span>{icon}</span>
        {title}
        <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${accent}`}>
          {stations.length}
        </span>
      </h2>
      <ul className="mt-3 space-y-3">
        {stations.map((s) => {
          const href = telHref(s.phone);
          return (
            <li key={`${s.name}-${s.latitude}-${s.longitude}`} className="card card-accent animate-fade-up p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  {s.address && <p className="mt-0.5 text-xs text-slate-500">{s.address}</p>}
                  <p className="mt-1.5 text-xs font-medium text-slate-400">📍 {s.distance_km} km away</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {href ? (
                    <a
                      href={href}
                      className="btn-primary !px-3 !py-1.5 text-xs"
                    >
                      📞 Call
                    </a>
                  ) : (
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-400">
                      No number
                    </span>
                  )}
                  <a
                    href={directionsUrl(s)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    🧭 Directions
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function EmergencyPage() {
  const [center, setCenter] = useState<[number, number]>(DHAKA_CENTER);
  const [data, setData] = useState<EmergencyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

  const load = useCallback((lat: number, lng: number) => {
    setCenter([lat, lng]);
    setLoading(true);
    setError("");
    api
      .emergencyNearby(lat, lng)
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(DHAKA_CENTER[0], DHAKA_CENTER[1]);
  }, [load]);

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        load(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("Could not detect your location. Showing Dhaka services.");
        setLocating(false);
      },
    );
  };

  const numbers: EmergencyNumbers[] = data?.emergency_numbers ?? [
    { service: "National Emergency Helpline", number: "999" },
    { service: "Fire Service & Civil Defence", number: "102" },
    { service: "International Emergency (mobile)", number: "112" },
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <PageHeader
          title="Emergency Services"
          subtitle="Nearest police & fire stations sourced live from OpenStreetMap"
          action={
            <button onClick={useMyLocation} disabled={locating} className="btn-secondary text-sm !px-4 !py-2">
              {locating ? "Locating..." : "📍 Use my location"}
            </button>
          }
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {numbers.map((n) => (
            <a
              key={n.number}
              href={`tel:${n.number}`}
              className="animate-fade-up inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-rose-500/30 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="text-base">🆘</span>
              {n.service} · {n.number}
            </a>
          ))}
        </div>

        {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{error}</p>}

        <div className="card h-[50vh] w-full overflow-hidden">
          {!loading && <EmergencyMap center={center} policeStations={data?.police_stations ?? []} fireStations={data?.fire_stations ?? []} />}
        </div>

        {data?.source === "fallback" && (
          <p className="mt-3 text-xs text-slate-400">
            Live data unavailable right now — showing national emergency numbers instead.
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <StationList
            title="Police Stations"
            icon="👮"
            accent="bg-gradient-to-r from-blue-500 to-indigo-600"
            stations={data?.police_stations ?? []}
          />
          <StationList
            title="Fire Stations"
            icon="🚒"
            accent="bg-gradient-to-r from-red-500 to-rose-600"
            stations={data?.fire_stations ?? []}
          />
        </div>
        {loading && <p className="mt-6 text-slate-500">Finding nearby services...</p>}
        {!loading && !error && data && data.police_stations.length === 0 && data.fire_stations.length === 0 && (
          <p className="mt-6 text-slate-500">No stations found nearby.</p>
        )}
      </main>
    </>
  );
}