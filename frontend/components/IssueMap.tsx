"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Issue } from "@/lib/api";
import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export function IssueMap({ issues }: { issues: Issue[] }) {
  const center: [number, number] = [23.8103, 90.4125];

  return (
    <MapContainer center={center} zoom={7} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues
        .filter((i) => i.latitude && i.longitude)
        .map((issue) => (
          <Marker
            key={issue.public_id}
            position={[Number(issue.latitude), Number(issue.longitude)]}
            icon={icon}
          >
            <Popup>
              <strong>{issue.public_id}</strong>
              <br />
              {issue.title}
              <br />
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                  SEVERITY_COLORS[issue.severity] ?? ""
                }`}
              >
                {issue.severity}
              </span>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
