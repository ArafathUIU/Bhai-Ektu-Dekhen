"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";

const LocationPicker = dynamic(() => import("@/components/LocationPicker").then((m) => m.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-56 w-full animate-pulse rounded-lg bg-gray-100" />,
});

export default function ReportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  function detectLocation() {
    if ("geolocation" in navigator) {
      setError("");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(7));
          setLng(pos.coords.longitude.toFixed(7));
        },
        () => setError("Could not detect location. Tap the map or enter coordinates manually."),
      );
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!photo) throw new Error("Please attach a photo.");
      const form = new FormData();
      form.append("photo", photo);
      form.append("latitude", lat);
      form.append("longitude", lng);
      if (description) form.append("description", description);
      const res = await api.createReport(form);
      router.push(`/my-reports?new=${res.data.report.public_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          <div>
            <p className="text-sm font-medium text-gray-700">Photo</p>
            {preview && (
              <img src={preview} alt="Preview" className="mt-2 h-48 w-full rounded-lg object-cover" />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="mt-2 w-full text-sm text-gray-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Location</p>
              <button
                type="button"
                onClick={detectLocation}
                className="text-xs font-medium text-teal-600 hover:underline"
              >
                Use my location
              </button>
            </div>
            <div className="mt-2">
              <LocationPicker
                lat={lat ? Number(lat) : null}
                lng={lng ? Number(lng) : null}
                onChange={(newLat, newLng) => {
                  setLat(newLat.toFixed(7));
                  setLng(newLng.toFixed(7));
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Latitude
              <input
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="23.8103"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Longitude
              <input
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="90.4125"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-gray-900 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </main>
    </>
  );
}
