"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { EmergencyStation } from "@/lib/api";
import "leaflet/dist/leaflet.css";

const baseIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const policeIcon = new L.DivIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,#2563eb,#3b82f6);border:2px solid #fff;box-shadow:0 4px 12px rgba(37,99,235,.5)"><span style="transform:rotate(45deg);font-size:13px">👮</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const fireIcon = new L.DivIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,#dc2626,#ef4444);border:2px solid #fff;box-shadow:0 4px 12px rgba(220,38,38,.5)"><span style="transform:rotate(45deg);font-size:13px">🚒</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export function EmergencyMap({
  center,
  policeStations,
  fireStations,
}: {
  center: [number, number];
  policeStations: EmergencyStation[];
  fireStations: EmergencyStation[];
}) {
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={baseIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {policeStations.map((s) => (
        <Marker key={s.name} position={[s.latitude, s.longitude]} icon={policeIcon}>
          <Popup>
            <strong>👮 {s.name}</strong>
            {s.address && (
              <>
                <br />
                {s.address}
              </>
            )}
            <br />
            <span className="text-xs">{s.distance_km} km away</span>
          </Popup>
        </Marker>
      ))}
      {fireStations.map((s) => (
        <Marker key={s.name} position={[s.latitude, s.longitude]} icon={fireIcon}>
          <Popup>
            <strong>🚒 {s.name}</strong>
            {s.address && (
              <>
                <br />
                {s.address}
              </>
            )}
            <br />
            <span className="text-xs">{s.distance_km} km away</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}