"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

// ── Hardcoded kitchen location ─────────────────────────────────
// UPDATE these to your actual kitchen GPS coordinates.
const KITCHEN = { lat: 24.4860, lng: 86.6985, label: "Bhook Lagi Kitchen" };

type Status = "placed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

// How far along the kitchen→customer path each status should fill (0–1).
const STATUS_PROGRESS: Record<Status, number> = {
  placed: 0.0,
  preparing: 0.28,
  out_for_delivery: 0.72,
  delivered: 1.0,
  cancelled: 0.0,
};

type Props = {
  deliveryAddress: string;
  status: Status;
};

type Coords = { lat: number; lng: number };

async function geocode(address: string): Promise<Coords | null> {
  try {
    const q = encodeURIComponent(`${address}, Deoghar, Jharkhand, India`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&countrycodes=in`,
      { headers: { "User-Agent": "BhookLagi/1.0 orders@bhooklagi.in" } },
    );
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

async function getRouteETA(from: Coords, to: Coords): Promise<number | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    const durationSec = data?.routes?.[0]?.duration;
    if (!durationSec) return null;
    return Math.ceil(durationSec / 60 * 1.3 + 10); // road time × 1.3 buffer + 10 min prep
  } catch {
    return null;
  }
}

// Interpolate between two points at fraction t (0→1)
function lerp(a: Coords, b: Coords, t: number): Coords {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export function DeliveryMap({ deliveryAddress, status }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const [customerCoords, setCustomerCoords] = useState<Coords | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [geoError, setGeoError] = useState(false);
  const progress = STATUS_PROGRESS[status] ?? 0;

  // Geocode delivery address once
  useEffect(() => {
    geocode(deliveryAddress).then((coords) => {
      if (coords) {
        setCustomerCoords(coords);
      } else {
        // Fall back to Deoghar city center slightly offset from kitchen
        setCustomerCoords({ lat: KITCHEN.lat + 0.012, lng: KITCHEN.lng - 0.018 });
        setGeoError(true);
      }
    });
  }, [deliveryAddress]);

  // Fetch ETA via OSRM once we have customer coords
  useEffect(() => {
    if (!customerCoords || status === "delivered" || status === "cancelled") return;
    getRouteETA(KITCHEN, customerCoords).then(setEta);
  }, [customerCoords, status]);

  // Build or update the Leaflet map
  useEffect(() => {
    if (!mapRef.current || !customerCoords) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = (require("leaflet") as typeof import("leaflet"));

    // Fix default icon paths for Next.js bundling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Create map on first render
    if (!mapInstanceRef.current) {
      const midLat = (KITCHEN.lat + customerCoords.lat) / 2;
      const midLng = (KITCHEN.lng + customerCoords.lng) / 2;
      const m = L.map(mapRef.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OSM</a>',
        maxZoom: 18,
      }).addTo(m);
      m.setView([midLat, midLng], 14);
      mapInstanceRef.current = m;

      // Attribution small text
      L.control.attribution({ prefix: false, position: "bottomright" })
        .addAttribution('Map © <a href="https://openstreetmap.org">OSM</a>')
        .addTo(m);
    }

    const m = mapInstanceRef.current;

    // Clear existing layers (markers + lines)
    m.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) m.removeLayer(layer);
    });

    // Kitchen marker (orange flame icon)
    const kitchenIcon = L.divIcon({
      html: `<div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:#E85D04;border:3px solid white;
        box-shadow:0 4px 12px rgba(232,93,4,0.5);
        display:flex;align-items:center;justify-content:center;
        transform:rotate(-45deg);
      "><span style="transform:rotate(45deg);font-size:16px">🍔</span></div>`,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    // Customer marker (pulse animation)
    const customerIcon = L.divIcon({
      html: `<div style="position:relative;width:36px;height:36px">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(59,130,246,0.25);
          animation:pulse 2s ease-in-out infinite;
        "></div>
        <div style="
          position:absolute;top:6px;left:6px;width:24px;height:24px;
          border-radius:50%;background:#3B82F6;border:3px solid white;
          box-shadow:0 4px 10px rgba(59,130,246,0.5);
          display:flex;align-items:center;justify-content:center;
          font-size:12px;
        ">📍</div>
      </div>
      <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.6);opacity:0}}</style>`,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    // Rider icon (for out_for_delivery)
    const riderIcon = L.divIcon({
      html: `<div style="
        width:32px;height:32px;border-radius:50%;
        background:#FAA307;border:3px solid white;
        box-shadow:0 4px 12px rgba(250,163,7,0.6);
        display:flex;align-items:center;justify-content:center;
        font-size:16px;animation:bounce 1s ease-in-out infinite;
      ">🛵</div>
      <style>@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}</style>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([KITCHEN.lat, KITCHEN.lng], { icon: kitchenIcon })
      .addTo(m)
      .bindPopup("<b>Bhook Lagi Kitchen</b><br>Your food is being made here");

    L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon })
      .addTo(m)
      .bindPopup("<b>Your location</b>" + (geoError ? "<br><small>Approximate</small>" : ""));

    // Full path (gray dashed)
    const fullPath: [number, number][] = [[KITCHEN.lat, KITCHEN.lng], [customerCoords.lat, customerCoords.lng]];
    L.polyline(fullPath, {
      color: "#D1D5DB",
      weight: 4,
      dashArray: "8 6",
      opacity: 0.6,
    }).addTo(m);

    // Progress fill (orange solid line)
    if (progress > 0 && progress < 1) {
      const mid = lerp(KITCHEN, customerCoords, progress);
      const filledPath: [number, number][] = [[KITCHEN.lat, KITCHEN.lng], [mid.lat, mid.lng]];
      L.polyline(filledPath, {
        color: "#E85D04",
        weight: 5,
        opacity: 1,
        lineCap: "round",
      }).addTo(m);

      // Rider dot at the progress tip
      L.marker([mid.lat, mid.lng], { icon: riderIcon }).addTo(m);
    } else if (progress >= 1) {
      L.polyline(fullPath, { color: "#22C55E", weight: 5, opacity: 1, lineCap: "round" }).addTo(m);
    }

    // Fit map to show both pins
    m.fitBounds([[KITCHEN.lat, KITCHEN.lng], [customerCoords.lat, customerCoords.lng]], {
      padding: [48, 48],
    });
  }, [customerCoords, progress, geoError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      {/* ETA banner */}
      {status !== "delivered" && status !== "cancelled" && (
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-orange to-brand-gold px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-white" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-white">
              {status === "out_for_delivery" ? "Rider on the way!" : "Order being prepared"}
            </span>
          </div>
          {eta !== null && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-extrabold text-white">
              ~{eta} min
            </span>
          )}
        </div>
      )}

      {/* Map container */}
      <div className="relative">
        {/* Leaflet CSS */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

        {!customerCoords && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6 animate-bounce text-brand-orange" />
              <p className="text-[12px] text-gray-500">Finding your location…</p>
            </div>
          </div>
        )}

        <div ref={mapRef} style={{ height: "240px", width: "100%", background: "#f0f0f0" }} />

        {geoError && (
          <div className="absolute bottom-2 left-2 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 shadow ring-1 ring-amber-200">
            ⚠️ Approx. location shown
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">🍔</span>
          <span className="text-[11px] font-semibold text-gray-600">Kitchen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-px w-8 bg-gray-300 [stroke-dasharray:4_3]" />
          <div className="h-px w-4 bg-brand-orange" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-600">You</span>
          <span className="text-[14px]">📍</span>
        </div>
      </div>
    </div>
  );
}
